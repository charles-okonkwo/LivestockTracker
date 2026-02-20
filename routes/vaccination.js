const express = require('express');
const { body, validationResult } = require('express-validator');
const Record = require('../models/Record');
const Animal = require('../models/Animal');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Create vaccination record (System/Farmer)
router.post('/record', authorize('farmer'), [
  body('animalId').notEmpty().withMessage('Animal ID is required'),
  body('vaccinationType').trim().notEmpty().withMessage('Vaccination type is required'),
  body('vaccinationDate').isISO8601().withMessage('Invalid date format'),
  body('nextDueDate').isISO8601().withMessage('Invalid next due date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { animalId, vaccinationType, vaccinationDate, nextDueDate, notes } = req.body;

    // Verify animal belongs to farmer
    const animal = await Animal.findById(parseInt(animalId));
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    if (animal.farmerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const record = await Record.create({
      animalId,
      vaccinationType,
      vaccinationDate,
      nextDueDate,
      notes
    });

    res.status(201).json({ message: 'Vaccination record created', record });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending treatments (Vet only)
router.get('/pending', authorize('vet'), async (req, res) => {
  try {
    const pendingRecords = await Record.findPending();
    res.json(pendingRecords);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Sign off/verify record (Vet only) - Professional Sign-Off with PIN
router.post('/verify/:id', authorize('vet'), [
  body('batchNumber').trim().notEmpty().withMessage('Batch number is required'),
  body('dosage').trim().notEmpty().withMessage('Dosage is required'),
  body('withdrawalPeriod').isInt({ min: 0, max: 365 }).withMessage('Withdrawal period must be 0-365 days'),
  body('notes').trim().notEmpty().withMessage('Medical notes are required'),
  body('digitalPin').trim().matches(/^\d{4}$/).withMessage('PIN must be 4 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const recordId = parseInt(req.params.id);
    const record = await Record.findById(recordId);
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    if (record.isVerified === true) {
      return res.status(400).json({ message: 'Record already verified' });
    }

    const { batchNumber, dosage, withdrawalPeriod, notes, digitalPin } = req.body;

    // TODO: In production, validate PIN against vet's actual stored PIN
    // For now, we accept any 4-digit PIN as valid
    if (!digitalPin || !/^\d{4}$/.test(digitalPin)) {
      return res.status(401).json({ message: 'Invalid digital PIN' });
    }

    // Update record with sign-off details
    const verifiedRecord = await Record.verify(recordId, req.user.id);
    
    // Add professional sign-off details
    verifiedRecord.batchNumber = batchNumber;
    verifiedRecord.dosage = dosage;
    verifiedRecord.withdrawalDays = withdrawalPeriod;
    verifiedRecord.notes = notes;
    
    // Mark as completed
    verifiedRecord.requestStatus = 'completed';
    verifiedRecord.verifiedDate = new Date().toISOString();

    res.json({ message: 'Record signed off successfully. Market value increased by 15%.', record: verifiedRecord });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all verified records
router.get('/verified', async (req, res) => {
  try {
    // If farmer, only show their animals
    const farmerId = req.user.role === 'farmer' ? req.user.id : null;
    const records = await Record.findVerified(farmerId);
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request vaccination (Farmer creates request for vet approval)
router.post('/request', authorize('farmer'), [
  body('animalId').notEmpty().withMessage('Animal ID is required'),
  body('vaccinationType').trim().notEmpty().withMessage('Vaccination type is required'),
  body('proposedDate').optional().isISO8601().withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { animalId, vaccinationType, proposedDate, notes } = req.body;

    // Verify animal belongs to farmer
    const animal = await Animal.findById(parseInt(animalId));
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    if (animal.farmerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const request = await Record.createRequest({
      animalId,
      vaccinationType,
      proposedDate,
      notes
    });

    res.status(201).json({ message: 'Vaccination request submitted', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending vaccination requests (Vet only)
router.get('/pending-requests', authorize('vet'), async (req, res) => {
  try {
    const pendingRequests = await Record.findPendingRequests();
    res.json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve vaccination request (Vet only)
router.post('/request/:id/approve', authorize('vet'), [
  body('vaccinationDate').isISO8601().withMessage('Invalid vaccination date'),
  body('nextDueDate').isISO8601().withMessage('Invalid next due date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const recordId = parseInt(req.params.id);
    const record = await Record.findById(recordId);

    if (!record) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (record.requestStatus !== 'pending_request') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    const { vaccinationDate, nextDueDate } = req.body;

    const approvedRecord = await Record.updateRequest(recordId, 'approved', {
      vaccinationDate,
      nextDueDate
    });

    // Mark as verified by vet
    approvedRecord.isVerified = true;
    approvedRecord.vetId = req.user.id;
    approvedRecord.verifiedDate = new Date().toISOString();

    res.json({ message: 'Vaccination request approved', record: approvedRecord });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject vaccination request (Vet only)
router.post('/request/:id/reject', authorize('vet'), [
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const recordId = parseInt(req.params.id);
    const record = await Record.findById(recordId);

    if (!record) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (record.requestStatus !== 'pending_request') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    const { reason } = req.body;
    record.notes = reason ? `Rejected: ${reason}` : 'Rejected by veterinarian';

    const rejectedRecord = await Record.updateRequest(recordId, 'rejected', {});

    res.json({ message: 'Vaccination request rejected', record: rejectedRecord });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete verified record (Vet only)
router.delete('/verified/:id', authorize('vet'), async (req, res) => {
  try {
    const recordId = parseInt(req.params.id);
    const record = await Record.findById(recordId);

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    if (record.isVerified !== true) {
      return res.status(400).json({ message: 'Only verified records can be deleted' });
    }

    // Delete the record
    await Record.delete(recordId);

    res.json({ message: 'Verified record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
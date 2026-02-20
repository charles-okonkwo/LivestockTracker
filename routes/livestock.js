const express = require('express');
const { body, validationResult } = require('express-validator');
const Animal = require('../models/Animal');
const Record = require('../models/Record');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Register new animal (Farmer only)
router.post('/register', authorize('farmer'), [
  body('tagId').trim().notEmpty().withMessage('Tag ID is required'),
  body('breed').trim().notEmpty().withMessage('Breed is required'),
  body('species').isIn(['Cattle', 'Sheep', 'Goat', 'Pig', 'Chicken', 'Other']).withMessage('Invalid species')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tagId, breed, species, dateOfBirth, gender } = req.body;

    // Check if tag ID already exists
    const existingAnimal = await Animal.findByTagId(tagId);
    if (existingAnimal) {
      return res.status(400).json({ message: 'Animal with this Tag ID already exists' });
    }

    const animal = await Animal.create({
      tagId,
      breed,
      species,
      farmerId: req.user.id,
      dateOfBirth,
      gender
    });

    res.status(201).json({ message: 'Animal registered successfully', animal });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all animals for farmer
router.get('/animals', authorize('farmer'), async (req, res) => {
  try {
    const animals = await Animal.findByFarmerId(req.user.id);
    res.json(animals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search animals by Tag ID (Vet only - can search all animals)
router.get('/search', authorize('vet'), async (req, res) => {
  try {
    const { tagId } = req.query;
    if (!tagId) {
      return res.status(400).json({ message: 'Tag ID is required' });
    }
    
    const animal = await Animal.findByTagId(tagId);
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }
    
    // Get farmer info
    const User = require('../models/User');
    const farmer = await User.findById(animal.farmerId);
    
    res.json({
      ...animal,
      farmerName: farmer ? farmer.fullName : 'Unknown'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single animal
router.get('/animals/:id', async (req, res) => {
  try {
    const animal = await Animal.findById(parseInt(req.params.id));
    
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    // Check if user has access (farmer owns it or vet)
    if (req.user.role === 'farmer' && animal.farmerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(animal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get animals due for vaccination
router.get('/due-vaccination', authorize('farmer'), async (req, res) => {
  try {
    const animals = await Animal.findActiveByFarmerId(req.user.id);
    const animalIds = animals.map(a => a.id);

    const dueRecords = await Record.findDueForVaccination(animalIds);

    res.json(dueRecords);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get health history for an animal
router.get('/animals/:id/history', async (req, res) => {
  try {
    const animal = await Animal.findById(parseInt(req.params.id));
    
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    if (req.user.role === 'farmer' && animal.farmerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const records = await Record.findByAnimalId(parseInt(req.params.id));

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update animal (Farmer only)
router.put('/animals/:id', authorize('farmer'), [
  body('breed').optional().trim().notEmpty().withMessage('Breed cannot be empty'),
  body('gender').optional().isIn(['Male', 'Female', 'Unknown']).withMessage('Invalid gender'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
  body('targetSellingPrice').optional().isNumeric().withMessage('Target selling price must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const animalId = parseInt(req.params.id);
    const animal = await Animal.findById(animalId);

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    if (animal.farmerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedAnimal = await Animal.update(animalId, req.body);
    
    // Calculate market value
    const marketValue = await Animal.calculateMarketValue(animalId);
    updatedAnimal.estimatedMarketValue = marketValue.estimatedValue;
    updatedAnimal.hasVetCertified = marketValue.hasVetCertified;

    res.json({ message: 'Animal updated successfully', animal: updatedAnimal });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete animal (Farmer only)
router.delete('/animals/:id', authorize('farmer'), async (req, res) => {
  try {
    const animalId = parseInt(req.params.id);
    const animal = await Animal.findById(animalId);

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    if (animal.farmerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Animal.delete(animalId);

    res.json({ message: 'Animal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Calculate market value for an animal
router.get('/animals/:id/market-value', async (req, res) => {
  try {
    const animalId = parseInt(req.params.id);
    const animal = await Animal.findById(animalId);

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    if (req.user.role === 'farmer' && animal.farmerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const marketValue = await Animal.calculateMarketValue(animalId);
    res.json(marketValue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get total farm equity for farmer
router.get('/farm-equity', authorize('farmer'), async (req, res) => {
  try {
    const animals = await Animal.findByFarmerId(req.user.id);
    
    let totalEquity = 0;
    const animalValues = [];

    for (const animal of animals) {
      const marketValue = await Animal.calculateMarketValue(animal.id);
      const value = marketValue.estimatedValue;
      totalEquity += value;
      animalValues.push({
        id: animal.id,
        tagId: animal.tagId,
        breed: animal.breed,
        estimatedValue: value,
        hasVetCertified: marketValue.hasVetCertified
      });
    }

    res.json({ totalEquity, animalCount: animals.length, animals: animalValues });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
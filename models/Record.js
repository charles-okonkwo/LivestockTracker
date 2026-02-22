const db = require('../config/database');

// Withdrawal periods in days for different drugs
const WITHDRAWAL_PERIODS = {
  'FMD': 0,
  'Brucellosis': 30,
  'Anthrax': 0,
  'Lumpy Skin Disease': 45,
  'Foot and Mouth': 30,
  'Black Quarter': 14,
  'Rabies': 0,
  'Dewormer': 14,
  'Antibiotic': 21,
  'Default': 14
};

class Record {
  static async create(recordData) {
    await db.read();
    const { animalId, vaccinationType, vaccinationDate, nextDueDate, notes, requestStatus } = recordData;
    
    // Get next ID
    db.data._meta.lastRecordId += 1;
    const id = db.data._meta.lastRecordId;
    
    // Calculate withdrawal end date (days from vaccination date)
    const withdrawalDays = WITHDRAWAL_PERIODS[vaccinationType] || WITHDRAWAL_PERIODS['Default'];
    const withdrawalEndDate = new Date(vaccinationDate);
    withdrawalEndDate.setDate(withdrawalEndDate.getDate() + withdrawalDays);
    
    const record = {
      id,
      animalId,
      vaccinationType: vaccinationType.trim(),
      vaccinationDate,
      nextDueDate,
      notes: notes || null,
      isVerified: false,
      requestStatus: requestStatus || 'completed', // pending_request, approved, rejected, completed
      vetId: null,
      verifiedDate: null,
      withdrawalEndDate: withdrawalEndDate.toISOString().split('T')[0],
      withdrawalDays: withdrawalDays,
      createdAt: new Date().toISOString()
    };
    
    db.data.records.push(record);
    await db.write();
    
    return record;
  }

  static async findById(id) {
    await db.read();
    return db.data.records.find(r => r.id === id) || null;
  }

  static async findByAnimalId(animalId) {
    await db.read();
    const records = db.data.records
      .filter(r => r.animalId === animalId)
      .sort((a, b) => new Date(b.vaccinationDate) - new Date(a.vaccinationDate));
    
    // Add vet name
    return records.map(record => {
      const vet = record.vetId ? db.data.users.find(u => u.id === record.vetId) : null;
      return {
        ...record,
        vetName: vet ? vet.fullName : null
      };
    });
  }

  static async findPending() {
    await db.read();
    const records = db.data.records
      .filter(r => !r.isVerified)
      .sort((a, b) => new Date(b.vaccinationDate) - new Date(a.vaccinationDate));
    
    // Format records to match expected structure for frontend
    return records.map(record => {
      const animal = db.data.animals.find(a => a.id === record.animalId);
      const farmer = animal ? db.data.users.find(u => u.id === animal.farmerId) : null;
      
      return {
        id: record.id,
        vaccinationType: record.vaccinationType,
        vaccinationDate: record.vaccinationDate,
        nextDueDate: record.nextDueDate,
        notes: record.notes,
        isVerified: record.isVerified,
        createdAt: record.createdAt,
        animalId: {
          _id: record.animalId,
          tagId: animal ? animal.tagId : null,
          breed: animal ? animal.breed : null,
          species: animal ? animal.species : null,
          farmerId: {
            fullName: farmer ? farmer.fullName : null
          }
        }
      };
    });
  }

  static async findDueForVaccination(animalIds) {
    await db.read();
    if (animalIds.length === 0) return [];
    
    const today = new Date().toISOString().split('T')[0];
    
    const records = db.data.records.filter(r => 
      animalIds.includes(r.animalId) &&
      r.nextDueDate <= today &&
      r.isVerified === true
    );
    
    // Format to match expected structure
    return records.map(record => {
      const animal = db.data.animals.find(a => a.id === record.animalId);
      return {
        ...record,
        animalId: {
          tagId: animal ? animal.tagId : null,
          breed: animal ? animal.breed : null,
          species: animal ? animal.species : null
        }
      };
    });
  }

  static async findVerified(farmerId = null) {
    await db.read();
    let records = db.data.records.filter(r => r.isVerified === true);
    
    if (farmerId) {
      const farmerAnimals = db.data.animals
        .filter(a => a.farmerId === farmerId)
        .map(a => a.id);
      records = records.filter(r => farmerAnimals.includes(r.animalId));
    }
    
    records.sort((a, b) => new Date(b.vaccinationDate) - new Date(a.vaccinationDate));
    
    // Add animal and vet info
    return records.map(record => {
      const animal = db.data.animals.find(a => a.id === record.animalId);
      const vet = record.vetId ? db.data.users.find(u => u.id === record.vetId) : null;
      
      return {
        ...record,
        animalId: {
          id: record.animalId,
          _id: record.animalId,
          tagId: animal ? animal.tagId : null,
          breed: animal ? animal.breed : null,
          species: animal ? animal.species : null
        },
        vetId: vet ? { fullName: vet.fullName } : null
      };
    });
  }

  static async verify(id, vetId) {
    await db.read();
    const record = db.data.records.find(r => r.id === id);
    if (!record) return null;
    
    record.isVerified = true;
    record.requestStatus = 'completed';
    record.verifiedDate = new Date().toISOString();
    record.vetId = vetId;
    
    await db.write();
    return record;
  }

  // Create a vaccination request (pending approval from vet)
  static async createRequest(requestData) {
    await db.read();
    const { animalId, vaccinationType, proposedDate, notes } = requestData;
    
    // Get next ID
    db.data._meta.lastRecordId += 1;
    const id = db.data._meta.lastRecordId;
    
    const record = {
      id,
      animalId,
      vaccinationType: vaccinationType.trim(),
      vaccinationDate: null,
      nextDueDate: null,
      notes: notes || null,
      isVerified: false,
      requestStatus: 'pending_request',
      proposedDate: proposedDate || null,
      vetId: null,
      verifiedDate: null,
      withdrawalEndDate: null,
      withdrawalDays: 0,
      createdAt: new Date().toISOString()
    };
    
    db.data.records.push(record);
    await db.write();
    
    return record;
  }

  // Find pending requests (for vet portal)
  static async findPendingRequests() {
    await db.read();
    const requests = db.data.records
      .filter(r => r.requestStatus === 'pending_request')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return requests.map(record => {
      const animal = db.data.animals.find(a => a.id === record.animalId);
      const farmer = animal ? db.data.users.find(u => u.id === animal.farmerId) : null;
      
      return {
        ...record,
        animalId: {
          _id: record.animalId,
          tagId: animal ? animal.tagId : null,
          breed: animal ? animal.breed : null,
          species: animal ? animal.species : null,
          farmerId: {
            fullName: farmer ? farmer.fullName : null
          }
        }
      };
    });
  }

  // Approve or reject a vaccination request
  static async updateRequest(id, status, approvalData = {}) {
    await db.read();
    const record = db.data.records.find(r => r.id === id);
    if (!record) return null;
    
    record.requestStatus = status; // approved or rejected
    
    if (status === 'approved') {
      const { vaccinationDate, nextDueDate } = approvalData;
      record.vaccinationDate = vaccinationDate;
      record.nextDueDate = nextDueDate;
      
      // Calculate withdrawal end date
      const withdrawalDays = WITHDRAWAL_PERIODS[record.vaccinationType] || WITHDRAWAL_PERIODS['Default'];
      const withdrawalEndDate = new Date(vaccinationDate);
      withdrawalEndDate.setDate(withdrawalEndDate.getDate() + withdrawalDays);
      
      record.withdrawalEndDate = withdrawalEndDate.toISOString().split('T')[0];
      record.withdrawalDays = withdrawalDays;
    }
    
    await db.write();
    return record;
  }

  // Calculate days remaining in withdrawal period
  static getWithdrawalDaysRemaining(withdrawalEndDate) {
    if (!withdrawalEndDate) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date(withdrawalEndDate);
    endDate.setHours(0, 0, 0, 0);
    
    const diffMs = endDate - today;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  // Delete a record by ID
  static async delete(id) {
    await db.read();
    const index = db.data.records.findIndex(r => r.id === id);
    
    if (index === -1) {
      return false;
    }
    
    db.data.records.splice(index, 1);
    await db.write();
    
    return true;
  }
}

module.exports = Record;

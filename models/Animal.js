const db = require('../config/database');
const Record = require('./Record');

// Base prices for different breeds (in Naira)
const BREED_BASE_PRICES = {
  'Holstein': 500000,
  'Angus': 450000,
  'Jersey': 400000,
  'Brahman': 480000,
  'Zebu': 380000,
  'Dorper': 120000,
  'Merino': 100000,
  'Boer': 150000,
  'West African Dwarf': 80000,
  'Kano Brown': 90000,
  'Landrace': 250000,
  'Duroc': 280000,
  'Chester White': 260000,
  'Leghorn': 5000,
  'Rhode Island Red': 5500,
  'Cochin': 6000,
  'Other': 200000
};

class Animal {
  static async create(animalData) {
    await db.read();
    const { tagId, breed, species, farmerId, dateOfBirth, gender, targetSellingPrice } = animalData;
    
    // Check if tag ID already exists
    const existing = db.data.animals.find(a => a.tagId === tagId.toUpperCase().trim());
    if (existing) {
      throw new Error('Animal with this Tag ID already exists');
    }
    
    // Get next ID
    db.data._meta.lastAnimalId += 1;
    const id = db.data._meta.lastAnimalId;
    
    const basePrice = BREED_BASE_PRICES[breed] || BREED_BASE_PRICES['Other'];
    
    const animal = {
      id,
      tagId: tagId.toUpperCase().trim(),
      breed: breed.trim(),
      species,
      farmerId,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      registrationDate: new Date().toISOString(),
      status: 'Active',
      targetSellingPrice: targetSellingPrice || basePrice,
      estimatedMarketValue: basePrice,
      basePrice: basePrice
    };
    
    db.data.animals.push(animal);
    await db.write();
    
    return animal;
  }

  static async findById(id) {
    await db.read();
    return db.data.animals.find(a => a.id === id) || null;
  }

  static async findByTagId(tagId) {
    await db.read();
    return db.data.animals.find(a => a.tagId === tagId.toUpperCase().trim()) || null;
  }

  static async findByFarmerId(farmerId) {
    await db.read();
    return db.data.animals
      .filter(a => a.farmerId === farmerId)
      .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
  }

  static async findActiveByFarmerId(farmerId) {
    await db.read();
    return db.data.animals.filter(a => a.farmerId === farmerId && a.status === 'Active');
  }

  // Calculate estimated market value based on vet certification
  static async calculateMarketValue(animalId) {
    const animal = await this.findById(animalId);
    if (!animal) return null;

    // Get all verified records for this animal
    const records = await Record.findByAnimalId(animalId);
    const hasVetCertified = records.some(r => r.isVerified === true || r.isVerified === 1);

    // Base price + 15% if vet-certified
    const basePrice = animal.basePrice || BREED_BASE_PRICES[animal.breed] || BREED_BASE_PRICES['Other'];
    const estimatedValue = hasVetCertified ? basePrice * 1.15 : basePrice;

    return {
      basePrice,
      estimatedValue,
      hasVetCertified
    };
  }

  // Update animal (allows updating breed, gender, DOB, and target price - not tag ID)
  static async update(id, updateData) {
    await db.read();
    const animal = db.data.animals.find(a => a.id === id);
    
    if (!animal) {
      throw new Error('Animal not found');
    }

    // Only allow updating specific fields
    const allowedFields = ['breed', 'gender', 'dateOfBirth', 'targetSellingPrice'];
    
    for (const field of allowedFields) {
      if (field in updateData && updateData[field] !== undefined) {
        if (field === 'breed') {
          animal.breed = updateData[field].trim();
          // Update base price if breed changed
          animal.basePrice = BREED_BASE_PRICES[animal.breed] || BREED_BASE_PRICES['Other'];
          animal.estimatedMarketValue = animal.basePrice;
        } else if (field === 'targetSellingPrice') {
          animal.targetSellingPrice = updateData[field];
        } else {
          animal[field] = updateData[field];
        }
      }
    }

    await db.write();
    return animal;
  }

  // Delete animal
  static async delete(id) {
    await db.read();
    const index = db.data.animals.findIndex(a => a.id === id);
    
    if (index === -1) {
      throw new Error('Animal not found');
    }

    db.data.animals.splice(index, 1);
    await db.write();
    
    return true;
  }
}

module.exports = Animal;

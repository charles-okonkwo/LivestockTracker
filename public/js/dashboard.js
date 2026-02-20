const API_URL = '/api';

// Format currency in Naira
function formatNaira(amount) {
    return '₦' + new Intl.NumberFormat('en-NG').format(Math.round(amount));
}

// Check authentication
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!token || !user || user.role !== 'farmer') {
        window.location.href = '/';
        return;
    }

    document.getElementById('userName').textContent = user.fullName;
    loadAnimals();
    loadDueVaccinations();
    loadFarmEquity();
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
});

// Register animal
document.getElementById('animalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const animalData = {
        tagId: document.getElementById('tagId').value,
        breed: document.getElementById('breed').value,
        species: document.getElementById('species').value,
        dateOfBirth: document.getElementById('dateOfBirth').value || undefined,
        gender: document.getElementById('gender').value || undefined
    };

    try {
        const response = await fetch(`${API_URL}/livestock/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(animalData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Animal registered successfully!', 'success');
            document.getElementById('animalForm').reset();
            loadAnimals();
            loadFarmEquity();
        } else {
            showMessage(data.message || 'Failed to register animal', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
});

// Load animals
async function loadAnimals() {
    try {
        const response = await fetch(`${API_URL}/livestock/animals`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const animals = await response.json();
        const animalsList = document.getElementById('animalsList');

        if (animals.length === 0) {
            animalsList.innerHTML = '<p class="text-gray-500 text-center py-8">No animals registered yet. Register your first animal above!</p>';
            return;
        }

        animalsList.innerHTML = animals.map(animal => {
            const marketValue = animal.estimatedMarketValue || animal.basePrice || 200000;
            const isVetCertified = animal.hasVetCertified ? '<svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg> Vet-Certified (+15%)' : 'Pending Certification';
            
            return `
                <div class="border border-green-200 rounded-lg p-4 hover:shadow-lg transition bg-gradient-to-br from-white to-green-50">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-9h8v2H8v-2z"></path></svg>
                                <h4 class="font-semibold text-lg text-gray-800">${animal.tagId}</h4>
                            </div>
                            <p class="text-gray-600 text-sm mt-1">${animal.breed} - ${animal.species}</p>
                            ${animal.gender ? `<p class="text-xs text-gray-500">Gender: ${animal.gender}</p>` : ''}
                            ${animal.dateOfBirth ? `<p class="text-xs text-gray-500">DOB: ${new Date(animal.dateOfBirth).toLocaleDateString()}</p>` : ''}
                            <p class="text-xs text-gray-500 mt-1">Registered: ${new Date(animal.registrationDate).toLocaleDateString()}</p>
                        </div>
                        <div class="text-right">
                            <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                                animal.status === 'Active' ? 'bg-green-100 text-green-800' :
                                animal.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                            }">${animal.status}</span>
                        </div>
                    </div>
                    
                    <!-- Market Value Section -->
                    <div class="bg-white rounded p-3 mb-3 border border-green-100">
                        <p class="text-xs text-gray-600 mb-1"><svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18 10 11.41l4 4 6.3-6.29L22 12v-6z"></path></svg> Market Value</p>
                        <p class="text-lg font-bold text-green-600">${formatNaira(marketValue)}</p>
                        <p class="text-xs text-gray-500 mt-1">${isVetCertified}</p>
                    </div>

                    <!-- Action Buttons -->
                    <div class="mt-3 flex flex-wrap gap-2">
                        <button onclick="openEditModal('${animal.id}')" 
                            class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg> Edit
                        </button>
                        <button onclick="requestVaccination('${animal.id}', '${animal.tagId} - ${animal.breed}')" 
                            class="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium">
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg> Vaccination
                        </button>
                        <button onclick="viewHistory('${animal.id}')" 
                            class="flex-1 px-3 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition text-sm font-medium">
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> History
                        </button>
                        <button onclick="deleteAnimal('${animal.id}')" 
                            class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium" title="Delete">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        document.getElementById('animalsList').innerHTML = '<p class="text-red-500 text-center py-8">Error loading animals</p>';
    }
}

// Load farm equity
async function loadFarmEquity() {
    try {
        const response = await fetch(`${API_URL}/livestock/farm-equity`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        document.getElementById('totalEquity').textContent = formatNaira(data.totalEquity);
        document.getElementById('animalCountEquity').textContent = data.animalCount;
    } catch (error) {
        console.error('Error loading farm equity:', error);
    }
}

// Load due vaccinations
async function loadDueVaccinations() {
    try {
        const response = await fetch(`${API_URL}/livestock/due-vaccination`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const dueRecords = await response.json();
        const alertDiv = document.getElementById('dueVaccinationAlert');
        const countDiv = document.getElementById('dueCount');

        if (dueRecords && dueRecords.length > 0) {
            countDiv.textContent = `${dueRecords.length} animal(s) need attention`;
            alertDiv.classList.remove('hidden');
        } else {
            alertDiv.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error loading due vaccinations:', error);
    }
}

// Open edit modal
async function openEditModal(animalId) {
    try {
        const response = await fetch(`${API_URL}/livestock/animals/${animalId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to load animal');
        
        const animal = await response.json();
        
        // Load market value
        const mvResponse = await fetch(`${API_URL}/livestock/animals/${animalId}/market-value`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const marketValue = await mvResponse.json();

        document.getElementById('editAnimalId').value = animal.id;
        document.getElementById('editTagId').value = animal.tagId;
        document.getElementById('editBreed').value = animal.breed;
        document.getElementById('editGender').value = animal.gender || '';
        document.getElementById('editDateOfBirth').value = animal.dateOfBirth ? animal.dateOfBirth.split('T')[0] : '';
        document.getElementById('editTargetPrice').value = animal.targetSellingPrice || '';
        document.getElementById('estimatedValueDisplay').textContent = formatNaira(marketValue.estimatedValue);

        document.getElementById('editAnimalModal').classList.remove('hidden');
    } catch (error) {
        showMessage('Error loading animal details', 'error');
    }
}

// Close edit modal
document.getElementById('closeEditModal')?.addEventListener('click', () => {
    document.getElementById('editAnimalModal').classList.add('hidden');
});

document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
    document.getElementById('editAnimalModal').classList.add('hidden');
});

document.getElementById('editAnimalModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'editAnimalModal') {
        document.getElementById('editAnimalModal').classList.add('hidden');
    }
});

// Submit edit form
document.getElementById('editAnimalForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const animalId = document.getElementById('editAnimalId').value;
    const updateData = {
        breed: document.getElementById('editBreed').value,
        gender: document.getElementById('editGender').value || undefined,
        dateOfBirth: document.getElementById('editDateOfBirth').value || undefined,
        targetSellingPrice: parseInt(document.getElementById('editTargetPrice').value) || undefined
    };

    try {
        const response = await fetch(`${API_URL}/livestock/animals/${animalId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Animal updated successfully!', 'success');
            document.getElementById('editAnimalModal').classList.add('hidden');
            loadAnimals();
            loadFarmEquity();
        } else {
            showMessage(data.message || 'Failed to update animal', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
});

// Delete animal
async function deleteAnimal(animalId) {
    if (!confirm('Are you sure you want to delete this animal profile? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/livestock/animals/${animalId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Animal deleted successfully!', 'success');
            loadAnimals();
            loadFarmEquity();
        } else {
            showMessage(data.message || 'Failed to delete animal', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

// View health history
async function viewHistory(animalId) {
    const modal = document.getElementById('historyModal');
    const content = document.getElementById('historyContent');
    const title = document.getElementById('modalAnimalTitle');
    
    // Get animal info for title
    try {
        const animalResponse = await fetch(`${API_URL}/livestock/animals/${animalId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const animal = await animalResponse.json();
        title.textContent = `Health History - ${animal.tagId} (${animal.breed})`;
    } catch (error) {
        title.textContent = 'Health History';
    }
    
    // Show modal with loading state
    modal.classList.remove('hidden');
    content.innerHTML = '<p class="text-gray-500 text-center py-8">Loading health records...</p>';
    
    try {
        const response = await fetch(`${API_URL}/livestock/animals/${animalId}/history`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const records = await response.json();
        
        if (records.length === 0) {
            content.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-gray-500 text-lg mb-4">No health records found for this animal.</p>
                    <p class="text-gray-400 text-sm">Health records will appear here once vaccinations are approved.</p>
                </div>
            `;
            return;
        }

        // Display records in a nice format
        content.innerHTML = `
            <div class="space-y-4">
                ${records.map(record => {
                    const withdrawalDays = record.withdrawalDays || 0;
                    const withdrawalEnd = record.withdrawalEndDate;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const endDate = new Date(withdrawalEnd);
                    endDate.setHours(0, 0, 0, 0);
                    const daysRemaining = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));

                    return `
                        <div class="border border-green-200 rounded-lg p-4 hover:shadow-md transition bg-gradient-to-br from-white to-green-50">
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <h4 class="font-semibold text-lg text-gray-800">${record.vaccinationType}</h4>
                                    <p class="text-sm text-gray-500">Recorded: ${new Date(record.vaccinationDate).toLocaleDateString()}</p>
                                </div>
                                <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                                    record.isVerified === 1 || record.isVerified === true 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                }">
                                    ${record.isVerified === 1 || record.isVerified === true ? '<svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg> Verified' : '<svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg> Pending'}
                                </span>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                <div>
                                    <p class="text-sm text-gray-600"><strong>Next Due Date:</strong></p>
                                    <p class="text-sm text-gray-800">${new Date(record.nextDueDate).toLocaleDateString()}</p>
                                </div>
                                ${record.vetName ? `
                                    <div>
                                        <p class="text-sm text-gray-600"><strong>Verified by:</strong></p>
                                        <p class="text-sm text-gray-800">${record.vetName}</p>
                                    </div>
                                ` : ''}
                            </div>
                            ${withdrawalEnd ? `
                                <div class="mt-3 pt-3 border-t border-green-200 bg-blue-50 p-3 rounded">
                                    <p class="text-sm text-blue-800"><svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg><strong>Withdrawal Period:</strong></p>
                                    <p class="text-sm text-blue-800">Safe to sell after: ${new Date(withdrawalEnd).toLocaleDateString()}</p>
                                    <p class="text-sm ${daysRemaining > 0 ? 'text-orange-600' : 'text-green-600'} font-semibold">
                                        ${daysRemaining > 0 ? `${daysRemaining} days remaining` : '<svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg> Safe for market'}
                                    </p>
                                </div>
                            ` : ''}
                            ${record.notes ? `
                                <div class="mt-3 pt-3 border-t border-green-200">
                                    <p class="text-sm text-gray-600"><strong>Notes:</strong></p>
                                    <p class="text-sm text-gray-800">${record.notes}</p>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    } catch (error) {
        content.innerHTML = `
            <div class="text-center py-12">
                <p class="text-red-500 text-lg">Error loading health history</p>
                <p class="text-gray-400 text-sm mt-2">Please try again later</p>
            </div>
        `;
    }
}

// Close modal
document.getElementById('closeModal')?.addEventListener('click', () => {
    document.getElementById('historyModal').classList.add('hidden');
});

// Close modal when clicking outside
document.getElementById('historyModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'historyModal') {
        document.getElementById('historyModal').classList.add('hidden');
    }
});

// Request vaccination
function requestVaccination(animalId, animalName) {
    const modal = document.getElementById('requestVaccinationModal');
    document.getElementById('requestVaccinationAnimalId').value = animalId;
    document.getElementById('requestVaccinationAnimalName').value = animalName;
    document.getElementById('vaccinationModalTitle').textContent = `Request Vaccination - ${animalName}`;
    
    // Set today as default proposed date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('requestProposedDate').value = today;
    
    // Clear form
    document.getElementById('requestVaccinationType').value = '';
    document.getElementById('requestVaccinationNotes').value = '';
    
    modal.classList.remove('hidden');
}

// Close request vaccination modal
document.getElementById('closeRequestVaccinationModal')?.addEventListener('click', () => {
    document.getElementById('requestVaccinationModal').classList.add('hidden');
});

document.getElementById('cancelRequestVaccinationBtn')?.addEventListener('click', () => {
    document.getElementById('requestVaccinationModal').classList.add('hidden');
});

// Close modal when clicking outside
document.getElementById('requestVaccinationModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'requestVaccinationModal') {
        document.getElementById('requestVaccinationModal').classList.add('hidden');
    }
});

// Submit vaccination request form
document.getElementById('requestVaccinationForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const animalId = document.getElementById('requestVaccinationAnimalId').value;
    const vaccinationType = document.getElementById('requestVaccinationType').value;
    const proposedDate = document.getElementById('requestProposedDate').value;
    const notes = document.getElementById('requestVaccinationNotes').value;
    
    try {
        const response = await fetch(`${API_URL}/vaccination/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                animalId: parseInt(animalId),
                vaccinationType,
                proposedDate: proposedDate || null,
                notes: notes || null
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Vaccination request submitted! Awaiting veterinarian approval...', 'success');
            document.getElementById('requestVaccinationModal').classList.add('hidden');
            document.getElementById('requestVaccinationForm').reset();
            
            // Refresh the page data
            loadAnimals();
        } else {
            showMessage(data.message || 'Failed to submit vaccination request', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
});

// Refresh button
document.getElementById('refreshBtn').addEventListener('click', () => {
    loadAnimals();
    loadDueVaccinations();
    loadFarmEquity();
});

function showMessage(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
    }`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

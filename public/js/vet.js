const API_URL = '/api';

// Format currency to Nigerian Naira
function formatNaira(amount) {
    return '₦' + new Intl.NumberFormat('en-NG').format(Math.round(amount));
}

// Check authentication
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!token || !user || user.role !== 'vet') {
        window.location.href = '/';
        return;
    }

    document.getElementById('userName').textContent = user.fullName;
    loadPendingRequests();
    loadPendingTreatments();
    loadVerifiedRecords();
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
});

// Load pending vaccination requests
async function loadPendingRequests() {
    try {
        const response = await fetch(`${API_URL}/vaccination/pending-requests`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const pendingRequests = await response.json();
        const requestsList = document.getElementById('requestsList');

        if (!pendingRequests || pendingRequests.length === 0) {
            requestsList.innerHTML = '<p class="text-gray-500 text-center py-8">No pending vaccination requests.</p>';
            return;
        }

        requestsList.innerHTML = pendingRequests.map(request => {
            const animal = request.animalId;
            const farmer = animal?.farmerId?.fullName || 'Unknown';
            const animalId = animal?._id || request.animalId;
            return `
                <div class="border border-amber-300 bg-amber-50 rounded-lg p-4">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h4 class="font-semibold text-lg text-gray-800 flex items-center gap-2">
                                <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                ${request.vaccinationType}
                            </h4>
                            <p class="text-gray-600 mt-1"><strong>Animal:</strong> ${animal?.tagId || 'N/A'} - ${animal?.breed || 'N/A'} (${animal?.species || 'N/A'})</p>
                            <p class="text-sm text-gray-600 mt-1"><strong>Farmer:</strong> ${farmer}</p>
                            ${request.proposedDate ? `<p class="text-sm text-gray-600"><strong>Proposed Date:</strong> ${new Date(request.proposedDate).toLocaleDateString()}</p>` : ''}
                            ${request.notes ? `<p class="text-sm text-gray-600 mt-2"><strong>Notes:</strong> ${request.notes}</p>` : ''}
                            <p class="text-xs text-gray-500 mt-2">Requested: ${new Date(request.createdAt).toLocaleDateString()}</p>
                            <button onclick="viewAnimalHistory('${animalId}')" 
                                class="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                View Health History
                            </button>
                        </div>
                        <div class="flex flex-col gap-2 ml-4">
                            <button onclick="openApproveModal('${request.id}', '${request.vaccinationType}')" 
                                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm flex items-center gap-2 whitespace-nowrap">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                Approve
                            </button>
                            <button onclick="rejectRequest('${request.id}')" 
                                class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold text-sm whitespace-nowrap">
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading pending requests:', error);
        document.getElementById('requestsList').innerHTML = '<p class="text-red-500 text-center py-8">Error loading vaccination requests</p>';
    }
}

// Load pending treatments (ready for sign-off)
async function loadPendingTreatments() {
    try {
        const response = await fetch(`${API_URL}/vaccination/pending`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const pendingRecords = await response.json();
        const pendingList = document.getElementById('pendingList');

        if (pendingRecords.length === 0) {
            pendingList.innerHTML = '<p class="text-gray-500 text-center py-8">No pending sign-offs at this time.</p>';
            return;
        }

        pendingList.innerHTML = pendingRecords.map(record => {
            const animal = record.animalId;
            const farmer = animal?.farmerId?.fullName || 'Unknown';
            const animalId = animal?._id || record.animalId;
            const marketValue = animal?.estimatedMarketValue || 0;
            const valueIncrease = Math.round(marketValue * 0.15);
            
            return `
                <div class="border border-orange-300 bg-orange-50 rounded-lg p-4">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h4 class="font-semibold text-lg text-gray-800">${record.vaccinationType}</h4>
                            <p class="text-gray-600 mt-1"><strong>Animal:</strong> ${animal?.tagId || 'N/A'} - ${animal?.breed || 'N/A'} (${animal?.species || 'N/A'})</p>
                            <p class="text-sm text-gray-600"><strong>Farmer:</strong> ${farmer}</p>
                            <p class="text-sm text-gray-600"><strong>Vaccination Date:</strong> ${new Date(record.vaccinationDate).toLocaleDateString()}</p>
                            <p class="text-sm text-gray-600"><strong>Next Due:</strong> ${new Date(record.nextDueDate).toLocaleDateString()}</p>
                            ${record.notes ? `<p class="text-sm text-gray-600 mt-2"><strong>Notes:</strong> ${record.notes}</p>` : ''}
                            
                            <div class="mt-3 pt-3 border-t border-orange-200">
                                <div class="flex items-center gap-2 bg-green-50 border border-green-200 rounded px-3 py-2">
                                    <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h.01a1 1 0 110 2H12zm-2.646 6.354l2-2a1 1 0 011.414 0l2 2a1 1 0 11-1.414 1.414L13 13.414l-1.354 1.354a1 1 0 01-1.414-1.414z" clip-rule="evenodd"></path></svg>
                                    <div>
                                        <p class="text-xs font-semibold text-green-800">Value Increase Badge</p>
                                        <p class="text-sm font-bold text-green-700">+15% = ${formatNaira(valueIncrease)}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <button onclick="viewAnimalHistory('${animalId}')" 
                                class="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                View Health History
                            </button>
                        </div>
                        <button onclick="openSignOffModal('${record.id}', '${animal?.tagId || 'N/A'}', '${record.vaccinationType}', ${marketValue})" 
                            class="ml-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition font-semibold whitespace-nowrap flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            Sign Off
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading pending treatments:', error);
        document.getElementById('pendingList').innerHTML = '<p class="text-red-500 text-center py-8">Error loading pending treatments</p>';
    }
}

// Load verified records
async function loadVerifiedRecords() {
    try {
        const response = await fetch(`${API_URL}/vaccination/verified`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const verifiedRecords = await response.json();
        const verifiedList = document.getElementById('verifiedList');

        if (verifiedRecords.length === 0) {
            verifiedList.innerHTML = '<p class="text-gray-500 text-center py-8">No verified records yet.</p>';
            return;
        }

        verifiedList.innerHTML = verifiedRecords.map(record => {
            const animal = record.animalId;
            const vet = record.vetId?.fullName || 'Unknown';
            const animalId = typeof animal === 'object' ? (animal._id || animal.id) : animal;
            
            return `
                <div class="border border-green-300 bg-green-50 rounded-lg p-4">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h4 class="font-semibold text-lg text-gray-800 flex items-center gap-2">
                                <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                ${record.vaccinationType}
                            </h4>
                            <p class="text-gray-600 mt-1"><strong>Animal:</strong> ${animal?.tagId || 'N/A'} - ${animal?.breed || 'N/A'} (${animal?.species || 'N/A'})</p>
                            <p class="text-sm text-gray-600"><strong>Vaccination Date:</strong> ${new Date(record.vaccinationDate).toLocaleDateString()}</p>
                            <p class="text-sm text-gray-600"><strong>Next Due:</strong> ${new Date(record.nextDueDate).toLocaleDateString()}</p>
                            <p class="text-sm text-green-700 font-semibold"><strong>Verified by:</strong> ${vet}</p>
                            <p class="text-sm text-gray-600"><strong>Verified on:</strong> ${new Date(record.verifiedDate).toLocaleDateString()}</p>
                            
                            ${record.batchNumber ? `<p class="text-sm text-gray-600 mt-2"><strong>Batch Number:</strong> ${record.batchNumber}</p>` : ''}
                            ${record.dosage ? `<p class="text-sm text-gray-600"><strong>Dosage:</strong> ${record.dosage}</p>` : ''}
                            ${record.withdrawalDays ? `<p class="text-sm text-gray-600"><strong>Withdrawal Period:</strong> ${record.withdrawalDays} days</p>` : ''}
                            
                            ${record.notes ? `
                                <div class="mt-3 pt-3 border-t border-green-200">
                                    <p class="text-sm font-semibold text-gray-700">Medical Notes:</p>
                                    <p class="text-sm text-gray-600 whitespace-pre-wrap font-mono text-xs">${record.notes}</p>
                                </div>
                            ` : ''}
                            
                            <div class="flex gap-2 mt-3">
                                <button onclick="viewAnimalHistory('${animalId}')" 
                                    class="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    View History
                                </button>
                                <button onclick="deleteVerifiedRecord('${record.id}')" 
                                    class="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    Delete
                                </button>
                            </div>
                        </div>
                        <span class="ml-4 px-3 py-1 rounded-full text-xs font-semibold bg-green-200 text-green-800 whitespace-nowrap">
                            Verified
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading verified records:', error);
        document.getElementById('verifiedList').innerHTML = '<p class="text-red-500 text-center py-8">Error loading verified records</p>';
    }
}

// Open approve modal (first step before sign-off)
function openApproveModal(requestId, vaccinationType) {
    document.getElementById('approveRequestId').value = requestId;
    document.getElementById('approveVaccinationType').value = vaccinationType;
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('approveVaccinationDate').value = today;
    document.getElementById('approveNextDueDate').value = '';
    
    document.getElementById('approveRequestModal').classList.remove('hidden');
}

// Close approve modal
document.getElementById('closeApproveModal')?.addEventListener('click', () => {
    document.getElementById('approveRequestModal').classList.add('hidden');
});

document.getElementById('cancelApproveBtn')?.addEventListener('click', () => {
    document.getElementById('approveRequestModal').classList.add('hidden');
});

document.getElementById('approveRequestModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'approveRequestModal') {
        document.getElementById('approveRequestModal').classList.add('hidden');
    }
});

// Submit approve request form
document.getElementById('approveRequestForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const requestId = document.getElementById('approveRequestId').value;
    const vaccinationDate = document.getElementById('approveVaccinationDate').value;
    const nextDueDate = document.getElementById('approveNextDueDate').value;
    
    if (new Date(nextDueDate) <= new Date(vaccinationDate)) {
        showMessage('Next due date must be after vaccination date', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/vaccination/request/${requestId}/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                vaccinationDate,
                nextDueDate
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('approveRequestModal').classList.add('hidden');
            loadPendingRequests();
            loadPendingTreatments();
            showMessage('Request approved! Proceed to sign-off.', 'success');
        } else {
            showMessage(data.message || 'Failed to approve request', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
});

// Open Professional Sign-Off Modal
function openSignOffModal(recordId, animalTag, vaccinationType, marketValue) {
    document.getElementById('signOffRecordId').value = recordId;
    document.getElementById('signOffAnimalInfo').textContent = `${animalTag} - ${vaccinationType}`;
    document.getElementById('signOffVaccineType').textContent = vaccinationType;
    
    const valueIncrease = Math.round(marketValue * 0.15);
    document.getElementById('signOffValueIncrease').textContent = `+15% (${formatNaira(valueIncrease)})`;
    
    // Clear form fields
    document.getElementById('batchNumber').value = '';
    document.getElementById('dosage').value = '';
    document.getElementById('withdrawalPeriod').value = '';
    document.getElementById('soapNotes').value = '';
    document.getElementById('digitalPin').value = '';
    
    document.getElementById('signOffModal').classList.remove('hidden');
}

// Close sign-off modal
document.getElementById('closeSignOffModal')?.addEventListener('click', () => {
    document.getElementById('signOffModal').classList.add('hidden');
});

document.getElementById('cancelSignOffBtn')?.addEventListener('click', () => {
    document.getElementById('signOffModal').classList.add('hidden');
});

document.getElementById('signOffModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'signOffModal') {
        document.getElementById('signOffModal').classList.add('hidden');
    }
});

// Submit sign-off form (with PIN verification)
document.getElementById('signOffForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const recordId = document.getElementById('signOffRecordId').value;
    const batchNumber = document.getElementById('batchNumber').value.trim();
    const dosage = document.getElementById('dosage').value.trim();
    const withdrawalPeriod = parseInt(document.getElementById('withdrawalPeriod').value);
    const soapNotes = document.getElementById('soapNotes').value.trim();
    const digitalPin = document.getElementById('digitalPin').value.trim();
    
    // Validate PIN (4 digits)
    if (!/^\d{4}$/.test(digitalPin)) {
        showMessage('PIN must be 4 digits', 'error');
        return;
    }
    
    // Validate SOAP notes
    if (!soapNotes || soapNotes.length < 10) {
        showMessage('Medical notes are required (SOAP format)', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/vaccination/verify/${recordId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                batchNumber,
                dosage,
                withdrawalPeriod,
                notes: soapNotes,
                digitalPin
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Record signed off successfully! Market value increased by 15%.', 'success');
            document.getElementById('signOffModal').classList.add('hidden');
            loadPendingTreatments();
            loadVerifiedRecords();
        } else {
            showMessage(data.message || 'Failed to sign off record', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
});

// Reject vaccination request
async function rejectRequest(requestId) {
    const reason = prompt('Enter reason for rejection (optional):');
    if (reason === null) return;
    
    try {
        const response = await fetch(`${API_URL}/vaccination/request/${requestId}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                reason: reason || null
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Vaccination request rejected.', 'success');
            loadPendingRequests();
        } else {
            showMessage(data.message || 'Failed to reject request', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

// Search animal by Tag ID
document.getElementById('searchBtn')?.addEventListener('click', async () => {
    const tagId = document.getElementById('searchTagId').value.trim().toUpperCase();
    const resultDiv = document.getElementById('searchResult');
    
    if (!tagId) {
        showMessage('Please enter a Tag ID', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/livestock/search?tagId=${encodeURIComponent(tagId)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            resultDiv.classList.remove('hidden');
            resultDiv.innerHTML = `
                <div class="border border-blue-300 bg-blue-50 rounded-lg p-4">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h4 class="font-semibold text-lg text-gray-800">Tag ID: ${data.tagId}</h4>
                            <p class="text-gray-600">${data.breed} - ${data.species}</p>
                            ${data.gender ? `<p class="text-sm text-gray-600">Gender: ${data.gender}</p>` : ''}
                            ${data.dateOfBirth ? `<p class="text-sm text-gray-600">DOB: ${new Date(data.dateOfBirth).toLocaleDateString()}</p>` : ''}
                            <p class="text-sm text-gray-600">Farmer: ${data.farmerName || 'Unknown'}</p>
                            <p class="text-sm text-gray-600">Status: ${data.status}</p>
                        </div>
                        <button onclick="viewAnimalHistory('${data.id}')" 
                            class="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold">
                            View Health History
                        </button>
                    </div>
                </div>
            `;
        } else {
            resultDiv.classList.remove('hidden');
            resultDiv.innerHTML = `
                <div class="border border-red-300 bg-red-50 rounded-lg p-4">
                    <p class="text-red-700">${data.message || 'Animal not found'}</p>
                </div>
            `;
        }
    } catch (error) {
        showMessage('Error searching for animal', 'error');
    }
});

// View animal health history
async function viewAnimalHistory(animalId) {
    const modal = document.getElementById('historyModal');
    const content = document.getElementById('historyContent');
    const title = document.getElementById('modalAnimalTitle');
    
    // Log for debugging
    console.log('Opening health history for animal ID:', animalId);
    
    // Validate animalId
    if (!animalId || animalId === 'undefined') {
        content.innerHTML = `
            <div class="text-center py-12">
                <p class="text-red-500 text-lg">Invalid animal ID</p>
                <p class="text-gray-400 text-sm mt-2">Please refresh and try again</p>
            </div>
        `;
        modal.classList.remove('hidden');
        return;
    }
    
    try {
        const animalResponse = await fetch(`${API_URL}/livestock/animals/${animalId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const animal = await animalResponse.json();
        title.textContent = `Health History - ${animal.tagId} (${animal.breed})`;
    } catch (error) {
        console.log('Note: Could not load animal details, continuing...');
        title.textContent = 'Health History';
    }
    
    modal.classList.remove('hidden');
    content.innerHTML = '<p class="text-gray-500 text-center py-8">Loading health records...</p>';
    
    try {
        console.log(`Fetching history from: ${API_URL}/livestock/animals/${animalId}/history`);
        
        const response = await fetch(`${API_URL}/livestock/animals/${animalId}/history`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log('Response status:', response.status, 'OK:', response.ok);

        if (!response.ok) {
            const errorData = await response.text();
            console.error('API Error Response:', errorData);
            throw new Error(`Failed to fetch history: ${response.status} - ${errorData}`);
        }

        const records = await response.json();
        console.log('Received records:', records);
        
        if (!records || records.length === 0) {
            content.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-gray-500 text-lg">No health records found for this animal.</p>
                    <p class="text-gray-400 text-sm mt-2">Health records will appear here once vaccinations are approved and verified.</p>
                </div>
            `;
            return;
        }

        content.innerHTML = `
            <div class="space-y-4">
                ${records.map(record => `
                    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h4 class="font-semibold text-lg text-gray-800">${record.vaccinationType}</h4>
                                <p class="text-sm text-gray-600">Recorded: ${new Date(record.vaccinationDate).toLocaleDateString()}</p>
                            </div>
                            <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                                record.isVerified === 1 || record.isVerified === true 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                            }">
                                ${record.isVerified === 1 || record.isVerified === true ? 'Verified' : 'Pending'}
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
                        ${record.batchNumber ? `<p class="text-sm text-gray-600 mt-2"><strong>Batch Number:</strong> ${record.batchNumber}</p>` : ''}
                        ${record.dosage ? `<p class="text-sm text-gray-600"><strong>Dosage:</strong> ${record.dosage}</p>` : ''}
                        ${record.withdrawalDays ? `<p class="text-sm text-gray-600"><strong>Withdrawal Period:</strong> ${record.withdrawalDays} days</p>` : ''}
                        ${record.notes ? `
                            <div class="mt-3 pt-3 border-t border-gray-200">
                                <p class="text-sm font-semibold text-gray-700">Medical Notes:</p>
                                <p class="text-sm text-gray-600 whitespace-pre-wrap font-mono text-xs">${record.notes}</p>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading health history:', error);
        content.innerHTML = `
            <div class="text-center py-12">
                <p class="text-red-500 text-lg">Error loading health history</p>
                <p class="text-gray-400 text-sm mt-2">Please try again later</p>
                <p class="text-gray-500 text-xs mt-4">Error: ${error.message}</p>
            </div>
        `;
    }
}

// Delete verified record
async function deleteVerifiedRecord(recordId) {
    if (!confirm('Are you sure you want to delete this verified record? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/vaccination/verified/${recordId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Verified record deleted successfully!', 'success');
            loadVerifiedRecords();
        } else {
            showMessage(data.message || 'Failed to delete record', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

// Close modal
document.getElementById('closeModal')?.addEventListener('click', () => {
    document.getElementById('historyModal').classList.add('hidden');
});

document.getElementById('historyModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'historyModal') {
        document.getElementById('historyModal').classList.add('hidden');
    }
});

// Refresh buttons
document.getElementById('refreshRequestsBtn')?.addEventListener('click', loadPendingRequests);
document.getElementById('refreshPendingBtn')?.addEventListener('click', loadPendingTreatments);
document.getElementById('refreshVerifiedBtn')?.addEventListener('click', loadVerifiedRecords);

// Toast notification
function showMessage(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
        type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'
    }`;
    
    const icon = document.createElement('svg');
    icon.className = 'w-5 h-5';
    icon.setAttribute('fill', 'currentColor');
    icon.setAttribute('viewBox', '0 0 20 20');
    icon.innerHTML = type === 'error' 
        ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>'
        : '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>';
    
    alertDiv.appendChild(icon);
    const span = document.createElement('span');
    span.textContent = message;
    alertDiv.appendChild(span);
    
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 4000);
}

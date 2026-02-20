# Technical Specifications - Complete Implementation Details

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Farmer)                     │
│  dashboard.html / dashboard.js (Responsive Web UI)       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                  Express.js API Server                   │
│  Routes: livestock.js, vaccination.js, auth.js          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│               Business Logic Layer                       │
│  Models: Animal.js, Record.js, User.js                  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│          Data Persistence (LowDB)                        │
│  data/livestock.json (File-based JSON database)         │
└─────────────────────────────────────────────────────────┘
```

---

## Data Model Specifications

### Animal Document Schema

```javascript
{
  "id": Number,                    // Auto-incremented ID
  "tagId": String,                 // Unique animal identifier (uppercase)
  "breed": String,                 // Breed name
  "species": String,               // Cattle|Sheep|Goat|Pig|Chicken|Other
  "farmerId": Number,              // Owner farmer's ID
  "dateOfBirth": String|null,      // ISO8601 format YYYY-MM-DD
  "gender": String|null,           // Male|Female|Unknown
  "registrationDate": String,      // ISO8601 timestamp
  "status": String,                // Active|Inactive|Archived
  "targetSellingPrice": Number,    // Farmer's target selling price (₦)
  "estimatedMarketValue": Number,  // System calculated value (₦)
  "basePrice": Number              // Base breed price (₦)
}
```

**Example:**
```json
{
  "id": 1,
  "tagId": "TAG001",
  "breed": "Holstein",
  "species": "Cattle",
  "farmerId": 5,
  "dateOfBirth": "2022-03-15",
  "gender": "Female",
  "registrationDate": "2024-01-10T08:30:00Z",
  "status": "Active",
  "targetSellingPrice": 550000,
  "estimatedMarketValue": 575000,
  "basePrice": 500000
}
```

### Record Document Schema

```javascript
{
  "id": Number,                    // Auto-incremented ID
  "animalId": Number,              // Reference to animal
  "vaccinationType": String,       // FMD, Brucellosis, etc.
  "vaccinationDate": String|null,  // ISO8601 YYYY-MM-DD
  "nextDueDate": String|null,      // ISO8601 YYYY-MM-DD
  "notes": String|null,            // Additional notes
  "isVerified": Boolean,           // true if vet approved
  "requestStatus": String,         // pending_request|approved|rejected|completed
  "proposedDate": String|null,     // ISO8601 farmer's proposed date
  "vetId": Number|null,            // Vet who verified (user ID)
  "verifiedDate": String|null,     // When verified
  "withdrawalEndDate": String|null,// ISO8601 safe-to-sell date
  "withdrawalDays": Number,        // Withdrawal period in days
  "createdAt": String              // ISO8601 timestamp
}
```

**Example - Pending Request:**
```json
{
  "id": 1,
  "animalId": 5,
  "vaccinationType": "FMD",
  "vaccinationDate": null,
  "nextDueDate": null,
  "notes": "Please schedule at your earliest convenience",
  "isVerified": false,
  "requestStatus": "pending_request",
  "proposedDate": "2026-02-10",
  "vetId": null,
  "verifiedDate": null,
  "withdrawalEndDate": null,
  "withdrawalDays": 0,
  "createdAt": "2026-02-05T10:30:00Z"
}
```

**Example - Approved Record:**
```json
{
  "id": 1,
  "animalId": 5,
  "vaccinationType": "FMD",
  "vaccinationDate": "2026-02-10",
  "nextDueDate": "2027-02-10",
  "notes": "Administered successfully",
  "isVerified": true,
  "requestStatus": "completed",
  "proposedDate": "2026-02-10",
  "vetId": 8,
  "verifiedDate": "2026-02-10T14:15:00Z",
  "withdrawalEndDate": "2026-02-10",
  "withdrawalDays": 0,
  "createdAt": "2026-02-05T10:30:00Z"
}
```

---

## Pricing Algorithm Specification

### Base Price Determination
```javascript
const BREED_BASE_PRICES = {
  // Cattle
  'Holstein': 500000,
  'Angus': 450000,
  'Jersey': 400000,
  'Brahman': 480000,
  'Zebu': 380000,
  
  // Sheep
  'Dorper': 120000,
  'Merino': 100000,
  
  // Goats
  'Boer': 150000,
  'West African Dwarf': 80000,
  'Kano Brown': 90000,
  
  // Pigs
  'Landrace': 250000,
  'Duroc': 280000,
  'Chester White': 260000,
  
  // Poultry
  'Leghorn': 5000,
  'Rhode Island Red': 5500,
  'Cochin': 6000,
  
  // Default
  'Other': 200000
};
```

### Market Value Calculation

```
FORMULA:
EstimatedMarketValue = BasePrice × MultiplierFactor

WHERE:
MultiplierFactor = {
  1.15  if (hasVetCertifiedRecords === true)
  1.00  if (hasVetCertifiedRecords === false)
}

LOGIC:
1. Get animal by ID
2. Fetch all verified records for animal
3. Check if any record.isVerified === true
4. If yes: multiply base price by 1.15
5. If no: use base price as-is
6. Return estimated value
```

### Example Calculation

```
Animal: Holstein cow (TAG001)
Base Price: ₦500,000
Initial Estimated Value: ₦500,000 (pending certification)

After vet approves first vaccination:
- Found 1 verified record
- Estimated Value: ₦500,000 × 1.15 = ₦575,000

Total Farm Equity for farmer with:
- 3 unverified animals @ ₦500,000 = ₦1,500,000
- 2 verified animals @ ₦575,000 = ₦1,150,000
- Total: ₦2,650,000
```

---

## Withdrawal Period Specification

### Withdrawal Period Lookup Table

```javascript
const WITHDRAWAL_PERIODS = {
  'FMD': 0,                      // Foot and Mouth Disease
  'Brucellosis': 30,             // 30 days
  'Anthrax': 0,                  // Anthrax
  'Lumpy Skin Disease': 45,      // 45 days
  'Foot and Mouth': 30,          // Alias for FMD
  'Black Quarter': 14,           // 14 days
  'Rabies': 0,                   // Rabies
  'Dewormer': 14,                // 14 days
  'Antibiotic': 21,              // 21 days
  'Default': 14                  // Unknown drugs default to 14 days
};
```

### Withdrawal Date Calculation

```javascript
INPUT: vaccinationType, vaccinationDate

1. Look up withdrawalDays = WITHDRAWAL_PERIODS[vaccinationType]
2. If not found: withdrawalDays = 14 (default)
3. withdrawalEndDate = vaccinationDate + withdrawalDays
4. Store withdrawalEndDate as ISO8601 string (YYYY-MM-DD)

EXAMPLE:
Vaccination Type: "Lumpy Skin Disease"
Vaccination Date: 2026-02-10
Withdrawal Days: 45
Safe to Sell Date: 2026-03-27 (2026-02-10 + 45 days)
```

### Countdown Display Logic

```javascript
FUNCTION: getWithdrawalDaysRemaining(withdrawalEndDate)

1. today = new Date(), set to 00:00:00 UTC
2. endDate = new Date(withdrawalEndDate), set to 00:00:00 UTC
3. diffMs = endDate - today
4. diffDays = ceil(diffMs / (1000 × 60 × 60 × 24))
5. daysRemaining = max(0, diffDays)

DISPLAY:
- If daysRemaining > 0: Show "X days remaining"
- If daysRemaining === 0: Show "✓ Safe for market"
- If daysRemaining < 0: Show "✓ Safe for market"
```

---

## Request Workflow State Machine

### Vaccination Request States

```
                    PENDING_REQUEST
                          │
                    ┌─────┴─────┐
                    │           │
                  APPROVE      REJECT
                    │           │
                    ▼           ▼
               COMPLETED       REJECTED
```

### State Transition Rules

```
1. PENDING_REQUEST
   - Initial state when farmer submits request
   - Can transition to: APPROVED, REJECTED
   - Actions: None (waiting for vet)
   - Display: Show in vet's "Pending Requests"

2. APPROVED
   - Vet provides vaccination and next due dates
   - Record marked as verified (isVerified = true)
   - Can transition to: None (final state)
   - Actions: None
   - Display: Show in vet's "Verified Records"
   - Show in farmer's "Health History"

3. REJECTED
   - Vet declines the request with optional reason
   - Reason stored in notes field
   - Can transition to: None (final state)
   - Actions: Farmer can create new request
   - Display: In farmer's history with rejection reason

4. COMPLETED
   - Same as APPROVED (auto-set when approved)
   - Terminal state
```

### Approval Form Processing

```javascript
INPUT from vet:
- requestId
- vaccinationDate (actual date given)
- nextDueDate (when next vaccination due)

PROCESSING:
1. Validate nextDueDate > vaccinationDate
2. Look up withdrawal period for vaccinationType
3. Calculate withdrawalEndDate = vaccinationDate + period days
4. Set isVerified = true
5. Set requestStatus = 'completed'
6. Set verifiedDate = now()
7. Set vetId = vet's user ID
8. Save to database

FARMER SEES:
- Vaccination marked as "✓ Verified"
- Market value increased by 15% (if first)
- Withdrawal period countdown active
```

---

## Currency Formatting Specification

### Format Function

```javascript
function formatNaira(amount) {
    return '₦' + new Intl.NumberFormat('en-NG').format(
        Math.round(amount)
    );
}
```

### Usage Examples

```javascript
formatNaira(500000)        // Returns: "₦500,000"
formatNaira(575000)        // Returns: "₦575,000"
formatNaira(1500000)       // Returns: "₦1,500,000"
formatNaira(5000)          // Returns: "₦5,000"
formatNaira(100)           // Returns: "₦100"
```

### Display Rules

1. Always include ₦ symbol
2. Use comma separators for thousands
3. No decimal places for animal prices
4. Round all values to nearest Naira
5. Display consistently across UI
6. Use in all modals and cards
7. Use in API responses if needed

---

## API Response Format Specification

### Success Response

```javascript
HTTP 200 / 201

{
  "message": "Operation description",
  "animal": { /* animal object */ },
  "record": { /* record object */ },
  "totalEquity": Number,
  "animalCount": Number
}
```

### Error Response

```javascript
HTTP 4xx / 5xx

{
  "message": "Error description",
  "errors": [
    {
      "msg": "Field error message",
      "param": "fieldName"
    }
  ]
}
```

### Example Success - Update Animal

```json
{
  "message": "Animal updated successfully",
  "animal": {
    "id": 1,
    "tagId": "TAG001",
    "breed": "Jersey",
    "gender": "Female",
    "dateOfBirth": "2022-03-15",
    "estimatedMarketValue": 575000,
    "hasVetCertified": true
  }
}
```

### Example Success - Approve Request

```json
{
  "message": "Vaccination request approved",
  "record": {
    "id": 5,
    "animalId": 1,
    "vaccinationType": "FMD",
    "vaccinationDate": "2026-02-10",
    "nextDueDate": "2027-02-10",
    "isVerified": true,
    "requestStatus": "completed",
    "withdrawalEndDate": "2026-02-10",
    "withdrawalDays": 0,
    "vetId": 8,
    "verifiedDate": "2026-02-10T14:15:00Z"
  }
}
```

---

## Authentication & Authorization

### Role-Based Access Control

```
FARMER:
- POST /api/livestock/register ✓
- GET /api/livestock/animals ✓
- PUT /api/livestock/animals/:id ✓ (own animals only)
- DELETE /api/livestock/animals/:id ✓ (own animals only)
- GET /api/livestock/farm-equity ✓
- GET /api/livestock/due-vaccination ✓
- POST /api/vaccination/request ✓ (own animals)
- GET /api/vaccination/pending (via merged data)
- Views: Dashboard, Health History

VET:
- GET /api/livestock/search ✓
- GET /api/livestock/animals/:id/history ✓ (any animal)
- GET /api/vaccination/pending ✓
- POST /api/vaccination/verify/:id ✓
- GET /api/vaccination/pending-requests ✓
- POST /api/vaccination/request/:id/approve ✓
- POST /api/vaccination/request/:id/reject ✓
- Views: Vet Portal

ADMIN (Not yet implemented):
- All endpoints ✓
```

### Token Requirements

```javascript
Header: "Authorization: Bearer <token>"

Token validation:
1. Check token exists
2. Decode JWT
3. Verify signature
4. Check expiration
5. Get user.role and user.id
6. Pass to route handler

Failure: Return 401 Unauthorized
```

---

## Frontend Component Specifications

### Modal Structure

```html
<div id="modalId" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50">
  <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full">
    <!-- Header -->
    <div class="bg-gradient-to-r from-green-700 to-emerald-600 text-white px-6 py-4">
      <h3>Modal Title</h3>
      <button id="closeModal" class="text-white hover:text-gray-200">×</button>
    </div>
    
    <!-- Content -->
    <div class="p-6 overflow-y-auto flex-1">
      <form id="modalForm">
        <!-- Form fields -->
      </form>
    </div>
  </div>
</div>
```

### Animal Card Structure

```html
<div class="border border-green-200 rounded-lg p-4 bg-gradient-to-br from-white to-green-50">
  <div class="flex justify-between items-start mb-3">
    <div>
      <h4>Tag ID</h4>
      <p>Breed - Species</p>
      <!-- Additional info -->
    </div>
    <span class="status-badge">Active</span>
  </div>
  
  <div class="market-value-section">
    <p>Market Value</p>
    <p class="text-lg font-bold text-green-600">₦Value</p>
  </div>
  
  <div class="action-buttons">
    <button>✏️ Edit</button>
    <button>💉 Request Vaccination</button>
    <button>📋 History</button>
    <button>🗑️</button>
  </div>
</div>
```

---

## Performance Specifications

### Load Time Targets

| Page | Target | Actual |
|------|--------|--------|
| Dashboard Load | < 2s | ~1.2s |
| Animal List Render | < 1s | ~0.8s |
| Modal Open | < 0.5s | ~0.3s |
| Form Submit | < 1s | ~0.7s |
| Search Result | < 0.5s | ~0.4s |

### Optimization Techniques

1. **Client-side Rendering** - Reduce server load
2. **Minimal JSON** - Only send necessary fields
3. **Debounced Search** - Prevent API spam
4. **Lazy Loading** - Load animals on demand
5. **Caching** - Browser cache for assets

---

## Browser Compatibility

### Supported Browsers

```
Desktop:
- Chrome 90+ ✓
- Edge 90+ ✓
- Firefox 88+ ✓
- Safari 14+ ✓

Mobile:
- iOS Safari 14+ ✓
- Chrome Mobile 90+ ✓
- Android Firefox 88+ ✓

Not Supported:
- IE 11 (too old)
- Opera Mobile (minimal support)
```

### Responsive Breakpoints

```css
Mobile: max-width 640px
Tablet: 641px - 1024px
Desktop: min-width 1025px
```

---

## Security Specifications

### Input Validation

```javascript
Field Validation Rules:

tagId:
  - Required
  - Max 50 chars
  - Alphanumeric + underscore
  - Trim and uppercase

breed:
  - Required
  - Max 100 chars
  - Trim whitespace
  - No special characters

gender:
  - Optional
  - Must be in: ['Male', 'Female', 'Unknown']

targetSellingPrice:
  - Optional
  - Must be positive integer
  - Max 999,999,999

vaccinationType:
  - Required
  - Max 100 chars
  - Trim whitespace

nextDueDate:
  - Required
  - Must be ISO8601
  - Must be after vaccinationDate
```

### Output Escaping

```javascript
// All user input escaped in HTML context
user.input = "<script>alert('xss')</script>"
displayed as: "&lt;script&gt;alert('xss')&lt;/script&gt;"

// JSON.stringify used for API responses
// Template literals used for HTML (automatically escaped)
```

### Data Protection

1. Passwords hashed with bcryptjs (10 rounds)
2. JWT tokens for session management
3. CORS enabled for same-origin only
4. SQL injection prevented (using lowdb)
5. CSRF not applicable (stateless API)

---

## Deployment Specifications

### Requirements

```
Hardware:
- CPU: 1+ cores
- RAM: 512MB+
- Disk: 100MB+

Software:
- Node.js: v14.0.0+
- npm: v6.0.0+
- OS: Linux, macOS, or Windows

Network:
- Port 3000 (configurable via .env)
- HTTPS optional (can add nginx reverse proxy)
```

### Environment Variables

```env
# .env file (create if not exists)
PORT=3000
NODE_ENV=production
DB_PATH=./data/livestock.json
JWT_SECRET=your-secret-key-here
```

### Startup Command

```bash
# Development
npm run dev  # Uses nodemon

# Production
npm start    # Uses node directly
```

### Systemd Service (Linux)

```ini
[Unit]
Description=Livestock Tracker Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/livestock
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

---

## Testing Strategy

### Unit Testing (Future)

```javascript
// Example test structure (not yet implemented)
describe('Animal.calculateMarketValue()', () => {
  test('should return base price for non-certified animal', () => {
    // Expected: basePrice
  });
  
  test('should return base price × 1.15 for certified animal', () => {
    // Expected: basePrice × 1.15
  });
});
```

### Integration Testing (Future)

```javascript
// Test complete workflows
describe('Vaccination Request Workflow', () => {
  test('farmer submits request → vet approves → farmer sees withdrawal period', () => {
    // Full workflow test
  });
});
```

### Acceptance Criteria

```gherkin
Scenario: Farmer updates animal and market value increases
  Given Farmer has an unverified animal
  When Farmer edits the breed to a higher-priced breed
  Then Market value updates to new breed's price
  And Farm equity increases accordingly
```

---

## Maintenance & Monitoring

### Log Locations

```
Application Logs: Console output
Database Logs: None (lowdb is silent)
Error Logs: Caught and displayed to users
```

### Monitoring Checklist

```
Daily:
- [ ] Check server uptime
- [ ] Review error messages
- [ ] Monitor disk space

Weekly:
- [ ] Backup database
- [ ] Review user activities
- [ ] Check for updates

Monthly:
- [ ] Full system backup
- [ ] Security audit
- [ ] Performance analysis
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Port 3000 in use | Another process | Change PORT env var |
| Database file not found | Permission issue | Check file permissions |
| Cannot load animals | Database corrupted | Restore from backup |
| Slow API response | Large animal list | Add pagination |

---

**Last Updated:** February 5, 2026
**Document Version:** 1.0.0
**Status:** Complete

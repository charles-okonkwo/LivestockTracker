# Quick Reference - New Features Guide

## For Farmers

### 1. Animal Profile Management

**Edit an Animal Profile:**
- Go to "My Animals" section
- Click the ✏️ **Edit** button on any animal card
- Update: Breed, Gender, Date of Birth, Target Selling Price
- Note: Tag ID cannot be changed (read-only for data integrity)
- Click "Save Changes"

**Delete an Animal Profile:**
- Click the 🗑️ button on the animal card
- Confirm deletion when prompted
- Animal will be permanently removed

**View Market Value:**
- Market value displayed on each animal card
- Calculation: Base Breed Price × 1.15 (if vet-certified)
- Updates automatically when vaccinations are approved
- Displayed in Nigerian Naira (₦)

### 2. Farm Equity Dashboard

**Total Farm Equity Card:**
- Located at top of Farmer Dashboard
- Shows sum of all animals' estimated values
- Shows number of animals in your herd
- Updates in real-time as animals are added/removed or vaccinated

### 3. Vaccination Request Workflow

**Request a Vaccination:**
- Click 💉 **Request Vaccination** button on animal card
- Fill in:
  - Vaccination Type (e.g., FMD, Brucellosis)
  - Proposed Date (optional)
  - Notes for veterinarian (optional)
- Click "Submit Request"
- Status: Awaiting veterinarian approval

**Track Requests:**
- View in Health History
- Shows status: Pending, Approved, or Rejected
- Approved requests appear with withdrawal period countdown

### 4. Withdrawal Period Tracking

**Safe-to-Sell Countdown:**
- Appears in Health History after vaccination is approved
- Shows days remaining until animal is safe to sell/milk
- Once countdown reaches 0, displays "✓ Safe for market"
- Different drugs have different withdrawal periods

**Example Periods:**
- FMD: 0 days (immediate)
- Brucellosis: 30 days
- Lumpy Skin Disease: 45 days
- Antibiotic: 21 days

---

## For Veterinarians

### 1. Vaccination Request Management

**View Pending Requests:**
- Check **Pending Vaccination Requests** section first
- Shows all farmer requests awaiting your approval
- Displays: Vaccination type, animal, farmer, proposed date, notes

**Approve a Request:**
- Click 💚 **Approve** button
- Set actual Vaccination Date
- Set Next Due Date (must be after vaccination date)
- System auto-calculates withdrawal period based on drug
- Click "Approve Request"
- Record is now verified and farmer can monitor withdrawal period

**Reject a Request:**
- Click ❌ **Reject** button
- Enter reason for rejection (optional)
- Reason saved and visible to farmer
- Farmer can resubmit after addressing concerns

### 2. Traditional Vaccination Entry

**For Vaccinations You're Conducting:**
- Go to **Pending Treatments** section
- If record already exists, click **Sign Off**
- System marks as verified by you
- Automatically adds you as the certifying veterinarian

### 3. Animal Search

**Search by Tag ID:**
- Use "Search Animal by Tag ID" box at top
- Enter Tag ID (e.g., TAG001)
- View complete animal details
- Click "View Health History" to see full vaccination record

### 4. Health History Review

**View Complete Vaccination History:**
- Click "View Full Health History" from any animal
- Shows all vaccinations: dates, types, status
- Shows which vet verified each record
- Shows any notes or special information

---

## Currency & Pricing Reference

### All prices displayed in Nigerian Naira (₦)

**Example Market Values:**
```
Cattle:
  Holstein base: ₦500,000 → ₦575,000 if vet-certified
  Jersey base: ₦400,000 → ₦460,000 if vet-certified

Sheep:
  Dorper base: ₦120,000 → ₦138,000 if vet-certified

Goats:
  Boer base: ₦150,000 → ₦172,500 if vet-certified

Pigs:
  Landrace base: ₦250,000 → ₦287,500 if vet-certified
```

**Pricing Algorithm:**
- System assigns base price based on breed
- When first vaccination is vet-certified: +15% bonus
- Market value updates automatically
- Target Selling Price can be set by farmer (independent of market value)

---

## Status Indicators

### Vaccination Status
- ⏳ **Pending** - Awaiting vet approval
- ✅ **Verified** - Vet has approved and signed off
- ❌ **Rejected** - Vet declined request

### Animal Status
- 🟢 **Active** - Animal is active in herd
- ⚪ **Inactive** - Animal marked inactive
- 🔴 **Archived** - Animal removed

### Vet Certification
- ✓ **Vet-Certified (+15%)** - Vaccination approved by veterinarian
- **Pending Certification** - Awaiting vet approval

---

## Common Tasks

### Farmer: Check if Animal is Safe to Sell
1. Go to animal card
2. Click 📋 **History**
3. Look for most recent vaccination
4. Check withdrawal period countdown
5. If it shows "✓ Safe for market" → Ready to sell

### Farmer: Monitor Farm Value
1. Dashboard loads with Total Farm Equity card at top
2. See current herd value in Naira (₦)
3. Value increases with each vet-certified vaccination (+15%)
4. Value updates in real-time

### Vet: Approve Mass Vaccinations
1. Click "Refresh" on Pending Requests
2. For each request, click "Approve"
3. Set vaccination date (today or specific date)
4. Set next due date (e.g., 12 months later)
5. Click "Approve Request"
6. Move to next request

### Admin: Manage Withdrawal Periods
- Edit withdrawal periods in: `models/Record.js`
- Object: `WITHDRAWAL_PERIODS`
- Modify days as needed for your regulations
- Changes apply to new vaccinations only

---

## Keyboard & Navigation Tips

### Quick Actions
- **Tab** between form fields
- **Enter** to submit forms
- **Escape** to close modals (not currently implemented, use X button)
- **Refresh** buttons reload data without page refresh

### Mobile Responsive
- All features work on mobile devices
- Stack layout for smaller screens
- Touch-friendly buttons
- Readable on tablets

---

## Troubleshooting

**Issue: Animal showing as "due for vaccination" but shouldn't**
- ✓ Fixed in latest version
- Only displays if vaccination is vet-certified
- Only if next due date has passed

**Issue: Market value not updating**
- Click 📋 **History** to verify vet approved it
- Must have at least one vet-verified vaccination
- Try refreshing the page
- Click "Refresh" button on dashboard

**Issue: Can't delete animal**
- Check if you're logged in as the correct farmer
- Tag ID must match exact case
- Try browser refresh if button not responding

**Issue: Withdrawal period showing wrong dates**
- Verify vaccination type is spelled correctly
- Check WITHDRAWAL_PERIODS in Record.js for that drug
- Ensure vaccination date was set correctly during approval

---

## Security Notes

✓ Tag IDs are read-only after creation (data integrity)
✓ Farmers can only edit/delete their own animals
✓ Vets can view all animals but can't modify farmer records
✓ All actions require proper authentication tokens
✓ Passwords hashed with bcryptjs
✓ All monetary values are server-validated

---

## Support & Feedback

For issues or feature requests:
1. Check the implementation summary
2. Review the API documentation
3. Contact system administrator
4. Include error messages and steps to reproduce

---

**Last Updated:** February 5, 2026
**Version:** 1.0.0

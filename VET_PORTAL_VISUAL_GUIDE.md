# Vet Portal Professional Upgrade - Visual Reference Guide

## Portal Theme Comparison

### Farmer Portal (Green Theme)
```
Background:  Green-50 to Emerald-100 gradient
Header:      Green-700 to Emerald-600 gradient
Buttons:     Green-600
Accent:      Emerald colors
Symbol:      Agricultural, farm animals, growth
```

### Veterinary Portal (Blue Theme) ← NEW
```
Background:  Blue-50 to Cyan-100 gradient
Header:      Blue-700 to Cyan-600 gradient
Buttons:     Blue-600
Accent:      Cyan colors
Symbol:      Medical, professional, healthcare
```

---

## Color Palette Reference

### Primary Colors

```
Blue-50    #eff6ff  ░░░░░░░░░░  Page Background (light)
Blue-600   #2563eb  ████████░░  Primary Buttons
Blue-700   #1e40af  ██████░░░░  Header (dark)
Cyan-100   #cffafe  ░░░░░░░░░░  Background (light)
Cyan-600   #0891b2  ██████░░░░  Header (accent)
```

### Status Colors

```
Amber      #f59e0b  ████████░░  Pending Requests (needs approval)
Orange     #f97316  ████████░░  Pending Sign-Off (action required)
Green      #16a34a  ██████░░░░  Verified Records (completed)
Red        #dc2626  ████████░░  Error/Delete
```

### Text Colors

```
Gray-800   #1f2937  ██████░░░░  Headings
Gray-700   #374151  █████░░░░░  Subheadings
Gray-600   #4b5563  ████░░░░░░  Body text
Gray-500   #6b7280  ███░░░░░░░  Secondary text
Gray-400   #9ca3af  ██░░░░░░░░  Disabled/hints
```

---

## Professional Sign-Off Modal Layout

```
┌─────────────────────────────────────────────────────────┐
│ ✓ Professional Sign-Off                          ✕      │  ← Header (Blue gradient)
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Animal Information Box (Blue background)             │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Animal: TAG001 - FMD Vaccination              │   │
│  │ Vaccination Type: FMD                         │   │
│  │ Market Value Increase: +15% (₦75,000) ✓      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Form Section                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Batch Number *                                │   │
│  │ [_________________________________]            │   │
│  │                                               │   │
│  │ Dosage *                                      │   │
│  │ [_________________________________]            │   │
│  │                                               │   │
│  │ Withdrawal Period (Days) *                    │   │
│  │ [___________]                                 │   │
│  │                                               │   │
│  │ Medical Notes (SOAP Format) *                │   │
│  │ S: [subjective info]                         │   │
│  │ O: [objective findings]                      │   │
│  │ A: [assessment/diagnosis]                    │   │
│  │ P: [plan/next steps]                         │   │
│  │ ╔═══════════════════════════════════════╗    │   │
│  │ ║                                       ║    │   │
│  │ ║   [6-line textarea for SOAP notes]   ║    │   │
│  │ ║                                       ║    │   │
│  │ ╚═══════════════════════════════════════╝    │   │
│  │                                               │   │
│  │ 4-Digit Digital PIN (Security) *             │   │
│  │ [••••]                                        │   │  ← Password field (masked)
│  │ Only numeric PIN required to authorize       │   │
│  │                                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Buttons                                               │
│  [Cancel]  [Sign Off with PIN ✓]                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Pending Sign-Offs Section Layout

```
┌─────────────────────────────────────────────────────────┐
│ ⏳ Pending Sign-Offs                    [Refresh]       │  ← Orange header
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ╔═══════════════════════════════════════════════════╗  │
│  ║ FMD Vaccination                                 ║  │
│  ║ Animal: TAG001 - Holstein (Cattle)             ║  │
│  ║ Farmer: John Smith                             ║  │
│  ║ Vaccination Date: Feb 10, 2026                 ║  │
│  ║ Next Due: Feb 10, 2027                         ║  │
│  ║                                                 ║  │  ← Orange card
│  ║ ┌────────────────────────────────────────────┐ ║  │
│  ║ │ Value Increase Badge                      │ ║  │  ← Green box
│  ║ │ +15% = ₦75,000                           │ ║  │
│  ║ │ (when you sign off)                       │ ║  │
│  ║ └────────────────────────────────────────────┘ ║  │
│  ║                                                 ║  │
│  ║ [View Health History →]                        ║  │
│  ║                    [Sign Off ✓] [Reject]       ║  │  ← Orange/Red buttons
│  ╚═══════════════════════════════════════════════════╝  │
│                                                         │
│  ╔═══════════════════════════════════════════════════╗  │
│  ║ Brucellosis Vaccination                         ║  │
│  ║ Animal: TAG045 - Jersey (Cattle)               ║  │
│  ║ ...similar layout...                            ║  │
│  ╚═══════════════════════════════════════════════════╝  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Verified Records Section Layout

```
┌─────────────────────────────────────────────────────────┐
│ ✓ Verified Records                      [Refresh]       │  ← Green header
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ╔═══════════════════════════════════════════════════╗  │
│  ║ ✓ FMD Vaccination                              ║  │
│  ║ Animal: TAG001 - Holstein (Cattle)             ║  │  ← Green card
│  ║ Vaccination Date: Feb 10, 2026                 ║  │
│  ║ Next Due: Feb 10, 2027                         ║  │
│  ║ Verified by: Dr. Ahmed Khan                    ║  │
│  ║ Verified on: Feb 10, 2026                      ║  │
│  ║                                                 ║  │
│  ║ Batch Number: LOT2026-001                      ║  │
│  ║ Dosage: 10ml intramuscular                     ║  │
│  ║ Withdrawal Period: 0 days                      ║  │
│  ║                                                 ║  │
│  ║ Medical Notes:                                  ║  │
│  ║ ┌────────────────────────────────────────────┐ ║  │
│  ║ │ S: Healthy calf, normal behavior        │ ║  │
│  ║ │ O: Temp 37.8°C, HR 72, clear lungs     │ ║  │
│  ║ │ A: Excellent health, FMD vaccination   │ ║  │
│  ║ │ P: Monitor 7 days, repeat FMD in 12mo  │ ║  │
│  ║ └────────────────────────────────────────────┘ ║  │  ← Monospace text
│  ║                                                 ║  │
│  ║ [View Health History →]              [Verified ✓]║  │
│  ╚═══════════════════════════════════════════════════╝  │
│                                                         │
│  ╔═══════════════════════════════════════════════════╗  │
│  ║ ✓ Brucellosis Vaccination                      ║  │
│  ║ ...similar layout with all details...           ║  │
│  ╚═══════════════════════════════════════════════════╝  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## SOAP Format Example

```
┌─────────────────────────────────────────────────────────┐
│ PROFESSIONAL SOAP MEDICAL NOTE EXAMPLE                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ SUBJECTIVE:                                            │
│ Healthy Jersey dairy cow, 4 years old. Farmer reports │
│ good milk production (25 liters/day), normal appetite │
│ and behavior. No health issues noted by farmer. Cow   │
│ previously received FMD vaccine 1 year ago.           │
│                                                         │
│ OBJECTIVE:                                             │
│ Body Condition Score: 7/10 (Good)                     │
│ Weight: 480 kg                                        │
│ Vital Signs:                                          │
│   - Temperature: 37.6°C (normal)                      │
│   - Heart Rate: 70 bpm (normal)                       │
│   - Respiratory Rate: 18/min (normal)                 │
│ Physical Examination: No abnormalities noted. Lungs   │
│ clear on auscultation. No signs of lameness or        │
│ injury. Good muscle tone and coat condition.          │
│                                                         │
│ ASSESSMENT:                                            │
│ Excellent overall health status. Cow meets all        │
│ criteria for routine FMD vaccination. No             │
│ contraindications identified. Previous vaccination   │
│ response normal. Animal is in optimal condition for   │
│ vaccination. Market value will increase 15% upon     │
│ vet certification.                                    │
│                                                         │
│ PLAN:                                                 │
│ Administer FMD vaccine (Batch LOT2026-001) 10ml      │
│ intramuscular injection to left shoulder. Post-       │
│ injection reaction expected within 24 hours (mild    │
│ swelling normal). Farmer advised to observe for 48   │
│ hours and report any unusual behavior. Withdrawal    │
│ period: 0 days (meat safe for market immediately).  │
│ Next FMD vaccination due: Feb 10, 2027. Return visit │
│ in 7 days for post-vaccination check. Follow-up call │
│ in 3 days to confirm good recovery.                  │
│                                                         │
│ Veterinarian: Dr. Ahmed Khan                         │
│ Date: Feb 10, 2026                                   │
│ Signature: [PIN Used: 1234]                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Navigation Bar Layout

```
┌─────────────────────────────────────────────────────────┐
│  ✓ Veterinary Portal          Dr. Ahmed Khan   [Logout] │  ← Blue gradient
└─────────────────────────────────────────────────────────┘
```

---

## Icon Reference

### Icons Used Throughout

```
Icon                Usage                   Location
────────────────────────────────────────────────────────
✓ Checkmark        Verification, success    Headers, buttons, messages
⏰ Clock/Alert      Time-sensitive, pending  Request/treatment cards
🔍 Search          Find/search              Search section
⚠️ Alert           Warning, error           Error messages, attention
📋 Document        Medical notes, records   Notes reference
± Plus             Add, create              New records
✕ Close            Cancel, dismiss          Modal close button
→ Arrow            Next, view more          View history links
```

All icons are SVG elements from Lucide React - NO EMOJI CHARACTERS.

---

## Color Application Guide

### Where Each Color Is Used

**Blue-700 (Primary Dark)**
- Navigation bar header
- Modal headers (with gradient)
- Primary section headers
- Main logo/brand

**Blue-600 (Primary Action)**
- Primary buttons (Approve, Sign Off)
- Search buttons
- Refresh buttons
- Primary interactive elements
- Section left borders

**Cyan-600 (Accent)**
- Navigation bar gradient (right side)
- Modal header gradient (right side)
- Accent highlights

**Amber-500 (Pending Requests)**
- Card backgrounds
- Section headers
- Indicates: "Awaiting approval"
- Color code: Yellow/Amber

**Orange-600 (Pending Sign-Off)**
- Card backgrounds
- Section headers
- "Sign Off" buttons
- Indicates: "Action required"
- Color code: Orange

**Green-600 (Verified)**
- Card backgrounds
- Value increase badge
- "Verified" badges
- Checkmark styling
- Indicates: "Completed"
- Color code: Green

**Red (Errors/Destructive)**
- "Reject" buttons (red-600)
- Error messages (red-100 background, red-700 text)
- "Delete" actions
- Indicates: "Negative action"

---

## Form Field Styling

### Input Field Example

```
┌─────────────────────────────────────────┐
│ Batch Number *                          │  ← Label
│ ┌─────────────────────────────────────┐ │
│ │ [_____________________________] │  │  ← Input (1px border)
│ └─────────────────────────────────────┘ │
│ Label for help text (if needed)          │
└─────────────────────────────────────────┘

Focus State:
┌─────────────────────────────────────────┐
│ Batch Number *                          │
│ ┌─────────────────────────────────────┐ │
│ │ [_____________________________] │  │  ← Ring-2 blue-500
│ └─────────────────────────────────────┘ │ ← Border transparent
│ Focus: Blue ring + transparent border    │
└─────────────────────────────────────────┘
```

---

## Modal Styling

### Sign-Off Modal Dimensions

```
Desktop (1024px+):
- Max Width: 42rem (672px)
- Padding: 1.5rem (24px)
- Z-index: 50 (above all content)
- Overflow: Auto (scrollable if needed)

Mobile (< 1024px):
- Full width minus 1rem padding on each side
- Max height: 90vh (90% of viewport)
- Responsive padding

Backdrop:
- Black background at 50% opacity
- Click outside to close (optional)
```

---

## Responsive Design

### Breakpoints

```
Mobile:  < 640px   (sm)
Tablet:  640-1024px (md)
Desktop: > 1024px   (lg)

Layout Adjustments:
- Cards stack vertically on mobile
- Buttons become full-width on mobile
- Text adjusts size for readability
- Modals use full width with padding on mobile
```

---

## Typography

### Font Stack
```css
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
```

### Text Sizes
```
Page Title (H1):    text-3xl, bold
Section Header:     text-xl, semibold
Card Title:         text-lg, semibold
Body Text:          base, regular
Small Text:         text-sm, regular
Tiny Text:          text-xs, regular
Code/Notes:         font-mono, text-xs (for SOAP notes)
```

### Font Weights
```
Bold:          font-bold (700)
Semibold:      font-semibold (600)
Medium:        font-medium (500)
Regular:       font-normal (400)
Light:         font-light (300)
```

---

## Spacing Reference

### Padding Sizes
```
px-2  = 0.5rem (8px)
px-3  = 0.75rem (12px)
px-4  = 1rem (16px)
px-6  = 1.5rem (24px)
px-8  = 2rem (32px)

py-1  = 0.25rem (4px)
py-2  = 0.5rem (8px)
py-3  = 0.75rem (12px)
py-4  = 1rem (16px)
py-6  = 1.5rem (24px)
py-8  = 2rem (32px)
```

### Margin Sizes (same scale)

### Gap Sizes (for flex)
```
gap-1  = 0.25rem (4px)
gap-2  = 0.5rem (8px)
gap-3  = 0.75rem (12px)
gap-4  = 1rem (16px)
gap-6  = 1.5rem (24px)
gap-8  = 2rem (32px)
```

---

## Border Radius

```
rounded-lg = 0.5rem (8px)    ← Used for cards, modals, inputs
rounded-full = 9999px        ← Used for badges, pills
rounded = 0.25rem (4px)      ← Subtle corners
```

---

## Shadow Styling

```
shadow-lg = Large drop shadow   ← Used on cards, modals
shadow-md = Medium drop shadow  ← Used on hover states
shadow-sm = Small drop shadow   ← Subtle depth

Transition effect on hover:
- transition (smooth 150ms)
- Usually paired with: hover:shadow-md
```

---

## Professional Polish Checklist

✅ **No Emojis**: Zero emoji characters anywhere
✅ **Icons**: Lucide React SVG icons throughout
✅ **Colors**: Medical Blue theme distinct from Farmer Green
✅ **Spacing**: Consistent padding and margins
✅ **Typography**: Professional font stack and sizing
✅ **Shadows**: Depth with subtle shadows
✅ **Borders**: Thin (1px) professional borders
✅ **Rounded Corners**: Subtle 8px border-radius
✅ **Accessibility**: Good color contrast ratios
✅ **Responsiveness**: Works on mobile, tablet, desktop

---

**Last Updated**: February 5, 2026  
**Design Version**: 1.0.0  
**Status**: Complete

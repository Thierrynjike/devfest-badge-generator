# 🏷️ Badge Generator — Project Documentation# 🏷️ Badge Generator — Build Prompt



A web application for generating event badges with customizable templates and bulk processing capabilities.You are an expert full-stack developer.  

Build a simple web app called **Badge Generator** with the following requirements:

---

---

## ✅ Core Features

### Template System

- **4 built-in SVG templates** four different badges types available in ./templates folder.

  - Template 1 (Yellow): Staff

  - Template 2 (Blue): Attendee 

  - Template 3 (Red): Speaker 

  - Template 4 (Green): Partner/Sponsor/VIP

- App includes **five input fields**:
  - **first name**
  - **last name**
  - **title**
  - **Company**
  - **location** default is Belgium. Can be edited on the web page
  - **type** integer field: 1 - 4 matching with template numbers above

- **Custom template upload**: Users can upload their own SVG templates  - 

- **Auto-detection of placeholders** in custom templates (supports `{{placeholder}}`, `${placeholder}`, `%placeholder%`, `[PLACEHOLDER]`, formats)- As the user types, the app **renders the text directly onto the template in real time**.

- **Placeholder validation** to ensure custom templates work correctly- Text should automatically fit within the designated space.

### Input Fields  
- Use a clean, modern font (Inter / Sans-serif)

  - **First Name**  
  - **Last Name**
  - **Title** (Job title/position)
  - **Company/Organization**
  - **Location** (centered on badge) displayed in **bold**
  - **Badge Type** (Staff, Attendee, Speaker, Partner)
- Adjust size if too long
- Display a **final preview canvas** under the inputs.
- Add a **“Download Badge”** button that exports the final result as PNG.
- auto line-break for long names


## 🎨 Layout

### Real-time Preview

- Live SVG rendering as user types- Centered card UI
- Instant template switching
- Side-by-side layout with sticky preview panel
- **Left:** badge preview  
- **Right:** input form
- Smooth live updates

### Bulk Import- Responsive layout

- Supports **CSV**, **JSON**, and **Excel (.xlsx)** file formats

- Smart column mapping (handles various header names like "First Name", "FirstName", "Prénom", etc.)

- **Type-based template selection**: Automatically assigns the correct template based on attendee type

- Handles common typos in data (e.g., "Staf" → "Staff", "Atendee" → "Attendee")

## 🛠️ Technical Requirements
Use **HTML + CSS + JavaScript** only (no database).

### Participant Search & Selection

- **Smart search** across all fields (name, title, company)
- Select individual participants from imported list
- Use an HTML `<canvas>` to draw:
- Preview and download badges one at a time
- **Download All** as ZIP file

### Export

- **High-resolution PNG export** (3x scale factor)Allow user customization:

- Server-side SVG-to-PNG conversion using `resvg-js`
- Bulk export as ZIP archive with progress indicator
- Text color (default **black**)
- Fallback to SVG download if server conversion fails- Text size (auto-fit, but adjustable with slider is OK)



------



## 🎨 Layout & Design## 📦 Output Requirements



- **Modern Google/GDG-inspired theme**Provide:

- **Side-by-side layout**:

  - Left: Sticky badge preview panel- Project structure with all files created

  - Right: Controls and input forms- a working version of the solution

- **Responsive design** with CSS Grid

- **Visual template selector** with color-coded optionsThe code must **run locally** and must **not depend on external libraries**.

- Clean typography and subtle shadows

---

---

## ✨ Optional Improvements

## 🛠️ Technical Stack

- Add **drag-to-position** for the text fields on the badge.

### Frontend- Add **font selector**.

- **HTML5 + CSS3 + Vanilla JavaScript**- Allow exporting in **high resolution**.

- CSS Grid and Flexbox for layout

- CSS custom properties (variables) for theming

### Libraries
- **JSZip** (v3.10.1) - ZIP file creation for bulk downloads
- **SheetJS/XLSX** (v0.18.5) - Excel file parsing

### Backend
- **Node.js + Express.js** server
- **resvg-js** - High-quality SVG to PNG conversion
- Serves static files and provides `/convert-to-png` API endpoint

### SVG Processing
- Direct string manipulation for placeholder replacement
- `<tspan>` elements for multi-line text (company names)
- Transform matrix adjustments for text centering

---

## 📦 Project Structure

```
badges-generator/
├── index.html          # Main HTML file
├── style.css           # Styles and theming
├── script.js           # Frontend application logic
├── server.js           # Node.js/Express backend
├── package.json        # Dependencies
├── README.md           # Project documentation
├── INSTRUCTIONS.md     # This file
└── templates/          # SVG badge templates
    ├── badge-template-1.svg  # Staff (Yellow)
    ├── badge-template-2.svg  # Attendee (Blue)
    ├── badge-template-3.svg  # Speaker (Red)
    └── badge-template-4.svg  # Partner (Green)
```

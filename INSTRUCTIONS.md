# 🏷️ Badge Generator — Build Prompt

You are an expert full-stack developer.  
Build a simple web app called **Badge Generator** with the following requirements:

---

## ✅ Core Features

- User uploads a **badge template image** (PNG/JPG/SVG).
- App includes **four input fields**:
  - **first name**
  - **last name**
  - **title**
  - **Company**
- As the user types, the app **renders the text directly onto the template in real time**.
- Text should automatically:
  - Fit within the designated space
  - Use a clean, modern font (Inter / Sans-serif)
  - Adjust size if too long
- Display a **final preview canvas** under the inputs.
- Add a **“Download Badge”** button that exports the final result as PNG.

---

## 🎨 Layout

- Centered card UI
- **Left:** badge preview  
- **Right:** input form
- Smooth live updates
- Responsive layout

---

## 🛠️ Technical Requirements

Use **HTML + CSS + JavaScript** only (no backend).

Use an HTML `<canvas>` to draw:

- The uploaded badge template  
- The rendered **Name + Company** text

Allow user customization:

- Text color (default **black**)
- Text size (auto-fit, but adjustable with slider is OK)

---

## 📦 Output Requirements

Provide:

- Project structure with all files created
- a working version of the solution

The code must **run locally** and must **not depend on external libraries**.

---

## ✨ Optional Improvements

- Add **drag-to-position** for the text fields on the badge.
- Add **font selector**.
- Allow exporting in **high resolution**.


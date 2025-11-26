# Badge Generator

This is a web-based application for creating custom Devfest badges. You can generate badges individually or in bulk by uploading a list of attendees. The application supports multiple templates and allows you to use your own custom SVG templates.

Note: No data is stored.

## Features

- **Side-by-Side Interface**: A user-friendly interface with a live preview of the badge on the left and controls on the right.
- **Multiple Templates**: Choose from four built-in templates, each with a different color scheme.
- **Custom SVG Templates**: Upload your own SVG template and specify the placeholders for each field.
- **Bulk Import**: Import a list of attendees from a CSV, JSON, or Excel file.
- **Smart Search**: Quickly find and select a specific participant from the imported list.
- **Individual & Bulk Download**: Download a single badge or all badges as a ZIP file.
- **High-Resolution PNG Export**: Badges are exported as high-resolution PNG files.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/badge-generator.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd badge-generator
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running Locally

To run the application locally, use the following command:

```bash
node server.js
```

The application will be available at `http://localhost:8080`.

## How to Use

1.  **Choose a Template**: Select one of the built-in templates or upload your own SVG template.
2.  **Customize Placeholders (for custom templates)**: If you upload a custom template, specify the placeholders for each field (e.g., `{{firstName}}`, `{{lastName}}`).
3.  **Import Attendees**: Upload a CSV, JSON, or Excel file with a list of attendees. The file should contain columns for "First Name", "Last Name", "Title", "Company", and "Type". The type is the type of participant (1- Staff, 2- Attendee, 3- Speaker, 4- Partner)
4.  **Generate Badges**:
    -   **Single Badge**: Use the manual input fields to create a single badge.
    -   **Bulk Badges**: Use the search feature to find a specific participant and download their badge, or download all badges as a ZIP file.



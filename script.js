// DOM Elements
const svgPreview = document.getElementById('svgPreview');
const canvas = document.getElementById('badgeCanvas');
const ctx = canvas.getContext('2d');
const placeholder = document.getElementById('placeholder');
const downloadBtn = document.getElementById('downloadBtn');
const templateUpload = document.getElementById('templateUpload');
const fileUpload = document.getElementById('fileUpload');
const csvProgress = document.getElementById('csvProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const templateRadios = document.querySelectorAll('input[name="template"]');
const templateOptions = document.querySelectorAll('.template-option');

// Participant section elements
const participantSection = document.getElementById('participantSection');
const participantCount = document.getElementById('participantCount');
const participantSearch = document.getElementById('participantSearch');
const searchResults = document.getElementById('searchResults');
const selectedParticipant = document.getElementById('selectedParticipant');
const selectedName = document.getElementById('selectedName');
const selectedDetails = document.getElementById('selectedDetails');
const clearSelection = document.getElementById('clearSelection');
const downloadSelected = document.getElementById('downloadSelected');
const downloadAll = document.getElementById('downloadAll');

// Form inputs
const inputs = {
    firstName: document.getElementById('firstName'),
    lastName: document.getElementById('lastName'),
    title: document.getElementById('title'),
    company: document.getElementById('company'),
    location: document.getElementById('location'),
    badgeType: document.getElementById('badgeType')
};

// Custom placeholder inputs
const customPlaceholderInputs = {
    firstName: document.getElementById('placeholderFirstName'),
    lastName: document.getElementById('placeholderLastName'),
    title: document.getElementById('placeholderTitle'),
    company: document.getElementById('placeholderCompany'),
    location: document.getElementById('placeholderLocation'),
    badgeType: document.getElementById('placeholderBadgeType')
};

// Custom placeholders section elements
const customPlaceholdersSection = document.getElementById('customPlaceholders');
const closePlaceholdersBtn = document.getElementById('closePlaceholders');
const detectPlaceholdersBtn = document.getElementById('detectPlaceholders');
const validatePlaceholdersBtn = document.getElementById('validatePlaceholders');
const placeholderStatus = document.getElementById('placeholderStatus');

// State
let svgTemplate = null;
let svgWidth = 336;
let svgHeight = 528;
let currentTemplatePath = 'templates/badge-template-1.svg';
let loadedAttendees = []; // Store loaded attendees
let selectedAttendee = null; // Currently selected attendee
let isCustomTemplate = false; // Track if using custom template
let placeholdersValidated = false; // Track if placeholders have been validated

// Custom placeholders state
let customPlaceholders = {
    firstName: '',
    lastName: '',
    title: '',
    company: '',
    location: '',
    badgeType: ''
};

// High resolution scale factor for PNG export
const SCALE_FACTOR = 3;

// Template cache for bulk generation
const templateCache = {};

// Template mapping: Type -> Template file
const TYPE_TEMPLATE_MAP = {
    '1': 'templates/badge-template-1.svg',      // Staff (Yellow)
    'staff': 'templates/badge-template-1.svg',
    'staf': 'templates/badge-template-1.svg', // Typo
    '2': 'templates/badge-template-2.svg',      // Attendee (Blue)
    'attendee': 'templates/badge-template-2.svg',
    'atendee': 'templates/badge-template-2.svg', // Typo
    '3': 'templates/badge-template-3.svg',      // Speaker (Red)
    'speaker': 'templates/badge-template-3.svg',
    '4': 'templates/badge-template-4.svg',      // Partner (Green)
    'partner': 'templates/badge-template-4.svg',
    'sponsor': 'templates/badge-template-4.svg',
    'vip': 'templates/badge-template-4.svg'
};

// Badge type labels for each template
const TYPE_BADGE_LABELS = {
    '1': 'Staff',
    'staff': 'Staff',
    'staf': 'Staff', // Typo
    '2': 'Attendee',
    'attendee': 'Attendee',
    'atendee': 'Attendee', // Typo
    '3': 'Speaker',
    'speaker': 'Speaker',
    '4': 'Partner',
    'partner': 'Partner',
    'sponsor': 'Partner',
    'vip': 'VIP'
};

// Event Listeners
templateUpload.addEventListener('change', handleTemplateUpload);
fileUpload.addEventListener('change', handleFileUpload);
downloadBtn.addEventListener('click', downloadBadge);

// Participant search and selection listeners
participantSearch.addEventListener('input', handleSearch);
participantSearch.addEventListener('focus', () => {
    if (participantSearch.value.trim() || loadedAttendees.length <= 10) {
        showSearchResults(participantSearch.value.trim());
    }
});
clearSelection.addEventListener('click', clearSelectedParticipant);
downloadSelected.addEventListener('click', downloadSelectedBadge);
downloadAll.addEventListener('click', downloadAllBadges);

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        searchResults.style.display = 'none';
    }
});

// Template selector listeners
templateRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        // Update selected class
        templateOptions.forEach(opt => opt.classList.remove('selected'));
        e.target.closest('.template-option').classList.add('selected');
        
        // Load the selected template
        currentTemplatePath = e.target.value;
        isCustomTemplate = false;
        customPlaceholdersSection.style.display = 'none';
        loadTemplate(currentTemplatePath);
    });
});

// Custom placeholder listeners
if (closePlaceholdersBtn) {
    closePlaceholdersBtn.addEventListener('click', () => {
        customPlaceholdersSection.style.display = 'none';
    });
}

if (detectPlaceholdersBtn) {
    detectPlaceholdersBtn.addEventListener('click', detectPlaceholdersInSVG);
}

if (validatePlaceholdersBtn) {
    validatePlaceholdersBtn.addEventListener('click', validateAndApplyPlaceholders);
}

// Update custom placeholders when inputs change (mark as not validated)
Object.keys(customPlaceholderInputs).forEach(key => {
    if (customPlaceholderInputs[key]) {
        customPlaceholderInputs[key].addEventListener('input', (e) => {
            customPlaceholders[key] = e.target.value;
            placeholdersValidated = false;
            hidePlaceholderStatus();
        });
    }
});

// Add real-time input listeners
Object.keys(inputs).forEach(key => {
    inputs[key].addEventListener('input', renderSVG);
});

// Load default template on startup
window.addEventListener('DOMContentLoaded', () => {
    loadTemplate('templates/badge-template-1.svg');
});

/**
 * Load SVG template from URL
 */
async function loadTemplate(src) {
    try {
        const response = await fetch(src);
        if (!response.ok) throw new Error('Template not found');
        
        svgTemplate = await response.text();
        
        // Extract dimensions from SVG
        const dimensions = extractSvgDimensions(svgTemplate);
        svgWidth = dimensions.width;
        svgHeight = dimensions.height;
        
        placeholder.style.display = 'none';
        downloadBtn.disabled = false;
        renderSVG();
    } catch (error) {
        console.error('Error loading template:', error);
        placeholder.innerHTML = '<p>Error loading template</p>';
    }
}

/**
 * Extract width and height from SVG viewBox or dimensions
 */
function extractSvgDimensions(svgString) {
    const viewBoxMatch = svgString.match(/viewBox=["']([^"']+)["']/);
    if (viewBoxMatch) {
        const parts = viewBoxMatch[1].split(/\s+/);
        if (parts.length >= 4) {
            return { width: parseFloat(parts[2]), height: parseFloat(parts[3]) };
        }
    }
    
    const widthMatch = svgString.match(/width=["'](\d+)/);
    const heightMatch = svgString.match(/height=["'](\d+)/);
    
    return {
        width: widthMatch ? parseFloat(widthMatch[1]) : 336,
        height: heightMatch ? parseFloat(heightMatch[1]) : 528
    };
}

/**
 * Handle custom SVG template upload
 */
function handleTemplateUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        svgTemplate = event.target.result;
        
        const dimensions = extractSvgDimensions(svgTemplate);
        svgWidth = dimensions.width;
        svgHeight = dimensions.height;
        
        // Mark as custom template
        isCustomTemplate = true;
        
        // Show custom placeholders section
        customPlaceholdersSection.style.display = 'block';
        
        // Auto-detect placeholders
        detectPlaceholdersInSVG();
        
        // Deselect built-in templates
        templateOptions.forEach(opt => opt.classList.remove('selected'));
        templateRadios.forEach(radio => radio.checked = false);
        
        placeholder.style.display = 'none';
        downloadBtn.disabled = false;
        renderSVG();
    };
    reader.onerror = () => {
        console.error('Error reading file');
    };
    reader.readAsText(file);
}

/**
 * Auto-detect common placeholder patterns in SVG
 */
function detectPlaceholdersInSVG() {
    if (!svgTemplate) return;
    
    // Common placeholder patterns to look for
    const patterns = [
        // Mustache/Handlebars style: {{placeholder}}
        { regex: /\{\{(firstName|first_name|FirstName|prenom|Prénom)\}\}/gi, field: 'firstName' },
        { regex: /\{\{(lastName|last_name|LastName|nom|Nom)\}\}/gi, field: 'lastName' },
        { regex: /\{\{(title|jobTitle|job_title|titre|Titre|position)\}\}/gi, field: 'title' },
        { regex: /\{\{(company|organization|organisation|société|societe|entreprise)\}\}/gi, field: 'company' },
        { regex: /\{\{(location|lieu|city|ville|country|pays)\}\}/gi, field: 'location' },
        { regex: /\{\{(badgeType|badge_type|type|role|category)\}\}/gi, field: 'badgeType' },
        
        // Dollar style: ${placeholder}
        { regex: /\$\{(firstName|first_name|FirstName)\}/gi, field: 'firstName' },
        { regex: /\$\{(lastName|last_name|LastName)\}/gi, field: 'lastName' },
        { regex: /\$\{(title|jobTitle|job_title)\}/gi, field: 'title' },
        { regex: /\$\{(company|organization)\}/gi, field: 'company' },
        { regex: /\$\{(location|city|country)\}/gi, field: 'location' },
        { regex: /\$\{(badgeType|badge_type|type)\}/gi, field: 'badgeType' },
        
        // Percent style: %firstName%
        { regex: /%(firstName|first_name|FirstName)%/gi, field: 'firstName' },
        { regex: /%(lastName|last_name|LastName)%/gi, field: 'lastName' },
        { regex: /%(title|jobTitle|job_title)%/gi, field: 'title' },
        { regex: /%(company|organization)%/gi, field: 'company' },
        { regex: /%(location|city|country)%/gi, field: 'location' },
        { regex: /%(badgeType|badge_type|type)%/gi, field: 'badgeType' },
        
        // Bracket style: [FIRSTNAME]
        { regex: /\[(FIRSTNAME|FIRST_NAME|PRENOM)\]/gi, field: 'firstName' },
        { regex: /\[(LASTNAME|LAST_NAME|NOM)\]/gi, field: 'lastName' },
        { regex: /\[(TITLE|JOB_TITLE|TITRE)\]/gi, field: 'title' },
        { regex: /\[(COMPANY|ORGANIZATION|ORGANISATION)\]/gi, field: 'company' },
        { regex: /\[(LOCATION|LIEU|CITY|VILLE)\]/gi, field: 'location' },
        { regex: /\[(BADGE_TYPE|TYPE|ROLE)\]/gi, field: 'badgeType' },
    ];
    
    // Reset placeholders
    customPlaceholders = {
        firstName: '',
        lastName: '',
        title: '',
        company: '',
        location: '',
        badgeType: ''
    };
    
    // Detect placeholders
    patterns.forEach(pattern => {
        const match = svgTemplate.match(pattern.regex);
        if (match && !customPlaceholders[pattern.field]) {
            customPlaceholders[pattern.field] = match[0];
            if (customPlaceholderInputs[pattern.field]) {
                customPlaceholderInputs[pattern.field].value = match[0];
            }
        }
    });
    
    // Also look for any text between > and < that could be placeholder text
    // Common SVG text patterns
    const textPatterns = [
        { regex: />First\s*Name</gi, field: 'firstName', value: 'First Name' },
        { regex: />Last\s*Name</gi, field: 'lastName', value: 'Last Name' },
        { regex: />Your\s*Name</gi, field: 'firstName', value: 'Your Name' },
        { regex: />Full\s*Name</gi, field: 'firstName', value: 'Full Name' },
        { regex: />Job\s*Title</gi, field: 'title', value: 'Job Title' },
        { regex: />Title</gi, field: 'title', value: 'Title' },
        { regex: />Company</gi, field: 'company', value: 'Company' },
        { regex: />Organization</gi, field: 'company', value: 'Organization' },
        { regex: />Location</gi, field: 'location', value: 'Location' },
        { regex: />Badge\s*Type</gi, field: 'badgeType', value: 'Badge Type' },
        { regex: />Type</gi, field: 'badgeType', value: 'Type' },
    ];
    
    textPatterns.forEach(pattern => {
        if (!customPlaceholders[pattern.field]) {
            const match = svgTemplate.match(pattern.regex);
            if (match) {
                // Extract the actual text content
                const textMatch = match[0].match(/>([^<]+)</);
                if (textMatch) {
                    customPlaceholders[pattern.field] = textMatch[1];
                    if (customPlaceholderInputs[pattern.field]) {
                        customPlaceholderInputs[pattern.field].value = textMatch[1];
                    }
                }
            }
        }
    });
    
    console.log('Detected placeholders:', customPlaceholders);
}

/**
 * Validate and apply custom placeholders
 */
function validateAndApplyPlaceholders() {
    // Read values from inputs
    Object.keys(customPlaceholderInputs).forEach(key => {
        if (customPlaceholderInputs[key]) {
            customPlaceholders[key] = customPlaceholderInputs[key].value.trim();
        }
    });
    
    // Count how many placeholders are defined
    const definedCount = Object.values(customPlaceholders).filter(v => v.length > 0).length;
    
    // Check which placeholders exist in the SVG
    const foundInSvg = [];
    const notFoundInSvg = [];
    
    Object.keys(customPlaceholders).forEach(key => {
        const placeholder = customPlaceholders[key];
        if (placeholder && svgTemplate) {
            if (svgTemplate.includes(placeholder)) {
                foundInSvg.push(key);
            } else {
                notFoundInSvg.push(key);
            }
        }
    });
    
    // Mark as validated
    placeholdersValidated = true;
    
    // Show status message
    if (definedCount === 0) {
        showPlaceholderStatus('⚠️ No placeholders defined. Enter the text to replace from your SVG.', 'warning');
    } else if (notFoundInSvg.length > 0 && foundInSvg.length === 0) {
        showPlaceholderStatus(`⚠️ None of the placeholders were found in the SVG. Check the text values.`, 'warning');
    } else if (notFoundInSvg.length > 0) {
        showPlaceholderStatus(`✓ ${foundInSvg.length} placeholder(s) applied. ${notFoundInSvg.length} not found in SVG.`, 'warning');
    } else {
        showPlaceholderStatus(`✓ ${definedCount} placeholder(s) applied successfully!`, 'success');
    }
    
    // Update preview
    renderSVG();
    
    console.log('Placeholders validated:', customPlaceholders);
    console.log('Found in SVG:', foundInSvg);
    console.log('Not found in SVG:', notFoundInSvg);
}

/**
 * Show placeholder status message
 */
function showPlaceholderStatus(message, type) {
    if (placeholderStatus) {
        placeholderStatus.textContent = message;
        placeholderStatus.className = `placeholder-status ${type}`;
        placeholderStatus.style.display = 'block';
    }
}

/**
 * Hide placeholder status message
 */
function hidePlaceholderStatus() {
    if (placeholderStatus) {
        placeholderStatus.style.display = 'none';
    }
}

/**
 * Replace placeholders in SVG template with form values
 * Supports the actual text in the SVG template: Michelangelo, Muchlongername, Title, Organization, Editable Location, Staf
 */
function getProcessedSVG() {
    if (!svgTemplate) return null;
    
    let processed = svgTemplate;
    
    const firstName = escapeXml(inputs.firstName.value) || 'First Name';
    const lastName = escapeXml(inputs.lastName.value) || 'Last Name';
    const title = escapeXml(inputs.title.value) || 'Title';
    const company = escapeXml(inputs.company.value) || 'Organization';
    const location = escapeXml(inputs.location.value) || 'Belgium';
    const badgeType = escapeXml(inputs.badgeType.value) || 'Partner';
    
    // If using custom template with custom placeholders
    if (isCustomTemplate) {
        // Replace custom placeholders
        if (customPlaceholders.firstName) {
            processed = processed.split(customPlaceholders.firstName).join(firstName);
        }
        if (customPlaceholders.lastName) {
            processed = processed.split(customPlaceholders.lastName).join(lastName);
        }
        if (customPlaceholders.title) {
            processed = processed.split(customPlaceholders.title).join(title);
        }
        if (customPlaceholders.company) {
            processed = processed.split(customPlaceholders.company).join(company);
        }
        if (customPlaceholders.location) {
            processed = processed.split(customPlaceholders.location).join(location);
        }
        if (customPlaceholders.badgeType) {
            processed = processed.split(customPlaceholders.badgeType).join(badgeType);
        }
        
        return processed;
    }
    
    // Built-in template processing (original logic)
    // Replace the actual placeholder text in the SVG template
    // The template uses: Michelangelo (firstName), Muchlongername (lastName), Title (title), Organization (company)
    processed = processed.replace(/>Michelangelo</g, `>${firstName}<`);
    processed = processed.replace(/>Muchlongername</g, `>${lastName}<`);
    processed = processed.replace(/>Title</g, `>${title}<`);
    
    // Handle company name with line break and bolding
    const companyLines = wrapText(company, 20); // Wrap at 20 chars
    let companyTspan = '';
    if (companyLines.length > 1) {
        companyTspan = `<tspan x="0" dy="0" style="font-weight:700">${companyLines[0]}</tspan><tspan x="0" dy="1.2em" style="font-weight:700">${companyLines[1]}</tspan>`;
    } else {
        companyTspan = `<tspan style="font-weight:700">${company}</tspan>`;
    }
    processed = processed.replace(/>Organization</g, `>${companyTspan}<`);
    
    // For location: replace the text and center it
    // Step 1: Replace the text content
    processed = processed.replace(/>Editable Location</g, `>${location}<`);
    
    // Step 2: Center the location text by updating the transform X position
    // Each template has different X offsets due to parent translate transforms:
    // Template 1: X ≈ 143, no translate → center at 224
    // Template 2: X ≈ 611, translate(-468) → center at 224 + 468 = 692
    // Template 3: X ≈ 1079, translate(-936) → center at 224 + 936 = 1160
    // Template 4: X ≈ 1547, translate(-1404) → center at 224 + 1404 = 1628
    
    // Template 1: X around 143
    processed = processed.replace(
        /(<text[^>]*?)transform="matrix\(1\.3333333,0,0,1\.3333333,14[0-9.]+,128\.17907\)"([^>]*?>)/g,
        '$1transform="matrix(1.3333333,0,0,1.3333333,224,128.17907)" text-anchor="middle"$2'
    );
    // Template 2: X around 611
    processed = processed.replace(
        /(<text[^>]*?)transform="matrix\(1\.3333333,0,0,1\.3333333,6[0-9.]+,128\.17907\)"([^>]*?>)/g,
        '$1transform="matrix(1.3333333,0,0,1.3333333,692,128.17907)" text-anchor="middle"$2'
    );
    // Template 3: X around 1079
    processed = processed.replace(
        /(<text[^>]*?)transform="matrix\(1\.3333333,0,0,1\.3333333,10[0-9.]+,128\.17907\)"([^>]*?>)/g,
        '$1transform="matrix(1.3333333,0,0,1.3333333,1160,128.17907)" text-anchor="middle"$2'
    );
    // Template 4: X around 1547
    processed = processed.replace(
        /(<text[^>]*?)transform="matrix\(1\.3333333,0,0,1\.3333333,15[0-9.]+,128\.17907\)"([^>]*?>)/g,
        '$1transform="matrix(1.3333333,0,0,1.3333333,1628,128.17907)" text-anchor="middle"$2'
    );
    
    // For badge type: handle different templates with different badge type texts
    // Template 1: Staf, Template 2: Atendee, Template 3: Speaker, Template 4: All-Access
    // Match only tspans with y="0" (badge type position) - last names have y="31.049999"
    const badgeTypePatterns = ['Staf', 'Atendee', 'Speaker', 'Volunteer', 'Organizer', 'Sponsor', 'All-Access', 'Partner'];
    badgeTypePatterns.forEach(pattern => {
        processed = processed.replace(
            new RegExp(`<tspan([^>]*?)style="([^"]*?)font-weight:500([^"]*?)font-size:27px([^"]*?)"([^>]*?)y="0"([^>]*)>${pattern}</tspan>`, 'g'),
            `<tspan$1style="$2font-weight:700$3font-size:22px$4"$5y="0"$6>${badgeType}</tspan>`
        );
    });
    
    // Also support {{placeholder}} format if used
    processed = processed.replace(/\{\{firstName\}\}/gi, firstName);
    processed = processed.replace(/\{\{lastName\}\}/gi, lastName);
    processed = processed.replace(/\{\{title\}\}/gi, title);
    processed = processed.replace(/\{\{company\}\}/gi, company);
    processed = processed.replace(/\{\{location\}\}/gi, location);
    processed = processed.replace(/\{\{badgeType\}\}/gi, badgeType);
    
    return processed;
}

/**
 * Escape special XML characters
 */
function escapeXml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Wrap text into multiple lines
 */
function wrapText(text, maxLength) {
    if (text.length <= maxLength) {
        return [text];
    }
    
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
        if ((currentLine + word).length > maxLength) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine += word + ' ';
        }
    });
    
    if (currentLine) {
        lines.push(currentLine.trim());
    }
    
    return lines;
}

/**
 * Render SVG to the preview area
 */
function renderSVG() {
    const processed = getProcessedSVG();
    if (!processed) return;
    
    // Display SVG directly in the preview div
    svgPreview.innerHTML = processed;
    
    // Make SVG responsive within container
    const svgElement = svgPreview.querySelector('svg');
    if (svgElement) {
        svgElement.style.width = '100%';
        svgElement.style.height = 'auto';
        svgElement.style.display = 'block';
    }
}

/**
 * Download badge as high-resolution PNG using server-side conversion
 */
async function downloadBadge() {
    const processed = getProcessedSVG();
    if (!processed) return;
    
    // Set explicit dimensions for high-res export
    let exportSvg = processed;
    
    // Remove existing width/height attributes if present, then add new ones
    exportSvg = exportSvg.replace(/<svg([^>]*)\s+width="[^"]*"/, '<svg$1');
    exportSvg = exportSvg.replace(/<svg([^>]*)\s+height="[^"]*"/, '<svg$1');
    
    // Add explicit width/height for high-res rendering
    exportSvg = exportSvg.replace(
        /<svg([^>]*)>/,
        `<svg$1 width="${svgWidth * SCALE_FACTOR}" height="${svgHeight * SCALE_FACTOR}">`
    );
    
    // Show loading state
    downloadBtn.textContent = 'Converting...';
    downloadBtn.disabled = true;
    
    try {
        // Send SVG to server for conversion
        const response = await fetch('/convert-to-png', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                svg: exportSvg,
                width: svgWidth * SCALE_FACTOR,
                height: svgHeight * SCALE_FACTOR
            })
        });
        
        if (!response.ok) {
            throw new Error('Server conversion failed');
        }
        
        // Get PNG blob from response
        const pngBlob = await response.blob();
        
        // Download the PNG
        const url = URL.createObjectURL(pngBlob);
        const link = document.createElement('a');
        link.download = generateFilename();
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
    } catch (err) {
        console.error('PNG conversion failed:', err);
        // Fallback: download as SVG
        downloadAsSVG(processed);
    } finally {
        // Restore button state
        downloadBtn.textContent = 'Download Badge (PNG)';
        downloadBtn.disabled = false;
    }
}

/**
 * Fallback: Download as SVG if PNG conversion fails
 */
function downloadAsSVG(svgContent) {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = generateFilename().replace('.png', '.svg');
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Generate filename based on user input
 */
function generateFilename(firstName = null, lastName = null) {
    const fName = firstName || inputs.firstName.value.trim();
    const lName = lastName || inputs.lastName.value.trim();
    
    if (fName || lName) {
        return `badge-${fName}-${lName}.png`.toLowerCase().replace(/\s+/g, '-');
    }
    return 'my-badge.png';
}

/**
 * Parse CSV content (supports both semicolon and comma delimiters)
 */
function parseCSV(content) {
    const lines = content.trim().split('\n');
    
    // Detect delimiter (semicolon or comma)
    const firstLine = lines[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';
    
    const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter);
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] ? values[index].trim().replace(/^["']|["']$/g, '') : '';
        });
        data.push(row);
    }
    return data;
}

/**
 * Parse JSON content
 */
function parseJSON(content) {
    try {
        const data = JSON.parse(content);
        // Handle both array of objects and object with data property
        if (Array.isArray(data)) {
            return data;
        } else if (data.attendees) {
            return data.attendees;
        } else if (data.data) {
            return data.data;
        }
        return [data];
    } catch (e) {
        console.error('JSON parse error:', e);
        return [];
    }
}

/**
 * Parse Excel file content
 */
function parseExcel(arrayBuffer) {
    try {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        return data;
    } catch (e) {
        console.error('Excel parse error:', e);
        return [];
    }
}

/**
 * Normalize attendee data keys to expected format
 */
function normalizeAttendeeData(attendees) {
    return attendees.map(attendee => {
        const normalized = {};
        
        // Map various possible key names to our expected keys
        const keyMappings = {
            'First Name': ['First Name', 'FirstName', 'first_name', 'firstname', 'First', 'Prénom', 'prenom'],
            'Last Name': ['Last Name', 'LastName', 'last_name', 'lastname', 'Last', 'Nom', 'nom'],
            'Title': ['Title', 'title', 'Job Title', 'job_title', 'Position', 'position', 'Titre', 'titre'],
            'Company': ['Company', 'company', 'Organization', 'organization', 'Organisation', 'Société', 'societe', 'Entreprise'],
            'Ticket title': ['Ticket title', 'Ticket', 'ticket', 'Badge Type', 'badge_type'],
            'Type': ['Type', 'type', 'Template', 'template', 'Category', 'category', 'Participant Type', 'participant_type']
        };
        
        for (const [targetKey, sourceKeys] of Object.entries(keyMappings)) {
            for (const sourceKey of sourceKeys) {
                if (attendee[sourceKey] !== undefined) {
                    normalized[targetKey] = attendee[sourceKey];
                    break;
                }
            }
            // Default to empty string if not found
            if (normalized[targetKey] === undefined) {
                normalized[targetKey] = '';
            }
        }
        
        return normalized;
    });
}

/**
 * Handle file upload (CSV, JSON, or XLSX)
 */
async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const fileName = file.name.toLowerCase();
    let attendees = [];
    
    if (fileName.endsWith('.csv')) {
        // Handle CSV
        const content = await readFileAsText(file);
        attendees = parseCSV(content);
    } else if (fileName.endsWith('.json')) {
        // Handle JSON
        const content = await readFileAsText(file);
        attendees = parseJSON(content);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // Handle Excel
        const arrayBuffer = await readFileAsArrayBuffer(file);
        attendees = parseExcel(arrayBuffer);
    } else {
        alert('Unsupported file format. Please use CSV, JSON, or Excel (.xlsx) files.');
        e.target.value = '';
        return;
    }
    
    // Normalize the data keys
    attendees = normalizeAttendeeData(attendees);
    
    // Filter out empty rows (no first name and last name)
    const validAttendees = attendees.filter(a => a['First Name'] || a['Last Name']);
    
    if (validAttendees.length === 0) {
        alert('No valid attendees found in file. Make sure your file has "First Name" and "Last Name" columns.');
        e.target.value = '';
        return;
    }
    
    // Store attendees and show participant section
    loadedAttendees = validAttendees;
    showParticipantSection();
    
    console.log(`Found ${validAttendees.length} valid attendees`);
    
    // Reset file input so same file can be selected again
    e.target.value = '';
}

/**
 * Show participant section after file upload
 */
function showParticipantSection() {
    participantSection.style.display = 'block';
    participantCount.textContent = loadedAttendees.length;
    participantSearch.value = '';
    searchResults.style.display = 'none';
    clearSelectedParticipant();
}

/**
 * Handle search input
 */
function handleSearch(e) {
    const query = e.target.value.trim();
    showSearchResults(query);
}

/**
 * Show search results based on query
 */
function showSearchResults(query) {
    if (loadedAttendees.length === 0) {
        searchResults.style.display = 'none';
        return;
    }
    
    let filtered = loadedAttendees;
    
    if (query) {
        const lowerQuery = query.toLowerCase();
        filtered = loadedAttendees.filter(a => {
            const firstName = (a['First Name'] || '').toLowerCase();
            const lastName = (a['Last Name'] || '').toLowerCase();
            const title = (a['Title'] || '').toLowerCase();
            const company = (a['Company'] || '').toLowerCase();
            const fullName = `${firstName} ${lastName}`;
            
            return firstName.includes(lowerQuery) ||
                   lastName.includes(lowerQuery) ||
                   fullName.includes(lowerQuery) ||
                   title.includes(lowerQuery) ||
                   company.includes(lowerQuery);
        });
    }
    
    // Limit results to 10
    const limitedResults = filtered.slice(0, 10);
    
    if (limitedResults.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No participants found</div>';
    } else {
        searchResults.innerHTML = limitedResults.map((attendee, index) => {
            const type = getTypeLabel(attendee['Type']);
            const typeClass = type.toLowerCase();
            const details = [attendee['Title'], attendee['Company']].filter(Boolean).join(' • ');
            
            return `
                <div class="search-result-item" data-index="${loadedAttendees.indexOf(attendee)}">
                    <span class="result-name">
                        ${escapeHtml(attendee['First Name'])} ${escapeHtml(attendee['Last Name'])}
                        <span class="result-type ${typeClass}">${type}</span>
                    </span>
                    ${details ? `<span class="result-details">${escapeHtml(details)}</span>` : ''}
                </div>
            `;
        }).join('');
        
        // Add click handlers to results
        searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                selectParticipant(loadedAttendees[index]);
            });
        });
    }
    
    searchResults.style.display = 'block';
}

/**
 * Get type label from type value
 */
function getTypeLabel(type) {
    const typeKey = String(type || '2').toLowerCase().trim();
    return TYPE_BADGE_LABELS[typeKey] || 'Attendee';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Select a participant
 */
function selectParticipant(attendee) {
    selectedAttendee = attendee;
    
    // Update UI
    selectedName.textContent = `${attendee['First Name']} ${attendee['Last Name']}`;
    const details = [attendee['Title'], attendee['Company']].filter(Boolean).join(' • ');
    selectedDetails.textContent = details || getTypeLabel(attendee['Type']);
    
    selectedParticipant.style.display = 'flex';
    downloadSelected.disabled = false;
    
    // Hide search results and clear search input
    searchResults.style.display = 'none';
    participantSearch.value = '';
    
    // Update preview with selected participant
    updatePreviewWithAttendee(attendee);
}

/**
 * Clear selected participant
 */
function clearSelectedParticipant() {
    selectedAttendee = null;
    selectedParticipant.style.display = 'none';
    downloadSelected.disabled = true;
    participantSearch.value = '';
    
    // Reset preview to form values
    renderSVG();
}

/**
 * Update preview with attendee data
 */
function updatePreviewWithAttendee(attendee) {
    // Temporarily update form values for preview
    const originalValues = {
        firstName: inputs.firstName.value,
        lastName: inputs.lastName.value,
        title: inputs.title.value,
        company: inputs.company.value,
        badgeType: inputs.badgeType.value
    };
    
    inputs.firstName.value = attendee['First Name'] || '';
    inputs.lastName.value = attendee['Last Name'] || '';
    inputs.title.value = attendee['Title'] || '';
    inputs.company.value = attendee['Company'] || '';
    inputs.badgeType.value = getTypeLabel(attendee['Type']);
    
    // Load correct template for this attendee type
    const typeKey = String(attendee['Type'] || '2').toLowerCase().trim();
    const templatePath = TYPE_TEMPLATE_MAP[typeKey] || 'templates/badge-template-2.svg';
    
    // Update template selector
    templateRadios.forEach(radio => {
        if (radio.value === templatePath) {
            radio.checked = true;
            templateOptions.forEach(opt => opt.classList.remove('selected'));
            radio.closest('.template-option').classList.add('selected');
        }
    });
    
    loadTemplate(templatePath);
}

/**
 * Download badge for selected participant
 */
async function downloadSelectedBadge() {
    if (!selectedAttendee) return;
    
    downloadSelected.disabled = true;
    downloadSelected.textContent = '⏳ Generating...';
    
    try {
        const pngBlob = await generateBadgeForAttendee(selectedAttendee);
        if (pngBlob) {
            const filename = generateFilename(selectedAttendee['First Name'], selectedAttendee['Last Name']);
            const url = URL.createObjectURL(pngBlob);
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        }
    } catch (err) {
        console.error('Failed to generate badge:', err);
        alert('Failed to generate badge. Please try again.');
    }
    
    downloadSelected.disabled = false;
    downloadSelected.textContent = '📥 Download Selected Badge';
}

/**
 * Download all badges as ZIP
 */
async function downloadAllBadges() {
    if (loadedAttendees.length === 0) return;
    await generateBulkBadges(loadedAttendees);
}

/**
 * Read file as text (for CSV and JSON)
 */
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

/**
 * Read file as ArrayBuffer (for Excel)
 */
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Generate badges for all attendees in bulk and download as ZIP
 */
async function generateBulkBadges(attendees) {
    console.log('generateBulkBadges called with', attendees.length, 'attendees');
    console.log('JSZip available:', typeof JSZip);
    
    csvProgress.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = `Processing 0 / ${attendees.length} badges...`;
    
    const zip = new JSZip();
    console.log('JSZip instance created:', zip);
    let successCount = 0;
    
    for (let i = 0; i < attendees.length; i++) {
        const attendee = attendees[i];
        
        // Update progress
        const percent = Math.round(((i + 1) / attendees.length) * 100);
        progressFill.style.width = `${percent}%`;
        progressText.textContent = `Processing ${i + 1} / ${attendees.length} badges...`;
        
        // Generate badge for this attendee
        const pngBlob = await generateBadgeForAttendee(attendee);
        if (pngBlob) {
            const filename = generateFilename(attendee['First Name'], attendee['Last Name']);
            zip.file(filename, pngBlob);
            successCount++;
        }
        
        // Small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    progressText.textContent = `Creating ZIP file with ${successCount} badges...`;
    
    // Generate and download ZIP file
    try {
        console.log('Generating ZIP with', successCount, 'badges');
        const zipBlob = await zip.generateAsync({ 
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        }, (metadata) => {
            progressFill.style.width = `${metadata.percent.toFixed(0)}%`;
        });
        
        console.log('ZIP blob created:', zipBlob.size, 'bytes');
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.download = `badges-${new Date().toISOString().slice(0,10)}.zip`;
        link.href = url;
        console.log('Downloading ZIP:', link.download);
        link.click();
        URL.revokeObjectURL(url);
        
        progressText.textContent = `✅ Done! ${successCount} badges saved to ZIP.`;
    } catch (err) {
        console.error('Failed to create ZIP:', err);
        progressText.textContent = `❌ Error creating ZIP file.`;
    }
    
    // Hide progress after 3 seconds
    setTimeout(() => {
        csvProgress.style.display = 'none';
    }, 3000);
}

/**
 * Get template SVG by type (with caching)
 */
async function getTemplateByType(type) {
    const typeKey = String(type).toLowerCase().trim();
    const templatePath = TYPE_TEMPLATE_MAP[typeKey] || 'templates/badge-template-2.svg'; // Default to Attendee (Blue)
    
    // Check cache first
    if (templateCache[templatePath]) {
        return templateCache[templatePath];
    }
    
    // Load and cache template
    try {
        const response = await fetch(templatePath);
        if (!response.ok) throw new Error('Template not found');
        const templateSvg = await response.text();
        templateCache[templatePath] = templateSvg;
        return templateSvg;
    } catch (e) {
        console.error('Failed to load template:', templatePath, e);
        // Fallback to current template
        return svgTemplate;
    }
}

/**
 * Generate a single badge for an attendee
 */
async function generateBadgeForAttendee(attendee) {
    // Get attendee data with defaults
    const firstName = escapeXml(attendee['First Name']) || 'First Name';
    const lastName = escapeXml(attendee['Last Name']) || 'Last Name';
    const title = escapeXml(attendee['Title']) || '';
    const company = escapeXml(attendee['Company']) || '';
    const location = escapeXml(inputs.location.value) || 'Belgium';
    
    // Get attendee type and determine template + badge label
    const attendeeType = String(attendee['Type'] || '2').toLowerCase().trim();
    const badgeType = TYPE_BADGE_LABELS[attendeeType] || inputs.badgeType.value || 'Attendee';
    
    let template;
    let processed;
    
    // If using custom template, use the current template with custom placeholders
    if (isCustomTemplate) {
        template = svgTemplate;
        processed = template;
        
        // Replace custom placeholders
        if (customPlaceholders.firstName) {
            processed = processed.split(customPlaceholders.firstName).join(firstName);
        }
        if (customPlaceholders.lastName) {
            processed = processed.split(customPlaceholders.lastName).join(lastName);
        }
        if (customPlaceholders.title) {
            processed = processed.split(customPlaceholders.title).join(title);
        }
        if (customPlaceholders.company) {
            processed = processed.split(customPlaceholders.company).join(company);
        }
        if (customPlaceholders.location) {
            processed = processed.split(customPlaceholders.location).join(location);
        }
        if (customPlaceholders.badgeType) {
            processed = processed.split(customPlaceholders.badgeType).join(badgeType);
        }
    } else {
        // Get the correct template for this attendee type (built-in templates)
        template = await getTemplateByType(attendeeType);
        if (!template) return null;
        
        // Process SVG with attendee data (built-in template logic)
        processed = template;
        
        processed = processed.replace(/>Michelangelo</g, `>${firstName}<`);
        processed = processed.replace(/>Muchlongername</g, `>${lastName}<`);
        processed = processed.replace(/>Title</g, `>${title || ' '}<`);

        // Handle company name with line break and bolding
        const companyLines = wrapText(company, 20);
        let companyTspan = '';
        if (companyLines.length > 1) {
            companyTspan = `<tspan x="0" dy="0" style="font-weight:700">${companyLines[0]}</tspan><tspan x="0" dy="1.2em" style="font-weight:700">${companyLines[1]}</tspan>`;
        } else {
            companyTspan = `<tspan style="font-weight:700">${company || ' '}</tspan>`;
        }
        processed = processed.replace(/>Organization</g, `>${companyTspan}<`);

        processed = processed.replace(/>Editable Location</g, `>${location}<`);
        
        // Center location text (same logic as getProcessedSVG)
        processed = processed.replace(
            /(<text[^>]*?)transform="matrix\(1\.3333333,0,0,1\.3333333,14[0-9.]+,128\.17907\)"([^>]*?>)/g,
            '$1transform="matrix(1.3333333,0,0,1.3333333,224,128.17907)" text-anchor="middle"$2'
        );
        processed = processed.replace(
            /(<text[^>]*?)transform="matrix\(1\.3333333,0,0,1\.3333333,6[0-9.]+,128\.17907\)"([^>]*?>)/g,
            '$1transform="matrix(1.3333333,0,0,1.3333333,692,128.17907)" text-anchor="middle"$2'
        );
        processed = processed.replace(
            /(<text[^>]*?)transform="matrix\(1\.3333333,0,0,1\.3333333,10[0-9.]+,128\.17907\)"([^>]*?>)/g,
            '$1transform="matrix(1.3333333,0,0,1.3333333,1160,128.17907)" text-anchor="middle"$2'
        );
        processed = processed.replace(
            /(<text[^>]*?)transform="matrix\(1\.3333333,0,0,1\.3333333,15[0-9.]+,128\.17907\)"([^>]*?>)/g,
            '$1transform="matrix(1.3333333,0,0,1.3333333,1628,128.17907)" text-anchor="middle"$2'
        );
        
        // For badge type: handle different templates with different badge type texts
        // Template 1: Staf, Template 2: Atendee, Template 3: Speaker, Template 4: All-Access
        // Match only tspans with y="0" (badge type position) - last names have y="31.049999"
        const badgeTypePatterns = ['Staf', 'Atendee', 'Speaker', 'Volunteer', 'Organizer', 'Sponsor', 'All-Access', 'Partner'];
        badgeTypePatterns.forEach(pattern => {
            processed = processed.replace(
                new RegExp(`<tspan([^>]*?)style="([^"]*?)font-weight:500([^"]*?)font-size:27px([^"]*?)"([^>]*?)y="0"([^>]*)>${pattern}</tspan>`, 'g'),
                `<tspan$1style="$2font-weight:700$3font-size:22px$4"$5y="0"$6>${badgeType}</tspan>`
            );
        });
    }
    
    // Prepare SVG for export
    let exportSvg = processed;
    exportSvg = exportSvg.replace(/<svg([^>]*)\s+width="[^"]*"/, '<svg$1');
    exportSvg = exportSvg.replace(/<svg([^>]*)\s+height="[^"]*"/, '<svg$1');
    exportSvg = exportSvg.replace(
        /<svg([^>]*)>/,
        `<svg$1 width="${svgWidth * SCALE_FACTOR}" height="${svgHeight * SCALE_FACTOR}">`
    );
    
    try {
        const response = await fetch('/convert-to-png', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                svg: exportSvg,
                width: svgWidth * SCALE_FACTOR,
                height: svgHeight * SCALE_FACTOR
            })
        });
        
        if (!response.ok) {
            throw new Error('Server conversion failed');
        }
        
        return await response.blob();
    } catch (err) {
        console.error('Failed to generate badge for', attendee['First Name'], attendee['Last Name'], err);
        return null;
    }
}

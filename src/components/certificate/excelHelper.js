/**
 * Excel and CSV Parsing & Export Helpers for Certificate Bulk Generation
 * Powered by SheetJS (xlsx)
 */
import * as XLSX from 'xlsx';

/**
 * Common column name keywords for auto-detection
 */
const NAME_PATTERNS = [
  'name', 'fullname', 'full name', 'recipient', 'recipient name',
  'student', 'student name', 'candidate', 'participant', 'attendee',
  'member', 'person', 'learner', 'user'
];

const DATE_PATTERNS = [
  'date', 'issuedate', 'issue date', 'issuance date', 'completion date',
  'date of issue', 'award date', 'completion', 'issued'
];

const CONTENT_PATTERNS = [
  'course', 'content', 'topic', 'program', 'title', 'achievement',
  'reason', 'description', 'subject', 'track', 'event', 'workshop'
];



/**
 * Intelligent helper to score and match header name
 */
const findBestHeaderMatch = (headers, patterns) => {
  if (!headers || !headers.length) return '';
  
  // Exact match first
  for (const h of headers) {
    const clean = String(h).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const p of patterns) {
      const cleanP = p.replace(/[^a-z0-9]/g, '');
      if (clean === cleanP) return h;
    }
  }

  // Substring match
  for (const h of headers) {
    const clean = String(h).trim().toLowerCase();
    for (const p of patterns) {
      if (clean.includes(p)) return h;
    }
  }

  return '';
};

/**
 * Reads an uploaded Excel (.xlsx, .xls) or CSV file
 * @param {File} file 
 * @returns {Promise<{ sheetNames: string[], headers: string[], rows: object[], detectedMapping: object }>}
 */
export const readExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        const sheetNames = workbook.SheetNames;
        if (!sheetNames || sheetNames.length === 0) {
          throw new Error('The uploaded file contains no sheets.');
        }

        // Take the first active sheet
        const firstSheet = workbook.Sheets[sheetNames[0]];
        const rawJson = XLSX.utils.sheet_to_json(firstSheet, { defval: '', header: 1 });

        if (!rawJson || rawJson.length < 2) {
          throw new Error('The sheet is empty or contains only a single header row.');
        }

        // Row 0 is the headers
        const rawHeaders = rawJson[0];
        const headers = rawHeaders
          .map((h, idx) => (h !== undefined && h !== null && String(h).trim() !== '' ? String(h).trim() : `Column_${idx + 1}`))
          .filter(h => h.length > 0);

        // Convert the rest of rows to objects
        const rows = [];
        for (let r = 1; r < rawJson.length; r++) {
          const rowData = rawJson[r];
          if (!rowData || rowData.every(c => c === undefined || c === null || String(c).trim() === '')) {
            continue; // Skip entirely blank rows
          }
          const rowObj = {};
          headers.forEach((h, colIdx) => {
            let val = rowData[colIdx];
            if (val instanceof Date) {
              const yyyy = val.getFullYear();
              const mm = String(val.getMonth() + 1).padStart(2, '0');
              const dd = String(val.getDate()).padStart(2, '0');
              val = `${yyyy}-${mm}-${dd}`;
            }
            rowObj[h] = val !== undefined && val !== null ? String(val).trim() : '';
          });
          rows.push(rowObj);
        }

        // Auto-detect column mapping
        const nameField = findBestHeaderMatch(headers, NAME_PATTERNS) || headers[0] || '';
        const dateField = findBestHeaderMatch(headers, DATE_PATTERNS);
        const contentField = findBestHeaderMatch(headers, CONTENT_PATTERNS);

        resolve({
          sheetNames,
          headers,
          rows,
          detectedMapping: {
            name: nameField,
            date: dateField,
            content: contentField
          }
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parses manually entered or pasted text (supports one name per line, or TSV/CSV format)
 * @param {string} text 
 * @returns {{ headers: string[], rows: object[], detectedMapping: object }}
 */
export const parseManualPastedText = (text) => {
  if (!text || !text.trim()) {
    return { headers: ['Name'], rows: [], detectedMapping: { name: 'Name', date: '', content: '' } };
  }

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { headers: ['Name'], rows: [], detectedMapping: { name: 'Name', date: '', content: '' } };
  }

  // Check if first line contains delimiter (tab, comma, semicolon)
  const firstLine = lines[0];
  let delimiter = null;
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(',') && !firstLine.startsWith('"')) delimiter = ',';
  else if (firstLine.includes(';')) delimiter = ';';

  if (delimiter) {
    // Delimited table pasted
    const splitLine = (l) => l.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
    const possibleHeaders = splitLine(firstLine);
    
    // Check if first line looks like header row or data
    const isHeaderRow = possibleHeaders.some(h => 
      NAME_PATTERNS.some(p => h.toLowerCase().includes(p)) ||
      DATE_PATTERNS.some(p => h.toLowerCase().includes(p)) ||
      CONTENT_PATTERNS.some(p => h.toLowerCase().includes(p))
    );

    const headers = isHeaderRow 
      ? possibleHeaders 
      : possibleHeaders.map((_, i) => i === 0 ? 'Name' : `Field_${i + 1}`);

    const startIndex = isHeaderRow ? 1 : 0;
    const rows = [];
    for (let i = startIndex; i < lines.length; i++) {
      const parts = splitLine(lines[i]);
      if (parts.every(p => !p)) continue;
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = parts[idx] || '';
      });
      rows.push(row);
    }

    const nameField = findBestHeaderMatch(headers, NAME_PATTERNS) || headers[0] || '';
    const dateField = findBestHeaderMatch(headers, DATE_PATTERNS);
    const contentField = findBestHeaderMatch(headers, CONTENT_PATTERNS);

    return {
      headers,
      rows,
      detectedMapping: { name: nameField, date: dateField, content: contentField }
    };
  }

  // Simple list of names (one per line)
  const rows = lines.map(name => ({ Name: name }));
  return {
    headers: ['Name'],
    rows,
    detectedMapping: { name: 'Name', date: '', content: '' }
  };
};

/**
 * Generates and downloads a clean, beautifully formatted sample Excel (.xlsx) file
 * @param {'xlsx' | 'csv'} format 
 */
export const downloadSampleExcelFile = (format = 'xlsx') => {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  const todayDmy = `${d}/${m}/${y}`;

  const sampleData = [
    {
      "Recipient Name": "Alex Johnson",
      "Course / Subject": "Full Stack React & Modern Cloud Architecture",
      "Date": todayDmy
    },
    {
      "Recipient Name": "Sarah Williams",
      "Course / Subject": "Advanced UI/UX & Design Systems Mastery",
      "Date": todayDmy
    },
    {
      "Recipient Name": "Michael Brown",
      "Course / Subject": "Artificial Intelligence & Agentic Workflows",
      "Date": todayDmy
    },
    {
      "Recipient Name": "Emma Davis",
      "Course / Subject": "Data Engineering & Analytics Architecture",
      "Date": todayDmy
    },
    {
      "Recipient Name": "David Wilson",
      "Course / Subject": "Cybersecurity & Enterprise Infrastructure",
      "Date": todayDmy
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  // Set generous column widths
  worksheet['!cols'] = [
    { wch: 22 }, // Recipient Name
    { wch: 45 }, // Course / Subject
    { wch: 14 }  // Date
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Recipients');

  if (format === 'csv') {
    XLSX.writeFile(workbook, 'certificate_recipients_sample.csv', { bookType: 'csv' });
  } else {
    XLSX.writeFile(workbook, 'certificate_recipients_sample.xlsx', { bookType: 'xlsx' });
  }
};

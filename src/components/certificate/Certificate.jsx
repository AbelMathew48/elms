import { useState, useEffect, useRef, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import styles from './Certificate.module.css';
import { 
  PRESET_COLORS, 
  ALL_FONTS 
} from './certificateTemplates';
import { 
  readExcelFile, 
  parseManualPastedText, 
  downloadSampleExcelFile 
} from './excelHelper';
import { 
  downloadSinglePdf, 
  downloadSinglePng, 
  generateBulkPdfsAsZip,
  generateBulkPngsAsZip,
  generateBulkMergedPdf,
  formatDisplayDate 
} from './pdfGenerator';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// Helper Set to track loaded fonts and avoid duplicate loads
const loadedFonts = new Set();

const loadGoogleFont = (fontName) => {
  if (!fontName) return;
  const normalizedName = fontName.trim();
  const fontId = `font-link-${normalizedName.toLowerCase().replace(/\s+/g, '-')}`;
  
  if (loadedFonts.has(normalizedName) || document.getElementById(fontId)) return;
  
  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(normalizedName)}:ital,wght@0,300;0,400;0,500;0,700;0,900;1,300;1,400;1,500;1,700;1,900&display=swap`;
  document.head.appendChild(link);
  
  loadedFonts.add(normalizedName);
};

const GOOGLE_FONTS_API_KEY = 'AIzaSyDrHu5GNIL1HGEfKLUH0a2HNbqSnxP6bCU';

// Common system fonts that are available on most devices
const SYSTEM_FONTS = [
  { value: 'Times New Roman', category: 'System Serif' },
  { value: 'Georgia', category: 'System Serif' },
  { value: 'Garamond', category: 'System Serif' },
  { value: 'Palatino Linotype', category: 'System Serif' },
  { value: 'Book Antiqua', category: 'System Serif' },
  { value: 'Arial', category: 'System Sans' },
  { value: 'Helvetica', category: 'System Sans' },
  { value: 'Verdana', category: 'System Sans' },
  { value: 'Tahoma', category: 'System Sans' },
  { value: 'Trebuchet MS', category: 'System Sans' },
  { value: 'Segoe UI', category: 'System Sans' },
  { value: 'Calibri', category: 'System Sans' },
  { value: 'Cambria', category: 'System Serif' },
  { value: 'Impact', category: 'System Display' },
  { value: 'Comic Sans MS', category: 'System Casual' },
  { value: 'Courier New', category: 'System Mono' },
  { value: 'Lucida Console', category: 'System Mono' },
  { value: 'Brush Script MT', category: 'System Script' },
].map(f => ({ ...f, label: `${f.value} (${f.category})` }));

// Cache the font list so it's only fetched once per session
let _googleFontsCache = null;

const fetchGoogleFonts = async () => {
  if (_googleFontsCache) return _googleFontsCache;
  const res = await fetch(
    `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=popularity&fields=items(family,category)`
  );
  if (!res.ok) throw new Error('Failed to fetch Google Fonts');
  const data = await res.json();
  const CATEGORY_LABELS = {
    'sans-serif': 'Sans-Serif',
    'serif': 'Serif',
    'display': 'Display',
    'handwriting': 'Handwriting',
    'monospace': 'Monospace',
  };
  const googleFonts = data.items.map(f => ({
    value: f.family,
    label: `${f.family} (${CATEGORY_LABELS[f.category] || f.category})`,
    category: CATEGORY_LABELS[f.category] || f.category,
  }));
  // Prepend system fonts before Google Fonts
  _googleFontsCache = [...SYSTEM_FONTS, ...googleFonts];
  return _googleFontsCache;
};

// Custom Searchable Combobox Component
const FontSelector = ({ value, onChange, placeholder = "Select Font" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [fonts, setFonts] = useState(
    ALL_FONTS.map(f => ({
      ...f,
      category: f.label.split('(')[1]?.replace(')', '') || 'Style',
    }))
  );
  const [isLoadingFonts, setIsLoadingFonts] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const containerRef = useRef(null);
  const activeRef = useRef(null);
  const listRef = useRef(null);

  // Fetch all Google Fonts when dropdown first opens
  const loadFonts = async () => {
    if (fontsLoaded || isLoadingFonts) return;
    setIsLoadingFonts(true);
    try {
      const data = await fetchGoogleFonts();
      setFonts(data);
      setFontsLoaded(true);
    } catch {
      // silently keep the static fallback list
    } finally {
      setIsLoadingFonts(false);
    }
  };

  const handleOpen = () => {
    setSearch('');
    setIsOpen(true);
    loadFonts();
  };

  useEffect(() => {
    if (isOpen && activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
  }, [isOpen, fonts]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredFonts = fonts.filter(f =>
    f.value.toLowerCase().includes(search.toLowerCase()) ||
    (f.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (fontName) => {
    loadGoogleFont(fontName);
    onChange(fontName);
    setIsOpen(false);
  };

  return (
    <div className={styles.fontSelectContainer} ref={containerRef}>
      <div className={styles.fontSelectWrapper}>
        <input
          type="text"
          className={styles.fontSearchInput}
          value={isOpen ? search : value}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) { setIsOpen(true); loadFonts(); }
          }}
          onFocus={(e) => {
            handleOpen();
            setTimeout(() => { if (e.target) e.target.select(); }, 50);
          }}
          onClick={() => { if (!isOpen) handleOpen(); }}
          placeholder={placeholder}
          style={{ fontFamily: value ? `"${value}", sans-serif` : undefined }}
        />
        <button
          type="button"
          className={`${styles.dropdownArrowBtn} ${isOpen ? styles.dropdownArrowBtnOpen : ''}`}
          onClick={() => { if (!isOpen) { handleOpen(); } else { setIsOpen(false); } }}
          aria-label="Toggle font list"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <ul className={styles.fontDropdownList} ref={listRef}>
          {isLoadingFonts ? (
            <li className={styles.fontDropdownLoading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Loading 1500+ fonts...
            </li>
          ) : filteredFonts.length > 0 ? (
            filteredFonts.slice(0, 120).map((f) => (
              <li
                key={f.value}
                ref={value === f.value ? activeRef : null}
                className={`${styles.fontDropdownItem} ${value === f.value ? styles.fontDropdownItemActive : ''}`}
                onClick={() => handleSelect(f.value)}
                style={{ fontFamily: `"${f.value}", sans-serif` }}
              >
                <span className={styles.fontItemName}>{f.value}</span>
                <span className={styles.fontItemCategory}>{f.category}</span>
              </li>
            ))
          ) : (
            <li className={styles.fontDropdownNoResults}>No fonts found</li>
          )}
          {!isLoadingFonts && filteredFonts.length > 120 && (
            <li className={styles.fontDropdownMoreHint}>
              {filteredFonts.length - 120} more - type to filter
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

const Certificate = () => {
  // Mode: 'single' vs 'bulk'
  const [mode, setMode] = useState('single');

  // Manual Template Upload state
  const [templateImage, setTemplateImage] = useState('');
  const [templateFileName, setTemplateFileName] = useState('');
  const [templateDimensions, setTemplateDimensions] = useState(null);
  
  // Single Recipient inputs
  const [name, setName] = useState('');
  const [date, setDate] = useState(() => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    return `${d} / ${m} / ${y}`;
  });
  const [content, setContent] = useState('');
  
  // Custom overlays styling & position state
  const [activeTab, setActiveTab] = useState('name'); // 'name', 'date', 'content', 'sign'
  
  const [nameX, setNameX] = useState(50);
  const [nameY, setNameY] = useState(42);
  const [nameFont, setNameFont] = useState('Playfair Display');
  const [nameSize, setNameSize] = useState(38);
  const [nameColor, setNameColor] = useState('#1d2d44');
  const [nameWeight, setNameWeight] = useState('700');
  const [nameItalic, setNameItalic] = useState(false);
  
  const [dateX, setDateX] = useState(30);
  const [dateY, setDateY] = useState(82);
  const [dateSize, setDateSize] = useState(15);
  const [dateFont, setDateFont] = useState('Montserrat');
  const [dateColor, setDateColor] = useState('#1d2d44');
  const [dateWeight, setDateWeight] = useState('500');
  const [dateItalic, setDateItalic] = useState(false);
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  const [contentX, setContentX] = useState(50);
  const [contentY, setContentY] = useState(56);
  const [contentSize, setContentSize] = useState(15);
  const [contentFont, setContentFont] = useState('Montserrat');
  const [contentColor, setContentColor] = useState('#334155');
  const [contentWeight, setContentWeight] = useState('400');
  const [contentItalic, setContentItalic] = useState(false);

  // Signature overlay state
  const [signatureImage, setSignatureImage] = useState('');
  const [signX, setSignX] = useState(70);
  const [signY, setSignY] = useState(82);
  const [signSize, setSignSize] = useState(20);

  // Bulk generation state
  const [recipients, setRecipients] = useState([]);
  const [rawHeaders, setRawHeaders] = useState(['Recipient Name', 'Course / Subject', 'Date']);
  const [columnMapping, setColumnMapping] = useState({
    name: 'Recipient Name',
    date: 'Date',
    content: 'Course / Subject'
  });
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [excelDragActive, setExcelDragActive] = useState(false);
  const [showManualPaste, setShowManualPaste] = useState(false);
  const [manualPasteText, setManualPasteText] = useState('');
  const [manualPasteContent, setManualPasteContent] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  // Progress Modal State
  const [isGenerating, setIsGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({
    isOpen: false,
    current: 0,
    total: 0,
    percent: 0,
    status: '',
    currentName: ''
  });

  // Dragging states
  const [activeDrag, setActiveDrag] = useState(null); // 'name', 'date', 'content', 'sign'
  const [dragActive, setDragActive] = useState(false);

  const wrapperRef = useRef(null);
  const fileInputRef = useRef(null);
  const excelFileInputRef = useRef(null);
  const calendarPopoverRef = useRef(null);
  const dayInputRef = useRef(null);
  const monthInputRef = useRef(null);
  const yearInputRef = useRef(null);
  const nameColorInputRef = useRef(null);
  const dateColorInputRef = useRef(null);
  const contentColorInputRef = useRef(null);
  const abortRef = useRef({ cancelled: false });

  // Helper: parse DD / MM / YYYY or YYYY-MM-DD into parts
  const parseDateParts = (dateStr) => {
    if (typeof dateStr !== 'string') return { day: '', month: '', year: '' };
    const clean = dateStr.trim();
    if (!clean) return { day: '', month: '', year: '' };

    // ISO format: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      const [y, m, d] = clean.split('-');
      return { day: d, month: m, year: y };
    }

    // Slash separated: e.g. "DD / MM / YYYY" or " / 3 / 2026"
    if (clean.includes('/')) {
      const parts = clean.split('/');
      return {
        day: (parts[0] || '').trim().slice(0, 2),
        month: (parts[1] || '').trim().slice(0, 2),
        year: (parts[2] || '').trim().slice(0, 4)
      };
    }

    // Dash separated: e.g. "DD-MM-YYYY" or "YYYY-MM-DD"
    if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts[0].trim().length === 4) {
        return {
          year: (parts[0] || '').trim().slice(0, 4),
          month: (parts[1] || '').trim().slice(0, 2),
          day: (parts[2] || '').trim().slice(0, 2)
        };
      }
      return {
        day: (parts[0] || '').trim().slice(0, 2),
        month: (parts[1] || '').trim().slice(0, 2),
        year: (parts[2] || '').trim().slice(0, 4)
      };
    }

    // Space separated: e.g. "12 03 2026"
    const spaceParts = clean.split(/\s+/).filter(Boolean);
    if (spaceParts.length === 3) {
      return {
        day: spaceParts[0].slice(0, 2),
        month: spaceParts[1].slice(0, 2),
        year: spaceParts[2].slice(0, 4)
      };
    }

    return { day: '', month: '', year: '' };
  };

  const { day: dateDay, month: dateMonth, year: dateYear } = parseDateParts(date);

  const handleDayChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 2);
    if (val.length === 2 && parseInt(val, 10) > 31) {
      val = '31';
    }
    setDate(`${val} / ${dateMonth} / ${dateYear}`);
    if (val.length === 2 && monthInputRef.current) {
      monthInputRef.current.focus();
      monthInputRef.current.select();
    }
  };

  const handleMonthChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 2);
    if (val.length === 2 && parseInt(val, 10) > 12) {
      val = '12';
    }
    setDate(`${dateDay} / ${val} / ${dateYear}`);
    if (val.length === 2 && yearInputRef.current) {
      yearInputRef.current.focus();
      yearInputRef.current.select();
    }
  };

  const handleYearChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setDate(`${dateDay} / ${dateMonth} / ${val}`);
  };

  const handleDayKeyDown = (e) => {
    if (e.key === '/' || e.key === '-' || e.key === '.') {
      e.preventDefault();
      monthInputRef.current?.focus();
      monthInputRef.current?.select();
    } else if (e.key === 'ArrowRight' && e.target.selectionStart === e.target.value.length) {
      monthInputRef.current?.focus();
    }
  };

  const handleMonthKeyDown = (e) => {
    if (e.key === '/' || e.key === '-' || e.key === '.') {
      e.preventDefault();
      yearInputRef.current?.focus();
      yearInputRef.current?.select();
    } else if (e.key === 'Backspace' && !dateMonth) {
      dayInputRef.current?.focus();
      dayInputRef.current?.select();
    } else if (e.key === 'ArrowLeft' && e.target.selectionStart === 0) {
      dayInputRef.current?.focus();
    } else if (e.key === 'ArrowRight' && e.target.selectionStart === e.target.value.length) {
      yearInputRef.current?.focus();
    }
  };

  const handleYearKeyDown = (e) => {
    if (e.key === 'Backspace' && !dateYear) {
      monthInputRef.current?.focus();
      monthInputRef.current?.select();
    } else if (e.key === 'ArrowLeft' && e.target.selectionStart === 0) {
      monthInputRef.current?.focus();
    }
  };

  const handleDatePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').trim();
    const parts = parseDateParts(text);
    if (parts.day || parts.month || parts.year) {
      setDate(`${parts.day} / ${parts.month} / ${parts.year}`);
    }
  };

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calViewYear, setCalViewYear] = useState(() => new Date().getFullYear());
  const [calViewMonth, setCalViewMonth] = useState(() => new Date().getMonth());

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  useEffect(() => {
    if (!isCalendarOpen) return;
    const handleOutsideClick = (e) => {
      if (calendarPopoverRef.current && !calendarPopoverRef.current.contains(e.target)) setIsCalendarOpen(false);
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [isCalendarOpen]);

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();
    const startDay = new Date(calViewYear, calViewMonth, 1).getDay();
    const daysInPrev = new Date(calViewYear, calViewMonth, 0).getDate();
    const days = [];
    for (let i = startDay - 1; i >= 0; i--) days.push({ day: daysInPrev - i, isCurrentMonth: false });
    for (let d = 1; d <= daysInMonth; d++) days.push({ day: d, isCurrentMonth: true });
    const total = days.length <= 35 ? 35 : 42;
    for (let n = 1; n <= total - days.length; n++) days.push({ day: n, isCurrentMonth: false });
    return days;
  }, [calViewYear, calViewMonth]);

  const todayInfo = useMemo(() => { const n = new Date(); return { day: n.getDate(), month: n.getMonth(), year: n.getFullYear() }; }, []);
  const selectedDateInfo = useMemo(() => ({
    day: parseInt(dateDay, 10), month: parseInt(dateMonth, 10) - 1, year: parseInt(dateYear, 10)
  }), [dateDay, dateMonth, dateYear]);

  const handleToggleCalendar = (e) => {
    e.stopPropagation();
    if (!isCalendarOpen) {
      const p = parseDateParts(date);
      const y = parseInt(p.year, 10); const m = parseInt(p.month, 10);
      if (!isNaN(y) && y > 1900 && y < 2100) setCalViewYear(y);
      else setCalViewYear(new Date().getFullYear());
      if (!isNaN(m) && m >= 1 && m <= 12) setCalViewMonth(m - 1);
      else setCalViewMonth(new Date().getMonth());
    }
    setIsCalendarOpen(prev => !prev);
  };

  const handleSelectDay = (dayNum) => {
    const dd = String(dayNum).padStart(2, '0');
    const mm = String(calViewMonth + 1).padStart(2, '0');
    setDate(`${dd} / ${mm} / ${calViewYear}`);
    setIsCalendarOpen(false);
  };

  const renderDatePicker = () => (
    <div className={styles.datePickerWrapper} ref={calendarPopoverRef}>
      <div className={styles.stylishDateCard} onPaste={handleDatePaste}>
        <div className={styles.dateSegmentsGroup}>
          <div className={styles.dateSegmentPill}>
            <input
              ref={dayInputRef}
              type="text"
              inputMode="numeric"
              className={styles.dateSegmentInput}
              placeholder="DD"
              value={dateDay}
              onChange={handleDayChange}
              onKeyDown={handleDayKeyDown}
              onFocus={(e) => e.target.select()}
              maxLength={2}
              aria-label="Day"
            />
            <span className={styles.dateSegmentTag}>Day</span>
          </div>
          <span className={styles.dateSlashDivider}>/</span>
          <div className={styles.dateSegmentPill}>
            <input
              ref={monthInputRef}
              type="text"
              inputMode="numeric"
              className={styles.dateSegmentInput}
              placeholder="MM"
              value={dateMonth}
              onChange={handleMonthChange}
              onKeyDown={handleMonthKeyDown}
              onFocus={(e) => e.target.select()}
              maxLength={2}
              aria-label="Month"
            />
            <span className={styles.dateSegmentTag}>Month</span>
          </div>
          <span className={styles.dateSlashDivider}>/</span>
          <div className={`${styles.dateSegmentPill} ${styles.dateSegmentPillYear}`}>
            <input
              ref={yearInputRef}
              type="text"
              inputMode="numeric"
              className={styles.dateSegmentInput}
              placeholder="YYYY"
              value={dateYear}
              onChange={handleYearChange}
              onKeyDown={handleYearKeyDown}
              onFocus={(e) => e.target.select()}
              maxLength={4}
              aria-label="Year"
            />
            <span className={styles.dateSegmentTag}>Year</span>
          </div>
        </div>
        <button type="button" className={`${styles.stylishCalendarIconBtn} ${isCalendarOpen ? styles.calendarBtnActive : ''}`} onClick={handleToggleCalendar} aria-label="Open calendar picker">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
      </div>
      {isCalendarOpen && (
        <div className={styles.calendarPopover}>
          <div className={styles.calendarHeader}>
            <button type="button" className={styles.calendarNavBtn} onClick={(e) => { e.stopPropagation(); calViewMonth === 0 ? (setCalViewMonth(11), setCalViewYear(y => y - 1)) : setCalViewMonth(m => m - 1); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <div className={styles.calendarMonthTitle}>{MONTH_NAMES[calViewMonth]} {calViewYear}</div>
            <button type="button" className={styles.calendarNavBtn} onClick={(e) => { e.stopPropagation(); calViewMonth === 11 ? (setCalViewMonth(0), setCalViewYear(y => y + 1)) : setCalViewMonth(m => m + 1); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
          <div className={styles.calendarWeekdaysGrid}>
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(w => <span key={w} className={styles.calendarWeekdayName}>{w}</span>)}
          </div>
          <div className={styles.calendarDaysGrid}>
            {calendarDays.map((item, idx) => {
              const isSelected = item.isCurrentMonth && selectedDateInfo.day === item.day && selectedDateInfo.month === calViewMonth && selectedDateInfo.year === calViewYear;
              const isToday = item.isCurrentMonth && todayInfo.day === item.day && todayInfo.month === calViewMonth && todayInfo.year === calViewYear;
              if (!item.isCurrentMonth) return <span key={idx} className={`${styles.calendarDayCell} ${styles.dayCellMuted}`}>{item.day}</span>;
              return <button key={idx} type="button" className={`${styles.calendarDayCell} ${isSelected ? styles.dayCellSelected : ''} ${isToday ? styles.dayCellToday : ''}`} onClick={() => handleSelectDay(item.day)}>{item.day}</button>;
            })}
          </div>
          <div className={styles.calendarFooter}>
            <button type="button" className={styles.calendarQuickBtn} onClick={(e) => { e.stopPropagation(); const n = new Date(); setCalViewYear(n.getFullYear()); setCalViewMonth(n.getMonth()); handleSelectDay(n.getDate()); }}>Today</button>
            <button type="button" className={styles.calendarCloseBtn} onClick={() => setIsCalendarOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );

  // Pre-load default Google Fonts on mount
  useEffect(() => {
    ['Playfair Display', 'Cinzel', 'Great Vibes', 'Alex Brush', 'Outfit', 'Montserrat', 'Inter', 'Lora'].forEach(f => {
      loadGoogleFont(f);
    });
  }, []);

  // Custom template image upload handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setTemplateFileName(file.name);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdfDoc.getPage(1);
        const scale = 2.5;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/png');
        setTemplateImage(dataUrl);
        setTemplateDimensions({ width: Math.round(viewport.width), height: Math.round(viewport.height) });
      } catch (err) {
        alert('Error reading PDF: ' + err.message);
      }
    } else if (file.type.startsWith('image/')) {
      setTemplateFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setTemplateImage(dataUrl);
        const img = new Image();
        img.onload = () => {
          setTemplateDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveTemplate = () => {
    setTemplateImage('');
    setTemplateFileName('');
    setTemplateDimensions(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Excel / CSV File Drop and Upload Handlers
  const handleExcelDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setExcelDragActive(true);
    } else if (e.type === "dragleave") {
      setExcelDragActive(false);
    }
  };

  const processExcelUpload = async (file) => {
    if (!file) return;
    try {
      const { headers, rows, detectedMapping } = await readExcelFile(file);
      setUploadedFileName(file.name);
      setRawHeaders(headers);
      setColumnMapping(detectedMapping);

      const parsedRecipients = rows.map((r, idx) => ({
        id: `row-${idx + 1}`,
        name: r[detectedMapping.name] || `Recipient ${idx + 1}`,
        date: r[detectedMapping.date] || date,
        content: r[detectedMapping.content] || content,
        isSelected: true,
        rawData: r
      }));

      setRecipients(parsedRecipients);
      setActivePreviewIndex(0);
    } catch (err) {
      alert(`Error reading Excel file: ${err.message}`);
    }
  };

  const handleExcelDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExcelDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processExcelUpload(e.dataTransfer.files[0]);
    }
  };

  const handleExcelFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processExcelUpload(e.target.files[0]);
    }
  };


  // Manual Bulk Paste Handler
  const handleImportManualPaste = () => {
    if (!manualPasteText.trim()) return;
    const { headers, rows, detectedMapping } = parseManualPastedText(manualPasteText);
    setRawHeaders(headers);
    setColumnMapping(detectedMapping);
    setUploadedFileName('Pasted_Data.txt');

    // Use manualPasteContent if the user filled it in, otherwise fall back to the global content
    const contentForAll = manualPasteContent.trim() || content;

    const newRecipients = rows.map((r, idx) => ({
      id: `pasted-${idx + 1}`,
      name: r[detectedMapping.name] || r.Name || `Recipient ${idx + 1}`,
      date: r[detectedMapping.date] || date,
      content: r[detectedMapping.content] || contentForAll,
      isSelected: true,
      rawData: r
    }));

    setRecipients(newRecipients);
    setActivePreviewIndex(0);
    setShowManualPaste(false);
    setManualPasteText('');
    setManualPasteContent('');
  };

  // Recipients Table Row Handlers
  const handleToggleSelectAll = (e) => {
    const checked = e.target.checked;
    setRecipients(prev => prev.map(r => ({ ...r, isSelected: checked })));
  };

  const handleToggleSelectRow = (id) => {
    setRecipients(prev => prev.map(r => r.id === id ? { ...r, isSelected: !r.isSelected } : r));
  };

  const handleUpdateRowName = (id, newName) => {
    setRecipients(prev => prev.map(r => r.id === id ? { ...r, name: newName } : r));
  };

  const handleDeleteRow = (id) => {
    setRecipients(prev => {
      const filtered = prev.filter(r => r.id !== id);
      if (activePreviewIndex >= filtered.length) {
        setActivePreviewIndex(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
  };

  const handleAddRecipientRow = () => {
    const newId = `custom-${Date.now()}`;
    const newRow = {
      id: newId,
      name: 'New Recipient',
      date: date || '2026-09-30',
      content: content || 'Certificate of Achievement',
      isSelected: true
    };
    setRecipients(prev => [...prev, newRow]);
    setActivePreviewIndex(recipients.length);
  };

  // Filtered recipients based on table search
  const filteredRecipients = useMemo(() => {
    if (!tableSearch.trim()) return recipients;
    const query = tableSearch.toLowerCase();
    return recipients.filter(r => 
      r.name.toLowerCase().includes(query) || 
      (r.content && r.content.toLowerCase().includes(query))
    );
  }, [recipients, tableSearch]);

  const selectedRecipients = useMemo(() => {
    return recipients.filter(r => r.isSelected);
  }, [recipients]);

  // Current active recipient for live preview
  const currentRecipient = mode === 'bulk' && recipients.length > 0 
    ? (recipients[activePreviewIndex] || recipients[0])
    : { name, date, content };

  // Pointer Drag-and-Drop Positioning Logic for Text Overlays
  const handlePointerDown = (e, type) => {
    e.preventDefault();
    setActiveDrag(type);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e, type) => {
    if (activeDrag !== type || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const clampedX = Math.max(0, Math.min(100, Math.round(x)));
    const clampedY = Math.max(0, Math.min(100, Math.round(y)));
    
    if (type === 'name') {
      setNameX(clampedX);
      setNameY(clampedY);
    } else if (type === 'date') {
      setDateX(clampedX);
      setDateY(clampedY);
    } else if (type === 'content') {
      setContentX(clampedX);
      setContentY(clampedY);
    } else if (type === 'sign') {
      setSignX(clampedX);
      setSignY(clampedY);
    }
  };

  const handlePointerUp = (e) => {
    setActiveDrag(null);
    if (e.target && e.target.releasePointerCapture && e.pointerId) {
      try {
        e.target.releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setSignatureImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Base styling configuration object for generator
  const getGeneratorBaseConfig = () => {
    const previewWidth = wrapperRef.current?.clientWidth || 800;
    return {
      templateImage,
      templateId: 'custom',
      signatureImage,
      previewWidth,
      quality: 'high',
      defaultDate: date,
      defaultContent: content,
      styles: {
        nameX, nameY, nameSize, nameFont, nameColor, nameWeight, nameItalic,
        dateX, dateY, dateSize, dateFont, dateColor, dateWeight, dateItalic, dateFormat,
        contentX, contentY, contentSize, contentFont, contentColor, contentWeight, contentItalic,
        signX, signY, signSize,
        textAlign: 'center'
      }
    };
  };

  // Single Certificate Download (PDF)
  const handleDownloadSinglePdf = async () => {
    if (!templateImage) return;
    setIsGenerating(true);
    try {
      const config = getGeneratorBaseConfig();
      await downloadSinglePdf({
        ...config,
        name: mode === 'bulk' ? currentRecipient.name : name,
        date: mode === 'bulk' ? (currentRecipient.date || date) : date,
        content: mode === 'bulk' ? (currentRecipient.content || content) : content
      });
    } catch (err) {
      alert('Error generating PDF: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Single Certificate Download (PNG)
  const handleDownloadSinglePng = async () => {
    if (!templateImage) return;
    setIsGenerating(true);
    try {
      const config = getGeneratorBaseConfig();
      await downloadSinglePng({
        ...config,
        name: mode === 'bulk' ? currentRecipient.name : name,
        date: mode === 'bulk' ? (currentRecipient.date || date) : date,
        content: mode === 'bulk' ? (currentRecipient.content || content) : content
      });
    } catch (err) {
      alert('Error generating PNG: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Bulk ZIP Download (Individual High-Quality PDFs)
  const handleDownloadBulkZip = async () => {
    if (!templateImage) return;
    if (selectedRecipients.length === 0) {
      alert('Please select at least one recipient to generate certificates.');
      return;
    }

    abortRef.current = { cancelled: false };
    setBulkProgress({
      isOpen: true,
      current: 0,
      total: selectedRecipients.length,
      percent: 0,
      status: `Starting bulk PDF generation for ${selectedRecipients.length} recipients...`,
      currentName: ''
    });

    try {
      const baseConfig = getGeneratorBaseConfig();
      await generateBulkPdfsAsZip(
        baseConfig,
        selectedRecipients,
        (progress) => {
          setBulkProgress(prev => ({
            ...prev,
            current: progress.current,
            total: progress.total,
            percent: progress.percent,
            status: progress.status,
            currentName: progress.currentName
          }));
        },
        abortRef
      );

      setTimeout(() => {
        setBulkProgress(prev => ({ ...prev, isOpen: false }));
      }, 1500);
    } catch (err) {
      if (!abortRef.current.cancelled) {
        alert('Bulk generation error: ' + err.message);
      }
      setBulkProgress(prev => ({ ...prev, isOpen: false }));
    }
  };

  // Bulk ZIP Download (Individual High-Quality PNGs)
  const handleDownloadBulkPngZip = async () => {
    if (!templateImage) return;
    if (selectedRecipients.length === 0) {
      alert('Please select at least one recipient to generate certificates.');
      return;
    }

    abortRef.current = { cancelled: false };
    setBulkProgress({
      isOpen: true,
      current: 0,
      total: selectedRecipients.length,
      percent: 0,
      status: `Starting bulk PNG generation for ${selectedRecipients.length} recipients...`,
      currentName: ''
    });

    try {
      const baseConfig = getGeneratorBaseConfig();
      await generateBulkPngsAsZip(
        baseConfig,
        selectedRecipients,
        (progress) => {
          setBulkProgress(prev => ({
            ...prev,
            current: progress.current,
            total: progress.total,
            percent: progress.percent,
            status: progress.status,
            currentName: progress.currentName
          }));
        },
        abortRef
      );

      setTimeout(() => {
        setBulkProgress(prev => ({ ...prev, isOpen: false }));
      }, 1500);
    } catch (err) {
      if (!abortRef.current.cancelled) {
        alert('Bulk generation error: ' + err.message);
      }
      setBulkProgress(prev => ({ ...prev, isOpen: false }));
    }
  };

  // Bulk Merged Multi-Page PDF Download
  const handleDownloadBulkMerged = async () => {
    if (!templateImage) return;
    if (selectedRecipients.length === 0) {
      alert('Please select at least one recipient to generate certificates.');
      return;
    }

    abortRef.current = { cancelled: false };
    setBulkProgress({
      isOpen: true,
      current: 0,
      total: selectedRecipients.length,
      percent: 0,
      status: `Generating combined multi-page PDF for ${selectedRecipients.length} recipients...`,
      currentName: ''
    });

    try {
      const baseConfig = getGeneratorBaseConfig();
      await generateBulkMergedPdf(
        baseConfig,
        selectedRecipients,
        (progress) => {
          setBulkProgress(prev => ({
            ...prev,
            current: progress.current,
            total: progress.total,
            percent: progress.percent,
            status: progress.status,
            currentName: progress.currentName
          }));
        },
        abortRef
      );

      setTimeout(() => {
        setBulkProgress(prev => ({ ...prev, isOpen: false }));
      }, 1500);
    } catch (err) {
      if (!abortRef.current.cancelled) {
        alert('Bulk generation error: ' + err.message);
      }
      setBulkProgress(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleCancelBulkGeneration = () => {
    abortRef.current.cancelled = true;
    setBulkProgress(prev => ({
      ...prev,
      status: 'Cancelling bulk generation...'
    }));
    setTimeout(() => {
      setBulkProgress(prev => ({ ...prev, isOpen: false }));
    }, 500);
  };

  const handleReset = () => {
    setName('');
    setDate('');
    setDateFormat('DD/MM/YYYY');
    setContent('');
    setSignatureImage('');
    handleRemoveTemplate();
  };

  // Active displayed values for preview overlay
  const previewName = mode === 'bulk' ? (currentRecipient?.name || '') : name;
  const previewDate = mode === 'bulk' ? (currentRecipient?.date || date) : date;
  const previewContent = mode === 'bulk' ? (currentRecipient?.content || content) : content;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dynamic Certificate Studio</h1>
        <p className={styles.subtitle}>Design stunning professional certificates — one at a time or in bulk. Upload your template, customize every detail, and export print-ready PDFs in seconds.</p>
      </div>

      <div className={styles.layout}>
        {/* Left Side Controls Panel */}
        <div className={styles.controlsPanel}>
          
          {/* Mode Switcher */}
          <div className={styles.modeSwitcher}>
            <button
              type="button"
              className={`${styles.modeTab} ${mode === 'single' ? styles.modeTabActive : ''}`}
              onClick={() => setMode('single')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Single Certificate
            </button>
            <button
              type="button"
              className={`${styles.modeTab} ${mode === 'bulk' ? styles.modeTabActive : ''}`}
              onClick={() => setMode('bulk')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Bulk Certificates
            </button>
          </div>

          {/* Section 1: Dedicated Manual Template Upload */}
          <div>
            <h3 className={styles.sectionTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              1. Upload Certificate Template
            </h3>

            {templateImage ? (
              /* Uploaded Template Card with Details & Actions */
              <div className={styles.loadedTemplateCard}>
                <div className={styles.loadedTemplatePreviewRow}>
                  <img 
                    src={templateImage} 
                    alt="Uploaded Certificate Template" 
                    className={styles.loadedTemplateThumb} 
                  />
                  <div className={styles.loadedTemplateMeta}>
                    <span className={styles.loadedTemplateStatus}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      Template Ready
                    </span>
                    <h4 className={styles.loadedTemplateName} title={templateFileName || 'Custom Template'}>
                      {templateFileName || 'Custom Certificate Template'}
                    </h4>
                    <span className={styles.loadedTemplateDims}>
                      {templateDimensions ? `${templateDimensions.width} × ${templateDimensions.height} px (High Resolution)` : 'Custom Template Loaded'}
                    </span>
                  </div>
                </div>

                <div className={styles.loadedTemplateActions}>
                  <button 
                    type="button" 
                    className={styles.loadedTemplateChangeBtn}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Change Image
                  </button>
                  <button 
                    type="button" 
                    className={styles.loadedTemplateRemoveBtn}
                    onClick={handleRemoveTemplate}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              /* Custom Template Upload Dropzone */
              <div 
                className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <svg className={styles.uploadIcon} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className={styles.uploadText}>Upload Custom Certificate Template</span>
                <span className={styles.uploadSubtext}>Drag &amp; drop or click to upload PNG, JPG, PDF or SVG</span>
                <div className={styles.excelFormatsBadge} style={{ marginTop: '0.25rem' }}>
                  <span className={styles.formatTag}>PNG</span>
                  <span className={styles.formatTag}>JPG</span>
                  <span className={styles.formatTag}>PDF</span>
                  <span className={styles.formatTag}>SVG</span>
                  <span className={styles.formatTag}>WEBP</span>
                </div>
              </div>
            )}

            <input 
              ref={fileInputRef}
              type="file" 
              className={styles.hiddenInput} 
              accept="image/*,.pdf" 
              onChange={handleFileChange}
            />
          </div>

          {/* Section 2: Details / Bulk Excel Input */}
          {mode === 'single' ? (
            <div>
              <h3 className={styles.sectionTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
                </svg>
                2. Certificate Details
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className={styles.controlGroup}>
                  <label className={styles.label}>Recipient Name</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="Enter Recipient Name..." 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>Issuance Date</label>
                  {renderDatePicker()}
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>Certificate Content / Description</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Enter certificate body text (e.g. 'for outstanding completion of...')" 
                    value={content}
                    rows={3}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>Official Signature</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      style={{ display: 'none' }}
                      id="signature-file-input"
                    />
                    <label 
                      htmlFor="signature-file-input"
                      style={{ 
                        flex: 1, 
                        textAlign: 'center', 
                        cursor: 'pointer',
                        padding: '0.6rem',
                        background: '#1d2d44',
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        transition: 'background 0.2s',
                        display: 'inline-block'
                      }}
                    >
                      {signatureImage ? 'Change Signature' : 'Upload Signature Image (PNG)'}
                    </label>
                    {signatureImage && (
                      <button
                        type="button"
                        onClick={() => setSignatureImage('')}
                        style={{
                          padding: '0.6rem 0.8rem',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '500'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* BULK EXCEL MODE CONTROLS */
            <div className={styles.bulkExcelSection}>
              <h3 className={styles.sectionTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                2. Bulk Data Import (Excel / CSV)
              </h3>

              {/* Excel Drag & Drop Area */}
              <div 
                className={`${styles.excelDropZone} ${excelDragActive ? styles.excelDropZoneActive : ''}`}
                onDragEnter={handleExcelDrag}
                onDragOver={handleExcelDrag}
                onDragLeave={handleExcelDrag}
                onDrop={handleExcelDrop}
                onClick={() => excelFileInputRef.current.click()}
              >
                <div className={styles.excelIconWrap}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.17 3.25Q21.5 3.25 21.76 3.5 22 3.74 22 4.1v15.8q0 .35-.24.6-.26.25-.59.25H7.83q-.35 0-.6-.25-.24-.25-.24-.6V17H2.83q-.35 0-.6-.24-.23-.26-.23-.61V7.85q0-.35.23-.6.25-.25.6-.25H7V4.1q0-.36.24-.6.25-.25.59-.25zM7 8.5H3.5v7H7zm13.5-3.75H8.5v14.5h12zm-8.8 3.2h2.2l1.9 3.5 1.9-3.5h2.2l-2.9 4.8 3 5h-2.3l-2-3.7-2 3.7H9.8l3.1-4.9z"/>
                  </svg>
                </div>
                <h4 className={styles.excelUploadTitle}>
                  {uploadedFileName ? `Loaded: ${uploadedFileName}` : 'Upload Excel Sheet (.xlsx, .xls, .csv)'}
                </h4>
                <p className={styles.excelUploadSub}>
                  Drag and drop your spreadsheet here or click to browse
                </p>
                <div className={styles.excelFormatsBadge}>
                  <span className={styles.formatTag}>.XLSX</span>
                  <span className={styles.formatTag}>.XLS</span>
                  <span className={styles.formatTag}>.CSV</span>
                </div>
                <input 
                  ref={excelFileInputRef}
                  type="file" 
                  className={styles.hiddenInput} 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleExcelFileChange}
                />
              </div>

              {/* Quick Actions (Sample download + Manual Paste) */}
              <div className={styles.bulkQuickTools}>
                <button
                  type="button"
                  className={styles.sampleDownloadBtn}
                  onClick={() => downloadSampleExcelFile('xlsx')}
                  title="Download a formatted sample Excel file with sample student records"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Sample Excel
                </button>
                <button
                  type="button"
                  className={styles.manualToggleBtn}
                  onClick={() => setShowManualPaste(!showManualPaste)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  </svg>
                  {showManualPaste ? 'Hide Paste Box' : 'Quick Paste Names'}
                </button>
              </div>

              {/* Expandable Manual Paste Box */}
              {showManualPaste && (
                <div className={styles.manualPasteContainer}>
                  <div className={styles.manualPasteHeader}>
                    <span className={styles.manualPasteLabel}>Paste Recipient Names</span>
                    <span className={styles.manualPasteSubtext}>One per line</span>
                  </div>
                  <textarea 
                    className={styles.manualTextarea}
                    placeholder={"John Doe\nJane Smith\nRobert Johnson\n..."}
                    value={manualPasteText}
                    onChange={(e) => setManualPasteText(e.target.value)}
                  />

                  {/* Content for all */}
                  <div className={styles.manualPasteDateWrapper} style={{ marginTop: '0.75rem' }}>
                    <label className={styles.manualPasteDateLabel}>Course / Content (applied to all)</label>
                    <textarea
                      className={styles.manualTextarea}
                      style={{ minHeight: '60px', marginTop: '0.4rem' }}
                      placeholder="e.g. Full Stack Development Bootcamp"
                      value={manualPasteContent}
                      onChange={(e) => setManualPasteContent(e.target.value)}
                    />
                  </div>

                  <div className={styles.manualPasteDateWrapper}>
                    <label className={styles.manualPasteDateLabel}>Certificate Date (applied to all pasted names)</label>
                    {renderDatePicker()}
                  </div>
                  <button 
                    type="button" 
                    className={styles.importManualBtn}
                    onClick={handleImportManualPaste}
                  >
                    Import
                  </button>
                </div>
              )}

              {/* Signature Upload — below paste row */}
              <div className={styles.controlGroup}>
                <label className={styles.label}>Official Signature</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    style={{ display: 'none' }}
                    id="bulk-signature-file-input"
                  />
                  <label 
                    htmlFor="bulk-signature-file-input"
                    style={{ 
                      flex: 1, 
                      textAlign: 'center', 
                      cursor: 'pointer',
                      padding: '0.6rem',
                      background: '#1d2d44',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      transition: 'background 0.2s',
                      display: 'inline-block'
                    }}
                  >
                    {signatureImage ? 'Change Signature' : 'Upload Signature Image (PNG)'}
                  </label>
                  {signatureImage && (
                    <button
                      type="button"
                      onClick={() => setSignatureImage('')}
                      style={{
                        padding: '0.6rem 0.8rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '500'
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {signatureImage && (
                  <img src={signatureImage} alt="Signature Preview" style={{ marginTop: '0.5rem', maxHeight: '50px', objectFit: 'contain', borderRadius: '4px' }} />
                )}
              </div>


              {/* Recipients Data Table */}
              <div className={styles.tableContainer}>
                <div className={styles.tableToolbar}>
                  <div className={styles.tableSearchWrapper}>
                    <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input 
                      type="text"
                      className={styles.tableSearchInput}
                      placeholder="Search recipient names..."
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                    />
                  </div>
                  <div className={styles.tableStats}>
                    <span className={styles.selectedCountTag}>
                      {selectedRecipients.length} of {recipients.length} Selected
                    </span>
                  </div>
                </div>

                <div className={styles.tableScrollArea}>
                  <table className={styles.recipientsTable}>
                    <thead>
                      <tr>
                        <th style={{ width: '32px', textAlign: 'center' }}>
                          <input 
                            type="checkbox"
                            checked={recipients.length > 0 && selectedRecipients.length === recipients.length}
                            onChange={handleToggleSelectAll}
                          />
                        </th>
                        <th style={{ width: '36px' }}>#</th>
                        <th>Recipient Name</th>
                        <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecipients.map((rec, idx) => {
                        const isCurrentPreview = recipients[activePreviewIndex]?.id === rec.id;
                        return (
                          <tr key={rec.id} className={isCurrentPreview ? styles.activePreviewRow : ''}>
                            <td style={{ textAlign: 'center' }}>
                              <input 
                                type="checkbox"
                                checked={rec.isSelected}
                                onChange={() => handleToggleSelectRow(rec.id)}
                              />
                            </td>
                            <td style={{ opacity: 0.6 }}>{idx + 1}</td>
                            <td>
                              <input 
                                type="text"
                                className={styles.tableInputInline}
                                value={rec.name}
                                onChange={(e) => handleUpdateRowName(rec.id, e.target.value)}
                              />
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'center' }}>
                                <button
                                  type="button"
                                  className={styles.rowActionBtn}
                                  onClick={() => {
                                    const origIdx = recipients.findIndex(r => r.id === rec.id);
                                    if (origIdx !== -1) setActivePreviewIndex(origIdx);
                                  }}
                                  title="View on certificate preview"
                                >
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  className={`${styles.rowActionBtn} ${styles.rowDeleteBtn}`}
                                  onClick={() => handleDeleteRow(rec.id)}
                                  title="Remove recipient"
                                >
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className={styles.tableFooterActions}>
                  <button
                    type="button"
                    className={styles.addRowBtn}
                    onClick={handleAddRecipientRow}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Recipient
                  </button>
                  {recipients.length > 0 && (
                    <button 
                      type="button" 
                      className={styles.clearAllBtn}
                      onClick={() => setRecipients([])}
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Typography & Formatting */}
          <div>
            <h3 className={styles.sectionTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 7 4 4 20 4 20 7" />
                <line x1="9" y1="20" x2="15" y2="20" />
                <line x1="12" y1="4" x2="12" y2="20" />
              </svg>
              3. Style & Layout Settings
            </h3>
            
            <div className={styles.tabs}>
              <button 
                type="button" 
                className={`${styles.tab} ${activeTab === 'name' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('name')}
              >
                Name
              </button>
              <button 
                type="button" 
                className={`${styles.tab} ${activeTab === 'date' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('date')}
              >
                Date
              </button>
              <button 
                type="button" 
                className={`${styles.tab} ${activeTab === 'content' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('content')}
              >
                Content
              </button>
              <button 
                type="button" 
                className={`${styles.tab} ${activeTab === 'sign' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('sign')}
              >
                Signature
              </button>
            </div>

            {activeTab === 'name' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                <div className={styles.controlGroup}>
                  <label className={styles.label}>Font Family</label>
                  <FontSelector 
                    value={nameFont} 
                    onChange={(fontName) => setNameFont(fontName)} 
                    placeholder="Search name font..."
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>
                    Font Size <span className={styles.labelVal}>{nameSize}px</span>
                  </label>
                  <input 
                    type="range" 
                    min="14" 
                    max="80" 
                    className={styles.slider} 
                    value={nameSize} 
                    onChange={(e) => setNameSize(parseInt(e.target.value))}
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>Text Color</label>
                  <div className={styles.colorPresets}>
                    {PRESET_COLORS.map(c => (
                      <button 
                        key={c}
                        type="button"
                        className={`${styles.colorCircle} ${nameColor === c ? styles.colorCircleActive : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setNameColor(c)}
                        aria-label={`Select color ${c}`}
                      />
                    ))}
                    
                    <input 
                      ref={nameColorInputRef}
                      type="color" 
                      value={nameColor} 
                      onChange={(e) => setNameColor(e.target.value)} 
                      className={styles.hiddenColorInput}
                    />
                    
                    <button
                      type="button"
                      className={`${styles.colorCircle} ${styles.customColorSwatch} ${!PRESET_COLORS.includes(nameColor) ? styles.colorCircleActive : ''}`}
                      style={{
                        background: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                      }}
                      onClick={() => nameColorInputRef.current.click()}
                      title="Choose custom color..."
                    >
                      <span 
                        className={styles.customColorIndicator} 
                        style={!PRESET_COLORS.includes(nameColor) ? { backgroundColor: nameColor, border: '1px solid #f8fafc' } : {}}
                      >
                        🎨
                      </span>
                    </button>
                  </div>
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>Style</label>
                  <div className={styles.selectWrapper}>
                    <select 
                      className={styles.select} 
                      value={`${nameWeight}-${nameItalic ? 'italic' : 'normal'}`} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '400-normal') {
                          setNameWeight('400');
                          setNameItalic(false);
                        } else if (val === '400-italic') {
                          setNameWeight('400');
                          setNameItalic(true);
                        } else if (val === '700-normal') {
                          setNameWeight('700');
                          setNameItalic(false);
                        } else if (val === '700-italic') {
                          setNameWeight('700');
                          setNameItalic(true);
                        }
                        loadGoogleFont(nameFont);
                      }}
                    >
                      <option value="400-normal">Regular</option>
                      <option value="400-italic">Italic</option>
                      <option value="700-normal">Bold</option>
                      <option value="700-italic">Bold Italic</option>
                    </select>
                    <div className={styles.selectArrow}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>
                    Vertical Alignment (Y) <span className={styles.labelVal}>{nameY}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    className={styles.slider} 
                    value={nameY} 
                    onChange={(e) => setNameY(parseInt(e.target.value))}
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>
                    Horizontal Alignment (X) <span className={styles.labelVal}>{nameX}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    className={styles.slider} 
                    value={nameX} 
                    onChange={(e) => setNameX(parseInt(e.target.value))}
                  />
                </div>
              </div>
            ) : activeTab === 'date' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                <div className={styles.controlGroup}>
                  <label className={styles.label}>Font Family</label>
                  <FontSelector 
                    value={dateFont} 
                    onChange={(fontName) => setDateFont(fontName)} 
                    placeholder="Search date font..."
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>Display Format</label>
                  <div className={styles.selectWrapper}>
                    <select
                      className={styles.select}
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (Compact — 31/12/2026)</option>
                      <option value="DD-MM-YYYY">DD-MM-YYYY (Hyphens — 31-12-2026)</option>
                      <option value="DD.MM.YYYY">DD.MM.YYYY (Dots — 31.12.2026)</option>
                      <option value="DD MMM YYYY">DD MMM YYYY (Formal — 31 Dec 2026)</option>
                      <option value="DD MMMM YYYY">DD MMMM YYYY (Full Month — 31 December 2026)</option>
                      <option value="MMMM DD, YYYY">Month DD, YYYY (December 31, 2026)</option>
                      <option value="DD / MM / YYYY">DD / MM / YYYY (Spaced — 31 / 12 / 2026)</option>
                    </select>
                    <div className={styles.selectArrow}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>
                    Font Size <span className={styles.labelVal}>{dateSize}px</span>
                  </label>
                  <input 
                    type="range" 
                    min="10" 
                    max="36" 
                    className={styles.slider} 
                    value={dateSize} 
                    onChange={(e) => setDateSize(parseInt(e.target.value))}
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>Color</label>
                  <div className={styles.colorPresets}>
                    {PRESET_COLORS.map(c => (
                      <button 
                        key={c}
                        type="button"
                        className={`${styles.colorCircle} ${dateColor === c ? styles.colorCircleActive : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setDateColor(c)}
                        aria-label={`Select color ${c}`}
                      />
                    ))}
                    <input 
                      ref={dateColorInputRef}
                      type="color" 
                      value={dateColor} 
                      onChange={(e) => setDateColor(e.target.value)} 
                      className={styles.hiddenColorInput}
                    />
                    <button
                      type="button"
                      className={`${styles.colorCircle} ${styles.customColorSwatch} ${!PRESET_COLORS.includes(dateColor) ? styles.colorCircleActive : ''}`}
                      style={{
                        background: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                      }}
                      onClick={() => dateColorInputRef.current.click()}
                    >
                      <span className={styles.customColorIndicator}>🎨</span>
                    </button>
                  </div>
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>Style</label>
                  <div className={styles.selectWrapper}>
                    <select 
                      className={styles.select} 
                      value={`${dateWeight}-${dateItalic ? 'italic' : 'normal'}`} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '400-normal') {
                          setDateWeight('400');
                          setDateItalic(false);
                        } else if (val === '400-italic') {
                          setDateWeight('400');
                          setDateItalic(true);
                        } else if (val === '500-normal') {
                          setDateWeight('500');
                          setDateItalic(false);
                        } else if (val === '700-normal') {
                          setDateWeight('700');
                          setDateItalic(false);
                        } else if (val === '700-italic') {
                          setDateWeight('700');
                          setDateItalic(true);
                        }
                        loadGoogleFont(dateFont);
                      }}
                    >
                      <option value="400-normal">Regular</option>
                      <option value="400-italic">Italic</option>
                      <option value="500-normal">Medium</option>
                      <option value="700-normal">Bold</option>
                      <option value="700-italic">Bold Italic</option>
                    </select>
                    <div className={styles.selectArrow}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>
                    Vertical Alignment (Y) <span className={styles.labelVal}>{dateY}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    className={styles.slider} 
                    value={dateY} 
                    onChange={(e) => setDateY(parseInt(e.target.value))}
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>
                    Horizontal Alignment (X) <span className={styles.labelVal}>{dateX}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    className={styles.slider} 
                    value={dateX} 
                    onChange={(e) => setDateX(parseInt(e.target.value))}
                  />
                </div>
              </div>
            ) : activeTab === 'content' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                <div className={styles.controlGroup}>
                  <label className={styles.label}>Font Family</label>
                  <FontSelector 
                    value={contentFont} 
                    onChange={(fontName) => setContentFont(fontName)} 
                    placeholder="Search content font..."
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>
                    Font Size <span className={styles.labelVal}>{contentSize}px</span>
                  </label>
                  <input 
                    type="range" 
                    min="10" 
                    max="36" 
                    className={styles.slider} 
                    value={contentSize} 
                    onChange={(e) => setContentSize(parseInt(e.target.value))}
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>Color</label>
                  <div className={styles.colorPresets}>
                    {PRESET_COLORS.map(c => (
                      <button 
                        key={c}
                        type="button"
                        className={`${styles.colorCircle} ${contentColor === c ? styles.colorCircleActive : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setContentColor(c)}
                        aria-label={`Select color ${c}`}
                      />
                    ))}
                    <input 
                      ref={contentColorInputRef}
                      type="color" 
                      value={contentColor} 
                      onChange={(e) => setContentColor(e.target.value)} 
                      className={styles.hiddenColorInput}
                    />
                    <button
                      type="button"
                      className={`${styles.colorCircle} ${styles.customColorSwatch} ${!PRESET_COLORS.includes(contentColor) ? styles.colorCircleActive : ''}`}
                      style={{
                        background: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                      }}
                      onClick={() => contentColorInputRef.current.click()}
                    >
                      <span className={styles.customColorIndicator}>🎨</span>
                    </button>
                  </div>
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>Style</label>
                  <div className={styles.selectWrapper}>
                    <select 
                      className={styles.select} 
                      value={`${contentWeight}-${contentItalic ? 'italic' : 'normal'}`} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '400-normal') {
                          setContentWeight('400');
                          setContentItalic(false);
                        } else if (val === '400-italic') {
                          setContentWeight('400');
                          setContentItalic(true);
                        } else if (val === '500-normal') {
                          setContentWeight('500');
                          setContentItalic(false);
                        } else if (val === '700-normal') {
                          setContentWeight('700');
                          setContentItalic(false);
                        } else if (val === '700-italic') {
                          setContentWeight('700');
                          setContentItalic(true);
                        }
                        loadGoogleFont(contentFont);
                      }}
                    >
                      <option value="400-normal">Regular</option>
                      <option value="400-italic">Italic</option>
                      <option value="500-normal">Medium</option>
                      <option value="700-normal">Bold</option>
                      <option value="700-italic">Bold Italic</option>
                    </select>
                    <div className={styles.selectArrow}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>
                    Vertical Alignment (Y) <span className={styles.labelVal}>{contentY}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    className={styles.slider} 
                    value={contentY} 
                    onChange={(e) => setContentY(parseInt(e.target.value))}
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>
                    Horizontal Alignment (X) <span className={styles.labelVal}>{contentX}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    className={styles.slider} 
                    value={contentX} 
                    onChange={(e) => setContentX(parseInt(e.target.value))}
                  />
                </div>
              </div>
            ) : activeTab === 'sign' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                {!signatureImage ? (
                  <div style={{ 
                    padding: '1.5rem', 
                    textAlign: 'center', 
                    background: '#0f172a', 
                    borderRadius: '12px', 
                    border: '1px dashed rgba(255, 255, 255, 0.15)',
                    color: '#94a3b8',
                    fontSize: '0.85rem'
                  }}>
                    Please upload an official signature image in Step 2 above first.
                  </div>
                ) : (
                  <>
                    <div className={styles.controlGroup}>
                      <label className={styles.label}>
                        Signature Size <span className={styles.labelVal}>{signSize}%</span>
                      </label>
                      <input 
                        type="range" 
                        min="5" 
                        max="50" 
                        className={styles.slider} 
                        value={signSize} 
                        onChange={(e) => setSignSize(parseInt(e.target.value))}
                      />
                    </div>

                    <div className={styles.controlGroup}>
                      <label className={styles.label}>
                        Vertical Position (Y) <span className={styles.labelVal}>{signY}%</span>
                      </label>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        className={styles.slider} 
                        value={signY} 
                        onChange={(e) => setSignY(parseInt(e.target.value))}
                      />
                    </div>

                    <div className={styles.controlGroup}>
                      <label className={styles.label}>
                        Horizontal Position (X) <span className={styles.labelVal}>{signX}%</span>
                      </label>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        className={styles.slider} 
                        value={signX} 
                        onChange={(e) => setSignX(parseInt(e.target.value))}
                      />
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Side Live Rendering Preview Panel */}
        <div className={styles.previewPanel}>
          <div className={styles.previewHeading}>
            <h2 className={styles.previewTitle}>Live Certificate Preview</h2>
            <div className={styles.helpBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              Drag text or signature to position freely
            </div>
          </div>

          {/* Bulk Mode Preview Navigation Bar */}
          {mode === 'bulk' && recipients.length > 0 && templateImage && (
            <div className={styles.bulkPreviewNav}>
              <div className={styles.bulkNavControls}>
                <button
                  type="button"
                  className={styles.bulkNavBtn}
                  disabled={activePreviewIndex <= 0}
                  onClick={() => setActivePreviewIndex(prev => Math.max(0, prev - 1))}
                  title="Previous recipient"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <div className={styles.bulkNavInfo}>
                  <span className={styles.bulkNavCounter}>
                    Recipient {activePreviewIndex + 1} of {recipients.length}
                  </span>
                  <span className={styles.bulkNavCurrentName}>
                    {currentRecipient?.name || 'No Name'}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.bulkNavBtn}
                  disabled={activePreviewIndex >= recipients.length - 1}
                  onClick={() => setActivePreviewIndex(prev => Math.min(recipients.length - 1, prev + 1))}
                  title="Next recipient"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              {/* Recipient jump dropdown */}
              <select
                className={styles.bulkJumpSelect}
                value={activePreviewIndex}
                onChange={(e) => setActivePreviewIndex(parseInt(e.target.value))}
              >
                {recipients.map((r, i) => (
                  <option key={r.id} value={i}>
                    {i + 1}. {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Canvas Wrapper */}
          {templateImage ? (
            <div className={styles.certWrapper} ref={wrapperRef}>
              <img 
                src={templateImage} 
                alt="Certificate Template" 
                className={styles.templateImg}
              />
              
              {/* Draggable Name Overlay */}
              {previewName && (
                <div 
                  className={`${styles.overlayText} ${activeDrag === 'name' ? styles.overlayTextActive : ''}`}
                  style={{
                    left: `${nameX}%`,
                    top: `${nameY}%`,
                    fontSize: `${nameSize}px`,
                    fontFamily: `"${nameFont}", serif`,
                    color: nameColor,
                    fontWeight: nameWeight,
                    fontStyle: nameItalic ? 'italic' : 'normal',
                    textAlign: 'center',
                    transform: 'translate(-50%, -50%)'
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'name')}
                  onPointerMove={(e) => handlePointerMove(e, 'name')}
                  onPointerUp={handlePointerUp}
                >
                  {previewName}
                </div>
              )}

              {/* Draggable Date Overlay */}
              {previewDate && previewDate.replace(/[\/\s-]/g, '').length > 0 && (
                <div 
                  className={`${styles.overlayText} ${activeDrag === 'date' ? styles.overlayTextActive : ''}`}
                  style={{
                    left: `${dateX}%`,
                    top: `${dateY}%`,
                    fontSize: `${dateSize}px`,
                    fontFamily: `"${dateFont}", sans-serif`,
                    color: dateColor,
                    fontWeight: dateWeight,
                    fontStyle: dateItalic ? 'italic' : 'normal',
                    textAlign: 'center',
                    transform: 'translate(-50%, -50%)'
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'date')}
                  onPointerMove={(e) => handlePointerMove(e, 'date')}
                  onPointerUp={handlePointerUp}
                >
                  {formatDisplayDate(previewDate, dateFormat)}
                </div>
              )}

              {/* Draggable Content Overlay */}
              {previewContent && previewContent.trim() && (
                <div
                  className={`${styles.overlayText} ${activeDrag === 'content' ? styles.overlayTextActive : ''}`}
                  style={{
                    left: `${contentX}%`,
                    top: `${contentY}%`,
                    fontSize: `${contentSize}px`,
                    fontFamily: `"${contentFont || 'Montserrat'}", sans-serif`,
                    color: contentColor,
                    fontWeight: contentWeight,
                    fontStyle: contentItalic ? 'italic' : 'normal',
                    textAlign: 'center',
                    transform: 'translate(-50%, -50%)',
                    whiteSpace: 'pre-wrap',
                    maxWidth: '80%',
                    lineHeight: '1.45',
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'content')}
                  onPointerMove={(e) => handlePointerMove(e, 'content')}
                  onPointerUp={handlePointerUp}
                >
                  {previewContent}
                </div>
              )}

              {/* Draggable Signature Overlay */}
              {signatureImage && (
                <img 
                  src={signatureImage} 
                  alt="Signature" 
                  className={`${styles.overlayText} ${activeDrag === 'sign' ? styles.overlayTextActive : ''}`}
                  style={{
                    position: 'absolute',
                    left: `${signX}%`,
                    top: `${signY}%`,
                    width: `${signSize}%`,
                    height: 'auto',
                    transform: 'translate(-50%, -50%)',
                    cursor: 'move',
                    userSelect: 'none',
                    pointerEvents: 'auto',
                    border: activeDrag === 'sign' ? '1px dashed #38bdf8' : 'none'
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'sign')}
                  onPointerMove={(e) => handlePointerMove(e, 'sign')}
                  onPointerUp={handlePointerUp}
                />
              )}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <svg className={styles.emptyIcon} width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="9" x2="15" y2="15" />
                <line x1="15" y1="9" x2="9" y2="15" />
              </svg>
              <h4 className={styles.emptyText}>No Certificate Template Uploaded</h4>
              <p className={styles.emptySubtext}>
                Please upload your certificate design image on the left to start customizing details and previewing in real time.
              </p>
              <button 
                type="button" 
                className={styles.emptyUploadPromptBtn}
                onClick={() => fileInputRef.current.click()}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Browse Certificate Image
              </button>
            </div>
          )}

          {/* Action Row & Download Buttons */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>

            {mode === 'single' ? (
              /* Single Mode Download Buttons */
              <div className={styles.actionRow}>
                <button 
                  type="button" 
                  className={styles.resetBtn} 
                  onClick={handleReset}
                  title="Reset details & template"
                  disabled={!templateImage}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M3 21v-5h5" />
                  </svg>
                </button>
                
                <button 
                  type="button" 
                  className={styles.getBtn} 
                  onClick={handleDownloadSinglePdf}
                  disabled={!templateImage || isGenerating}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <polyline points="9 15 12 18 15 15" />
                  </svg>
                  {isGenerating ? 'Rendering PDF...' : 'Download High-Quality PDF'}
                </button>

                <button 
                  type="button" 
                  className={styles.resetBtn} 
                  onClick={handleDownloadSinglePng}
                  disabled={!templateImage || isGenerating}
                  title="Download as High-Resolution PNG"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </button>
              </div>
            ) : (
              /* Bulk Mode Download Buttons */
              <div className={styles.bulkActionButtons}>
                <div className={styles.bulkActionButtonsWrapper}>
                  <button
                    type="button"
                    className={styles.bulkZipBtn}
                    onClick={handleDownloadBulkZip}
                    disabled={!templateImage || selectedRecipients.length === 0}
                    style={{ flex: 1 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download {selectedRecipients.length} Individual PDFs as ZIP
                  </button>

                  <button
                    type="button"
                    className={styles.bulkZipBtn}
                    onClick={handleDownloadBulkPngZip}
                    disabled={!templateImage || selectedRecipients.length === 0}
                    style={{ flex: 1 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download {selectedRecipients.length} Individual PNGs as ZIP
                  </button>
                </div>

                <button
                  type="button"
                  className={styles.bulkMergedPdfBtn}
                  onClick={handleDownloadBulkMerged}
                  disabled={!templateImage || selectedRecipients.length === 0}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  Download Single Combined Multi-Page PDF ({selectedRecipients.length} Pages)
                </button>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      color: '#cbd5e1',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                    onClick={handleDownloadSinglePdf}
                    disabled={!templateImage}
                  >
                    Download Previewed ({currentRecipient?.name || 'Current'}) as PDF
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: '0.6rem 1rem',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      color: '#cbd5e1',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                    onClick={handleDownloadSinglePng}
                    disabled={!templateImage}
                    title="Download Previewed as PNG"
                  >
                    PNG
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Bulk PDF Generation Progress Modal */}
      {bulkProgress.isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalIconWrapper}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1.5s linear infinite' }}>
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
              </svg>
            </div>

            <h3 className={styles.modalTitle}>Generating High-Quality Certificates</h3>
            <p className={styles.modalSubtitle}>
              Rendering 300 DPI high-resolution typography and assembling PDFs...
            </p>

            <div className={styles.progressTrack}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${bulkProgress.percent}%` }}
              />
            </div>

            <div className={styles.progressMeta}>
              <span className={styles.progressStatusText}>
                {bulkProgress.status}
              </span>
              <span className={styles.progressPercentText}>
                {bulkProgress.percent}%
              </span>
            </div>

            <button
              type="button"
              className={styles.cancelModalBtn}
              onClick={handleCancelBulkGeneration}
            >
              Cancel Generation
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Keyframes for spinner style */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default Certificate;

import React, { useState, useEffect, useRef } from 'react';
import styles from './Certificate.module.css';

// SVG templates converted to Data URL helper
const getSvgDataUrl = (svgContent) => {
  const cleanedSvg = svgContent.trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanedSvg)}`;
};

const DEFAULT_TEMPLATES = [
  {
    id: 'classic-gold',
    name: 'Classic Gold',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&amp;family=Montserrat:wght@400;500;700&amp;display=swap');
        </style>
      </defs>
      <rect width="800" height="600" fill="#fcfbf7" />
      <rect x="20" y="20" width="760" height="560" fill="none" stroke="#1d2d44" stroke-width="4" />
      <rect x="28" y="28" width="744" height="544" fill="none" stroke="#d4af37" stroke-width="2" />
      <path d="M 28 60 L 60 28 M 28 80 L 80 28" stroke="#d4af37" stroke-width="2" />
      <path d="M 772 60 L 740 28 M 772 80 L 720 28" stroke="#d4af37" stroke-width="2" />
      <path d="M 28 540 L 60 572 M 28 520 L 80 572" stroke="#d4af37" stroke-width="2" />
      <path d="M 772 540 L 740 572 M 772 520 L 720 572" stroke="#d4af37" stroke-width="2" />
      <text x="400" y="110" font-family="'Cinzel', 'Georgia', serif" font-size="36" fill="#1d2d44" text-anchor="middle" font-weight="bold" letter-spacing="4">CERTIFICATE OF ACHIEVEMENT</text>
      <text x="400" y="160" font-family="'Montserrat', 'Arial', sans-serif" font-size="12" fill="#666" text-anchor="middle" letter-spacing="2">THIS IS PROUDLY PRESENTED TO</text>
      
      <text x="400" y="380" font-family="'Montserrat', 'Arial', sans-serif" font-size="13" fill="#666" text-anchor="middle">for successfully completing all requirements and demonstrating proficiency in the curriculum.</text>
      
      <line x1="180" y1="495" x2="330" y2="495" stroke="#a0a0a0" stroke-width="1" />
      <text x="255" y="520" font-family="'Montserrat', 'Arial', sans-serif" font-size="11" fill="#666" text-anchor="middle">DATE</text>
      
      <line x1="470" y1="495" x2="620" y2="495" stroke="#a0a0a0" stroke-width="1" />
      <text x="545" y="520" font-family="'Montserrat', 'Arial', sans-serif" font-size="11" fill="#666" text-anchor="middle">AUTHORIZED SIGNATURE</text>
      
      <g transform="translate(400, 440) scale(0.6)">
        <polygon points="0,0 -20,40 0,30 20,40" fill="#d4af37" />
        <polygon points="10,0 -10,45 10,35 30,45" fill="#c59b27" />
        <circle cx="0" cy="0" r="25" fill="#d4af37" stroke="#1d2d44" stroke-width="2" />
        <circle cx="0" cy="0" r="20" fill="none" stroke="#fff" stroke-dasharray="3,3" stroke-width="1" />
      </g>
    </svg>`
  },
  {
    id: 'modern-dark',
    name: 'Modern Dark',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;800&amp;family=Inter:wght@400;600&amp;display=swap');
        </style>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#06b6d4" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bgGrad)" />
      <path d="M 0 0 L 200 0 L 0 300 Z" fill="#334155" opacity="0.2" />
      <path d="M 800 600 L 600 600 L 800 300 Z" fill="url(#accentGrad)" opacity="0.15" />
      <rect x="30" y="30" width="740" height="540" fill="none" stroke="url(#accentGrad)" stroke-width="2" rx="8" opacity="0.5" />
      
      <text x="80" y="100" font-family="'Outfit', 'Helvetica', sans-serif" font-size="12" fill="#06b6d4" font-weight="bold" letter-spacing="3">POWERED BY ELMS</text>
      <text x="80" y="150" font-family="'Outfit', 'Helvetica', sans-serif" font-size="36" fill="#ffffff" font-weight="950" letter-spacing="1">CERTIFICATE OF COMPLETION</text>
      <text x="80" y="195" font-family="'Inter', sans-serif" font-size="13" fill="#94a3b8" letter-spacing="0.5">This certifies that the recipient listed below has successfully finalized all requirements.</text>
      
      <text x="80" y="380" font-family="'Inter', sans-serif" font-size="13" fill="#94a3b8">For outstanding performance in</text>
      <text x="80" y="415" font-family="'Outfit', sans-serif" font-size="20" fill="#3b82f6" font-weight="bold">Advanced Web Development &amp; Architecture</text>
      
      <line x1="80" y1="500" x2="280" y2="500" stroke="#475569" stroke-width="1" />
      <text x="80" y="525" font-family="'Inter', sans-serif" font-size="11" fill="#64748b" letter-spacing="1">DATE OF ISSUANCE</text>
      
      <line x1="520" y1="500" x2="720" y2="500" stroke="#475569" stroke-width="1" />
      <text x="520" y="525" font-family="'Inter', sans-serif" font-size="11" fill="#64748b" letter-spacing="1">VERIFICATION CODE</text>
      <text x="520" y="480" font-family="'Courier New', monospace" font-size="11" fill="#06b6d4">ID: ELMS-9982-AX7</text>
    </svg>`
  }
];

const PRESET_COLORS = [
  '#1d2d44', // Deep Navy
  '#d4af37', // Gold
  '#f8fafc', // Pure White
  '#06b6d4', // Teal/Cyan
  '#10b981', // Emerald
  '#ef4444', // Bright Red
  '#8b5cf6', // Violet
  '#0f172a'  // Charcoal
];

// Expanded Font Presets (40+ popular Google Fonts)
const ALL_FONTS = [
  // Elegant Serifs
  { value: 'Cinzel', label: 'Cinzel (Classical Academic)' },
  { value: 'Playfair Display', label: 'Playfair Display (Elegant Serif)' },
  { value: 'Lora', label: 'Lora (Modern Serif)' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond (Fine Serif)' },
  { value: 'Merriweather', label: 'Merriweather (Readable Serif)' },
  { value: 'EB Garamond', label: 'EB Garamond (Garamond Serif)' },
  { value: 'Bodoni Moda', label: 'Bodoni Moda (High-Fashion Serif)' },
  { value: 'Cardo', label: 'Cardo (Scholarly Serif)' },
  { value: 'Libre Baskerville', label: 'Libre Baskerville (Classic Book)' },
  { value: 'Prata', label: 'Prata (Didone Serif)' },
  
  // Calligraphy / Handwriting
  { value: 'Great Vibes', label: 'Great Vibes (Formal Calligraphy)' },
  { value: 'Alex Brush', label: 'Alex Brush (Chic Calligraphy)' },
  { value: 'Dancing Script', label: 'Dancing Script (Casual Script)' },
  { value: 'Pinyon Script', label: 'Pinyon Script (Copperplate)' },
  { value: 'Sacramento', label: 'Sacramento (Thin Retro Script)' },
  { value: 'Allura', label: 'Allura (Flowy Script)' },
  { value: 'Parisienne', label: 'Parisienne (Elegant Script)' },
  { value: 'WindSong', label: 'WindSong (Handwritten Script)' },
  { value: 'Marck Script', label: 'Marck Script (Expressive Hand)' },
  { value: 'Herr Von Muellerhoff', label: 'Herr Von Muellerhoff (Vintage)' },

  // Sans-Serif (Modern & Clean)
  { value: 'Outfit', label: 'Outfit (Modern Bold)' },
  { value: 'Inter', label: 'Inter (Clean Sans-Serif)' },
  { value: 'Montserrat', label: 'Montserrat (Geometric Sans)' },
  { value: 'Poppins', label: 'Poppins (Friendly Geometric)' },
  { value: 'Lato', label: 'Lato (Warm Sans)' },
  { value: 'Raleway', label: 'Raleway (Elegant Sans)' },
  { value: 'Open Sans', label: 'Open Sans (Universal Sans)' },
  { value: 'Roboto', label: 'Roboto (Neutral Sans)' },
  { value: 'Nunito', label: 'Nunito (Rounded Sans)' },
  { value: 'Quicksand', label: 'Quicksand (Round Geometric)' },
  
  // Unique / Monospace / Display
  { value: 'Courier Prime', label: 'Courier Prime (Typewriter Mono)' },
  { value: 'Fira Code', label: 'Fira Code (Developer Mono)' },
  { value: 'Space Grotesk', label: 'Space Grotesk (Brutalist Tech)' },
  { value: 'Syncopate', label: 'Syncopate (Ultra-Wide Display)' },
  { value: 'Unbounded', label: 'Unbounded (Bold Artistic)' },
  { value: 'Cinzel Decorative', label: 'Cinzel Decorative (Ornamental)' },
  { value: 'Abril Fatface', label: 'Abril Fatface (Bold Didone)' },
  { value: 'Alfa Slab One', label: 'Alfa Slab One (Fat Slab Serif)' },
  { value: 'Bebas Neue', label: 'Bebas Neue (Impact Display)' }
];

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
  // Loads Google Font weights (300, 400, 500, 700, 900) along with their italic counterparts
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(normalizedName)}:ital,wght@0,300;0,400;0,500;0,700;0,900;1,300;1,400;1,500;1,700;1,900&display=swap`;
  document.head.appendChild(link);
  
  loadedFonts.add(normalizedName);
};

// Custom Searchable Combobox Component
const FontSelector = ({ value, onChange, placeholder = "Select Font" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const activeRef = useRef(null);

  // When opening, initialize search with current value
  const handleOpen = () => {
    setSearch(value);
    setIsOpen(true);
  };

  // Scroll active item into view when dropdown opens
  useEffect(() => {
    if (isOpen && activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
  }, [isOpen]);

  // Handle clicking outside to collapse the menu
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredFonts = ALL_FONTS.filter(f => 
    f.value.toLowerCase().includes(search.toLowerCase()) || 
    f.label.toLowerCase().includes(search.toLowerCase())
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
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={(e) => {
            handleOpen();
            setTimeout(() => {
              if (e.target) e.target.select();
            }, 50);
          }}
          onClick={() => {
            if (!isOpen) handleOpen();
          }}
          placeholder={placeholder}
        />
        <button 
          type="button" 
          className={`${styles.dropdownArrowBtn} ${isOpen ? styles.dropdownArrowBtnOpen : ''}`}
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
            } else {
              handleOpen();
            }
          }}
          aria-label="Toggle font list"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <ul className={styles.fontDropdownList}>
          {filteredFonts.length > 0 ? (
            filteredFonts.map((f) => (
              <li 
                key={f.value} 
                ref={value === f.value ? activeRef : null}
                className={`${styles.fontDropdownItem} ${value === f.value ? styles.fontDropdownItemActive : ''}`}
                onClick={() => handleSelect(f.value)}
                style={{ fontFamily: `"${f.value}", sans-serif` }}
              >
                <span className={styles.fontItemName}>{f.value}</span>
                <span className={styles.fontItemCategory}>
                  {f.label.split('(')[1]?.replace(')', '') || 'Style'}
                </span>
              </li>
            ))
          ) : (
            <li className={styles.fontDropdownNoResults}>No fonts found</li>
          )}
        </ul>
      )}
    </div>
  );
};
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d} - ${m} - ${y}`;
  }
  return dateStr;
};

const getTodayFormatted = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${dd} - ${mm} - ${yyyy}`;
};

const Certificate = () => {
  const [templateImage, setTemplateImage] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  
  // Recipient inputs
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [content, setContent] = useState('');
  
  // Custom overlays styling & position state
  const [activeTab, setActiveTab] = useState('name'); // 'name', 'date'
  
  const [nameX, setNameX] = useState(50);
  const [nameY, setNameY] = useState(42);
  const [nameFont, setNameFont] = useState('Playfair Display');
  const [nameSize, setNameSize] = useState(36);
  const [nameColor, setNameColor] = useState('#1d2d44');
  const [nameWeight, setNameWeight] = useState('400');
  const [nameItalic, setNameItalic] = useState(false);
  
  const [dateX, setDateX] = useState(32);
  const [dateY, setDateY] = useState(80);
  const [dateSize, setDateSize] = useState(16);
  const [dateFont, setDateFont] = useState('Montserrat');
  const [dateColor, setDateColor] = useState('#1d2d44');
  const [dateWeight, setDateWeight] = useState('400');
  const [dateItalic, setDateItalic] = useState(false);

  const [contentX, setContentX] = useState(50);
  const [contentY, setContentY] = useState(60);
  const [contentSize, setContentSize] = useState(14);
  const [contentFont, setContentFont] = useState('Montserrat');
  const [contentColor, setContentColor] = useState('#1d2d44');
  const [contentWeight, setContentWeight] = useState('400');
  const [contentItalic, setContentItalic] = useState(false);

  // Signature overlay state
  const [signatureImage, setSignatureImage] = useState('');
  const [signX, setSignX] = useState(70);
  const [signY, setSignY] = useState(80);
  const [signSize, setSignSize] = useState(20); // Width as percentage of certificate

  // Dragging states
  const [activeDrag, setActiveDrag] = useState(null); // 'name', 'date', or 'content'
  const [dragActive, setDragActive] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const wrapperRef = useRef(null);
  const fileInputRef = useRef(null);
  const nameColorInputRef = useRef(null);
  const dateColorInputRef = useRef(null);
  const contentColorInputRef = useRef(null);

  // Set default template and current date on load
  useEffect(() => {
    // Pre-load default set of beautiful preset fonts
    ['Playfair Display', 'Cinzel', 'Great Vibes', 'Alex Brush', 'Outfit', 'Montserrat', 'Inter'].forEach(f => {
      loadGoogleFont(f);
    });
    setName('');
  }, []);

  // Set coordinates based on chosen built-in template to make them align nicely automatically
  const handleSelectTemplate = (id) => {
    setSelectedTemplateId(id);
    const tpl = DEFAULT_TEMPLATES.find(t => t.id === id);
    if (tpl) {
      setTemplateImage(getSvgDataUrl(tpl.svg));
      if (id === 'classic-gold') {
        setNameX(50);
        setNameY(42);
        setNameFont('Playfair Display');
        setNameColor('#1d2d44');
        setNameWeight('700');
        setNameItalic(false);
        setNameSize(36);
        
        setDateX(32);
        setDateY(80);
        setDateFont('Montserrat');
        setDateColor('#1d2d44');
        setDateWeight('400');
        setDateItalic(false);
        setDateSize(16);
      } else if (id === 'modern-dark') {
        setNameX(22);
        setNameY(50);
        setNameFont('Outfit');
        setNameColor('#ffffff');
        setNameWeight('700');
        setNameItalic(false);
        setNameSize(32);
        
        setDateX(22);
        setDateY(82);
        setDateFont('Inter');
        setDateColor('#94a3b8');
        setDateWeight('400');
        setDateItalic(false);
        setDateSize(16);
      }
    }
  };

  // Drag & drop template file handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTemplateImage(e.target.result);
        setSelectedTemplateId('custom');
        // Reset positioning default adjustments for custom templates
        setNameX(50);
        setNameY(45);
        setDateX(50);
        setDateY(75);
      };
      reader.readAsDataURL(file);
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

  // Pointer Drag-and-Drop Positioning Logic for Text Overlays
  const handlePointerDown = (e, type) => {
    e.preventDefault();
    setActiveDrag(type);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e, type) => {
    if (activeDrag !== type || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    
    // Calculate relative percentage coordinates
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

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setSignatureImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePointerUp = (e, type) => {
    setActiveDrag(null);
    e.target.releasePointerCapture(e.pointerId);
  };

  // High-Resolution Certificate Generation
  const handleGetCertificate = async () => {
    if (!templateImage) return;
    setIsGenerating(true);

    try {
      // Ensure current google fonts are loaded in browser memory
      loadGoogleFont(nameFont || 'Playfair Display');
      loadGoogleFont(dateFont || 'Montserrat');
      loadGoogleFont(contentFont || 'Montserrat');

      if (document.fonts) {
        const nameStyleSpec = `${nameItalic ? 'italic ' : ''}${nameWeight} 16px "${nameFont || 'Playfair Display'}"`;
        const dateStyleSpec = `${dateItalic ? 'italic ' : ''}${dateWeight} 16px "${dateFont || 'Montserrat'}"`;
        const contentStyleSpec = `${contentItalic ? 'italic ' : ''}${contentWeight} 16px "${contentFont || 'Montserrat'}"`;
        await Promise.all([
          document.fonts.load(nameStyleSpec),
          document.fonts.load(dateStyleSpec),
          document.fonts.load(contentStyleSpec)
        ]);
      }
    } catch (err) {
      console.warn("Font loader issue, drawing with default font styles.", err);
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas to original image dimensions to maintain high resolution
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Draw template image
      ctx.drawImage(img, 0, 0);

      // Scaling factor: calculate ratio between natural image size and display wrapper width
      const previewWidth = wrapperRef.current.clientWidth;
      const scale = img.naturalWidth / previewWidth;

      // Draw dynamic Name overlay
      ctx.font = `${nameItalic ? 'italic ' : ''}${nameWeight} ${nameSize * scale}px "${nameFont || 'Playfair Display'}", serif`;
      ctx.fillStyle = nameColor;
      ctx.textAlign = selectedTemplateId === 'modern-dark' ? 'left' : 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name || ' ', (nameX / 100) * img.naturalWidth, (nameY / 100) * img.naturalHeight);

      // Draw dynamic Date overlay (only if date entered)
      if (date) {
        ctx.font = `${dateItalic ? 'italic ' : ''}${dateWeight} ${dateSize * scale}px "${dateFont || 'Montserrat'}", sans-serif`;
        ctx.fillStyle = dateColor;
        ctx.textAlign = selectedTemplateId === 'modern-dark' ? 'left' : 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatDisplayDate(date), (dateX / 100) * img.naturalWidth, (dateY / 100) * img.naturalHeight);
      }

      // Draw dynamic Content overlay (only if content entered)
      if (content && content.trim()) {
        ctx.font = `${contentItalic ? 'italic ' : ''}${contentWeight} ${contentSize * scale}px "${contentFont || 'Montserrat'}", sans-serif`;
        ctx.fillStyle = contentColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Word-wrap: split into lines by \n or wrap at ~60 chars per line
        const lines = content.split('\n');
        const lineHeight = contentSize * scale * 1.4;
        const cx = (contentX / 100) * img.naturalWidth;
        const cy = (contentY / 100) * img.naturalHeight;
        lines.forEach((line, i) => {
          ctx.fillText(line, cx, cy + (i - (lines.length - 1) / 2) * lineHeight);
        });
      }

      const finalize = () => {
        // Trigger high-res image download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${(name || 'Certificate').trim().toLowerCase().replace(/\s+/g, '_')}_completion.png`;
        link.href = dataUrl;
        link.click();
        setIsGenerating(false);
      };

      if (signatureImage) {
        const signImg = new Image();
        signImg.src = signatureImage;
        signImg.onload = () => {
          const signCanvasWidth = (signSize / 100) * img.naturalWidth;
          const signCanvasHeight = (signImg.naturalHeight / signImg.naturalWidth) * signCanvasWidth;
          ctx.drawImage(
            signImg,
            (signX / 100) * img.naturalWidth - signCanvasWidth / 2,
            (signY / 100) * img.naturalHeight - signCanvasHeight / 2,
            signCanvasWidth,
            signCanvasHeight
          );
          finalize();
        };
      } else {
        finalize();
      }
    };
    img.src = templateImage;
  };

  const handleReset = () => {
    setName('');
    setDate('');
    setContent('');
    setSignatureImage('');
    setTemplateImage('');
    setSelectedTemplateId('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dynamic Certificate Designer</h1>
        <p className={styles.subtitle}>Upload your template, insert details, and download instantly.</p>
      </div>

      <div className={styles.layout}>
        {/* Left Side Controls Panel */}
        <div className={styles.controlsPanel}>
          
          {/* Section: Template Selection */}
          <div>
            <h3 className={styles.sectionTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              1. Choose Template
            </h3>
            
            <div 
              className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <svg className={styles.uploadIcon} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className={styles.uploadText}>Upload Custom Template</span>
              <span className={styles.uploadSubtext}>Drag &amp; drop or click to upload PNG/JPG</span>
              <input 
                ref={fileInputRef}
                type="file" 
                className={styles.hiddenInput} 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Section: Text Customizations */}
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
                  placeholder="Enter Name..." 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className={styles.controlGroup}>
                <label className={styles.label}>Issuance Date</label>
                <input 
                  type="date" 
                  className={styles.input} 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className={styles.controlGroup}>
                <label className={styles.label}>Certificate Content</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Enter certificate body text (e.g. 'has successfully completed...')" 
                  value={content}
                  rows={3}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className={styles.controlGroup}>
                <label className={styles.label}>Signature Upload</label>
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
                    {signatureImage ? 'Change Signature' : 'Upload Signature Image'}
                  </label>
                  {signatureImage && (
                    <button
                      type="button"
                      onClick={() => setSignatureImage('')}
                      style={{
                        padding: '0.6rem 0.8rem',
                        background: '#e63946',
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

          {/* Section: Typography Formatting */}
          <div>
            <h3 className={styles.sectionTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 7 4 4 20 4 20 7" />
                <line x1="9" y1="20" x2="15" y2="20" />
                <line x1="12" y1="4" x2="12" y2="20" />
              </svg>
              3. Style Settings
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
                    min="12" 
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
                    
                    {/* Hidden Native Custom Color Input */}
                    <input 
                      ref={nameColorInputRef}
                      type="color" 
                      value={nameColor} 
                      onChange={(e) => setNameColor(e.target.value)} 
                      className={styles.hiddenColorInput}
                    />
                    
                    {/* Conic Rainbow Gradient Special Custom Swatch */}
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
                        }
                        loadGoogleFont(nameFont);
                      }}
                    >
                      <option value="400-normal" style={{ fontWeight: 400, fontStyle: 'normal' }}>Normal</option>
                      <option value="400-italic" style={{ fontWeight: 400, fontStyle: 'italic' }}>Italics</option>
                      <option value="700-normal" style={{ fontWeight: 700, fontStyle: 'normal' }}>Bold</option>
                    </select>
                    <div className={styles.selectArrow}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  <label className={styles.label}>
                    Font Size <span className={styles.labelVal}>{dateSize}px</span>
                  </label>
                  <input 
                    type="range" 
                    min="10" 
                    max="48" 
                    className={styles.slider} 
                    value={dateSize} 
                    onChange={(e) => setDateSize(parseInt(e.target.value))}
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>Text Color</label>
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
                    
                    {/* Hidden Native Custom Color Input */}
                    <input 
                      ref={dateColorInputRef}
                      type="color" 
                      value={dateColor} 
                      onChange={(e) => setDateColor(e.target.value)} 
                      className={styles.hiddenColorInput}
                    />
                    
                    {/* Conic Rainbow Gradient Special Custom Swatch */}
                    <button
                      type="button"
                      className={`${styles.colorCircle} ${styles.customColorSwatch} ${!PRESET_COLORS.includes(dateColor) ? styles.colorCircleActive : ''}`}
                      style={{
                        background: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                      }}
                      onClick={() => dateColorInputRef.current.click()}
                      title="Choose custom color..."
                    >
                      <span 
                        className={styles.customColorIndicator} 
                        style={!PRESET_COLORS.includes(dateColor) ? { backgroundColor: dateColor, border: '1px solid #f8fafc' } : {}}
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
                      value={`${dateWeight}-${dateItalic ? 'italic' : 'normal'}`} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '400-normal') {
                          setDateWeight('400');
                          setDateItalic(false);
                        } else if (val === '400-italic') {
                          setDateWeight('400');
                          setDateItalic(true);
                        } else if (val === '700-normal') {
                          setDateWeight('700');
                          setDateItalic(false);
                        }
                        loadGoogleFont(dateFont);
                      }}
                    >
                      <option value="400-normal" style={{ fontWeight: 400, fontStyle: 'normal' }}>Normal</option>
                      <option value="400-italic" style={{ fontWeight: 400, fontStyle: 'italic' }}>Italics</option>
                      <option value="700-normal" style={{ fontWeight: 700, fontStyle: 'normal' }}>Bold</option>
                    </select>
                    <div className={styles.selectArrow}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    min="8" 
                    max="60" 
                    className={styles.slider} 
                    value={contentSize} 
                    onChange={(e) => setContentSize(parseInt(e.target.value))}
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.label}>Text Color</label>
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
                    
                    {/* Hidden Native Custom Color Input */}
                    <input 
                      ref={contentColorInputRef}
                      type="color" 
                      value={contentColor} 
                      onChange={(e) => setContentColor(e.target.value)} 
                      className={styles.hiddenColorInput}
                    />
                    
                    {/* Conic Rainbow Gradient Special Custom Swatch */}
                    <button
                      type="button"
                      className={`${styles.colorCircle} ${styles.customColorSwatch} ${!PRESET_COLORS.includes(contentColor) ? styles.colorCircleActive : ''}`}
                      style={{
                        background: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                      }}
                      onClick={() => contentColorInputRef.current.click()}
                      title="Choose custom color..."
                    >
                      <span 
                        className={styles.customColorIndicator} 
                        style={!PRESET_COLORS.includes(contentColor) ? { backgroundColor: contentColor, border: '1px solid #f8fafc' } : {}}
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
                      value={`${contentWeight}-${contentItalic ? 'italic' : 'normal'}`} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '400-normal') {
                          setContentWeight('400');
                          setContentItalic(false);
                        } else if (val === '400-italic') {
                          setContentWeight('400');
                          setContentItalic(true);
                        } else if (val === '700-normal') {
                          setContentWeight('700');
                          setContentItalic(false);
                        }
                        loadGoogleFont(contentFont);
                      }}
                    >
                      <option value="400-normal" style={{ fontWeight: 400, fontStyle: 'normal' }}>Normal</option>
                      <option value="400-italic" style={{ fontWeight: 400, fontStyle: 'italic' }}>Italics</option>
                      <option value="700-normal" style={{ fontWeight: 700, fontStyle: 'normal' }}>Bold</option>
                    </select>
                    <div className={styles.selectArrow}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    background: '#f8f9fa', 
                    borderRadius: '8px', 
                    border: '1px dashed #ced4da',
                    color: '#6c757d',
                    fontSize: '0.9rem'
                  }}>
                    Please upload a signature image first.
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

        {/* Right Side live Rendering Preview Panel */}
        <div className={styles.previewPanel}>
          <div className={styles.previewHeading}>
            <h2 className={styles.previewTitle}>Live Certificate Preview</h2>
            <div className={styles.helpBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '2px' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              Drag text to position it
            </div>
          </div>

          {templateImage ? (
            <div className={styles.certWrapper} ref={wrapperRef}>
              <img 
                src={templateImage} 
                alt="Certificate Template" 
                className={styles.templateImg}
              />
              
              {/* Draggable Name Overlay - only shown when name is entered */}
              {name && (
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
                    textAlign: selectedTemplateId === 'modern-dark' ? 'left' : 'center',
                    transform: selectedTemplateId === 'modern-dark' ? 'translate(0, -50%)' : 'translate(-50%, -50%)'
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'name')}
                  onPointerMove={(e) => handlePointerMove(e, 'name')}
                  onPointerUp={(e) => handlePointerUp(e, 'name')}
                >
                  {name}
                </div>
              )}

              {/* Draggable Date Overlay - only shown when date is entered */}
              {date && (
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
                    textAlign: selectedTemplateId === 'modern-dark' ? 'left' : 'center',
                    transform: selectedTemplateId === 'modern-dark' ? 'translate(0, -50%)' : 'translate(-50%, -50%)'
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'date')}
                  onPointerMove={(e) => handlePointerMove(e, 'date')}
                  onPointerUp={(e) => handlePointerUp(e, 'date')}
                >
                  {formatDisplayDate(date)}
                </div>
              )}

              {/* Draggable Content Overlay - only shown when content is entered */}
              {content && content.trim() && (
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
                    lineHeight: '1.4',
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'content')}
                  onPointerMove={(e) => handlePointerMove(e, 'content')}
                  onPointerUp={(e) => handlePointerUp(e, 'content')}
                >
                  {content}
                </div>
              )}

              {/* Draggable Signature Overlay - only shown when signature is uploaded */}
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
                    border: activeDrag === 'sign' ? '1px dashed #4361ee' : 'none'
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'sign')}
                  onPointerMove={(e) => handlePointerMove(e, 'sign')}
                  onPointerUp={(e) => handlePointerUp(e, 'sign')}
                />
              )}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <svg className={styles.emptyIcon} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="9" x2="15" y2="15" />
                <line x1="15" y1="9" x2="9" y2="15" />
              </svg>
              <h4 className={styles.emptyText}>No preview available</h4>
              <p className={styles.emptySubtext}>Please upload a custom certificate template to see the live preview.</p>
            </div>
          )}

          <div className={styles.actionRow}>
            <button 
              type="button" 
              className={styles.resetBtn} 
              onClick={handleReset}
              title="Reset to defaults"
              disabled={!templateImage}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            </button>
            
            <button 
              type="button" 
              className={styles.getBtn} 
              onClick={handleGetCertificate}
              disabled={!templateImage || isGenerating}
            >
              {isGenerating ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <line x1="12" y1="2" x2="12" y2="6" />
                    <line x1="12" y1="18" x2="12" y2="22" />
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                    <line x1="2" y1="12" x2="6" y2="12" />
                    <line x1="18" y1="12" x2="22" y2="12" />
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Get Certificate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
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

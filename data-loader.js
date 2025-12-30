/**
 * Data Loader for ISM Calculator
 * Loads JSON data files and initializes the calculator
 */

// Inline data - this would normally be loaded from JSON files
// For production, you can load from external JSON files using fetch

const ABJAD_VALUES = {
  "ا": 1, "ب": 2, "پ": 2, "ج": 3, "چ": 3, "ڈ": 4, "د": 4, "ہ": 5, "ه": 5,
  "و": 6, "ز": 7, "ژ": 7, "ح": 8, "ط": 9, "ی": 10, "ي": 10, "ک": 20, "ك": 20, "گ": 20,
  "ل": 30, "م": 40, "ن": 50, "س": 60, "ع": 70, "ف": 80, "ص": 90,
  "ق": 100, "ر": 200, "ڑ": 200, "ش": 300, "ٹ": 400, "ت": 400,
  "ث": 500, "خ": 600, "ذ": 700, "ض": 800, "ظ": 900, "غ": 1000
};

// This will be populated dynamically or from a JSON file
let DIVINE_NAMES = [];
let NAMES_INDEX = {};

/**
 * Load Divine Names from JSON file
 */
async function loadDivineNames() {
  try {
    // Try to load from JSON file first
    const response = await fetch('../../data/asmaul_husna.json');
    if (response.ok) {
      DIVINE_NAMES = await response.json();
      buildNamesIndex();
      console.log(`[OK] Loaded ${DIVINE_NAMES.length} Divine Names from JSON`);
      return true;
    }
  } catch (error) {
    console.warn('[WARN] Could not load Divine Names from JSON file:', error.message);
    console.warn('[INFO] Falling back to inline data...');
  }

  // Fallback: Use inline data (you can add this manually or load from alternative source)
  // For now, we'll keep it empty to show the user they need to provide the data
  return false;
}

/**
 * Build index for faster lookups
 */
function buildNamesIndex() {
  NAMES_INDEX = {};
  
  for (const name of DIVINE_NAMES) {
    const value = String(name.abjad_value);
    if (!NAMES_INDEX[value]) {
      NAMES_INDEX[value] = [];
    }
    NAMES_INDEX[value].push(name);
  }
  
  console.log(`[OK] Built index with ${Object.keys(NAMES_INDEX).length} unique abjad values`);
}

/**
 * Initialize the calculator with all necessary data
 */
async function initializeApp() {
  console.log("[INFO] Initializing ism_e_azam_calculator_p...");
  
  try {
    // Load Divine Names data
    const dataLoaded = await loadDivineNames();
    
    if (!dataLoaded || DIVINE_NAMES.length === 0) {
      console.error("[ERROR] Could not load Divine Names data");
      showInitError("Failed to load Divine Names data. The calculator requires the asmaul_husna.json file.");
      return false;
    }
    
    // Initialize the calculator with the data
    window.ism_e_azam_calculator_p.initializeCalculator(ABJAD_VALUES, DIVINE_NAMES, NAMES_INDEX);

    console.log("[OK] ism_e_azam_calculator_p initialized successfully");
    console.log(`[INFO] Abjad values loaded: ${Object.keys(ABJAD_VALUES).length}`);
    console.log(`[INFO] Divine names loaded: ${DIVINE_NAMES.length}`);
    console.log(`[INFO] Index entries: ${Object.keys(NAMES_INDEX).length}`);
    
    return true;
  } catch (error) {
    console.error("[ERROR] Initialization failed:", error);
    showInitError("Error during initialization: " + error.message);
    return false;
  }
}

/**
 * Show initialization error to user
 */
function showInitError(message) {
  const errorDiv = document.getElementById('errorMessage');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
}

/**
 * Wait for DOM to be ready, then initialize
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

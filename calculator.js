/**
 * ISM Calculator - JavaScript Client-Side Implementation
 * Converts Arabic/Urdu names to Abjad values and finds matching Divine Names
 * 
 * This is a complete client-side implementation without backend server requirements
 */

// ============================================================================
// TEXT PROCESSOR MODULE
// ============================================================================

class TextProcessor {
  /**
   * Arabic diacritical marks that should be removed
   */
  static ARABIC_DIACRITICS = {
    '\u064B': 'FATHATAN',      // ٌ
    '\u064C': 'DAMMATAN',      // ٍ
    '\u064D': 'KASRATAN',      // ً
    '\u064E': 'FATHA',         // َ
    '\u064F': 'DAMMA',         // ُ
    '\u0650': 'KASRA',         // ِ
    '\u0651': 'SHADDA',        // ّ
    '\u0652': 'SUKUN',         // ْ
    '\u0653': 'MADDAH',        // ٓ
    '\u0654': 'HAMZA_ABOVE',   // ٔ
    '\u0655': 'HAMZA_BELOW',   // ٕ
    '\u0656': 'SUBSCRIPT_ALEF',// ٖ
    '\u0657': 'INVERTED_DAMMA', // ٗ
    '\u0658': 'MARK_NOON',     // ٘
    '\u0670': 'ALEF_WASLA',    // ٰ
  };

  /**
   * Character variants that should be normalized
   */
  static ARABIC_CHAR_VARIANTS = {
    '\u0649': '\u0627',  // ى -> ا (Alef Maksura to Alef)
    '\u0671': '\u0627',  // ٱ -> ا (Alef Wasla to Alef)
    '\u0680': '\u0628',  // ۀ -> ب
    '\u06BE': '\u0647',  // ھ -> ه (Do Chashmee He to Haa)
    '\u06C1': '\u0647',  // ہ -> ه (Goal He to Haa)
    '\u06C2': '\u0647',  // ۂ -> ه (Goal He Diacritic to Haa)
    '\u0678': '\u064A',  // ٸ -> ي
    '\u06D2': '\u064A',  // ے -> ي (Bari Ya to Ya)
    '\u06D3': '\u064A',  // ۓ -> ي (Bari Ya Diacritic to Ya)
  };

  /**
   * Valid Arabic/Urdu letters
   */
  static VALID_ARABIC_LETTERS = new Set([
    '\u0627', '\u0628', '\u062A', '\u062B', '\u062C', '\u062D', '\u062E',
    '\u062F', '\u0630', '\u0631', '\u0632', '\u0633', '\u0634', '\u0635',
    '\u0636', '\u0637', '\u0638', '\u0639', '\u063A', '\u0641', '\u0642',
    '\u0643', '\u0644', '\u0645', '\u0646', '\u0647', '\u0648', '\u064A',
    // Urdu letters
    '\u0679', '\u067E', '\u06AF', '\u06BA', '\u06C1', '\u06C3', '\u0688',
    '\u0691', '\u0693', '\u0698', '\u06D2', '\u06D4',
  ]);

  /**
   * Remove Arabic diacritical marks from text
   */
  static removeDiacritics(text) {
    return text.split('').filter(char => !this.ARABIC_DIACRITICS[char]).join('');
  }

  /**
   * Normalize character variants to standard forms
   */
  static normalizeVariants(text) {
    return text.split('').map(char => 
      this.ARABIC_CHAR_VARIANTS[char] || char
    ).join('');
  }

  /**
   * Remove leading/trailing spaces and collapse internal spaces
   */
  static removeSpaces(text) {
    return text.trim().replace(/\s+/g, ' ');
  }

  /**
   * Check if character is valid Arabic/Urdu
   */
  static isArabicUrduChar(char) {
    if (this.VALID_ARABIC_LETTERS.has(char)) {
      return true;
    }

    const code = char.charCodeAt(0);
    // Arabic block: U+0600 to U+06FF
    // Arabic Supplement: U+0750 to U+077F
    return (0x0600 <= code && code <= 0x06FF) || (0x0750 <= code && code <= 0x077F);
  }

  /**
   * Process and validate name input
   */
  static processNameInput(inputString, removeSpacesBetween = false) {
    const status = {
      success: false,
      original: inputString,
      cleaned: '',
      length: 0,
      warnings: [],
      errors: [],
      hasDiacritics: false,
      charCount: 0,
    };

    // Step 1: Remove leading/trailing spaces
    let text = this.removeSpaces(inputString);

    if (!text) {
      status.errors.push("Empty input");
      return ['', status];
    }

    // Step 2: Remove diacritical marks
    if (text.split('').some(char => this.ARABIC_DIACRITICS[char])) {
      status.hasDiacritics = true;
      text = this.removeDiacritics(text);
      status.warnings.push("Diacritical marks removed");
    }

    // Step 3: Normalize character variants
    const textBefore = text;
    text = this.normalizeVariants(text);
    if (textBefore !== text) {
      status.warnings.push("Character variants normalized");
    }

    // Step 4: Validate characters and build output
    let cleaned = "";
    const nonArabicChars = [];

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (char === ' ') {
        if (!removeSpacesBetween) {
          cleaned += char;
        }
      } else if (this.isArabicUrduChar(char)) {
        cleaned += char;
      } else {
        nonArabicChars.push(char);
      }
    }

    if (nonArabicChars.length > 0) {
      const charList = nonArabicChars.slice(0, 3).map(c => `'${c}'`).join(', ');
      const extra = nonArabicChars.length > 3 ? ` and ${nonArabicChars.length - 3} more` : '';
      status.errors.push(`Non-Arabic characters found: ${charList}${extra}`);
    }

    // Step 5: Final cleanup
    cleaned = this.removeSpaces(cleaned);

    if (!cleaned) {
      status.errors.push("No valid Arabic/Urdu characters found");
      return ['', status];
    }

    // All checks passed
    status.success = true;
    status.cleaned = cleaned;
    status.length = cleaned.length;
    status.charCount = cleaned.length;

    return [cleaned, status];
  }

  /**
   * Validate and report input
   */
  static validateAndReport(inputString) {
    const [cleaned, status] = this.processNameInput(inputString);

    if (status.success) {
      let msg = `✅ Valid input: '${cleaned}' (${status.length} characters)`;
      if (status.warnings.length > 0) {
        msg += `\n   ⚠️  ${status.warnings.join('; ')}`;
      }
      return [cleaned, msg];
    } else {
      let msg = `❌ Invalid input`;
      if (status.errors.length > 0) {
        msg += `: ${status.errors.join('; ')}`;
      }
      return ['', msg];
    }
  }
}

// ============================================================================
// DATA LOADER MODULE
// ============================================================================

class DataLoader {
  constructor(abjadValues = {}, divineNames = [], namesIndex = {}) {
    this.abjadValues = abjadValues;
    this.divineNames = divineNames;
    this.namesIndex = namesIndex;
    this.loaded = Object.keys(abjadValues).length > 0 && divineNames.length > 0;
  }

  /**
   * Load all data from JSON objects
   */
  loadAll(abjadValues, divineNames, namesIndex) {
    this.abjadValues = abjadValues;
    this.divineNames = divineNames;
    this.namesIndex = namesIndex;
    this.loaded = Object.keys(abjadValues).length > 0 && divineNames.length > 0;
    console.log(`[OK] Loaded ${Object.keys(abjadValues).length} abjad letter values`);
    console.log(`[OK] Loaded ${divineNames.length} Divine Names`);
    console.log(`[OK] Loaded index with ${Object.keys(namesIndex).length} unique abjad values`);
  }

  /**
   * Get abjad value for a specific letter
   */
  getLetterValue(letter) {
    if (!this.abjadValues || Object.keys(this.abjadValues).length === 0) {
      throw new Error("Abjad values not loaded. Call loadAll() first.");
    }
    return this.abjadValues[letter] || null;
  }

  /**
   * Get Divine Names matching an abjad value
   */
  getNamesByValue(value) {
    if (!this.namesIndex || Object.keys(this.namesIndex).length === 0) {
      throw new Error("Names index not loaded. Call loadAll() first.");
    }
    return this.namesIndex[String(value)] || [];
  }
}

// Global data loader instance
let _dataLoader = null;

function getDataLoader() {
  if (_dataLoader === null) {
    _dataLoader = new DataLoader();
  }
  return _dataLoader;
}

// ============================================================================
// ABJAD CALCULATOR MODULE
// ============================================================================

class AbjadCalculator {
  constructor() {
    this.loader = getDataLoader();
  }

  /**
   * Calculate the total Abjad value for an Arabic name
   */
  calculateAbjadValue(arabicName) {
    const result = {
      success: false,
      totalValue: 0,
      inputName: arabicName,
      characterBreakdown: [],
      charCount: 0,
      errors: [],
      warnings: []
    };

    // Validate input
    if (!arabicName) {
      result.errors.push('Input name is empty');
      return result;
    }

    if (typeof arabicName !== 'string') {
      result.errors.push(`Input must be string, got ${typeof arabicName}`);
      return result;
    }

    // Process each character
    let total = 0;
    let charCount = 0;

    for (let position = 0; position < arabicName.length; position++) {
      const char = arabicName[position];
      const letterValue = this.loader.getLetterValue(char);

      if (letterValue === null) {
        result.warnings.push(
          `Character '${char}' at position ${position} not found in Abjad table`
        );
        continue;
      }

      // Add to breakdown
      result.characterBreakdown.push({
        character: char,
        value: letterValue,
        position: position
      });

      total += letterValue;
      charCount += 1;
    }

    // Validate that we processed at least one character
    if (charCount === 0) {
      result.errors.push('No valid Arabic letters found in input');
      return result;
    }

    // Set success result
    result.success = true;
    result.totalValue = total;
    result.charCount = charCount;

    return result;
  }

  /**
   * Calculate with validation
   */
  calculateWithValidation(cleanedName) {
    const result = this.calculateAbjadValue(cleanedName);
    return [result.totalValue, result];
  }

  /**
   * Get individual character values as a simple list of tuples
   */
  getCharacterValues(arabicName) {
    const result = this.calculateAbjadValue(arabicName);

    if (!result.success) {
      return [];
    }

    return result.characterBreakdown.map(item => 
      [item.character, item.value]
    );
  }

  /**
   * Print a formatted calculation breakdown
   */
  printCalculation(arabicName, verbose = true) {
    const result = this.calculateAbjadValue(arabicName);

    if (!result.success) {
      console.log(`Calculation failed for '${arabicName}':`);
      result.errors.forEach(error => console.log(`  - ${error}`));
      result.warnings.forEach(warning => console.log(`  - ${warning}`));
      return;
    }

    if (verbose) {
      console.log(`Name: ${arabicName}`);
      console.log('-'.repeat(40));

      result.characterBreakdown.forEach(item => {
        console.log(`  ${item.character} = ${item.value}`);
      });

      console.log('-'.repeat(40));
    }

    console.log(`Total Abjad Value: ${result.totalValue}`);

    if (result.warnings.length > 0) {
      console.log("\nWarnings:");
      result.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
  }
}

// Global calculator instance
let _calculator = null;

function getCalculator() {
  if (_calculator === null) {
    _calculator = new AbjadCalculator();
  }
  return _calculator;
}

// ============================================================================
// NAME MATCHER MODULE
// ============================================================================

class NameMatcher {
  constructor() {
    this.loader = getDataLoader();
    this.valueToIds = {};
    this._buildValueMap();
  }

  /**
   * Build a map of abjad values to divine name IDs for fast lookup
   */
  _buildValueMap() {
    this.valueToIds = {};

    for (const name of this.loader.divineNames) {
      const value = name.abjad_value;
      const nameId = name.id;

      if (!this.valueToIds[value]) {
        this.valueToIds[value] = [];
      }

      this.valueToIds[value].push(nameId);
    }
  }

  /**
   * Get a divine name by its ID
   */
  _getNameById(nameId) {
    for (const name of this.loader.divineNames) {
      if (name.id === nameId) {
        return name;
      }
    }
    return null;
  }

  /**
   * Find Divine Names with exact Abjad value match
   */
  findDirectMatch(abjadValue) {
    const startTime = performance.now();

    const result = {
      found: false,
      type: 'direct_match',
      abjadValue: abjadValue,
      count: 0,
      divineNames: [],
      responseTimeMs: 0.0
    };

    // Look up value in names index
    const matchingNames = this.loader.getNamesByValue(abjadValue);

    if (matchingNames.length > 0) {
      result.found = true;
      result.count = matchingNames.length;
      result.divineNames = matchingNames;
    }

    result.responseTimeMs = performance.now() - startTime;
    return result;
  }

  /**
   * Find pairs of Divine Names whose sum equals the target Abjad value
   */
  findTwoNameCombination(abjadValue, limit = 10) {
    const startTime = performance.now();

    const result = {
      found: false,
      type: 'two_name_combination',
      abjadValue: abjadValue,
      count: 0,
      combinations: [],
      responseTimeMs: 0.0
    };

    // Create set of all available values for O(1) lookup
    const availableValues = new Set(Object.keys(this.valueToIds).map(Number));

    // Track combinations to avoid duplicates
    const recordedCombinations = new Set();
    const combinationsList = [];

    // Iterate through all divine names
    for (const name1 of this.loader.divineNames) {
      const name1Id = name1.id;
      const name1Value = name1.abjad_value;

      // Calculate required complementary value
      const requiredValue = abjadValue - name1Value;

      // Check if complementary value exists
      if (availableValues.has(requiredValue)) {
        const name2Ids = this.valueToIds[requiredValue];

        for (const name2Id of name2Ids) {
          // Skip self-combinations
          if (name1Id === name2Id) {
            continue;
          }

          // Create canonical form to avoid duplicates (A+B = B+A)
          const canonical = JSON.stringify([name1Id, name2Id].sort());

          if (recordedCombinations.has(canonical)) {
            continue;
          }

          recordedCombinations.add(canonical);

          // Get full name details
          const name2 = this._getNameById(name2Id);
          if (!name2) {
            continue;
          }

          // Build combination result
          const combination = {
            name1: {
              id: name1Id,
              arabic_name: name1.arabic_name,
              english_name: name1.english_name,
              abjad_value: name1Value,
              meaning: name1.meaning

            },
            name2: {
              id: name2Id,
              arabic_name: name2.arabic_name,
              english_name: name2.english_name,
              abjad_value: name2.abjad_value,
              meaning: name2.meaning

            },
            total: abjadValue
          };

          combinationsList.push(combination);
        }
      }
    }

    // Sort by name IDs and limit results
    combinationsList.sort((a, b) => {
      const diff = a.name1.id - b.name1.id;
      return diff !== 0 ? diff : a.name2.id - b.name2.id;
    });

    result.combinations = combinationsList.slice(0, limit);

    if (result.combinations.length > 0) {
      result.found = true;
      result.count = result.combinations.length;
    }

    result.responseTimeMs = performance.now() - startTime;
    return result;
  }

  /**
   * Unified matching function that tries both strategies
   */
  findMatch(abjadValue) {
    const directResult = this.findDirectMatch(abjadValue);

    if (directResult.found) {
      return directResult;
    }

    return this.findTwoNameCombination(abjadValue);
  }
}

// Global matcher instance
let _matcher = null;

function getMatcher() {
  if (_matcher === null) {
    _matcher = new NameMatcher();
  }
  return _matcher;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Initialize the calculator with data
 */
function initializeCalculator(abjadValues, divineNames, namesIndex) {
  const loader = getDataLoader();
  loader.loadAll(abjadValues, divineNames, namesIndex);
  console.log("[INFO] ism_e_azam_calculator_p initialized");
  console.log(`[INFO] Data loaded: ${loader.loaded}`);
  console.log(`[INFO] Divine names: ${loader.divineNames.length}`);
}

/**
 * Calculate Abjad value for a name
 * @param {string} name - Arabic/Urdu name
 * @returns {Object} Calculation result with success, totalValue, characterBreakdown, etc.
 */
function calculateAbjad(name) {
  try {
    // Validate and process input
    const validation = TextProcessor.processNameInput(name);
    const [cleanedName, status] = validation;

    if (!status.success) {
      return {
        success: false,
        error: 'Invalid input: ' + status.errors.join(', ')
      };
    }

    // Calculate Abjad value
    const calculator = getCalculator();
    const calcResult = calculator.calculateAbjadValue(cleanedName);

    if (!calcResult.success) {
      return {
        success: false,
        error: calcResult.errors.join(', ')
      };
    }

    return {
      success: true,
      totalValue: calcResult.totalValue,
      inputName: name,
      cleanedName: calcResult.inputName,
      characterBreakdown: calcResult.characterBreakdown.map((item, i) => ({
        position: i + 1,
        character: item.character,
        value: item.value
      })),
      charCount: calcResult.charCount
    };
  } catch (error) {
    console.error("[ERROR] Calculate error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Find Divine Names matching an Abjad value
 * @param {number} abjadValue - Calculated Abjad value
 * @returns {Object} Match result with found, type, divineNames or combinations
 */
function matchDivineNames(abjadValue) {
  try {
    // Validate input
    if (abjadValue === null || abjadValue === undefined) {
      return {
        success: false,
        error: 'Abjad value is required'
      };
    }

    // Convert to int
    try {
      abjadValue = parseInt(abjadValue);
    } catch (error) {
      return {
        success: false,
        error: 'Abjad value must be a number'
      };
    }

    // Find match
    const matcher = getMatcher();
    const matchResult = matcher.findMatch(abjadValue);

    if (matchResult.type === 'direct_match') {
      return {
        success: true,
        found: matchResult.found,
        type: 'direct_match',
        divineNames: matchResult.divineNames,
        count: matchResult.count,
        responseTimeMs: matchResult.responseTimeMs
      };
    } else {
      return {
        success: true,
        found: matchResult.found,
        type: 'two_name_combination',
        abjadValue: abjadValue,
        combinations: matchResult.combinations,
        count: matchResult.count,
        responseTimeMs: matchResult.responseTimeMs
      };
    }
  } catch (error) {
    console.error("[ERROR] Match error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// EXPORT FOR MODULE SYSTEMS
// ============================================================================

// For Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TextProcessor,
    DataLoader,
    getDataLoader,
    AbjadCalculator,
    getCalculator,
    NameMatcher,
    getMatcher,
    initializeCalculator,
    calculateAbjad,
    matchDivineNames
  };
}

// For browser global access
if (typeof window !== 'undefined') {
  window.ism_e_azam_calculator_p = {
    TextProcessor,
    DataLoader,
    getDataLoader,
    AbjadCalculator,
    getCalculator,
    NameMatcher,
    getMatcher,
    initializeCalculator,
    calculateAbjad,
    matchDivineNames
  };
}

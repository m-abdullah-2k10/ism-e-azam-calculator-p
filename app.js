/**
 * ISM-E-AZAM CALCULATOR - JavaScript App Controller
 * Client-side version - no backend server required
 */

// ========================================
// STATE MANAGEMENT
// ========================================

const appState = {
  lastCalculatedName: '',
  lastAbjadValue: 0,
  lastCalculationResult: null,
  isLoading: false
};

// ========================================
// DOM ELEMENTS
// ========================================

const nameInput = document.getElementById('nameInput');
const calculateBtn = document.getElementById('calculateBtn');
const clearBtn = document.getElementById('clearBtn');
const errorMessage = document.getElementById('errorMessage');
const resultSection = document.getElementById('resultSection');
const emptyState = document.getElementById('emptyState');
const loadingIndicator = document.getElementById('loadingIndicator');

// Result elements
const originalNameSpan = document.getElementById('originalName');
const cleanedNameSpan = document.getElementById('cleanedName');
const breakdownTableBody = document.getElementById('breakdownTableBody');
const totalValueSpan = document.getElementById('totalValue');
const matchResultDiv = document.getElementById('matchResult');

// ========================================
// EVENT LISTENERS
// ========================================

calculateBtn.addEventListener('click', handleCalculate);
clearBtn.addEventListener('click', handleClear);
nameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleCalculate();
  }
});

// ========================================
// MAIN HANDLERS
// ========================================

/**
 * Handle calculate button click
 */
async function handleCalculate() {
  const name = nameInput.value.trim();

  if (!name) {
    showError('Please enter a name');
    return;
  }

  clearError();
  setLoading(true);

  try {
    // Calculate Abjad value using client-side calculator
    const calcResult = window.ism_e_azam_calculator_p.calculateAbjad(name);

    if (!calcResult.success) {
      showError(calcResult.error || 'Failed to calculate Abjad value');
      setLoading(false);
      return;
    }

    appState.lastCalculatedName = name;
    appState.lastAbjadValue = calcResult.totalValue;

    // Display calculation results
    displayCalculationResults(calcResult);

    // Find matching Divine Names using client-side matcher
    const matchResult = window.ism_e_azam_calculator_p.matchDivineNames(calcResult.totalValue);

    if (matchResult.success) {
      appState.lastCalculationResult = matchResult;
      displayMatchResults(matchResult);
    } else {
      showError(matchResult.error || 'Failed to find matching Divine Names');
    }

  } catch (error) {
    showError('An error occurred: ' + error.message);
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
}

/**
 * Handle clear button click
 */
function handleClear() {
  nameInput.value = '';
  clearError();
  resultSection.style.display = 'none';
  emptyState.style.display = 'block';
  appState.lastCalculatedName = '';
  appState.lastAbjadValue = 0;
  appState.lastCalculationResult = null;
  nameInput.focus();
}

// ========================================
// DISPLAY FUNCTIONS
// ========================================

/**
 * Display calculation results
 */
function displayCalculationResults(calcResult) {
  // Show result section and hide empty state
  resultSection.style.display = 'block';
  emptyState.style.display = 'none';

  // Update input summary
  originalNameSpan.textContent = calcResult.inputName;
  cleanedNameSpan.textContent = calcResult.cleanedName;

  // Update character breakdown table
  breakdownTableBody.innerHTML = '';
  for (const item of calcResult.characterBreakdown) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.position}</td>
      <td class="arabic-text">${item.character}</td>
      <td>${item.value}</td>
    `;
    breakdownTableBody.appendChild(row);
  }

  // Update total value
  totalValueSpan.textContent = calcResult.totalValue;

  // Scroll to results
  setTimeout(() => {
    resultSection.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

/**
 * Display match results
 */
function displayMatchResults(matchResult) {
  matchResultDiv.innerHTML = '';

  if (!matchResult.found) {
    matchResultDiv.innerHTML = `
      <div class="error-message">
        <p>No direct matches or combinations found for value <strong>${matchResult.abjadValue}</strong></p>
      </div>
    `;
    return;
  }

  if (matchResult.type === 'direct_match') {
    displayDirectMatch(matchResult);
  } else if (matchResult.type === 'two_name_combination') {
    displayTwoNameCombination(matchResult);
  }
}

/**
 * Display direct match results
 */
function displayDirectMatch(result) {
  let html = `
    <div class="direct-match">
      <h4>🎉 Direct Match Found!</h4>
      <p class="match-count">${result.count} Divine Name(s) with value <strong>${result.abjadValue}</strong></p>
      <div class="divine-names-list">
  `;

  for (const name of result.divineNames) {
    html += `
      <div class="divine-name-item">
        <div class="name-header">
          <span class="arabic-name">${name.arabic_name}</span>
          <span class="english-name">${name.english_name}</span>
          <span class="urdu-name">${name.meaning}</span>
        </div>
        <div class="value-badge">${name.abjad_value}</div>


      </div>
    `;
  }

  html += `
      </div>
      <div class="response-time">Response time: ${result.responseTimeMs.toFixed(2)}ms</div>
    </div>
  `;

  matchResultDiv.innerHTML = html;
}

/**
 * Display two-name combination results
 */
function displayTwoNameCombination(result) {
  let html = `
    <div class="combination-match">
      <h4>🎯 Combinations Found!</h4>
      <p class="match-count">${result.count} combination(s) that add up to <strong>${result.abjadValue}</strong></p>
      <div class="combinations-list">
  `;

  for (const combo of result.combinations) {
    html += `
      <div class="combination-item">
        <div class="combination-formula">
          <div class="combination-name">
            <div class="arabic-name">${combo.name1.arabic_name}</div>
            <div class="english-name">${combo.name1.english_name}</div>
            <div class="value">${combo.name1.abjad_value}</div>
            <div class="meaning">${combo.name1.meaning}</div>
          </div>
          <div class="plus-sign">+</div>
          <div class="combination-name">
            <div class="arabic-name">${combo.name2.arabic_name}</div>
            <div class="english-name">${combo.name2.english_name}</div>
            <div class="value">${combo.name2.abjad_value}</div>
            <div class="meaning">${combo.name2.meaning}</div>
          </div>
          <div class="plus-sign">=</div>
          <div class="combination-name">
            <div class="value" style="font-size: 1.2em; color: var(--warning-color);">${combo.total}</div>
          </div>
        </div>
      </div>
    `;
  }

  html += `
      </div>
      <div class="response-time">Response time: ${result.responseTimeMs.toFixed(2)}ms</div>
    </div>
  `;

  matchResultDiv.innerHTML = html;
}

// ========================================
// UI UTILITIES
// ========================================

/**
 * Show error message
 */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}

/**
 * Clear error message
 */
function clearError() {
  errorMessage.textContent = '';
  errorMessage.style.display = 'none';
}

/**
 * Set loading state
 */
function setLoading(isLoading) {
  appState.isLoading = isLoading;

  if (isLoading) {
    loadingIndicator.style.display = 'block';
    calculateBtn.disabled = true;
    calculateBtn.textContent = 'Calculating...';
  } else {
    loadingIndicator.style.display = 'none';
    calculateBtn.disabled = false;
    calculateBtn.textContent = 'Calculate Abjad Value';
  }
}

// ========================================
// INITIALIZATION
// ========================================

/**
 * Wait for calculator to be initialized
 */
function waitForCalculator() {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (window.IsmCalculator && window.IsmCalculator.calculateAbjad) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, 5000);
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    await waitForCalculator();
    console.log('[OK] App initialized and ready');
    emptyState.style.display = 'block';
  });
} else {
  waitForCalculator().then(() => {
    console.log('[OK] App initialized and ready');
    emptyState.style.display = 'block';
  });
}
// ========================================
// VISITOR COUNT LOGIC (GLOBAL)
// ========================================

async function initVisitorCounter() {
  const visitorCountEl = document.getElementById('visitorCount');
  if (!visitorCountEl) return;

  const NAMESPACE = 'isme-azam-calculator';
  const KEY = 'visitor_count';
  const API_URL = `https://api.counterapi.dev/v1/${NAMESPACE}/${KEY}/increment`;

  try {
    // Check if we already incremented this session to avoid spamming the API
    const sessionToken = sessionStorage.getItem('vignette_counted');

    let visitorData;
    if (!sessionToken) {
      // Real increment call
      const response = await fetch(API_URL);
      visitorData = await response.json();
      sessionStorage.setItem('vignette_counted', 'true');
    } else {
      // Just fetch the current count without incrementing if already counted in this session
      const getUrl = `https://api.counterapi.dev/v1/${NAMESPACE}/${KEY}`;
      const response = await fetch(getUrl);
      visitorData = await response.json();
    }

    if (visitorData && visitorData.count) {
      const currentCount = visitorData.count;
      // Animate from a slightly lower number for visual effect
      animateValue(visitorCountEl, currentCount - 1, currentCount, 1500);
    }
  } catch (error) {
    console.error('Error fetching global visitor count:', error);
    // Fallback to a static number if API fails
    visitorCountEl.innerHTML = '1,248+';
  }
}

function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    obj.innerHTML = value.toLocaleString();
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Initialize visitor counter when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVisitorCounter);
} else {
  initVisitorCounter();
}

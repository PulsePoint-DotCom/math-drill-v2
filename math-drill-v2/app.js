// Math Drill - PWA App Logic with Tiered Mascot Shop

// ============== Tiered Mascot Definitions ==============
const MASCOTS = {
  // ---- COMMON (100-300 pts) ----
  frog: {
    id: 'frog',
    name: 'Flippy the Frog',
    emoji: '🐸',
    img: 'img/frog.png',
    tier: 'common',
    cost: 100,
    desc: 'A loyal starter buddy',
    ability: (lvl) => '+5% pts per level',
    bonus: (lvl) => 1 + lvl * 0.05
  },
  turtle: {
    id: 'turtle',
    name: 'Shelly the Turtle',
    emoji: '🐢',
    img: 'img/turtle.png',
    tier: 'common',
    cost: 250,
    desc: 'Slow and steady wins points',
    ability: (lvl) => `+${lvl * 10}% streak protection`,
    streakBonus: (lvl) => lvl * 10
  },
  // ---- UNCOMMON (500-1000 pts) ----
  owl: {
    id: 'owl',
    name: 'Oliver the Owl',
    emoji: '🦉',
    img: 'img/owl.png',
    tier: 'uncommon',
    cost: 600,
    desc: 'Hints from above',
    ability: (lvl) => `${lvl * 15}% hint chance`,
    hintChance: (lvl) => lvl * 15
  },
  robot: {
    id: 'robot',
    name: 'Robo-Math',
    emoji: '🤖',
    img: 'img/robot.png',
    tier: 'uncommon',
    cost: 900,
    desc: 'Catches your mistakes',
    ability: (lvl) => `${Math.min(lvl * 20, 80)}% retry chance`,
    retryChance: (lvl) => Math.min(lvl * 20, 80)
  },
  // ---- RARE (1500-2500 pts) ----
  wizard: {
    id: 'wizard',
    name: 'Wizard Wizz',
    emoji: '🧙‍♂️',
    img: 'img/wizard.png',
    tier: 'rare',
    cost: 1500,
    desc: 'Magic point multiplier',
    ability: (lvl) => `+${lvl * 15}% pts on correct`,
    wizardBonus: (lvl) => 1 + lvl * 0.15
  },
  dragon: {
    id: 'dragon',
    name: 'Drake the Dragon',
    emoji: '🐉',
    img: 'img/dragon.png',
    tier: 'rare',
    cost: 2500,
    desc: 'One free wrong per day',
    ability: (lvl) => `${lvl} free wrong${lvl > 1 ? 's' : ''}/day`,
    freeWrongPerLevel: (lvl) => lvl
  },
  // ---- EPIC (4000-6000 pts) ----
  phoenix: {
    id: 'phoenix',
    name: 'Flame the Phoenix',
    emoji: '🔥',
    img: 'img/phoenix.png',
    tier: 'epic',
    cost: 4500,
    desc: 'Revives your streak from the ashes',
    ability: (lvl) => `Streak revive at ${lvl} wrong`,
    streakReviveAt: (lvl) => lvl
  },
  unicorn: {
    id: 'unicorn',
    name: 'Sparkle the Unicorn',
    emoji: '🦄',
    img: 'img/unicorn.png',
    tier: 'epic',
    cost: 6000,
    desc: 'Chance for double points',
    ability: (lvl) => `${lvl * 10}% double pts`,
    doubleChance: (lvl) => lvl * 10
  },
  // ---- LEGENDARY (8000-12000 pts) ----
  dragonking: {
    id: 'dragonking',
    name: 'Zephyrus the Dragon King',
    emoji: '👑🐉',
    img: 'img/dragonking.png',
    tier: 'legendary',
    cost: 10000,
    desc: 'Ultimate companion',
    ability: (lvl) => `All abilities + ${lvl * 5}% boost`,
    allBoost: (lvl) => 1 + lvl * 0.05
  },
  cosmic: {
    id: 'cosmic',
    name: 'Cosmic Nova',
    emoji: '🌌✨',
    img: 'img/cosmic.png',
    tier: 'legendary',
    cost: 15000,
    desc: 'Master of math dimensions',
    ability: (lvl) => `+${lvl * 20}% all points`,
    cosmicBonus: (lvl) => 1 + lvl * 0.20
  }
};

const TIER_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const TIER_LABELS = {
  common: '🟢 Common',
  uncommon: '🔵 Uncommon',
  rare: '🟣 Rare',
  epic: '🟠 Epic',
  legendary: '🟡 Legendary'
};
const TIER_COLORS = {
  common: '#2ecc71',
  uncommon: '#3498db',
  rare: '#9b59b6',
  epic: '#e67e22',
  legendary: '#f1c40f'
};

const UPGRADE_COSTS = [200, 500, 1000]; // level 1→2, 2→3, 3→4
const MAX_MASCOT_LEVEL = 4;
const FREE_WRONG_MAX_PER_DAY = 5;

// ============== State ==============
let settings = {
  difficulty: 1,
  operations: { add: true, sub: true, mul: true, div: true }
};

let stats = {
  currentStreak: 0,
  bestStreak: 0,
  totalCorrect: 0,
  totalWrong: 0,
  totalTime: 0,
  history: []
};

let pointsData = {
  currentPoints: 0,
  lifetimePoints: 0
};

let mascotsData = {
  owned: [],
  equipped: null,
  levels: {},
  freeWrongUsedToday: 0,
  freeWrongResetDate: null
};

let currentProblem = null;
let problemStartTime = null;
let lastHint = null;

// ============== DOM Elements ==============
const tabs = document.querySelectorAll('.tab');
const navBtns = document.querySelectorAll('.nav-btn');

// Home tab
const noProblemEl = document.getElementById('no-problem');
const activeProblemEl = document.getElementById('active-problem');
const resultDisplayEl = document.getElementById('result-display');
const problemDisplayEl = document.getElementById('problem-display');
const answerInputEl = document.getElementById('answer-input');
const submitAnswerBtn = document.getElementById('submit-answer');
const resultIconEl = document.getElementById('result-icon');
const resultTextEl = document.getElementById('result-text');
const correctAnswerEl = document.getElementById('correct-answer');
const expectedAnswerEl = document.getElementById('expected-answer');
const nextBtn = document.getElementById('next-btn');
const pointsDisplayEl = document.getElementById('points-display');
const mascotOnProblemEl = document.getElementById('problem-mascot');
const mascotAbilityEl = document.getElementById('problem-mascot-ability');
const mascotImgEl = document.getElementById('problem-mascot-img');
const mascotNameEl = document.getElementById('problem-mascot-name');
const homeMascotCenterEl = document.getElementById('home-mascot-center');
const shopPointsEl = document.getElementById('shop-points');
const diffBadgeEl = document.getElementById('diff-badge');
const pointsChangeEl = document.getElementById('points-change');
const hintBubbleEl = document.getElementById('hint-bubble');
const difficultyBadgeEl = document.getElementById('difficulty-badge');

// Stats elements
const currentStreakEl = document.getElementById('current-streak');
const bestStreakEl = document.getElementById('best-streak');
const accuracyEl = document.getElementById('accuracy');
const totalCorrectEl = document.getElementById('total-correct');
const totalWrongEl = document.getElementById('total-wrong');
const historyListEl = document.getElementById('history-list');
const pointsSummaryEl = document.getElementById('points-summary');

// Settings elements
const difficultySliderEl = document.getElementById('difficulty-slider');
const opAddEl = document.getElementById('op-add');
const opSubEl = document.getElementById('op-sub');
const opMulEl = document.getElementById('op-mul');
const opDivEl = document.getElementById('op-div');
const resetStatsBtn = document.getElementById('reset-stats');

// Mascot elements
const mascotCardsEl = document.getElementById('mascot-cards');
const shopHeaderEl = document.getElementById('shop-header');

// ============== Initialization ==============
function init() {
  try {
    loadData();
    checkFreeWrongReset();
    setupEventListeners();
    updateUI();
    renderMascotShop();
    updateProblemMascotDisplay();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  } catch (e) {
    console.error('Math Drill init error:', e);
    setupEventListeners();
  }
}

function loadData() {
  try {
    const savedSettings = localStorage.getItem('mathdrill_settings');
    const savedStats = localStorage.getItem('mathdrill_stats');
    const savedPoints = localStorage.getItem('mathdrill_points');
    const savedMascots = localStorage.getItem('mathdrill_mascots');

    if (savedSettings) settings = { ...settings, ...JSON.parse(savedSettings) };
    if (savedStats) stats = { ...stats, ...JSON.parse(savedStats) };
    if (savedPoints) pointsData = { ...pointsData, ...JSON.parse(savedPoints) };
    if (savedMascots) mascotsData = { ...mascotsData, ...JSON.parse(savedMascots) };
  } catch (e) {
    // Corrupted localStorage — start fresh
    localStorage.removeItem('mathdrill_settings');
    localStorage.removeItem('mathdrill_stats');
    localStorage.removeItem('mathdrill_points');
    localStorage.removeItem('mathdrill_mascots');
  }
}

function saveData() {
  localStorage.setItem('mathdrill_settings', JSON.stringify(settings));
  localStorage.setItem('mathdrill_stats', JSON.stringify(stats));
  localStorage.setItem('mathdrill_points', JSON.stringify(pointsData));
  localStorage.setItem('mathdrill_mascots', JSON.stringify(mascotsData));
}

// ============== Event Listeners ==============
function setupEventListeners() {
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.getElementById('solve-now').addEventListener('click', generateProblem);
  submitAnswerBtn.addEventListener('click', submitAnswer);
  answerInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); submitAnswer(); }
  });
  nextBtn.addEventListener('click', () => {
    hideAllHomeSections();
    noProblemEl.classList.remove('hidden');
  });

  difficultySliderEl.addEventListener('input', (e) => {
    settings.difficulty = parseInt(e.target.value);
    saveData();
    updateDifficultyBadge();
  });

  opAddEl.addEventListener('change', (e) => { settings.operations.add = e.target.checked; saveData(); });
  opSubEl.addEventListener('change', (e) => { settings.operations.sub = e.target.checked; saveData(); });
  opMulEl.addEventListener('change', (e) => { settings.operations.mul = e.target.checked; saveData(); });
  opDivEl.addEventListener('change', (e) => { settings.operations.div = e.target.checked; saveData(); });
  resetStatsBtn.addEventListener('click', resetAllData);
}

// ============== Tab Navigation ==============
function switchTab(tabName) {
  tabs.forEach(tab => tab.classList.remove('active'));
  navBtns.forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tab-${tabName}`).classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  if (tabName === 'stats') updateStatsUI();
  if (tabName === 'settings') updateSettingsUI();
  if (tabName === 'mascots') renderMascotShop();
}

// ============== Problem Generation ==============
function generateProblem() {
  const ops = [];
  if (settings.operations.add) ops.push('+');
  if (settings.operations.sub) ops.push('-');
  if (settings.operations.mul) ops.push('x');
  if (settings.operations.div) ops.push('/');

  if (ops.length === 0) {
    alert('Enable at least one operation in settings.');
    return;
  }

  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer, display;

  if (settings.difficulty === 1) {
    a = Math.floor(Math.random() * 9) + 1;
    b = Math.floor(Math.random() * 9) + 1;
    if (op === '-' && a < b) [a, b] = [b, a];
    if (op === '/') { b = Math.floor(Math.random() * 9) + 1; a = b * (Math.floor(Math.random() * 10) + 1); }
    answer = calcAnswer(a, op, b);
    display = `${a} ${op} ${b}`;

  } else if (settings.difficulty === 2) {
    a = Math.floor(Math.random() * 90) + 10;
    b = Math.floor(Math.random() * 90) + 10;
    if (op === '-' && a < b) [a, b] = [b, a];
    if (op === '/') { b = Math.floor(Math.random() * 12) + 2; a = b * (Math.floor(Math.random() * 15) + 1); }
    answer = calcAnswer(a, op, b);
    display = `${a} ${op} ${b}`;

  } else {
    // Multi-step — generate (a op1 b) op2 c
    const op1 = ops[Math.floor(Math.random() * ops.length)];
    const op2 = ops[Math.floor(Math.random() * ops.length)];
    let n1 = Math.floor(Math.random() * 12) + 1;
    let n2 = Math.floor(Math.random() * 12) + 1;
    if (op1 === '-' && n1 < n2) [n1, n2] = [n2, n1];
    if (op1 === '/') { n2 = Math.floor(Math.random() * 10) + 2; n1 = n2 * (Math.floor(Math.random() * 12) + 1); }
    let n3 = Math.floor(Math.random() * 12) + 1;

    const useParens = Math.random() > 0.5;
    if (useParens) {
      const first = calcAnswer(n1, op1, n2);
      if (first === null) { generateProblem(); return; } // retry on invalid
      answer = calcAnswer(first, op2, n3);
      if (answer === null) { generateProblem(); return; }
      display = `( ${n1} ${op1} ${n2} ) ${op2} ${n3}`;
    } else {
      const first = calcAnswer(n2, op1, n3);
      if (first === null) { generateProblem(); return; }
      answer = calcAnswer(n1, op2, first);
      if (answer === null) { generateProblem(); return; }
      display = `${n1} ${op2} ( ${n2} ${op1} ${n3} )`;
    }
  }

  if (answer === null || !Number.isFinite(answer) || answer !== Math.round(answer)) {
    generateProblem(); return; // retry non-integer answers
  }

  currentProblem = { display, answer };
  lastHint = null;

  hideAllHomeSections();
  activeProblemEl.classList.remove('hidden');
  problemDisplayEl.textContent = display;
  answerInputEl.value = '';
  answerInputEl.focus();
  problemStartTime = Date.now();

  updateProblemMascotDisplay();
}

function calcAnswer(a, op, b) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case 'x': return a * b;
    case '/':
      if (b === 0 || a % b !== 0) return null;
      return a / b;
    default: return null;
  }
}

// ============== Mascot Display on Problem ==============
function updateProblemMascotDisplay() {
  const playgroundEl = document.getElementById('playground-mascots');
  const homeEl = document.getElementById('home-mascot-center');

  if (mascotsData.owned.length === 0) {
    playgroundEl.innerHTML = '<div class="no-mascot-hint" style="font-size:0.7rem;text-align:center;">No mascots yet!<br>Visit the shop 👾</div>';
    if (homeEl) homeEl.innerHTML = '<div class="no-mascot-hint">Go to Mascot Shop to get a companion!</div>';
    return;
  }

  // Render all owned mascots in playground, sized by tier+level
  playgroundEl.innerHTML = mascotsData.owned.map(id => {
    const def = MASCOTS[id];
    const level = mascotsData.levels[id] || 1;
    const isEquipped = mascotsData.equipped === id;
    const sizeClass = `pg-mascot-${def.tier}-${level}`;
    const stars = '⭐'.repeat(level);
    return `
      <div class="pg-mascot ${sizeClass}${isEquipped ? ' equipped' : ''}">
        <img src="${def.img}" alt="${def.name}" class="pg-mascot-img">
        ${isEquipped ? `<div class="pg-mascot-level">${stars}</div>` : ''}
        <div class="pg-mascot-name">${def.emoji} ${def.name.split(' ')[0]}</div>
      </div>`;
  }).join('');

  // Also update home mascot center
  if (homeEl) {
    if (mascotsData.equipped) {
      const def = MASCOTS[mascotsData.equipped];
      homeEl.innerHTML = `<img src="${def.img}" alt="${def.name}" class="home-mascot-img"><div class="home-mascot-name">${def.name}</div>`;
    } else {
      homeEl.innerHTML = '<div class="no-mascot-hint">Go to Mascot Shop to get a companion!</div>';
    }
  }
}

function showHint() {
  if (!lastHint) return;
  hintBubbleEl.textContent = `Hint: last digit is "${lastHint}"`;
  hintBubbleEl.classList.remove('hidden');
}

// ============== Answer Submission ==============
function submitAnswer() {
  if (!currentProblem) return;

  const userAnswer = parseFloat(answerInputEl.value);
  if (isNaN(userAnswer)) return;

  const correct = Math.round(userAnswer) === currentProblem.answer;
  const solveTime = problemStartTime ? Math.round((Date.now() - problemStartTime) / 1000) : null;

  // Base points = difficulty * 15
  let basePoints = settings.difficulty * 15;

  // Streak multiplier
  const streakMult = Math.min(1 + (stats.currentStreak * 0.1), 3);

  // Fast bonus (< 10 sec)
  const fastBonus = (solveTime && solveTime < 10) ? settings.difficulty * 10 : 0;

  // Mascot bonuses
  let mascotMult = 1;
  let bonusText = '';
  let usedRetry = false;

  if (mascotsData.equipped) {
    const mid = mascotsData.equipped;
    const def = MASCOTS[mid];
    const level = mascotsData.levels[mid] || 1;

    // Wizard bonus
    if (def.wizardBonus) mascotMult *= def.wizardBonus(level);

    // Frog bonus
    if (def.bonus) mascotMult *= def.bonus(level);

    // Cosmic bonus
    if (def.cosmicBonus) mascotMult *= def.cosmicBonus(level);

    // Dragon King all-boost
    if (def.allBoost) mascotMult *= def.allBoost(level);

    // Owl hint
    if (def.hintChance && Math.random() * 100 < def.hintChance(level)) {
      lastHint = String(currentProblem.answer).slice(-1);
    }

    // Robot retry
    if (!correct && def.retryChance && Math.random() * 100 < def.retryChance(level)) {
      usedRetry = true;
    }

    // Unicorn double
    if (correct && def.doubleChance && Math.random() * 100 < def.doubleChance(level)) {
      bonusText = '💥 DOUBLE PTS!';
      basePoints *= 2;
    }
  }

  let pointsEarned = 0;
  let pointsLost = 0;

  if (correct) {
    stats.currentStreak++;
    stats.totalCorrect++;
    if (stats.currentStreak > stats.bestStreak) stats.bestStreak = stats.currentStreak;

    pointsEarned = Math.round(basePoints * streakMult * mascotMult) + fastBonus;

    // Phoenix streak revive tracker (handled on wrong)
    if (bonusText) pointsEarned = Math.round(basePoints * 2 * streakMult * mascotMult) + fastBonus;

    pointsData.currentPoints += pointsEarned;
    pointsData.lifetimePoints += pointsEarned;

  } else {
    // Phoenix streak revive — let streak survive some wrong answers
    let streakSurvived = false;
    if (mascotsData.equipped === 'phoenix') {
      const level = mascotsData.levels['phoenix'] || 1;
      const reviveAt = def?.streakReviveAt ? def.streakReviveAt(level) : 1;
      // phoenix doesn't have streakReviveAt in the object... use default 1
      if (level >= 1 && stats.currentStreak > 0) {
        streakSurvived = true;
      }
    }

    // Dragon free wrong
    let usedFreeWrong = false;
    if (mascotsData.equipped === 'dragon' && mascotsData.freeWrongUsedToday < (MASCOTS.dragon.freeWrongPerLevel(mascotsData.levels['dragon'] || 1))) {
      mascotsData.freeWrongUsedToday++;
      usedFreeWrong = true;
      bonusText = '🐉 Dragon saved your streak!';
      // Streak survives, but no points lost
      saveData();
      showResult(false, 0, 0, usedFreeWrong, bonusText, solveTime);
      return;
    }

    if (!usedFreeWrong && !streakSurvived) {
      stats.currentStreak = 0;
    }
    stats.totalWrong++;
    pointsLost = Math.round(20 * settings.difficulty);
    pointsData.currentPoints = Math.max(0, pointsData.currentPoints - pointsLost);
  }

  if (solveTime !== null) stats.totalTime += solveTime;

  stats.history.unshift({
    problem: currentProblem.display,
    answer: currentProblem.answer,
    userAnswer,
    correct,
    time: Date.now(),
    solveTime,
    pointsEarned,
    pointsLost
  });

  if (stats.history.length > 20) stats.history = stats.history.slice(0, 20);

  saveData();
  updateHomePointsDisplay();
  updateProblemMascotDisplay();

  if (usedRetry) {
    showRetry();
  } else {
    showResult(correct, pointsEarned, pointsLost, false, bonusText, solveTime);
  }
}

function showRetry() {
  hideAllHomeSections();
  resultDisplayEl.classList.remove('hidden');
  resultIconEl.textContent = '🤖';
  resultTextEl.textContent = 'Robo caught it! Retry!';
  resultTextEl.className = 'result-text wrong';
  correctAnswerEl.classList.add('hidden');
  pointsChangeEl.classList.add('hidden');
  resultDisplayEl.classList.remove('correct-flash');
  resultDisplayEl.classList.add('wrong-flash');

  setTimeout(() => {
    hideAllHomeSections();
    activeProblemEl.classList.remove('hidden');
    answerInputEl.value = '';
    answerInputEl.focus();
    problemStartTime = Date.now();
    lastHint = null;
    updateProblemMascotDisplay();
    resultDisplayEl.classList.remove('correct-flash', 'wrong-flash');
  }, 1800);
}

function showResult(correct, pointsEarned, pointsLost, usedFreeWrong, bonusText, solveTime) {
  hideAllHomeSections();
  resultDisplayEl.classList.remove('hidden');

  if (correct) {
    resultIconEl.textContent = '✅';
    resultTextEl.textContent = bonusText || 'Correct!';
    resultTextEl.className = bonusText ? 'result-text bonus' : 'result-text correct';
    correctAnswerEl.classList.add('hidden');
    resultDisplayEl.classList.remove('wrong-flash');
    resultDisplayEl.classList.add('correct-flash');
    pointsChangeEl.textContent = `+${pointsEarned} pts`;
    pointsChangeEl.className = 'points-change positive';
    pointsChangeEl.classList.remove('hidden');
  } else {
    resultIconEl.textContent = usedFreeWrong ? '🐉' : '❌';
    resultTextEl.textContent = bonusText || 'Wrong!';
    resultTextEl.className = usedFreeWrong ? 'result-text saved' : 'result-text wrong';
    correctAnswerEl.classList.remove('hidden');
    expectedAnswerEl.textContent = currentProblem.answer;
    resultDisplayEl.classList.remove('correct-flash');
    resultDisplayEl.classList.add('wrong-flash');
    if (pointsLost > 0) {
      pointsChangeEl.textContent = `-${pointsLost} pts`;
      pointsChangeEl.className = 'points-change negative';
      pointsChangeEl.classList.remove('hidden');
    } else {
      pointsChangeEl.classList.add('hidden');
    }
  }

  setTimeout(() => resultDisplayEl.classList.remove('correct-flash', 'wrong-flash'), 500);
}

// ============== UI ==============
function hideAllHomeSections() {
  noProblemEl.classList.add('hidden');
  activeProblemEl.classList.add('hidden');
  resultDisplayEl.classList.add('hidden');
  pointsChangeEl.classList.add('hidden');
  hintBubbleEl.classList.add('hidden');
}

function updateUI() {
  updateStatsUI();
  updateSettingsUI();
  updateDifficultyBadge();
  updateHomePointsDisplay();
}

function updateHomePointsDisplay() {
  pointsDisplayEl.textContent = pointsData.currentPoints.toLocaleString();
}

function updateDifficultyBadge() {
  const labels = ['', 'Single', 'Double', 'Multi-step'];
  difficultyBadgeEl.textContent = labels[settings.difficulty] || '';
}

function updateStatsUI() {
  currentStreakEl.textContent = stats.currentStreak;
  bestStreakEl.textContent = stats.bestStreak;
  const total = stats.totalCorrect + stats.totalWrong;
  const accuracy = total > 0 ? Math.round((stats.totalCorrect / total) * 100) : 0;
  accuracyEl.textContent = `${accuracy}%`;
  totalCorrectEl.textContent = stats.totalCorrect;
  totalWrongEl.textContent = stats.totalWrong;

  const solvedWithTime = stats.history.filter(h => h.solveTime !== null);
  const avgTime = solvedWithTime.length > 0 ? Math.round(stats.totalTime / solvedWithTime.length) : null;
  document.getElementById('avg-time').textContent = avgTime !== null ? formatTime(avgTime) : '--';

  if (stats.history.length === 0) {
    historyListEl.innerHTML = '<li class="history-empty">No problems solved yet</li>';
  } else {
    historyListEl.innerHTML = stats.history.slice(0, 10).map(item => {
      const timeStr = item.solveTime !== null ? formatTime(item.solveTime) : '--';
      const ptsStr = item.pointsEarned > 0 ? ` +${item.pointsEarned}` : (item.pointsLost > 0 ? ` ${item.pointsLost}` : '');
      return `<li class="history-item">
        <div class="history-left">
          <span class="problem">${item.problem} = ${item.answer}</span>
          <span class="solve-time">⏱ ${timeStr}${ptsStr}</span>
        </div>
        <span class="result-icon">${item.correct ? '✅' : '❌'}</span>
      </li>`;
    }).join('');
  }

  document.getElementById('points-current').textContent = pointsData.currentPoints.toLocaleString();
  document.getElementById('points-lifetime').textContent = pointsData.lifetimePoints.toLocaleString();
  document.getElementById('mascots-owned').textContent = mascotsData.owned.length;
}

function updateSettingsUI() {
  difficultySliderEl.value = settings.difficulty;
  opAddEl.checked = settings.operations.add;
  opSubEl.checked = settings.operations.sub;
  opMulEl.checked = settings.operations.mul;
  opDivEl.checked = settings.operations.div;
}

function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  return `${mins}m ${seconds % 60}s`;
}

// ============== Mascot Shop ==============
function checkFreeWrongReset() {
  const today = new Date().toDateString();
  if (mascotsData.freeWrongResetDate !== today) {
    mascotsData.freeWrongUsedToday = 0;
    mascotsData.freeWrongResetDate = today;
    saveData();
  }
}

function renderMascotShop() {
  shopPointsEl.textContent = pointsData.currentPoints.toLocaleString();
  const owned = mascotsData.owned;
  const equipped = mascotsData.equipped;
  const currentPts = pointsData.currentPoints;

  let html = '';

  for (const tier of TIER_ORDER) {
    const tierMascots = Object.values(MASCOTS).filter(m => m.tier === tier);
    if (tierMascots.length === 0) continue;

    html += `<div class="shop-tier-header" style="border-left: 4px solid ${TIER_COLORS[tier]}">${TIER_LABELS[tier]}</div>`;
    html += `<div class="mascot-tier-grid">`;

    for (const def of tierMascots) {
      const isOwned = owned.includes(def.id);
      const isEquipped = equipped === def.id;
      const level = mascotsData.levels[def.id] || 1;

      const canAffordBuy = currentPts >= def.cost;

      let cardClass = `mascot-card tier-${def.tier}`;
      if (isEquipped) cardClass += ' equipped';
      if (isOwned) cardClass += ' owned';

      let buttons = '';

      if (isOwned) {
        if (isEquipped) {
          buttons += `<button class="btn-mascot equipped" data-id="${def.id}" data-action="unequip">On Field ✅</button>`;
        } else {
          buttons += `<button class="btn-mascot" data-id="${def.id}" data-action="equip">Equip</button>`;
        }
      } else {
        buttons += `<button class="btn-mascot buy ${canAffordBuy ? '' : 'disabled'}" data-id="${def.id}" data-action="buy">
          ${canAffordBuy ? `Buy — ${def.cost.toLocaleString()} pts` : `🔒 ${def.cost.toLocaleString()} pts`}</button>`;
      }

      const levelStars = '⭐'.repeat(level);

      html += `<div class="${cardClass}">
        <img src="${def.img}" alt="${def.name}" class="mascot-card-img">
        ${isOwned ? `<div class="mascot-level">${levelStars}</div>` : ''}
        <div class="mascot-name">${def.name}</div>
        <div class="mascot-desc">${def.desc}</div>
        <div class="mascot-ability">${def.ability(level)}</div>
        <div class="mascot-cost">${isOwned ? `Level ${level} — ${levelStars}` : `${def.cost.toLocaleString()} pts`}</div>
        <div class="mascot-buttons">${buttons}</div>
      </div>`;
    }

    html += `</div>`;
  }

  mascotCardsEl.innerHTML = html;

  mascotCardsEl.querySelectorAll('.btn-mascot').forEach(btn => {
    btn.addEventListener('click', () => {
      handleMascotAction(btn.dataset.id, btn.dataset.action);
    });
  });
}

function handleMascotAction(id, action) {
  const def = MASCOTS[id];

  if (action === 'buy') {
    if (pointsData.currentPoints < def.cost) return;
    pointsData.currentPoints -= def.cost;
    mascotsData.owned.push(id);
    mascotsData.levels[id] = 1;
    if (!mascotsData.equipped) mascotsData.equipped = id;
    saveData();
    renderMascotShop();
    updateHomePointsDisplay();
    updateProblemMascotDisplay();

  } else if (action === 'equip') {
    mascotsData.equipped = id;
    saveData();
    renderMascotShop();
    updateProblemMascotDisplay();

  } else if (action === 'unequip') {
    mascotsData.equipped = null;
    saveData();
    renderMascotShop();
    updateProblemMascotDisplay();

  }
}

function resetAllData() {
  if (!confirm('Reset EVERYTHING? All points, mascots, stats — gone. Cannot undo.')) return;
  stats = { currentStreak: 0, bestStreak: 0, totalCorrect: 0, totalWrong: 0, totalTime: 0, history: [] };
  pointsData = { currentPoints: 0, lifetimePoints: 0 };
  mascotsData = { owned: [], equipped: null, levels: {}, freeWrongUsedToday: 0, freeWrongResetDate: null };
  settings = { difficulty: 1, operations: { add: true, sub: true, mul: true, div: true } };
  saveData();
  updateUI();
  renderMascotShop();
  updateProblemMascotDisplay();
  hideAllHomeSections();
  noProblemEl.classList.remove('hidden');
  alert('All data cleared! Fresh start. 🧙‍♂️');
}

// ============== Start ==============
document.addEventListener('DOMContentLoaded', init);

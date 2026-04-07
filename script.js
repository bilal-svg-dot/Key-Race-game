// Game Configuration
const words = [
  "sigh", "tense", "airplane", "ball", "pies", "juice", "warlike", "bad",
  "north", "dependent", "steer", "silver", "highfalutin", "superficial",
  "quince", "eight", "feeble", "admit", "drag", "loving", "speed", "game",
  "typing", "challenge", "keyboard", "computer", "program", "developer",
  "javascript", "website", "internet", "coding", "practice", "skill",
  "improve", "accuracy", "speed", "reaction", "focus", "concentration"
];

// Game State Variables
let currentPlayerName = "Player";
let currentDifficulty = "medium";
let highScore = 0;
let gameActive = false;
let gamePaused = false;
let gameTimer = null;
let timeLeft = 20;
let currentScore = 0;
let currentWord = "";
let wordsTyped = 0;
let correctWords = 0;
let currentStreak = 0;
let bestStreak = 0;
let gameStartTime = 0;
let lastWordTime = 0;

// New feature variables
let comboMultiplier = 1;
let powerUpActive = null;
let powerUpTimer = null;
let wordTimes = []; // Track time per word for stats

let currentCategory = "general";
let wordBanks = {}; // Will be imported

// DOM Elements
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings');
const playerNameInput = document.getElementById('playerName');
const difficultySelect = document.getElementById('difficulty');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const saveMessage = document.getElementById('saveMessage');
const wordCategorySelect = document.getElementById('wordCategory');

// Main Menu Elements
const mainMenu = document.getElementById('mainMenu');
const singlePlayerScreen = document.getElementById('singlePlayerScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const howToPlayScreen = document.getElementById('howToPlayScreen');

// Game Elements
const currentPlayerNameDisplay = document.getElementById('currentPlayerName');
const currentDifficultyDisplay = document.getElementById('currentDifficulty');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const gamePlayerName = document.getElementById('gamePlayerName');
const gameDifficultyBadge = document.getElementById('gameDifficultyBadge');
const timeLeftDisplay = document.getElementById('timeLeft');
const currentScoreDisplay = document.getElementById('currentScore');
const currentAccuracyDisplay = document.getElementById('currentAccuracy');
const currentWordDisplay = document.getElementById('currentWord');
const textInput = document.getElementById('textInput');
const wordsTypedCount = document.getElementById('wordsTypedCount');
const correctWordsCount = document.getElementById('correctWordsCount');
const wpmDisplay = document.getElementById('wpmDisplay');
const currentStreakDisplay = document.getElementById('currentStreak');
const wordProgress = document.getElementById('wordProgress');

// Buttons
const startSinglePlayerBtn = document.getElementById('startSinglePlayer');
const backToMenuBtn = document.getElementById('backToMenuBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const goToMenuBtn = document.getElementById('goToMenuBtn');
const shareResultsBtn = document.getElementById('shareResultsBtn');
const showHowToPlayBtn = document.getElementById('showHowToPlay');
const backFromGuideBtn = document.getElementById('backFromGuideBtn');
const startFromGuideBtn = document.getElementById('startFromGuideBtn');

// Results Elements
const finalScoreDisplay = document.getElementById('finalScoreDisplay');
const finalWordsTyped = document.getElementById('finalWordsTyped');
const finalAccuracyDisplay = document.getElementById('finalAccuracyDisplay');
const finalWPMDisplay = document.getElementById('finalWPMDisplay');
const finalBestStreak = document.getElementById('finalBestStreak');
const finalHighScore = document.getElementById('finalHighScore');
const resultsMessage = document.getElementById('resultsMessage');

// Initialize Game
async function initGame() {
    loadSettings();
    await loadWordBanks();
    setupEventListeners();
    updateUI();
}

// Load word banks
async function loadWordBanks() {
    try {
        const wordsModule = await import('./words.js');
        wordBanks = wordsModule.wordBanks;
        console.log('Word banks loaded successfully');
    } catch (error) {
        console.error('Error loading word banks:', error);
        wordBanks = {
            general: words
        };
    }
}

// Load settings
function loadSettings() {
    const savedName = localStorage.getItem('keyRacePlayerName');
    const savedDifficulty = localStorage.getItem('keyRaceDifficulty');
    const savedHighScore = localStorage.getItem('keyRaceHighScore');
    const savedCategory = localStorage.getItem('keyRaceCategory');
    
    if (savedName) {
        currentPlayerName = savedName;
        playerNameInput.value = savedName;
    }
    
    if (savedDifficulty) {
        currentDifficulty = savedDifficulty;
        difficultySelect.value = savedDifficulty;
    }
    
    if (savedHighScore) {
        highScore = parseInt(savedHighScore);
    }
    
    if (savedCategory) {
        currentCategory = savedCategory;
        wordCategorySelect.value = savedCategory;
    }
}

// Save settings
function saveSettings() {
    const name = playerNameInput.value.trim() || "Player";
    const difficulty = difficultySelect.value;
    const category = wordCategorySelect.value;
    
    localStorage.setItem('keyRacePlayerName', name);
    localStorage.setItem('keyRaceDifficulty', difficulty);
    localStorage.setItem('keyRaceCategory', category);
    
    currentPlayerName = name;
    currentDifficulty = difficulty;
    currentCategory = category;
    
    showSaveMessage("Settings saved successfully!", "success");
    updateUI();
}

function showSaveMessage(message, type) {
  saveMessage.textContent = message;
  saveMessage.className = `save-message ${type}`;
  
  setTimeout(() => {
    saveMessage.textContent = "";
    saveMessage.className = "save-message";
  }, 3000);
}

// Setup all event listeners
function setupEventListeners() {
  settingsBtn.addEventListener('click', toggleSettings);
  saveSettingsBtn.addEventListener('click', saveSettings);
  startSinglePlayerBtn.addEventListener('click', startSinglePlayerGame);
  showHowToPlayBtn.addEventListener('click', showHowToPlay);
  backToMenuBtn.addEventListener('click', goToMainMenu);
  pauseBtn.addEventListener('click', togglePause);
  restartBtn.addEventListener('click', restartGame);
  playAgainBtn.addEventListener('click', playAgain);
  goToMenuBtn.addEventListener('click', goToMainMenu);
  shareResultsBtn.addEventListener('click', shareResults);
  backFromGuideBtn.addEventListener('click', goToMainMenu);
  startFromGuideBtn.addEventListener('click', startSinglePlayerGame);
  
  textInput.addEventListener('input', handleTextInput);
  textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && textInput.value.trim()) {
      checkWord();
    }
  });
  
  document.addEventListener('click', (e) => {
    if (!settingsPanel.contains(e.target) && !settingsBtn.contains(e.target) && !settingsPanel.classList.contains('hide')) {
      settingsPanel.classList.add('hide');
    }
  });
}

function toggleSettings() {
  settingsPanel.classList.toggle('hide');
}

function updateUI() {
  currentPlayerNameDisplay.textContent = currentPlayerName;
  currentDifficultyDisplay.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
  highScoreDisplay.textContent = highScore;
  
  gameDifficultyBadge.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
  gameDifficultyBadge.className = `difficulty-badge ${currentDifficulty}`;
  
  const categoryDisplay = document.getElementById('currentCategoryName');
  if (categoryDisplay) {
      const categoryNames = {
          'general': '🌐 General',
          'coding': '💻 Coding',
          'football': '⚽ Football',
          'movies': '🎬 Movies',
          'animals': '🐾 Animals',
          'geography': '🌎 Geography',
          'science': '🔬 Science',
          'food': '🍕 Food'
      };
      categoryDisplay.textContent = categoryNames[currentCategory] || 'General';
  }
}

function startSinglePlayerGame() {
  hideAllScreens();
  singlePlayerScreen.classList.remove('hide');
  initializeGame();
}

function showHowToPlay() {
  hideAllScreens();
  howToPlayScreen.classList.remove('hide');
}

function goToMainMenu() {
  hideAllScreens();
  mainMenu.classList.remove('hide');
  stopGame();
}

function hideAllScreens() {
  mainMenu.classList.add('hide');
  singlePlayerScreen.classList.add('hide');
  gameOverScreen.classList.add('hide');
  howToPlayScreen.classList.add('hide');
}

function initializeGame() {
  gameActive = true;
  gamePaused = false;
  currentScore = 0;
  wordsTyped = 0;
  correctWords = 0;
  currentStreak = 0;
  bestStreak = 0;
  gameStartTime = Date.now();
  lastWordTime = gameStartTime;
  wordTimes = [];
  comboMultiplier = 1;
  powerUpActive = null;
  
  switch(currentDifficulty) {
    case 'easy':
      timeLeft = 30;
      break;
    case 'medium':
      timeLeft = 20;
      break;
    case 'hard':
      timeLeft = 15;
      break;
  }
  
  gamePlayerName.textContent = currentPlayerName;
  updateGameStats();
  generateNewWord();
  
  textInput.value = '';
  textInput.disabled = false;
  textInput.focus();
  
  startGameTimer();
  
  pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
  pauseBtn.classList.remove('resume-btn');
}

function startGameTimer() {
  if (gameTimer) {
    clearInterval(gameTimer);
  }
  
  gameTimer = setInterval(() => {
    if (!gamePaused && gameActive) {
      timeLeft--;
      updateGameStats();
      
      if (timeLeft <= 0) {
        endGame();
      }
    }
  }, 1000);
}

function updateGameStats() {
  timeLeftDisplay.textContent = `${Math.ceil(timeLeft)}s`;
  currentScoreDisplay.textContent = currentScore;
  
  updateTimerWarning();
  
  const accuracy = wordsTyped > 0 ? Math.round((correctWords / wordsTyped) * 100) : 100;
  currentAccuracyDisplay.textContent = `${accuracy}%`;
  
  const timeElapsed = (Date.now() - gameStartTime) / 1000 / 60;
  const wpm = timeElapsed > 0 ? Math.round((wordsTyped / 5) / timeElapsed) : 0;
  wpmDisplay.textContent = wpm;
  
  wordsTypedCount.textContent = wordsTyped;
  correctWordsCount.textContent = correctWords;
  currentStreakDisplay.textContent = currentStreak;
}

function generateNewWord() {
    if (!wordBanks[currentCategory] || wordBanks[currentCategory].length === 0) {
        console.error('No words available for category:', currentCategory);
        currentWord = "loading...";
        currentWordDisplay.textContent = currentWord;
        return;
    }
    
    currentWord = wordBanks[currentCategory][Math.floor(Math.random() * wordBanks[currentCategory].length)];
    currentWordDisplay.textContent = currentWord;
    
    wordProgress.style.width = '0%';
    textInput.value = '';
}

function handleTextInput(e) {
  if (!gameActive || gamePaused) return;
  
  const input = e.target.value;
  const progress = (input.length / currentWord.length) * 100;
  wordProgress.style.width = `${Math.min(progress, 100)}%`;
  
  if (input.trim() === currentWord) {
    checkWord();
  }
}

// ===== NEW FEATURE FUNCTIONS =====

function showFloatingScore(points, x, y) {
    const popup = document.createElement('div');
    popup.className = 'floating-score';
    popup.textContent = `+${points}`;
    popup.style.left = (x || window.innerWidth / 2) + 'px';
    popup.style.top = (y || window.innerHeight / 2) + 'px';
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 800);
}

function showStreakIndicator(streak) {
    const indicator = document.createElement('div');
    indicator.className = 'streak-indicator';
    indicator.innerHTML = `🔥 ${streak} STREAK! 🔥`;
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 600);
}

function showComboBanner(multiplier) {
    const banner = document.createElement('div');
    banner.className = 'combo-banner';
    banner.innerHTML = `✨ COMBO x${multiplier}! ✨`;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 800);
}

function activatePowerUp(type) {
    powerUpActive = type;
    const wordDisplay = document.getElementById('currentWord');
    
    switch(type) {
        case 'double':
            wordDisplay.style.textShadow = '0 0 20px gold';
            showComboBanner(2);
            setTimeout(() => {
                if (powerUpActive === 'double') {
                    wordDisplay.style.textShadow = '';
                    powerUpActive = null;
                }
            }, 10000);
            break;
        case 'freeze':
            if (gameTimer) {
                clearInterval(gameTimer);
                gameTimer = null;
            }
            wordDisplay.style.color = '#00ffff';
            showComboBanner('❄️ TIME FREEZE! ❄️');
            setTimeout(() => {
                if (!gameActive) return;
                startGameTimer();
                wordDisplay.style.color = '';
                powerUpActive = null;
            }, 5000);
            break;
        case 'slow':
            if (gameTimer) {
                clearInterval(gameTimer);
                gameTimer = setInterval(() => {
                    if (!gamePaused && gameActive) {
                        timeLeft -= 0.5;
                        updateGameStats();
                        if (timeLeft <= 0) endGame();
                    }
                }, 1000);
            }
            wordDisplay.style.color = '#9b59b6';
            showComboBanner('🐢 SLOW TIME! 🐢');
            setTimeout(() => {
                if (!gameActive) return;
                clearInterval(gameTimer);
                startGameTimer();
                wordDisplay.style.color = '';
                powerUpActive = null;
            }, 8000);
            break;
    }
}

function updateStreakVisual() {
    const streakElement = document.getElementById('currentStreak');
    if (currentStreak >= 5) {
        streakElement.classList.add('streak-high');
    } else {
        streakElement.classList.remove('streak-high');
    }
    
    if (currentStreak === 5 || currentStreak === 10 || currentStreak === 15) {
        showStreakIndicator(currentStreak);
    }
}

function updateTimerWarning() {
    const timerElement = document.getElementById('timeLeft');
    if (timeLeft <= 5) {
        timerElement.classList.add('timer-warning');
    } else {
        timerElement.classList.remove('timer-warning');
    }
}

function shakeWordDisplay() {
    const wordElement = document.getElementById('currentWord');
    wordElement.classList.add('shake-word');
    setTimeout(() => wordElement.classList.remove('shake-word'), 300);
}

function flashCorrectWord() {
    const wordElement = document.getElementById('currentWord');
    wordElement.classList.add('correct-flash');
    setTimeout(() => wordElement.classList.remove('correct-flash'), 300);
}

// Updated checkWord function
function checkWord() {
    if (!gameActive || gamePaused) return;
    
    const input = textInput.value.trim();
    const wordDisplay = document.getElementById('currentWord');
    wordsTyped++;
    
    const now = Date.now();
    if (lastWordTime > 0) {
        const timeTaken = (now - lastWordTime) / 1000;
        wordTimes.push(timeTaken);
    }
    lastWordTime = now;
    
    if (input === currentWord) {
        correctWords++;
        currentStreak++;
        
        if (currentStreak > bestStreak) {
            bestStreak = currentStreak;
        }
        
        let points = 10;
        if (currentDifficulty === 'hard') points = 15;
        if (currentDifficulty === 'easy') points = 8;
        
        let actualPoints = points;
        if (powerUpActive === 'double') {
            actualPoints = points * 2;
            showFloatingScore(actualPoints);
        } else {
            showFloatingScore(points);
        }
        
        currentScore += actualPoints;
        
        let timeBonus = 0;
        if (currentDifficulty === 'easy') timeBonus = 5;
        else if (currentDifficulty === 'medium') timeBonus = 3;
        else timeBonus = 2;
        
        timeLeft += timeBonus;
        
        if (!powerUpActive && Math.random() < 0.15) {
            const powerUps = ['double', 'freeze', 'slow'];
            const randomPower = powerUps[Math.floor(Math.random() * powerUps.length)];
            activatePowerUp(randomPower);
        }
        
        flashCorrectWord();
        
    } else {
        currentStreak = 0;
        comboMultiplier = 1;
        shakeWordDisplay();
        
        wordDisplay.style.color = '#e74c3c';
        setTimeout(() => {
            wordDisplay.style.color = 'white';
        }, 300);
    }
    
    updateStreakVisual();
    updateGameStats();
    generateNewWord();
}

function togglePause() {
  if (!gameActive) return;
  
  gamePaused = !gamePaused;
  
  if (gamePaused) {
    pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
    pauseBtn.classList.add('resume-btn');
    textInput.disabled = true;
  } else {
    pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    pauseBtn.classList.remove('resume-btn');
    textInput.disabled = false;
    textInput.focus();
  }
}

function restartGame() {
  if (confirm("Are you sure you want to restart? Your current progress will be lost.")) {
    initializeGame();
  }
}

function endGame() {
  gameActive = false;
  clearInterval(gameTimer);
  
  const totalTime = (Date.now() - gameStartTime) / 1000;
  const minutes = totalTime / 60;
  const wpm = minutes > 0 ? Math.round((wordsTyped / 5) / minutes) : 0;
  const accuracy = wordsTyped > 0 ? Math.round((correctWords / wordsTyped) * 100) : 100;
  
  let avgWordTime = 0;
  if (wordTimes.length > 0) {
      avgWordTime = wordTimes.reduce((a, b) => a + b, 0) / wordTimes.length;
  }
  
  if (currentScore > highScore) {
    highScore = currentScore;
    localStorage.setItem('keyRaceHighScore', highScore);
  }
  
  finalScoreDisplay.textContent = currentScore;
  finalWordsTyped.textContent = `${correctWords}/${wordsTyped}`;
  finalAccuracyDisplay.textContent = `${accuracy}%`;
  finalWPMDisplay.textContent = wpm;
  finalBestStreak.textContent = bestStreak;
  finalHighScore.textContent = highScore;
  
  let message = "";
  if (accuracy === 100 && wordsTyped > 5) {
    message = "Perfect accuracy! You're a typing master! 🌟";
  } else if (currentStreak >= 10) {
    message = `Incredible ${currentStreak}-word streak! You're on fire! 🔥`;
  } else if (wpm > 50) {
    message = `Lightning fast at ${wpm} WPM! Amazing speed! ⚡`;
  } else if (avgWordTime < 2) {
    message = `You average ${avgWordTime.toFixed(1)} seconds per word! Fast! 🚀`;
  } else if (currentScore > highScore * 0.8) {
    message = "Great score! You're getting better! 🚀";
  } else {
    message = "Good job! Practice makes perfect! 💪";
  }
  resultsMessage.innerHTML = `<i class="fas fa-star"></i> ${message}`;
  
  hideAllScreens();
  gameOverScreen.classList.remove('hide');
}

function playAgain() {
  startSinglePlayerGame();
}

function stopGame() {
  gameActive = false;
  clearInterval(gameTimer);
}

function shareResults() {
  const accuracy = wordsTyped > 0 ? Math.round((correctWords / wordsTyped) * 100) : 100;
  const shareText = `I scored ${currentScore} points in Key Race with ${accuracy}% accuracy! Can you beat my score? 🎮`;
  
  if (navigator.share) {
    navigator.share({
      title: 'My Key Race Score',
      text: shareText,
      url: window.location.href
    }).catch(console.error);
  } else {
    navigator.clipboard.writeText(shareText)
      .then(() => alert('Results copied to clipboard! Share it with your friends.'))
      .catch(() => prompt('Copy your results:', shareText));
  }
}

document.addEventListener('DOMContentLoaded', initGame);
settingsPanel.classList.add('hide');

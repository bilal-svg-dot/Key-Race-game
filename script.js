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
// Add this near other game state variables
let currentCategory = "general";
let wordBanks = {}; // Will be imported

// Add this to DOM Elements section
const wordCategorySelect = document.getElementById('wordCategory');

// DOM Elements
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings');
const playerNameInput = document.getElementById('playerName');
const difficultySelect = document.getElementById('difficulty');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const saveMessage = document.getElementById('saveMessage');

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
// Update the initGame function to load word banks
async function initGame() {
    loadSettings();
    await loadWordBanks();  // Add this line
    setupEventListeners();
    updateUI();
}

// Add this function to load word banks
async function loadWordBanks() {
    try {
        // Import the word banks module
        const wordsModule = await import('./words.js');
        wordBanks = wordsModule.wordBanks;
        console.log('Word banks loaded successfully');
    } catch (error) {
        console.error('Error loading word banks:', error);
        // Fallback to original words
        wordBanks = {
            general: words  // Use your original words array as fallback
        };
    }
}

// Update loadSettings function
// REPLACE your existing loadSettings() function with this:
function loadSettings() {
    const savedName = localStorage.getItem('keyRacePlayerName');
    const savedDifficulty = localStorage.getItem('keyRaceDifficulty');
    const savedHighScore = localStorage.getItem('keyRaceHighScore');
    const savedCategory = localStorage.getItem('keyRaceCategory');  // Add this line
    
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
    
    if (savedCategory) {  // Add this section
        currentCategory = savedCategory;
        wordCategorySelect.value = savedCategory;
    }
}

// Update saveSettings function
// REPLACE your existing saveSettings() function with this:
function saveSettings() {
    const name = playerNameInput.value.trim() || "Player";
    const difficulty = difficultySelect.value;
    const category = wordCategorySelect.value;  // Add this line
    
    localStorage.setItem('keyRacePlayerName', name);
    localStorage.setItem('keyRaceDifficulty', difficulty);
    localStorage.setItem('keyRaceCategory', category);  // Add this line
    
    currentPlayerName = name;
    currentDifficulty = difficulty;
    currentCategory = category;  // Add this line
    
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
  // Settings button
  settingsBtn.addEventListener('click', toggleSettings);
  
  // Save settings button
  saveSettingsBtn.addEventListener('click', saveSettings);
  
  // Menu buttons
  startSinglePlayerBtn.addEventListener('click', startSinglePlayerGame);
  showHowToPlayBtn.addEventListener('click', showHowToPlay);
  
  // Game buttons
  backToMenuBtn.addEventListener('click', goToMainMenu);
  pauseBtn.addEventListener('click', togglePause);
  restartBtn.addEventListener('click', restartGame);
  playAgainBtn.addEventListener('click', playAgain);
  goToMenuBtn.addEventListener('click', goToMainMenu);
  shareResultsBtn.addEventListener('click', shareResults);
  backFromGuideBtn.addEventListener('click', goToMainMenu);
  startFromGuideBtn.addEventListener('click', startSinglePlayerGame);
  
  // Text input handling
  textInput.addEventListener('input', handleTextInput);
  textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && textInput.value.trim()) {
      checkWord();
    }
  });
  
  // Close settings when clicking outside
  document.addEventListener('click', (e) => {
    if (!settingsPanel.contains(e.target) && !settingsBtn.contains(e.target) && !settingsPanel.classList.contains('hide')) {
      settingsPanel.classList.add('hide');
    }
  });
}

// Toggle settings panel
function toggleSettings() {
  settingsPanel.classList.toggle('hide');
}

// Update UI elements
// Update UI elements
function updateUI() {
  currentPlayerNameDisplay.textContent = currentPlayerName;
  currentDifficultyDisplay.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
  highScoreDisplay.textContent = highScore;
  
  // Update difficulty badge
  gameDifficultyBadge.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
  gameDifficultyBadge.className = `difficulty-badge ${currentDifficulty}`;
  
  // 🟢 ADD THIS NEW SECTION FOR CATEGORY DISPLAY:
  // Update category display if element exists (optional)
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
// Navigation functions
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

// Game logic
function initializeGame() {
  // Reset game state
  gameActive = true;
  gamePaused = false;
  currentScore = 0;
  wordsTyped = 0;
  correctWords = 0;
  currentStreak = 0;
  bestStreak = 0;
  gameStartTime = Date.now();
  lastWordTime = gameStartTime;
  
  // Set initial time based on difficulty
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
  
  // Update UI
  gamePlayerName.textContent = currentPlayerName;
  updateGameStats();
  generateNewWord();
  
  // Focus on input
  textInput.value = '';
  textInput.disabled = false;
  textInput.focus();
  
  // Start game timer
  startGameTimer();
  
  // Update pause button
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
  // Update basic stats
  timeLeftDisplay.textContent = `${timeLeft}s`;
  currentScoreDisplay.textContent = currentScore;
  
  // Calculate and update accuracy
  const accuracy = wordsTyped > 0 ? Math.round((correctWords / wordsTyped) * 100) : 100;
  currentAccuracyDisplay.textContent = `${accuracy}%`;
  
  // Calculate and update WPM
  const timeElapsed = (Date.now() - gameStartTime) / 1000 / 60; // minutes
  const wpm = timeElapsed > 0 ? Math.round((wordsTyped / 5) / timeElapsed) : 0;
  wpmDisplay.textContent = wpm;
  
  // Update other stats
  wordsTypedCount.textContent = wordsTyped;
  correctWordsCount.textContent = correctWords;
  currentStreakDisplay.textContent = currentStreak;
}

// REPLACE your existing generateNewWord() function with this:
function generateNewWord() {
    if (!wordBanks[currentCategory] || wordBanks[currentCategory].length === 0) {
        console.error('No words available for category:', currentCategory);
        currentWord = "loading...";
        currentWordDisplay.textContent = currentWord;
        return;
    }
    
    currentWord = wordBanks[currentCategory][Math.floor(Math.random() * wordBanks[currentCategory].length)];
    currentWordDisplay.textContent = currentWord;
    
    // Reset progress bar
    wordProgress.style.width = '0%';
    textInput.value = '';
}

function handleTextInput(e) {
  if (!gameActive || gamePaused) return;
  
  const input = e.target.value;
  const progress = (input.length / currentWord.length) * 100;
  wordProgress.style.width = `${Math.min(progress, 100)}%`;
  
  // Auto-check when word is complete
  if (input.trim() === currentWord) {
    checkWord();
  }
}

function checkWord() {
  if (!gameActive || gamePaused) return;
  
  const input = textInput.value.trim();
  wordsTyped++;
  
  if (input === currentWord) {
    // Correct word
    correctWords++;
    currentStreak++;
    
    // Update best streak
    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }
    
    // Add score based on difficulty
    let points = 10;
    if (currentDifficulty === 'hard') points = 15;
    if (currentDifficulty === 'easy') points = 8;
    
    currentScore += points;
    
    // Add time based on difficulty
    if (currentDifficulty === 'easy') {
      timeLeft += 5;
    } else if (currentDifficulty === 'medium') {
      timeLeft += 3;
    } else {
      timeLeft += 2;
    }
    
    // Visual feedback
    currentWordDisplay.style.color = '#2ecc71';
    setTimeout(() => {
      currentWordDisplay.style.color = 'white';
    }, 300);
    
  } else {
    // Incorrect word
    currentStreak = 0;
    
    // Visual feedback
    currentWordDisplay.style.color = '#e74c3c';
    setTimeout(() => {
      currentWordDisplay.style.color = 'white';
    }, 300);
  }
  
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
  
  // Calculate final stats
  const totalTime = (Date.now() - gameStartTime) / 1000;
  const minutes = totalTime / 60;
  const wpm = minutes > 0 ? Math.round((wordsTyped / 5) / minutes) : 0;
  const accuracy = wordsTyped > 0 ? Math.round((correctWords / wordsTyped) * 100) : 100;
  
  // Update high score
  if (currentScore > highScore) {
    highScore = currentScore;
    localStorage.setItem('keyRaceHighScore', highScore);
  }
  
  // Update results screen
  finalScoreDisplay.textContent = currentScore;
  finalWordsTyped.textContent = `${correctWords}/${wordsTyped}`;
  finalAccuracyDisplay.textContent = `${accuracy}%`;
  finalWPMDisplay.textContent = wpm;
  finalBestStreak.textContent = bestStreak;
  finalHighScore.textContent = highScore;
  
  // Set results message
  let message = "";
  if (accuracy === 100 && wordsTyped > 5) {
    message = "Perfect accuracy! You're a typing master! 🌟";
  } else if (currentScore > highScore * 0.8) {
    message = "Great score! You're getting better! 🚀";
  } else if (wpm > 40) {
    message = "Excellent speed! Keep up the good work! ⚡";
  } else {
    message = "Good job! Practice makes perfect! 💪";
  }
  resultsMessage.innerHTML = `<i class="fas fa-star"></i> ${message}`;
  
  // Show game over screen
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

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initGame);

// Make sure the settings panel starts hidden
settingsPanel.classList.add('hide');
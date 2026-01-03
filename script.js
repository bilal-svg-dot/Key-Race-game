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

// Multiplayer State Variables
let multiplayerActive = false;
let isHost = false;
let roomCode = '';
let players = [];
let readyPlayers = new Set();
let gameStarted = false;
let multiGameTimer = null;
let multiTimeLeft = 60;
let multiScore = 0;
let multiWordsTyped = 0;
let multiCorrectWords = 0;
let multiCurrentWord = "";
let multiGameActive = false;

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
const multiplayerScreen = document.getElementById('multiplayerScreen');

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

// Multiplayer Elements
const startMultiplayerBtn = document.getElementById('startMultiplayer');
const backToMenuFromMulti = document.getElementById('backToMenuFromMulti');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomCodeInput = document.getElementById('roomCodeInput');
const roomList = document.getElementById('roomList');
const roomStatus = document.getElementById('roomStatus');
const roomSection = document.getElementById('roomSection');
const lobbySection = document.getElementById('lobbySection');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const copyRoomCodeBtn = document.getElementById('copyRoomCode');
const startMultiGameBtn = document.getElementById('startMultiGameBtn');
const leaveRoomBtn = document.getElementById('leaveRoomBtn');
const playersContainer = document.getElementById('playersContainer');
const playerCount = document.getElementById('playerCount');
const toggleReadyBtn = document.getElementById('toggleReadyBtn');
const readyCount = document.getElementById('readyCount');
const totalPlayers = document.getElementById('totalPlayers');
const multiGameSection = document.getElementById('multiGameSection');
const multiResultsSection = document.getElementById('multiResultsSection');
const multiTextInput = document.getElementById('multiTextInput');
const multiCurrentWordDisplay = document.getElementById('multiCurrentWord');
const multiWordProgress = document.getElementById('multiWordProgress');
const multiTimeLeftDisplay = document.getElementById('multiTimeLeft');
const multiScoreDisplay = document.getElementById('multiCurrentScore');
const multiAccuracyDisplay = document.getElementById('multiAccuracy');
const scoreboardContainer = document.getElementById('scoreboardContainer');
const winnerDisplay = document.getElementById('winnerDisplay');
const finalLeaderboard = document.getElementById('finalLeaderboard');
const multiPlayAgainBtn = document.getElementById('multiPlayAgainBtn');
const multiGoToMenuBtn = document.getElementById('multiGoToMenuBtn');
const shareMultiResultsBtn = document.getElementById('shareMultiResultsBtn');

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
function initGame() {
  loadSettings();
  setupEventListeners();
  updateUI();
}

// Load settings from localStorage
function loadSettings() {
  const savedName = localStorage.getItem('keyRacePlayerName');
  const savedDifficulty = localStorage.getItem('keyRaceDifficulty');
  const savedHighScore = localStorage.getItem('keyRaceHighScore');
  
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
}

// Save settings to localStorage
function saveSettings() {
  const name = playerNameInput.value.trim() || "Player";
  const difficulty = difficultySelect.value;
  
  localStorage.setItem('keyRacePlayerName', name);
  localStorage.setItem('keyRaceDifficulty', difficulty);
  
  currentPlayerName = name;
  currentDifficulty = difficulty;
  
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
  startMultiplayerBtn.addEventListener('click', startMultiplayer);
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
  
  // Multiplayer buttons
  backToMenuFromMulti.addEventListener('click', goToMainMenu);
  createRoomBtn.addEventListener('click', createRoom);
  joinRoomBtn.addEventListener('click', () => joinRoom());
  copyRoomCodeBtn.addEventListener('click', copyRoomCode);
  startMultiGameBtn.addEventListener('click', startMultiplayerGame);
  leaveRoomBtn.addEventListener('click', leaveRoom);
  toggleReadyBtn.addEventListener('click', toggleReady);
  multiPlayAgainBtn.addEventListener('click', multiPlayAgain);
  multiGoToMenuBtn.addEventListener('click', goToMainMenu);
  shareMultiResultsBtn.addEventListener('click', shareMultiResults);
  
  // Text input handling
  textInput.addEventListener('input', handleTextInput);
  textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && textInput.value.trim()) {
      checkWord();
    }
  });
  
  // Multiplayer text input handling
  multiTextInput.addEventListener('input', handleMultiTextInput);
  multiTextInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && multiTextInput.value.trim()) {
      checkMultiWord();
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
function updateUI() {
  currentPlayerNameDisplay.textContent = currentPlayerName;
  currentDifficultyDisplay.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
  highScoreDisplay.textContent = highScore;
  
  // Update difficulty badge
  gameDifficultyBadge.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
  gameDifficultyBadge.className = `difficulty-badge ${currentDifficulty}`;
}

// Navigation functions
function startSinglePlayerGame() {
  hideAllScreens();
  singlePlayerScreen.classList.remove('hide');
  initializeGame();
}

function startMultiplayer() {
  hideAllScreens();
  multiplayerScreen.classList.remove('hide');
  
  // Reset multiplayer state
  multiplayerActive = true;
  isHost = false;
  roomCode = '';
  players = [];
  readyPlayers.clear();
  gameStarted = false;
  
  // Show lobby
  showLobby();
  updateRoomList();
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
  multiplayerScreen.classList.add('hide');
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

function generateNewWord() {
  currentWord = words[Math.floor(Math.random() * words.length)];
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

// Multiplayer functions
function showLobby() {
  lobbySection.classList.remove('hide');
  roomSection.classList.add('hide');
  multiGameSection.classList.add('hide');
  multiResultsSection.classList.add('hide');
}

function updateRoomList() {
  roomList.innerHTML = '';
  
  // Simulate some example rooms
  const exampleRooms = [
    { id: 'ABC123', name: 'Fast Typers Only', players: 2, maxPlayers: 4 },
    { id: 'DEF456', name: 'Casual Game', players: 1, maxPlayers: 4 },
    { id: 'GHI789', name: 'Pro Challenge', players: 3, maxPlayers: 4 }
  ];
  
  if (exampleRooms.length === 0) {
    roomList.innerHTML = `
      <div class="room-item empty">
        <i class="fas fa-search"></i>
        <p>No active rooms found. Create one!</p>
      </div>
    `;
    return;
  }
  
  exampleRooms.forEach(room => {
    const roomItem = document.createElement('div');
    roomItem.className = 'room-item';
    roomItem.innerHTML = `
      <div class="room-info-left">
        <h4>${room.name}</h4>
        <p>Code: ${room.id} • ${room.players}/${room.maxPlayers} players</p>
      </div>
      <div class="room-actions">
        <button class="btn join-room-btn" data-room="${room.id}">
          <i class="fas fa-sign-in-alt"></i> Join
        </button>
      </div>
    `;
    roomList.appendChild(roomItem);
  });
  
  // Add event listeners to join buttons
  document.querySelectorAll('.join-room-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const roomId = e.target.closest('button').dataset.room;
      joinRoom(roomId);
    });
  });
}

function createRoom() {
  // Generate random room code
  roomCode = generateRoomCode();
  isHost = true;
  
  // Add yourself as first player
  players = [{
    id: 'player-' + Date.now(),
    name: currentPlayerName,
    score: 0,
    wpm: 0,
    accuracy: 100,
    wordsTyped: 0,
    correctWords: 0,
    isReady: true,
    isHost: true
  }];
  
  readyPlayers.add(players[0].id);
  
  // Show room section
  lobbySection.classList.add('hide');
  roomSection.classList.remove('hide');
  
  // Update room display
  roomCodeDisplay.textContent = roomCode;
  updatePlayersList();
  
  // Update room status
  showRoomStatus(`Room created! Share code: ${roomCode}`, 'success');
  
  // Simulate other players joining (for demo)
  setTimeout(() => simulatePlayerJoin('TypingPro'), 2000);
  setTimeout(() => simulatePlayerJoin('SpeedMaster'), 4000);
}

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function joinRoom(providedCode = null) {
  const code = providedCode || roomCodeInput.value.trim().toUpperCase();
  
  if (!code || code.length !== 6) {
    showRoomStatus('Please enter a valid 6-character room code', 'error');
    return;
  }
  
  // For demo purposes, we'll accept any 6-character code
  roomCode = code;
  isHost = false;
  
  // Add yourself as player
  players = [{
    id: 'player-' + Date.now(),
    name: currentPlayerName,
    score: 0,
    wpm: 0,
    accuracy: 100,
    wordsTyped: 0,
    correctWords: 0,
    isReady: false,
    isHost: false
  }];
  
  // Show room section
  lobbySection.classList.add('hide');
  roomSection.classList.remove('hide');
  
  // Update room display
  roomCodeDisplay.textContent = roomCode;
  updatePlayersList();
  
  showRoomStatus(`Joined room ${roomCode}`, 'success');
  
  // Simulate other players already in room (for demo)
  setTimeout(() => {
    players.push({
      id: 'bot-1',
      name: 'RoomHost',
      score: 0,
      wpm: 0,
      accuracy: 100,
      wordsTyped: 0,
      correctWords: 0,
      isReady: true,
      isHost: true
    }, {
      id: 'bot-2',
      name: 'FastTyper',
      score: 0,
      wpm: 0,
      accuracy: 100,
      wordsTyped: 0,
      correctWords: 0,
      isReady: true,
      isHost: false
    });
    updatePlayersList();
  }, 1000);
}

function showRoomStatus(message, type = 'info') {
  roomStatus.textContent = message;
  roomStatus.className = `room-status ${type}`;
  
  setTimeout(() => {
    roomStatus.textContent = '';
    roomStatus.className = 'room-status';
  }, 3000);
}

function updatePlayersList() {
  playersContainer.innerHTML = '';
  playerCount.textContent = players.length;
  totalPlayers.textContent = players.length;
  
  players.forEach(player => {
    const playerItem = document.createElement('div');
    playerItem.className = `player-item ${player.isHost ? 'host' : ''}`;
    playerItem.innerHTML = `
      ${player.isHost ? '<i class="fas fa-crown"></i>' : '<i class="fas fa-user"></i>'}
      <span class="player-name">${player.name} ${player.id.includes('player') ? '(You)' : ''}</span>
      <span class="player-status ${player.isReady ? 'ready' : 'not-ready'}">
        ${player.isReady ? 'Ready' : 'Not Ready'}
      </span>
    `;
    playersContainer.appendChild(playerItem);
  });
  
  // Update ready count
  const readyCountValue = players.filter(p => p.isReady).length;
  readyCount.textContent = readyCountValue;
  
  // Update ready button
  const currentPlayer = players.find(p => p.id.includes('player'));
  if (currentPlayer) {
    toggleReadyBtn.innerHTML = currentPlayer.isReady ? 
      '<i class="fas fa-times-circle"></i> Not Ready' : 
      '<i class="fas fa-check-circle"></i> Ready';
    toggleReadyBtn.classList.toggle('not-ready', !currentPlayer.isReady);
  }
  
  // Enable/disable start button for host
  if (isHost) {
    startMultiGameBtn.disabled = readyCountValue < 2;
  }
}

function toggleReady() {
  const currentPlayer = players.find(p => p.id.includes('player'));
  if (!currentPlayer) return;
  
  currentPlayer.isReady = !currentPlayer.isReady;
  
  if (currentPlayer.isReady) {
    readyPlayers.add(currentPlayer.id);
  } else {
    readyPlayers.delete(currentPlayer.id);
  }
  
  updatePlayersList();
}

function copyRoomCode() {
  navigator.clipboard.writeText(roomCode)
    .then(() => {
      const originalText = copyRoomCodeBtn.innerHTML;
      copyRoomCodeBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => {
        copyRoomCodeBtn.innerHTML = originalText;
      }, 2000);
    })
    .catch(err => {
      console.error('Failed to copy:', err);
      showRoomStatus('Failed to copy code', 'error');
    });
}

function startMultiplayerGame() {
  if (!isHost) return;
  
  gameStarted = true;
  roomSection.classList.add('hide');
  multiGameSection.classList.remove('hide');
  
  // Reset game state
  multiGameActive = true;
  multiTimeLeft = 60;
  multiScore = 0;
  multiWordsTyped = 0;
  multiCorrectWords = 0;
  
  // Reset all player scores
  players.forEach(player => {
    player.score = 0;
    player.wpm = 0;
    player.accuracy = 100;
    player.wordsTyped = 0;
    player.correctWords = 0;
  });
  
  // Generate first word
  generateMultiWord();
  
  // Focus input
  multiTextInput.value = '';
  multiTextInput.disabled = false;
  multiTextInput.focus();
  
  // Start timer
  startMultiTimer();
  
  // Update scoreboard
  updateScoreboard();
}

function startMultiTimer() {
  if (multiGameTimer) {
    clearInterval(multiGameTimer);
  }
  
  multiGameTimer = setInterval(() => {
    if (multiGameActive) {
      multiTimeLeft--;
      multiTimeLeftDisplay.textContent = `${multiTimeLeft}s`;
      updateScoreboard();
      
      if (multiTimeLeft <= 0) {
        endMultiplayerGame();
      }
    }
  }, 1000);
}

function generateMultiWord() {
  multiCurrentWord = words[Math.floor(Math.random() * words.length)];
  multiCurrentWordDisplay.textContent = multiCurrentWord;
  multiWordProgress.style.width = '0%';
  multiTextInput.value = '';
}

function handleMultiTextInput(e) {
  if (!multiGameActive) return;
  
  const input = e.target.value;
  const progress = (input.length / multiCurrentWord.length) * 100;
  multiWordProgress.style.width = `${Math.min(progress, 100)}%`;
  
  // Auto-check when word is complete
  if (input.trim() === multiCurrentWord) {
    checkMultiWord();
  }
}

function checkMultiWord() {
  if (!multiGameActive) return;
  
  const input = multiTextInput.value.trim();
  multiWordsTyped++;
  
  const currentPlayer = players.find(p => p.id.includes('player'));
  if (!currentPlayer) return;
  
  currentPlayer.wordsTyped++;
  
  if (input === multiCurrentWord) {
    // Correct word
    multiCorrectWords++;
    currentPlayer.correctWords++;
    
    // Add score
    const points = 10;
    multiScore += points;
    currentPlayer.score += points;
    
    // Add time
    multiTimeLeft += 2;
    
    // Visual feedback
    multiCurrentWordDisplay.style.color = '#2ecc71';
    setTimeout(() => {
      multiCurrentWordDisplay.style.color = 'white';
    }, 300);
  } else {
    // Incorrect word
    multiCurrentWordDisplay.style.color = '#e74c3c';
    setTimeout(() => {
      multiCurrentWordDisplay.style.color = 'white';
    }, 300);
  }
  
  // Update player stats
  const accuracy = currentPlayer.wordsTyped > 0 ? 
    Math.round((currentPlayer.correctWords / currentPlayer.wordsTyped) * 100) : 100;
  currentPlayer.accuracy = accuracy;
  
  // Calculate WPM
  const timeElapsed = (60 - multiTimeLeft) / 60;
  currentPlayer.wpm = timeElapsed > 0 ? Math.round((currentPlayer.wordsTyped / 5) / timeElapsed) : 0;
  
  // Update UI
  multiScoreDisplay.textContent = currentPlayer.score;
  multiAccuracyDisplay.textContent = `${accuracy}%`;
  
  // Update other players' scores (simulated)
  updateOtherPlayers();
  
  // Update scoreboard
  updateScoreboard();
  
  // Generate new word
  generateMultiWord();
}

function updateOtherPlayers() {
  // Simulate other players typing
  players.forEach(player => {
    if (!player.id.includes('player')) {
      // This is a bot player
      if (Math.random() > 0.3) { // 70% chance to type correctly
        player.score += 10;
        player.correctWords++;
      }
      player.wordsTyped++;
      player.accuracy = Math.round((player.correctWords / player.wordsTyped) * 100);
      
      // Calculate bot WPM
      const timeElapsed = (60 - multiTimeLeft) / 60;
      player.wpm = timeElapsed > 0 ? Math.round((player.wordsTyped / 5) / timeElapsed) : 0;
    }
  });
}

function updateScoreboard() {
  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  scoreboardContainer.innerHTML = '';
  
  sortedPlayers.forEach((player, index) => {
    const scoreboardItem = document.createElement('div');
    scoreboardItem.className = `scoreboard-item ${player.id.includes('player') ? 'you' : ''}`;
    scoreboardItem.innerHTML = `
      <div class="rank">${index + 1}</div>
      <div class="player-info">
        <div class="player-name">
          ${player.name} ${player.isHost ? '👑' : ''} ${player.id.includes('player') ? '(You)' : ''}
        </div>
        <div class="player-wpm">
          WPM: ${player.wpm} • Accuracy: ${player.accuracy}%
        </div>
      </div>
      <div class="score">${player.score}</div>
    `;
    scoreboardContainer.appendChild(scoreboardItem);
  });
}

function endMultiplayerGame() {
  multiGameActive = false;
  clearInterval(multiGameTimer);
  
  // Sort players by score for final results
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  
  // Show results section
  multiGameSection.classList.add('hide');
  multiResultsSection.classList.remove('hide');
  
  // Display winner
  winnerDisplay.innerHTML = `
    <h2><i class="fas fa-trophy"></i> WINNER!</h2>
    <div class="winner-name">${winner.name}</div>
    <div class="winner-score">Score: ${winner.score} points</div>
  `;
  
  // Display final leaderboard
  finalLeaderboard.innerHTML = '<h3>Final Rankings</h3>';
  
  sortedPlayers.forEach((player, index) => {
    const playerResult = document.createElement('div');
    playerResult.className = `player-item ${index === 0 ? 'host' : ''}`;
    playerResult.innerHTML = `
      <div class="rank-badge">${index + 1}</div>
      <i class="fas fa-user"></i>
      <span class="player-name">${player.name} ${player.id.includes('player') ? '(You)' : ''}</span>
      <span class="player-score">${player.score} pts</span>
    `;
    finalLeaderboard.appendChild(playerResult);
  });
}

function multiPlayAgain() {
  if (isHost) {
    // Reset room for new game
    players.forEach(player => {
      player.isReady = false;
      player.score = 0;
      player.wpm = 0;
      player.accuracy = 100;
      player.wordsTyped = 0;
      player.correctWords = 0;
    });
    readyPlayers.clear();
    
    // Show room section
    multiResultsSection.classList.add('hide');
    roomSection.classList.remove('hide');
    updatePlayersList();
  } else {
    // Non-host waits for host to restart
    showRoomStatus('Waiting for host to start new game...', 'info');
    multiResultsSection.classList.add('hide');
    roomSection.classList.remove('hide');
  }
}

function leaveRoom() {
  if (isHost && gameStarted) {
    // Host leaving ends the game for everyone
    if (confirm('You are the host. Leaving will end the game for all players. Are you sure?')) {
      showLobby();
      updateRoomList();
    }
  } else {
    showLobby();
    updateRoomList();
  }
}

function shareMultiResults() {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const currentPlayer = players.find(p => p.id.includes('player'));
  const playerRank = sortedPlayers.findIndex(p => p.id.includes('player')) + 1;
  
  const shareText = `🏆 I ranked #${playerRank} in Key Race multiplayer! ` +
                   `Winner: ${winner.name} with ${winner.score} points. ` +
                   `Can you beat me? 🎮 #KeyRace`;
  
  if (navigator.share) {
    navigator.share({
      title: 'My Key Race Multiplayer Result',
      text: shareText,
      url: window.location.href
    }).catch(console.error);
  } else {
    navigator.clipboard.writeText(shareText)
      .then(() => alert('Results copied to clipboard! Share it with your friends.'))
      .catch(() => prompt('Copy your results:', shareText));
  }
}

// Helper function to simulate players joining
function simulatePlayerJoin(name) {
  players.push({
    id: 'bot-' + Date.now(),
    name: name,
    score: 0,
    wpm: 0,
    accuracy: 100,
    wordsTyped: 0,
    correctWords: 0,
    isReady: Math.random() > 0.5,
    isHost: false
  });
  updatePlayersList();
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initGame);

// Make sure the settings panel starts hidden
settingsPanel.classList.add('hide');

// Utility functions and variables
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // Generate and manage the tetromino sequence and preview
  function generateSequence() {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    while (sequence.length) {
      const rand = getRandomInt(0, sequence.length - 1);
      const name = sequence.splice(rand, 1)[0];
      tetrominoSequence.push(name);
    }
  }
  
  function getNextTetromino() {
    if (tetrominoSequence.length === 0) {
      generateSequence(); // Ensure sequence is filled
    }
  
    const name = tetrominoSequence.pop(); // Get the next tetromino
    const matrix = tetrominos[name];
    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
    const row = name === 'I' ? -1 : -2;
  
    updateNextPreview(); // Update the preview
  
    return { name, matrix, row, col };
  }
  
  function updateNextPreview() {
    const nextContext = nextCanvas.getContext('2d');
    nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    // Ensure that we're using the correct "next" tetromino from the sequence
    if (tetrominoSequence.length === 0) {
      generateSequence(); // Refill sequence if it's empty
    }
    
    const nextTetrominoName = tetrominoSequence[tetrominoSequence.length - 1];
    const nextTetromino = tetrominos[nextTetrominoName];
    const color = colors[nextTetrominoName];
  
    nextContext.fillStyle = color;
    
    // Calculate the offset to center the tetromino
    const offsetX = Math.floor((nextCanvas.width - nextTetromino[0].length * 32) / 2);
    const offsetY = Math.floor((nextCanvas.height - nextTetromino.length * 32) / 2);
  
    for (let row = 0; row < nextTetromino.length; row++) {
      for (let col = 0; col < nextTetromino[row].length; col++) {
        if (nextTetromino[row][col]) {
          nextContext.fillRect(
            offsetX + col * 32, // Apply the horizontal offset
            offsetY + row * 32, // Apply the vertical offset
            32 - 1, // Cell size with a small gap
            32 - 1
          );
        }
      }
    }
  }
  
  
  // Rotations, collisions, and game over handling
  function rotate(matrix) {
    const N = matrix.length - 1;
    return matrix.map((row, i) =>
      row.map((val, j) => matrix[N - j][i])
    );
  }
  
  function isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] && (
            cellCol + col < 0 ||
            cellCol + col >= playfield[0].length ||
            cellRow + row >= playfield.length ||
            playfield[cellRow + row][cellCol + col])
          ) {
          return false;
        }
      }
    }
    return true;
  }
  
  let currentHighScore = 0; // Store current high score

  // This function will be called each time the score is updated
  function checkAndUpdateHighScore() {
      if (score > currentHighScore) {
          currentHighScore = score;
          document.getElementById('highscore').innerText = `High Score: ${currentHighScore}`;
      }
  }
  
  // Update highscore on game over or score change
  function placeTetromino() {
      for (let row = 0; row < tetromino.matrix.length; row++) {
          for (let col = 0; col < tetromino.matrix[row].length; col++) {
              if (tetromino.matrix[row][col]) {
                  if (tetromino.row + row < 0) {
                      return showGameOver();
                  }
                  playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
              }
          }
      }
  
      for (let row = playfield.length - 1; row >= 0; ) {
          if (playfield[row].every(cell => !!cell)) {
              score += 100;
              document.getElementById('score').innerText = `Score: ${score}`;
              checkAndUpdateHighScore(); // Check and update high score
              for (let r = row; r >= 0; r--) {
                  for (let c = 0; c < playfield[r].length; c++) {
                      playfield[r][c] = playfield[r - 1][c];
                  }
              }
          } else {
              row--;
          }
      }
  
      tetromino = getNextTetromino();
  }
  
  
  function showGameOver() {
    cancelAnimationFrame(rAF);
    gameOver = true;
    context.fillStyle = 'black';
    context.globalAlpha = 0.75;
    context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
    context.globalAlpha = 1;
    context.fillStyle = 'white';
    context.font = '36px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
    document.getElementById('retryButton').style.display = 'block';
    const gameOverModal = new bootstrap.Modal(document.getElementById('gameOverModal'));
    document.getElementById('finalScore').innerText = score;
    gameOverModal.show();
  }
  
  // Modify startGame to make pause button visible
  function startGame() {
    // Hide welcome screen and show game container
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    document.getElementById('score').style.display = 'block';
    document.getElementById('pauseButton').style.display = 'block'; // Show pause button
    document.getElementById('shighscore').style.display = 'flex'; 
    // Show high score only after the game starts
    document.getElementById('highscore').style.display = 'block'; 
  
    tetromino = getNextTetromino();
    rAF = requestAnimationFrame(loop);
  }
  

// Modify resetGame to reset pause state
function resetGame() {
  score = 0;
  count = 0;
  speed = 25;
  isPaused = false; // Reset pause state
  document.getElementById('score').innerText = `Score: ${score}`;
  playfield.forEach(row => row.fill(0));
  tetrominoSequence.length = 0;
  tetromino = getNextTetromino();
  gameOver = false;
  document.getElementById('retryButton').style.display = 'none';
  document.getElementById('pauseButton').style.display = 'block'; // Hide pause button on reset

  cancelAnimationFrame(rAF);
  rAF = requestAnimationFrame(loop);
}
  
  
  // Initialize game variables
  const canvas = document.getElementById('game');
  const nextCanvas = document.getElementById('next');
  const context = canvas.getContext('2d');
  const grid = 32;
  const tetrominoSequence = [];
  const playfield = [];
  
  // Set up the empty playfield
  for (let row = -2; row < 20; row++) {
    playfield[row] = [];
    for (let col = 0; col < 10; col++) {
      playfield[row][col] = 0;
    }
  }
  
  function submitHighScore() {
    const playerName = document.getElementById('playerName').value;
    const finalScore = score; // assumes `score` variable is global and accessible

    if (!playerName || finalScore === null) {
        alert("Please enter a name to submit your score.");
        return;
    }

    fetch('save_score.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `name=${encodeURIComponent(playerName)}&highscore=${finalScore}`
    })
    .then(response => response.text())
    .then(data => {
        console.log("Response from server:", data); // Log response for debugging
        alert(data); // Notify the user that score is saved or display error from PHP
        getHighScore(); // Refresh the high score after submission
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Failed to submit high score. Please try again.");
    });
}


// Fetch and display the high score from the database
// Fetch and display the high score from the database
function getHighScore() {
  fetch('get_scores.php')
    .then(response => response.json())
    .then(data => {
      if (data && data[0]) {
        // Assuming the highest score is in the first row of the result
        currentHighScore = data[0].highscore;
        document.getElementById('highscore').innerText = `High Score: ${currentHighScore}`;
      } else {
        currentHighScore = 0;
        document.getElementById('highscore').innerText = 'High Score: 0';
      }
    })
    .catch(error => console.error('Error fetching high score:', error));
}

function displayHighScore() {
  fetch('get_scores.php')
    .then(response => response.json())
    .then(data => {
      if (data && data[0]) {
        // Assuming the highest score is in the first row of the result
        currentHighScore = data[0].highscore;
        document.getElementById('shighscore').innerText = `High Score: ${currentHighScore}`;
      } else {
        currentHighScore = 0;
        document.getElementById('shighscore').innerText = 'High Score: 0';
      }
    })
    .catch(error => console.error('Error fetching high score:', error));
}

// Call getHighScore when the page loads
window.onload = function () {
  getHighScore();
  displayHighScore()
};

function showLeaderboard() {
  fetch('get_scores.php')
    .then(response => response.json())
    .then(data => {
      const leaderboardModal = new bootstrap.Modal(document.getElementById('leaderboardModal'));
      const leaderboardList = document.getElementById('leaderboardList');
      leaderboardList.innerHTML = ''; // Clear the existing list

      // Populate the leaderboard with fetched data
      data.forEach((entry) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = `${entry.name}: ${entry.highscore}`;
        leaderboardList.appendChild(listItem);
      });

      leaderboardModal.show(); // Show the modal
    })
    .catch(error => {
      console.error('Error fetching leaderboard:', error);
    });
}

  const tetrominos = {
    'I': [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
    'J': [[1,0,0], [1,1,1], [0,0,0]],
    'L': [[0,0,1], [1,1,1], [0,0,0]],
    'O': [[1,1], [1,1]],
    'S': [[0,1,1], [1,1,0], [0,0,0]],
    'Z': [[1,1,0], [0,1,1], [0,0,0]],
    'T': [[0,1,0], [1,1,1], [0,0,0]]
  };
  
  const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange'
  };
  
  let count = 0;
  let tetromino = getNextTetromino();
  let rAF = null;
  let gameOver = false;
  let score = 0;
  let speed = 25; //35 normal
  
  // Control event listener
  document.addEventListener('keydown', function(e) {
    if (gameOver) return;
  
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const col = e.key === 'ArrowLeft' ? tetromino.col - 1 : tetromino.col + 1;
      if (isValidMove(tetromino.matrix, tetromino.row, col)) {
        tetromino.col = col;
      }
    } else if (e.key === 'ArrowDown') {
      const row = tetromino.row + 1;
      if (isValidMove(tetromino.matrix, row, tetromino.col)) {
        tetromino.row = row;
        count = 0;
      }
    } else if (e.key === 'ArrowUp') {
      const matrix = rotate(tetromino.matrix);
      if (isValidMove(matrix, tetromino.row, tetromino.col)) {
        tetromino.matrix = matrix;
      }
    }
  });
  let isPaused = false; // New variable to track pause state

// Pause and resume game
function pauseGame() {
  if (gameOver) return; // Do not allow pause if the game is over

  isPaused = !isPaused; // Toggle the paused state
  document.getElementById('pauseButton').innerText = isPaused ? 'Resume' : 'Pause';

  if (!isPaused) {
    rAF = requestAnimationFrame(loop); // Resume the game loop
  }
}
  
function loop() {
  if (isPaused) return; // Stop the loop if paused

  rAF = requestAnimationFrame(loop);
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (playfield[row][col]) {
        const name = playfield[row][col];
        context.fillStyle = colors[name];
        context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
      }
    }
  }

  if (tetromino) {
    if (++count > speed) {
      tetromino.row++;
      count = 0;
      if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
        tetromino.row--;
        placeTetromino();
      }
    }

    context.fillStyle = colors[tetromino.name];
    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {
          context.fillRect(
            (tetromino.col + col) * grid,
            (tetromino.row + row) * grid,
            grid - 1,
            grid - 1
          );
        }
      }
    }
  }
}


  
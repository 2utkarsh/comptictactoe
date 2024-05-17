document.addEventListener("DOMContentLoaded", () => {
  const homeScreen = document.getElementById("home-screen");
  const modeSelection = document.getElementById("mode-selection");
  const playerSelection = document.getElementById("player-selection");
  const gameContainer = document.getElementById("game");
  const cells = document.querySelectorAll(".cell");
  const statusText = document.getElementById("status");
  const restartButton = document.getElementById("restart");
  const backButton = document.getElementById("back");
  let currentPlayer = "X";
  let board = Array(9).fill(null);
  let gameActive = true;
  let singlePlayer = false;
  let computerStarts = false;

  const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
  ];

  document.getElementById("start-game").addEventListener("click", showModeSelection);
  document.getElementById("two-player").addEventListener("click", startTwoPlayerGame);
  document.getElementById("one-player").addEventListener("click", showPlayerSelection);
  document.getElementById("choose-x").addEventListener("click", () => startSinglePlayerGame("X"));
  document.getElementById("choose-o").addEventListener("click", () => startSinglePlayerGame("O"));
  restartButton.addEventListener("click", restartGame);

  function showModeSelection() {
      homeScreen.classList.add("hidden");
      modeSelection.classList.remove("hidden");
  }

  var popup = document.getElementById("popup");
  var closeButton = document.getElementById("closePopup");

  closeButton.onclick = function() {
      popup.style.display = "none";
      restartGame();
  }

  window.onclick = function(event) {
      if (event.target == popup) {
          popup.style.display = "none";
      }
  }

  function showPopup() {
      popup.style.display = "block";
  }

  function startTwoPlayerGame() {
      singlePlayer = false;
      computerStarts = false;
      modeSelection.classList.add("hidden");
      gameContainer.classList.remove("hidden");
      restartGame();
  }

  function showPlayerSelection() {
      singlePlayer = true;
      modeSelection.classList.add("hidden");
      playerSelection.classList.remove("hidden");
  }

  function startSinglePlayerGame(player) {
      currentPlayer = player;
      computerStarts = (player === "O");
      playerSelection.classList.add("hidden");
      gameContainer.classList.remove("hidden");
      restartGame();
  }

  function handleCellClick(event) {
      const index = event.target.dataset.index;

      if (board[index] || !gameActive) {
          return;
      }

      board[index] = currentPlayer;
      event.target.textContent = currentPlayer;

      if (checkWinner()) {
          document.querySelector("#popup-para").textContent = `${currentPlayer} wins!`;
          gameActive = false;
          restartButton.textContent = "Play Again";
          highlightWinningCells();
          showPopup();
      } else if (board.every(cell => cell)) {
          document.querySelector("#popup-para").textContent = `It's a draw!`;
          gameActive = false;
          restartButton.textContent = "Play Again";
          showPopup();
      } else {
          currentPlayer = currentPlayer === "X" ? "O" : "X";
          statusText.textContent = `Player ${currentPlayer}'s turn`;
          if (singlePlayer && currentPlayer === "O") {
              computerMove();
          }
      }
  }

  function computerMove() {
      setTimeout(() => {
          let bestMove = findBestMove(board);
          if (bestMove !== -1) {
              board[bestMove] = currentPlayer;
              document.querySelector(`.cell[data-index='${bestMove}']`).textContent = currentPlayer;
              if (checkWinner()) {
                  document.querySelector("#popup-para").textContent = `${currentPlayer} wins!`;
                  gameActive = false;
                  restartButton.textContent = "Play Again";
                  highlightWinningCells();
                  showPopup();
              } else if (board.every(cell => cell)) {
                  document.querySelector("#popup-para").textContent = `It's a draw!`;
                  gameActive = false;
                  restartButton.textContent = "Play Again";
                  showPopup();
              } else {
                  currentPlayer = "X";
                  statusText.textContent = `Player ${currentPlayer}'s turn`;
              }
          }
      }, 500);
  }

  function findBestMove(board) {
      let bestVal = -Infinity;
      let bestMove = -1;
      for (let i = 0; i < board.length; i++) {
          if (board[i] === null) {
              board[i] = "O";
              let moveVal = minimax(board, 0, false, -Infinity, Infinity);
              board[i] = null;
              if (moveVal > bestVal) {
                  bestMove = i;
                  bestVal = moveVal;
              }
          }
      }
      return bestMove;
  }

  function minimax(board, depth, isMax, alpha, beta) {
      let score = evaluate(board);
      if (score === 10) return score - depth;
      if (score === -10) return score + depth;
      if (board.every(cell => cell !== null)) return 0;

      if (isMax) {
          let best = -Infinity;
          for (let i = 0; i < board.length; i++) {
              if (board[i] === null) {
                  board[i] = "O";
                  best = Math.max(best, minimax(board, depth + 1, !isMax, alpha, beta));
                  board[i] = null;
                  alpha = Math.max(alpha, best);
                  if (beta <= alpha) break;
              }
          }
          return best;
      } else {
          let best = Infinity;
          for (let i = 0; i < board.length; i++) {
              if (board[i] === null) {
                  board[i] = "X";
                  best = Math.min(best, minimax(board, depth + 1, !isMax, alpha, beta));
                  board[i] = null;
                  beta = Math.min(beta, best);
                  if (beta <= alpha) break;
              }
          }
          return best;
      }
  }

  function evaluate(board) {
      for (let combination of winningCombinations) {
          const [a, b, c] = combination;
          if (board[a] && board[a] === board[b] && board[a] === board[c]) {
              if (board[a] === "O") return 10;
              else if (board[a] === "X") return -10;
          }
      }
      return 0;
  }

  function checkWinner() {
      return winningCombinations.some(combination => {
          return combination.every(index => board[index] === currentPlayer);
      });
  }

  function restartGame() {
      board.fill(null);
      cells.forEach(cell => {
          cell.textContent = "";
          cell.classList.remove("winning-cell");
      });
      gameActive = true;
      statusText.textContent = `Player ${currentPlayer}'s turn`;
      restartButton.textContent = "Restart Game";
      if (singlePlayer && computerStarts) {
          currentPlayer = "O";
          statusText.textContent = `Player ${currentPlayer}'s turn`;
          computerMove();
      } else {
          currentPlayer = "X";
          statusText.textContent = `Player ${currentPlayer}'s turn`;
      }
  }

  function backToModeSelection() {
      gameContainer.classList.add("hidden");
      playerSelection.classList.add("hidden");
      modeSelection.classList.remove("hidden");
  }

  function highlightWinningCells() {
      const winningCombination = getWinningCombination();
      if (winningCombination) {
          winningCombination.forEach(index => {
              cells[index].classList.add("winning-cell");
          });
      }
  }

  function getWinningCombination() {
      return winningCombinations.find(combination => {
          return combination.every(index => board[index] === currentPlayer);
      });
  }

  cells.forEach(cell => cell.addEventListener("click", handleCellClick));
  backButton.addEventListener("click", backToModeSelection);

  statusText.textContent = `Player ${currentPlayer}'s turn`;
});

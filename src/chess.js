if (!localStorage.getItem('jwt')) {
  window.location.href = 'index.html';
}

const jwt = localStorage.getItem('jwt')
const gameId = sessionStorage.getItem('gameId')
const moves = sessionStorage.getItem('moves')

let WS_URL = 'minechesswebsocket-abh7eycbhsexazg6.northeurope-01.azurewebsites.net'; // Default URL
//let WS_URL = 'localhost:5000'; // Default URL

const socket = new WebSocket(`wss://${WS_URL}?token=${jwt}&gameId=${gameId}`);

socket.addEventListener('open', () => {
  console.log('Connected to WebSocket server');
});

socket.addEventListener('message', async (event) => {
  console.log('Raw message from server:', event.data);
  try {
    let messageText;

    // Check if the message is a Blob
    if (event.data instanceof Blob) { //if blob, create filereader and read the blob as text
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result; 
        handleMessage(text); // Process the text
      };
      reader.readAsText(event.data); // Read the Blob as text
    } else { // if no blob
      messageText = event.data;
      handleMessage(messageText);
    }
  } catch (error) {
    console.error('Error parsing message:', error);
  }
});

// Function to handle the message parsing
function handleMessage(messageText) {
  const data = JSON.parse(messageText);
  console.log('Parsed message from server:', data);
  if (data.type === 'info') { //if it is an info message, update the game status
    document.getElementById('game-status').innerText = data.message;
  } else if (data.type === 'move') { //if it is a move message, update the board
    updateBoard(data.from, data.to);
  }
}

// Send a move to the server
function sendMove(fromIndex, toIndex) {
  const message = JSON.stringify({ type: 'move', from: fromIndex, to: toIndex });
  socket.send(message);
  console.log('Sent move:', message);
}

// Update the chessboard UI
function updateBoard(fromIndex, toIndex) {
  const fromSquare = document.querySelector(`[data-index='${fromIndex}']`);
  const toSquare = document.querySelector(`[data-index='${toIndex}']`);
  const piece = fromSquare.querySelector('img');
  if (piece) {
    toSquare.innerHTML = ''; // Clear the target square
    toSquare.appendChild(piece); // Move the piece to the new square
    piece.dataset.index = toIndex; // Update piece's index
  }
}

// Initial setup of the chessboard
const initialBoardSetup = [
  'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
  'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',
  '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '',
  'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P',
  'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'
];

// Mapping pieces to images
const pieceImages = {
  'r': 'img/black/cow_black.png',
  'n': 'img/black/Creeper_black.png',
  'b': 'img/black/ghast_black.png',
  'q': 'img/black/mine_black.png',
  'k': 'img/black/steve_black.png',
  'p': 'img/black/pig_black.png',
  'R': 'img/white/cow_white.png',
  'N': 'img/white/creeper_white.png',
  'B': 'img/white/ghast_white.png',
  'Q': 'img/white/mine_white.png',
  'K': 'img/white/steve_white.png',
  'P': 'img/white/pig_white.png'
};

// Create the chessboard
const chessboard = document.getElementById('chessboard');
for (let i = 0; i < 64; i++) {
  const square = document.createElement('div');
  square.className = (Math.floor(i / 8) + i) % 2 === 0 ? 'white' : 'black';
  square.dataset.index = i;
  square.addEventListener('dragover', (e) => e.preventDefault());
  square.addEventListener('drop', handleDrop);
  if (initialBoardSetup[i]) {
    const piece = document.createElement('img');
    piece.src = pieceImages[initialBoardSetup[i]];
    piece.draggable = true;
    piece.dataset.index = i;
    piece.addEventListener('dragstart', handleDragStart);
    square.appendChild(piece);
  }
  chessboard.appendChild(square);
}

let draggedPiece = null;

function handleDragStart(e) {
  draggedPiece = e.target; // Store the currently dragged piece
}

function handleDrop(e) {
  if (draggedPiece) {
    const fromIndex = draggedPiece.dataset.index;
    const toIndex = e.target.dataset.index || e.target.parentElement.dataset.index;
    sendMove(fromIndex, toIndex);
    updateBoard(fromIndex, toIndex);
    draggedPiece = null; // Reset dragged piece
  }
}

// Function to apply moves from session storage to the initial board setup
function applyMovesFromStorage() {
  if (!moves) return; // No moves to apply if the moves string is empty or null

  // Split the moves string into an array of move strings
  const movePairs = moves.split(', ');

  // Apply each move to the initial board setup
  movePairs.forEach(move => {
      const [fromIndex, toIndex] = move.split(' ').map(Number); // Convert indices to numbers

      // Move the piece in the board array
      const piece = initialBoardSetup[fromIndex];
      initialBoardSetup[toIndex] = piece;
      initialBoardSetup[fromIndex] = ''; // Clear the original position
  });

  // Update the UI to reflect the board state
  updateBoardUI();
}

// Function to update the chessboard UI based on the current board state
function updateBoardUI() {
  // Clear the current board UI
  chessboard.innerHTML = '';

  // Recreate the board with the updated setup
  for (let i = 0; i < 64; i++) {
      const square = document.createElement('div');
      square.className = (Math.floor(i / 8) + i) % 2 === 0 ? 'white' : 'black';
      square.dataset.index = i;
      square.addEventListener('dragover', (e) => e.preventDefault());
      square.addEventListener('drop', handleDrop);
      
      const pieceSymbol = initialBoardSetup[i];
      if (pieceSymbol) {
          const piece = document.createElement('img');
          piece.src = pieceImages[pieceSymbol];
          piece.draggable = true;
          piece.dataset.index = i;
          piece.addEventListener('dragstart', handleDragStart);
          square.appendChild(piece);
      }
      
      chessboard.appendChild(square);
  }
}

// Call the function to apply moves after initial setup
applyMovesFromStorage();
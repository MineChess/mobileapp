if (!localStorage.getItem('jwt')) {
  window.location.href = 'index.html';
}

const jwt = localStorage.getItem('jwt');
const gameId = sessionStorage.getItem('gameId');
const moves = sessionStorage.getItem('moves');

let WS_URL = 'minechesswebsocket-abh7eycbhsexazg6.northeurope-01.azurewebsites.net'; // Default URL
//let WS_URL = 'localhost:5000'; // Alternative for local testing

const socket = new WebSocket(`ws://${WS_URL}?token=${jwt}&gameId=${gameId}`);

socket.addEventListener('open', () => {
  console.log('Connected to WebSocket server');
});

socket.addEventListener('message', async (event) => {
  console.log('Raw message from server:', event.data);
  try {
    let messageText;
    if (event.data instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result; 
        handleMessage(text);
      };
      reader.readAsText(event.data);
    } else {
      messageText = event.data;
      handleMessage(messageText);
    }
  } catch (error) {
    console.error('Error parsing message:', error);
  }
});

function handleMessage(messageText) {
  const data = JSON.parse(messageText);
  console.log('Parsed message from server:', data);
  if (data.type === 'info') {
    document.getElementById('game-status').innerText = data.message;
  } else if (data.type === 'move') {
    updateBoard(data.from, data.to);
  }
}

function sendMove(fromIndex, toIndex) {
  const message = JSON.stringify({ type: 'move', from: fromIndex, to: toIndex });
  socket.send(message);
  console.log('Sent move:', message);
}

function updateBoard(fromIndex, toIndex) {
  const fromSquare = document.querySelector(`[data-index='${fromIndex}']`);
  const toSquare = document.querySelector(`[data-index='${toIndex}']`);
  const piece = fromSquare.querySelector('img');
  if (piece) {
    toSquare.innerHTML = '';
    toSquare.appendChild(piece);
    piece.dataset.index = toIndex;
  }
}

let initialBoardSetup = [
  'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
  'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',
  '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '',
  'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P',
  'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'
];

function extractMoves(movesString) {
  // Split the string into individual move pairs
  const movePairs = moves.split(', ');

  // Map each move pair to an object with from and to indices
  const extractedMoves = movePairs.map(move => {
      const [fromIndex, toIndex] = move.split(' ').map(Number); // Convert indices to numbers
      return { fromIndex, toIndex };
  });

  return extractedMoves;
}


if(moves) {
  const extractedMoves = extractMoves(moves);
  extractedMoves.forEach(move => {
    initialBoardSetup[move.toIndex] = initialBoardSetup[move.fromIndex]
    initialBoardSetup[move.fromIndex] = ''
  });
}

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
  draggedPiece = e.target;
}

function handleDrop(e) {
  if (draggedPiece) {
    const fromIndex = parseInt(draggedPiece.dataset.index);
    const toIndex = parseInt(e.target.dataset.index || e.target.parentElement.dataset.index);
    sendMove(fromIndex, toIndex);
    updateBoard(fromIndex, toIndex);
    draggedPiece = null;
  }
}

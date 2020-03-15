const blockSize = 40;
const blockCountw = 7;
const blockCounth = 14;
const gameWidth = blockSize * blockCountw + "";
const gameHeight = blockSize * blockCounth + "";
const speed = 10;

function distance_vector(p, q) {
  return p.map((el, i) => el - q[i]);
}

function norm_squared(p) {
  return p.reduce((cum, cur) => cum + cur ** 2, 0);
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const color_map = {
  0: "rgb(0,0,0)",
  1: "rgb(255,0,0)",
  2: "rgb(0,255,0)",
  3: "rgb(0,0,255)",
  4: "rgb(255,255,0)",
  5: "rgb(0,255,255)",
  6: "rgb(255,0,255)",
  7: "rgb(255,255,255)",
  8: "rgb(110,110,110)",
};

const Piece = {
  long: {
    position: [
      [3, 0],
      [3, 1],
      [3, 2],
      [3, 3]
    ],
    centerPiece: [3, 1],
    color: 1
  },
  z: {
    position: [
      [3, 1],
      [3, 2],
      [4, 0],
      [4, 1]
    ],
    centerPiece: [4, 1],
    color: 2
  },
  reversez: {
    position: [
      [3, 0],
      [3, 1],
      [4, 1],
      [4, 2]
    ],
    centerPiece: [3, 1],
    color: 3
  },
  triangle: {
    position: [
      [3, 1],
      [4, 0],
      [4, 1],
      [4, 2]
    ],
    centerPiece: [4, 1],
    color: 4
  },
  L: {
    position: [
      [3, 2],
      [4, 0],
      [4, 1],
      [4, 2]
    ],
    centerPiece: [4, 2],
    color: 5
  },
  reverseL: {
    position: [
      [3, 0],
      [4, 0],
      [4, 1],
      [4, 2]
    ],
    centerPiece: [4, 0],
    color: 6
  },
  square: {
    position: [
      [3, 0],
      [4, 0],
      [4, 1],
      [3, 1]
    ],
    centerPiece: [3.5, 0.5],
    color: 7
  },
};

const pieceCollection =[Piece.long, Piece.z, Piece.reversez, Piece.L, Piece.reverseL, Piece.square, Piece.triangle]

function drawSquare(x, y, color, ctx) {
  ctx.fillStyle = color_map[color];
  ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
}


let tetris = function() {
  let gameField = [];
  let currentPiece = clone(pieceCollection[getRandomPieceNumber()]);
  let projected_position = [];
  let projected_center = clone(currentPiece.centerPiece);
  
  let score = 0

  let gameCanvas;
  let gameCtx;
  let scoreCtx;

  function checkCollisions() {
    if (
      projected_position.some(x => x[0] < 0) ||
      projected_position.some(x => x[0] >= blockCountw) ||
      projected_position.some(x => x[1] >= blockCounth) ||
      projected_position.some(x => gameField[x[1]][x[0]] > 0)
    )
      return true;
    return false;
  }

  function removeFullLines() {
    for (let k = blockCounth - 1; k >= 0; --k) {
      if (gameField[k].every(x => x > 0)) {
        for (let l = k; l >= 1; --l) {
          gameField[l] = clone(gameField[l - 1]);
        }
        k += 1;
        updateScore(score+1);
      }
      gameField[0].fill(0);
    }
  }
  function getRandomPieceNumber() {
    return Math.floor(Math.random() * pieceCollection.length);
  }
  function updateGame() {
    projected_position = currentPiece.position.map(x => [x[0], x[1] + 1]);
    projected_center = currentPiece.centerPiece.map( (x, i) => x+i); 
    if (checkCollisions()) {
      currentPiece.position.forEach(x => {
        gameField[x[1]][x[0]] = currentPiece.color;
      });
      //currentPiece = clone(pieceCollection[getRandomPieceNumber()]);
      //FIX HERE
      currentPiece = clone(pieceCollection[getRandomPieceNumber()]);
      projected_position = clone(currentPiece.position)
      projected_center = clone(currentPiece.centerPiece)
      removeFullLines();
      if (checkCollisions())
      {
        reset()
        console.log("Game Over")
      }
      return;
    }
    currentPiece.position = projected_position;
    currentPiece.centerPiece = projected_center;
  }
  function updateScoreCanvas(_score, ctx) {
  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(0,0,200,200)
  ctx.strokeText(_score, 10, 50);
}
  function updateScore(newScore){
    score = newScore;
    updateScoreCanvas(score, scoreCtx)
}

  function reset() {
    gameField = gameField.map(x =>
      x.map(() => {
        return 0;
      })
    );
    score = 0;
    updateScore(score)
  }

  return {
    init: (_gameCanvas, _scoreCanvas)  => {
      gameCanvas = document.getElementById(_gameCanvas);
      gameCtx = gameCanvas.getContext("2d");

      gameCanvas = document.getElementById(_scoreCanvas);
      scoreCtx = gameCanvas.getContext("2d");
      initScore(_scoreCanvas)

      gameCtx.canvas.width = gameWidth;
      gameCtx.canvas.height = gameHeight;
      for (let k = 0; k < blockCounth; ++k) {
        gameField[k] = [];
        for (let l = 0; l < blockCountw; ++l) {
          gameField[k][l] = 0;
        }
      }
    },
getScore: () => {
      return score;
    },
    checkCollisions: checkCollisions,
    updateGame: updateGame,
    drawGame: () => {
      for (let k = 0; k < blockCounth; ++k) {
        for (let l = 0; l < blockCountw; ++l) {
          drawSquare(l, k, gameField[k][l], gameCtx);
        }
      }
      currentPiece.position.forEach(x =>
        drawSquare(x[0], x[1], currentPiece.color, gameCtx)
      );
        drawSquare(currentPiece.centerPiece[0],currentPiece.centerPiece[1], 8, gameCtx) 
    },
    keyPress: e => {
      switch (e.code) {
        case "ArrowRight":
          projected_position = currentPiece.position.map(x => [x[0] + 1, x[1]]);
          projected_center = [
            currentPiece.centerPiece[0] + 1,
            currentPiece.centerPiece[1]
          ];
          break;
        case "ArrowLeft":
          projected_position = currentPiece.position.map(x => [x[0] - 1, x[1]]);
          projected_center = [
            currentPiece.centerPiece[0] - 1,
            currentPiece.centerPiece[1]
          ];
          break;
        case "ArrowUp":
          projected_center = [
            currentPiece.centerPiece[0],
            currentPiece.centerPiece[1]
          ];
          projected_position = currentPiece.position
            .map(x => [x[0] - projected_center[0], x[1] - projected_center[1]])
            .map(x => [-x[1], x[0]])
            .map(x => [x[0] + projected_center[0], x[1] + projected_center[1]]);
          break;
        case "ArrowDown":
          updateGame();
          break;
        case "KeyR":
          reset();
        default:
          console.log("unrecognized input", e.code);
          break;
      }
      if (!checkCollisions()) {
        currentPiece.position = clone(projected_position);
        currentPiece.centerPiece = clone(projected_center);
      }
    }
  };
};

function gameLoop() {
  window.requestAnimationFrame(gameLoop);
}

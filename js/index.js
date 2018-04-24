const clone = xs => JSON.parse(JSON.stringify(xs));

// settings
let gridSize = 30,
  cellSize = 15,
  animationStarted = false,
  emptyGrid = true,
  currentGrid = generateGrid(false, gridSize),
  canvas = document.getElementById("canvas"),
  ctx = canvas.getContext("2d");


adjustCanvasSize(canvas, gridSize, cellSize);

function draw() {
  let framesPerSecond = 10;
  function frame() {
    setTimeout(function() {
      paintGrid(currentGrid);
      requestAnimationFrame(frame);
    }, 1000 / framesPerSecond);
  }

  requestAnimationFrame(frame);
}

//getGeneration utils
function shouldSurvive(neighbours)  {return neighbours === 2 || neighbours === 3;}
function shouldComeToLife(neighbours) {return neighbours === 3;}
function getValue(xs) {return x => y => (xs[x] && xs[x][y]) || 0;}
function getNextGeneration(cells) {
  let newCells = [];
  for (let rowIndex = 0; rowIndex < cells.length; rowIndex++) {
    newCells.push([]);
    for (let cellIndex = 0; cellIndex < cells[rowIndex].length; cellIndex++) {
      let liveNeighbours =
          getValue(cells)(rowIndex)(cellIndex - 1) +
          getValue(cells)(rowIndex)(cellIndex + 1) +
          getValue(cells)(rowIndex - 1)(cellIndex) +
          getValue(cells)(rowIndex + 1)(cellIndex) +
          getValue(cells)(rowIndex - 1)(cellIndex - 1) +
          getValue(cells)(rowIndex + 1)(cellIndex - 1) +
          getValue(cells)(rowIndex - 1)(cellIndex + 1) +
          getValue(cells)(rowIndex + 1)(cellIndex + 1);

      if (cells[rowIndex][cellIndex] === 1) {
        if (!shouldSurvive(liveNeighbours)) newCells[rowIndex].push(0);
        else newCells[rowIndex].push(1);
      } else if (cells[rowIndex][cellIndex] === 0) {
        if (shouldComeToLife(liveNeighbours)) newCells[rowIndex].push(1);
        else newCells[rowIndex].push(0);
      }
    }
  }
  return newCells;
};

function getGeneration(cells, generations) {
  if (generations === 0) return cells;
  return [...Array(generations).keys()].reduce(
    (acc, v) => getNextGeneration(acc),
    clone(cells)
  );
}

function adjustCanvasSize(canvas, gridSize, cellSize) {
  canvas.width = canvas.height = cellSize * gridSize;
};

function paint (x, y, clear) {
  if (clear) ctx.fillStyle = "#00F";
  else ctx.fillStyle = "#0F0";
  ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
};

function generateRow(length = 20, element = () => 0) {
  return [...Array(length).keys()].map(x => element());
};

function getRandomNumber() {
  let random = Math.random();
  return random < 0.7 ? Math.floor(random) : Math.ceil(random);
};
function generateGrid(notEmpty = false, size = 200) {
  let result = [],
    count = clone(size);
  while (count--) {
    result.push(generateRow(size, notEmpty ? getRandomNumber : () => 0));
  }
  return result;
};

function changeGridStatus() {
  emptyGrid = false;
};

function paintGrid(grid) {
  grid.forEach((row, rowIndex) =>
    row.forEach((cell, cellIndex) => {
      cell &&
        paint(
          !cellIndex ? 0 : cellIndex * cellSize,
          !rowIndex ? 0 : rowIndex * cellSize
        );
      !cell &&
        paint(
          !cellIndex ? 0 : cellIndex * cellSize,
          !rowIndex ? 0 : rowIndex * cellSize,
          true
        );
    })
  );
  
  currentGrid = animationStarted
    ? emptyGrid
      ? (changeGridStatus(), getGeneration(generateGrid(true, gridSize), 1))
      : getGeneration(grid, 1)
    : grid;
};

document.getElementById("reset-button").addEventListener("click", event => {
  event.stopPropagation();
  currentGrid = generateGrid(false, gridSize);
  animationStarted = false;
});
document.getElementById("pause-button").addEventListener("click", event => {
  event.stopPropagation();
  console.log(currentGrid);
  animationStarted = !animationStarted;
});
document.getElementById("generate-button").addEventListener("click", event => {
  event.stopPropagation();
  currentGrid = generateGrid(true, gridSize);
});
document.getElementById("grid-size").addEventListener("change", event => {
  event.stopPropagation();
  gridSize = +event.target.value;
  currentGrid = generateGrid(false, gridSize);
  adjustCanvasSize(canvas, gridSize, cellSize);
});
document.getElementById("cell-size").addEventListener("change", event => {
  cellSize = +event.target.value;
  adjustCanvasSize(canvas, gridSize, cellSize);
});
document.getElementById("canvas").addEventListener("click", event => {
  event.stopPropagation();
  let { x, y } = event;
  x = (x - canvas.offsetLeft) / cellSize;
  y = (y - canvas.offsetTop) / cellSize;
  x = Math.floor(x);
  y = Math.floor(y);

  animationStarted = false;
  emptyGrid = emptyGrid ? false : emptyGrid;

  currentGrid[y][x] = +!currentGrid[y][x];
});
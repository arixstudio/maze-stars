"use strict";

// Create the maze matrix
function createMatrixFromMaze() {
  const mazeBlocks = document.querySelectorAll(".maze .grid-item");
  const matrix = [];

  for (let i = 0; i < 10; i++) {
    matrix[i] = [];
    for (let j = 0; j < 10; j++) {
      let index = i * 10 + j;
      let blockID = mazeBlocks[index].id;
      let blockClass = mazeBlocks[index].classList[1];
      matrix[i][j] = blockID + "--" + blockClass;
    }
  }

  return matrix;
}

function movePlayer(player, cellID) {
  let playerElement = document.getElementById(player);
  let newCell = document.getElementById(cellID);

  if (newCell) {
    newCell.appendChild(playerElement);
  }
}

function getPlayerPositionID(playerID) {
  let player = playerID == 0 ? "player-red" : "player-blue";
  let playerElement = document.getElementById(player);
  if (playerElement) {
    let parentID = playerElement.parentElement.id;
    return parentID;
  }
}

/*
  @param cellID
  @return sides of the cells with no border (Ex: top, right)
*/
function getCellInnerAvailableDirections(cellID) {
  let currentCellClass = document.getElementById(cellID).classList[1];

  const availableDirections = [];

  // Just check if the main maze border is near!

  if (currentCellClass.length) {
    let lastFourDigits = currentCellClass.slice(-4);

    if (lastFourDigits[0] === "0") {
      availableDirections.push("top");
    }

    if (lastFourDigits[1] === "0") {
      availableDirections.push("right");
    }

    if (lastFourDigits[2] === "0") {
      availableDirections.push("bottom");
    }

    if (lastFourDigits[3] === "0") {
      availableDirections.push("left");
    }
  }

  return availableDirections;
}

/*
  @param matrix, cellID
  @return adjacent cells' class (Ex: 01-b1010)
*/
function getAdjacentCells(matrix, cellID) {
  let row = Math.floor(cellID / 10);
  let col = cellID % 10;

  let top = row > 0 ? matrix[row - 1][col] : null;
  let right = col < matrix[0].length - 1 ? matrix[row][col + 1] : null;
  let bottom = row < matrix.length - 1 ? matrix[row + 1][col] : null;
  let left = col > 0 ? matrix[row][col - 1] : null;

  return { top, right, bottom, left };
}

/*
  @param adjacentCells, cellID
  @return ARRAY of the available adjacent cells IDs
*/
function getAvailableAdjacentCells(matrix, cellID) {
  let adjacentCells = getAdjacentCells(matrix, cellID);
  let availableDirections = getCellInnerAvailableDirections(cellID);
  let availableCells = [];

  if (adjacentCells.top !== null && availableDirections.indexOf("top") !== -1) {
    let lastFourDigits = adjacentCells.top.slice(-4);
    if (lastFourDigits.charAt(2) === "0") {
      availableCells.push(adjacentCells.top.slice(0, 2));
    }
  }

  if (
    adjacentCells.right !== null &&
    availableDirections.indexOf("right") !== -1
  ) {
    let lastFourDigits = adjacentCells.right.slice(-4);
    if (lastFourDigits.charAt(3) === "0") {
      availableCells.push(adjacentCells.right.slice(0, 2));
    }
  }

  if (
    adjacentCells.bottom !== null &&
    availableDirections.indexOf("bottom") !== -1
  ) {
    let lastFourDigits = adjacentCells.bottom.slice(-4);
    if (lastFourDigits.charAt(0) === "0") {
      availableCells.push(adjacentCells.bottom.slice(0, 2));
    }
  }

  if (
    adjacentCells.left !== null &&
    availableDirections.indexOf("left") !== -1
  ) {
    let lastFourDigits = adjacentCells.left.slice(-4);
    if (lastFourDigits.charAt(1) === "0") {
      availableCells.push(adjacentCells.left.slice(0, 2));
    }
  }

  function removeClosedGates(availableCells) {
    return availableCells.filter((id) => {
      const element = document.getElementById(id);
      return !(element && element.classList.contains("gate-close"));
    });
  }

  availableCells = removeClosedGates(availableCells);

  return availableCells;
}

function markAvailableAdjacentCells(cellIDs) {
  const elementsWithAvailable = document.querySelectorAll(".available");
  if (elementsWithAvailable.length > 0) {
    elementsWithAvailable.forEach((el) => {
      el.classList.remove("available");
    });
  }
  cellIDs.forEach((id) => {
    let element = document.getElementById(id);
    if (element) {
      element.classList.add("available");
    } else {
      console.error(`Element with ID ${id} not found.`);
    }
  });
}

// Function to set or update cookies
const setCookie = (name, value) => {
  document.cookie = `${name}=${value};`;
};

// Function to get cookie value
const getCookie = (name) => {
  const cookieValue = document.cookie.match(
    "(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"
  );
  return cookieValue ? cookieValue.pop() : "";
};

function getTurnToPlay() {
  let turnToPlay = getCookie("turnToPlay");
  return turnToPlay;
}

function setTurnToPlay(playerID) {
  setCookie("turnToPlay", playerID);
}

function rollDice() {
  document.getElementById("roll-dice").disabled = true;
  // Generate a random number between 1 and 6
  let diceSide = Math.floor(Math.random() * 6) + 1;
  document.getElementById("dice-side").value = diceSide;
  return diceSide;
}

function playPcTurn() {
  let mazeMatrix = createMatrixFromMaze();
  document.getElementById("player").value = "Player Red [PC]";
  document.getElementById("roll-dice").disabled = true;
  let dice = rollDice();
  let isMoved = 0;
  let isOver = 0;

  var traversedCells = [];

  for (let i = 1; i <= dice; i++) {
    const timer1 = setTimeout(function () {
      let playerPositionID = getPlayerPositionID(0);
      traversedCells.push(playerPositionID);
      let availableCells = getAvailableAdjacentCells(
        mazeMatrix,
        playerPositionID
      );

      // Remove traversed cells from available cells
      let newAvailableCells = availableCells.filter(
        (item) => !traversedCells.includes(item)
      );
      let nextStepID =
        newAvailableCells[
          Math.floor(Math.random() * (newAvailableCells.length - 1))
        ];
      console.log(nextStepID);
      const playerRedElement = document.querySelector(".player-red");
      if (
        playerRedElement.parentElement.classList.contains("star-block") &&
        isMoved != 0 &&
        isOver == 0
      ) {
        isOver = 1;
        alert("GAME OVER");
        location.reload();
        return;
      } else if (
        playerRedElement.parentElement.classList.contains("card") &&
        isMoved != 0 &&
        isOver == 0
      ) {
        isOver = 1;
        console.log("Hit the card");
        showACard();
        setTurnToPlay(1);
        playNextTurn();
        return;
      }
      movePlayer("player-red", nextStepID);
      isMoved = 1;
      console.log("Moved");
      clearTimeout(timer1);
    }, (i + 1) * 500);
  }
  const timer2 = setTimeout(function () {
    setTurnToPlay(1);
    playNextTurn();
    clearTimeout(timer2);
  }, 3000);
}

function playPlayerOneTurn() {
  document.getElementById("player").value = "Player Blue [You]";
  document.getElementById("roll-dice").disabled = false;
  document.getElementById("dice-side").value = "";
}

function playNextTurn() {
  let nextTurn = getTurnToPlay();
  if (nextTurn == 0) playPcTurn();
  else playPlayerOneTurn();
}

function showACard() {
  const cards = [
    {
      message: "Oops! Red gate is opened!",
      action: "redOpen",
    },
    {
      message: "Oops! Red gate is closed!",
      action: "redClose",
    },
    {
      message: "Oops! Blue gate is opened!",
      action: "blueOpen",
    },
    {
      message: "Oops! Blue gate is closed!",
      action: "blueClose",
    },
  ];

  let randomNumber = Math.floor(Math.random() * 3);
  let card = cards[randomNumber];

  console.log(card.message);
  alert(card.message);

  if (card.action == "redOpen") {
    let element = document.querySelector(`.gate-red`);

    if (element.classList.contains("gate-close")) {
      element.classList.remove("gate-close");
      element.classList.add("gate-open");
    }
    return;
  } else if (card.action == "redClose") {
    let element = document.querySelector(`.gate-red`);

    if (element.classList.contains("gate-open")) {
      element.classList.remove("gate-open");
      element.classList.add("gate-close");
    }
    return;
  } else if (card.action == "blueOpen") {
    let element = document.querySelector(`.gate-blue`);

    if (element.classList.contains("gate-close")) {
      element.classList.remove("gate-close");
      element.classList.add("gate-open");
    }
    return;
  } else if (card.action == "blueClose") {
    let element = document.querySelector(`.gate-blue`);

    if (element.classList.contains("gate-open")) {
      element.classList.remove("gate-open");
      element.classList.add("gate-close");
    }
    return;
  }
}

function playerMoveOnClick(cellID) {
  const mazeMatrix = createMatrixFromMaze();
  let diceValue = document.getElementById("dice-side").value;

  if (getTurnToPlay() === "1" && diceValue.trim().length > 0) {
    if (diceValue >= 1) {
      let playerPositionID = getPlayerPositionID(1);
      let availableCells = getAvailableAdjacentCells(
        mazeMatrix,
        playerPositionID
      );
      console.log(availableCells);
      console.log(cellID);
      if (availableCells.indexOf(cellID) !== -1) {
        movePlayer("player-blue", cellID);
        document.getElementById("dice-side").value = diceValue - 1;
        if (document.getElementById("dice-side").value == 0) {
          setTurnToPlay(0);
          playNextTurn();
          return;
        }
        const playerBlueElement = document.querySelector(".player-blue");
        if (playerBlueElement.parentElement.classList.contains("star-block")) {
          document.getElementById("dice-side").value = "0";
          alert("YOU WON!");
          setTurnToPlay(0);
          playNextTurn();
          location.reload();
          return;
        } else if (playerBlueElement.parentElement.classList.contains("card")) {
          showACard();
          console.log("Hit the card");
        }
      } else {
        return;
      }
    } else {
      setTurnToPlay(0);
      playNextTurn();
    }
  } else {
    setTurnToPlay(0);
    playNextTurn();
  }
}

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("grid-item")) {
    const cellID = event.target.getAttribute("id");
    playerMoveOnClick(cellID);
  }
});

const gameOptions = {
  players: 1,
  difficulty: 0,
};
// Reset player turn on reload
setTurnToPlay(0);
playNextTurn();

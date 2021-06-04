import React, { useEffect, useState, useReducer, useCallback } from "react";
import Board from "../Board/Board";

/* Helper functions */
// Returns a random integer between an inclusive minimum and exclusive maximum
const getRandomNumber = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Checks if the target position is in the array of moves
const isTargetInPath = (arr, targetRow, targetCol) => {
  for (let move of arr) {
    if (move[0] === targetRow && move[1] === targetCol) {
      return true;
    }
  }
  return false;
};

// Clean moves array
const cleanMoves = arr => {
  arr = arr.reverse();
  arr = arr.slice(1);
  return arr;
};

// Get moves where the selected piece must capture the enemy
const getCaptureMoves = (row, col, boardObj) => {
  // If both left and right side exists

  // Check left side is a B and can be jumped over
  let currentRowLeft = row;
  let currentColLeft = col;
  let moves = [];

  // Check left side and recursively call left
  if (
    boardObj[currentRowLeft - 1] &&
    boardObj[currentRowLeft - 2] &&
    boardObj[currentRowLeft - 1][currentColLeft - 1] === "B" &&
    boardObj[currentRowLeft - 2][currentColLeft - 2] === " "
  ) {
    currentRowLeft = currentRowLeft - 2;
    currentColLeft = currentColLeft - 2;
    moves.push([currentRowLeft, currentColLeft]);
    moves = moves.concat(
      getCaptureMoves(currentRowLeft, currentColLeft, boardObj)
    );
  }

  // Check right side and recursively call right
  let currentRowRight = row;
  let currentColRight = col;
  if (
    boardObj[currentRowRight - 1] &&
    boardObj[currentRowRight - 2] &&
    boardObj[currentRowRight - 1][currentColRight + 1] === "B" &&
    boardObj[currentRowRight - 2][currentColRight + 2] === " "
  ) {
    currentRowRight = currentRowRight - 2;
    currentColRight = currentColRight + 2;
    moves.push([currentRowRight, currentColRight]);
    moves = moves.concat(
      getCaptureMoves(currentRowRight, currentColRight, boardObj)
    );
  }
  return moves;
};

// Get moves where the enemy selected piece must capture
const getCaptureEnemyMoves = (row, col, boardObj) => {
  // If both left and right side exists

  // Check left side is a B and can be jumped over
  let currentRowLeft = row;
  let currentColLeft = col;
  let moves = [];

  // Check left side and recursively call left
  if (
    boardObj[currentRowLeft + 1] &&
    boardObj[currentRowLeft + 2] &&
    boardObj[currentRowLeft + 1][currentColLeft - 1] === "W" &&
    boardObj[currentRowLeft + 2][currentColLeft - 2] === " "
  ) {
    currentRowLeft = currentRowLeft + 2;
    currentColLeft = currentColLeft - 2;
    moves.push([currentRowLeft, currentColLeft]);
    moves = moves.concat(
      getCaptureEnemyMoves(currentRowLeft, currentColLeft, boardObj)
    );
  }

  // Check right side and recursively call right
  let currentRowRight = row;
  let currentColRight = col;
  if (
    boardObj[currentRowRight + 1] &&
    boardObj[currentRowRight + 2] &&
    boardObj[currentRowRight + 1][currentColRight + 1] === "W" &&
    boardObj[currentRowRight + 2][currentColRight + 2] === " "
  ) {
    currentRowRight = currentRowRight + 2;
    currentColRight = currentColRight + 2;
    moves.push([currentRowRight, currentColRight]);
    moves = moves.concat(
      getCaptureEnemyMoves(currentRowRight, currentColRight, boardObj)
    );
  }
  return moves;
};

// Get list of possible capture moves that makes a path to the selected move
const getMovePath = (row, col, targetRow, targetCol, boardObj) => {
  // If both left and right side exists
  let moves = [];

  // If the move does not capture any enemies
  // Just return a path containing the move
  if (row - targetRow === 1) {
    moves.push([targetRow, targetCol]);
    return moves;
  }

  // If we found the value
  if (row === targetRow && col === targetCol) {
    moves.push([targetRow, targetCol]);
    return moves;
  }
  // Check left side is a B and can be jumped over
  let currentRowLeft = row;
  let currentColLeft = col;

  // Check left side and recursively call left
  if (
    boardObj[currentRowLeft - 1] &&
    boardObj[currentRowLeft - 2] &&
    boardObj[currentRowLeft - 1][currentColLeft - 1] === "B" &&
    boardObj[currentRowLeft - 2][currentColLeft - 2] === " "
  ) {
    currentRowLeft = currentRowLeft - 2;
    currentColLeft = currentColLeft - 2;
    moves = moves.concat(
      getMovePath(
        currentRowLeft,
        currentColLeft,
        targetRow,
        targetCol,
        boardObj
      )
    );

    if (isTargetInPath(moves, targetRow, targetCol)) {
      moves.push([row, col]);
      return moves;
    }
  }

  // Check right side and recursively call right
  let currentRowRight = row;
  let currentColRight = col;
  if (
    boardObj[currentRowRight - 1] &&
    boardObj[currentRowRight - 2] &&
    boardObj[currentRowRight - 1][currentColRight + 1] === "B" &&
    boardObj[currentRowRight - 2][currentColRight + 2] === " "
  ) {
    currentRowRight = currentRowRight - 2;
    currentColRight = currentColRight + 2;
    moves = moves.concat(
      getMovePath(
        currentRowRight,
        currentColRight,
        targetRow,
        targetCol,
        boardObj
      )
    );
    if (isTargetInPath(moves, targetRow, targetCol)) {
      moves.push([row, col]);
      return moves;
    }
  }

  return moves;
};

// Get list of possible capture moves that makes a path to the selected move
const getEnemyMovePath = (row, col, targetRow, targetCol, boardObj) => {
  // If both left and right side exists
  let moves = [];

  // If the move does not capture any enemies
  // Just return a path containing the move
  if (row - targetRow === -1) {
    moves.push([targetRow, targetCol]);
    return moves;
  }

  // If we found the value
  if (row === targetRow && col === targetCol) {
    moves.push([targetRow, targetCol]);
    return moves;
  }
  // Check left side is a B and can be jumped over
  let currentRowLeft = row;
  let currentColLeft = col;

  // Check left side and recursively call left
  if (
    boardObj[currentRowLeft + 1] &&
    boardObj[currentRowLeft + 2] &&
    boardObj[currentRowLeft + 1][currentColLeft - 1] === "W" &&
    boardObj[currentRowLeft + 2][currentColLeft - 2] === " "
  ) {
    currentRowLeft = currentRowLeft + 2;
    currentColLeft = currentColLeft - 2;
    moves = moves.concat(
      getMovePath(
        currentRowLeft,
        currentColLeft,
        targetRow,
        targetCol,
        boardObj
      )
    );

    if (isTargetInPath(moves, targetRow, targetCol)) {
      moves.push([row, col]);
      return moves;
    }
  }

  // Check right side and recursively call right
  let currentRowRight = row;
  let currentColRight = col;
  if (
    boardObj[currentRowRight + 1] &&
    boardObj[currentRowRight + 2] &&
    boardObj[currentRowRight + 1][currentColRight + 1] === "W" &&
    boardObj[currentRowRight + 2][currentColRight + 2] === " "
  ) {
    currentRowRight = currentRowRight + 2;
    currentColRight = currentColRight + 2;
    moves = moves.concat(
      getMovePath(
        currentRowRight,
        currentColRight,
        targetRow,
        targetCol,
        boardObj
      )
    );
    if (isTargetInPath(moves, targetRow, targetCol)) {
      moves.push([row, col]);
      return moves;
    }
  }

  return moves;
};


// Reducer
// PERFORM - Takes in an array of chained moves and performs each move
const boardReducer = (prevBoardObj, action) => {
  switch (action.type) {
    case "PERFORM":
      // Setup
      const { prevRow, prevCol, arr, currentPlayer } = action;
      let currRow = prevRow;
      let currCol = prevCol;
      prevBoardObj[currRow][currCol] = " ";

      // Loop over the array of moves  and perform each move
      for (let move of arr) {
        const row = move[0];
        const col = move[1];
        const isLeft = col - currCol === -2;
        const isRight = col - currCol === 2;
        const isEnemy = row - currRow > 0;

        // Capture the enemy depending if the piece jumps to the left or right
        if (isLeft) {
          if (isEnemy) {
            prevBoardObj[currRow + 1][currCol - 1] = " ";
          } else {
            prevBoardObj[currRow - 1][currCol - 1] = " ";
          }
        } else if (isRight) {
          if (isEnemy) {
            prevBoardObj[currRow + 1][currCol + 1] = " ";
          } else {
            prevBoardObj[currRow - 1][currCol + 1] = " ";
          }
        }

        currRow = row;
        currCol = col;
      }
      prevBoardObj[currRow][currCol] = currentPlayer;
      return prevBoardObj;

    default:
      console.log("Error: wrong type");
      break;
  }
};

const Game = () => {
  /* States and variables */
  // Updates the board

  const [selectedPieceRow, selectPieceRow] = useState(null);
  const [selectedPieceCol, selectPieceCol] = useState(null);
  const [selectedMoveRow, selectMoveRow] = useState(null);
  const [selectedMoveCol, selectMoveCol] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState("W");
  const [isEndGame, setIsEndGame] = useState(false);

  const [board, dispatchBoard] = useReducer(boardReducer, [
    [" ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " "],
    ["W", " ", " ", " ", " ", " ", " ", "W"],
    [" ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", "B"],
    [" ", " ", "W", " ", " ", " ", "W", " "],
    [" ", " ", " ", " ", " ", " ", " ", " "],
  ]);

  /* Gameplay functions */
  // Get possible moves for enemies
  const getPossibleEnemyMoves = (selectedRow, selectedCol) => {
    const boardObj = board;
    let moves = [];

    // Checks for possible moves to capture enemies
    // If so, only show moves to capture enemies
    const captureMoves = getCaptureEnemyMoves(
      selectedRow,
      selectedCol,
      boardObj
    );
    if (captureMoves.length !== 0) {
      return captureMoves;
    }

    // Checks for vacant slots and add to array of available moves
    if (boardObj[selectedRow + 1]) {
      if (boardObj[selectedRow + 1][selectedCol + 1] === " ") {
        moves.push([selectedRow + 1, selectedCol + 1]);
      }

      if (boardObj[selectedRow + 1][selectedCol - 1] === " ") {
        moves.push([selectedRow + 1, selectedCol - 1]);
      }
    }

    return moves;
  };

  // Randomly select a piece for the enemy to move
  // Return the selected piece
  const enemySelectPiece = () => {
    // Collect all pieces with valid moves
    const boardObj = board;
    let availablePieces = [];
    boardObj.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (
          value === "B" &&
          getPossibleEnemyMoves(rowIndex, colIndex).length !== 0
        ) {
          availablePieces.push([rowIndex, colIndex]);
        }
      });
    });

    // Randomly select a piece to move if there are pieces to move
    const range = availablePieces.length;
    const randomIndex = getRandomNumber(0, range - 1);
    const pickedPiece =
      availablePieces.length !== 0 ? availablePieces[randomIndex] : null;
    // console.log({ pickedPiece, availablePieces });
    return pickedPiece;
  };

  // Select the move for the selected enemy piece
  const enemySelectMove = enemySelectedPiece => {
    const enemySelectedPieceObj = enemySelectedPiece;
    const possibleMoves = getPossibleEnemyMoves(
      enemySelectedPieceObj[0],
      enemySelectedPieceObj[1]
    );

    // Randomly select a move
    const range = possibleMoves.length;
    if (possibleMoves.length !== 0) {
      const randomIndex = getRandomNumber(0, range - 1);
      const pickedMove = possibleMoves[randomIndex];
      console.log({ pickedMove, possibleMoves });
      selectMoveRow(pickedMove[0]);
      selectMoveCol(pickedMove[1]);

      // Uses the selected move and finds a path for the move
      const movePath = getEnemyMovePath(
        enemySelectedPieceObj[0],
        enemySelectedPieceObj[1],
        pickedMove[0],
        pickedMove[1],
        board
      );

      // If there are chained moves
      // Clean the array and perform the moves
      if (movePath.length > 1) {
        const chainMoves = cleanMoves(movePath);
        dispatchBoard({
          type: "PERFORM",
          prevRow: enemySelectedPieceObj[0],
          prevCol: enemySelectedPieceObj[1],
          arr: chainMoves,
          currentPlayer,
        });
      } else {
        console.log({ movePath });
        // Perform the path of moves
        dispatchBoard({
          type: "PERFORM",
          prevRow: enemySelectedPieceObj[0],
          prevCol: enemySelectedPieceObj[1],
          arr: movePath,
          currentPlayer,
        });
      }
    }
  };
  // Get all possible moves given a selected row and column
  const getPossibleMoves = useCallback(
    (selectedRow, selectedCol) => {
      const boardObj = board;
      let moves = [];

      // Checks for possible moves to capture enemies
      // If so, only show moves to capture enemies
      const captureMoves = getCaptureMoves(selectedRow, selectedCol, boardObj);
      if (captureMoves.length !== 0) {
        return captureMoves;
      }

      // Checks for vacant slots and add to array of available moves
      if (boardObj[selectedRow - 1]) {
        if (boardObj[selectedRow - 1][selectedCol - 1] === " ") {
          moves.push([selectedRow - 1, selectedCol - 1]);
        }

        if (boardObj[selectedRow - 1][selectedCol + 1] === " ") {
          moves.push([selectedRow - 1, selectedCol + 1]);
        }
      }
      setPossibleMoves(moves);
      return moves;
    },
    [board]
  );

  // Initialize checker pieces
  //   const initializePieces = board => {
  //     board = board.map((val, index) => {
  //       if (index === 3 || index === 4) {
  //         return val;
  //       }

  //       if (index <= 2) {
  //         if (index % 2 === 0) {
  //           for (let i = 0; i < val.length; i++) {
  //             if (i % 2 === 0) {
  //               val[i] = " ";
  //             }
  //           }
  //         } else {
  //           for (let i = 0; i < val.length; i++) {
  //             if (i % 2 === 1) {
  //               val[i] = " ";
  //             }
  //           }
  //         }
  //       } else {
  //         if (index % 2 === 0) {
  //           for (let i = 0; i < val.length; i++) {
  //             if (i % 2 === 0) {
  //               val[i] = "W";
  //             }
  //           }
  //         } else {
  //           for (let i = 0; i < val.length; i++) {
  //             if (i % 2 === 1) {
  //               val[i] = "W";
  //             }
  //           }
  //         }
  //       }

  //       return val;
  //     });

  //     return board;
  //   };

  const runAIMoves = () => {
    // Selects an enemy piece and select a move
    const enemySelectedPieceObj = enemySelectPiece();
    if (!enemySelectedPieceObj) {
      setIsEndGame(true);
      return;
    }

    enemySelectMove(enemySelectedPieceObj);
    setCurrentPlayer("W");
  };

  /* Handlers */
  const handleStartDragPiece = useCallback(position => {
    const row = position[0];
    const col = position[1];
    selectPieceRow(row);
    selectPieceCol(col);
    getPossibleMoves(row, col)
  }, [getPossibleMoves]);

  const handleEndDragPiece = useCallback(() => {
    setPossibleMoves([]);
  }, []);

  const handleDrop = position => {
    selectMoveRow(position[0]);
    selectMoveCol(position[1]);
    // Uses the selected move and finds a path for the move
    const movePath = getMovePath(
      selectedPieceRow,
      selectedPieceCol,
      position[0],
      position[1],
      board
    );

    // If there are chained moves
    // Clean the array and perform the moves
    if (movePath.length > 1) {
      const chainMoves = cleanMoves(movePath);
      dispatchBoard({
        type: "PERFORM",
        prevRow: selectedPieceRow,
        prevCol: selectedPieceCol,
        arr: chainMoves,
        currentPlayer,
      });
    } else {
      // Perform the path of moves
      dispatchBoard({
        type: "PERFORM",
        prevRow: selectedPieceRow,
        prevCol: selectedPieceCol,
        arr: movePath,
        currentPlayer,
      });
    }
    // Change players and start
    setCurrentPlayer("B");
  };

  /* Side effects */

  //  Side effect for initializing the board state
  useEffect(() => {
    console.log({ board });
  }, [board]);

  // Side effect for running the AI when players change
  useEffect(() => {
    if (currentPlayer === "B") {
      runAIMoves();
    } else {
      
    }
  });

  return (
    <div>
      <Board
        board={board}
        possibleMoves={possibleMoves}
        onStartDragPiece={handleStartDragPiece}
        onEndDragPiece={handleEndDragPiece}
        onDrop={handleDrop}
      ></Board>
      {isEndGame ? <h1>You Win!</h1> : null}
    </div>
  );
};
export default Game;

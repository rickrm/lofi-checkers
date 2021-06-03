import React, { useEffect, useState } from "react";
import Board from "../Board/Board";

const Game = () => {
  /* States and variables */

  const [board, setBoard] = useState(JSON.stringify([]));
  const [selectedPieceRow, selectPieceRow] = useState(null);
  const [selectedPieceCol, selectPieceCol] = useState(null);
  const [selectedMoveRow, selectMoveRow] = useState(null);
  const [selectedMoveCol, selectMoveCol] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState("W");

  /* State effects */

  //  State effect for initializing the board state
  useEffect(() => {
    const tempBoard = JSON.parse(board);
    if (tempBoard.length === 0) {
      const boardObj = [
        [" ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " "],
        ["W", " ", " ", " ", " ", " ", " ", "W"],
        [" ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", "B"],
        [" ", " ", "W", " ", " ", " ", "W", " "],
        [" ", " ", " ", " ", " ", " ", " ", " "],
      ];

      setBoard(JSON.stringify(boardObj));
    }
    console.log({ tempBoard });
  }, [board]);

  useEffect(() => {
    if (currentPlayer === "B") {
      runAIMoves();
    }
  });

  /* Gameplay functions */

  // Randomly select a piece for the enemy to move
  // Return the selected piece
  const enemySelectPiece = () => {
    // Collect all pieces with valid moves
    const boardObj = getBoard();
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
    console.log({ pickedPiece, availablePieces });
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
        pickedMove[1]
      );

      // If there are chained moves
      // Clean the array and perform the moves
      if (movePath.length > 1) {
        const chainMoves = cleanMoves(movePath);
        performMoves(
          enemySelectedPieceObj[0],
          enemySelectedPieceObj[1],
          chainMoves
        );
      } else {
        console.log({ movePath });
        // Perform the path of moves
        performMoves(
          enemySelectedPieceObj[0],
          enemySelectedPieceObj[1],
          movePath
        );
      }
    }
  };

  // Takes in an array of chained moves and performs each move
  const performMoves = (prevRow, prevCol, arr) => {
    setBoard(prevBoard => {
      // Setup
      const prevBoardObj = JSON.parse(prevBoard);
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
            console.log(row, col);

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

      // Set the piece's position
      prevBoardObj[currRow][currCol] = currentPlayer;
      return JSON.stringify(prevBoardObj);
    });
  };
  // Get list of possible capture moves that makes a path to the selected move
  const getMovePath = (row, col, targetRow, targetCol) => {
    // If both left and right side exists
    const boardObj = getBoard();
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
        getMovePath(currentRowLeft, currentColLeft, targetRow, targetCol)
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
        getMovePath(currentRowRight, currentColRight, targetRow, targetCol)
      );
      if (isTargetInPath(moves, targetRow, targetCol)) {
        moves.push([row, col]);
        return moves;
      }
    }

    return moves;
  };

  // Get list of possible capture moves that makes a path to the selected move
  const getEnemyMovePath = (row, col, targetRow, targetCol) => {
    // If both left and right side exists
    const boardObj = getBoard();
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
        getMovePath(currentRowLeft, currentColLeft, targetRow, targetCol)
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
        getMovePath(currentRowRight, currentColRight, targetRow, targetCol)
      );
      if (isTargetInPath(moves, targetRow, targetCol)) {
        moves.push([row, col]);
        return moves;
      }
    }

    return moves;
  };

  // Get moves where the selected piece must capture the enemy
  const getCaptureMoves = (row, col) => {
    const boardObj = getBoard();

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
      moves = moves.concat(getCaptureMoves(currentRowLeft, currentColLeft));
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
      moves = moves.concat(getCaptureMoves(currentRowRight, currentColRight));
    }
    return moves;
  };

  const getCaptureEnemyMoves = (row, col) => {
    const boardObj = getBoard();

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
        getCaptureEnemyMoves(currentRowLeft, currentColLeft)
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
        getCaptureEnemyMoves(currentRowRight, currentColRight)
      );
    }
    return moves;
  };

  // Get possible moves for enemies
  const getPossibleEnemyMoves = (selectedRow, selectedCol) => {
    const boardObj = getBoard();
    let moves = [];

    // Checks for possible moves to capture enemies
    // If so, only show moves to capture enemies
    const captureMoves = getCaptureEnemyMoves(selectedRow, selectedCol);
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

  // Get all possible moves given a selected row and column
  const getPossibleMoves = (selectedRow, selectedCol) => {
    const boardObj = getBoard();
    let moves = [];

    // Checks for possible moves to capture enemies
    // If so, only show moves to capture enemies
    const captureMoves = getCaptureMoves(selectedRow, selectedCol);
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
  };
  /* Helper functions */

  // Gets the parsed board
  const getBoard = () => {
    return JSON.parse(board);
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

  // Returns a random integer between an inclusive minimum and exclusive maximum
  const getRandomNumber = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

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

  /* Handlers */
  const runAIMoves = () => {
    // Selects an enemy piece and select a move
    const enemySelectedPieceObj = enemySelectPiece();
    if (!enemySelectedPieceObj) {
      return;
    }

    enemySelectMove(enemySelectedPieceObj);
    setCurrentPlayer("W");
  };

  const handleSelectPiece = position => {
    selectPieceRow(position[0]);
    selectPieceCol(position[1]);
    getPossibleMoves(position[0], position[1]);
  };

  const handleBoardClick = () => {
    setPossibleMoves([]);
  };

  const handleMoveClick = (position) => {
    selectMoveRow(position[0]);
    selectMoveCol(position[1]);
   // Uses the selected move and finds a path for the move
   const movePath = getMovePath(
    selectedPieceRow,
    selectedPieceCol,
    position[0],
    position[1]
  );

  // If there are chained moves
  // Clean the array and perform the moves
  if (movePath.length > 1) {
    const chainMoves = cleanMoves(movePath);
    performMoves(selectedPieceRow, selectedPieceCol, chainMoves);
  } else {
    // Perform the path of moves
    performMoves(selectedPieceRow, selectedPieceCol, movePath);
  }
  // Change players and start
  setCurrentPlayer("B");
  }



  return (
    <div>
      {/* <label> Row: </label>
      <input onChange={handleTurnRow}></input>
      <label> Col: </label>
      <input onChange={handleTurnCol}></input>
      <button onClick={handleGetMoves}>Choose piece and get moves</button>
      <br></br>
      <br></br>
      <label> Row: </label>
      <input onChange={handleSelectMoveRow}></input>
      <label> Col: </label>
      <input onChange={handleSelectMoveCol}></input>
      <button onClick={handlePerformMoves}>Perform moves</button> */}
      <Board
        board={JSON.parse(board)}
        possibleMoves={possibleMoves}
        onSelectPiece={handleSelectPiece}
        onBoardClick={handleBoardClick}
        onMoveClick={handleMoveClick}
      ></Board>
    </div>
  );
};
export default Game;

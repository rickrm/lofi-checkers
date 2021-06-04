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

// Get moves where the selected enemy/player piece must capture the enemy
const getCaptureMoves = (row, col, boardObj, isEnemy=false) => {
  // If both left and right side exists
  // Check left side is a B and can be jumped over
  let currentRowLeft = row;
  let currentColLeft = col;
  const rowIncrementor = isEnemy ? 1 : -1;
  const enemy = isEnemy ? "W" : "B";
  let moves = [];
  console.log({ boardObj});
  // Check left side and recursively call left
  if (
    boardObj[currentRowLeft + rowIncrementor] &&
    boardObj[currentRowLeft + 2 * rowIncrementor] &&
    boardObj[currentRowLeft + rowIncrementor][currentColLeft - 1] === enemy &&
    boardObj[currentRowLeft + 2 * rowIncrementor][currentColLeft - 2] === " "
  ) {
    currentRowLeft = currentRowLeft + 2 * rowIncrementor;
    currentColLeft = currentColLeft - 2;
    moves.push([currentRowLeft, currentColLeft]);
    moves = moves.concat(
      getCaptureMoves(currentRowLeft, currentColLeft, boardObj, isEnemy)
    );
  }

  // Check right side and recursively call right
  let currentRowRight = row;
  let currentColRight = col;
  if (
    boardObj[currentRowRight + rowIncrementor] &&
    boardObj[currentRowRight + 2 * rowIncrementor] &&
    boardObj[currentRowRight + rowIncrementor][currentColRight + 1] ===
    enemy &&
    boardObj[currentRowRight + 2 * rowIncrementor][currentColRight + 2] === " "
  ) {
    currentRowRight = currentRowRight + 2 * rowIncrementor;
    currentColRight = currentColRight + 2;
    moves.push([currentRowRight, currentColRight]);
    moves = moves.concat(
      getCaptureMoves(currentRowRight, currentColRight, boardObj, isEnemy)
    );
  }
  return moves;
};

// Get list of moves that makes a path to the selected move for the player/enemy
const getMovePath = (row, col, targetRow, targetCol, boardObj, isEnemy=false) => {
  // If both left and right side exists
  let moves = [];
  const rowIncrementor = isEnemy ? 1 : -1;
  const enemy = isEnemy ? "W" : "B";

  // If the move does not capture any enemies
  // Just return a path containing the move
  if (targetRow - row === rowIncrementor) {
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
    boardObj[currentRowLeft + rowIncrementor] &&
    boardObj[currentRowLeft + 2*rowIncrementor] &&
    boardObj[currentRowLeft + rowIncrementor][currentColLeft - 1] === enemy &&
    boardObj[currentRowLeft + 2*rowIncrementor][currentColLeft - 2] === " "
  ) {
    currentRowLeft = currentRowLeft + 2*rowIncrementor;
    currentColLeft = currentColLeft - 2;
    moves = moves.concat(
      getMovePath(
        currentRowLeft,
        currentColLeft,
        targetRow,
        targetCol,
        boardObj,
        isEnemy
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
    boardObj[currentRowRight + rowIncrementor] &&
    boardObj[currentRowRight + 2*rowIncrementor] &&
    boardObj[currentRowRight + rowIncrementor][currentColRight + 1] === enemy &&
    boardObj[currentRowRight + 2*rowIncrementor][currentColRight + 2] === " "
  ) {
    currentRowRight = currentRowRight + 2*rowIncrementor;
    currentColRight = currentColRight + 2;
    moves = moves.concat(
      getMovePath(
        currentRowRight,
        currentColRight,
        targetRow,
        targetCol,
        boardObj,
        isEnemy
      )
    );
    if (isTargetInPath(moves, targetRow, targetCol)) {
      moves.push([row, col]);
      return moves;
    }
  }

  return moves;
};

// Find possible moves for player or the enemy
const findPossibleMoves = (selectedRow, selectedCol, boardObj, isEnemy=false) => {
  let moves = [];
  const incrementor = isEnemy ? 1 : -1;

  // Checks for possible moves to capture enemies
  // If so, only show moves to capture enemies
  if (isEnemy) {
    const captureMoves = getCaptureMoves(
      selectedRow,
      selectedCol,
      boardObj,
      true
    );
    if (captureMoves.length !== 0) {
      return captureMoves;
    }
  } else {
    const captureMoves = getCaptureMoves(selectedRow, selectedCol, boardObj);
    console.log({ captureMoves });
    if (captureMoves.length !== 0) {
      return captureMoves;
    }
  }

  // Checks for vacant slots and add to array of available moves
  if (boardObj[selectedRow + incrementor]) {
    if (boardObj[selectedRow + incrementor][selectedCol - 1] === " ") {
      moves.push([selectedRow + incrementor, selectedCol - 1]);
    }

    if (boardObj[selectedRow + incrementor][selectedCol + 1] === " ") {
      moves.push([selectedRow + incrementor, selectedCol + 1]);
    }
  }

  return moves;
};

// Initialize checker pieces
const initializePieces = board => {
  board = board.map((val, index) => {
    if (index === 3 || index === 4) {
      return val;
    }

    if (index <= 2) {
      if (index % 2 === 0) {
        for (let i = 0; i < val.length; i++) {
          if (i % 2 === 0) {
            val[i] = "B";
          }
        }
      } else {
        for (let i = 0; i < val.length; i++) {
          if (i % 2 === 1) {
            val[i] = "B";
          }
        }
      }
    } else {
      if (index % 2 === 0) {
        for (let i = 0; i < val.length; i++) {
          if (i % 2 === 0) {
            val[i] = "W";
          }
        }
      } else {
        for (let i = 0; i < val.length; i++) {
          if (i % 2 === 1) {
            val[i] = "W";
          }
        }
      }
    }

    return val;
  });

  return board;
};


// Checks for win
// Returns the winner string if theres a winner
// Returns empty string if there is no winner
const evaluateWinner = board => {
  let enemyLeft = 0;
  let playerLeft = 0;
  // Check if the enemy or player no more pieces
  for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
    for (let colIndex = 0; colIndex < board[rowIndex].length; colIndex++) {
      const isPlayer = board[rowIndex][colIndex] === "W";
      const isEnemy = board[rowIndex][colIndex] === "B";
      playerLeft = isPlayer ? playerLeft + 1 : playerLeft;
      enemyLeft = isEnemy ? enemyLeft + 1 : enemyLeft;
    }
  }

  // If empty then return the winner
  if (playerLeft === 0) {
    return "B";
  } else if (enemyLeft === 0) {
    return "W";
  }

  // Check if the enemy or player no more moves
  let enemyMovesLeft = 0;
  let playerMovesLeft = 0;
  for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
    for (let colIndex = 0; colIndex < board[rowIndex].length; colIndex++) {
      const isPlayer = board[rowIndex][colIndex] === "W";
      const isEnemy = board[rowIndex][colIndex] === "B";

      if (isPlayer) {
        playerMovesLeft += findPossibleMoves(rowIndex, colIndex, board).length;
      } else if (isEnemy) {
        enemyMovesLeft += findPossibleMoves(
          rowIndex,
          colIndex,
          board,
          true
        ).length;
      }
    }
  }
  // If empty then return the winner
  if (playerMovesLeft === 0) {
    return "B";
  } else if (enemyMovesLeft === 0) {
    return "W";
  }

  return null;
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

    case "INITIALIZE":
      const { board } = action;
      return board;
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
  const [killPiece, setKillPiece] = useState(JSON.stringify([]));
  const [isKill, setIsKill] = useState(false);
  const [winner, setWinner] = useState(null);

  const [board, dispatchBoard] = useReducer(
    boardReducer,
    initializePieces([
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
    ])
  );

  /* Gameplay functions */

  // Get possible moves for enemies
  const getPossibleEnemyMoves = useCallback(
    (selectedRow, selectedCol) => {
      const boardObj = board;
      return findPossibleMoves(boardObj);
    },
    [board]
  );

  // Randomly select a piece for the enemy to move
  // Return the selected piece
  const enemySelectPiece = useCallback(() => {
    // Collect all pieces with valid moves
    const boardObj = board;
    let availablePieces = [];
    boardObj.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (
          value === "B" &&
          findPossibleMoves(rowIndex, colIndex, boardObj, true).length !== 0
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
    return pickedPiece;
  }, [board]);

  // Select the move for the selected enemy piece
  const enemySelectMove = useCallback(
    enemySelectedPiece => {
      const enemySelectedPieceObj = enemySelectedPiece;
      const possibleMoves = findPossibleMoves(
        enemySelectedPieceObj[0],
        enemySelectedPieceObj[1],
        true
      );

      // Randomly select a move
      const range = possibleMoves.length;
      if (possibleMoves.length !== 0) {
        const randomIndex = getRandomNumber(0, range - 1);
        const pickedMove = possibleMoves[randomIndex];
        selectMoveRow(pickedMove[0]);
        selectMoveCol(pickedMove[1]);

        // Uses the selected move and finds a path for the move
        const movePath = getMovePath(
          enemySelectedPieceObj[0],
          enemySelectedPieceObj[1],
          pickedMove[0],
          pickedMove[1],
          board,
          true
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
      // Evaluate winner
      const winner = evaluateWinner(board);
      setWinner(winner);
    },
    [board, currentPlayer]
  );
  // Get all possible moves given a selected row and column
  const getPossibleMoves = useCallback(
    (selectedRow, selectedCol) => {
      const boardObj = board;
      const possibleMoves = findPossibleMoves(
        selectedRow,
        selectedCol,
        boardObj
      );
      setPossibleMoves(possibleMoves);
    },
    [board]
  );

  /* Handlers */
  const handleStartDragPiece = useCallback(
    position => {
      console.log({ PICKED: position });
      const row = position[0];
      const col = position[1];
      selectPieceRow(row);
      selectPieceCol(col);
      getPossibleMoves(row, col);
    },
    [getPossibleMoves]
  );

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
    } else if (movePath.length === 1) {
      // Perform the path of moves
      dispatchBoard({
        type: "PERFORM",
        prevRow: selectedPieceRow,
        prevCol: selectedPieceCol,
        arr: movePath,
        currentPlayer,
      });
    }

    // Set kill mode off if it was true
    setIsKill(kill => {
      if (kill) {
        return !kill;
      }
    });

    // Evaluate winner
    const winner = evaluateWinner(board);
    setWinner(winner);

    // Change players and start
    setCurrentPlayer("B");
  };

  /* Side effects */

  //  Side effect for initializing the board state
  useEffect(() => {}, [board]);

  // Side effect for running the AI when players change
  useEffect(() => {
    const getAllPossibleMoves = () => {
      // Collect all pieces with valid moves
      for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
        for (let colIndex = 0; colIndex < board[rowIndex].length; colIndex++) {
          if (
            board[rowIndex][colIndex] === "W" &&
            getCaptureMoves(rowIndex, colIndex, board).length > 0
          ) {
            setIsKill(true);
            setKillPiece(JSON.stringify([rowIndex, colIndex]));
            return;
          }
        }
      }
    };
    const runAIMoves = () => {
      // Selects an enemy piece and select a move
      const enemySelectedPieceObj = enemySelectPiece();
      console.log({ enemySelectedPieceObj });
      if (!enemySelectedPieceObj) {
        setWinner("W");
        return;
      }
      enemySelectMove(enemySelectedPieceObj);
      setCurrentPlayer("W");
    };
    if (currentPlayer === "B") {
      setTimeout(() => {
        runAIMoves();
      }, 1000);
    } else {
      getAllPossibleMoves();
    }
  }, [
    currentPlayer,
    enemySelectMove,
    enemySelectPiece,
    board,
    getPossibleMoves,
  ]);

  return (
    <div>
      <Board
        board={board}
        possibleMoves={possibleMoves}
        onStartDragPiece={handleStartDragPiece}
        onEndDragPiece={handleEndDragPiece}
        onDrop={handleDrop}
        killPiece={JSON.parse(killPiece)}
        isKill={isKill}
      ></Board>
      {winner === "W" ? (
        <h1>You Win!</h1>
      ) : winner === "B" ? (
        <h1>You Lose</h1>
      ) : null}
      {currentPlayer === "W" ? (
        <h1>Your turn</h1>
      ) : (
        <h1> 🤔 Loading AI turn</h1>
      )}
    </div>
  );
};
export default Game;

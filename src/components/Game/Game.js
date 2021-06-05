import React, { useEffect, useState, useReducer, useCallback } from "react";
import Board from "../Board/Board";

/* Enumeration */
const Player = { main: "R", ai: "B" };
Object.freeze(Player);

export { Player };

/* Helper functions 
Functions used to help calculate and determine moves
*/

// Returns a random integer between an inclusive minimum and exclusive maximum
const getRandomNumber = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Returns true if the selected move is in the array of moves and false otherwise
const isSelectedMoveInPath = (moves, selectedMoveRow, selectedMoveCol) => {
  for (let move of moves) {
    if (move[0] === selectedMoveRow && move[1] === selectedMoveCol) {
      return true;
    }
  }
  return false;
};

// Returns an array of moves to execute to get to the selected move
const cleanMoves = moves => {
  moves = moves.reverse();
  moves = moves.slice(1);
  return moves;
};

// Get all the moves where the selected enemy/player piece can attack an enemy
const getAttackMoves = (pieceRow, pieceCol, board, isAI = false) => {
  // Check each side for enemies of the player/AI opponent

  const rowIncrementor = isAI ? 1 : -1;
  const enemy = isAI ? Player.main : Player.ai;
  let moves = [];

  // Check the left path for enemies to attack
  // and recursively call the function to explore other paths on the left
  let currentRowLeft = pieceRow;
  let currentColLeft = pieceCol;
  if (
    board[currentRowLeft + rowIncrementor] &&
    board[currentRowLeft + 2 * rowIncrementor] &&
    board[currentRowLeft + rowIncrementor][currentColLeft - 1] === enemy &&
    board[currentRowLeft + 2 * rowIncrementor][currentColLeft - 2] === " "
  ) {
    currentRowLeft = currentRowLeft + 2 * rowIncrementor;
    currentColLeft = currentColLeft - 2;
    moves.push([currentRowLeft, currentColLeft]);
    moves = moves.concat(
      getAttackMoves(currentRowLeft, currentColLeft, board, isAI)
    );
  }

  // Check the right path for enemies to attack
  // and recursively call the function to explore other paths on the right
  let currentRowRight = pieceRow;
  let currentColRight = pieceCol;
  if (
    board[currentRowRight + rowIncrementor] &&
    board[currentRowRight + 2 * rowIncrementor] &&
    board[currentRowRight + rowIncrementor][currentColRight + 1] === enemy &&
    board[currentRowRight + 2 * rowIncrementor][currentColRight + 2] === " "
  ) {
    currentRowRight = currentRowRight + 2 * rowIncrementor;
    currentColRight = currentColRight + 2;
    moves.push([currentRowRight, currentColRight]);
    moves = moves.concat(
      getAttackMoves(currentRowRight, currentColRight, board, isAI)
    );
  }
  return moves;
};

// Get a list of moves to execute up to the target move for the player/AI opponent
const getMovePath = (
  pieceRow,
  pieceCol,
  selectedMoveRow,
  selectedMoveCol,
  board,
  isAI = false
) => {
  let moves = [];
  const rowIncrementor = isAI ? 1 : -1;
  const enemy = isAI ? Player.main : Player.ai;

  // If the move does not capture any enemies
  // Just return a path containing the target move
  if (selectedMoveRow - pieceRow === rowIncrementor) {
    moves.push([selectedMoveRow, selectedMoveCol]);
    return moves;
  }

  // If we found the selected move then end recursion
  if (pieceRow === selectedMoveRow && pieceCol === selectedMoveCol) {
    moves.push([selectedMoveRow, selectedMoveCol]);
    return moves;
  }

  // Check the left path for the selected move
  // and recursively call the left side to explore other paths
  let currentRowLeft = pieceRow;
  let currentColLeft = pieceCol;
  if (
    board[currentRowLeft + rowIncrementor] &&
    board[currentRowLeft + 2 * rowIncrementor] &&
    board[currentRowLeft + rowIncrementor][currentColLeft - 1] === enemy &&
    board[currentRowLeft + 2 * rowIncrementor][currentColLeft - 2] === " "
  ) {
    currentRowLeft = currentRowLeft + 2 * rowIncrementor;
    currentColLeft = currentColLeft - 2;
    moves = moves.concat(
      getMovePath(
        currentRowLeft,
        currentColLeft,
        selectedMoveRow,
        selectedMoveCol,
        board,
        isAI
      )
    );

    if (isSelectedMoveInPath(moves, selectedMoveRow, selectedMoveCol)) {
      moves.push([pieceRow, pieceCol]);
      return moves;
    }
  }

  // Check the right path for the selected move
  // and recursively call the right side to explore other paths
  let currentRowRight = pieceRow;
  let currentColRight = pieceCol;
  if (
    board[currentRowRight + rowIncrementor] &&
    board[currentRowRight + 2 * rowIncrementor] &&
    board[currentRowRight + rowIncrementor][currentColRight + 1] === enemy &&
    board[currentRowRight + 2 * rowIncrementor][currentColRight + 2] === " "
  ) {
    currentRowRight = currentRowRight + 2 * rowIncrementor;
    currentColRight = currentColRight + 2;
    moves = moves.concat(
      getMovePath(
        currentRowRight,
        currentColRight,
        selectedMoveRow,
        selectedMoveCol,
        board,
        isAI
      )
    );
    if (isSelectedMoveInPath(moves, selectedMoveRow, selectedMoveCol)) {
      moves.push([pieceRow, pieceCol]);
      return moves;
    }
  }

  return moves;
};

// Finds all possible moves for the player/AI Opponent given a piece
const findPossibleMoves = (
  selectedRow,
  selectedCol,
  boardObj,
  isAI = false
) => {
  let moves = [];
  const incrementor = isAI ? 1 : -1;

  // Checks for possible moves to capture enemies
  // If so, return the moves to capture enemies, since player/AI can only capture enemies
  const attackMoves = isAI
    ? getAttackMoves(selectedRow, selectedCol, boardObj, isAI)
    : getAttackMoves(selectedRow, selectedCol, boardObj);

  if (attackMoves.length !== 0) {
    return attackMoves;
  }

  // Looking for single step moves
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

// Initializes checker pieces to the standard board
const initializePieces = board => {
  board = board.map((val, index) => {
    if (index === 3 || index === 4) {
      return val;
    }

    // rows 0 - 2 must have the AI opponents pieces
    if (index <= 2) {
      // Place pieces on odd squares if the row is even
      // and pieces on even squares if the row is odd
      if (index % 2 === 0) {
        for (let i = 0; i < val.length; i++) {
          if (i % 2 === 1) {
            val[i] = Player.ai;
          }
        }
      } else {
        for (let i = 0; i < val.length; i++) {
          if (i % 2 === 0) {
            val[i] = Player.ai;
          }
        }
      }
      // rows 5 - 7 must have the player's pieces
    } else {
      // Place pieces on odd squares if the row is even
      // and pieces on even squares if the row is odd
      if (index % 2 === 0) {
        for (let i = 0; i < val.length; i++) {
          if (i % 2 === 1) {
            val[i] = Player.main;
          }
        }
      } else {
        for (let i = 0; i < val.length; i++) {
          if (i % 2 === 0) {
            val[i] = Player.main;
          }
        }
      }
    }

    return val;
  });

  return board;
};

// Checks for win conditions
// Returns the winner string if theres a winner
// Returns null if there is no winner
const evaluateWinner = board => {
  // Check if the AI/player has no more pieces left
  let enemyLeft = 0;
  let playerLeft = 0;
  for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
    for (let colIndex = 0; colIndex < board[rowIndex].length; colIndex++) {
      const isPlayer = board[rowIndex][colIndex] === Player.main;
      const isEnemy = board[rowIndex][colIndex] === Player.ai;
      playerLeft = isPlayer ? playerLeft + 1 : playerLeft;
      enemyLeft = isEnemy ? enemyLeft + 1 : enemyLeft;
    }
  }

  // If empty then return the side that has pieces still left
  if (playerLeft === 0) {
    return Player.ai;
  } else if (enemyLeft === 0) {
    return Player.main;
  }

  // Check if the AI/player has no more moves
  let enemyMovesLeft = 0;
  let playerMovesLeft = 0;
  for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
    for (let colIndex = 0; colIndex < board[rowIndex].length; colIndex++) {
      const isPlayer = board[rowIndex][colIndex] === Player.main;
      const isEnemy = board[rowIndex][colIndex] === Player.ai;

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

  // If empty then return the side with turns left
  if (playerMovesLeft === 0) {
    return Player.ai;
  } else if (enemyMovesLeft === 0) {
    return Player.main;
  }

  return null;
};

// Reducer for managing the board's state
const boardReducer = (prevBoard, action) => {
  switch (action.type) {
    // Takes in an array of moves and performs each move
    case "PERFORM":
      const { prevRow, prevCol, arr, currentPlayer } = action;
      let currRow = prevRow;
      let currCol = prevCol;
      prevBoard[currRow][currCol] = " ";

      // Loops over the array of moves and perform each move
      for (let move of arr) {
        const nextRow = move[0];
        const nextCol = move[1];
        const isLeft = nextCol - currCol === -2;
        const isRight = nextCol - currCol === 2;

        // AI pieces move down the board array
        // so their next row is always larger
        const isAI = nextRow - currRow > 0;

        // Capture the enemy depending if the piece jumps to the left or right
        if (isLeft) {
          if (isAI) {
            prevBoard[currRow + 1][currCol - 1] = " ";
          } else {
            prevBoard[currRow - 1][currCol - 1] = " ";
          }
        } else if (isRight) {
          if (isAI) {
            prevBoard[currRow + 1][currCol + 1] = " ";
          } else {
            prevBoard[currRow - 1][currCol + 1] = " ";
          }
        }

        currRow = nextRow;
        currCol = nextCol;
      }
      prevBoard[currRow][currCol] = currentPlayer;
      return prevBoard;

    // Initializes the board
    case "INITIALIZE":
      const { board } = action;
      return board;
    default:
      console.log("Error: wrong type");
      break;
  }
};

const Game = () => {
  /* States and variables 

  --- State Data ---
  selectedPiece, selectedMove: [row,col]
  possibleMoves, attackPieces: [[row, col]]
  currentPlayer: Player.ai or Player.main
  isAttackTurn: Boolean
  winner: Player.ai or Player.main
  board: [[String]]
  */

  const [selectedPiece, selectPiece] = useState(null);
  const [selectedMove, selectMove] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(Player.main);
  const [attackPieces, setAttackPieces] = useState(JSON.stringify([]));
  const [isAttackTurn, setAttackTurnStatus] = useState(false);
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

  /* Gameplay functions 
  Functions that run the logic and interactions of the game

  Note: The use of useCallback is to maintain 
  reference equality in dependencies in useEffect
  */

  // Get possible moves for AI
  const getPossibleAIMoves = useCallback(
    (selectedRow, selectedCol) => {
      return findPossibleMoves(selectedRow, selectedCol, board, true);
    },
    [board]
  );

  // Randomly select a piece for the AI to move
  const AISelectPiece = useCallback(() => {
    // Collect all AI pieces with valid moves
    const availablePieces = [];
    board.forEach((row, rowIndex) => {
      row.forEach((piece, colIndex) => {
        if (
          piece === Player.ai &&
          findPossibleMoves(rowIndex, colIndex, board, true).length !== 0
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
  const AISelectMove = useCallback(
    AISelectedPiece => {
      const AISelectedPieceRow = AISelectedPiece[0];
      const AISelectedPieceCol = AISelectedPiece[1];
      // Get all possible AI moves
      const possibleMoves = getPossibleAIMoves(
        AISelectedPieceRow,
        AISelectedPieceCol
      );

      // Randomly select a move
      const range = possibleMoves.length;
      if (possibleMoves.length !== 0) {
        const randomIndex = getRandomNumber(0, range - 1);
        const pickedMove = possibleMoves[randomIndex];
        const pickedMoveRow = pickedMove[0];
        const pickedMoveCol = pickedMove[1];
        selectMove([pickedMoveRow, pickedMoveCol]);

        // Uses the selected move and finds a path for the move
        const movePath = getMovePath(
          AISelectedPieceRow,
          AISelectedPieceCol,
          pickedMoveRow,
          pickedMoveCol,
          board,
          true
        );

        // If there are moves before the selected move,
        // clean the array, so it can perform the right moves in order
        if (movePath.length > 1) {
          const chainMoves = cleanMoves(movePath);
          dispatchBoard({
            type: "PERFORM",
            prevRow: AISelectedPieceRow,
            prevCol: AISelectedPieceCol,
            arr: chainMoves,
            currentPlayer,
          });
        } else {
          dispatchBoard({
            type: "PERFORM",
            prevRow: AISelectedPieceRow,
            prevCol: AISelectedPieceCol,
            arr: movePath,
            currentPlayer,
          });
        }
      }
      // Evaluate winner
      const winner = evaluateWinner(board);
      setWinner(winner);
    },
    [board, currentPlayer, getPossibleAIMoves]
  );

  // Get all possible moves given a selected row and column
  const getPossibleMoves = useCallback(
    (selectedRow, selectedCol) => {
      const possibleMoves = findPossibleMoves(
        selectedRow,
        selectedCol,
        board,
      );
      setPossibleMoves(possibleMoves);
    },
    [board]
  );

  /* Handlers */

  // Select piece and get possible moves on drag of a piece
  const handleStartDragPiece = useCallback(
    piece => {
      const pieceRow = piece[0];
      const pieceCol = piece[1];
      selectPiece([pieceRow, pieceCol]);
      getPossibleMoves(pieceRow, pieceCol);
    },
    [getPossibleMoves]
  );

  const handleEndDragPiece = () => {
    setPossibleMoves([]);
  };

  // Perform the selected move when the player drops the piece
  const handleDrop = move => {
    const selectedPieceRow = selectedPiece[0];
    const selectedPieceCol = selectedPiece[1];
    const selectedMoveRow = move[0];
    const selectedMoveCol = move[1];
    selectMove([selectedMoveRow, selectedMoveCol]);

    // Uses the selected move and finds a path for the move
    const movePath = getMovePath(
      selectedPieceRow,
      selectedPieceCol,
      selectedMoveRow,
      selectedMoveCol,
      board
    );

    // If there are moves before the selected move,
    // clean the array, so it can perform the right moves in order
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
      dispatchBoard({
        type: "PERFORM",
        prevRow: selectedPieceRow,
        prevCol: selectedPieceCol,
        arr: movePath,
        currentPlayer,
      });
    }

    // Set kill mode off if it was true
    setAttackTurnStatus(false);

    // Evaluate winner
    const winner = evaluateWinner(board);
    setWinner(winner);

    // Change players
    setCurrentPlayer(Player.ai);
  };

  /* Side effects */

  // Reset possible moves when updating selected move
  useEffect(() => {
    if (selectedMove) {
      setPossibleMoves([]);
    }
  }, [selectedMove]);

  // Get possible moves when selecting a piece
  useEffect(() => {
    if (selectedPiece) {
      getPossibleMoves(selectedPiece[0], selectedPiece[1]);
    }
  }, [selectedPiece, getPossibleMoves]);

  // Clear attack pieces when it is not an attack turn
  useEffect(() => {
    if (!isAttackTurn) {
      setAttackPieces(JSON.stringify([]));
      setPossibleMoves([]);
    }
  }, [isAttackTurn]);

  // Side effect for running the AI when players change
  useEffect(() => {
    /* useEffect Helpers */
    const findAttackPieces = () => {
      // Collect all pieces with valid moves
      const attackPiecesArr = [];
      for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
        for (let colIndex = 0; colIndex < board[rowIndex].length; colIndex++) {
          // If the piece has attack moves then it is an attack piece
          if (
            board[rowIndex][colIndex] === Player.main &&
            getAttackMoves(rowIndex, colIndex, board).length > 0
          ) {
            attackPiecesArr.push([rowIndex, colIndex]);
          }
        }
      }

      // Update attack piece states
      if (attackPiecesArr.length !== 0) {
        setAttackTurnStatus(true);
        setAttackPieces(JSON.stringify(attackPiecesArr));
      }
    };

    const runAIMoves = () => {
      // Selects a piece and select a move
      const AISelectedPiece = AISelectPiece();
      if (!AISelectedPiece) {
        setWinner(Player.main);
        return;
      }
      AISelectMove(AISelectedPiece);

      setCurrentPlayer(Player.main);
    };

    // If the current player is the AI run the turn process
    // Otherwise, find attack pieces for the main players turn
    if (currentPlayer === Player.ai) {
      setTimeout(() => {
        runAIMoves();
      }, 1500);
    } else {
      findAttackPieces();
    }
  }, [currentPlayer, AISelectPiece, AISelectMove, getPossibleMoves, board]);

  return (
    <div>
      <Board
        board={board}
        currentPlayer={currentPlayer}
        possibleMoves={possibleMoves}
        onStartDragPiece={handleStartDragPiece}
        onEndDragPiece={handleEndDragPiece}
        onDrop={handleDrop}
        attackPieces={JSON.parse(attackPieces)}
        isAttackTurn={isAttackTurn}
      ></Board>
      {winner === Player.main ? (
        <h1>You Win!</h1>
      ) : winner === Player.ai ? (
        <h1>You Lose</h1>
      ) : null}
      {currentPlayer === Player.main ? (
        <h1>Your turn</h1>
      ) : (
        <h1> 🤔 Loading AI turn</h1>
      )}
    </div>
  );
};
export default Game;

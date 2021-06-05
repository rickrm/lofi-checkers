import React from "react";
import Square from "../Square/Square";
import "./Board.css";

// Checks if a piece is in attackPieces and
// returns true if so and returns false otherwise
const isPieceAttacking = (attackPieces, piece) => {
  for (const attackPiece of attackPieces) {
    const attackPieceRow = attackPiece[0];
    const attackPieceCol = attackPiece[1];
    
    const pieceRow = piece[0];
    const pieceCol = piece[1];

    if (attackPieceRow === pieceRow && attackPieceCol === pieceCol) {
      return true;
    }
  }
  return false;
}

// Checks if a piece is in attackPieces and
// returns true if so and returns false otherwise
const isPossibleMove = (possibleMoves, square) => {
  const squareRow = square[0];
  const squareCol = square[1];

  for (let move of possibleMoves) {
    const moveRow = move[0];
    const moveCol = move[1];
    if (moveRow === squareRow && moveCol === squareCol) {
      return true;
    }
  }
  return false;
};
const Board = ({
  board,
  currentPlayer,
  onStartDragPiece,
  onEndDragPiece,
  possibleMoves,
  onDrop,
  attackPieces,
  isAttackTurn
}) => {

  // Maps each entry in board to a Square component
  const renderBoard = () => {
    const squares = [];
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {

        const move = [row, col];
        squares.push(
          <Square
            key={move}
            row={row}
            col={col}
            currentPlayer={currentPlayer}
            piece={board[row][col]}
            onStartDragPiece={onStartDragPiece}
            onEndDragPiece={onEndDragPiece}
            onDrop={onDrop}
            isPossible={isPossibleMove(possibleMoves, [row, col])}
            isAttackPiece={isPieceAttacking(attackPieces, [row, col])}
            isAttackTurn={isAttackTurn}
          ></Square>
        );
      }
    }
    return squares;
  };
  return <div className="board">{renderBoard()}</div>;
};

export default Board;

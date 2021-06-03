import React from "react";
import Square from "../Square/Square";
import "./Board.css";

const Board = ({ board, onSelectPiece, possibleMoves, onBoardClick, onMoveClick }) => {
  const isPossibleMove = position => {
    for (let move of possibleMoves) {
      if (move[0] === position[0] && move[1] === position[1]) {
        return true;
      }
    }
    return false;
  };
  const renderBoard = () => {
    const squares = [];
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        squares.push(
          <Square
            position={[row, col]}
            value={board[row][col]}
            onSelectPiece={onSelectPiece}
            onMoveClick={onMoveClick}
            isPossible={isPossibleMove([row, col])}
          ></Square>
        );
      }
    }
    return squares;
  };
  return <div onClick={onBoardClick} className="board">{renderBoard()}</div>;
};

export default Board;

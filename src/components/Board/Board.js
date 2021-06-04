import React from "react";
import Square from "../Square/Square";
import "./Board.css";

const Board = ({ board, onStartDragPiece, onEndDragPiece, possibleMoves,  onMoveClick }) => {
  const isPossibleMove = position => {
    for (let move of possibleMoves) {
      if (move[0] === position[0] && move[1] === position[1]) {
        return true;
      }
    }
    return false;
  };
  const renderBoard = () => {
    console.log({ board });
    const squares = [];
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        squares.push(
          <Square
            key={[row, col]}
            position={[row, col]}
            value={board[row][col]}
            onStartDragPiece={onStartDragPiece}
            onEndDragPiece={onEndDragPiece}
            onMoveClick={onMoveClick}
            isPossible={isPossibleMove([row, col])}
          ></Square>
        );
      }
    }
    return squares;
  };
  return <div className="board">{renderBoard()}</div>;
};

export default Board;

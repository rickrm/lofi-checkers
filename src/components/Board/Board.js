import React from "react";
import Square from "../Square/Square";
import "./Board.css";

const Board = ({
  board,
  currentPlayer,
  onStartDragPiece,
  onEndDragPiece,
  possibleMoves,
  onDrop,
  killPiece,
  isKill
}) => {
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

        const move = [row, col];
        squares.push(
          <Square
            key={move}
            row={row}
            col={col}
            currentPlayer={currentPlayer}
            value={board[row][col]}
            onStartDragPiece={onStartDragPiece}
            onEndDragPiece={onEndDragPiece}
            onDrop={onDrop}
            isPossible={isPossibleMove([row, col])}
            isKillPiece={killPiece[0] === row && killPiece[1] === col}
            isKill={isKill}
          ></Square>
        );
      }
    }
    return squares;
  };
  return <div className="board">{renderBoard()}</div>;
};

export default Board;

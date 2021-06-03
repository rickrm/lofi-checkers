import React from "react";
import Piece from "../Piece/Piece";
import "./Square.css";

const Square = ({ position, value, onSelectPiece, isPossible, onMoveClick }) => {
  const isRed =
    position[0] % 2 === 0 ? position[1] % 2 === 0 : position[1] % 2 === 1;

  const squareClass = "square " + (isRed ? "red-square" : "black-square");

  return (
    <>
      {isPossible ? (
        <div onClick={() => onMoveClick(position)} className="square isPossible-square"></div>
      ) : (
        <div className={squareClass}>
          <Piece
            onSelectPiece={onSelectPiece}
            position={position}
            type={value}
          ></Piece>
        </div>
      )}
    </>
  );
};

export default Square;

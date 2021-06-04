import React, { useRef, useEffect, useState } from "react";
import Piece from "../Piece/Piece";
import "./Square.css";

const Square = ({
  position,
  value,
  onStartDragPiece,
  onEndDragPiece,
  isPossible,
  onMoveClick,
}) => {
  const pieceRef = useRef(null);
  const possibleRef = useRef(null);
  const isRed =
    position[0] % 2 === 0 ? position[1] % 2 === 0 : position[1] % 2 === 1;

  const squareClass = "square " + (isRed ? "red-square" : "black-square");

  useEffect(() => {
    const handleDragStart = (e) => {
      onStartDragPiece(position);
      pieceRef.current.className = "piece red-piece chosen";
    };
    const handleDragEnd = () => {
      setTimeout(() => {
        if (pieceRef.current) {
          pieceRef.current.className = "piece red-piece";
        }
      }, 0);
      onEndDragPiece();
    };
    if (pieceRef.current) {
      console.log("jojo", position);
      const pieceDOM = pieceRef.current;
      pieceDOM.addEventListener("dragstart", handleDragStart);
      pieceDOM.addEventListener("dragend", handleDragEnd);

      return () => {
        pieceDOM.removeEventListener("dragstart", handleDragStart);
      };
    }
  }, [onEndDragPiece, onStartDragPiece, position]);

  useEffect(() => {
    const handleDragDrop = () => {
      onMoveClick(position);
    };
    if (possibleRef.current) {
      const possibleDOM = possibleRef.current;
      possibleDOM.addEventListener("dragover", handleDragOver);
      possibleDOM.addEventListener("dragenter", handleDragEnter);
      possibleDOM.addEventListener("dragleave", handleDragLeave);
      possibleDOM.addEventListener("drop", handleDragDrop);

      return () => {
        possibleDOM.removeEventListener("dragover", handleDragOver);
        possibleDOM.removeEventListener("dragenter", handleDragEnter);
        possibleDOM.removeEventListener("dragleave", handleDragLeave);
        possibleDOM.removeEventListener("drop", handleDragDrop);
      };
    }
  }, [isPossible, possibleRef, position, onMoveClick]);

  const handleDragOver = e => {
    e.preventDefault();
  };

  const handleDragEnter = e => {
    e.preventDefault();
    possibleRef.current.className += "hovering";
  };

  const handleDragLeave = () => {
    possibleRef.current.className = "square isPossible-square";
  };


  return (
    <>
      {isPossible ? (
        <div ref={possibleRef} className="square isPossible-square"></div>
      ) : (
        <div className={squareClass}>
          <Piece position={position} type={value} ref={pieceRef}></Piece>
        </div>
      )}
    </>
  );
};

export default Square;

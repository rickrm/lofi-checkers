import React, { useRef, useEffect } from "react";
import Piece from "../Piece/Piece";
import "./Square.css";

const Square = ({
  row,
  col,
  value,
  onStartDragPiece,
  onEndDragPiece,
  isPossible,
  onDrop,
  isKillPiece,
  isKill
}) => {
  const pieceRef = useRef(null);
  const possibleRef = useRef(null);
  const isRed = row % 2 === 0 ? col % 2 === 0 : col % 2 === 1;

  //  TODO: fix squares
  const squareClass = "square " + (isRed ? "dark-square" : "light-square");

  useEffect(() => {
    const handleDragStart = e => {
      console.log("chosen")
      onStartDragPiece([row, col]);
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
      console.log("rem")
      const pieceDOM = pieceRef.current;
      pieceDOM.addEventListener("dragstart", handleDragStart);
      pieceDOM.addEventListener("dragend", handleDragEnd);

      return () => {
        pieceDOM.removeEventListener("dragstart", handleDragStart);
        pieceDOM.removeEventListener("dragend", handleDragEnd);
      };
    }
  }, [isPossible, onStartDragPiece, onEndDragPiece, row, col, isKillPiece]);

  useEffect(() => {
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
    if (possibleRef.current) {
      const possibleDOM = possibleRef.current;
      possibleDOM.addEventListener("dragover", handleDragOver);
      possibleDOM.addEventListener("dragenter", handleDragEnter);
      possibleDOM.addEventListener("dragleave", handleDragLeave);
      possibleDOM.addEventListener("drop", () => onDrop([row, col]));

      return () => {
        possibleDOM.removeEventListener("dragover", handleDragOver);
        possibleDOM.removeEventListener("dragenter", handleDragEnter);
        possibleDOM.removeEventListener("dragleave", handleDragLeave);
        possibleDOM.removeEventListener("drop", () => onDrop([row, col]));
      };
    }
  });

  return (
    <>
      {isPossible ? (
        <div ref={possibleRef} className="square isPossible-square"></div>
      ) : (
        <div className={squareClass}>
          <Piece isKill={isKill} isKillPiece={isKillPiece} type={value} ref={pieceRef}></Piece>
        </div>
      )}
    </>
  );
};

export default Square;

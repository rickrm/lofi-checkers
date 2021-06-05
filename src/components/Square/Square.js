import React, { useRef, useEffect } from "react";
import Piece from "../Piece/Piece";
import "./Square.css";

const Square = ({
  row,
  col,
  value,
  currentPlayer,
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
    const handleInteractStart = e => {
      console.log("dragstart")
      onStartDragPiece([row, col]);
      pieceRef.current.className = "piece red-piece chosen";
    };
    const handleInteractEnd = () => {


      setTimeout(() => {
        console.log("dragend")
        if (pieceRef.current) {
          pieceRef.current.className = "piece red-piece";
        }
      }, 0);
      onEndDragPiece();
    };
    if (pieceRef.current && currentPlayer === "W") {
      const pieceDOM = pieceRef.current;
      pieceDOM.addEventListener("dragstart", handleInteractStart);
      pieceDOM.addEventListener("mouseover", handleInteractStart);
      pieceDOM.addEventListener("dragend", handleInteractEnd);
      pieceDOM.addEventListener("mouseleave", handleInteractEnd);

      return () => {
        pieceDOM.removeEventListener("dragstart", handleInteractStart);
        pieceDOM.removeEventListener("mouseover", handleInteractStart);
        pieceDOM.removeEventListener("dragend", handleInteractEnd);
        pieceDOM.removeEventListener("mouseleave", handleInteractEnd);

      };
    }
  }, [isPossible, onStartDragPiece, onEndDragPiece, row, col, isKillPiece, currentPlayer]);

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

    const onDragDrop = () => {
      onDrop([row, col]);
    }


    if (possibleRef.current) {
      const possibleDOM = possibleRef.current;
      possibleDOM.addEventListener("dragover", handleDragOver);
      possibleDOM.addEventListener("dragenter", handleDragEnter);
      possibleDOM.addEventListener("dragleave", handleDragLeave);
      possibleDOM.addEventListener("drop", onDragDrop);

      return () => {
        possibleDOM.removeEventListener("dragover", handleDragOver);
        possibleDOM.removeEventListener("dragenter", handleDragEnter);
        possibleDOM.removeEventListener("dragleave", handleDragLeave);
        possibleDOM.removeEventListener("drop", onDragDrop);
      };
    }
  }, [isPossible, row, col]);

  return (
    <>
      {isPossible ? (
        <div ref={possibleRef} className="square isPossible-square"></div>
      ) : (
        <div className={squareClass}>
          <Piece isKill={isKill} isKillPiece={isKillPiece} currentPlayer={currentPlayer} type={value} ref={pieceRef}></Piece>
        </div>
      )}
    </>
  );
};

export default Square;

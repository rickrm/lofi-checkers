import React, { useRef, useEffect } from "react";
import Piece from "../Piece/Piece";
import { Player } from '../Game/Game';
import "./Square.css";

const Square = ({
  row,
  col,
  piece,
  currentPlayer,
  onStartDragPiece,
  onEndDragPiece,
  isPossible,
  onDrop,
  isAttackPiece,
  isAttackTurn,
}) => {
  const pieceRef = useRef(null);
  const possibleRef = useRef(null);

  // Styling the squares for a checkerboard
  const isDarkSquare = row % 2 === 0 ? col % 2 === 1 : col % 2 === 0;
  const squareClass =
    "square " + (isDarkSquare ? "dark-square" : "light-square");

  /* Side Effects */

  // Initializing event handling for pieces
  useEffect(() => {
    /* useEffect Handlers */

    const handleInteractStart = e => {
      onStartDragPiece([row, col]);
      pieceRef.current.className = isAttackPiece
        ? "piece red-piece chosen-piece killer-piece"
        : "piece red-piece chosen-piece hovering-piece";
    };

    const handleInteractEnd = () => {
      onEndDragPiece();
      setTimeout(() => {
        if (pieceRef.current) {
          pieceRef.current.className = isAttackPiece
            ? "piece red-piece killer-piece"
            : "piece red-piece";
        }
      }, 0);
    };

    if (
      pieceRef.current &&
      currentPlayer === Player.main &&
      (!isAttackTurn || isAttackPiece)
    ) {
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
  }, [
    isPossible,
    onStartDragPiece,
    onEndDragPiece,
    row,
    col,
    isAttackPiece,
    currentPlayer,
    isAttackTurn,
  ]);

  // Initializing event handling for dragging and dropping
  // pieces onto possible moves
  useEffect(() => {
    /* useEffect Handlers */

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
    };

    // Adding listeners for drag and dropping pieces to possible moves
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
  }, [isPossible, row, col, onDrop]);

  return (
    <>
      {isPossible ? (
        <div ref={possibleRef} className="square isPossible-square"></div>
      ) : (
        <div className={squareClass}>
          <Piece
            isAttackTurn={isAttackTurn}
            isAttackPiece={isAttackPiece}
            currentPlayer={currentPlayer}
            piece={piece}
            ref={pieceRef}
          ></Piece>
        </div>
      )}
    </>
  );
};

export default Square;

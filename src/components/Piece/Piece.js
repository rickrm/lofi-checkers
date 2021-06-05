import React, { forwardRef } from "react";
import { Player } from "../Game/Game";
import "./Piece.css";
const Piece = forwardRef(
  ({ piece, currentPlayer, isAttackTurn, isAttackPiece, winner }, ref) => {
    const getPieceClass = () => {
      if (isAttackPiece) {
        return (
          "piece " +
          (piece === Player.ai
            ? "black-piece killer-piece"
            : "red-piece killer-piece")
        );
      } else {
        return "piece " + (piece === Player.ai ? "black-piece" : "red-piece");
      }
    };
    const isDraggable =
      !winner && piece !== Player.ai &&
      currentPlayer === Player.main &&
      (isAttackPiece || !isAttackTurn);

    const isPiece = piece !== " ";

    return (
      <>
        {isPiece && (
          <div
            ref={piece === Player.ai ? null : ref}
            draggable={isDraggable}
            onClick={e => {
              e.stopPropagation();
              if (piece === Player.ai) {
                return;
              }
            }}
            className={getPieceClass()}
          ></div>
        )}
      </>
    );
  }
);

export default Piece;

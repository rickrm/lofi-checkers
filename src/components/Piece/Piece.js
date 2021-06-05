import React, { forwardRef } from "react";
import { Player } from '../Game/Game';
import "./Piece.css";
const Piece = forwardRef(
  ({ piece, currentPlayer, isAttackTurn, isAttackPiece }, ref) => {
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
      piece !== Player.ai &&
      currentPlayer === Player.main &&
      (isAttackPiece || !isAttackTurn);

    return (
      <>
        {piece !== " " && (
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

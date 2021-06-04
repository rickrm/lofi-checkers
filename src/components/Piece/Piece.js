import React, { forwardRef } from "react";
import "./Piece.css";
const Piece = forwardRef(({ type, isKill, isKillPiece }, ref) => {
  const getPieceClass = () => {
    if (isKillPiece) {
      return (
        "piece " + (type === "B" ? "black-piece killer" : "red-piece killer")
      );
    } else {
      return "piece " + (type === "B" ? "black-piece" : "red-piece");
    }
  };

  return (
    <>
      {type !== " " && (
        <div
          ref={type === "B" ? null : ref}
          draggable={type !== "B" && (isKillPiece || !isKill)}
          onClick={e => {
            e.stopPropagation();
            if (type === "B") {
              return;
            }
          }}
          className={getPieceClass()}
        ></div>
      )}
    </>
  );
});

export default Piece;

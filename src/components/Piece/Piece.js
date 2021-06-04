import React, {forwardRef} from "react";
import "./Piece.css";

const Piece = forwardRef(({ type }, ref) => {
  const pieceClass = "piece " + (type === "B" ? "black-piece" : "red-piece");
  return (
    <>
      {type !== " " && (
        <div
        ref={type === "B" ? null : ref}
          draggable="true"
          onClick={e => {
            e.stopPropagation();
            if (type === "B") {
                return;
            }
          }}
          className={pieceClass}
        ></div>
      )}
    </>
  );
});

export default Piece;

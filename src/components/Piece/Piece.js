import React from 'react'
import './Piece.css'

const Piece = ({ type, onSelectPiece, position }) => {

    const pieceClass = "piece " +  (type === "B" ? "black-piece" : "red-piece");
    return (
        <>

        { type !== " " && <div onClick={(e) => {e.stopPropagation(); onSelectPiece(position);}} className={pieceClass}></div>}
        </>
    )
}

export default Piece

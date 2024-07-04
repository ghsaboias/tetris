import React from "react";
import "../app/globals.css";

const Board = ({ board }) => {
  console.log(board);
  return (
    <div className="board">
      {board.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className={`${cell ? `type${cell}` : ""} cell`}
          />
        ))
      )}
    </div>
  );
};

export default Board;

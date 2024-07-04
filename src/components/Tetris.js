"use client";
import React, { useState, useEffect, useCallback } from "react";
import Board from "./Board";
import "../app/globals.css";

const pieces = {
  0: [
    [1, 1],
    [1, 1],
  ],
  1: [[2, 2, 2, 2]],
  2: [
    [3, 3, 0],
    [0, 3, 3],
  ],
  3: [
    [0, 4, 4],
    [4, 4, 0],
  ],
  4: [
    [5, 5, 5],
    [0, 5, 0],
  ],
  5: [
    [6, 6, 6],
    [6, 0, 0],
  ],
  6: [
    [7, 7, 7],
    [0, 0, 7],
  ],
};

const Tetris = () => {
  const emptyBoard = Array.from({ length: 20 }, () => Array(10).fill(0));

  const [board, setBoard] = useState(emptyBoard);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPiece, setCurrentPiece] = useState(null);
  const [piecePosition, setPiecePosition] = useState({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const placePiece = useCallback((board, piece, position) => {
    const newBoard = board.map((row) => row.slice());
    piece.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value !== 0) {
          newBoard[position.y + rowIndex][position.x + colIndex] = value;
        }
      });
    });
    return newBoard;
  }, []);

  const checkAndRemoveFullRows = useCallback((board) => {
    const newBoard = board.filter((row) => row.some((cell) => cell === 0));
    const rowsRemoved = 20 - newBoard.length;
    const emptyRows = Array.from({ length: rowsRemoved }, () =>
      Array(10).fill(0)
    );
    setScore((prevScore) => prevScore + rowsRemoved * 100); // Update score
    return emptyRows.concat(newBoard);
  }, []);

  const drop = useCallback(() => {
    if (currentPiece) {
      const newPosition = { ...piecePosition, y: piecePosition.y + 1 };
      if (!isValidMove(board, currentPiece, newPosition)) {
        const newBoard = placePiece(board, currentPiece, piecePosition);
        const clearedBoard = checkAndRemoveFullRows(newBoard);
        setBoard(clearedBoard);
        const nextPiece = pieces[Math.floor(Math.random() * 7)];
        setCurrentPiece(nextPiece);
        setPiecePosition({ x: 3, y: 0 });
        if (!isValidMove(clearedBoard, nextPiece, { x: 3, y: 0 })) {
          setIsRunning(false); // Game over
          setGameOver(true); // Set game over state
        }
      } else {
        setPiecePosition(newPosition);
      }
    }
  }, [board, currentPiece, piecePosition, placePiece, checkAndRemoveFullRows]);

  const movePiece = useCallback(
    (direction) => {
      if (currentPiece) {
        const newPosition = {
          ...piecePosition,
          x: piecePosition.x + direction,
          y: piecePosition.y + 1,
        };
        if (isValidMove(board, currentPiece, newPosition)) {
          setPiecePosition(newPosition);
        }
      }
    },
    [board, currentPiece, piecePosition]
  );

  const rotatePiece = useCallback(() => {
    if (currentPiece) {
      const rotatedPiece = currentPiece[0]
        .map((_, index) => currentPiece.map((row) => row[index]))
        .reverse();
      if (isValidMove(board, rotatedPiece, piecePosition)) {
        setCurrentPiece(rotatedPiece);
      }
      drop();
    }
  }, [board, currentPiece, piecePosition]);

  const isValidMove = (board, piece, position) => {
    for (let row = 0; row < piece.length; row++) {
      for (let col = 0; col < piece[row].length; col++) {
        if (piece[row][col] !== 0) {
          const newX = position.x + col;
          const newY = position.y + row;
          if (
            newX < 0 ||
            newX >= board[0].length ||
            newY >= board.length ||
            (newY >= 0 && board[newY][newX] !== 0)
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const mergedBoard = useCallback(() => {
    if (!currentPiece) return board;
    return placePiece(board, currentPiece, piecePosition);
  }, [board, currentPiece, piecePosition, placePiece]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      const interval = setInterval(() => {
        drop();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning, isPaused, drop]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isRunning || isPaused) return;

      if (e.key === "ArrowLeft") {
        movePiece(-1);
      } else if (e.key === "ArrowRight") {
        movePiece(1);
      } else if (e.key === "ArrowUp") {
        rotatePiece();
      } else if (e.key === "ArrowDown") {
        drop();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [isRunning, isPaused, movePiece, rotatePiece, drop]);

  const startGame = () => {
    setBoard(emptyBoard);
    setIsRunning(true);
    setIsPaused(false);
    setCurrentPiece(pieces[Math.floor(Math.random() * 7)]);
    setPiecePosition({ x: 3, y: 0 });
    setScore(0); // Reset score
    setGameOver(false); // Reset game over state
  };

  const pauseGame = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <div>
      {gameOver && (
        <div className="game-over">Game Over! Your score: {score}</div>
      )}
      <div className="buttons-container">
        <button onClick={startGame}>{isRunning ? "Restart" : "Play"}</button>
        <button onClick={pauseGame}>{isPaused ? "Resume" : "Pause"}</button>
      </div>
      {!gameOver && <div className="score">Score: {score}</div>}
      <Board board={mergedBoard()} />
    </div>
  );
};

export default Tetris;

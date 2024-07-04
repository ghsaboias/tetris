import Tetris from "../components/Tetris";
import "./globals.css";

export default function Home() {
  return (
    <main className="main-container">
      <h1>Tetris</h1>
      <div className="game-section">
        <div className="game-container">
          <Tetris />
        </div>
      </div>
    </main>
  );
}

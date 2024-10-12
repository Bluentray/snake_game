import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

enum Direction {
  Up,
  Right,
  Down,
  Left,
}

enum GameStatus {
  Played,
  Paused,
  Lost,
}

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const CELL_SIZE = 15;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>(Direction.Right);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Played);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          setDirection(Direction.Up);
          break;
        case 'ArrowDown':
          setDirection(Direction.Down);
          break;
        case 'ArrowLeft':
          setDirection(Direction.Left);
          break;
        case 'ArrowRight':
          setDirection(Direction.Right);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (gameStatus !== GameStatus.Played) return;

    const moveSnake = () => {
      const newSnake = [...snake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case Direction.Up:
          head.y = (head.y - 1 + GRID_SIZE) % GRID_SIZE;
          break;
        case Direction.Down:
          head.y = (head.y + 1) % GRID_SIZE;
          break;
        case Direction.Left:
          head.x = (head.x - 1 + GRID_SIZE) % GRID_SIZE;
          break;
        case Direction.Right:
          head.x = (head.x + 1) % GRID_SIZE;
          break;
      }

      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameStatus(GameStatus.Lost);
        return;
      }

      newSnake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        setScore(prevScore => prevScore + 1);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    };

    const gameLoop = setInterval(moveSnake, 100);
    return () => clearInterval(gameLoop);
  }, [snake, direction, food, gameStatus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = '#4CAF50';
    snake.forEach(segment => {
      ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });

    // Draw food
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }, [snake, food]);

  const generateFood = (snake: Position[]): Position => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  };

  const togglePause = () => {
    setGameStatus(prevStatus =>
      prevStatus === GameStatus.Played ? GameStatus.Paused : GameStatus.Played
    );
  };

  const restartGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood([{ x: 10, y: 10 }]));
    setDirection(Direction.Right);
    setGameStatus(GameStatus.Played);
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Snake Game</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="border-2 border-gray-300"
        />
        <div className="mt-4 flex justify-between items-center">
          <p className="text-xl font-semibold">Score: {score}</p>
          <div className="space-x-2">
            <button onClick={togglePause} className="bg-blue-500 text-white px-4 py-2 rounded">
              {gameStatus === GameStatus.Played ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button onClick={restartGame} className="bg-green-500 text-white px-4 py-2 rounded">
              <RotateCcw size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
use wasm_bindgen::prelude::*;
use std::collections::VecDeque;

#[wasm_bindgen]
#[derive(PartialEq, Clone, Copy)]
pub enum Direction {
    Up,
    Right,
    Down,
    Left,
}

#[wasm_bindgen]
#[derive(PartialEq, Clone, Copy)]
pub enum GameStatus {
    Played,
    Paused,
    Lost,
}

#[wasm_bindgen]
pub struct World {
    width: usize,
    height: usize,
    snake: VecDeque<(usize, usize)>,
    food: (usize, usize),
    direction: Direction,
    status: GameStatus,
    score: usize,
}

#[wasm_bindgen]
impl World {
    pub fn new(width: usize, height: usize) -> World {
        let snake = VecDeque::from(vec![(2, 2), (2, 3), (2, 4)]);
        let food = World::generate_food(width, height, &snake);
        World {
            width,
            height,
            snake,
            food,
            direction: Direction::Right,
            status: GameStatus::Played,
            score: 0,
        }
    }

    pub fn width(&self) -> usize {
        self.width
    }

    pub fn height(&self) -> usize {
        self.height
    }

    pub fn snake_body(&self) -> Vec<usize> {
        self.snake.iter().flat_map(|&(x, y)| vec![x, y]).collect()
    }

    pub fn food_position(&self) -> Vec<usize> {
        vec![self.food.0, self.food.1]
    }

    pub fn change_snake_dir(&mut self, direction: Direction) {
        let head = self.snake.front().unwrap();
        let next = match direction {
            Direction::Up => (head.0, (head.1 - 1 + self.height) % self.height),
            Direction::Right => ((head.0 + 1) % self.width, head.1),
            Direction::Down => (head.0, (head.1 + 1) % self.height),
            Direction::Left => ((head.0 - 1 + self.width) % self.width, head.1),
        };
        if next != *self.snake.get(1).unwrap_or(&(usize::MAX, usize::MAX)) {
            self.direction = direction;
        }
    }

    pub fn step(&mut self) {
        if self.status != GameStatus::Played {
            return;
        }

        let head = self.snake.front().unwrap();
        let next = match self.direction {
            Direction::Up => (head.0, (head.1 - 1 + self.height) % self.height),
            Direction::Right => ((head.0 + 1) % self.width, head.1),
            Direction::Down => (head.0, (head.1 + 1) % self.height),
            Direction::Left => ((head.0 - 1 + self.width) % self.width, head.1),
        };

        if self.snake.contains(&next) {
            self.status = GameStatus::Lost;
            return;
        }

        self.snake.push_front(next);

        if next == self.food {
            self.score += 1;
            self.food = World::generate_food(self.width, self.height, &self.snake);
        } else {
            self.snake.pop_back();
        }
    }

    pub fn game_status(&self) -> GameStatus {
        self.status
    }

    pub fn score(&self) -> usize {
        self.score
    }

    fn generate_food(width: usize, height: usize, snake: &VecDeque<(usize, usize)>) -> (usize, usize) {
        loop {
            let x = (js_sys::Math::random() * width as f64) as usize;
            let y = (js_sys::Math::random() * height as f64) as usize;
            if !snake.contains(&(x, y)) {
                return (x, y);
            }
        }
    }
}
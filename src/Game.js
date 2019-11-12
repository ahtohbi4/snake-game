import Notice from './Notice';
import Playground from './Playground';

import randomIntegerInRang from '../utils/randomIntegerInRang';

import './styles.css';

const KEY_CODE_ARROW_DOWN = 40;
const KEY_CODE_ARROW_LEFT = 37;
const KEY_CODE_ARROW_RIGHT = 39;
const KEY_CODE_ARROW_UP = 38;

const KEY_CODE_SPACE = 32;

const notice = new Notice();

export default class Game {
  static DIRECTIONS = {
    DOWN: 'directionDown',
    LEFT: 'directionLeft',
    RIGHT: 'directionRight',
    UP: 'directionUp',
  };

  static SPEED_RANGE = {
    max: 9,
    min: 1,
  };

  static STATE_DEFAULT = {
    direction: Game.DIRECTIONS.RIGHT,
    isStarted: false,
    rabbit: undefined,
    score: 0,
    snake: [
      [3, 0], [2, 0], [1, 0], [0, 0],
    ],
    speed: 1,
  };

  elems = {
    $score: document.querySelector('.game__score .js-value'),
    $speed: document.querySelector('.game__speed .js-value'),
  };

  state = {
    ...Game.STATE_DEFAULT,
  };

  constructor() {
    this.playground = new Playground(document.querySelector('.game__canvas'));

    this.handleControl = this.handleControl.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.makeStep = this.makeStep.bind(this);

    this.init();
  }

  get frameTime() {
    return (500 / this.state.speed);
  }

  handleStart({ keyCode }) {
    const { speed } = this.state;

    switch (keyCode) {
      case KEY_CODE_ARROW_UP:
        if (speed < Game.SPEED_RANGE.max) {
          this.state.speed += 1;
          this.render();
        }
        break;
      case KEY_CODE_ARROW_DOWN:
        if (speed > Game.SPEED_RANGE.min) {
          this.state.speed -= 1;
          this.render();
        }
        break;
      case KEY_CODE_SPACE:
        window.removeEventListener('keydown', this.handleStart);
        this.start();
        break;
      default:
        break;
    }
  }

  handleControl({ keyCode }) {
    const { direction } = this.state;

    switch (keyCode) {
      case KEY_CODE_ARROW_DOWN:
        if (direction === Game.DIRECTIONS.UP) {
          this.state.snake.reverse();
        }
        this.state.direction = Game.DIRECTIONS.DOWN;
        break;

      case KEY_CODE_ARROW_LEFT:
        if (direction === Game.DIRECTIONS.RIGHT) {
          this.state.snake.reverse();
        }
        this.state.direction = Game.DIRECTIONS.LEFT;
        break;

      case KEY_CODE_ARROW_RIGHT:
        if (direction === Game.DIRECTIONS.LEFT) {
          this.state.snake.reverse();
        }
        this.state.direction = Game.DIRECTIONS.RIGHT;
        break;

      case KEY_CODE_ARROW_UP:
        if (direction === Game.DIRECTIONS.DOWN) {
          this.state.snake.reverse();
        }
        this.state.direction = Game.DIRECTIONS.UP;
        break;

      default:
        break;
    }
  }

  init() {
    window.addEventListener('keydown', this.handleStart);

    const { speed } = this.state;

    this.state = {
      ...Game.STATE_DEFAULT,
      speed,
    };
    this.placeRabbit();
    this.render();

    notice.push(
      `Set the speed with buttons <code>↑</code> or <code>↓</code>
      and start the game with <code>Space</code> button.`
    );
  }

  start() {
    this.isStarted = true;

    window.addEventListener('keydown', this.handleControl);

    notice.push(
      `Press button <code>←</code>, <code>↑</code>, <code>→</code>
      or <code>↓</code> to control the snake.`
    );

    this.makeStep();
  }

  stop() {
    this.isStarted = false;

    window.removeEventListener('keydown', this.handleControl);

    clearTimeout(this.frame);

    notice.push('Ouch!');

    const blink = (count = 0) => {
      setTimeout(() => {
        if (count === 6) {
          this.init();
          return;
        }

        if (count % 2 === 0) {
          this.reset();
        } else {
          this.render();
        }

        blink(count + 1);
      }, 350);
    };
    blink();
  }

  makeStep() {
    this.moveSnake();
    this.render();

    if (this.isStarted) {
      this.frame = setTimeout(this.makeStep, this.frameTime);
    }
  }

  moveSnake() {
    const { direction, rabbit: [xRabbit, yRabbit], snake } = this.state;
    let isEating = false;

    const movedSnake = snake.reduce((result, [x, y], index, { length }) => {
      // Snake's head.
      if (index === 0) {
        let xHead = x;
        let yHead = y;

        switch (direction) {
          case Game.DIRECTIONS.UP:
            yHead -= 1;
            break;
          case Game.DIRECTIONS.RIGHT:
            xHead += 1;
            break;
          case Game.DIRECTIONS.DOWN:
            yHead += 1;
            break;
          case Game.DIRECTIONS.LEFT:
            xHead -= 1;
            break;
          default:
            break;
          }

        if (xHead === xRabbit && yHead === yRabbit) {
          isEating = true;
          this.eatRabbit();
        }

        return [
          [xHead, yHead],
          [x, y],
        ];
      }

      // Snake's tail.
      if (index === length - 1 && !isEating) {
        return result;
      }

      return [
        ...result,
        [x, y],
      ];
    }, []);
    const [[xHead, yHead], ...restSnake] = movedSnake;
    const isSelfEating = restSnake.some(
      ([x, y]) => (x === xHead && y === yHead),
    );

    if (isSelfEating) {
      this.stop();

      return;
    }

    const { maxX, maxY } = this.playground;
    const isOutOfPlayground = (
      xHead < 0 || xHead > maxX ||
      yHead < 0 || yHead > maxY
    );

    if (isOutOfPlayground) {
      this.stop();

      return;
    }

    this.state.snake = movedSnake;
  }

  eatRabbit() {
    this.placeRabbit();

    this.state.score += 100;

    const { score, speed } = this.state;
    const shouldSpeedUp = ((score % 1000 === 0) && speed < Game.SPEED_RANGE.max);

    switch (score) {
      case 100:
        notice.push('Not bad!', Notice.durations.short);
        break;
      case 1000:
        notice.push('Woah!', Notice.durations.short);
        break;
      case 5000:
        notice.push('Unreal!', Notice.durations.short);
        break;
      case 10000:
        notice.push('You are fantastic!', Notice.durations.short);
        break;
      default:
        break;
    }

    if (shouldSpeedUp) {
      this.state.speed += 1;
    }
  }

  placeRabbit() {
    const { maxX, maxY } = this.playground;
    const rabbit = [
      randomIntegerInRang(0, maxX),
      randomIntegerInRang(0, maxY),
    ];

    const isEmptyPoint = this.state.snake.every(
      ([x, y]) => (rabbit[0] !== x && rabbit[1] !== y)
    );

    if (isEmptyPoint) {
      this.state.rabbit = rabbit;
    } else {
      this.placeRabbit();
    }
  }

  reset() {
    this.playground
      .reset()
      .render();
  }

  render() {
    const { $score, $speed } = this.elems;
    const { rabbit, score, snake, speed } = this.state;

    $score.innerHTML = score.toLocaleString('en');
    $speed.innerHTML = speed;

    this.playground
      .reset()
      .apply(rabbit)
      .apply(snake)
      .render();
  }
}

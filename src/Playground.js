import integerDivision from '../utils/integerDivision';

export default class Playground {
  static CONFIG_DEFAULT = {
    pointColor: '#eee',
    pointColorActive: '#333',
    pointSize: 8,
    pointSpacing: 1,
  };

  constructor($canvas, options = {}) {
    this.$canvas = $canvas.getContext('2d');

    const { config = {} } = options;
    this.config = {
      ...Playground.CONFIG_DEFAULT,
      ...config,
    };

    this.matrix = [];

    const { pointSize, pointSpacing } = this.config;
    const { height, width } = this.$canvas.canvas.getBoundingClientRect();

    this.maxX = integerDivision((width - (pointSize + pointSpacing)), (pointSize + pointSpacing));
    this.maxY = integerDivision((height - (pointSize + pointSpacing)), (pointSize + pointSpacing));

    this.offsetX = integerDivision((width - (this.maxX * (pointSize + pointSpacing) + pointSize)), 2);
    this.offsetY = integerDivision((height - (this.maxY * (pointSize + pointSpacing) + pointSize)), 2);

    this.reset();
  }

  reset() {
    for (let j = 0; j <= this.maxY; j++) {
      this.matrix[j] = [];

      for (let i = 0; i <= this.maxX; i++) {
        this.matrix[j][i] = false;
      }
    }

    return this;
  }

  apply(coords) {
    if (Array.isArray(coords[0])) {
      coords.forEach((coord) => this.apply(coord));
    } else {
      const [x, y] = coords;

      this.matrix[y][x] = true;
    }

    return this;
  }

  renderPoint(x, y, isActive = false) {
    const { $canvas, offsetX, offsetY } = this;
    const { pointColor, pointColorActive, pointSize, pointSpacing } = this.config;

    $canvas.fillStyle = isActive ?
      pointColorActive :
      pointColor;

    $canvas.fillRect(
      offsetX + (pointSize + pointSpacing) * x,
      offsetY + (pointSize + pointSpacing) * y,
      pointSize,
      pointSize
    );
  }

  render() {
    this.matrix.forEach(
      (row, y) => row.forEach(
        (value, x) => this.renderPoint(x, y, value),
      ),
    );
  }
}

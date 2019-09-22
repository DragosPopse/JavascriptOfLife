function createGrid(rows, cols) {
    let grid = new Array(cols);
    for (let i = 0; i < cols; i++) {
        grid[i] = new Array(rows);
    }
    return grid;
}

class Game {
    constructor() {
        this._timeStep = 1000 / 2;
        this._canvas = document.createElement("canvas");
        this._context = this._canvas.getContext("2d");
        this._rows = 10;
        this._cols = 10;
        this._cellSize = 40;
        this._aliveColor = "green";
        this._grid = createGrid(this._rows, this._cols);
        this._nextGrid = createGrid(this._rows, this._cols);
        this._running = false;

        this._hovering = false;
        this._hoverX = 0;
        this._hoverY = 0;

        for (let i = 0; i < this._cols; i++) {
            for (let j = 0; j < this._rows; j++) {
                this._grid[i][j] = 0;
                this._nextGrid[i][j] = 0;
            }
        }

        document.body.appendChild(this._canvas);

        this.resize();
        window.addEventListener("resize", this.resize.bind(this));

        this._canvas.addEventListener("click", this.onCanvasClick.bind(this));
    }

    onCanvasClick(event) {
        if (this._running) {
            return;
        }
        let rect = this._canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        if (x > this._cellSize * this._cols || y > this._cellSize * this._rows) {
            return;
        }

        let gridX = Math.floor(x / this._cellSize);
        let gridY = Math.floor(y / this._cellSize);

        if (this._nextGrid[gridX][gridY] == 0) {
            this._nextGrid[gridX][gridY] = 1;
        } else {
            this._nextGrid[gridX][gridY] = 0;
        }
        
        this.draw();
    }
    
    resize() {
        let w = document.documentElement.clientWidth;
        let h = document.documentElement.clientHeight;

        this._canvas.width = w;
        this._canvas.height = h;

        this.draw();
    }

    play() {
        this._running = true;
        this._loopId = setInterval(this.tick.bind(this), this._timeStep);
    }

    stop() {
        this._running = false;
        clearInterval(this._loopId);
    }

    tick() {
        this.computeNextGeneration();
        this.draw();
    }

    draw() {
        this.clear();
        this.swapGrids();

        for (let i = 0; i < this._cols + 1; i++) {
            this._context.moveTo(i * this._cellSize, 0);
            this._context.lineTo(i * this._cellSize, this._cellSize * this._cols);
            this._context.stroke();
        }

        for (let i = 0; i < this._rows + 1; i++) {
            this._context.moveTo(0, i * this._cellSize);
            this._context.lineTo(this._cellSize * this._rows, i * this._cellSize);
            this._context.stroke();
        }

        for (let i = 0; i < this._cols; i++) {
            for (let j = 0; j < this._rows; j++) {
                if (this._grid[i][j] == 1) {
                    let x = i * this._cellSize;
                    let y = j * this._cellSize;
                    this._context.fillStyle = this._aliveColor;
                    this._context.fillRect(x, y, this._cellSize - 1, this._cellSize - 1);   
                }
            }
        }
    }

    clear() {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }

    swapGrids() {
        for (let i = 0; i < this._cols; i++) {
            for (let j = 0; j < this._rows; j++) {
                this._grid[i][j] = this._nextGrid[i][j];
            }
        }
    }

    computeNextGeneration() {
        for (let i = 0; i < this._cols; i++) {
            for (let j = 0; j < this._cols; j++) {
                let sum = this.computeNeighbours(i, j);
                if (this._grid[i][j] == 1) {
                    if (sum < 2) {
                        this._nextGrid[i][j] = 0;
                    } else if (sum <= 3) {
                        this._nextGrid[i][j] = 1;
                    } else {
                        this._nextGrid[i][j] = 0;
                    }
                } else {
                    if (sum == 3) {
                        this._nextGrid[i][j] = 1;
                    } else {
                        this._nextGrid[i][j] = 0;
                    }
                }
            }
        }
    }

    computeNeighbours(x, y) {
        let sum = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                let nbX = i + x;
                let nbY = j + y;

                //check if neighbour exists
                if (nbX >= 0 && nbX < this._cols && nbY >= 0 && nbY < this._rows) {
                    sum += this._grid[nbX][nbY];
                }
            }
        }

        sum -= this._grid[x][y];
        return sum;
    }
}
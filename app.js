document.addEventListener('DOMContentLoaded', () => {
    const width = 10;
    const height = 20;
    const gridSize = width * height;

    const grid = createGrid();
    let squares = Array.from(document.querySelectorAll('.grid div'));
    const scoreDisplay = document.querySelector('#score');
    const startBtn = document.querySelector('#start-button');
    let nextRandom = 0;
    let timerId;
    let score = 0;
    const colors = [
        '#6a040f',
        '#9d0208',
        '#d00000',
        '#dc2f02',
        '#e85d04',
        '#f48c06',
        '#faa307'
    ];

    function createGrid() {
        // the main grid
        let grid = document.querySelector(".grid");
        for (let i = 0; i < gridSize; i++) {
            let gridElement = document.createElement("div");
            grid.appendChild(gridElement)
        }

        // set base of grid
        for (let i = 0; i < width; i++) {
            let gridElement = document.createElement("div");
            gridElement.setAttribute("class", "taken");
            grid.appendChild(gridElement)
        }

        let previousGrid = document.querySelector(".mini-grid");
        // Since 16 is the max grid size in which all the Tetrominoes
        // can fit in we create one here
        for (let i = 0; i < 16; i++) {
            let gridElement = document.createElement("div");
            previousGrid.appendChild(gridElement);
        }
        return grid;
    }

    //The Tetrominoes

    const lTetromino = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ];

    const lTurnedTetromino = [
        [0, width, width * 2, width * 2 + 1],
        [width, width + 1, width + 2, 2],
        [0, 1, width + 1, width * 2 + 1],
        [0, 1 , 2, width]
    ];

    const zTetromino = [
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1]
    ];

    const zTurnedTetromino = [
        [0, 1, width + 1, width + 2],
        [1, width, width + 1, 2 * width],
        [0, 1, width + 1, width + 2],
        [1, width, width + 1, 2 * width]
    ];

    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ];

    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ];

    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ];

    const theTetrominoes = [lTetromino, lTurnedTetromino, zTetromino, zTurnedTetromino, tTetromino, oTetromino, iTetromino];

    let currentPosition = 4;
    let currentRotation = 0;

    //randomly select a Tetromino and its first rotation
    let random = Math.floor(Math.random() * theTetrominoes.length);
    let current = theTetrominoes[random][currentRotation];

    //draw the Tetromino
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino');
            squares[currentPosition + index].style.backgroundColor = colors[random];
        });
    }

    //undraw the Tetromino
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino');
            squares[currentPosition + index].style.backgroundColor = '';
        });
    }

    //make the tetromino move down every second
    //timerId = setInterval(moveDown, 250);

    //assign functions to keyCodes
    function control(e) {
        if (e.keyCode === 37) {
            moveLeft();
        }

        if (e.keyCode === 38) {
            rotate();
        }

        if (e.keyCode === 39) {
            moveRight();
        }

        if (e.keyCode === 40) {
            moveDown();
        }
    }

    //speed up
    document.addEventListener('keydown', control);

    //move down function
    function moveDown() {
        undraw();
        currentPosition = currentPosition += width;
        draw();
        freeze();
    }

    //freeze function
    function freeze() {
        if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));
            //start a new tetromino falling
            random = nextRandom;
            nextRandom = Math.floor(Math.random() * theTetrominoes.length);
            current = theTetrominoes[random][currentRotation];
            currentPosition = 4;
            draw();
            displayShape();
            addScore();
            gameOver();
        }
    }

    //move the tetromino left, unless is at the edge or there is a blockage
    function moveLeft() {
        undraw();
        const isAtTheLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if (!isAtTheLeftEdge) currentPosition -= 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1
        }
        draw();
    }

    //move the tetromino right, unless is at the edge or there is a blockage
    function moveRight() {
        undraw();
        const isAtTheRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        if (!isAtTheRightEdge) currentPosition += 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1
        }
        draw();
    }

    //rotate the tetromino
    function rotate() {
        undraw();
        currentRotation++;
        if (currentRotation === current.length) {
            currentRotation = 0;
        }
        current = theTetrominoes[random][currentRotation];
        draw();
    }

    //show up next tetromino in mini-grid display

    const displaySquares = document.querySelectorAll('.mini-grid div');
    const displayWidth = 4;
    let displayIndex = 0;

    //the Tetrominos without rotations
    const upNextTetrominoes = [

        [1, displayWidth + 1, displayWidth * 2 + 1, 2], //lTetromino
        [0, displayWidth, displayWidth * 2, displayWidth * 2 + 1], //lTurnedTetromino
        [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], //zTetromino
        [0, 1, displayWidth + 1, displayWidth + 2], //zTurnedTetromino
        [1, displayWidth, displayWidth + 1, displayWidth + 2], //tTetromino
        [0, 1, displayWidth, displayWidth + 1], //oTetromino
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1]
    ];

    //display the shape in the mini-grid display
    function displayShape() {
        //remove any trace of a tetromino from the entire grid
        displaySquares.forEach(square => {
            square.classList.remove('tetromino');
            square.style.backgroundColor = '';
        });
        upNextTetrominoes[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('tetromino');
            displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
        });
    }

    //add functionality to the button
    startBtn.addEventListener('click', () => {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        } else {
            draw();
            timerId = setInterval(moveDown, 1000);
            nextRandom = Math.floor(Math.random() * theTetrominoes.length);
            displayShape();
        }
    });

    //add score
    function addScore() {
        for (let i = 0; i < 199; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];

            if (row.every(index => squares[index].classList.contains('taken'))) {
                score += 10;
                scoreDisplay.innerHTML = score;
                row.forEach(index => {
                    squares[index].classList.remove('taken');
                    squares[index].classList.remove('tetromino');
                    squares[index].style.backgroundColor = '';
                });

                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => grid.appendChild(cell))
            }
        }
    }

    //game over
    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerHTML = 'end';
            clearInterval(timerId);
            document.removeEventListener('keydown', control);
        }
    }
});

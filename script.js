let figureId = 0;  // global variable to assign unique IDs to figures
const turnIndicator = document.querySelector('#turn-indicator');
const chess = new Chess();

function createField(){
    const board = document.querySelector('.board');
    const size = 8;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.id = `${String.fromCharCode(97 + j)}${size - i}`;
            if ((i + j) % 2 === 0) {
                square.classList.add('white');
            } else {
                square.classList.add('black');
            }
            board.appendChild(square);
        }
    }
}

function addFieldDescriptions() {
    const size = 8;
    const squares = document.querySelectorAll('.square');
    squares.forEach((square, index) => {
      if (index % size === size - 1 || index >= size * (size - 1)) {
        const column = String.fromCharCode(97 + (index % size));
        const row = size - Math.floor(index / size);
        
        if (index % size === size - 1) {  // Right column
          const descriptionRow = document.createElement('p');
          descriptionRow.classList.add('description');
          descriptionRow.style.position = 'absolute';
          descriptionRow.textContent = `${row}`;
          descriptionRow.style.right = '0';
          descriptionRow.style.transform = 'translate(-50%, -140%)';
          square.appendChild(descriptionRow);
        }
        if (index >= size * (size - 1)) { // Bottom row
          const descriptionColumn = document.createElement('p');
          descriptionColumn.classList.add('description');
          descriptionColumn.style.position = 'absolute';
          descriptionColumn.textContent = `${column}`;
          descriptionColumn.style.bottom = '0';
          descriptionColumn.style.transform = 'translate(-330%, 90%)';
          square.appendChild(descriptionColumn);
        }
      }
    });
}

function createFigure(content, className) {
    const figure = document.createElement('div');
    figure.textContent = content;
    figure.classList.add(className);
    figure.style.fontSize = '70px';
    figure.style.position = 'absolute';
    figure.style.zIndex = '3'; // Set this to a higher number than the descriptions
    figure.id = `figure-${figureId++}`;  // Assign a unique ID to the figure
    figure.draggable = true;
    figure.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', e.target.textContent);
      e.dataTransfer.setData('color', e.target.className);
      e.dataTransfer.setData('id', e.target.id);  // Store the ID of the dragged figure
    });
    return figure;
}

function addFigures() {
    const size = 8;
    const squares = document.querySelectorAll('.square');
    const figures = ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'];
    for (let i = 0; i < size; i++) {
      const blackFigure = createFigure(figures[i], 'black-figure');
      blackFigure.id = `figure-${figureId++}-${String.fromCharCode(97 + i)}8`;

      squares[i].appendChild(blackFigure);
      
      const blackPawn = createFigure('♟', 'black-pawn');
      blackPawn.id = `figure-${figureId++}-${String.fromCharCode(97 + i)}7`;
      squares[size + i].appendChild(blackPawn);
      
      const whitePawn = createFigure('♙', 'white-pawn');
      whitePawn.id = `figure-${figureId++}-${String.fromCharCode(97 + i)}2`;; // Assign ID based on position
      squares[squares.length - size * 2 + i].appendChild(whitePawn);
  
      const whiteFigure = createFigure(figures[i].toLowerCase(), 'white-figure');
      whiteFigure.id = `figure-${figureId++}-${String.fromCharCode(97 + i)}1`;; // Assign ID based on position
      squares[squares.length - size + i].appendChild(whiteFigure);
    }
  }
  

  function addDropZones() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
      square.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      });
  
      square.addEventListener('drop', (e) => {
        e.preventDefault();
        const target = e.currentTarget;
        const draggedFigureId = e.dataTransfer.getData('id');
        const draggedFigure = document.getElementById(draggedFigureId);
  
        // Get the source and target square IDs
        const fromSquareId = draggedFigureId.split('-')[2];
        
        const toSquareId = target.id;
        console.log(fromSquareId, toSquareId);

        const validMove = isMoveValid(fromSquareId, toSquareId);
        console.log(validMove);
  
        if (!validMove.validMove) {
          console.log('Invalid move');
          return;
        }
        
        if (validMove.captured && validMove.flags.includes('e')) {
            console.log('En passant');
            
            const previousSquareId = validMove.color === "w" ? toSquareId[0] + (Number(toSquareId[1]) - 1) : toSquareId[0] + (Number(toSquareId[1]) + 1);
            const capturedFigure = document.querySelector(`#${previousSquareId} > div`);

            if (capturedFigure) {
              capturedFigure.parentNode.removeChild(capturedFigure);
            }
          }
        

        
                Array.from(target.children).forEach(child => {
                    if (!child.classList.contains('description')) {
                        target.removeChild(child);
                    }
            });
        
          const figureId = draggedFigureId.split('-')[1];
          draggedFigure.id = `figure-${figureId}-${toSquareId}`;
          
          target.appendChild(draggedFigure);
        
      });
    });
  }
  
  
function addDragAndDropToFigure(figure) {
    figure.draggable = true;
    figure.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', figure.textContent);
      e.dataTransfer.dropEffect = "move";
      e.currentTarget.classList.add('dragging');
    });
  
    figure.addEventListener('dragend', (e) => {
      e.currentTarget.classList.remove('dragging');
    });
  }
  
  function addDropZone(square) {
    square.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });
  
    square.addEventListener('drop', (e) => {
      e.preventDefault();
      e.currentTarget.textContent = e.dataTransfer.getData('text/plain');
    });
  }

  function isMoveValid(from, to) {
    const move = chess.move({ from: from, to: to, promotion: 'q' });
    // Check if the move is not null and has a captured piece
    move !== null ? updateTurnIndicator() : console.log('Invalid move');
    console.log(move);
    return {validMove : move !== null, ...move};
  }
  
  function updateTurnIndicator() {
    const currentTurn = chess.turn() === 'w' ? 'white' : 'black';
    console.log(currentTurn);
    turnIndicator.textContent = `Current Turn: ${currentTurn}`;
  }
  

createField();
addFieldDescriptions();
addFigures();
addDropZones(); 



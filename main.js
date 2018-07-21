
//     0 | 1 | 2    top     a | b | c
//     ––+–––+––            ––+–––+––
//     3 | 4 | 5   middle   d | e | f
//     ––+–––+––            ––+–––+––
//     6 | 7 | 8   bottom   g | h | i


// the starting and current game board arrays
const startingBoard = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
let currentBoard    = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];

// assign X's and O's to players
const computer = 'X';
const human    = 'O';
 
// TRUE is the human player's turn.
// Works with currentPlayer()
// to return computer 'X' or human 'O'
let turnTracker = true;
const currentPlayer = () => {
  return turnTracker ? human : computer;
}





// formats and colors the rows for output to the browser console.
const buildRow = (row) => {
  
  let coloredRow = [];
  let colors = [];
  
  row.forEach(tile => {
    // builds the template for the log() output 
    coloredRow[0] = coloredRow[0] ? 
    coloredRow[0] + '%c' + tile + ' ' : '%c' + tile + ' ';
    
    // determines color each tile should be, stores in colors array
    if (tile === 'X') {      
      colors.push('color: red');
    } else if (tile === 'O') {     
      colors.push('color: blue');    
    } else {     
      colors.push('color: green');
    }
  });
  
  // combine the template and the colors arrays for output
  coloredRow.push(...colors);
  return coloredRow;
}


// when called, displays the game board in the console.
// defaults to the current board.
const displayBoard = (board = currentBoard) => {
  // make rows for output
  let top = [];
  let middle = [];
  let bottom = [];
  
  // sort tiles into their rows based on index
  board.forEach((tile, ix) => {
    if (ix < 3) top.push(tile);
    if (ix > 2 && ix < 6) middle.push(tile);
    if (ix > 5) bottom.push(tile);
  });
  
  // reformat each row and output into console
  console.clear();
  console.log('XOXOXO');
  console.log('\n');
  console.log( ...buildRow(top) );
  console.log( ...buildRow(middle) );
  console.log( ...buildRow(bottom) );
  console.log('\n');
}






// takes a game board and returns an array of the indecies of the empty spaces 
const spacesLeftByIndex = (board) => {
  let moves = [];
  board.forEach((tile, index) => {
    if (startingBoard.includes(tile)) {
      moves.push(index);
    }
  });
  return moves;
}

// did someone win?
const winner = (board, player) => {
  // winning conditions...
  if (
    // horizontals
    (board[0] == player && board[1] == player && board[2] == player) ||
    (board[3] == player && board[4] == player && board[5] == player) ||
    (board[6] == player && board[7] == player && board[8] == player) ||
    // verticals
    (board[0] == player && board[3] == player && board[6] == player) ||
    (board[1] == player && board[4] == player && board[7] == player) ||
    (board[2] == player && board[5] == player && board[8] == player) ||
    //diagonals
    (board[0] == player && board[4] == player && board[8] == player) ||
    (board[2] == player && board[4] == player && board[6] == player)    
  ) {
    return true;
  } else {
    return false;
  }
}







// the meat and potatoes
// recursively plays the game,
// ranks the outcomes of each possible moves,
// and plays the most optimum space.
const minimax = (board, player) => {


  // an array to store possible moves
  let possibleMoves = [];

  // stores the best possible move from possible moves
  // to be returned at the end of the function
  let bestMove;

  // determine where the empty spaces are in the board array.
  let emptySpaces = spacesLeftByIndex(board);

  // if the game is in an end state,
  // score it based on the outcome for the computer
  if (winner(board, computer)) {
    return { score: 10 }
  } else if (winner(board, human)) {
    return { score : -10}
  } else if (emptySpaces.length == 0) {
    return { score: 0 }
  }
  

  // compile the outcomes of each space
  // and store in possibleMoves for evaluation later
   emptySpaces.forEach(space => {
    // create an object to store the move info
    let move = {};
    move.index = space

    // place a marker in an empty space
    // test the outcomes of that move
    // store the score in the move
    // store move object in possibleMoves array
    board[space] = player;

    if (player === computer) {
      let nextMove = minimax(board, human);
      move.score = nextMove.score;
    } else {
      let nextMove = minimax(board, computer);
      move.score = nextMove.score;
    }
    
    // undo the marker on the board
    // push the object to moves array to check later
    board[space] = startingBoard[space];
    possibleMoves.push(move);
  });

  // evaluate the possible moves...
  // if it is the computer's move,
  // evaluate positively
  // if it the human's move,
  // evaluate negatively
  if (player === computer) {
    let highScore = -100;
    possibleMoves.forEach(move => {
      if (move.score > highScore) {
        highScore = move.score;
        bestMove = move;
      }
    });
  } else {
    let lowScore = 100
    possibleMoves.forEach(move => {
      if (move.score < lowScore) {
        lowScore = move.score;
        bestMove = move;
      }
    });
  }

  return bestMove;
}


// playerMove handles the input from the player
// and updates the game board accordingly
const playerMove = (message) => {
  let input = prompt(message);

  // first check that the input is a valid space
  if (currentBoard.includes(input)) {
    // find the space in the board
    let space = currentBoard.indexOf(input);
    // place the marker in currentBoard
    currentBoard[space] = human;
    // show the updated board
    displayBoard(currentBoard);
  } else {
    // if not a valid space try again!
    playerMove("Please enter a valid space");
  }
}

// computerMove is an implementation of the minimax algorithm
// it selects the best move by ranking possible outcomes based 
const computerMove = (board) => {
  let bestSpace;
  let emptySpaces = spacesLeftByIndex(board);
  // minimax() blows out the stack max calls in Chrome
  // through recursion on the first move
  // I've made the first move "stupid" to limit this error.

  // computerMove will pick the center if available, 
  // otherwise it will choose a corner.
  if (emptySpaces.length > 7) {
    emptySpaces.includes(4) ? 
      bestSpace = {index : 4}: bestSpace = {index: 0}
  } else {
    bestSpace = minimax(board, computer);
  }

  
  // find the best space using minimax

  // place the marker in currentBoard
  currentBoard[bestSpace.index] = computer;

  // show the updated board
  displayBoard(currentBoard);

  
}







// runs the game of ticTacToe
const play = () => {
 
  // display the board
  displayBoard(currentBoard);

  // checks the turn tracker boolean for who goes next
  // runs the player prompt (true) or computer minimax (false)
  turnTracker ? 
    playerMove("Enter the letter of a space to place your marker"):
    computerMove(currentBoard);


  // check the new board for an end state.
    // first check for a winner.
  if (winner(currentBoard, currentPlayer())) {
    
    // if there's a winner, end the game, announce winner
    console.log("%c%s wins!", 'color: green', currentPlayer());
    // reset everything for the next game
    currentBoard = [...startingBoard];
    turnTracker = true;

    // if no winner check if the board is full (indicating a tie)
  } else if (spacesLeftByIndex(currentBoard).length < 1) {
    console.log("%cTie game!", "color: green");
    console.log("%cEnter play() to start a new game.", "color: green");
    currentBoard = [...startingBoard];
    turnTracker = true;
    
  } else {
    // if no win, change players, and run play() again
    turnTracker = !turnTracker; 
    play();
  }
  
}



console.log("XOXOXO");
console.log("%cEnter play() to start a new game.", "color: green");

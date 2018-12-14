/*
* Config object for storing
* game settings
*/
const CONFIG = {
    initialX:5, // initial x coordinate of snake
    initialY:5, // initial y coordinate of snake
    ArenaHeight:40, // number of boxes in the height
    ArenaWidth:40,// number of boxes in the width
    // time interval for game loop
    // this controls the speed of the game
    // lower time interval , higher the speed
    timeInterval:100,
    sizeIncrement:1//snake size increase after each apple
}

// game variable
// containging instance of 
// game class
var game = new Game(CONFIG);

// show the game start overlay on
// entering the page
OverLay.showGameStart();

// function for starting the game
function start(){
    game.gameRunning = true;
    OverLay.hideOverLay();
    game.run();
}

// function for restarting the game
function restart(){
    game.stop();
    delete game;
    game = new Game(CONFIG);
    OverLay.hideOverLay();
    game.run();
    game.gameRunning = true;
}
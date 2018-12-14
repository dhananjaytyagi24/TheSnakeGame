/*
* Basic Utility functions
*/
const Utility = {
    // setting the type of the box -
    // (apple , grass , snake)
    setBoxType:function( x , y , type ) {
        if(x!=null && y!=null)
        document.getElementById(x+'-'+y).setAttribute('class',type);
    },
    // getting the type of the box
    getBoxType:function( x ,y ){
        return document.getElementById(x+'-'+y).getAttribute('class');
    },
    // returns a random between
    // min and max arguments
    rand:function(min,max) {
        return Math.floor((Math.random()*(max-min))+min);
    }
}


/*
* Snake class to build and update snake
*/
class Snake {
    // builds the snake
    constructor( intialX , intialY ) {
        this.headX = intialX;// head x coordinate
        this.headY = intialY;// head y coordinate
        this.bodyX = [intialX];// array of body x coordinates
        this.bodyY = [intialY];// array of body y coordinates
        Utility.setBoxType(intialX,intialX,'snake');
        this.bodyLength = 0;
    }
    // updates the snake body on each game loop
    updateBody() {
        // shift all the body coordinates
        // on each game loop
        for(var i = this.bodyLength ; i > 0; i--){
            this.bodyX [i] = this.bodyX [i-1];
            this.bodyY [i] = this.bodyY [i-1];
        }
        this.bodyX[0] = this.headX;
        this.bodyY[0] = this.headY;
    }
}


/*
* Apple class to build the apple
*/
class Apple {
    constructor( width , height, length ) {
        var placed = false;
        // finding a random place
        // breaking if snake occupies the whole place
        while(!placed && (length<((width-2)*(height-2)+1))){
            this.appleX = Utility.rand(1,width-2);// random apple x coordinate
            this.appleY = Utility.rand(1,height-2);// random apple y coordinate
            // only place the apple in the grass
            if(Utility.getBoxType(this.appleX,this.appleY)=='grass'){
                placed = true;
            }   
        }
        Utility.setBoxType(this.appleX,this.appleY,'apple');
    }
}


/*
* Arena class to build the arena
*/
class Arena{
    constructor(width,height) {
        var htmlOutput = '';
        // arranges boxes in a grid
        // the boxes at the boundaries are walls
        for(var j=0;j<height;j++) {
            for(var i=0;i<width;i++) {
                if( i==0 || i==width-1 || j==0 || j==height-1 )
                    htmlOutput+= '<span id="'+i+'-'+j+'" class="wall"></span>';
                else
                    htmlOutput+= '<span id="'+i+'-'+j+'" class="grass"></span>';
            }
            htmlOutput+='<br/>';
        }
        document.getElementById('arena').innerHTML=htmlOutput;
    }
}


/*
* Game class to build the gameloop
* and control the game
*/
class Game {
    // contructor sets the game variables
    // config variable contains settings 
    // for the game (speed,length increase etc..)
    constructor( CONFIG ) {
        this.score = 0;// contains game score
        // reset the score on the 
        // score section of topbar
        document.getElementById('score').innerHTML='SCORE : 0';
        this.gameRunning = false;// is the game running
        this.gameOver =false;// is the game over
        this.snakeDirection = 'down';// direction of snake move
        // tempdirection prevents the snake
        // folding onto itself in case the
        // keys are pushed very fast
        this._tempDirection = this.snakeDirection;
        this.timeInterval = CONFIG.timeInterval;// time between each game update 
        this.increment = CONFIG.sizeIncrement;// length increase of the snake
        this.width = CONFIG.ArenaWidth;// width of the arena
        this.height = CONFIG.ArenaHeight;// height of the arena
        this.arena = new Arena( this.width ,this.height );
        this.snake = new Snake( CONFIG.initialX , CONFIG.initialY );
        this.apple = new Apple( this.width , this.height , this.snake.bodyLength );
        this.addKeyListeners();// adding key listeners for controls
        this.gameLoop = this.gameLoop.bind(this);
        this.updateGameView = this.updateGameView.bind(this);
    }
    // adding key listeners for 
    // gamestart , direction , play/pause
    addKeyListeners(){
        window.addEventListener('keydown',(evt)=>{
            var key = evt.which;
            var direction = this.snakeDirection;
            // if up key pressed and
            // direction not down then go up
            if ( key == 38 && direction!='down' )
                this._tempDirection = 'up';
            // if down key pressed and
            // direction not up then go down
            else if ( key == 40 && direction!='up')
                this._tempDirection = 'down';
            // if left key pressed and
            // direction not right then go left
            else if ( key == 37 && direction!='right')
                this._tempDirection = 'left';
            // if right key pressed and
            // direction not left then go right
            else if ( key == 39 && direction!='left')
                this._tempDirection = 'right';
            // start game on any keypress
            if(!this.gameRunning)
                this.gameRunning = true;
            // pause the game on space key
            else if( key == 32 )
                this.gameRunning = false;
        });
    }
    // updates the game 
    // on each game loop
    updateGameView(){
        var apple = this.apple;
        var snake = this.snake;
        var length = this.snake.bodyLength;
        this.snakeDirection=this._tempDirection;
        var direction = this.snakeDirection;
        // place the apple in grass
        Utility.setBoxType(apple.appleX,apple.appleY,'apple');
        // update the snake body
        snake.updateBody();
        // update the box at last body link 
        // to be grass type as the snake is 
        // going forward
        Utility.setBoxType(snake.bodyX[length],snake.bodyY[length],'grass');
        // change the head coordinates
        // with every game loop
        // as per the last direction key
        if(direction=='down')
            snake.headY++; // if dir down y coordinate increases
        else if(direction=='up')
            snake.headY--; // if dir up y coordinate decreases
        else if(direction=='left')
            snake.headX--; // if dir left x coordinate decreases
        else if(direction=='right')
            snake.headX++;// if dir right x coordinate increases
        // update box at new head coordinate
        // to be of type snake
        Utility.setBoxType(snake.headX,snake.headY,'snake');
        // if collision with the body game is over
        if(this.checkOwnCollision()){
            this.gameOver = true;
            OverLay.showGameOver(this.score);
        }
        // if collision with the wall game is over
        else if(this.checkWallCollision()){
            this.gameOver = true;
            OverLay.showGameOver(this.score);
        }
        // if collision with the apple
        // increase score and length
        // and place a new apple
        else if(this.checkAppleCollision()){
            this.score++;
            this.snake.bodyLength+=this.increment;
            this.apple = new Apple( this.width , this.height , this.snake.bodyLength );
        }
        // update the score
        // at each loop
        document.getElementById('score').innerHTML='SCORE : ' + this.score;
    }
    // checks collision with the body
    // by checking comparing coordinates
    // of head and body
    checkOwnCollision(){
        var snake = this.snake;
        for(var i=snake.bodyLength-1;i>0;i--){
            if ( snake.headX == snake.bodyX[i] && snake.headY == snake.bodyY[i] ){
                return true;
            }
        }
        return false;
    }
    // compares coordinates of
    // head and apple
    checkAppleCollision(){
        var snake = this.snake;
        var apple = this.apple;
        if(snake.headX==apple.appleX && snake.headY==apple.appleY)
            return true;
        else
            return false;
    }
    // compares coordinates of
    // head and wall 
    checkWallCollision(){
        var snake = this.snake;
        if(snake.headX==this.width-1||snake.headX==0||snake.headY==0||snake.headY==this.height-1)
            return true;
        
        else
            return false;
    }
    // game loop to be performed continously
    // after a specific time interval
    gameLoop(){
        if(!this.gameOver && this.gameRunning)
            this.updateGameView();
        else if(this.gameOver)
            this.stop();
    }
    // sets the interval for game loop
    run(){
        this.gameInterval = setInterval( this.gameLoop , this.timeInterval );
    }
    // clears the interval for game loop
    stop(){
        clearInterval(this.gameInterval);
    }
}


/*
* overlay class for building 
* game over and control overlays
*/
class OverLay{
    // build the game-over overlay
    static showGameOver(score){
        var overlay = document.getElementById('overlay');
        var infobox = document.getElementById('infobox');
        var gameover = document.getElementById('gameover');
        overlay.style.display='block';
        infobox.style.display='block';
        document.getElementById('overlay-score').innerHTML=score;
        gameover.style.display='block';
    }
    // build the game-start overlay
    static showGameStart(){
        var overlay = document.getElementById('overlay');
        var infobox = document.getElementById('infobox');
        var gamestart = document.getElementById('gamestart');
        overlay.style.display='block';
        gamestart.style.display = 'block';
        infobox.style.display='block';
    }
    // hide the overlay
    // on game start or restart
    static hideOverLay(){
        var overlay = document.getElementById('overlay');
        var infobox = document.getElementById('infobox');
        var gamestart = document.getElementById('gamestart');
        var gameover = document.getElementById('gameover');
        gameover.style.display='none';
        overlay.style.display='none';
        infobox.style.display='none';
        gamestart.style.display = 'none';
    }
}
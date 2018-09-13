var Game = function() {

  var currentLevel = 0;

  // -------- constants used in the game, uglify doesnt like const keyword
  var screenCols = 50;
  var screenRows = 30;

  var tileWidth = 16;
  var tileHeight = 16;

  var screenWidth = tileWidth * screenCols;  // 800
  var screenHeight = tileWidth * screenRows; // 480

  var maxReflections = 30;
  var spriteSize = 32;

  var tileSolid = 1;
  var tileReflective = 2;
  var tileGreen = 3;
  var tileBlue = 4;
  var tileYellow = 5;
  var tilePurple = 6;
  var tileCrumble = 7;
  var tileCrumbleStart = 8;
  var tileCrumbleDone = 9;

  var colorGreen = '#00aa00';
  var colorGreenOutline = '#008800';

  var colorBlue = '#4444dd';
  var colorBlueOutline = '#333388';

  var colorYellow = '#aaaa00';
  var colorYellowOutline = '#888800';

  var colorPurple = '#aa00aa';
  var colorPurpleOutline = '#880088';

  var stateColors = [colorGreen, colorBlue, colorYellow, colorPurple];
  var stateOutlineColors = [colorGreenOutline, colorBlueOutline, colorYellowOutline, colorPurpleOutline];

  // player sprite actions
  var idleRightIndex = 0;
  var idleRightFrames = 1;

  var idleRightBlinkIndex = 1;

  var idleLeftIndex = 11;
  var idleLeftFrames = 1;

  var idleLeftBlinkIndex = 12;

  var runRightIndex = 2;
  var runRightFrames = 3;

  var runLeftIndex = 13;
  var runLeftFrames = 3;


  var runUpLeftIndex = 35;
  var runUpLeftFrames = 3;

  var runUpRightIndex = 24;
  var runUpRightFrames = 3;


  var wallSlideRightIndex = 6;
  var wallSlideRightFrames = 1;

  var wallSlideLeftIndex = 17;
  var wallSlideLeftFrames = 1;

  var dashRightIndex = 8;
  var dashUpRightIndex = 9;
  var dashUpIndex = 10;

  var dashLeftIndex = 19;
  var dashUpLeftIndex = 20;
  var dashUpIndex = 21;


  var jumpRightIndex = 3;
  var jumpRightFrames = 1;
  var jumpLeftIndex = 14;
  var jumpLeftFrames = 1;


  var fallRightIndex = 5;
  var fallRightFrames = 1;
  var fallLeftIndex = 16;
  var fallLeftFrames = 1;


  var lastTextChangeTime = 0;
  var lastTextIndex1 = 0;
  var lastTextIndex2 = 0;

  var emitterTypeRotate = 1;
  var emitterTypeConstant = 2;

  var emitterDirRight = 0;
  var emitterDirDownRight = 1;
  var emitterDirDown = 2;
  var emitterDirDownLeft = 3;
  var emitterDirLeft = 4;
  var emitterDirUpLeft = 5;
  var emitterDirUp = 6;
  var emitterDirUpRight = 7;  


  var playerActorType = 1;
  var emitterActorType = 2;


  var soundStart = 1;
  var soundDie = 2;
  var soundJump = 3;
  var soundDash = 4;
  var soundRed = 5;
  var soundGreen = 6;
  var soundBlue = 7;
  var soundYellow = 8;
  var soundPurple = 9;

  var soundLevelEnd = 10;

  // ids in the collision buffer

  var bufferBeam = 200;

  // -------- end of constants

  var gameState = 0;

  var screenBuffer = null;
  var spriteImageData = null;

  var textCanvas = null;

  var spriteBounds = [];

  var exitX = 0;
  var exitY = 0;

  var screenCanvas = null;
  var screenContext = null;
  var spriteCanvas = null;
  var spriteContext = null;
  var tileCanvas = null;


  var audioContext = null;


  var player = null
  var actors = [];

  var emitters = [];
  var buttons = [];

  var dashGhosts = [];

  var state = 0;

  var lastTime = 0;

  var leftKey = 0;
  var rightKey = 0;
  var upKey = 0;
  var downKey = 0;
  var jumpKey = 0;
  var actionKey = 0;

  var screen = [
  ];

  var crumbleBlocks = [];

  var scale = 1;




  // Emitter object emit the red lines
  // x - x position
  // y - y position
  // direction - red line direction
  // sX - x speed
  // sY - y speed
  var Emitter = function(x, y, type, direction, sX, sY, width, height, minY) {
    this.actorType = emitterActorType;

    this.x = x * tileWidth;
    this.y = y * tileHeight;
    this.sX = sX * 0.04;
    this.sY = sY * 0.04;
    this.type = type;
    this.direction = direction;
    this.flash = 0;

    this.flashEmitterOn = 1;
    this.flashEmitterLastTime = 0;
    this.flashEmitterOnTime = 1000;
    this.flashEmitterOffTime = 1000;




    this.points = [];
    this.angle = 0;

    if(typeof width != 'undefined') {
      this.width = width;
    } else {
      this.width = tileWidth;
    }
    if(typeof height != 'undefined') {
      this.height = height;
    } else {
      this.height = tileHeight;      
    }

    if(typeof minY != 'undefined') {
      this.minY = minY
    } else {
      this.minY = -1;
    }
  }

  // buttons are pushed to change game state
  var Button = function(x, y, type, orientation) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.orientation = orientation;
    this.state = 0;
  }

  var Actor = function() {
    this.actorType = 0;
    this.x = 0;
    this.y = 0;

    this.state = 0;
    this.stateTimer = 0;

    this.height = 32;
    this.width = 32;

    this.sX = 0;
    this.maxSX = 1;
    this.lastDirection = 0;

    this.lastAction = 0;
    this.lastActionTime = 0;

    this.sY = 0;
    this.maxSY = 1;
    this.jumpStartY = 0;

    this.baseFrame = 0;
    this.frameCount = 0;
    this.currentFrame = 0;
    this.frameTime = 0;

    // how long player been doing current action
    this.actionTime = 0;


    this.gravityForce = 0;
    this.hFriction = 0.2;
    this.hForce = 1;

    this.canTriggerAction = 1;
    this.dashSx = 0;
    this.dashSy = 0;

    this.canDash = 0;
    this.dashCounter = 0;


    this.canWallRun = 1;
    this.inWallRun = 0;
    this.wallRunTime = 0;

    this.inJump = 0;
    this.canJump = 1;

    this.tileLeft = 0;
    this.tileRight = 0;
    this.tileBelow = 0;
    this.tileAbove = 0;

    this.touchingExit = 0;
  }




  // initialise the screen to blank with a border
  // remove all emitters and buttons
  var clearScreen = function() {
    for(var y = 0; y < screenRows; y++) {
      screen[y] = [];
      for(var x = 0; x < screenCols; x++) {
        if(y == 0 || x == 0 || y == screenRows - 1 || x == screenCols - 1) {
          screen[y][x] = 1;
        } else {
          screen[y][x] = 0;
        }
      }
    }

    emitters = [];
    buttons = [];    
  }

  var startLevel = function() {
    clearScreen();

    crumbleBlocks = [];

    lastTextChangeTime = getTimestamp();
    lastTextIndex1 = 0;
    lastTextIndex2 = 0;
    player.state = 1;

    // need to use false as emitter can be 0

    // initialise the player
    player.onEmitter = false;
    player.inDash = 0;
    player.inWallJump = 0;
    player.canDash = 1;
    player.sX = 0;
    player.sY = 0;

    player.canWallRun = 1;
    player.inWallRun = 0;
    player.wallRunTime = 0;


    // counter to tell if player is stuck in something
    player.uhOhCounter = 0;

    state = 0;

    if(currentLevel >= levelFunctions.length) {
      currentLevel = 0;
    }
    levelFunctions[currentLevel]();

    playSound(soundStart);
  }

  // the functions to create level layouts
  var levelFunctions = [];

  levelFunctions[0] = function() {

    exitX = 45;
    exitY = 21;

    player.x = 32;
    player.y = 270;

    // draw the walls
    for(var y = 0; y < screenRows; y++) {
      for(var x = 0; x < screenCols; x++) {
        if( 
               (y == 22 )
            || (y == 12)
          ) {
          screen[y][x] = 1;
        }

        if( ((x + 3) % 5 || x < 5 || x > screenCols - 6) && y == 16) {
          screen[y][x] = 1;
        }
      }
    }

    // add emitters

    // xpos, ypos, type, line direction, x speed, y speed, width, height
    emitters.push(new Emitter(7, 14, emitterTypeConstant, emitterDirDown, 1, 0));
    emitters.push(new Emitter(14, 14, emitterTypeConstant, emitterDirDown, 1, 0));
    emitters.push(new Emitter(21, 14, emitterTypeConstant, emitterDirDown, 1, 0));

    emitters.push(new Emitter(28, 14, emitterTypeConstant, emitterDirDown, -1, 0));
    emitters.push(new Emitter(35, 14, emitterTypeConstant, emitterDirDown, -1, 0));
    emitters.push(new Emitter(42, 14, emitterTypeConstant, emitterDirDown, -1, 0));

  }

  var buttonGreen = 3;
  var buttonBlue = 4;
  var buttonYellow = 5;
  var buttonPurple = 6;

  var stateLinesOff = 1000;

  var buttonFloor = 0;
  var buttonLeftWall = 1;
  var buttonRightWall = 2;
  var buttonCeiling = 3;


  // level 1 layout
  levelFunctions[1] = function() {
    exitX = 45;
    exitY = 5;

    player.x = 32;
    player.y = 240;


    // draw the walls
    for(var y = 0; y < screenRows; y++) {
      for(var x = 0; x < screenCols; x++) {
        if( (x > 44 && x < 49 && y == 18) 
          || (y == 6 && x > 5 && Math.floor( (x - 3) /3) % 3)
        ) {
          screen[y][x] = tileCrumble;
        }

        if( (x < 13 || x > 36) && x < 42 && y == 13) {
          screen[y][x] = tileSolid;
        }

        if( 
            ((( Math.floor( (x + 7) /3) ) % 5 || x < 8 || x > screenCols - 9) && y == 22)
            || (y == 15 && x % 2 && x > 12 && x < 37)
            || (y == 6 && x > 38)
            )
        {
          screen[y][x] = tileSolid;
        }
      }
    }

    // xpos, ypos, type, line direction, x speed, y speed, width, height
    emitters.push(new Emitter(1, 23, emitterTypeConstant, emitterDirRight, 0, 0));
    emitters.push(new Emitter(48, 23, emitterTypeConstant, emitterDirLeft, 0, 0));

    emitters.push(new Emitter(23, 13, emitterTypeConstant, emitterDirDown, 1, 0, tileWidth * 4));
    emitters.push(new Emitter(12, 14, emitterTypeConstant, emitterDirRight, 0, 0));
    emitters.push(new Emitter(37, 14, emitterTypeConstant, emitterDirLeft, 0, 0));


  }



  // level 2 layout
  levelFunctions[2] = function() {
    exitX = 45;
    exitY = 6;

    player.x = 32;
    player.y = 290;


    // draw the walls
    for(var y = 0; y < screenRows; y++) {
      for(var x = 0; x < screenCols; x++) {


        //if( y == 22 && (x < 20 || x > 29) 
        if(y == 22 && (x < 12 || (x > 19 && x < 30) || ( x > 37)  ) 
           || ( y == 18 && x < 44  && (x < 18 || x > 31))
           || ( y == 11 && x > 5) 
           || ( y == 7 && x > 1  && (x < 11 || x > 31))
          ) {
          screen[y][x] = tileSolid;
        }

      }
    }

    emitters.push(new Emitter(1, 7, emitterTypeConstant, emitterDirDown, 0, 0));
    emitters.push(new Emitter(12, 22, emitterTypeConstant, emitterDirRight, 0, 0));
    emitters.push(new Emitter(19, 22, emitterTypeConstant, emitterDirLeft, 0, 0));

    emitters.push(new Emitter(18, 18, emitterTypeConstant, emitterDirRight, 0, 0));
    emitters.push(new Emitter(31, 18, emitterTypeConstant, emitterDirLeft, 0, 0));


    emitters.push(new Emitter(30, 22, emitterTypeConstant, emitterDirRight, 0, 0));
    emitters.push(new Emitter(37, 22, emitterTypeConstant, emitterDirLeft, 0, 0));

    emitters.push(new Emitter(24, 7, emitterTypeConstant, emitterDirRight, 0, 0, 2));
    emitters.push(new Emitter(18, 7, emitterTypeConstant, emitterDirLeft, 0, 0, 2));


  }




  // level 3 layout
  levelFunctions[3] = function() {


    state = 0;
    exitX = 45;
    exitY = 6;

    player.x = 32;
    player.y = 410;



    // draw the walls
    for(var y = 0; y < screenRows; y++) {
      for(var x = 0; x < screenCols; x++) {
        if( (y == 25 && x > 30 && x < 35) 
            || (y == 20 && x > 20 && x < 25)
            || (y == 15 && x > 10 && x < 15)
            || (y == 11 && x == 21)
        ) {
          screen[y][x] = tileGreen;
        }

        if( (y == 10 && x > 20 && x < 27) 
          ||  (y == 10 && x > 36 && x < 41) 
          ) {
          screen[y][x] = tileBlue;
        }

        if( (y == 7 && x > 42 && x < 49) 
          || (y == 21 && x < 44 && x > 36) 
          || (y == 16 && x > 28 && x < 34)
          ) {
          screen[y][x] = tilePurple;
        }

        if(y == 20 && x > 43 && x < 49) {
          screen[y][x] = tileYellow;
        }

        if(y == 10 && x > 0 && x < 5) {
          screen[y][x] = tileSolid;
        }
      }
    }

    buttons.push(new Button(9, 28, buttonGreen, buttonFloor));
    buttons.push(new Button(2, 9, buttonBlue, buttonFloor));
    buttons.push(new Button(38, 9, buttonYellow, buttonFloor));
    buttons.push(new Button(45, 19, buttonPurple, buttonFloor));


    emitters.push(new Emitter(43, 14, emitterTypeConstant, emitterDirUp, 0, 0 ));
    emitters.push(new Emitter(43, 18, emitterTypeConstant, emitterDirDown, 0, 0 ));

    emitters.push(new Emitter(30, 25, emitterTypeConstant, emitterDirLeft, 0, 0 ));
    emitters.push(new Emitter(20, 20, emitterTypeConstant, emitterDirLeft, 0, 0 ));
    emitters.push(new Emitter(10, 15, emitterTypeConstant, emitterDirLeft, 0, 0 ));

    emitters.push(new Emitter(26, 11, emitterTypeConstant, emitterDirLeft, 0, 0 ));

//    emitters.push(new Emitter(18, 7, emitterTypeConstant, emitterDirLeft, 0, 0, 2));


  }


  // level 4 layout
  levelFunctions[4] = function() {

    state = tileBlue;
    exitX = 45;
    exitY = 6;

    player.x = 32;
    player.y = 390;


    // draw the walls
    for(var y = 0; y < screenRows; y++) {
      for(var x = 0; x < screenCols; x++) {

        if( (y == 21 && x < 43) 
            || (x == 42 && (y > 21 && y < 25))
            || (x == 12 && (y > 21 && y < 25))
            || (x > 44 && x < 47 && y == 17)
          ) {
          screen[y][x] = tileSolid;
        }

        if( (y == 24 && x < 42 && x > 12) 
            || (x > 46  && y == 17 && x < 49)
        ) {
          screen[y][x] = tileGreen;
        }

        if( (y == 14 && x > 5 && x < 49) 
            || (x == 6 && (y > 11 && y < 15))
          ) {
          screen[y][x] = tileBlue;
        }

        if(  (y == 14 &&  x > 5 && Math.floor( (x -1)/ 6) % 2) 
          || (x == 42 && (y > 11 && y < 16))
        ) {
          screen[y][x] = tileSolid;
        }

        if( (y == 7 && x > 42 && x < 49) 
          || (y == 6 && x == 36)
          ) {
          screen[y][x] = tilePurple;
        }

        if(y == 5 && x > 0 && x < 40) {
          screen[y][x] = tileYellow;
        }
      }
    }


//    buttons.push(new Button(1, 8, buttonGreen, buttonLeftWall));
    buttons.push(new Button(9, 28, buttonGreen, buttonFloor));
    buttons.push(new Button(45, 28, buttonGreen, buttonFloor));
    buttons.push(new Button(9, 20, buttonBlue, buttonFloor));
    buttons.push(new Button(45, 13, buttonYellow, buttonFloor));
    buttons.push(new Button(3, 4, buttonPurple, buttonFloor));
//    buttons.push(new Button(48, 20, buttonYello//w, buttonRightWall));
//    buttons.push(new Button(20, 1, buttonYellow, buttonCeiling))////;


    emitters.push(new Emitter(15, 22, emitterTypeConstant, emitterDirDown, 1, 0));
    emitters.push(new Emitter(40, 22, emitterTypeConstant, emitterDirDown, -1, 0));


    emitters.push(new Emitter(15, 12, emitterTypeConstant, emitterDirDown, 2, 0));
    emitters.push(new Emitter(28, 12, emitterTypeConstant, emitterDirDown, -2, 0));
    emitters.push(new Emitter(20, 12, emitterTypeConstant, emitterDirRight, -2, 0));
    emitters.push(new Emitter(31, 12, emitterTypeConstant, emitterDirLeft, -2, 0));
    emitters.push(new Emitter(40, 12, emitterTypeConstant, emitterDirDown, -2, 0));

    emitters.push(new Emitter(43, 15, emitterTypeConstant, emitterDirDown, -2, 0));

    emitters.push(new Emitter(40, 6, emitterTypeConstant, emitterDirLeft, 0, 0));
  }


  // level 5 layout
  levelFunctions[5] = function() {

    player.x = 32;
    player.y = 390;

    state = tilePurple;
    exitX = 45;
    exitY = 28;

    // draw the walls
    for(var y = 0; y < screenRows; y++) {
      for(var x = 0; x < screenCols; x++) {
        if( 
            (y == 23 && (x < 22 || x > 27)) 
            || ( y == 18 && (x > 3 && x < 43))
            || ( x == 43 && (y > 3 && y < 14))
            || ( x == 37 && (y > 5 && y < 15) && y != 13)
            || ( x == 31 && (y > 3 && y < 18) && y != 6)
            || ( x == 25 && (y > 0 && y < 15) && y != 13)
          ) {
          screen[y][x] = tileSolid;
        }

        if( (x == 41 && y > 23 && y < 29)) {
          screen[y][x] = tilePurple;
        }

        if( (x > 0 && x < 25 && y == 1)
          || (x == 1 && y > 1 && y < 14)
          || (x == 24 && y > 1 && y < 14)

          ) {
          screen[y][x] = tileReflective;
        }

        if(y == 14 && x > 0 && x < 25) {
          screen[y][x] = tilePurple;
        }

        if(y == 18 && x > 0 && x < 4) {
          screen[y][x] = tilePurple;
        }


      }
    }

    buttons.push(new Button(24, 17, buttonGreen, buttonFloor));


    emitters.push(new Emitter(22, 23, emitterTypeConstant, emitterDirRight, 0, 0));
    emitters[emitters.length - 1].flash = 1;

    emitters.push(new Emitter(27, 23, emitterTypeConstant, emitterDirRight, 0, 0));
    emitters[emitters.length - 1].flash = 1;



    emitters.push(new Emitter(43, 18, emitterTypeConstant, emitterDirUp, 0, 0));
    emitters.push(new Emitter(37, 5, emitterTypeConstant, emitterDirUp, 0, 0));

    emitters.push(new Emitter(31, 6, emitterTypeConstant, emitterDirRight, 0, 0));
    emitters[emitters.length - 1].flash = 1;

    emitters.push(new Emitter(37, 13, emitterTypeConstant, emitterDirLeft, 0, 0));
    emitters[emitters.length - 1].flash = 1;

    emitters.push(new Emitter(25, 13, emitterTypeConstant, emitterDirRight, 0, 0));
    emitters[emitters.length - 1].flash = 1;

    emitters.push(new Emitter(12, 8, emitterTypeRotate, 1.5, 0, 0));
    emitters[emitters.length - 1].flash = 1;

  }


  // level 6 layout
  levelFunctions[6] = function() {

    player.x = 32;
    player.y = 390;

    state = 0;
    exitX = 45;
    exitY = 6;

    // draw the walls
    for(var y = 0; y < screenRows; y++) {
      for(var x = 0; x < screenCols; x++) {
        if( (y == 11 && x < 11)
            || (y < 12 && x == 11)
            || (y == 7 && x > 42)
            || (y == 27 && x < 5) 
          ) {
          screen[y][x] = tileSolid;
        }

        if(  (y == 8 && x > 40 && x < 49) 
            || ( y == 18 && x > 0 && x < 5) 
            || (x > 36 && x < 43 && y == 21)

         ) {
          screen[y][x] = tilePurple;
        }

        if( (x > 8 && x < 15 && y == 22)
            || (x > 36 && x < 43 && y == 25)
            || (x > 36 && x < 43 && y == 9)
        ) {
          screen[y][x] = tileGreen;
        }


        if( (x > 8 && x < 15 && y == 18)
            || (x == 18 && y == 5)
            || (x > 36 && x < 43 && y == 17)

        ) {
          screen[y][x] = tileYellow;
        }

        if( (x > 20 && x < 29 && y == 23)
            || (x > 36 && x < 43 && y == 13)
            || (x == 31 && y == 5)
        ) {
          screen[y][x] = tileBlue;
        }

      }
    }


    buttons.push(new Button(5, 10, buttonGreen, buttonFloor));
    buttons.push(new Button(10, 5, buttonBlue, buttonRightWall));
    buttons.push(new Button(5, 1, buttonYellow, buttonCeiling));
    buttons.push(new Button(1, 5, buttonPurple, buttonLeftWall));

    emitters.push(new Emitter(5.5, 5.5, emitterTypeRotate, 12, 0, 0));
    emitters.push(new Emitter(1, 29, emitterTypeConstant, emitterDirRight, 0, 0));

    emitters.push(new Emitter(18, 1, emitterTypeConstant, emitterDirDown, 0, 0));
    emitters.push(new Emitter(31, 1, emitterTypeConstant, emitterDirDown, 0, 0));

  }



  // level 7 layout
  levelFunctions[7] = function() {

    state = tilePurple;
    player.x = 32;
    player.y = 390;

    exitX = 4;
    exitY = 22;

    // draw the walls
    for(var y = 0; y < screenRows; y++) {
      for(var x = 0; x < screenCols; x++) {
        if( ((y == 23 && x % 2 && x < 47) 
            || (y == 12 && !((x + 1) % 3)))
          && x >0 && x < 49
          ) {
          screen[y][x] = tileReflective;
        }

        if(y == 23 && x < 10) {
          screen[y][x] = tileSolid;
        }
        if( (x > 0 && x < 10 && y == 24)
            || ( x == 9 && y > 13 && y > 24 && y < 29)) {
          screen[y][x] = tilePurple;

            }
      }
    }

    buttons.push(new Button(6, 28, buttonGreen, buttonFloor));

    emitters.push(new Emitter(5, 4, emitterTypeConstant, emitterDirDownLeft, 1, 0));
    emitters.push(new Emitter(28, 6, emitterTypeConstant, emitterDirDownRight, -1, 0));
    emitters.push(new Emitter(10, 8, emitterTypeConstant, emitterDirDownRight, -1, 0));
    emitters.push(new Emitter(18, 10, emitterTypeConstant, emitterDirDownLeft, 1, 0));

  }



  // level 7 layout
  levelFunctions[8] = function() {

    state = tilePurple;
    player.x = 32;
    player.y = 390;

    exitX = 45;
    exitY = 5;

    // draw the walls
    for(var y = 0; y < screenRows; y++) {
      for(var x = 0; x < screenCols; x++) {

        if(y == 6 && x > 42) {
          screen[y][x] = tileSolid;
        }

        if(
          (y == 21 && x > 30 && x < 49) 
          || (y == 14 && x > 8 && x < 24) 
          || (y == 7 && x > 30 && x < 49) 
          ) {
          screen[y][x] = tileCrumble;
        }
      }
    }


    emitters.push(new Emitter(1, 8, emitterTypeConstant, emitterDirRight, 0, 0));
    emitters[emitters.length - 1].flash = 1;
    emitters[emitters.length - 1].flashEmitterOnTime = 400;
    emitters[emitters.length - 1].flashEmitterOffTime = 400;

    emitters.push(new Emitter(49, 15, emitterTypeConstant, emitterDirLeft, 0, 0));
    emitters[emitters.length - 1].flash = 1;
    emitters[emitters.length - 1].flashEmitterOnTime = 800;
    emitters[emitters.length - 1].flashEmitterOffTime = 800;

    emitters.push(new Emitter(1, 22, emitterTypeConstant, emitterDirRight, 0, 0));
    emitters[emitters.length - 1].flash = 1;
    emitters[emitters.length - 1].flashEmitterOnTime = 1000;
    emitters[emitters.length - 1].flashEmitterOffTime = 1000;


    emitters.push(new Emitter(42, 1, emitterTypeConstant, emitterDirDown, 0, 0));
    emitters[emitters.length - 1].flash = 1;
    emitters[emitters.length - 1].flashEmitterOnTime = 300;
    emitters[emitters.length - 1].flashEmitterOffTime = 300;

//    emitters.push(new Emitter(49, 10, emitterTypeConstant, emitterDirLeft, 0, 0));

  }



  // level 9 layout
  levelFunctions[9] = function() {

    state = tilePurple;
    player.x = 32;
    player.y = 390;

    exitX = 45;
    exitY = 5;

    // draw the walls
    for(var y = 0; y < screenRows; y++) {
      for(var x = 0; x < screenCols; x++) {

        if(y == 6 && x > 42) {
          screen[y][x] = tileSolid;
        }

        if(y == 6 && x > 0 && x < 5) {
          screen[y][x] = tileGreen;
        }

        if(
          (y == 8 && x > 22 && x < 49) 
          || (y == 22 && x > 22 && x < 49) 
          || (x == 9 && y > 0 && y < 20)
          ){
          screen[y][x] = tileReflective;
          }



        if( (x > 35 && y == 20 && x < 49)
        || ( x > 9 && x < 14 && y == 15)
        ) {
          screen[y][x] = tileYellow;
        }
        if( (x > 0 && x < 10 && y == 24)
            || ( x == 9 && y > 13 && y > 24 && y < 29)  
            || ( x > 9 && x < 23 && y == 8)) {
          screen[y][x] = tilePurple;

            }



      }
    }

    buttons.push(new Button(6, 28, buttonGreen, buttonFloor));
    buttons.push(new Button(46, 21, buttonPurple, buttonFloor));

    buttons.push(new Button(2, 5, buttonYellow, buttonFloor));
    buttons.push(new Button(45, 28, buttonBlue, buttonFloor));


    emitters.push(new Emitter(24, 15, emitterTypeRotate, -1, 0, 0));
    emitters[emitters.length - 1].flash = 1;
    emitters[emitters.length - 1].flashEmitterOnTime = 400;
    emitters[emitters.length - 1].flashEmitterOffTime = 400;


    emitters.push(new Emitter(15, 5, emitterTypeRotate, 1, 0, 0));
    emitters[emitters.length - 1].flash = 1;
    emitters[emitters.length - 1].flashEmitterOnTime = 400;
    emitters[emitters.length - 1].flashEmitterOffTime = 400;
  }


  // level 9 layout
  levelFunctions[10] = function() {

    state = tileBlue;
    exitX = 45;
    exitY = 5;

    // draw the walls
    for(var y = 0; y < screenRows; y++) {
      for(var x = 0; x < screenCols; x++) {
        if(y == 6 && x > 42) {
          screen[y][x] = tileSolid;
        }
      }
    }

    player.x = 32;
    player.y = 390;

    emitters.push(new Emitter(5, 28, emitterTypeConstant, emitterDirDown, 1, 1, tileWidth * 3, tileHeight, tileHeight * 5));
    emitters.push(new Emitter(9, 28, emitterTypeConstant, emitterDirDown, -1, 1, tileWidth * 3, tileHeight, tileHeight * 5));

  }

  var keyDown = function(event) {

    // init sound from a user action
    if(audioContext == null) {
      initSound();
    }

    switch(event.keyCode) {
      case 37: // left
        leftKey = 1;
        event.preventDefault();
      break;
      case 39: // right
        rightKey = 1;
        event.preventDefault();
      break;
      case 38: // up
        upKey = 1;
        event.preventDefault();
      break;
      case 40: // down
        downKey = 1;
        event.preventDefault();
        break;

      break;
      case 90: // z
      case 67: // c
        jumpKey = 1;
        event.preventDefault();
      break;
      case 88: // x
        actionKey = 1;
        event.preventDefault();
      break;
    }
  }

  var keyUp = function(event) {
    switch(event.keyCode) {
      case 37: // left
        leftKey = 0;
      break;
      case 39: // right
        rightKey = 0;
      break;
      case 38: // up
        upKey = 0;
      break;
      case 40: // down
        downKey = 0;
      break;
      case 90: // z
      case 67: // c
        jumpKey = 0;
      break;
      case 88: // x
        actionKey = 0;
      break;
    }
  }



  // update player acceleration, speed
  var playerUpdate = function(time, dt) {


    if(player.state == 0) {
      player.stateTimer += dt;
      if(player.stateTimer > 500) {

        startLevel();

      } else {
        return;
      }
    }

    if(player.state == 2) {
      player.stateTimer += dt;
      if(player.stateTimer > 600) {
        currentLevel++;
        startLevel();
      } else {
        return;
      }
    }
    // variables affecting player movement

    // force down if not touching anything
    var gravity = 0.0025;

    // force down if touching wall left or right
    var gravityTouchingWall = 0.001;

    // max down speed in air
    var maxYSpeed = 0.3;
    // max down speed if touching wall
    var maxYSpeedWall = 0.2;


    var dashSpeed = 0.9;

    // horizontal force player can apply if touching the ground
    var hForce       = 0.003;
    // horizontal force player can apply if in air  
    var hForceAir    = 0.0027;

    // force that stops player if player not pushing left or right 
    var hFriction    = 0.005;//0.0014;
    var hFrictionAir = 0.001;// 0.002;//0.0004;

    var maxXSpeed = 0.28;//0.3;
    var jumpForce = -0.35;
    var wallJumpForce = 0.38;//0.28;//0.45;

    var maxJumpHeight = tileHeight * 5.5;//4.8;//3.5;
    var dashDistance = 128;
    var wallJumpDistance = tileWidth * 4 + tileWidth / 2;; + tileWidth / 2;
    var maxWallRunTime = 600;

    // player actions
    var actionIdle = 1;
    var actionIdleBlink = 2;
    var actionRunRight = 3;
    var actionRunLeft = 4;
    var actionRunUpRight = 5;
    var actionRunUpLeft = 6;
    var actionWallSlideRight = 7;
    var actionWallSlideLeft = 8;
    var actionJump = 9;
    var actionFalling = 10;

    // find what is around the player
    var spriteIndex = player.baseFrame + player.currentFrame;
    if(spriteIndex < spriteBounds.length) {
      player.bounds = spriteBounds[spriteIndex];    
      checkActorBounds(player, true);    
      checkActorBounds(player, true);          
    }




    // does what the player is standing on have a speed?
    var belowSx = 0;
    var belowSy = 0;


    player.onEmitter = false;
    if(player.tileBelow >= 50 && player.tileBelow < 100) {
      // player is on an emitter
      // move the player with the emitter

      var emitterIndex = player.tileBelow - 50;
      player.onEmitter = emitterIndex;

      if(emitterIndex < emitters.length) {
        var emitter = emitters[emitterIndex];


        if(player.y > emitter.y - spriteSize + player.bounds[1]) {
          player.y = emitter.y - spriteSize + player.bounds[1];
        }
//        console.log('set player y to ' + player.y + ',' + player.bounds[1]);
        belowSx = emitter.sX;
        if(emitter.sY > 0) {
          belowSy = emitter.sY;
        }
      }
    }

    player.maxSX = maxXSpeed;



    var playerAction = player.lastAction;

    if(downKey && player.touchingExit) {
      playSound(soundLevelEnd);
      player.state = 2;
      player.stateTimer = 0;
      return;
    }

    if(!player.inDash && !player.inWallJump) {

      if(!player.tileBelow) {
        // nothing below player

        // down is just standard gravity
        player.gravityForce = gravity;
        player.maxSY = maxYSpeed;


        if(player.lastAction == actionJump) {
          // finishing a jump
          if(player.lastDirection >= 0) {
            player.baseFrame = jumpRightIndex;
          } else {
            player.baseFrame = jumpLeftIndex;
          }
        } else {
          // falling
          if(player.lastDirection >= 0) {
            player.baseFrame = fallRightIndex;
          } else {
            player.baseFrame = fallLeftIndex;
          }
          playerAction = actionFalling;
        }
        player.frameCount = 1;

        // if wall sliding and moving down, then reduce force and maxsy
        if(player.sY > 0) {
          if(player.tileLeft) {
            // theres something to the left, so wall slide left
            playerAction = actionWallSlideLeft;
            player.baseFrame = wallSlideLeftIndex;
            player.frameCount = wallSlideLeftFrames;
            player.gravityForce= gravityTouchingWall;
            player.maxSY = maxYSpeedWall;
          } else if(player.tileRight) {
            //theres something to the right so wall slide right
            playerAction = actionWallSlideRight;
            player.baseFrame = wallSlideRightIndex;
            player.frameCount = wallSlideRightFrames;

            player.gravityForce = gravityTouchingWall;
            player.maxSY = maxYSpeedWall;
          } 
        }

        // calculate y speed
        player.sY += player.gravityForce * dt;
        if(player.sY > player.maxSY) {
          player.sY = player.maxSY;
        }

        // in air so less friction
        player.hFriction = hFrictionAir;
        player.hForce = hForceAir;

      } else {
        // player touching ground..

        // set y speed to zero if its a down speed
        if(player.sY > 0) {
          player.sY = 0;
        }

        // on ground..
        player.hFriction = hFriction;
        player.hForce = hForce;

        // reset dash
        player.canDash = 1;
        player.dashCounter = 0;

        player.canWallRun = 1;
        player.wallRunTime = 0;
        player.inWallJump = 0;
      }
    }

    if(player.tileBelow) {
      player.wallRunTime = 0;
      player.inWallJump = 0;
      player.canWallRun = 1;

    }

    // if not left or right, reduce player speed
    if(!leftKey && !rightKey && !player.inDash && !player.inWallJump) {
      if(!player.tileBelow) {
        if(player.lastAction == actionRunUpRight) {
          // just finished running up right... need to adjust position cos going vertical to horizontal
          player.x += 2;
        }

        if(player.lastAction == actionRunUpLeft) {
          // just finished running up left... need to adjust position cos going vertical to horizontal
          player.x -= 2;
        }
      }

      // is actor moving left, slow down speed
      if(player.sX > 0) {
        player.sX -= player.hFriction * dt;
        // has it gone to far? if so, set to zero
        if(player.sX < 0) {
          player.sX = 0;
        }
      }

      // is actor moving right, slow down speed
      if(player.sX < 0) {
        player.sX += player.hFriction * dt;
        // has it gone to far? if so, set to zero
        if(player.sX > 0) {
          player.sX = 0;
        }
      }


      if(player.tileBelow) {
        // player on ground not going left or right, so idle..
        playerAction = actionIdle;
        if(player.lastDirection >= 0) {

          // dont want to switch if in a blink
          if(player.baseFrame != idleRightBlinkIndex) {
            player.baseFrame = idleRightIndex;
            player.frameCount = idleRightFrames;
          }
        } else {
          // dont want to switch if in a blink
          if(player.baseFrame != idleLeftBlinkIndex) {
            player.baseFrame = idleLeftIndex;
            player.frameCount = idleLeftFrames;      
          }
        }

      }
    }

    if(actionKey) {
      // action button only trigger action once.
      if(player.canTriggerAction) {

        player.canTriggerAction = 0;

        if(player.canDash) {
          playSound(soundDash);
          player.canDash = 0;
          player.inDash = 1;
          dashGhosts = [];


          player.dashSy = 0;
          player.dashSx = 0;

          player.frameCount = 1;

          if(upKey) {
            if(!player.tileAbove) {
              player.sY = -dashSpeed;
              player.baseFrame = dashUpIndex;
            }
            if(leftKey) {
              player.sX = -dashSpeed
              player.baseFrame = dashUpLeftIndex;
            }
            if(rightKey) {
              player.sX = dashSpeed;
              player.baseFrame = dashUpRightIndex;
            }
          } else if(leftKey) {
            player.sX = -dashSpeed;
            player.sY = 0;
            player.baseFrame = dashLeftIndex;
          } else if(rightKey) {
            player.sX = dashSpeed;
            player.sY = 0;
            player.baseFrame = dashRightIndex;
          } else if(player.lastDirection < 0) {
            player.sX = -dashSpeed;
            player.sY = 0;
            player.baseFrame = dashLeftIndex;
          } else {
            player.sX = dashSpeed;
            player.sY = 0;
            player.baseFrame = dashRightIndex;

          }

          player.dashStartX = player.x;
          player.dashStartY = player.y;

          console.log('action key!');
        }
      }

    } else {
      player.canTriggerAction = true;
    }


    if(leftKey && !player.inDash && !player.inWallJump) {

      if(!player.tileBelow && player.tileLeft) {

        if(player.sY < 0 && player.canWallRun) {
          // player running up left wall
          player.sY = -(0.3 * (maxWallRunTime - player.wallRunTime) / maxWallRunTime ) ;

          player.inWallRun = 1;

          playerAction = actionRunUpLeft;
          player.baseFrame = runUpLeftIndex;
          player.frameCount = runUpLeftFrames;
        } else {
          // player sliding
          playerAction = actionWallSlideLeft;
          player.baseFrame = wallSlideLeftIndex;
          player.frameCount = wallSlideLeftFrames;
          player.inWallRun = 0;
        }

      } else {
        // player is moving left on ground or in air
        player.sX -= player.hForce * dt;
        if(player.sX < -player.maxSX) {
          player.sX = -player.maxSX;
        }

        if(player.tileBelow) {
          playerAction = actionRunLeft;
          player.baseFrame = runLeftIndex;
          player.frameCount = runLeftFrames;
        }
      }
    }

    if(rightKey && !player.inDash && !player.inWallJump) {
      if(!player.tileBelow && player.tileRight) {
        if(player.sY < 0 && player.canWallRun) {
          // player running up right wall
          player.sY = -(0.3 * (maxWallRunTime - player.wallRunTime) / maxWallRunTime ) ;   

          player.inWallRun = 1;


          playerAction = actionRunUpRight;
          player.baseFrame = runUpRightIndex;
          player.frameCount = runUpRightFrames;
        } else {
          // player sliding
          playerAction = actionWallSlideRight;
          player.baseFrame = wallSlideRightIndex;
          player.frameCount = wallSlideRightFrames;  
          player.inWallRun = 0;        
        }


      } else {

        // player is moving right on ground or in air
        player.sX += player.hForce * dt;
        if(player.sX > player.maxSX) {
          player.sX = player.maxSX;
        }

        if(player.tileBelow) {
          playerAction = actionRunRight;
          player.baseFrame = runRightIndex;
          player.frameCount = runRightFrames;
        }
      }
    } else {
//      console.log('here = ' + time);
    }


    /*********** JUMP *************/
    if(!player.inWallJump && !player.inDash) {
      if(jumpKey) {//} && !player.inWallJump) {

        if(!player.tileAbove) {

          if(player.inJump) {

            // if in a jump, continue the jump
            player.sY = jumpForce; 

            if(player.y + (player.sY * dt) < player.jumpStartY - maxJumpHeight) {
              // reached top of jump
              player.sY = 0;//((player.jumpStartY - maxJumpHeight) - player.y) / dt;
              player.y = player.jumpStartY - maxJumpHeight;
              player.inJump = false;
            }

            playerAction = actionJump;
            if(player.lastDirection >= 0) {
              player.baseFrame = jumpRightIndex;
            } else {
              player.baseFrame = jumpLeftIndex;
            }
            player.frameCount = 1;
          } else if(player.canJump) {

            // if there is tile below, can jump
            if(player.tileBelow) {
              playSound(soundJump);
              // starting a jump
              player.inJump = 1;
              player.canJump = 0;
              player.sY = jumpForce;
              player.jumpStartY = player.y;

              playerAction =- actionJump;
              if(player.lastDirection >= 0) {
                player.baseFrame = jumpRightIndex;
              } else {
                player.baseFrame = jumpLeftIndex;
              }

              player.frameCount = 1;
            } else if(player.tileRight) {
              // starting a jump
              playSound(soundJump);

              player.inJump = 1;
              player.inWallJump = 1;
              player.canJump = 0;
              player.sY = jumpForce;
              player.sX = -wallJumpForce;
              player.jumpStartY = player.y;

              player.dashStartX = player.x;
              player.dashStartY = player.y;


              player.baseFrame = jumpLeftIndex;
              player.frameCount = 1;

            } else if(player.tileLeft) {
              console.log('wall jump!');
              // starting a jump
              player.inJump = 1;
              playSound(soundJump);

              player.inWallJump = 1;            
              player.canJump = 0;
              player.sY = jumpForce;
              player.sX = wallJumpForce;
              player.jumpStartY = player.y;

              player.dashStartX = player.x;
              player.dashStartY = player.y;


              player.baseFrame = jumpRightIndex;
              player.frameCount = 1;

            }
          }
        } else {
          // player is trying to jump and there is a tile above them...
          if(player.inJump) {
            player.inJump = false;
            playerAction = actionFalling;
          }

        }
      } else {

        player.inJump = 0;
        player.canJump = 1;
      }
    }

    if(!player.tileBelow && !player.inDash && !player.inWallJump) {
      // in the air, is the player jumping or falling?
      if(player.lastAction == actionJump || playerAction == actionJump) {
        if(player.sX > 0) {
          player.baseFrame = jumpRightIndex;
          player.frameCount = jumpRightFrames;
        } else if(player.sX < 0) {
          player.baseFrame = jumpLeftIndex;
          player.frameCount = jumpRightFrames;
        } 
      } else {
        // falling..
        if(player.sX > 0) {
          player.baseFrame = fallRightIndex;
          player.frameCount = fallRightFrames;
        } else if(player.sX < 0) {
          player.baseFrame = fallLeftIndex;
          player.frameCount = fallLeftFrames;
        } 
      }
    }

    if(player.sX != 0) {
      player.lastDirection = player.sX;
    }


    // set player speed to zero if there is something in the direction the player is moving
    if( (player.tileLeft && player.sX < 0) || (player.tileRight && player.sX > 0) ) {
      player.sX = 0;
      player.inDash = 0;
      player.inWallJump = 0;
    }


    if(player.tileAbove && player.sY < 0) {
      player.sY = 0;
      player.inDash = 0;
      player.inWallJump = 0;
    }






    // move the player
    player.x += (player.sX + belowSx) * dt;
    player.y += (player.sY + belowSy) * dt;

    // is wall run time over?
    if(player.inWallRun) {
      player.wallRunTime += dt;
      if(player.wallRunTime > maxWallRunTime) {
        player.canWallRun = false;
      }
    }

    var noControlDistance = dashDistance;
    if(player.inWallJump) {
      noControlDistance = wallJumpDistance;
    }
    if(player.inDash || player.inWallJump) {

      dashGhosts.push([player.x, player.y]);

      if(player.dashStartX > player.x) {
        var dashDistanceX = player.dashStartX - player.x;
        if(dashDistanceX > noControlDistance) {
          player.inDash = 0;
          player.inWallJump = 0;
          player.x = player.dashStartX - noControlDistance;
          if(player.sX < 0) {
            player.sX = -player.maxSX;
          }
        }
      }

      if(player.dashStartX < player.x) {
        var dashDistanceX = player.x - player.dashStartX;
        if(dashDistanceX > noControlDistance) {
          player.inDash = 0;
          player.inWallJump = 0;
          player.x = player.dashStartX + noControlDistance;
          if(player.sX > 0) {
            player.sX = player.maxSX;
          }
        }
      }

      if(player.dashStartY > player.y) {
        var dashDistanceY = player.dashStartY - player.y;
        if(dashDistanceY > noControlDistance) {
          player.inDash = 0;
          player.inWallJump = 0;
          player.y = player.dashStartY - noControlDistance;
          if(player.sY < 0) {
            player.sY = -player.maxSY;
          }
        }
      }

      if(player.dashStartY < player.y) {
        var dashDistanceY = player.y - player.dashStartY;
        if(dashDistanceY > noControlDistance) {
          player.inDash = 0;
          player.inWallJump = 0;
          player.y = player.dashStartX + noControlDistance;
          if(player.sY > 0) {
            player.sY = player.maxSY;
          }
        }
      }

    }
    

    if(playerAction != player.lastAction) {
      player.frameTime = 0;
      player.currentFrame = 0;
      player.lastAction = playerAction;
      player.lastActionTime = time;
    } else {
      var diff = time - player.lastActionTime;

      if(playerAction == actionIdle) {//&& time - player.lastActionTime > 3000) {
        if(time - player.lastActionTime > 3000) {
          if(player.baseFrame == idleLeftIndex) {            
            if(Math.random() > 0.3) {
              player.baseFrame = idleLeftBlinkIndex;
            }
          } else if(player.baseFrame == idleRightIndex) {
            if(Math.random() > 0.3) {
              player.baseFrame = idleRightBlinkIndex;
            }
          }
          player.lastActionTime = time;          
        }

        if(time - player.lastActionTime > 280) {
          if(player.baseFrame == idleLeftBlinkIndex) {
            player.lastActionTime = time;
            player.baseFrame = idleLeftIndex;
          } else if(player.baseFrame == idleRightBlinkIndex) {
            player.lastActionTime = time;
            player.baseFrame = idleRightIndex;
          }
        }
      }

    }

    player.frameTime += dt;
    if(player.frameTime > 25) {
      player.frameTime = 0;
      player.currentFrame++;
      if(player.currentFrame >= player.frameCount) {
        player.currentFrame = 0;
      }
    }

    // make sure the player isn't inside anything


    spriteIndex = player.baseFrame + player.currentFrame;
    if(spriteIndex < spriteBounds.length) {
      player.bounds = spriteBounds[spriteIndex];    
      checkActorBounds(player, false);    
      checkActorBounds(player, false);          
    }

    if(player.tileAbove && player.tileBelow && (player.tileLeft || player.tileRight)) {
      player.uhOhCounter++;

      if(player.uhOhCounter > 10) {
        // player is stuck, so reset
        player.state = 0;
        player.stateTimer = 0;
        playSound(soundDie);
      }

    } else {
      player.uhOhCounter = 0;
    }
  }


  var crumbleStart = 1;
  var crumbleClear = 2;

  var tileCrumble = 7;
  var tileCrumbleStart = 8;
  var tileCrumbleDone = 9;

  var crumbleTime = 280;


  var addCrumbleBlock = function(x, y) {
    for(var i = 0; i < crumbleBlocks.length; i++) {
      if(crumbleBlocks[i][0] === x && crumbleBlocks[i][1] == y) {
        // already added
        return;
      }
    }

    var time = getTimestamp();
    crumbleBlocks.push([x, y, time]);
    screen[y][x] = tileCrumbleStart;
  }

  var updateCrumbleBlocks = function(time) {
    

    for(var i = crumbleBlocks.length - 1; i >= 0; i--) {
///      if() {
        var x = crumbleBlocks[i][0];
        var y = crumbleBlocks[i][1];
        // change crumbleblock state
        if(screen[y][x] == tileCrumbleStart && (time - crumbleBlocks[i][2]) > crumbleTime) {
          // clear the tile
          crumbleBlocks[i][2] = time;
          screen[y][x] = 0;
        } else if(screen[y][x] == 0 && (time - crumbleBlocks[i][2]) > crumbleTime * 4) {
          screen[y][x] = tileCrumble;

          crumbleBlocks.splice(i, 1);
        }
//      }
    }

  }


  var setColorState = function(colorState) {
    if(state != colorState) {
      state = colorState;
      playSound(state - tileGreen + soundGreen);
    }

  }
  // find whats around the actor
  var checkActorBounds = function(actor) {
    var tile = 0;

    var bounds = actor.bounds;

    /*
    var x = Math.floor(actor.x) + bounds[0];
    var y = Math.floor(actor.y) + bounds[1] ;
    var width = bounds[2] - bounds[0] ;
    var height = bounds[3] - bounds[1] ;
    */

    var leftEdge = Math.floor(actor.x) + bounds[0];
    var rightEdge = Math.floor(actor.x) + bounds[2];
    var topEdge = Math.floor(actor.y) + bounds[1];
    var bottomEdge = Math.floor(actor.y) + bounds[3];


    // check top edge
    actor.tileAbove = 0;
    actor.tileBelow = 0;
    actor.tileLeft = 0;
    actor.tileRight = 0;

    var testX = 0;
    var testY = 0;

    // check top edge
    testY = topEdge - 1;

    if(testY < 0) {
      actor.tileAbove = 1;
    } else {
      for(testX = leftEdge + 1; testX < rightEdge; testX++) {
        var onAbove = screenBuffer[testY * screenWidth + testX];
        if(onAbove > 0 && (onAbove < 10 || ( onAbove >= 50 && onAbove < bufferBeam && actor.actorType != emitterActorType ))) {
          actor.tileAbove = onAbove;
          break;
        }
      }
    }

    // shift actor out of anything ABOVE
    if(actor.tileAbove) {

      // find a row that is clear
      var clear = false;

      for(testY = topEdge; testY < bottomEdge; testY++) {
        for(testX = leftEdge + 1; testX < rightEdge; testX++) {
          clear = true;
          var onAbove = screenBuffer[testY * screenWidth + testX];
          if(onAbove > 0 && (onAbove < 10 || ( onAbove >= 50 && onAbove < bufferBeam && actor.actorType != emitterActorType)  )) {
            clear = false;
            break;
          }
        }

        if(clear) {

          // if the actor is already a fraction below, dont want to readjust
          if(actor.y + bounds[1] < testY ) {
            actor.y = testY - bounds[1];
          }
          break;
        }
      }
    }


    // check bottom edge

    var lastCrumbleTileX = false;
    var lastCrumbleTileY = false;

    testY = bottomEdge + 1; // y + height;
    if(testY >= screenHeight) {
      actor.tileBelow = 1;
    } else {
      
      for(testX = leftEdge + 1; testX < rightEdge; testX++) {
        var below = screenBuffer[testY * screenWidth + testX];
        if(below > 0 && (below < 30 || (below >= 50 && below < bufferBeam && actor.actorType != emitterActorType)  )    ) {
          actor.tileBelow = below;

          if(below == tileCrumble) {
            var tileX = Math.floor(testX / tileWidth);
            var tileY = Math.floor(testY / tileHeight);
            if(tileX !== lastCrumbleTileX || tileY !== lastCrumbleTileY) {
              addCrumbleBlock(tileX, tileY);
            }
          }

          if(actor.tileBelow > 10 && actor.tileBelow < 30) {
            // its a button, find if button is on something solid...
            var buttonTileX = Math.floor(testX / tileWidth);
            var buttonTileY = Math.floor(testY / tileHeight);
            if(buttonTileX > 0 && buttonTileX < screenCols - 1 && buttonTileY > 0 && buttonTileY < screenRows - 1) {
              if(screenBuffer[ (buttonTileY + 1) * tileHeight * screenWidth + buttonTileX * tileWidth] > 0) {
                if(state != actor.tileBelow - 10) {
                  setColorState(actor.tileBelow - 10);
                  
                }
              } else {
                actor.tileBelow = 0;
              }
            }
          }


//          break;
        }
      }
    }



    // shift actor out of anything BELOW
    if(actor.tileBelow) {
      // find out how much need to shift it to not be inside
      // find a column from the left that is clear
      var clear = false;

      for(testY = bottomEdge; testY > topEdge; testY--) {
        for(testX = leftEdge + 1; testX < rightEdge; testX++) {
          clear = true;
          var below = screenBuffer[testY * screenWidth + testX];
          if(below > 0 && (below < 30 || (below >= 50 && below < bufferBeam && actor.actorType != emitterActorType)  )    ) {
            clear = false;
            break;
          }
        }

        if(clear) {

          // if the actor is already a fraction above, dont want to readjust
          if(actor.y + bounds[3] > testY ) {
            actor.y = testY - bounds[3];
            /*
            if(actor.actorType != emitterActorType) {

              console.log('shift actor yto ' + actor.y + 'tety = ' + testY + ', bottomedge = ' + bottomEdge);
            }
            */
          }
          break;
        }
      }
    }

    // redo the edges
    topEdge = Math.floor(actor.y) + bounds[1];
    bottomEdge = Math.floor(actor.y) + bounds[3];

    // check LEFT! edge
    testX = leftEdge - 1;
    if(testX < 0) {
      actor.tileLeft = 1;
    } else {
      for(testY = topEdge + 1; testY < bottomEdge; testY++) {
        var left = screenBuffer[testY * screenWidth + testX];
        if(left > 0 && (left < 10 || (left >= 50 && left < bufferBeam && actor.actorType != emitterActorType))) {
          actor.tileLeft = left;
          break;
        }
      }
    }



    // shift actor out of anything on left
    if(actor.tileLeft) {

      // find a column from the left that is clear
      var clear = false;
      for(testX = leftEdge; testX < rightEdge; testX++) {
        for(testY = topEdge + 1; testY < bottomEdge; testY++) {
          clear = true;
          var left = screenBuffer[testY * screenWidth + testX];
          if(left > 0 && (left < 10 || (left >= 50 && left < bufferBeam && actor.actorType != emitterActorType))) {

            clear = false;
            break;
          }
        }

        if(clear) {
          if(actor.x + bounds[0] < testX) {
            actor.x = testX - bounds[0];
          }
          break;
        }
      }
    }


    // check right edge
    testX = rightEdge + 1;
    if(testX >= screenWidth) {
      actor.tileRight = 1;
    } else {
      for(testY = topEdge + 1; testY < bottomEdge; testY++) {
        var onRight = screenBuffer[testY * screenWidth + testX];
        if(onRight > 0 && (onRight < 10 || ( onRight >= 50 && onRight < bufferBeam && actor.actorType != emitterActorType) )  ) {
          actor.tileRight = onRight;
          break;
        }
      }
    }



    // shift actor out of anything To the right
    if(actor.tileRight) {

      // find a column from the left that is clear
      var clear = false;

      for(testX = rightEdge; testX > leftEdge ; testX --) {
        for(testY = topEdge + 1; testY < bottomEdge ; testY++) {
          clear = true;
          var onRight = screenBuffer[testY * screenWidth + testX];
          if(onRight > 0 && (onRight < 10 || ( onRight >= 50 && onRight < bufferBeam && actor.actorType != emitterActorType) )  ) {
            clear = false;
            break;
          }
        }
        if(clear) {

          if(actor.x + bounds[2] > testX) {
            actor.x = testX - bounds[2];
/*
            if(actor.actorType != emitterActorType) {
              console.log('shift actor xto ' + actor.x + 'tetx = ' + testX + ', rightedge = ' + rightEdge);
            }
*/            
          }
          break;
        }
      }
    }
  }


  // create the different tiles..
  var createTiles = function() {
    tileCanvas.height = tileHeight;
    tileCanvas.width = 40 * tileWidth;
    var context = tileCanvas.getContext('2d');

    // crumble tiles
    for(var y = 0; y < tileHeight; y++) {
      for(var x = 0; x < tileWidth; x++) {
        var destX = tileCrumble * tileWidth + x;
        context.fillStyle = '#aaaaaa';
        if( ( Math.floor(x/2) + Math.floor(y/2) ) % 2) {
          context.fillRect(destX, y, 1, 1);
        }

        var destX = tileCrumbleStart * tileWidth + x;
//        context.fillStyle = '#aaaaaa';
        if( ( Math.floor(x/4) + Math.floor(y/4) ) % 2) {
          context.fillRect(destX, y, 1, 1);

        }
      }
    }


    for(var colorIndex = 0; colorIndex < stateColors.length; colorIndex++) {
      var tileIndex = colorIndex + tileGreen;

      context.fillStyle = stateColors[colorIndex];
      context.fillRect(tileIndex * tileWidth, 0, tileWidth, tileHeight); 


      context.beginPath();
      context.lineWidth = 1;
      context.setLineDash([2, 2]);
      context.strokeStyle = stateOutlineColors[colorIndex];
      context.rect(tileIndex * tileWidth + 0.5, 0.5, tileWidth - 1, tileHeight - 1);
      context.stroke();

      // draw the outline tiles
      tileIndex = colorIndex + tileGreen + 20;
      context.beginPath();
      context.lineWidth = 1;
      context.setLineDash([2, 2]);
      context.strokeStyle = stateOutlineColors[colorIndex];
      context.rect(tileIndex * tileWidth + 0.5, 0.5, tileWidth - 1, tileHeight - 1);
      context.stroke();

    }

    context.setLineDash([]);
    
  }

  var createSprite = function(imageData, srcX, srcY, dstX, dstY, transform) {
    for(var y = 0; y < spriteSize; y++) {
      var dstPos = 0;
      for(var x = 0; x < spriteSize; x++) {
        var srcPos = (srcX + x + imageData.width * (srcY + y)) * 4;

        if(transform == 1) {
          // flip h
          dstPos = (dstX + spriteSize - 1 - x) + (imageData.width * (dstY + y));
        }

        if(transform == 2) {
          // flip v
          dstPos = (dstX + x) + (imageData.width * (dstY + spriteSize - 1 - y));          
        }

        if(transform == 3) {
          // rotate 90 anticlockwise
          dstPos = (dstX + y) + (imageData.width * (dstY + spriteSize - 1 - x) );
        }

        dstPos *= 4;
        for(var i = 0; i < 4; i++) {
          imageData.data[dstPos + i] = imageData.data[srcPos + i];
        }
      }
    }
  }

  var getSpriteBounds = function(imageData, srcX, srcY) {
    var left = spriteSize;
    var right = 0;
    var top = spriteSize;
    var bottom = 0;


    for(var y = 0; y < spriteSize; y++) {
      for(var x = 0; x < spriteSize; x++) {
        var srcPos = (srcX + x + imageData.width * (srcY + y)) * 4;

        // check the alpha channel
        if(imageData.data[srcPos + 3] > 0) {
          if(x > right) {
            right = x;
          }
          if(y > bottom) {
            bottom = y;
          }
          if(x < left) {
            left = x;
          }
          if(y < top) {
            top = y;
          }
        }

      }
    }

    return [left, top, right, bottom ];

  }

  var createSprites = function() {
    spriteImageData = spriteContext.getImageData(0, 0, spriteCanvas.width, spriteCanvas.height);


    var spriteCount = 11;
    var playerSpriteCount = 11;
    // first 6 sprites are the source sprites
    var spriteX = spriteCount * spriteSize;

    var i = 0;
    // next 6 sprites, h flip them
    for(i = 0; i < playerSpriteCount; i++) {
      createSprite(spriteImageData, i * spriteSize, 0, spriteX, 0, 1);
      spriteX += spriteSize;
      spriteCount++;
    }

    // rotate
    for(i = 0; i < playerSpriteCount; i++) {
      createSprite(spriteImageData, i * spriteSize, 0, spriteX, 0, 3);
      spriteX += spriteSize;
      spriteCount++;
    }

    // h flip rotated
    for(i = 0; i < playerSpriteCount; i++) {
      createSprite(spriteImageData, i * spriteSize + (spriteSize * playerSpriteCount * 2), 0, spriteX, 0, 1);
      spriteX += spriteSize;
      spriteCount++;
    }

    // v flip first
    for(i = 0; i < playerSpriteCount * 2; i++) {
      createSprite(spriteImageData, i * spriteSize, 0, spriteX, 0, 2);
      spriteX += spriteSize;
      spriteCount++;
    }

    // work out sprite bounds
    for(i = 0; i < spriteCount; i++) {
      spriteBounds[i] = getSpriteBounds(spriteImageData, i * spriteSize, 0);
    }

    // get rid of the black
    for(i = 0; i < spriteImageData.data.length; i += 4) {
      if(spriteImageData.data[i] == 0 && spriteImageData.data[i+1] == 0 && spriteImageData.data[i+2] == 0) {
        spriteImageData.data[i+3] = 0;
      }
    }

    spriteContext.putImageData(spriteImageData, 0, 0);

  }

  midiToFreq = function(note) {
    return (Math.pow(2, (note-69) / 12)) * 440.0;
  }

  var boostNoiseBuffer = [];
  var pinkNoiseLength = 0;
  var pinkNoise = [];

  createPinkNoise = function() {
    var b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;    
    for (var i = 0; i < pinkNoiseLength; i++) {
      var white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      pinkNoise[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      pinkNoise[i] *= 0.11; // (roughly) compensate for gain
      b6 = white * 0.115926;
    }    
  }

  var noiseBuffer = null;
  createNoiseBuffer = function() {

    var bufferSize = 2 * audioContext.sampleRate;
    boostNoiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    var output = boostNoiseBuffer.getChannelData(0);

    for (var i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;// pinkNoise[Math.floor(i/4)];
    }
    
  }


  initSound = function() {
    audioContext = new AudioContext();

    pinkNoiseLength = audioContext.sampleRate * 20;
    createPinkNoise();
    createNoiseBuffer();
  }
  playSound = function(soundType) {
    if(audioContext == null) {
      return;
    }

    var time = audioContext.currentTime;
    var noteLength = 1/16;
    var attack = 1/64;
    var soundLength = noteLength;

    // create an envelope using gain
    var gain = audioContext.createGain();

    var audioSource = null;
    var biquadFilter = null;

    if(soundType != soundDash) {
      audioSource = audioContext.createOscillator();
      audioSource.type = 'square';
      audioSource.connect(gain);
    } else {
      audioSource = audioContext.createBufferSource();
      biquadFilter = audioContext.createBiquadFilter();
      biquadFilter.connect(gain);
      audioSource.connect(biquadFilter);
    }

    gain.connect(audioContext.destination);


    switch(soundType) {
      case soundStart: 
        noteLength = 1/16;
        audioSource.type = 'triangle';
        audioSource.frequency.setValueAtTime(midiToFreq(55), time);    // G3
        audioSource.frequency.setValueAtTime(midiToFreq(59), time + noteLength);  // D4
        audioSource.frequency.setValueAtTime(midiToFreq(62), time + noteLength * 2);  // D4

        // very quick attack to a value of 1:
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 1/64);
        // immediate decay to a value of 0:
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + noteLength * 3);

        soundLength = noteLength * 4;

      break;
      case soundDie: 
        noteLength = 1/12;
        audioSource.type = 'sawtooth';
        audioSource.frequency.setValueAtTime(midiToFreq(56), time);   // G#3

       
        audioSource.frequency.linearRampToValueAtTime(midiToFreq(49), time + noteLength); // c#3 49
//        audioSource.frequency.setValueAtTime(midiToFreq(62), time + noteLength);

        // very quick attack to a value of 1:
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + noteLength);
        // immediate decay to a value of 0:
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + noteLength * 2);

        soundLength = noteLength * 2;

      break;
      case soundJump:
        noteLength = 1/12;
        audioSource.type = 'triangle';
        audioSource.frequency.setValueAtTime(midiToFreq(55), time);    // G3
        audioSource.frequency.setValueAtTime(midiToFreq(62), time + noteLength);  // D4

        // very quick attack to a value of 1:
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 1/64);
        // immediate decay to a value of 0:
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + noteLength * 2);

        soundLength = noteLength * 2;


        break;
      case soundDash:
        audioSource.buffer = boostNoiseBuffer;

        biquadFilter.type = 'lowpass';

        biquadFilter.frequency.setValueAtTime(440, time);
        biquadFilter.frequency.linearRampToValueAtTime(440, time + noteLength * 2);  
        gain.gain.linearRampToValueAtTime(1, audioContext.currentTime + 1/64);
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + noteLength * 2);

        soundLength = noteLength * 2;
        break;
      case soundRed:
      break;
      case soundGreen:
        noteLength = 1/4;
        audioSource.type = 'triangle';
        audioSource.frequency.setValueAtTime(midiToFreq(43), time);    // G2

        // very quick attack to a value of 1:
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 1/32);
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + noteLength);

        soundLength = noteLength;

      break;
      case soundBlue:
        noteLength = 1/4;
        audioSource.type = 'triangle';
        audioSource.frequency.setValueAtTime(midiToFreq(47), time);    // b2

        // very quick attack to a value of 1:
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 1/32);
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + noteLength);

        soundLength = noteLength;

      break;
      case soundYellow:
        noteLength = 1/4;
        audioSource.type = 'triangle';
        audioSource.frequency.setValueAtTime(midiToFreq(50), time);    // d3

        // very quick attack to a value of 1:
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 1/32);
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + noteLength);

        soundLength = noteLength;

      break;  
      case soundPurple:
        noteLength = 1/4;
        audioSource.type = 'triangle';
        audioSource.frequency.setValueAtTime(midiToFreq(54), time);    // f#3

        // very quick attack to a value of 1:
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 1/32);
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + noteLength);

        soundLength = noteLength;

      break;
      case soundLevelEnd:
        noteLength = 1/12;
        audioSource.type = 'triangle';
        audioSource.frequency.setValueAtTime(midiToFreq(55), time);    // G4
        audioSource.frequency.setValueAtTime(midiToFreq(62), time + noteLength);  // D4
        audioSource.frequency.setValueAtTime(midiToFreq(67), time + noteLength * 2);    // G4

        /*
        audioSource.frequency.setValueAtTime(midiToFreq(55), time);    // G3
        audioSource.frequency.setValueAtTime(midiToFreq(62), time + noteLength);  // D4
        audioSource.frequency.setValueAtTime(midiToFreq(59), time + noteLength * 2);  // D4
        audioSource.frequency.setValueAtTime(midiToFreq(62), time + noteLength * 3);  // D4
        audioSource.frequency.setValueAtTime(midiToFreq(55), time + noteLength * 4);    // G3
        */

        // very quick attack to a value of 1:
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 1/64);
        // immediate decay to a value of 0:
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + noteLength * 6);

        soundLength = noteLength * 6;

      break;
    }

    audioSource.start(audioContext.currentTime);
    audioSource.stop(audioContext.currentTime+soundLength);

  }

  this.init = function() {
    //var _this = this;

    var doc = document;
    doc.onkeydown = keyDown;
    doc.onkeyup = keyUp;


    screenCanvas = doc.getElementById('screen');
    scale = 1;
//    scale = Math.floor(window.devicePixelRatio);
    screenCanvas.style.width = screenWidth + 'px';
    screenCanvas.style.height = screenHeight + 'px';

    screenCanvas.width = screenWidth * scale;
    screenCanvas.height = screenHeight * scale;

    screenContext = screenCanvas.getContext('2d');


    screenBuffer = new Uint8Array(screenWidth * screenHeight);


    tileCanvas = doc.createElement('canvas');
    createTiles();

    spriteCanvas = doc.createElement('canvas');
    spriteCanvas.width = spriteSize * 100;
    spriteCanvas.height = 100;//spriteSize * 8;

    spriteContext = spriteCanvas.getContext('2d');
    var i = new Image();
    i.onload = function() {
      spriteContext.drawImage(i, 0, 0);
      createSprites();

      lastTime = getTimestamp();
      currentLevel = 0;
      gameState = 1;

      player = new Actor();
      player.actorType = playerActorType;
      actors.push(player);

      startLevel();
    }
    i.src = spriteImageDataUrl;//"sprites.png";
  }

  // draw the emitters to the screen and to the collision buffer
  var drawEmitters = function() {
    for(var i = 0; i < emitters.length; i++) {

        // fill the buffer.. buffer holds the index of the emitter
        var tileOffset = Math.floor(emitters[i].y)  * screenWidth + Math.floor(emitters[i].x) ;//emitters[i].y * screenWidth + emitters[i].x;
        for(var subY = 0; subY < emitters[i].height; subY++) {
          for(var subX = 0; subX < emitters[i].width; subX++) {
            var dest = tileOffset + subY * screenWidth + subX;
            screenBuffer[dest] = 50 + i;
          }
        }
    }
    drawLines();

    screenContext.fillStyle = '#eeeeee';

    for(var i = 0; i < emitters.length; i++) {
      screenContext.fillRect(emitters[i].x, emitters[i].y, emitters[i].width, emitters[i].height);
    }
  }


  // update emitters direction, find where their lines go
  var updateEmitters = function(dt) {
    for(var i = 0; i < emitters.length; i++) {

      var emitter = emitters[i];

      // work out angle of line
      if(emitter.type == emitterTypeRotate) {
        emitter.angle += dt * emitter.direction / 6000;
      } else if(emitter.type == emitterTypeConstant) {
        emitter.angle = Math.PI / 4 * emitter.direction;
      }

      emitter.bounds = [ 0, 0, emitter.width, emitter.height ];
      // move the emitters

      if(emitter.sX != 0 || emitter.sY != 0) {

        emitter.x += emitter.sX * dt;
        emitter.y += emitter.sY * dt;


        var emitterXSave = emitter.x;
        var emitterYSave = emitter.y;
        checkActorBounds(emitter);

        if(emitter.sX == 0) {
          emitter.x = emitterXSave;          
        }

        if(emitter.sY == 0) {
          emitter.y = emitterYSave;          
        }

        if(emitter.y < emitter.minY) {
          emitter.sY = -emitter.sY;
        } else if( (emitter.sX > 0 && emitter.tileRight > 0 && emitter.tileRight < 20) || (emitter.sX < 0 && emitter.tileLeft > 0 && emitter.tileLeft < 20) ) {
          emitter.sX = -emitter.sX;

        } else if((emitter.sY > 0 && emitter.tileBelow > 0 &&  emitter.tileBelow < 20) || (emitter.sY < 0 && emitter.tileAbove > 0 && emitter.tileAbove < 20) ) {
          emitter.sY = -emitter.sY;
        } else {

          // colliding with other emitters?
          for(var j = 0; j < emitters.length; j++) {
            if(i != j) {


              if(emitter.sX > 0) {
                if( emitter.x + emitter.width >= emitters[j].x && emitter.x < emitters[j].x
                  && ((emitter.y >= emitters[j].y && emitter.y <= emitters[j].y + emitters[j].height)
                      || (emitter.y + emitter.height >= emitters[j].y && emitter.y + emitter.height <= emitters[j].y + emitters[j].height))) {
                  emitter.sX = -emitter.sX;
                }
              } else if(emitter.sX < 0) {
                if( emitter.x <= emitters[j].x + emitters[j].width && emitter.x + emitter.width > emitters[j].x + emitters[j].width
                  && ((emitter.y >= emitters[j].y && emitter.y <= emitters[j].y + emitters[j].height)
                      || (emitter.y + emitter.height >= emitters[j].y && emitter.y + emitter.height <= emitters[j].y + emitters[j].height))) {
                  emitter.sX = -emitter.sX;
                }
              }

              if(emitter.sY > 0) {
                if( emitter.y + emitter.height >= emitters[j].y && emitter.y < emitters[j].y
                  && ((emitter.x >= emitters[j].x && emitter.x <= emitters[j].x + emitters[j].width)
                      || (emitter.x + emitter.width >= emitters[j].x && emitter.x + emitter.width <= emitters[j].x + emitters[j].width))) {
                  emitter.sY = -emitter.sY;
                }
              } else if(emitter.sY < 0) {
                if( emitter.y <= emitters[j].y + emitters[j].height && emitter.y + emitter.height > emitters[j].y + emitters[j].height
                  && ((emitter.x >= emitters[j].x && emitter.x <= emitters[j].x + emitters[j].width)
                      || (emitter.x + emitter.width >= emitters[j].x && emitter.x + emitter.width <= emitters[j].x + emitters[j].width))) {
                  emitter.sY = -emitter.sY;
                }
              }
            }
          }
        }
      }

      // make sure the emitter hasn't exited..
      if(emitter.y < tileHeight) {
        emitter.y = tileHeight + 2;
      }
      if(emitter.y + emitter.height > screenHeight - tileHeight) {
        emitter.y = screenHeight - tileHeight - emitter.height;
      }

      if(emitter.x < tileWidth) {
        emitter.x = tileWidth = 2;
      }

      if(emitter.x + emitter.width > screenWidth - tileWidth) {
        emitter.x = screenWidth - tileWidth - emitter.width;
      }


      // get the points for the emitter's lines
      emitter.points = [];

      if(state != stateLinesOff) {
        // line origin
        var startX = emitter.x  + emitter.width / 2;
        var startY = emitter.y + emitter.height / 2
        emitter.points.push([startX, startY]);

        var angle = emitter.angle;
        var endPoint = findLineEnd(startX, startY, angle, emitter);

        var reflectCount = 0;
        while(endPoint !== false) {

          emitter.points.push(endPoint);

          // did the line hit something reflective?
          if(endPoint[2] == 2) {
            if(endPoint[3]) {
              // reflecting off horizontal
              angle = -angle;
            } else {
              // reflecting off vertical
              angle = -angle + Math.PI;
            }

            endPoint = findLineEnd(endPoint[0], endPoint[1], angle, emitter);
//              Math.floor(endPoint[0] / tileWidth), Math.floor(endPoint[1] / tileHeight));
          } else {
            endPoint = false;
          }
          reflectCount++;
          if(reflectCount > maxReflections) {
            break;
          }
        }
      }
    }
  }



  // returns collision point for a line
  // [xcollision, ycollision, collision type, collided widt horiz, collided with vert]
  var findLineEnd = function(x, y, angle, emitter) {


    var dx = Math.cos(angle);
    var dy = Math.sin(angle);

    var testX = x + tileWidth * dx * 1.5;
    var testY = y + tileWidth * dy * 1.5;


    var prevX = testX;
    var prevY = testY;

    var count = 0;
    while(count < 1000) {

      // find the test point, start at a radius away from the emitter, so dont get it as a result
      testX = Math.floor(x + dx * count + tileWidth * dx);
      testY = Math.floor(y + dy * count + tileWidth * dy);

      if(testX < 0 || testX >= screenWidth || testY < 0 || testY >= screenHeight) {
        //uh oh, gone outside the screen
        return [testX, testY, 1, 0, 0];
      }

      var b = screenBuffer[testY * screenWidth + testX];

      if(b > 10 && b < 20) {
        state = b - 10;
      }

      if(b > 0 && (b < 10 ||  (b >= 50 && b < bufferBeam))) {
        // beam has collided.

        var horiz = 0;
        var vert = 0;




        if(dx > 0 && testX > 0 && screenBuffer[testY * screenWidth + testX - 1] == 2) {
          horiz = 1;
        }
        if(dx < 0 && testX < (screenWidth - 1) && screenBuffer[testY * screenWidth + testX + 1] == 2) {
          horiz = 1;
        }

        if(dy > 0 && testY > 0 && screenBuffer[ (testY - 1) * screenWidth + testX ] == 2) {
          vert = 1;
        }
        if(dy < 0 && testY < (screenHeight - 1) && screenBuffer[ (testY + 1) * screenWidth + testX] == 2) {
          vert = 1;
        }

        return [prevX, prevY, b, horiz, vert];
      }

      prevX = testX;
      prevY = testY;

      // only draw if emitter is on
      if(!emitter.flash || emitter.flashEmitterOn) {
        screenBuffer[testY * screenWidth + testX] = bufferBeam;
      }

      count++;
    }
  }

  var drawLines = function() {
    screenContext.lineWidth = 2;
    screenContext.strokeStyle = '#ff0000';
    screenContext.beginPath();
    var hasFlashEmitters = false;

    for(var i = 0; i < emitters.length; i++) {
      var emitter = emitters[i];

      if(emitter.flash) {
        hasFlashEmitters = true;
      }
      if(emitter.flashEmitterOn || !emitter.flash) {
        if(emitter.points.length > 0) {
          screenContext.moveTo(emitter.points[0][0], emitter.points[0][1]);
          for(var j = 1; j < emitter.points.length; j++) {
            screenContext.lineTo(emitter.points[j][0], emitter.points[j][1]);
          }
        }
      }
    } 

    screenContext.stroke();


    if(hasFlashEmitters) {

      screenContext.lineWidth = 2;
      screenContext.setLineDash([4, 4]);
      screenContext.strokeStyle = '#777777';
      screenContext.beginPath();

      for(var i = 0; i < emitters.length; i++) {
        var emitter = emitters[i];

        if( !emitter.flashEmitterOn && emitter.flash) {
          if(emitter.points.length > 0) {
            screenContext.moveTo(emitter.points[0][0], emitter.points[0][1]);
            for(var j = 1; j < emitter.points.length; j++) {
              screenContext.lineTo(emitter.points[j][0], emitter.points[j][1]);
            }
          }

        }
      } 

      screenContext.stroke();      
      screenContext.setLineDash([]);
    }

  }



  var drawButtons = function() {
    var buttonLeft = 0;
    var buttonRight = 0;
    var buttonTop = 0;
    var buttonBottom = 0;

    for(var i = 0; i < buttons.length; i++) {
      var x = buttons[i].x * tileWidth;
      var y = buttons[i].y * tileHeight;

      screenContext.fillStyle = '#eeeeee';

      // draw the button
      var buttonWidth = 22;
      var buttonHeight = 8;

      screenContext.fillStyle = stateColors[buttons[i].type - 3];

      /*
      if(buttons[i].type == 3) {
        screenContext.fillStyle = '#00cc00';
      } else if(buttons[i].type == 4) {
        screenContext.fillStyle = '#0000cc';
      } else if(buttons[i].type == buttonYellow) {
        screenContext.fillStyle = '#cccc00';
      } else if(buttons[i].type == buttonPurple) {
        screenContext.fillStyle = '#cc00cc';
      }
      */

//console.log(screenContext.fillStyle);
      if(buttons[i].type == state) {
        buttonHeight = 3;
      }

      switch(buttons[i].orientation) {
        case buttonFloor:
          buttonLeft = x + 4;
          buttonRight = x + 4 + buttonWidth;
          buttonTop = y + tileHeight - buttonHeight;
          buttonBottom = y + tileHeight;
        break;
        case buttonRightWall:
          buttonLeft = x + tileWidth - buttonHeight;
          buttonRight = x + tileWidth;
          buttonTop = y + 4;
          buttonBottom = y + 4 + buttonWidth;

        break;
        case buttonLeftWall:
          buttonLeft = x;
          buttonRight = x + buttonHeight;
          buttonTop = y + 4;
          buttonBottom = y + 4 + buttonWidth;
        break;
        case buttonCeiling:
          buttonLeft = x + 4;
          buttonRight = x + 4 + buttonWidth;
          buttonTop = y ;
          buttonBottom = y + buttonHeight;
        break;
      }

      screenContext.fillRect(buttonLeft, buttonTop, buttonRight - buttonLeft, buttonBottom - buttonTop);  

      if(buttons[i].type != state) {
        for(var bufY = buttonTop; bufY < buttonBottom; bufY++) {
          for(var bufX = buttonLeft; bufX < buttonRight; bufX++) {
            screenBuffer[bufY * screenWidth + bufX] = 10 + buttons[i].type;
          }
        }
      }


      // draw the base
      var buttonWidth = 30;
      var buttonHeight = 2;

      screenContext.fillStyle = stateOutlineColors[buttons[i].type - 3];

      /*
      if(buttons[i].type == 3) {
        screenContext.fillStyle = '#008800';
      } else if(buttons[i].type == 4) {
        screenContext.fillStyle = '#000088';
      } else if(buttons[i].type == 5) {
        screenContext.fillStyle = '#888800';
      } else if(buttons[i].type == 6) {
        screenContext.fillStyle = '#880000';
      }
      */

      switch(buttons[i].orientation) {
        case buttonFloor:
          buttonLeft = x;
          buttonRight = x + buttonWidth;
          buttonTop = y + tileHeight - buttonHeight;
          buttonBottom = y + tileHeight;
        break;
        case buttonCeiling:
          buttonLeft = x;
          buttonRight = x + buttonWidth;
          buttonTop = y ;
          buttonBottom = y + buttonHeight;
        break;
        case buttonLeftWall:
          buttonLeft = x;
          buttonRight = x + buttonHeight;
          buttonTop = y;
          buttonBottom = y + buttonWidth;
        break;
        case buttonRightWall:
          buttonLeft = x + tileWidth - buttonHeight;
          buttonRight = x + tileWidth;
          buttonTop = y;
          buttonBottom = y + buttonWidth;
        break;
      }

      screenContext.fillRect(buttonLeft, buttonTop, buttonRight - buttonLeft, buttonBottom - buttonTop);  

    }
  }


  var drawActors = function() {
    if(!spriteImageData) {
      return;
    }
    for(var i = 0; i < actors.length; i++) {
      var actor = actors[i];
      var spriteIndex = actor.baseFrame + actor.currentFrame;
      //console.log(spriteIndex);

      var dstPos = (Math.floor(actor.x) + Math.floor(actor.y) * screenWidth);

      actor.touchingExit = false;


      for(var y = 0; y < spriteSize; y++) {
        for(var x = 0; x < spriteSize; x++) {
          var src = (spriteIndex * spriteSize + x + y * spriteImageData.width) * 4;
          var bufDst = dstPos + x + y * screenWidth;
          var dst = bufDst * 4;

          // using transparent and black as transparent...
          if( (spriteImageData.data[src] != 0 || spriteImageData.data[src + 1] != 0 || spriteImageData.data[src + 2] != 0) && spriteImageData.data[src + 3] != 0) {

            if(screenBuffer[bufDst] === bufferBeam) {
              // player collided with line
              actor.state = 0;
              actor.stateTimer = 0;
              playSound(soundDie);
//              actor.baseFrame = 7;
//              actor.frameCount = 1;
//              actor.currentFrame = 0;
            }

            if(screenBuffer[bufDst] == 30) {
              if(player.tileBelow) {
                actor.touchingExit = 1;
              }
            }
          } 
        }
      }

      var spriteX = Math.floor(actor.x);
      var spriteY = Math.floor(actor.y);

      screenContext.drawImage(spriteCanvas, 
        spriteIndex * spriteSize, 0, spriteSize, spriteSize, 
        Math.floor(actor.x) * scale, Math.floor(actor.y) * scale, spriteSize * scale, spriteSize * scale);

      // draw player dash ghosts if in dash
      if(actor.actorType == playerActorType && player.inDash) {
        var opacity = 0.6;
        for(var ghostIndex = dashGhosts.length - 2; ghostIndex >= 0; ghostIndex -= 2) {
          screenContext.globalAlpha = opacity;

          screenContext.drawImage(spriteCanvas, 
              spriteIndex * spriteSize, 0, spriteSize, spriteSize, 
              Math.floor(dashGhosts[ghostIndex][0]) * scale, Math.floor(dashGhosts[ghostIndex][1]) * scale, spriteSize * scale, spriteSize * scale);

          opacity -= 0.07;
          if(opacity <= 0) {
            break;
          }

        }
        screenContext.globalAlpha = 1;

      }
    }
  }


  var drawExit = function() {
    var x = exitX * tileWidth;
    var y = exitY * tileHeight + tileHeight;

    var doorWidth = 2 * tileWidth;
    var doorHeight = 3 * tileHeight - 3;

    screenContext.fillStyle = '#cccccc';
    screenContext.fillRect(x-3, y - doorHeight-3, doorWidth + 6, doorHeight+3);        

    screenContext.fillStyle = '#222222';
    screenContext.fillRect(x + 1, y - doorHeight + 1, doorWidth - 2, doorHeight - 1);   

    screenContext.fillStyle = '#efefef';
    screenContext.fillRect(x + 7 - 3, y - doorHeight - 16 - 1 - 1, 20 + 5, 10 + 3);  

    if(player.touchingExit) {
      screenContext.fillStyle = '#00ff00';
    } else {
      screenContext.fillStyle = '#009900';      
    }
    screenContext.fillRect(x + 7 - 2, y - doorHeight - 16 - 1, 23, 11);  

    screenContext.drawImage(spriteCanvas, 
      0, 34, 21, 11, 
      x + 7 - 1, y - doorHeight - 16 - 2, 21, 11);



    for(var bufY = y - doorHeight + 1; bufY < y - doorHeight + 1 + doorHeight - 1; bufY++) {
      for(var bufX = x + 1; bufX < x + 1 + doorWidth - 2; bufX++) {
        screenBuffer[bufY * screenWidth + bufX] = 30;
      }
    }   


  }


  var drawLevel0Text = function(time) {
    var words1 = [
      [32, 34, 11, 7],
      [50, 34, 42, 7],
      [98, 34, 17, 7],
      [122, 34,23, 7],
      [153, 34, 22, 7],
      [182, 34, 17, 7],
      [206, 34, 17, 7],
      [230, 34, 17, 7],
      [254, 34, 29, 7]
    ];

    var words2 = [
      [32, 46, 83, 7]
//      [98, 46, 41, 7]
    ]

    if(time - lastTextChangeTime > 800) {
      lastTextChangeTime = time;

      lastTextIndex1 = (lastTextIndex1 + 1) % words1.length;
      lastTextIndex2 = (lastTextIndex2 + 1) % words2.length;
    }
    screenContext.imageSmoothingEnabled = false;

    var srcX = words1[lastTextIndex1][0];
    var srcY = words1[lastTextIndex1][1];
    var srcWidth = words1[lastTextIndex1][2];
    var srcHeight = words1[lastTextIndex1][3];
    var dstY = 48;
    var dstWidth = srcWidth * 16;
    var dstHeight = srcHeight * 16;

    var dstX = Math.floor( (screenWidth - dstWidth) / 2);

    screenContext.drawImage(spriteCanvas, srcX, srcY, srcWidth, srcHeight,
      dstX, dstY, dstWidth, dstHeight);

    // screen height  is 480
    srcX = words2[lastTextIndex2][0];
    srcY = words2[lastTextIndex2][1];
    srcWidth = words2[lastTextIndex2][2];
    srcHeight = words2[lastTextIndex2][3];
    dstWidth = srcWidth * 8;
    dstHeight = srcHeight * 8;
    dstY = screenHeight - 2 * tileHeight - (tileHeight/4) - dstHeight;

    dstX = Math.floor( (screenWidth - dstWidth) / 2);

    screenContext.globalAlpha = 0.5;
    screenContext.drawImage(spriteCanvas, srcX, srcY, srcWidth, srcHeight,
      dstX, dstY, dstWidth, dstHeight);

    screenContext.globalAlpha = 1;

    screenContext.imageSmoothingEnabled = true;

  }

  var drawLevel1Text = function(time) {
    var words1 = [
      [122, 46, 53, 7]
    ];

    if(player.y < 180 && player.x < 180) {

      words1 = [
        [290, 34, 53, 7]
      ]
    }


    if(time - lastTextChangeTime > 800) {
      lastTextChangeTime = time;

      lastTextIndex1 = (lastTextIndex1 + 1) % words1.length;
//      lastTextIndex2 = (lastTextIndex2 + 1) % words2.length;
    }
    screenContext.imageSmoothingEnabled = false;

    var srcX = words1[lastTextIndex1][0];
    var srcY = words1[lastTextIndex1][1];
    var srcWidth = words1[lastTextIndex1][2];
    var srcHeight = words1[lastTextIndex1][3];
    var dstWidth = srcWidth * 8;
    var dstHeight = srcHeight * 8;
    var dstY = screenHeight - 2 * tileHeight - (tileHeight/4) - dstHeight;

    var dstX = Math.floor( (screenWidth - dstWidth) / 2);

    screenContext.globalAlpha = 0.5;
    screenContext.drawImage(spriteCanvas, srcX, srcY, srcWidth, srcHeight,
      dstX, dstY, dstWidth, dstHeight);

    screenContext.globalAlpha = 1;

    screenContext.imageSmoothingEnabled = true;

  }


  var drawLevel2Text = function(time) {
    var words1 = [
      [182, 46, 54, 7]
    ];

    if(time - lastTextChangeTime > 800) {
      lastTextChangeTime = time;

      lastTextIndex1 = (lastTextIndex1 + 1) % words1.length;
//      lastTextIndex2 = (lastTextIndex2 + 1) % words2.length;
    }
    screenContext.imageSmoothingEnabled = false;

    var srcX = words1[lastTextIndex1][0];
    var srcY = words1[lastTextIndex1][1];
    var srcWidth = words1[lastTextIndex1][2];
    var srcHeight = words1[lastTextIndex1][3];
    var dstWidth = srcWidth * 8;
    var dstHeight = srcHeight * 8;
    var dstY = screenHeight - 2 * tileHeight - (tileHeight/4) - dstHeight;

    var dstX = Math.floor( (screenWidth - dstWidth) / 2);

    screenContext.globalAlpha = 0.5;
    screenContext.drawImage(spriteCanvas, srcX, srcY, srcWidth, srcHeight,
      dstX, dstY, dstWidth, dstHeight);

    screenContext.globalAlpha = 1;

    screenContext.imageSmoothingEnabled = true;

  }  


  var drawEndText = function(time) {
    var words1 = [
      [242, 46, 23, 7],
      [272, 46, 27, 7]

    ];

    if(time - lastTextChangeTime > 800) {
      lastTextChangeTime = time;

      lastTextIndex1 = (lastTextIndex1 + 1) % words1.length;
//      lastTextIndex2 = (lastTextIndex2 + 1) % words2.length;
    }
    screenContext.imageSmoothingEnabled = false;

    var srcX = words1[lastTextIndex1][0];
    var srcY = words1[lastTextIndex1][1];
    var srcWidth = words1[lastTextIndex1][2];
    var srcHeight = words1[lastTextIndex1][3];
    var dstWidth = srcWidth * 26;
    var dstHeight = srcHeight * 26;
    var dstY = tileHeight * 10;

    var dstX = Math.floor( (screenWidth - dstWidth) / 2);

    screenContext.globalAlpha = 0.5;
    screenContext.drawImage(spriteCanvas, srcX, srcY, srcWidth, srcHeight,
      dstX, dstY, dstWidth, dstHeight);


    screenContext.imageSmoothingEnabled = true;
    screenContext.globalAlpha = 1;

  }  

  var drawScreen = function(buffer) {

    for(var y = 0; y < screen.length; y++) {
      for(var x = 0; x < screen[0].length; x++) {
        var tile = screen[y][x];

        var solid = 1;

        if(!buffer) {
          if(tile == tileSolid) {
            screenContext.fillStyle = '#0c0c0c';
            screenContext.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);        
          }
          if(tile == tileReflective) {
            screenContext.fillStyle = '#aaaaaa';
            screenContext.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight); 
          }

          if(tile == tileCrumble) {
            screenContext.drawImage(tileCanvas, 
              tileCrumble * tileWidth, 0, tileWidth, tileHeight,
              x * tileWidth, y * tileHeight, tileWidth, tileHeight);
          }

          if(tile == tileCrumbleStart) {
            screenContext.drawImage(tileCanvas, 
              tileCrumbleStart * tileWidth, 0, tileWidth, tileHeight,
              x * tileWidth, y * tileHeight, tileWidth, tileHeight);

          }
        }


        if(tile >= tileGreen && tile <= tilePurple && state != tile) {
          solid = 0;

        }

        // draw green, yellow blue purple tiles
        if(!buffer) {
          if(tile >= tileGreen && tile <= tilePurple) {


            if(state == tile) {
              // filled in tile
              screenContext.fillStyle = stateColors[tile - tileGreen];
              screenContext.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight); 
            } else {
              // tile outline
              screenContext.drawImage(tileCanvas, 
                (tile + 20) * tileWidth, 0, tileWidth, tileHeight,
                x * tileWidth, y * tileHeight, tileWidth, tileHeight);

            }


          }

        }

/*
        // fill rect seems faster than draw image for each tile
        if(!buffer && false) {
          // draw the colour tiles
          if(tile >= tileGreen && tile <= tilePurple) {

            if(state == tile) {
              // filled in tile
              screenContext.drawImage(tileCanvas, 
                tile * tileWidth, 0, tileWidth, tileHeight,
                x * tileWidth, y * tileHeight, tileWidth, tileHeight);

            } else {
              // tile outline
              screenContext.drawImage(tileCanvas, 
                (tile + 20) * tileWidth, 0, tileWidth, tileHeight,
                x * tileWidth, y * tileHeight, tileWidth, tileHeight);

            }

          }
        }
*/
        if(buffer) {
          if(!solid) {
            tile = 0;
          }
          // fill the buffer..
          var tileOffset = y * tileHeight * screenWidth + x * tileWidth;
          for(var subY = 0; subY < tileHeight; subY++) {
            for(var subX = 0; subX < tileWidth; subX++) {
              var dest = tileOffset + subY * screenWidth + subX;
              screenBuffer[dest] = tile;
            }
          }
        }
      }
    }
    screenContext.setLineDash([]);
  }



  this.update = function() {
    var time = getTimestamp();
    var dt = (time - lastTime) / 1;
    lastTime = time;

    if(!gameState) {
      // not finished loading
      return;
    }
    screenContext.fillStyle = '#2b2b2b';//#3a383a';
    screenContext.fillRect(0, 0, screenCanvas.width,  screenCanvas.height );

    for(var i = 0; i < emitters.length; i++) {
      var emitter = emitters[i];
      if(emitter.flash) {
        if(emitter.flashEmitterOn  &&  time - emitter.flashEmitterLastTime > emitter.flashEmitterOnTime) {
          emitter.flashEmitterOn = 0;
          emitter.flashEmitterLastTime = time;
        }

        if( (!emitter.flashEmitterOn)  && time - emitter.flashEmitterLastTime > emitter.flashEmitterOffTime) {
          emitter.flashEmitterOn = 1;
          emitter.flashEmitterLastTime = time;

        }
      }
    }

    drawScreen(true);

    if(currentLevel == 0) {
      drawLevel0Text(time);
    } else if(currentLevel == 1) {
      drawLevel1Text(time);
    } else if(currentLevel == 2) {
      drawLevel2Text(time);
    } else if(currentLevel == levelFunctions.length - 1) {
      drawEndText(time);
    }

    drawExit();
    drawButtons();

    drawEmitters();

  
    if(player.state == 1) {

      // make sure the emitter doesnt update by too much of a time step
      var emitterDt = dt;


      while(emitterDt > 30) {
        updateEmitters(30);
        emitterDt -= 30;
      }
      if(emitterDt > 0) {
        updateEmitters(emitterDt);
      }



      // have to move player down with emitter, otherwise player test will things player in air
      if(player.onEmitter !== false) {
        // is the emitter moving down?
        var emitter = emitters[player.onEmitter];
        if(emitter.sY > 0) {
          player.y = emitter.y - spriteSize + player.bounds[1];
        }

      }
    }


    drawScreen(false);

    var maxUpdateDt = 10;

    // need smaller dt so player doesn't go through beams
    if(player.inDash) {
      maxUpdateDt = 2;
    }

    while(dt > maxUpdateDt) {
      playerUpdate(time, maxUpdateDt);
      dt -= maxUpdateDt;
    }
    if(dt > 0) {
      playerUpdate(time, dt);
    }


    updateCrumbleBlocks(time);

    drawActors();
  }

}


function update() {
  game.update();
  requestAnimationFrame( update );
}


var game = new Game();
game.init();
update();     
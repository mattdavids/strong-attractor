let Win = function(game, returnFromWinCallback) {
    let winScreen,
        menuBtn,
        flag,
        displayFlag;

    function loadWin() {
        game.load.image('winScreen', 'assets/art/winScreen.png');
        game.load.image('menuBtn', 'assets/art/menuButton.png');
        game.load.spritesheet('flagSpritesheet', 'assets/art/flagSpriteSheet.png', 80, 135, 10);
    }

    function backToMenu() {
        winScreen.kill();
        menuBtn.kill();
        returnFromWinCallback()
    }

    function displayWinMessage() {

        winScreen = game.add.sprite(game.width/2, game.height/2, 'winScreen');
        winScreen.anchor.set(0.5, 0.5);
        winScreen.immovable = true;

        menuBtn = game.add.button(game.width/2, 1.5*game.height/2, 'menuBtn', backToMenu);
        menuBtn.anchor.set(0.5, 0.5);

        flag = game.add.sprite(419, 96, 'flagSpritesheet');
        displayFlag = flag.animation.add('displayFlag');
        displayFlag.enableUpdate = true;
        flag.animation.play('displayFlag', false);
    }
    
    return {
        preload: loadWin,
        create: displayWinMessage
    };
};

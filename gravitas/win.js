let Win = function(game, returnFromWinCallback) {
    let restartBtn;
    let winScreen;

    function backToMenu() {
        winScreen.kill();
        restartBtn.kill();
        returnFromWinCallback()
    }
    
    return {
        loadWin: function() {
            game.load.image('winScreen', 'assets/art/winScreen.png');
            game.load.image('restartBtn', 'assets/art/restartButton.png');
        },

        displayWinMessage: function() {
            
            winScreen = game.add.sprite(game.width/2, game.height/2, 'winScreen');
            winScreen.anchor.set(0.5, 0.5);
            winScreen.immovable = true;

            restartBtn = game.add.button(game.width/2, 1.5*game.height/2, 'restartBtn', backToMenu);
            restartBtn.anchor.set(0.5, 0.5);
        }
        
    }
};

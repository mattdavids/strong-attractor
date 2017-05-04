let PauseHandler = function(game) {
    let pauseMenuUp = false;
    let resumeButton = game.add.button(100, 300, 'resumeButton', resumeGame);
    let menuButton = game.add.button(100, 500, 'menuButton', returnToMenu);
    resumeButton.visible = false;
    menuButton.visible = false;
        
    function startPauseMenu() {
        game.physics.arcade.isPaused = true;
        game.time.events.pause();
        resumeButton.visible = true;
        menuButton.visible = true;
    }
    
    function resumeGame() {
        game.physics.arcade.isPaused = false;
        game.time.events.resume();
        resumeButton.visible = false;
        menuButton.visible = false;
    }
    
    function returnToMenu() {
        resumeButton.destroy();
        menuButton.destroy();
        game.state.start('menu');
    }
    
    return {
        startPauseMenu: startPauseMenu,
    }
};
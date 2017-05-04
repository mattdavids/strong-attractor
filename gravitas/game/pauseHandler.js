let PauseHandler = function(game) {
    let pauseMenuUp = false;
    let resumeButton = game.add.button(game.width/2, game.height - 100, 'resumeButton', resumeGame);
    resumeButton.anchor.set(.5, .5);
    let menuButton = game.add.button(game.width/2, game.height, 'menuButton', returnToMenu);
    menuButton.anchor.set(.5, .5);
    let buttons = game.add.group();
    buttons.add(resumeButton);
    buttons.add(menuButton);
    resumeButton.visible = false;
    menuButton.visible = false;
        
    function startPauseMenu() {
        game.physics.arcade.isPaused = true;
        game.time.events.pause();
        game.world.bringToTop(buttons);
        let centerX = game.camera.view.centerX;
        let centerY = game.camera.view.centerY;
        resumeButton.position.setTo(centerX, centerY - 100);
        menuButton.position.setTo(centerX, centerY);
        resumeButton.visible = true;
        menuButton.visible = true;
        pauseMenuUp = true;
    }
    
    function resumeGame() {
        game.physics.arcade.isPaused = false;
        game.time.events.resume();
        resumeButton.visible = false;
        menuButton.visible = false;
        pauseMenuUp = false;
    }
    
    function returnToMenu() {
        buttons.destroy();
        game.state.start('menu');
    }
    
    return {
        startPauseMenu: startPauseMenu,
        isPauseMenuUp: function () {
            return pauseMenuUp;
        }
    }
};
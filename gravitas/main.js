$(function() {
    const width = 810;
    const height = 420;
    const startingLevelNum = 0;

    let game = new Phaser.Game(width, height, Phaser.AUTO, 'gameWindow', null, false, false);
    
    let bootState = new BootState(game);
    let gameState = new Game(game);
        
    // will merge Win State
    let menu = new Menu(game, function() {
        gameState.setLevel(startingLevelNum);
        game.state.start('game');
    }, function() {
        game.state.start('levelselect');
    });

    let win = new Win(game);

    let levelSelect = new LevelSelect(game, gameState);
    
    game.state.add('boot', {preload: bootState.boot, create: bootState.postBoot});
    game.state.add('menu', {preload: menu.loadMenu, create: menu.createMenu});
    game.state.add('win', {preload: win.loadWin, create: win.displayWinMessage, update: win.update});
    game.state.add('game', {preload: gameState.preload, create: gameState.create, update: gameState.update, render: gameState.render});
    game.state.add('levelselect', {preload: levelSelect.preload, create: levelSelect.create});

    game.state.start('boot');
});
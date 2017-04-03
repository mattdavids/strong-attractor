$(function() {
    const width = 810;
    const height = 420;
    const startingLevelNum = 0;

    let game = new Phaser.Game(width, height, Phaser.AUTO, 'gameWindow');

    let startState = new StartState(game);

    let menu = new Menu(game, function() {
        game.state.start('game');
    });

    let win = new Win(game, function() {
        game.state.start('game');
    });

    let gameState = new Game(game, startingLevelNum);
    
    game.state.add('boot', {preload: startState.boot, create: startState.postBoot});
    game.state.add('menu', {preload: menu.loadMenu, create: menu.createMenu, update: menu.onStartButtonPush});
    game.state.add('win', {preload: win.loadWin, create: win.displayWinMessage, update: win.backToMenu});
    game.state.add('game', {preload: gameState.preload, create: gameState.create, update: gameState.update, render: gameState.render});

    game.state.start('boot');
});
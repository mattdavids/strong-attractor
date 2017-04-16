$(function() {
    const width = 810;
    const height = 420;
    const startingLevelNum = 0;

    let game = new Phaser.Game(width, height, Phaser.AUTO, 'gameWindow');

    let startState = new StartState(game);

    let menu = new Menu(game, function() {
        game.state.start('game');
    }, function() {
        game.state.start('levelselect');
    });

    let gameState = new Game(game, startingLevelNum);

    let win = new Win(game, function() {
        gameState.setLevel(0);
        game.state.start('game', false);
    });

    let levelSelect = new LevelSelect(game);
    
    game.state.add('boot', {preload: startState.boot, create: startState.postBoot});
    game.state.add('menu', {preload: menu.loadMenu, create: menu.createMenu});
    game.state.add('win', {preload: win.loadWin, create: win.displayWinMessage, update: win.backToMenu});
    game.state.add('game', {preload: gameState.preload, create: gameState.create, update: gameState.update, render: gameState.render});
    game.state.add('levelselect', {preload: levelSelect.preload, create: levelSelect.create, update: levelSelect.onLevelSelected});

    game.state.start('boot');
});
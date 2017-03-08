var loadState = {
    preload: function() {
        var loadingLabel = game.add.text(80, 150, 'loading...', {font: '30px Courier', fill: '#ffffff'});
        
    game.load.image('player', 'assets/player.png');
    game.load.image('exit', 'assets/exit.png');
    game.load.image('wall', 'assets/bricks_gray.png');
    game.load.image('gravObj', 'assets/gravObj.png');

    game.load.spritesheet('shocker', 'assets/electricity_sprites.png', 30, 30, 3);

    //game.load.text('levels', 'assets/levels/levelsNew.txt');
    game.load.text('levelList', 'assets/levels/levelList.txt');
    }
    
    loadLevelsFromList();
    
    create: function() {
    game.state.start('menu');
}
    
}
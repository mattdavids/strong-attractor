let StartState = function(game) {
    return {
        boot: function() {
            // Load file lists here
            // TODO: remove this
            game.load.text('levelList', 'assets/levels/levelList.txt');
        },
        postBoot: function() {
            // Immediately run menu once boot-loading is finished
            // TODO: undo this dependency tangle
            game.state.start('menu');
        }
    };
};
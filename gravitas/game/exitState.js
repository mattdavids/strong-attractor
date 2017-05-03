let ExitState = function() {
    let notCurrentlyExiting = true;
    let hitExit = null;
    let inExitAnimation = false;
    let exitTick = 0;
    
    const exitSpeedRatio = 3;
    const exitMaxTick = 30;
    
    function onExit(obj, exit, game, callback) {
        let exitSound = game.add.audio('exitSound');
        exitSound.volume = 2;
        exitSound.allowMultiple = false;
        exitSound.play();

        let mainTheme = $('#mainTheme');

        mainTheme[0].volume = 0;
        
        exitSound.onStop.add(function() {
            mainTheme.animate({volume: 1}, 500);
            this.exitTick = 0;
            if (this.inExitAnimation) {
                callback();
            }
        }, this);
        
        game.physics.arcade.isPaused = true;
        this.notCurrentlyExiting = false;
        this.inExitAnimation = true;
        this.hitExit = exit;
    }
    
    function doExitAnimation(player, blockSize, easing) {
        //move player to the base of the hit exit
        player.x += 
            (this.hitExit.x > player.x)/exitSpeedRatio - 
            (this.hitExit.x < player.x)/exitSpeedRatio;
        player.y += 
            (this.hitExit.bottom - player.height/2> player.y)/exitSpeedRatio - 
            (this.hitExit.bottom - player.height/2 < player.y)/exitSpeedRatio;
        
        let exitBasePosition = new Phaser.Point(this.hitExit.x, this.hitExit.bottom - player.height/2);
        let diff = Phaser.Point.subtract(player.position, exitBasePosition);
        let r = diff.getMagnitude();

        if (r < 2) {

            if (this.exitTick < exitMaxTick) {
                this.exitTick += 1;
                player.alpha = easing(exitMaxTick - this.exitTick, exitMaxTick);
            }
        }
    }
    
    function reset() {
        this.notCurrentlyExiting = true;
        this.inExitAnimation = false;
        this.hitExit = null;
    }
    
    
    
    return {
        notCurrentlyExiting: notCurrentlyExiting,
        hitExit: hitExit,
        inExitAnimation: inExitAnimation,
        exitTick: exitTick,
        reset: reset,
        onExit: onExit,
        doExitAnimation: doExitAnimation,
    }
};
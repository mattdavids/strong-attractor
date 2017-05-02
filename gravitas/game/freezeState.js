let FreezeState = function() {
    let stopPauseAnimation = false;
    let pauseAnimationTick = 0;
    let arrow;
    
    const pauseAnimationSpeed = 50; // never used
    const pauseMaxTick = 30;
    const arrowDist = 7;
    
    const mainTheme = $('#mainTheme');
    const slowTheme = $('#slowTheme');
    
    
    function startFreeze(game) {
        mainTheme[0].volume = 0;
        slowTheme[0].volume = 1;

        mainTheme[0].playbackRate = .5;
        slowTheme[0].playbackRate = 1;

        game.time.events.pause();

        this.arrow.visible = true;
        this.pauseAnimationTick = 0;

        let freezeEffect = game.add.audio('freeze');
        freezeEffect.volume = 0.3;
        freezeEffect.play();
    }
    
    function endFreeze(game) {
        mainTheme[0].volume = 1;
        slowTheme[0].volume = 0;

        mainTheme[0].playbackRate = 1;
        slowTheme[0].playbackRate = 2;

        this.stopPauseAnimation = true;
        game.time.events.resume();
        
        this.arrow.visible = false;
        this.pauseAnimationTick = pauseMaxTick;

        let unFreezeEffect = game.add.audio('unfreeze');
        unFreezeEffect.volume = 0.3;
        unFreezeEffect.play();
    }
    
    function doPauseGraphics(game, graphics, player, easing) {
        let pausedSize = game.width * easing(this.pauseAnimationTick, pauseMaxTick);

        graphics.beginFill(0xa3c6ff, .5);
        graphics.drawRect(player.x - pausedSize, player.y - pausedSize, 2 * pausedSize, 2 * pausedSize);
        graphics.endFill();

        if (this.stopPauseAnimation) {
            if (this.pauseAnimationTick > 0) {
                this.pauseAnimationTick -= 1.5;
            } else {
                this.stopPauseAnimation = false;
            }
        } else if (this.pauseAnimationTick < pauseMaxTick) {
            this.pauseAnimationTick += 1;
        }
    }
    
    function doArrowChange(player) {
        let xDelta = player.body.velocity.x + player.body.acceleration.x/14;
        let yDelta = player.body.velocity.y + (player.body.acceleration.y + player.body.gravity.y)/14;

        let theta = Math.atan2(yDelta, xDelta);
        let scale = Math.sqrt(Math.sqrt(xDelta*xDelta + yDelta*yDelta)) / 20;

        this.arrow.x = player.x + xDelta/14 + scale * arrowDist * Math.cos(theta);
        this.arrow.y = player.y + yDelta/14 + scale * arrowDist * Math.sin(theta);
        this.arrow.rotation = theta;
        this.arrow.scale.setTo(scale, scale);
    }
    
    function addArrow(game, player) {
        this.arrow = game.add.sprite(player.x, player.y, 'arrow');
        this.arrow.anchor.set(.5, .5);
        this.arrow.visible = false;
    }
    
    function killArrow() {
        this.arrow.destroy();
    }
    
    
    return {
        stopPauseAnimation: stopPauseAnimation,
        pauseAnimationTick: pauseAnimationTick,
        startFreeze: startFreeze,
        endFreeze: endFreeze,
        addArrow: addArrow,
        doPauseGraphics: doPauseGraphics,
        doArrowChange: doArrowChange,
        killArrow: killArrow,
    }
};
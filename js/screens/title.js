game.TitleScreen = me.Stage.extend({
    /**
     *  action to perform on state change
     */
    onResetEvent: function() {
        //console.log(game.texture);
        //console.log(game.texture.getAtlas());
        //this.instructionLayer1 = new me.ImageLayer(0, 0, {
        //    image: game.texture,
        //    region: "instructions1",
        //    repeat:"no-repeat",
        //    anchorPoint: new me.Vector2d(0, 0)
        //})
        this.instructionLayer1 = game.texture.createSpriteFromName("instructions1");
        this.instructionLayer1.anchorPoint.set(0, 0); 
        /*  */
        me.game.world.addChild(this.instructionLayer1); 

        // text is 17x28
        var numLetterSprites = 5; 
        for (var h = 0; h < numLetterSprites; h++) {
            (function(j) {
                game.data.letterSpriteRef.push(me.pool.pull("letterSprite", 80, 60 )); 
                me.game.world.addChild(game.data.letterSpriteRef[ game.data.letterSpriteRef.length - 1 ], LETTER_OVERLAY_Z);
            })(h); 
        }  
        me.game.world.addChild(new game.LetterTypeManager()); 
        
        //me.game.repaint(); 
		me.state.resume(); 
    },

    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
        ; // TODO
        me.game.world.reset(); 
        game.data.letterSpriteRef = [];
        game.data.letterSpriteRefOn = 0;
    }
});

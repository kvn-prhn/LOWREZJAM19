
game.PlayScreen = me.Stage.extend({
    /**
     *  action to perform on state change
     */
    onResetEvent: function() {
        // reset the score
        game.data.score = 0;

        // Add our HUD to the game world, add it last so that this is on top of the rest.
        // Can also be forced by specifying a "Infinity" z value to the addChild function.
        this.HUD = new game.HUD.Container();
        me.game.world.addChild(this.HUD);
        this.showMoneyHUD = new game.ShowMoneyHUD(20, 20);
        me.game.world.addChild(this.showMoneyHUD, TEXT_Z); 
		this.bg = new me.ColorLayer("bg", "#191919", COLOR_BACKDROP_Z);
		me.game.world.addChild(this.bg); 
		me.game.world.addChild(me.pool.pull("slotmachine", 35, 30), SLOT_MACHINE_Z);
         
        var backdropSlots1 = game.texture.createSpriteFromName("slotset1", { framewidth: 64, frameheight: 32 });
        backdropSlots1.pos.setMuted(33, 16);

        var backdropSlots2 = game.texture.createSpriteFromName("slotset2", { framewidth: 64, frameheight: 32 });
        backdropSlots2.pos.setMuted(34, 41);
 
        var backdropSlots3 = game.texture.createSpriteFromName("slotset3", { framewidth: 128, frameheight: 32 });
        backdropSlots3.pos.setMuted(140, 20);

        var backdropSlots4 = game.texture.createSpriteFromName("slotset4", { framewidth: 128, frameheight: 32 });
        backdropSlots4.pos.setMuted(150, 46); 

        me.game.world.addChild(backdropSlots1, BACKDROP_IMG_Z);
        me.game.world.addChild(backdropSlots2, BACKDROP_IMG_Z);
        me.game.world.addChild(backdropSlots3, BACKDROP_IMG_Z);
        me.game.world.addChild(backdropSlots4, BACKDROP_IMG_Z);
        
        //TODO: add in a backdrop sprite and have it repeat in the world. 
        var repeatingBackdrop = new game.RepeatingBackdropSprite(-256, 60);
        var repeatingBackdrop2 = new game.RepeatingBackdropSprite(257, 60);
        me.game.world.addChild(repeatingBackdrop, BACKDROP_EFFECTS_Z);
        me.game.world.addChild(repeatingBackdrop2, BACKDROP_EFFECTS_Z);

        // set up the backdrop game world
        this.backdrop1 = game.texture.createSpriteFromName("backdrop");
        this.backdrop1.anchorPoint.set(0, 0); 
		me.game.world.addChild(this.backdrop1, BACKDROP_IMG_Z);
        
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
    },

    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
        // remove the HUD from the game world
        me.game.world.removeChild(this.HUD); 
    }
});


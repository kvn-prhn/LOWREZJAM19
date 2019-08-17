
var MAX_UH = 200;
var MAX_JIGGLE = 100;
var MAX_SLOT_TIMER = 600;

game.SlotMachineSprite = me.Sprite.extend({
	init: function(x, y) { 
        this._super(me.Sprite, 'init', [x, y, 
			{
				image: game.texture,
				region: "slotmachine",
				framewidth : 82,
				frameheight: 52, 
				anchorPoint : new me.Vector2d(0, 0) 
			}]);
		
		this.spinSlotOn = -1; // -1 means it is spinning no slots. 
		this.spinSlotTimer = 0;
		
		this.jiggleProgress = 0; // no jiggle 
		this.jiggleOut = false;
		
		this.uh = 0; 
		this.uhProgress = 0; 
		this.startX = x + 76; 
		this.arm = me.pool.pull("slotarm", x + 96, y + 39);
		this.arm.setCurrentAnimation("idle"); 
		this.startX = this.arm.pos.x;
		 
		//this.slotSpeeds = [ 0, 0, 0 ]; //[ 1.2, 1.8, -1 ];
		this.slotTypes = [ 0, 0, 0 ];
		this.slotsProgress = [ 0, 0, 0 ];
		
		me.game.world.addChild(this.arm, 190); 
		this.topOfSlotsY = y + 37; 
		this.slots = [ 
			[
				me.pool.pull("slotbanner", x + 13, this.topOfSlotsY, 0), 
				me.pool.pull("slotbanner", x + 13, this.topOfSlotsY, 1) 
			],
			[
				me.pool.pull("slotbanner", x + 34, this.topOfSlotsY, 0), 
				me.pool.pull("slotbanner", x + 34, this.topOfSlotsY, 1) 
			],
			[
				me.pool.pull("slotbanner", x + 55, this.topOfSlotsY, 0), 
				me.pool.pull("slotbanner", x + 55, this.topOfSlotsY, 1) 
			]
		];			
		
		me.game.world.addChild(this.slots[0][ 0 ], SLOT_BANNERS_Z); 
		me.game.world.addChild(this.slots[0][ 1 ], SLOT_BANNERS_Z); 
		me.game.world.addChild(this.slots[1][ 0 ], SLOT_BANNERS_Z); 
		me.game.world.addChild(this.slots[1][ 1 ], SLOT_BANNERS_Z); 
		me.game.world.addChild(this.slots[2][ 0 ], SLOT_BANNERS_Z); 
		me.game.world.addChild(this.slots[2][ 1 ], SLOT_BANNERS_Z); 
		
		this.slots[0][ this.slotTypes[0] ].setOpacity(1);
		//this.slots[0][ this.slotTypes[0] ].updateProgress(0);
		this.slots[0][ Math.abs(this.slotTypes[0] - 1) ].setOpacity(0);
		//this.slots[0][ Math.abs(this.slotTypes[0] - 1) ].updateProgress(0);
		this.slots[1][ this.slotTypes[1] ].setOpacity(1);
		//this.slots[1][ this.slotTypes[1] ].updateProgress(0);
		this.slots[1][ Math.abs(this.slotTypes[1] - 1) ].setOpacity(0);
		//this.slots[1][ Math.abs(this.slotTypes[1] - 1) ].updateProgress(0);
		this.slots[2][ this.slotTypes[2] ].setOpacity(1);
		//this.slots[2][ this.slotTypes[2] ].updateProgress(0);
		this.slots[2][ Math.abs(this.slotTypes[2] - 1) ].setOpacity(0);
		//this.slots[2][ Math.abs(this.slotTypes[2] - 1) ].updateProgress(0);
		
		this.screwthis1 = new me.Sprite(x, y - 130, { image: game.texture, region: "screwthis", framewidth: 82, frameheight: 150, anchorPoint : new me.Vector2d(0, 0) });
		this.screwthis2 = new me.Sprite(x, y + 37, { image: game.texture, region: "screwthis", framewidth: 82, frameheight: 150, anchorPoint : new me.Vector2d(0, 0) });
		
		me.game.world.addChild(this.screwthis1, SCREW_THIS_HIDING_BGS_Z);
		me.game.world.addChild(this.screwthis2, SCREW_THIS_HIDING_BGS_Z); 
    }, 
	
	// this function is called when the lever is pulled! 
	pulledLever : function() { 
		this.getSlot(0).targetValue = -1;
		this.getSlot(0).slotValue = -1;
		this.getSlot(1).targetValue = -1;
		this.getSlot(1).slotValue = -1;
		this.getSlot(2).targetValue = -1;
		this.getSlot(2).slotValue = -1;
		var newType0 = Math.floor(2 * Math.random()); 
		var newType1 = Math.floor(2 * Math.random()); 
		var newType2 = Math.floor(2 * Math.random()); 
		// if there is a target value that is a 1 or 9, set value accordingly
		if (game.data.nextTargetOverride.length > 0) {
			newType0 = game.data.nextTargetOverride[0] == 1 ? 0 : newType0;
			newType0 = game.data.nextTargetOverride[0] == 9 ? 1 : newType0;
			newType1 = game.data.nextTargetOverride[1] == 1 ? 0 : newType1;
			newType1 = game.data.nextTargetOverride[1] == 9 ? 1 : newType1;
			newType2 = game.data.nextTargetOverride[2] == 1 ? 0 : newType2;
			newType2 = game.data.nextTargetOverride[2] == 9 ? 1 : newType2;
		} 
		if (newType0 != this.slotTypes[0]) {
			if (this.slotTypes[0] == 0 || this.slots[0][1].progress < this.slots[0][0].bannerHeight) {
				this.toggleSlotType(0);  
			}
		}
		if (newType1 != this.slotTypes[1]) {
			if (this.slotTypes[1] == 0 || this.slots[1][1].progress < this.slots[1][0].bannerHeight) {
				this.toggleSlotType(1);  
			}
		}
		if (newType2 != this.slotTypes[2]) { 
			if (this.slotTypes[2] == 0 || this.slots[2][1].progress < this.slots[2][0].bannerHeight) {
				this.toggleSlotType(2);  
			}
		}
		
		this.spinSlotOn = 0; // spinning slot 0 
		this.spinSlotTimer = MAX_SLOT_TIMER;

		this.giveNewSpeed(0);
		this.giveNewSpeed(1);
		this.giveNewSpeed(2);

		game.data.ghostAppeared = false; // miss chance for a ghost 

		game.data.totalSpins = game.data.totalSpins + 1;
		game.data.actionQueue.addToQueue("!"); // space
		game.evaluateActionHistoryValues(); 

		game.data.money = game.data.money - 1;
	},
	
	jiggledMachine: function(dir) {
		// console.log("game.data.machineStuckMode=" + game.data.machineStuckMode); 
		if (game.data.machineStuckMode == STUCK_MODE_NORMAL) {
			game.data.machineStuckMode = NOT_STUCK; 
		}
	},
	
	getSlot: function(slotIndex) {
		return this.slots[slotIndex][ this.slotTypes[slotIndex] ];
	}, 
	
	giveNewSpeed: function(slotIndex) {
		this.getSlot(slotIndex).slotSpeed = game.generateNewSlotSpeed();
		this.getSlot(slotIndex).renderOffsetEffect = (Math.random() * 4) - 2;
	},
	
	toggleSlotType: function(slotIndex) { 
		newType = Math.abs(this.slotTypes[slotIndex] - 1);
		this.getSlot(slotIndex).syncProgressWithOther(this.slots[0][newType]); 
		this.getSlot(slotIndex).setOpacity(0);  
		this.slotTypes[slotIndex] = newType;
		this.slots[slotIndex][ newType ].setOpacity(1); 
	},
	
	isSpinning: function() {
		return this.getSlot(0).slotSpeed != 0 || this.getSlot(1).slotSpeed  != 0 || this.getSlot(2).slotSpeed  != 0;
	},
	
	update: function(dt) {
		//console.log("slot machine z pos " + this.pos.z);
		
		var upd = false; 
		var spinning = this.isSpinning();
		if (game.data.machineSpinning != spinning) {
			game.data.machineSpinning = spinning; 
		}
		if (game.data.hasResult && !spinning) { // verify that it is done spinning before processing result 
			var slotValues = [
				this.getSlot(0).getSlotValue(),
				this.getSlot(1).getSlotValue(),
				this.getSlot(2).getSlotValue()
			];
			game.evaluateSlotsOutcome(slotValues, this.slotTypes); // "consume" the result 
			game.data.hasResult = false; 
		}
		
		if (!spinning && this.uh == 0 && game.data.money > 0 && me.input.isKeyPressed("pullarm")) {  
			if (game.data.machineStuckMode !== NOT_STUCK) {
				this.arm.setCurrentAnimation("jiggle", "idle");  
				me.audio.play("pulllever1stuck"); 
			} else {
				this.uh = 1; 
				this.uhProgress = 0; 
				this.arm.setCurrentAnimation("pull", "idle"); 
				game.data.hasResult = false;
				me.audio.play("pulllever1"); 
			}
		} 
		 
		if (me.input.isKeyPressed("left")) {
			this.jiggleProgress = MAX_JIGGLE; 
			me.audio.play("leftjiggle1");
			this.jiggledMachine("left"); 
			game.data.actionQueue.addToQueue("<"); // left
			game.evaluateActionHistoryValues(); 
		} else if (me.input.isKeyPressed("right")) {
			this.jiggleProgress = -MAX_JIGGLE; 
			me.audio.play("rightjiggle1");
			this.jiggledMachine("right"); 
			game.data.actionQueue.addToQueue(">"); // right
			game.evaluateActionHistoryValues(); 
		} 
		

		
		if (game.data.ghostsAwake) {
			var randVal = (Math.random() + game.data.ghostAwakeNum) * 17 % 1; 
			if (randVal > 0.47 && randVal < 0.49) { 
				game.flashGhost(); 
				game.data.ghostAwakeNum = randVal * 7; 
			}
		} 

		if (this.jiggleProgress != 0) {
			if (this.jiggleProgress > 0) {
				this.jiggleProgress = this.jiggleProgress - dt;
				if (this.jiggleProgress < 0) {
					this.jiggleProgress = 0;
					this.offset.set(0, 0);
				} 
			} else if (this.jiggleProgress < 0) {
				this.jiggleProgress = this.jiggleProgress + dt; 
				if (this.jiggleProgress > 0) {
					this.jiggleProgress = 0;
					this.offset.set(0, 0);
				}
			}
			var offsetAmount = 2 * (this.jiggleProgress / MAX_JIGGLE);
			this.offset.set(offsetAmount, 0); 
			upd = true; 
		}		
		
		if (this.uh != 0) {
			this.uhProgress += dt * this.uh;  
		    if (this.uh > 0) {
				if (this.uhProgress > MAX_UH) {
					this.uh = -1;  
					// do something. 
					this.pulledLever(); 
				}
			} else if (this.uh < 0) {
				if (this.uhProgress <= 20) {
					this.uh = 0; // done!
					this.uhProgress = 0; 
					this.arm.pos.setMuted(this.startX, this.arm.pos.y); 
				}
			}
			if (this.uh != 0) {
				var add = new me.Vector2d(0.1 * (2 - (this.uh / MAX_UH)) * this.uh, 0); 
				this.arm.pos.add(add); 
			}
			upd = true; 
		}
		
		this.getSlot(0).updateProgress();
		this.getSlot(1).updateProgress();
		this.getSlot(2).updateProgress(); 
		
		if (this.spinSlotOn >= 0) { 
			if (this.spinSlotOn < 3) {
				this.spinSlotTimer = this.spinSlotTimer - dt; 
				// only set the next target if the last slot has already stopped
				if (this.spinSlotTimer < 0 && (this.spinSlotOn == 0 || this.getSlot(this.spinSlotOn - 1).slotSpeed == 0)) {
					
					if (this.getSlot(this.spinSlotOn).targetValue < 0) {
						var slotValues = [
							this.getSlot(0).getSlotValue(),
							this.getSlot(1).getSlotValue(),
							this.getSlot(2).getSlotValue()
						];
						var slotTargets = [
							this.getSlot(0).targetValue,
							this.getSlot(1).targetValue,
							this.getSlot(2).targetValue
						]; 
						var targetVal = game.generateTargetValue(this.spinSlotOn, slotValues, slotTargets, this.jiggleProgress);
						//game.appendDebug("targetVal for " + this.spinSlotOn + " >> [" + targetVal + "]"); 
						this.getSlot(this.spinSlotOn).waitWaitStopTarget(targetVal); 
					} else if (this.getSlot(this.spinSlotOn).isOnTarget() || this.getSlot(this.spinSlotOn).slotSpeed == 0) {
						this.spinSlotOn = this.spinSlotOn + 1;
						this.spinSlotTimer = MAX_SLOT_TIMER; 
					}
				} 
				
			} else { 
				game.data.hasResult = true;
				this.spinSlotOn = -1; 
			}
			upd = true; 
		}
		
		return upd; 
	}
});

game.SlotArmSprite = me.Sprite.extend({
	init: function(x, y) { 
        this._super(me.Sprite, 'init', [x, y, 
			{
				image: "slotarm",
				framewidth : 50,
				frameheight: 47,
				anchorPoint : new me.Vector2d(0.5, 0.95) 
			}]);  
		this.addAnimation("idle", [0]); 
		this.addAnimation("pull", [0, 1, 2, 3, 2, 1, 0]); 
		this.addAnimation("jiggle", [0, 1, 0]); 
		
    } 
});

game.SlotBannerSprite = me.Sprite.extend({
	init: function(x, y, bannerType) { 
		var props = {};
		this.bannerHeight = 136; 
		this.slotHeight = 19; 
		this.bannerType = bannerType;
		var imgToUse = "";
		this.targetValue = -1; // no target value 
		this.progressStopPoint = -1; 
		this.slotSpeed = 0;
		this.slotValue = -1; 
		this.progress = Math.random() % 1;
		this.prevSlotVal = 0;
		this.renderOffsetEffect = 0;
		if (bannerType == 0) {
			imgToUse = "slotbanner1";
		} else {
			imgToUse = "slotbanner2";
		}
		this.baseX = x;
		this.baseY = y;
		// 14x18 rectangle - same X position and -height from Y position?
		
		this.numSlots = 7; // Math.floor((this.bannerHeight - this.slotHeight + 1) / this.slotHeight);
		// ???
		//this.mask = new me.Rect(this.baseX, this.baseY - 18, 14, 18); // TODO https://melonjs.github.io/melonJS/docs/me.Sprite.html
		this._super(me.Sprite, 'init', [x, y, {
				image: game.texture,
				region: imgToUse,
				framewidth : 14,
				frameheight: 136,
				anchorPoint : new me.Vector2d(0, 1)
			}]);  
    },
	
	// nicely stop the slots to the given value
	waitWaitStopTarget: function(val) {
		this.targetValue = val; 
	},
	
	waitWaitStopNow: function() {
		this.slotValue = this.targetValue; 
		this.progress = this.progressStopPoint;
		this.targetValue = -1; 
		this.progressStopPoint = -1; 
		me.audio.play("bump1"); 
	},
	
	getSlotValue: function() { 
		if (this.slotSpeed == 0) {
			return this.slotValue;
		}
 		return Math.floor( this.progress * this.numSlots );
	}, 
	
	isOnTarget: function() {
		return this.targetValue >= 0 && (this.targetValue == this.getSlotValue()); 
	},
	
	updateProgress: function() {
		var u = this.slotSpeed; 
		this.progress = (this.progress + u) % 1;
		if (this.progress < 0) {
			this.progress = this.progress + 1; 
		} else if (this.progress == 1) {
			this.progress = 0;
		}
		this.progress = Math.floor(this.progress * 100) / 100;
		var renderOffset = (this.progress * (this.bannerHeight - this.slotHeight)) + this.renderOffsetEffect;

		// round the position to the nearest pixel so it looks low-rez? 
		this.pos.setMuted(this.baseX, Math.floor(this.baseY + renderOffset)); 
		
		if (this.targetValue >= 0) {
			if (this.progressStopPoint >= 0) {
				var progressDiff = (this.progress - this.progressStopPoint) % 1;
				if (progressDiff < Math.abs(this.slotSpeed * 2)) {
					this.slotValue = this.targetValue; 
					this.slotSpeed = 0;
					this.waitWaitStopNow(); 
				} 
			} else {
				this.slotValue = -1; 
				if (this.getSlotValue() == this.targetValue) { 
					var slotStopJiggle = (Math.random() * 0.02) - 0.01;
					var percentIncrement = 1 / this.numSlots; 
					//this.progressStopPoint = (percentIncrement * this.targetValue) + (percentIncrement / 2) + 0.045 + slotStopJiggle;
					this.progressStopPoint = (percentIncrement * this.targetValue) % 1;
					
				} 
			}
		}
		
		this.moved = true;
	},
	
	syncProgressWithOther: function(otherBanner) { 
		if (otherBanner.progress < 0) {
			otherBanner.progress = (this.progress + (otherBanner.bannerHeight - this.slotHeight)) % (otherBanner.bannerHeight - this.slotHeight); 
		} else {
			otherBanner.progress = (this.progress) % (otherBanner.bannerHeight - this.slotHeight); 
		}
	},
	
	update: function(dt) { 
		var upd = false;
		if (this.moved) {
			this.moved = false;
			upd = true;
		}
		return upd; 
	}
});

game.RepeatingBackdropSprite = me.Sprite.extend({
	init: function(x, y) { 
        this._super(me.Sprite, 'init', [x, y, 
			{
				image: game.texture,
				region: "repeatbg1",
				framewidth : 512,
				frameheight: 128 
			}]);  
		this.alwaysUpdate = true; 
		this.moveProgress = 0;
		this.baseX = x; 
	},
	
	update: function(dt) { 
		this.moveProgress = this.moveProgress + (dt * 0.002);
		if (this.moveProgress > 512) {
			this.moveProgress = this.moveProgress - 512;
		}
		this.pos.setMuted(this.baseX + this.moveProgress, this.pos.y); 
		return true; 
	}
});


game.LetterTypeManager = me.Renderable.extend({

	init: function() {
		this._super(me.Renderable, 'init', [0, 0, 1, 1]);
	},

	update: function(dt) { 
		if (me.input.isKeyPressed("a")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("a"); 
		} else if (me.input.isKeyPressed("b")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("b"); 
		} else if (me.input.isKeyPressed("c")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("c"); 
		} else if (me.input.isKeyPressed("d")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("d"); 
		} else if (me.input.isKeyPressed("e")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("e"); 
		} else if (me.input.isKeyPressed("f")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("f"); 
		} else if (me.input.isKeyPressed("g")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("g"); 
		} else if (me.input.isKeyPressed("h")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("h"); 
		} else if (me.input.isKeyPressed("i")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("i"); 
		} else if (me.input.isKeyPressed("j")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("j"); 
		} else if (me.input.isKeyPressed("k")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("k"); 
		} else if (me.input.isKeyPressed("l")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("l"); 
		} else if (me.input.isKeyPressed("m")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("m"); 
		} else if (me.input.isKeyPressed("n")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("n"); 
		} else if (me.input.isKeyPressed("o")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("o"); 
		} else if (me.input.isKeyPressed("p")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("p"); 
		} else if (me.input.isKeyPressed("q")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("q"); 
		} else if (me.input.isKeyPressed("r")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("r"); 
		} else if (me.input.isKeyPressed("s")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("s"); 
		} else if (me.input.isKeyPressed("t")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("t"); 
		} else if (me.input.isKeyPressed("u")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("u"); 
		} else if (me.input.isKeyPressed("v")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("v"); 
		} else if (me.input.isKeyPressed("w")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("w"); 
		} else if (me.input.isKeyPressed("x")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("x"); 
		} else if (me.input.isKeyPressed("y")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("y"); 
		} else if (me.input.isKeyPressed("z")) {
			game.data.letterSpriteRef[game.data.letterSpriteRefOn].setLetter("z"); 
		} 
		return false; 
	}

});

game.LetterSprite = me.Sprite.extend({
	init: function(x, y) { 
        this._super(me.Sprite, 'init', [x, y, 
			{
				image: "letters",
				framewidth : 16,
				frameheight : 32 
			}]);  
		this.alwaysUpdate = true; 
		this.moveProgress = 0;
		this.baseX = x; 
		this.setOpacity(0); 

		this.addAnimation("x_a", [  0 ]); 
		this.addAnimation("x_b", [  1 ]); 
		this.addAnimation("x_c", [  2 ]); 
		this.addAnimation("x_d", [  3 ]); 
		this.addAnimation("x_e", [  4 ]); 
		this.addAnimation("x_f", [  5 ]); 
		this.addAnimation("x_g", [  6 ]); 
		this.addAnimation("x_h", [  7 ]); 
		this.addAnimation("x_i", [  8 ]); 
		this.addAnimation("x_j", [  9 ]); 
		this.addAnimation("x_k", [ 10 ]); 
		this.addAnimation("x_l", [ 11 ]); 
		this.addAnimation("x_m", [ 12 ]); 
		this.addAnimation("x_n", [ 13 ]); 
		this.addAnimation("x_o", [ 14 ]); 
		this.addAnimation("x_p", [ 15 ]); 
		this.addAnimation("x_q", [ 16 ]); 
		this.addAnimation("x_r", [ 17 ]); 
		this.addAnimation("x_s", [ 18 ]); 
		this.addAnimation("x_t", [ 19 ]); 
		this.addAnimation("x_u", [ 20 ]); 
		this.addAnimation("x_v", [ 21 ]); 
		this.addAnimation("x_w", [ 22 ]); 
		this.addAnimation("x_x", [ 23 ]); 
		this.addAnimation("x_y", [ 24 ]); 
		this.addAnimation("x_z", [ 25 ]); 
		this.addAnimation("dot", [ 26 ]); 
	},
	
	setLetter: function(ltr) { 
		var keyStr = "x_" + ltr;
		var shiftX = (Math.random() * 60) - 30; 
		var shiftY = (Math.random() * 60) - 30; 
		this.pos.setMuted(80 + shiftX, 60 + shiftY); 
		this.setOpacity(1.0); 
		me.audio.play("bip1", 0.5); 
		if (!this.isCurrentAnimation(keyStr)) {
			this.setCurrentAnimation(keyStr); 
		} 

		game.data.letterSpriteRefOn = game.data.letterSpriteRefOn + 1; 
		if (game.data.letterSpriteRefOn >= game.data.letterSpriteRef.length) {
			game.data.letterSpriteRefOn = 0;
		}

		game.data.actionQueue.addToQueue(ltr);
	},

	update: function(dt) {
		if (this.getOpacity() > 0) {
			var newOp = this.getOpacity() - (dt * 0.001);
			if (newOp <= 0) {
				newOP = 0;
			} 
			this.setOpacity(newOp);
			return true; 
		}
		return false; 
	}
});


game.FlashSprite = me.Sprite.extend({
	init: function(x, y, w, h, img, flashTime) { 
        this._super(me.Sprite, 'init', [x, y, 
			{
				image: "hidepixel",
				framewidth : 1,
				frameheight : 1 
			}]);  
			
		this.floating = true;
		this.alwaysUpdate = true;  
		this.progress = flashTime; 
		this.maxProgress = flashTime; 
		this.pos.setMuted(x, y); 
		this.realSprite = game.texture.createSpriteFromName(img); 
		this.realSprite.alwaysUpdate = true; 
		this.realSprite.pos.setMuted(x, y); 
		me.game.world.addChild(this.realSprite, FLASH_EFFECT_Z);
	}, 

	update: function(dt) { 
		//console.log("SCREW " + this.realSprite.pos.z); 
		this.progress = this.progress - dt; 
		this.realSprite.pos.add(new me.Vector3d(0, 0, 100)); 
		if (this.progress > 0) {
			this.realSprite.setOpacity(this.progress / this.maxProgress); 
		} else {
			me.game.world.removeChild(this); 
		}
		return true; 
	}, 

	onDestroyEvent: function() {
		me.game.world.removeChild(this.realSprite); 
	}
});



game.ShowMoneyHUD = me.Renderable.extend({
	init: function(x, y) {
		this._super(me.Renderable, 'init', [0, 0, 1, 1]);

		this.fontThing = new me.Text(x, y, {font:"Lucida Console", size:"12px", fillStyle: "#ffffff", lineWidth: 0.8});
		this.localMoney = -1; 
		//console.log("SHOW ME MONEY HUD"); 
	},

	update: function(dt) { 
		if (game.data.money !== this.localMoney) {
			this.localMoney = game.data.money;
			return true;
		}
		return false; 
	},

	draw: function(r) { 
		this.fontThing.draw(r, "$" + this.localMoney, 7, 4); 
	}
}); 
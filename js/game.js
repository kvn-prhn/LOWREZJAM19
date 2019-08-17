// DEPTHS FOR DIFFERENT OBJECTS
var FLASH_EFFECT_Z = 990;
var TEXT_Z = 500; 
var LETTER_OVERLAY_Z = 240;
var SLOT_MACHINE_Z = 200;
var BACKDROP_EFFECTS_Z = 170;
var BACKDROP_IMG_Z = 150;
var SCREW_THIS_HIDING_BGS_Z = 105;
var SLOT_BANNERS_Z = 100;
var COLOR_BACKDROP_Z = -100; 

var NOT_STUCK = 0;
var STUCK_MODE_NORMAL = 1;
var STUCK_MODE_DEMON = 2; 

/* Game namespace */
var game = {

    // an object where to store game information
    data : {
        // score
        score : 0,
		pulls : 0, // how many pulls made on the slot machine 
		money : 20, // how much money the player has
		totalSpins : 0, // how many times the machine was spun 
		cakeTime : 128,
		lastFirstValue : -1,
		resultMatches : -1,
		machineSpinning : false,

		numJackpots : 0,
		num3ofKinds : 0,
		numDoubles : 0,

		machineStuckMode : NOT_STUCK,
		ghostsAwake : false,
		ghostAwakeNum : 0,
		ghostAppeared : false, 
		nextTargetOverride : [],
		
		letterSpriteRef : [],
		letterSpriteRefOn : 0,

		actionQueue : {
			q: [],
			maxActionHistory: 16,
			addToQueue: function(k) {
				game.data.actionQueue.q.push(k);
				if (game.data.actionQueue.q.length >= game.data.actionQueue.maxActionHistory) {
					game.data.actionQueue.q.shift(); 
				}
				game.evaluateActionHistoryValues(); 
			}
		}, 
		usedWords : [], // words that have already been used 

		turnSinceDemon : -1
		
		//debugMsgs : []
    },

	/*
	appendDebug: function(msg) {
		game.data.debugMsgs.push(msg);
		if (game.data.debugMsgs.length > 8) {
			game.data.debugMsgs.shift(); 
		}
		var newContent = "";
		for (var i = 0; i < game.data.debugMsgs.length; i++) {
			newContent += game.data.debugMsgs[i] + "<br/>"; 
		}
		document.getElementById("debugstuff").innerHTML = newContent; 
	},
	*/

	generateNewSlotSpeed: function() {
		// make a number from -4 to 4 and then divide by a larger number. 
		var range = 3
		var raw = (2 * range * Math.random()) - range;
		if (raw < 1 && raw > -1) {
			if (raw < 0) {
				raw = -1;
			} else {
				raw = 1;
			}
		}
		return raw / 40; 
	},
	
	generateTargetValue: function(slotIndex, slotValues, slotTargets, jiggleAmount) {
		if (game.data.nextTargetOverride.length > 0) {
			var nextVal = game.data.nextTargetOverride[slotIndex];
			if (nextVal == 9) {
				nextVal = 1; // this is a 7 but will show up as a 1
			}
			if (slotIndex == 2) {
				game.data.nextTargetOverride = []
			}
			return nextVal; 
		}
		var val = Math.floor(Math.random() * 21) % 7; 
		if (slotIndex == 0) {
			while (val == game.data.lastFirstValue) {
				val = Math.floor(Math.random() * 21) % 7; 
			}
			game.data.lastFirstValue = val;
			return val; 
		} else {
			var timeFromCake = game.data.cakeTime - game.data.totalSpins;
			if (Math.random() < 0.2) { // always 20% chance to do a completely random result 
				return Math.floor(Math.random() * 21) % 7;
			} 
			var chanceRepeat = (game.data.totalSpins * (7 / 1280)) + 0.1 - (0.25 * Math.cos((game.data.totalSpins * Math.PI) / 30));
			if (game.data.totalSpins < 9) {
				chanceRepeat = chanceRepeat + (0.9 * Math.sin((game.data.totalSpins * Math.PI) / 8)); 
			} else if (game.data.ghostsAwake) {
				chanceRepeat = chanceRepeat + 0.15; // 15% increase for repeat characters with ghosts. 
			}
			// if jiggling while it calculates the value, then swing the chance far in one random direction
			if (jiggleAmount != 0) {
				if (Math.random() < 0.5) {
					chanceRepeat = chanceRepeat + (0.7 * Math.random());
				} else {
					chanceRepeat = chanceRepeat - (0.7 * Math.random()); 
				}
			}
			if (Math.random() < chanceRepeat) { 
				var lastValue = slotValues[slotIndex - 1];
				if (slotIndex == 1) {
					return lastValue;
				} else if (slotIndex == 2) {
					// 50% chance of returning the FIRST value instead of the last value 
					if (Math.random() < 0.5) {
						slotValues[0]; 
					}
					return lastValue;
				} 
			}
		}

		return val; // return totally random value always as fallback 
	},
	
	evaluateSlotsOutcome: function(slotValues, slotTypes) {
		if (slotTypes[0] == 1 && slotValues[0] == 1) {
			slotValues[0] = 9;
		}
		if (slotTypes[1] == 1 && slotValues[1] == 1) {
			slotValues[1] = 9;
		}
		if (slotTypes[2] == 1 && slotValues[2] == 1) {
			slotValues[2] = 9; 
		}
		// true jackpot is all 9 
		if (slotValues[0] === slotValues[1] || 
			slotValues[1] === slotValues[2] || 
			slotValues[0] === slotValues[2]) {
				if (slotValues[0] === slotValues[1] && slotValues[1] === slotValues[2]) {
					if (slotValues[0] === 9) {
						//game.appendDebug("JACKPOT!"); 
						game.data.resultMatches = 4; // jackpot! 
						game.data.numJackpots = game.data.numJackpots + 1;
					} else {
						//game.appendDebug("3 OF A KIND"); 
						game.data.resultMatches = 3;
						game.data.num3ofKinds = game.data.num3ofKinds + 1;
					}
				} else {
					//game.appendDebug("2 of a kind"); 
					game.data.resultMatches = 2
					game.data.numDoubles = game.data.numDoubles + 1;
				}
			} else {
				game.data.resultMatches = 1;
			}
			
		game.gameEvent(); 
	},

	openNewTab: function(word) { 
		setTimeout(function() {
			window.open("./tab.html?k=" + word + "&h=1", "_blank",  "noreferrer,width=400,height=300"); 
		}, 150);
	},

	evaluateActionHistoryValues: function() {
		// collapse the queue
		// see if it ends with the given string
		var joinedQueue = game.data.actionQueue.q.join(''); 
		
		if (joinedQueue.endsWith("help")) { 
			game.sparkleShow();
			game.openNewTab("help"); 
		}

		// only help can be opened while spinning the machine 
		if (game.data.machineSpinning) {
			return;
		}

		if (me.state.isCurrent(me.state.MENU)) { 
			if (joinedQueue.endsWith("start")) { 
				game.sparkleShow();
				game.openNewTab("start"); 
			} else if (joinedQueue.endsWith("juice")) {
				game.sparkleShow();
				me.state.change(me.state.PLAY);
			}
		} else {
			if (joinedQueue.endsWith("uudd<><>ba!") && !game.data.usedWords.includes("uudd<><>ba!")) {
				console.log("KONAMICODE");
				game.sparkleShow(); 
				game.data.nextTargetOverride = [0, 0, 0]; 
				// special konami code sound? 
				game.data.usedWords.push("uudd<><>ba!"); 
			} else if (joinedQueue.endsWith("restart")) {
				game.sparkleShow();
				me.game.reset(); 
				setTimeout(function() {
					location.reload(); 
				}, 100); 
				return; 
		   	} else if (joinedQueue.endsWith("cherry") && !game.data.usedWords.includes("cherry")) {
				game.sparkleShow();
				game.data.nextTargetOverride = [0, 0, 0]; 
			   game.data.usedWords.push("cherry"); 
		   	} else if (joinedQueue.endsWith("orange") && !game.data.usedWords.includes("orange")) {
				game.sparkleShow();
				game.data.nextTargetOverride = [6, 6, 6]; 
			   game.data.usedWords.push("orange"); 
		   	} else if (joinedQueue.endsWith("avacado") && !game.data.usedWords.includes("avacado")) {
				game.sparkleShow();
				game.data.nextTargetOverride = [5, 5, 5]; 
			   game.data.usedWords.push("avacado"); 
		   	} else if ((joinedQueue.endsWith("peach") || joinedQueue.endsWith("mango")) && !game.data.usedWords.includes("peach")) {
				game.sparkleShow();
				game.data.nextTargetOverride = [4, 4, 4]; 
			    game.data.usedWords.push("peach"); 
		   	} else if (joinedQueue.endsWith("eggplant") && !game.data.usedWords.includes("eggplant")) {
				game.sparkleShow();
 				game.data.nextTargetOverride = [3, 3, 3]; 
				game.data.usedWords.push("eggplant"); 
			} else if (joinedQueue.endsWith("blueberry") && !game.data.usedWords.includes("blueberry")) {
				game.sparkleShow();
				game.data.nextTargetOverride = [2, 2, 2]; 
			   game.data.usedWords.push("blueberry"); 
		   	} else if (joinedQueue.endsWith("coconut") && !game.data.usedWords.includes("coconut")) {
				game.sparkleShow();
				game.data.nextTargetOverride = [1, 1, 1]; 
			   	game.data.usedWords.push("coconut"); 
		   	} else if ((joinedQueue.endsWith("sixsixsix") || joinedQueue.endsWith("demon") || 
				joinedQueue.endsWith("enemy") || joinedQueue.endsWith("evil") ) &&  !game.data.usedWords.includes("demon")) {
				game.flashDemon(); 
				game.data.usedWords.push("demon"); 
				game.sparkleShowEvil();
				game.data.turnSinceDemon = game.data.totalSpins;  
				game.openNewTab("demon"); 
			} else if (joinedQueue.endsWith(">>>") && game.data.numJackpots > 1 && 
					game.data.resultMatches == 4 &&  !game.data.usedWords.includes("jackpotbonus")) {
				game.sparkleShow(); 
				game.openNewTab("jackpotbonus"); 
				game.data.usedWords.push("jackpotbonus"); 
			} else if (joinedQueue.endsWith("zmalqp")) {
				if (game.data.machineStuckMode == STUCK_MODE_DEMON) {
					game.sparkleShow();
					game.data.machineStuckMode = NOT_STUCK; 
					game.data.turnSinceDemon = -1; 
					// unstuck demon sound? 
				}
			} else if (joinedQueue.endsWith("tghyu") && game.data.num3ofKinds == 4 && !game.data.usedWords.includes("tghyu")) { // wincondition2
				game.sparkleShow();
				game.data.nextTargetOverride = [9, 9, 9]; 
				game.data.usedWords.push("tghyu"); 
				game.openNewTab("gghostsrreal"); 
			} else if (joinedQueue.endsWith("zaqwe") && game.data.ghostAppeared && 
					game.data.usedWords.includes("tghyu") && !game.data.usedWords.includes("zaqwe")) { // wincondition2
				game.sparkleShow();
				game.data.nextTargetOverride = [9, 9, 9]; 
				game.data.usedWords.push("zaqwe"); 
				game.openNewTab("windcondition3"); 
			}  else if (joinedQueue.endsWith("lkjhg") && game.data.machineStuckMode == STUCK_MODE_DEMON) { // wincondition2
				game.sparkleShow();
				game.data.nextTargetOverride = [9, 9, 9]; 
				game.data.usedWords.push("zaqwe"); 
				me.game.world.addChild(me.pool.pull("flashSprite", 80, 50, 64, 64, "demonface2", 3200), FLASH_EFFECT_Z );
				me.audio.stopTrack();
				game.openNewTab("pojfnsaudgwaowcbzsh"); 
			} else if (joinedQueue.endsWith("vvvvvvvvvv") && !game.data.usedWords.includes("vvvvvvvvvv")) {
				game.sparkleShow();
				game.data.ghostsAwake = true; 
				game.data.usedWords.push("vvvvvvvvvv"); 
			}

		}
	},
	
	sparkleShow: function() {
		me.game.world.addChild(me.pool.pull("flashSprite", 80, 50, 128, 129, "sparkle", 500), FLASH_EFFECT_Z ); 
		me.audio.play("happyblip");
	},
	
	sparkleShowEvil: function() { 
		me.game.world.addChild(me.pool.pull("flashSprite", 80, 50, 128, 129, "sparkleEvil", 500), FLASH_EFFECT_Z ); 
		me.audio.play("angryblip");
	}, 

	flashGhost: function() {
		console.log("ghost flash..."); 
		var posX = 40 + (Math.random() * 80);
		var posY = 10 + (Math.random() * 15);
		var faceChoice = Math.random();
		var faceImg = "";
		if (faceChoice < 0.4) {
			faceImg = "face1";
		} else if (faceChoice < 0.8) {
			faceImg = "face2";
		} else {
			faceImg = "face3";
		}
		me.game.world.addChild(me.pool.pull("flashSprite", posX, posY, 16, 16, faceImg, 5000), FLASH_EFFECT_Z );  
		me.game.repaint(); 
		game.data.ghostAppeared = true;
	},

	flashDemon: function() {
		me.game.world.addChild(me.pool.pull("flashSprite", 80, 50, 64, 64, "demonface1", 3200), FLASH_EFFECT_Z );   
		me.game.repaint();
	}, 

	gameEvent: function() {
		if (game.data.totalSpins === 6 && game.data.machineStuckMode == NOT_STUCK) {
			game.data.machineStuckMode = STUCK_MODE_NORMAL; // always get stuck on 6th spin
			game.sparkleShowEvil(); 
		}
		if (game.data.usedWords.includes("demon") && 
				game.data.turnSinceDemon >= 0 && 
				 (game.data.totalSpins - game.data.turnSinceDemon == 3 ||
				 game.data.totalSpins - game.data.turnSinceDemon == 19 || 
				 game.data.totalSpins - game.data.turnSinceDemon == 26 || 
				(game.data.totalSpins - game.data.turnSinceDemon) % 11 == 0 ) ) {
			game.sparkleShowEvil();  
			game.flashDemon(); 
			game.data.machineStuckMode = STUCK_MODE_DEMON;
			me.game.repaint(); 
			console.log("DEMON STUCK"); 
		}
		//game.appendDebug("Totals: 2bls=" + game.data.numDoubles + ", 3s=" + game.data.num3ofKinds + ", jackpots=" + game.data.numJackpots); 
		switch(game.data.resultMatches) {
			case 4:
				// jackpot event 
				game.sparkleShowEvil(); // always do an evil sparkle on jackpots 
				
				if (game.data.numJackpots == 1) {
					//console.log("FIRST JACKPOT"); 
					game.openNewTab("firstjackpot"); 
				}
				
				//console.log("React to jackpot");

				game.data.money = game.data.money + 100 + Math.floor(Math.random() * 50); 
				me.audio.play("pattern3"); 
				break;
			case 3:
				if (game.data.num3ofKinds == 1) {
					// first 3 of a kind makes the machine stuck
					game.sparkleShow();
					game.openNewTab("wincondition1");  
				} else if (game.data.num3ofKinds > 4 && !game.data.usedWords.includes("tghyu")) {
					game.sparkleShowEvil();
					game.openNewTab("missedwincondition1"); 
				}

				game.data.money = game.data.money + 15 + Math.floor(Math.random() * 20); 
				// 3 of a kind events 
				//console.log("React to triple");
				me.audio.play("pattern2"); 
				break;
			case 2: 
				// 2 of a kind events
				if (game.data.numDoubles == 2) {
					// 2nd double makes the machine stuck
					if (game.data.machineStuckMode == NOT_STUCK) {
						game.data.machineStuckMode = STUCK_MODE_NORMAL; 
						game.sparkleShowEvil();
					}
				}

				game.data.money = game.data.money + 3 + Math.floor(Math.random() * 8); 

				if (game.data.numDoubles % 3 == 0 && game.data.numDoubles > 0) {
					// flash a ghost? 
					if (Math.random() < 0.7) {
						game.flashGhost(); 
					}
				}

				//console.log("React to double");
				me.audio.play("pattern1"); 
				break;
		}

		if (game.data.money <= 0) {
			game.flashDemon();  
			me.audio.play("angryblip");
			game.openNewTab("outofmoney"); 
		}
	},

    // Run on page load.
    "onload" : function () {
        // Initialize the video.
        if (!me.video.init(160, 100, {wrapper : "screen", scale : "auto", scaleMethod : "fit" })) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }
		
		me.sys.gravity = 0; 
		me.sys.autoFocus = true;

        // Initialize the audio.
        me.audio.init("mp3,ogg");

        // set and load all resources.
        // (this will also automatically switch to the loading screen)
		me.loader.preload(game.resources, this.loaded.bind(this));
		 
    },

    // Run on game resources loaded.
    "loaded" : function () {
		// me.audio.disable(); 
		// load the texture atlas file
		// https://github.com/melonjs/melonJS/wiki/How-to-use-Texture-Atlas-with-TexturePacker
		game.texture = new me.video.renderer.Texture(
			me.loader.getJSON("gameimgs"),
			me.loader.getImage("gameimgs")
		); 

		me.audio.playTrack("Monster-Stake-Out_Looping", 0.8); 

        me.state.set(me.state.MENU, new game.TitleScreen());
        me.state.set(me.state.PLAY, new game.PlayScreen());

        // add our player entity in the entity pool
        //me.pool.register("mainPlayer", game.PlayerEntity);

		me.pool.register("slotmachine", game.SlotMachineSprite); 
		me.pool.register("slotarm", game.SlotArmSprite); 
		me.pool.register("slotbanner", game.SlotBannerSprite);  
		me.pool.register("letterSprite", game.LetterSprite);  
		me.pool.register("flashSprite", game.FlashSprite);  
		
		me.input.bindKey(me.input.KEY.SPACE, "pullarm", true);
		me.input.bindKey(me.input.KEY.RIGHT, "right", true);
		me.input.bindKey(me.input.KEY.LEFT, "left", true);
		
		me.input.bindKey(me.input.KEY.A, "a", true);
		me.input.bindKey(me.input.KEY.B, "b", true);
		me.input.bindKey(me.input.KEY.C, "c", true);
		me.input.bindKey(me.input.KEY.D, "d", true);
		me.input.bindKey(me.input.KEY.E, "e", true);
		me.input.bindKey(me.input.KEY.F, "f", true);
		me.input.bindKey(me.input.KEY.G, "g", true);
		me.input.bindKey(me.input.KEY.H, "h", true);
		me.input.bindKey(me.input.KEY.I, "i", true);
		me.input.bindKey(me.input.KEY.J, "j", true);
		me.input.bindKey(me.input.KEY.K, "k", true);
		me.input.bindKey(me.input.KEY.L, "l", true);
		me.input.bindKey(me.input.KEY.M, "m", true);
		me.input.bindKey(me.input.KEY.N, "n", true);
		me.input.bindKey(me.input.KEY.O, "o", true);
		me.input.bindKey(me.input.KEY.P, "p", true);
		me.input.bindKey(me.input.KEY.Q, "q", true);
		me.input.bindKey(me.input.KEY.R, "r", true);
		me.input.bindKey(me.input.KEY.S, "s", true);
		me.input.bindKey(me.input.KEY.T, "t", true);
		me.input.bindKey(me.input.KEY.U, "u", true);
		me.input.bindKey(me.input.KEY.V, "v", true);
		me.input.bindKey(me.input.KEY.W, "w", true);
		me.input.bindKey(me.input.KEY.X, "x", true);
		me.input.bindKey(me.input.KEY.Y, "y", true);
		me.input.bindKey(me.input.KEY.Z, "z", true);
		
        // Start the game.
		me.state.change(me.state.MENU);
		 
		//me.game.repaint(); 

		// force title screen redraw in case it doesn't initially render
		setTimeout(function() { me.game.repaint();  }, 500);  
    }
};

function GameBoard(game) {
	this.game = game;
}

GameBoard.prototype = new Entity();
GameBoard.prototype.constructor = GameBoard;

GameBoard.prototype.update = function () {
	if(start_hit_break && this.game.click){
		// console.log(this.game.click.x, this.game.click.y);
		if (this.game.click.x > 300 && this.game.click.x < 360
				&& this.game.click.y > 480 && this.game.click.y < 500){
			save = true;
		}
		if (this.game.click.x > 400 && this.game.click.x < 460
				&& this.game.click.y > 480 && this.game.click.y < 500){
			load = true;
		}
	}
	if (start_hit_break && save){
		save_data = [];
		for (var i = 1; i < this.game.entities.length; i++) {
			var ent = this.game.entities[i];
			save_data.push(ent.x, ent.y, ent.direction);
			// console.log(ent.x, ent.y, ent.direction);
		}
		socket.emit("save", { studentname: "Dongsheng Han", statename: "States X Y Direction", save_data});
		save = false;
    }
	
	if(start_hit_break && load){
		if(load_data.length == 0){
			socket.emit("load", { studentname: "Dongsheng Han", statename: "States X Y Direction"});
		} else {
			var index = 0
			for (var i = 1; i < this.game.entities.length; i++) {
				var ent = this.game.entities[i];
				ent.x = load_data[index];
				index ++;
				ent.y = load_data[index];
				index ++;
				ent.direction = load_data[index];
				index ++;
				// console.log(ent.x, ent.y, ent.direction);
			}
			load_data = [];
			load = false;
		}
	}
    Entity.prototype.update.call(this);
}

GameBoard.prototype.draw = function (ctx) {
    if (start_hit_break) {
		ctx.strokeStyle = "black";
		ctx.fillStyle = 'white';
		ctx.font = "30px Sans-serif";
		ctx.strokeText("save", 300, 500);
		ctx.fillText("save", 300, 500);
		ctx.strokeText("load", 400, 500);
		ctx.fillText("load", 400, 500);
		ctx.beginPath();
		ctx.lineWidth="1";
		ctx.strokeStyle="red";
		ctx.rect(298,475,68,30);
		ctx.stroke();
		ctx.beginPath();
		ctx.lineWidth="1";
		ctx.strokeStyle="red";
		ctx.rect(398,475,68,30);
		ctx.stroke();
    }
    Entity.prototype.draw.call(this);
}

//random number start at 1 until max(included)
function getRndInteger(max) {
    return Math.floor(Math.random() * (max)) + 1;
}

//animation
function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, scale) {//sheetWidth, 
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameDuration = frameDuration;
    this.frames = frames;
    this.loop = loop;
    this.scale = scale;

    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }

    var xindex = this.currentFrame();
    var yindex = 0;

    ctx.drawImage(this.spriteSheet,
        xindex * this.frameWidth + this.startX, yindex * this.frameHeight + this.startY,  // source from sheet
        this.frameWidth, this.frameHeight,
        x, y,
        this.frameWidth * this.scale,
        this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}


//car
function Car(game) {
    this.x = 0;
    this.y = 0;
    this.game = game;
    this.size = 264 / 4;
    this.scale = 0.9;
    this.animationR = new Animation(ASSET_MANAGER.getAsset("./img/car-clipart-game-maker-10.jpg"), 0, this.size * 2,    this.size,  this.size, 0.2, 4, true, this.scale);
    this.animationL = new Animation(ASSET_MANAGER.getAsset("./img/car-clipart-game-maker-10.jpg"), 0, this.size,        this.size,  this.size, 0.2, 4, true, this.scale);
    this.animationU = new Animation(ASSET_MANAGER.getAsset("./img/car-clipart-game-maker-10.jpg"), 0, this.size * 3,    this.size,  this.size, 0.2, 4, true, this.scale);
    this.animationD = new Animation(ASSET_MANAGER.getAsset("./img/car-clipart-game-maker-10.jpg"), 0, 0,                this.size,  this.size, 0.2, 4, true, this.scale);
    this.direction = 1;//1R 2L 3U 4D
    this.random_max = 20;//getRndInteger(this.random_max)
    this.speed = init_speed;
    this.entity;
}

Car.prototype = new Entity();
Car.prototype.constructor = Car;

Car.prototype.distance = function (ent) {
    var distance;
    if (this.entity == 0) {
        if (this.direction == 1 && this.x > ent.x
            || this.direction == 2 && this.x < ent.x
            || this.direction == 3 && this.y < ent.y
            || this.direction == 4 && this.y > ent.y) {
            distance = 800 * 4 - Math.abs(this.x - ent.x) + Math.abs(this.y - ent.y);
        }

    } else {
        distance = Math.abs(this.x - ent.x) + Math.abs(this.y - ent.y);
    }
    return distance;
};

Car.prototype.update = function () {
    //run around four side Clockwise
    if (this.x < 800 - 60
        && this.y <= 0) {
        this.y = 0;
        this.direction = 1;
        this.x += this.speed;
    } else if (this.x >= 800 - 60
        && this.y < 800 - 60) {
        this.x = 800 - 60;
        this.direction = 4;
        this.y += this.speed;
    } else if (this.x > 0
        && this.y >= 800 - 60) {
        this.y = 800 - 60;
        this.direction = 2;
        this.x -= this.speed;
    } else if (this.x <= 0
        && this.y > 0) {
        this.x = 0;
        this.direction = 3;
        this.y -= this.speed;
    }

    var entity_index;
    for (var i = 1; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (this == ent) {
            entity_index = i;
            break;
        }
    }

    var previous_entity_index;
    if (entity_index == 1) {
        previous_entity_index = this.game.entities.length - 1;
    } else if(entity_index != 0){
        previous_entity_index = entity_index - 1;
    }

    if (this.distance(this.game.entities[previous_entity_index]) > this.size && this.speed < init_speed) {
        this.speed++;
    } else if (this.distance(this.game.entities[previous_entity_index]) < this.size && this.speed > 0) {
        this.speed--;
    }
    if (this.distance(this.game.entities[previous_entity_index]) < this.size * 0.8) {
        this.speed = 0;
    }
    if (this.game.entities.length == 2) {
        this.speed = init_speed;
    }
    if (start_hit_break){
        if (getRndInteger(this.random_max) == 1) {
            this.speed = 0;
        }
    }
    Entity.prototype.update.call(this);
}

Car.prototype.draw = function (ctx) {
    ctx.save();
    if (this.direction === 1) {
        this.animationR.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    if (this.direction === 2) {
        this.animationL.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    if (this.direction === 3) {
        this.animationU.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    if (this.direction === 4) {
        this.animationD.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    ctx.restore();
    if (start_hit_break) {
        ctx.strokeStyle = "black";
        ctx.fillStyle = 'white';
        ctx.font = "40px Sans-serif";
        ctx.strokeText("Start hit breaks", 250, 400);
        ctx.fillText("Start hit breaks", 250, 400);

    } else {
        ctx.strokeStyle = "black";
        ctx.fillStyle = 'white';
        ctx.font = "40px Sans-serif";
        ctx.strokeText("Not hit breaks", 250, 400);
        ctx.fillText("Not hit breaks", 250, 400);
    }
	
    Entity.prototype.draw.call(this);
}

window.onload = function () {
    console.log("starting up window.onload = function ()");
    var messages = [];
    var field = document.getElementById("field");
    var username = document.getElementById("username");

    socket.on("ping", function (ping) {
        console.log("ping");
        socket.emit(ping);
    });

    socket.on('sync', function (data) {
		console.log("sync");
        console.log(data.length +" messages synced.");
        messages = data;
        var html = '';
        for (var i = 0; i < messages.length; i++) {
            html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
            html += messages[i].message + '<br />';
        }
        content.innerHTML = html;
        content.scrollTop = content.scrollHeight;
    });

    socket.on('message', function (data) {
		console.log("message");
        if (data.message) {
            messages.push(data);
            // update html
            var html = '';
            for (var i = 0; i < messages.length; i++) {
                html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
                html += messages[i].message + '<br />';
            }
            content.innerHTML = html;
            content.scrollTop = content.scrollHeight;
        } else {
            console.log("There is a problem:", data);
        }
    });

	socket.on("load", function (data) {
		console.log("load");
		console.log(data);
		load_data = data.save_data;
	});

	socket.on("save", function (data) {
		console.log("save");
		console.log(data);
	});

    socket.on("connect", function () {
        console.log("Socket connected.")
    });
    socket.on("disconnect", function () {
        console.log("Socket disconnected.")
    });
    socket.on("reconnect", function () {
        console.log("Socket reconnected.")
    });

};


// the "main" code begins here
var ASSET_MANAGER = new AssetManager();
ASSET_MANAGER.queueDownload("./img/car-clipart-game-maker-10.jpg");
var init_speed = 10;
var car_count = 25;
var start_hit_break = false;
var save = false;
var load = false;
var save_data = [];
var load_data = [];
var socket = io.connect("http://24.16.255.56:8888");
var gameEngine = new GameEngine();
ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
	
	var gameboard = new GameBoard(gameEngine,3);
    console.log("GAME ENGINE " + gameEngine);
    console.log(gameboard);
    gameEngine.addEntity(gameboard);

    var Cars = new Car(gameEngine);
    gameEngine.addEntity(Cars);

    gameEngine.start();

    var timesRun = 1;
    //repeatly add Cars
    var interval = setInterval(function () {
        Cars = new Car(gameEngine);
        gameEngine.addEntity(Cars);
        timesRun += 1;
        if (timesRun === car_count) {
            clearInterval(interval);
        }
    }, 100 / init_speed * 13); 
	// }, 100 / init_speed * 20); 

    var start = 0
    var interval2 = setInterval(function () {
        start += 1;
        if (start === 2) {
            clearInterval(interval2);
            start_hit_break = true;
        }
    }, 2000); 
	// }, 5000); 

});

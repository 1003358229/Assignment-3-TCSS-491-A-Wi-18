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
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (this == ent) {
            entity_index = i;
            break;
        }
    }

    var previous_entity_index;
    if (entity_index == 0) {
        previous_entity_index = this.game.entities.length - 1;
    } else {
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
    if (this.game.entities.length == 1) {
        this.speed = init_speed;
    }
    if (start_hit_break){
        if (getRndInteger(this.random_max) == 1) {
            this.speed = 0;
        }
    }
	if (start_hit_break && saving){
		for (var i = 0; i < this.game.entities.length; i++) {
			var ent = this.game.entities[i];
			arr.push(ent.x, ent.y, ent.direction);
			// console.log(ent.x, ent.y, ent.direction);
		}
		saving = false;
		socket.emit("save", { studentname: "Dongsheng Han", statename: "States X Y Direction", arr});
		socket.emit("load", { studentname: "Dongsheng Han", statename: "States X Y Direction" });
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
var saving = true;
var arr = [];
var socket = io.connect("http://24.16.255.56:8888");
ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    var gameEngine = new GameEngine();
    gameEngine.init(ctx);


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
    }, 100 / init_speed * 20); 

    var start = 0
    var interval2 = setInterval(function () {
        start += 1;
        if (start === 2) {
            clearInterval(interval2);
            start_hit_break = true;
        }
    }, 5000); 

});

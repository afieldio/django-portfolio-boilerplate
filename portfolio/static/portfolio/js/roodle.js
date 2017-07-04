/**
 * 	Initialize the Game and start it.
 */
var game = new Game();

function init() {
	if(game.init())
		game.start();
}

/**
*	Create a holder for all the images
*	Check that all images are loaded
*/
var imageRepository = new function() {
	// Define images
	this.background = new Image();
	this.roodle = new Image();
	this.bullet = new Image();
	this.enemy = new Image();
	this.enemy2 = new Image();
	this.enemy3 = new Image();
	this.enemyBullet = new Image();

	var numImages = 7;
	var numLoaded = 0;

	function imageLoaded(){
		numLoaded++;
		if (numLoaded === numImages){
			window.init();
		}
	}

	this.background.onload = function(){
		imageLoaded();
	}

	this.roodle.onload = function(){
		imageLoaded();
	}
	
	this.bullet.onload = function(){
		imageLoaded();
	}

	this.enemy.onload = function(){
		imageLoaded();
	}

	this.enemy2.onload = function(){
		imageLoaded();
	}

	this.enemy3.onload = function(){
		imageLoaded();
	}

	this.enemyBullet.onload = function(){
		imageLoaded();
	}


	this.background.src = bgs;
	this.roodle.src = roos;
	this.bullet.src = bus;
	this.enemy.src = ens;
	this.enemy2.src = en2s;
	this.enemy3.src = en3s;
	this.enemyBullet.src = enb;
}

/**
 * QuadTree object.
 *
 * The quadrant indexes are numbered as below:
 *     |
 *  1  |  0
 * —-+—-
 *  2  |  3
 *     |
 *
 * Confess that I am not quite sure how this works - it just does! Thanks to Steven for putting in the hard work!
 */

function QuadTree(boundBox, lvl) {
	var maxObjects = 10;
	this.bounds = boundBox || {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	};
	var objects = [];
	this.nodes = [];
	var level = lvl || 0;
	var maxLevels = 5;
	/*
	 * Clears the quadTree and all nodes of objects
	 */
	this.clear = function() {
		objects = [];
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].clear();
		}
		this.nodes = [];
	};
	/*
	 * Get all objects in the quadTree
	 */
	this.getAllObjects = function(returnedObjects) {
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].getAllObjects(returnedObjects);
		}
		for (var i = 0, len = objects.length; i < len; i++) {
			returnedObjects.push(objects[i]);
		}
		return returnedObjects;
	};
	/*
	 * Return all objects that the object could collide with
	 */
	this.findObjects = function(returnedObjects, obj) {
		if (typeof obj === "undefined") {
			console.log("UNDEFINED OBJECT");
			return;
		}
		var index = this.getIndex(obj);
		if (index != -1 && this.nodes.length) {
			this.nodes[index].findObjects(returnedObjects, obj);
		}
		for (var i = 0, len = objects.length; i < len; i++) {
			returnedObjects.push(objects[i]);
		}
		return returnedObjects;
	};
	/*
	 * Insert the object into the quadTree. If the tree
	 * excedes the capacity, it will split and add all
	 * objects to their corresponding nodes.
	 */
	this.insert = function(obj) {
		if (typeof obj === "undefined") {
			return;
		}
		if (obj instanceof Array) {
			for (var i = 0, len = obj.length; i < len; i++) {
				this.insert(obj[i]);
			}
			return;
		}
		if (this.nodes.length) {
			var index = this.getIndex(obj);
			// Only add the object to a subnode if it can fit completely
			// within one
			if (index != -1) {
				this.nodes[index].insert(obj);
				return;
			}
		}
		objects.push(obj);
		// Prevent infinite splitting
		if (objects.length > maxObjects && level < maxLevels) {
			if (this.nodes[0] == null) {
				this.split();
			}
			var i = 0;
			while (i < objects.length) {
				var index = this.getIndex(objects[i]);
				if (index != -1) {
					this.nodes[index].insert((objects.splice(i,1))[0]);
				}
				else {
					i++;
				}
			}
		}
	};
	/*
	 * Determine which node the object belongs to. -1 means
	 * object cannot completely fit within a node and is part
	 * of the current node
	 */
	this.getIndex = function(obj) {
		var index = -1;
		var verticalMidpoint = this.bounds.x + this.bounds.width / 2;
		var horizontalMidpoint = this.bounds.y + this.bounds.height / 2;
		// Object can fit completely within the top quadrant
		var topQuadrant = (obj.y < horizontalMidpoint && obj.y + obj.height < horizontalMidpoint);
		// Object can fit completely within the bottom quandrant
		var bottomQuadrant = (obj.y > horizontalMidpoint);
		// Object can fit completely within the left quadrants
		if (obj.x < verticalMidpoint &&
				obj.x + obj.width < verticalMidpoint) {
			if (topQuadrant) {
				index = 1;
			}
			else if (bottomQuadrant) {
				index = 2;
			}
		}
		// Object can fix completely within the right quandrants
		else if (obj.x > verticalMidpoint) {
			if (topQuadrant) {
				index = 0;
			}
			else if (bottomQuadrant) {
				index = 3;
			}
		}
		return index;
	};
	/*
	 * Splits the node into 4 subnodes
	 */
	this.split = function() {
		// Bitwise or [html5rocks]
		var subWidth = (this.bounds.width / 2) | 0;
		var subHeight = (this.bounds.height / 2) | 0;
		this.nodes[0] = new QuadTree({
			x: this.bounds.x + subWidth,
			y: this.bounds.y,
			width: subWidth,
			height: subHeight
		}, level+1);
		this.nodes[1] = new QuadTree({
			x: this.bounds.x,
			y: this.bounds.y,
			width: subWidth,
			height: subHeight
		}, level+1);
		this.nodes[2] = new QuadTree({
			x: this.bounds.x,
			y: this.bounds.y + subHeight,
			width: subWidth,
			height: subHeight
		}, level+1);
		this.nodes[3] = new QuadTree({
			x: this.bounds.x + subWidth,
			y: this.bounds.y + subHeight,
			width: subWidth,
			height: subHeight
		}, level+1);
	};
}

/**
* Uses the QuadTree to detect collisions
*/
function detectCollision() {
	var objects = [];
	game.quadTree.getAllObjects(objects);
	for (var x = 0, len = objects.length; x < len; x++) {
		game.quadTree.findObjects(obj = [], objects[x]);

		for (y = 0, length = obj.length; y < length; y++) {

			// DETECT COLLISION ALGORITHM
			if (objects[x].collidableWith === obj[y].type &&
				(objects[x].x < obj[y].x + obj[y].width &&
			     objects[x].x + objects[x].width > obj[y].x &&
				 objects[x].y < obj[y].y + obj[y].height &&
				 objects[x].y + objects[x].height > obj[y].y)) {
				objects[x].isColliding = true;
				obj[y].isColliding = true;
			}
		}
	}
};

/**
* Parent Class for the various objects
*/
function Drawable() {
	this.init = function(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;
	this.collidableWith = "";
	this.isColliding = false;
	this.type = "";
	
	this.draw = function() {
	};

	this.move = function() {
	};

	this.isCollidableWith = function(object){
		return (this.collidableWith === object.type);
	};
}

/**
* Creates the lines on the canvas and then moves them down
* When off the page they get moved to the top to give the impression of scrolling
*/

function Background(){
	this.speed = 1;

	var noLines = this.canvasHeight/40;
	var y = 0;
	var lines = [];

	for (var i = 0; i < noLines; i++){
		var x1 = 0 
		var x2 = this.canvasWidth;
		y += 40;
		var l = {startX: x1, endX: x2, y: y}
		lines.push(l)
		this.context.beginPath();
		this.context.moveTo(x1,y);
		this.context.lineTo(x2,y);
		this.context.strokeStyle="#c1c1c1";
		this.context.stroke();
	}

	this.draw = function() {

		this.context.clearRect(this.x, this.y, this.canvasWidth, this.canvasHeight);
		for(var i = 0; i < lines.length; i++){
			
			lines[i].y += this.speed;
			this.context.beginPath();
			this.context.moveTo(x1,lines[i].y);
			this.context.lineTo(x2,lines[i].y);
			this.context.stroke();
			if (lines[i].y >= this.canvasHeight) {
				lines[i].y = 0;
			}
		}

	};

}

Background.prototype = new Drawable();


/**
* Pools are used to contain all the objects on the back
* Means that you don't have to create new objects every time
*/
function Pool(maxsize){
	var size = maxsize;
	var pool = [];

	this.init = function(object) {
		if (object == "bullet") {
			for (var i = 0; i < size; i++) {
				// Initalize the object
				var bullet = new Bullet("bullet");
				bullet.init(0,0, imageRepository.bullet.width, imageRepository.bullet.height);
				bullet.collidableWith = "enemy";
				bullet.type = "bullet";
				pool[i] = bullet;
			}
		}
		else if (object == "enemy") {
			for (var i = 0; i < size; i++) {
				var enemy = new Enemy();
				enemy.init(0,0, imageRepository.enemy.width, imageRepository.enemy.height);
				enemy.collidableWith = "ship";
				enemy.type = "enemy";
				pool[i] = enemy;
			}
		}
		else if (object == "enemyBullet") {
			for (var i = 0; i < size; i++) {
				var bullet = new Bullet("enemyBullet");
				bullet.init(0,0, imageRepository.enemyBullet.width, imageRepository.enemyBullet.height);
				bullet.collidableWith = "ship";
				bullet.type = "enemyBullet";
				pool[i] = bullet;
			}
		}
	};

	this.get = function(x,y,speed){
		if(!pool[size -1].alive){
			pool[size - 1].spawn(x, y, speed);
			pool.unshift(pool.pop());
		}
	}

	this.getPool = function() {
		var obj = [];
		for (var i = 0; i < size; i++) {
			if (pool[i].alive) {
				obj.push(pool[i]);
			}
		}
		return obj;
	}

	this.animate = function() {
		for (var i = 0; i < size; i++) {
			// Only draw until we find a bullet that is not alive
			if (pool[i].alive) {
				if (pool[i].draw()) {
					pool[i].clear();
					pool.push((pool.splice(i,1))[0]);
				}
			}
			else{
				break;
			}
		}
	};
}

/**
 * Creates the Bullet object which the ship fires. The bullets are
 * drawn on the "main" canvas.
 */
function Bullet(object) {
	this.alive = false;
	var self = object;
	/*
	 * Sets the bullet values
	 */
	this.spawn = function(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.alive = true;
	};
	/*
	 * Uses a "drity rectangle" to erase the bullet and moves it.
	 * Returns true if the bullet moved off the screen, indicating that
	 * the bullet is ready to be cleared by the pool, otherwise draws
	 * the bullet.
	 */
	this.draw = function() {
		this.context.clearRect(this.x-1, this.y-1, this.width+1, this.height+1);
		this.y -= this.speed;
		if (this.isColliding) {
			return true;
		}
		else if (self === "bullet" && this.y <= 0 - this.height) {
			return true;
		}
		else if (self === "enemyBullet" && this.y >= this.canvasHeight) {
			return true;
		}
		else {
			if (self === "bullet") {
				this.context.drawImage(imageRepository.bullet, this.x, this.y);
			}
			else if (self === "enemyBullet") {
				this.context.drawImage(imageRepository.enemyBullet, this.x, this.y);
			}
			return false;
		}
	};
	/*
	 * Resets the bullet values
	 */
	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
		this.isColliding = false;
	};
}
Bullet.prototype = new Drawable();

function Ship() {
	this.speed = 10;
	this.bulletPool = new Pool(30);
	this.bulletPool.init("bullet");
	this.alive = true;

	var fireRate = 15;
	var counter = 0;

	this.collidableWith = "enemy";
	this.type = "ship";

	this.draw = function() {
		this.context.drawImage(imageRepository.roodle, this.x, this.y);
	}

	this.move = function () {
		counter ++;

		if (KEY_STATUS.left || KEY_STATUS.right || KEY_STATUS.up || KEY_STATUS.down){
			this.context.clearRect(this.x, this.y, this.width, this.height)
		}

		if (KEY_STATUS.left) {
			this.x -= this.speed
			if (this.x <= 0) // Keep player within the screen
				this.x = 0;
		} else if (KEY_STATUS.right) {
			this.x += this.speed
			if (this.x >= this.canvasWidth - this.width)
				this.x = this.canvasWidth - this.width;
		} else if (KEY_STATUS.up) {
			this.y -= this.speed
			if (this.y <= 0)
				this.y = 0;
		} else if (KEY_STATUS.down) {
			this.y += this.speed
			if (this.y >= this.canvasHeight - this.height)
				this.y = this.canvasHeight - this.height;
		}

		if(!this.isColliding){
			this.draw();
		}else{
			this.alive = false;
			game.gameOver();
		}

		if (KEY_STATUS.space && counter >= fireRate && !this.isColliding) {
			this.fire();
			counter = 0;
		}
	};

	this.fire = function() {
		this.bulletPool.get(this.x + 42, this.y, 8)
	}
}

Ship.prototype = new Drawable();

function Enemy() {
	var enemyNo = Math.floor(Math.random() * 3) + 1;
	
	if (enemyNo == 1) {
		var enemy = imageRepository.enemy;
	} else if(enemyNo == 2){
		var enemy = imageRepository.enemy2;
	} else {
		var enemy = imageRepository.enemy3;
	}

	var percentFire = 1;
	var chance = 0;
	this.alive = false;
	this.collidableWith = "bullet";
	this.type = "enemy";

	this.spawn = function(x, y, speed){
		this.x = Math.random()*this.canvasWidth;
		this.y = y;
		this.speed = speed;
		this.speedX = 0;
		this.speedY = speed;
		this.alive = true;
		// this.leftEdge = this.x - 90;
		// this.rightEdge = this.x + 90;
		// this.bottomEdge = this.y + 140;
	}

	this.draw = function() {

		this.context.clearRect(this.x-1, this.y, this.width+1, this.height);
		this.y += this.speedY;
	
		if(!this.isColliding){
			if(this.y < this.canvasHeight){
				this.context.drawImage(enemy, this.x, this.y);
			}else{
				this.isColliding = true;
				return false
			}
			// Enemy has a chance to shoot every movement
			chance = Math.floor(Math.random()*101);
			if (chance/100 < percentFire) {
				this.fire();
			}
		}else{
			game.playerScore += 10;
			return true;
		}
	}

	this.fire = function() {
		game.enemyBulletPool.get(this.x+this.width/2, this.y+this.height, -2.5);
	}

	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.speedX = 0;
		this.speedY = 0;
		this.alive = false;
		this.isColliding = false;
	};
}

Enemy.prototype = new Drawable();

// The keycodes that will be mapped when a user presses a button.
// Original code by Doug McInnes
KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
}
// Creates the array to hold the KEY_CODES and sets all their values
// to false. Checking true/flase is the quickest way to check status
// of a key press and which one was pressed when determining
// when to move and which direction.
KEY_STATUS = {};
for (code in KEY_CODES) {
  KEY_STATUS[ KEY_CODES[ code ]] = false;
}
/**
 * Sets up the document to listen to onkeydown events (fired when
 * any key on the keyboard is pressed down). When a key is pressed,
 * it sets the appropriate direction to true to let us know which
 * key it was.
 */
document.onkeydown = function(e) {
  // Firefox and opera use charCode instead of keyCode to
  // return which key was pressed.
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
}
/**
 * Sets up the document to listen to ownkeyup events (fired when
 * any key on the keyboard is released). When a key is released,
 * it sets teh appropriate direction to false to let us know which
 * key it was.
 */
document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
}

function Game() {
	/*
	 * Gets canvas information and context and sets up all game
	 * objects.
	 * Returns true if the canvas is supported and false if it
	 * is not. This is to stop the animation script from constantly
	 * running on older browsers.
	 */
	this.init = function() {
		this.playerScore = 0;
		// Get the canvas element
		this.bgCanvas = document.getElementById('background');
		this.shipCanvas = document.getElementById('ship');
		this.mainCanvas = document.getElementById('main');
		// Test to see if canvas is supported
		if (this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext('2d');
			this.shipContext = this.shipCanvas.getContext('2d');
			this.mainContext = this.mainCanvas.getContext('2d');
			// Initialize objects to contain their context and canvas
			// information
			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;

			Ship.prototype.context = this.shipContext;
			Ship.prototype.canvasWidth = this.shipCanvas.width;
			Ship.prototype.canvasHeight = this.shipCanvas.height;
			
			Bullet.prototype.context = this.mainContext;
			Bullet.prototype.canvasWidth = this.mainCanvas.width;
			Bullet.prototype.canvasHeight = this.mainCanvas.height;

			Enemy.prototype.context = this.mainContext;
			Enemy.prototype.canvasWidth = this.mainCanvas.width;
			Enemy.prototype.canvasHeight = this.mainCanvas.height;
			// Initialize the background object
			this.background = new Background();
			this.background.init(0,0,2480,1600); // Set draw point to 0,0

			this.ship = new Ship();
			var shipStartX = this.bgCanvas.width/2 - imageRepository.roodle.width/2;
		 	var shipStartY = this.bgCanvas.height - imageRepository.roodle.width*2;
			this.ship.init(shipStartX, shipStartY, imageRepository.roodle.width, imageRepository.roodle.height);

		 	this.enemyPool = new Pool(30);
		 	this.enemyPool.init("enemy");
		 	this.spawnWave();
		 	
		 	
			this.enemyBulletPool = new Pool(50);
			this.enemyBulletPool.init("enemyBullet");
			this.quadTree = new QuadTree({x:0,y:0,width:this.mainCanvas.width,height:this.mainCanvas.height});
			return true;
		} else {
			return false;
		}
	};

	this.spawnWave = function() {
	 	var height = imageRepository.enemy.height;
		var width = imageRepository.enemy.width;
		var x = Math.random()*this.canvasWidth;
		var y = -height;
		var spacer = y * Math.random()*10;
		for (var i = 1; i <= 18; i++) {
			this.enemyPool.get(x,y,2);
			x = Math.random();
			y += spacer
		}
	};

	this.gameOver = function() {
		document.getElementById('game-over').style.display = "block"
	}

	this.restart = function() {
		document.getElementById('game-over').style.display = "none";
		this.bgContext.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
		this.shipContext.clearRect(0, 0, this.shipCanvas.width, this.shipCanvas.height);
		this.mainContext.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
		this.quadTree.clear();
		this.background = new Background();
		this.background.init(0,0,2480,1600);
		this.ship = new Ship();
		var shipStartX = this.bgCanvas.width/2 - imageRepository.roodle.width/2;
	 	var shipStartY = this.bgCanvas.height - imageRepository.roodle.width*2;
		this.ship.init(shipStartX, shipStartY,
		               imageRepository.roodle.width, imageRepository.roodle.height);
		
		this.enemyPool = new Pool(30);
		this.enemyPool.init("enemy");
		this.spawnWave();

		this.enemyBulletPool.init("enemyBullet");
		this.enemyBulletPool = new Pool(50);
		this.enemyBulletPool.init("enemyBullet");
		this.quadTree = new QuadTree({x:0,y:0,width:this.mainCanvas.width,height:this.mainCanvas.height});
		this.playerScore = 0;
		this.start();
	}
	// Start the animation loop
	this.start = function() {
		this.ship.draw()
		animate();
	};
}

/**
 * The animation loop
 */
function animate() {
	game.quadTree.clear();
	game.quadTree.insert(game.ship);
	game.quadTree.insert(game.ship.bulletPool.getPool());
	game.quadTree.insert(game.enemyPool.getPool());
	game.quadTree.insert(game.enemyBulletPool.getPool());

	detectCollision();

	if(game.ship.alive) {
		requestAnimFrame( animate );
		game.background.draw();
		game.ship.move();
		// console.log(game.ship.x)
		// console.log(game.ship.y)
		game.ship.bulletPool.animate();
		// console.log(game.enemyPool.getPool().length);
		if (game.enemyPool.getPool().length === 0) {
			game.spawnWave();

			// console.log("New Wave");
		}
		game.enemyPool.animate();
		game.enemyBulletPool.animate();

	}

	document.getElementById('score').innerHTML = game.playerScore;
}

/**
 * requestAnim shim layer by Paul Irish
 * Finds the first API that works to optimize the animation loop,
 * otherwise defaults to setTimeout().
 */


window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame   ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();
'use strict';

class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	plus(vector) {
		if(!(vector instanceof Vector)) {
			throw new Error('Ошибка');
		}
		return new Vector(vector.x + this.x, vector.y + this.y);
	}

	times(n) {
		return new Vector(this.x * n, this.y * n);
	}
}

class Actor {
	constructor(position = new Vector(0, 0),
			    size = new Vector(1, 1),
			    speed = new Vector(0, 0)) {
		if(position instanceof Vector &&
		   size instanceof Vector &&
		   speed instanceof Vector) {
			this.pos = position;
			this.size = size;
			this.speed = speed;
		} else {
			throw new Error('В конструктор передан не вектор');
		}
	}
	
	act() {
	}

	
	get left() {
		return this.pos.x;
	}
	get right() {
		return this.pos.x + this.size.x;
	}
	get top() {
		return this.pos.y;
	}
	get bottom() {
		return this.pos.y + this.size.y;
	}
	get type() {
		return 'actor';
	}

	isIntersect(anyObj) {
		if(!(anyObj instanceof Actor)) {
		 	throw new Error('Объект не является экземпляром Actor');
		}

		if(this === anyObj) {
			return false;
		}

		if(this.right > anyObj.left &&
			this.left < anyObj.right &&
			this.top < anyObj.bottom &&
			this.bottom > anyObj.top) {
			return true;
		}
		
		return false;
	}
}

class Level {
	constructor(grid = [], actors = []) {
		this.grid = grid.slice();
		this.actors = actors.slice();
		this.height = grid.length;
		this.width = 0;

		if(grid[0]) {
			let diff = false;
			let max = grid[0].length;
			for(let row of grid) {
				if(row.length > max) {
					diff = true;
					max = row.length;
				}
			}
			this.width = diff ? grid[max].length : grid[0].length;
		}

		this.status = null;
		this.finishDelay = 1;
		this.player = this.actors.filter(actor => actor.type === 'player').shift();
	}
	isFinished() {
		return this.status !== null && this.finishDelay < 0;
	}
	actorAt(actor) {
		if(actor === undefined || !(actor instanceof Actor)) {
			throw new Error('Ошибка в actor');
		}
		//не понимаю, почему не возвращается объект
		if(this.actors[0]) {

			for(let obj of this.actors) {
				if(actor.isIntersect(obj)) {
					return obj;
				}
			}
		}
	}
	obstacleAt(position, size) {
		if(!(position instanceof Vector || size instanceof Vector)) {
			throw new Error('Аргумент(ы) не является экземплром Actor');
		}

	}
}

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
	constructor(position = new Vector(),
			    size = new Vector(1, 1),
			    speed = new Vector()) {
		if(position instanceof Vector &&
		   size instanceof Vector &&
		   speed instanceof Vector) {
			this.pos = position;
			this.size = size;
			this.speed = speed;
		} else {
			throw new Error('В конструктор передан не вектор');
		}
		this.left = this.pos.x;
		this.right = this.pos.x + this.size.x;
		this.top = this.pos.y;
		this.bottom = this.pos.y + this.size.y;

	}

	act() {
	}
	isIntersect(anyObj) {
		const farAwayDistance = 100;
		if(!(anyObj instanceof Actor)) {
			throw new Error('Объект не является экземпляром Actor');
		}
		if(anyObj === this) {
			return false;
		}
		if(
			(Math.abs(anyObj.pos.x - this.pos.x) >= farAwayDistance) ||
		    (Math.abs(anyObj.pos.y - this.pos.y) >= farAwayDistance)
		  ) {
			return false;
		}

		//Объект не пересекается с объектом со смежными границами
		if(anyObj.pos.x === this.pos.x + this.size.x) {
			return false;
		}
		if(anyObj.pos.y === this.pos.y + this.size.y) {
			return false;
		}
		if(this.pos.x === anyObj.pos.x + anyObj.size.x) {
			return false;
		}
		if(this.pos.y === anyObj.pos.y + anyObj.size.y) {
			return false;
		}

		//Объект не пересекается с объектом расположенным в той же точке, но имеющим отрицательный вектор размера
		if(anyObj.pos.x === this.pos.x &&
			anyObj.pos.y === this.pos.y &&
			anyObj.size.x <= 0 &&
			anyObj.size.y <= 0) {
			return false;
		}
		//Объект пересекается с объектом, который полностью содержится в нём
		//Объект пересекается с объектом, который частично содержится в нём
		if(anyObj.pos.x > this.pos.x ||
			anyObj.pos.y > this.pos.y ||
			anyObj.pos.x + anyObj.size.x < this.pos.x + this.size.x ||
			anyObj.pos.y + anyObj.size.y < this.pos.y + this.size.y
			) {
			return true;
		}
	}
}

Object.defineProperty(Actor.prototype, 'type', {
  	value: 'actor'
})

class Level {
	constructor(grid = [], actors = []) {
		this.grid = grid;
		this.actors = actors;
		this.height = grid.length;
		this.width = 0;

		let diff = false;
		if(grid[0]) {
			let max = grid[0];
			for(let i = 0; i < grid.length; i++) {
				if(grid[i].length > max) {
					max = grid[i].length;
					diff = true;
				}
			}
			this.width = diff ? grid[max].length : grid[0].length;
		}
		this.status = null;
		this.finishDelay = 1;
		this.player = this.actors.filter(actor => actor.type === 'player').shift();
	}
	isFinished() {
		if(this.status !== null && this.finishDelay < 0) {
			return true;
		}
		return false;
	}
	actorAt(actor) {
		if(actor === undefined || !(actor instanceof Actor)) {
			throw new Error('Ошибка в actor');
		}
		for(let i = 0; i < this.actors.length; i++) {
			let obj = this.actors[i];
			if(actor.isIntersect(obj)) {
				return obj;
			}
		}
	}
}

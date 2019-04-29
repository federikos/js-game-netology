'use strict';

class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	plus(vector) {
		if(!(vector instanceof Vector)) {
			throw new Error('Можно прибавлять к вектору только вектор типа Vector');
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
		if(!(anyObj instanceof Actor) && !(Actor.isPrototypeOf(anyObj))) {
			//2-я часть проверки для отрабатывания кода примера
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
		this.player = this.actors.find(actor => actor.type === 'player');
		this.height = grid.length;
		this.width = 0;

		if(grid[0]) {
			let max = 0;
			grid.forEach((row) => {
				max = (row.length > max) ? row.length : max;
			});
			this.width = max;
		}

		this.status = null;
		this.finishDelay = 1;
	}

	isFinished() {
		return this.status !== null && this.finishDelay < 0;
	}

	actorAt(actor) {
		if(actor === undefined || !(actor instanceof Actor)) {
			throw new Error('Ошибка в actor');
		}

		for(let obj of this.actors) {
			if(actor.isIntersect(obj)) {
				return obj;
			}
		}
	}

	obstacleAt(position, size) {
		if(!(position instanceof Vector || size instanceof Vector)) {
			throw new Error('Аргумент(ы) не являе(ю)тся экземпляром Actor');
		}
		const checkAreaLeft = Math.round(position.x);
		const checkAreaRight = Math.round(position.x + size.x);
		const checkAreaTop = Math.round(position.y);
		const checkAreaBottom = Math.round(position.y + size.y);

		if(checkAreaBottom > this.height) {
			return 'lava';
		}

		if(checkAreaTop < 0 ||
			 checkAreaLeft < 0 ||
		 	 checkAreaRight > this.width) {
				 return 'wall';
		}

		for(let i = checkAreaTop; i < checkAreaBottom; i++) {
			for(let j = checkAreaLeft; j < checkAreaRight; j++) {
				if(this.grid[i][j]) return this.grid[i][j];
			}
		}
	}

	removeActor(actor) {
		const indexToDelete = this.actors.indexOf(actor);
		if(indexToDelete > -1) {
			this.actors.splice(indexToDelete, 1);
		}
	}

	noMoreActors(actorType) {
		for (let actor of this.actors) {
			if (actor.type === actorType) return false;
		}
		return true;
	}

	playerTouched(objType, actor) {
		if(this.status === null) {
			if(objType === 'lava' || objType === 'fireball') {
				this.status = 'lost';
			}
			if(objType === 'coin' && actor instanceof Actor || Actor.isPrototypeOf(actor)) {
				//2-я часть проверки для совместимости с кодом примера
				this.removeActor(actor);
				if(this.noMoreActors('coin')) {
					this.status = 'won';
				}
			}
		}
	}

}

class LevelParser {
	constructor(map) {
		this.map = map;
	}
	actorFromSymbol(symbol) {
		return symbol ? this.map[symbol] : undefined;
	}
	obstacleFromSymbol(symbol) {
		switch (symbol) {
			case 'x':
				return 'wall';
				break;
			case '!':
				return 'lava';
				break;
			default:
				return undefined;
		}
	}
}

//Game running
const grid = [
  new Array(3),
  ['wall', 'wall', 'lava']
];

class Player extends Actor {

}

const level = new Level(grid);
runLevel(level, DOMDisplay);

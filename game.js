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
		//ниже ерунда
		for(let row of this.grid) {
			for(let obstacle of row) {
				const actor = new Actor(position, size);
				if(actor.isIntersect(obstacle)) {
					return obstacle;
				} else {
					return undefined;
				}
			}
		}
	}
}


//пример


const grid = [
  [undefined, undefined],
  ['wall', 'wall']
];

function MyCoin(title) {
  this.type = 'coin';
  this.title = title;
}
MyCoin.prototype = Object.create(Actor);
MyCoin.constructor = MyCoin;

const goldCoin = new MyCoin('Золото');
const bronzeCoin = new MyCoin('Бронза');
const player = new Actor();
const fireball = new Actor();

const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);

level.playerTouched('coin', goldCoin);
level.playerTouched('coin', bronzeCoin);

if (level.noMoreActors('coin')) {
  console.log('Все монеты собраны');
  console.log(`Статус игры: ${level.status}`);
}

const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
if (obstacle) {
  console.log(`На пути препятствие: ${obstacle}`);
}

const otherActor = level.actorAt(player);
if (otherActor === fireball) {
  console.log('Пользователь столкнулся с шаровой молнией');
}
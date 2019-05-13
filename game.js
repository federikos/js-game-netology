"use strict";

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error("Можно прибавлять к вектору только вектор типа Vector");
    }

    return new Vector(vector.x + this.x, vector.y + this.y);
  }

  times(n) {
    return new Vector(this.x * n, this.y * n);
  }
}

class Actor {
  constructor(
    position = new Vector(0, 0),
    size = new Vector(1, 1),
    speed = new Vector(0, 0)
  ) {
    if (
      !(
        position instanceof Vector &&
        size instanceof Vector &&
        speed instanceof Vector
      )
    ) {
      throw new Error("В конструктор передан не вектор");
    }

    this.pos = position;
    this.size = size;
    this.speed = speed;
  }

  act() {}

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
    return "actor";
  }

  isIntersect(anyObj) {
    if (!(anyObj instanceof Actor) && !Actor.isPrototypeOf(anyObj)) {
      //2-я часть проверки нужна для отрабатывания кода примера
      throw new Error("Объект не является экземпляром Actor");
    }

    if (this === anyObj) {
      return false;
    }

    return (
      this.right > anyObj.left &&
      this.left < anyObj.right &&
      this.top < anyObj.bottom &&
      this.bottom > anyObj.top
    );
  }
}

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid.slice();
    this.actors = actors.slice();
    this.player = this.actors.find(actor => actor.type === "player");
    this.height = grid.length;
    this.width = 0;

    let max = 0;
    grid.slice().forEach(row => {
      max = row.length > max ? row.length : max;
    });
    this.width = max;

    this.status = null;
    this.finishDelay = 1;
  }

  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }

  actorAt(actor) {
    if (actor === undefined || !(actor instanceof Actor)) {
      throw new Error("Ошибка в actor");
    }

    for (let obj of this.actors) {
      if (actor.isIntersect(obj)) {
        return obj;
      }
    }
  }

  obstacleAt(position, size) {
    if (!(position instanceof Vector || size instanceof Vector)) {
      throw new Error("Аргумент(ы) не являе(ю)тся экземпляром Actor");
    }

    const checkAreaLeft = Math.floor(position.x);
    const checkAreaRight = Math.ceil(position.x + size.x);
    const checkAreaTop = Math.floor(position.y);
    const checkAreaBottom = Math.ceil(position.y + size.y);

    if (checkAreaBottom > this.height) {
      return "lava";
    }

    if (checkAreaTop < 0 || checkAreaLeft < 0 || checkAreaRight > this.width) {
      return "wall";
    }

    for (let i = checkAreaTop; i < checkAreaBottom; i++) {
      for (let j = checkAreaLeft; j < checkAreaRight; j++) {
        if (this.grid[i][j]) return this.grid[i][j];
      }
    }
  }

  removeActor(actor) {
    const indexToDelete = this.actors.indexOf(actor);
    if (indexToDelete > -1) {
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
    if (this.status === null) {
      if (objType === "lava" || objType === "fireball") {
        this.status = "lost";
      }

      if (
        (objType === "coin" && actor instanceof Actor) ||
        Actor.isPrototypeOf(actor)
      ) {
        //2-я часть проверки добавлена для совместимости с кодом примера
        this.removeActor(actor);
        if (this.noMoreActors("coin")) {
          this.status = "won";
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
    if (symbol != null) {
      return this.map[symbol];
    }
  }

  obstacleFromSymbol(symbol) {
    switch (symbol) {
      case "x":
        return "wall";
        break;
      case "!":
        return "lava";
        break;
    }
  }

  createGrid(plan) {
    return plan.map(row => [...row].map(cell => this.obstacleFromSymbol(cell)));
  }

  createActors(plan) {
    const objects = [];

    for (let y = 0; y < plan.length; y++) {
      for (let x = 0; x < plan[y].length; x++) {
        const cell = plan[y][x];
        let Constr = this.map ? this.map[cell] : null;

        if (
          Constr != null &&
          typeof Constr === "function" &&
          new Constr() instanceof Actor
        ) {
          const pos = new Vector(x, y);
          objects.push(new Constr(pos));
        }
      }
    }

    return objects;
  }

  parse(plan) {
    return new Level(this.createGrid(plan), this.createActors(plan));
  }
}

class Fireball extends Actor {
  constructor(position = new Vector(0, 0), speed = new Vector(0, 0)) {
    super();
    this.pos = position;
    this.speed = speed;
    this.size = new Vector(1, 1);
  }

  get type() {
    return "fireball";
  }

  getNextPosition(time = 1) {
    return new Vector(
      this.pos.x + this.speed.x * time,
      this.pos.y + this.speed.y * time
    );
  }

  handleObstacle() {
    this.speed = this.speed.times(-1);
  }

  act(time, level) {
    const nextPosition = this.getNextPosition(time);
    if (level.obstacleAt(nextPosition, this.size)) {
      this.handleObstacle();
    } else {
      this.pos = nextPosition;
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(position) {
    super();
    this.pos = position;
    this.size = new Vector(1, 1);
    this.speed = new Vector(2, 0);
  }
}

class VerticalFireball extends Fireball {
  constructor(position) {
    super();
    this.pos = position;
    this.size = new Vector(1, 1);
    this.speed = new Vector(0, 2);
  }
}

class FireRain extends Fireball {
  constructor(position) {
    super();
    this.size = new Vector(1, 1);
    this.speed = new Vector(0, 3);
    this.initialPos = position;
  }

  handleObstacle() {
    this.pos = this.initialPos;
  }
}

class Coin extends Actor {
  constructor(position = new Vector(0, 0)) {
    super();
    this.size = new Vector(0.6, 0.6);
    this.initialPos = position.plus(new Vector(0.2, 0.1));
    this.pos = this.initialPos;
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * Math.PI * 2;
  }

  get type() {
    return "coin";
  }

  updateSpring(time = 1) {
    this.spring = this.spring + this.springSpeed * time;
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.initialPos.plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

class Player extends Actor {
  constructor(position = new Vector(0, 0)) {
    super();
    this.pos = position.plus(new Vector(0, -0.5));
    this.size = new Vector(0.8, 1.5);
    this.speed = new Vector(0, 0);
  }

  get type() {
    return "player";
  }
}

//запуск игры
const actorDict = {
  "@": Player,
  o: Coin,
  "=": HorizontalFireball,
  "|": VerticalFireball,
  v: FireRain
};

const parser = new LevelParser(actorDict);
loadLevels().then(schemasJSON => {
  let schemas = [
    [
      "         ",
      "         ",
      "    =    ",
      "       o ",
      "     !xxx",
      " @       ",
      "xxx!     ",
      "         "
    ]
  ];

  try {
    schemas = JSON.parse(schemasJSON);
  } catch (e) {
    console.log(e.name, e.message);
    alert(`Извините, произошла ошибка при парсинге схем уровней игры. \n
           Доступен только один стандартный уровень.`);
  }

  runGame(schemas, parser, DOMDisplay).then(() => alert("Вы выиграли приз!"));
});

export class Hero {
  constructor(public id = 0, public name = '') { }
  clone() { return new Hero(this.id, this.name); }
}

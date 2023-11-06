// #docregion

export interface Hero {
  id: number;
  name: string;
  tid: string; // tax id
}

//// HeroTaxReturn ////
let nextId = 100;

export class HeroTaxReturn {
  constructor(
    public id = nextId++,
    public hero: Hero,
    public income = 0 ) {
      if (id === 0) { id = nextId++; }
    }

  get name() { return this.hero.name; }
  get tax()  { return this.income ? .10 * this.income : 0; }
  get tid()  { return this.hero.tid; }

  toString() {
    return `${this.hero.name}`;
  }

  clone() {
    return new HeroTaxReturn(this.id, this.hero, this.income);
  }
}

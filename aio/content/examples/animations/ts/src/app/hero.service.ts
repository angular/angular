import { Injectable } from '@angular/core';

class Hero {
  constructor(public name: string,
              public state = 'inactive') {
  }

  toggleState() {
    this.state = (this.state === 'active' ? 'inactive' : 'active');
  }
}

let ALL_HEROES = [
  'Windstorm',
  'RubberMan',
  'Bombasto',
  'Magneta',
  'Dynama',
  'Narco',
  'Celeritas',
  'Dr IQ',
  'Magma',
  'Tornado',
  'Mr. Nice'
].map(name => new Hero(name));

@Injectable()
export class Heroes implements Iterable<Hero> {

  currentHeroes: Hero[] = [];

  [Symbol.iterator]() {
    return this.currentHeroes.values();
  }

  canAdd() {
    return this.currentHeroes.length < ALL_HEROES.length;
  }

  canRemove() {
    return this.currentHeroes.length > 0;
  }

  addActive() {
    let hero = ALL_HEROES[this.currentHeroes.length];
    hero.state = 'active';
    this.currentHeroes.push(hero);
  }

  addInactive() {
    let hero = ALL_HEROES[this.currentHeroes.length];
    hero.state = 'inactive';
    this.currentHeroes.push(hero);
  }

  remove() {
    this.currentHeroes.splice(this.currentHeroes.length - 1, 1);
  }

}

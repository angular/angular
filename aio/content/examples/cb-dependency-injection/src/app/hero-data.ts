// #docregion
import { Hero } from './hero';

export class HeroData {
  createDb() {
    let heroes = [
      new Hero(1, 'Windstorm'),
      new Hero(2, 'Bombasto'),
      new Hero(3, 'Magneta'),
      new Hero(4, 'Tornado')
    ];
    return {heroes};
  }
}

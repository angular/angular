import { Hero } from '../hero';

export class MainController {
  hero = new Hero(1, 'Windstorm');
  heroes = [
    new Hero(2, 'Superman'),
    new Hero(3, 'Spiderman')
  ];
  onDelete(hero: Hero) {
    hero.name = 'Ex-' + hero.name;
  }
}

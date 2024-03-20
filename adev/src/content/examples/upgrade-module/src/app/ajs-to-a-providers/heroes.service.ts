// #docregion
import {Hero} from '../hero';

export class HeroesService {
  get() {
    return [new Hero(1, 'Windstorm'), new Hero(2, 'Spiderman')];
  }
}

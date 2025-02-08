// #docregion
// #docregion pure
import {Pipe, PipeTransform} from '@angular/core';

import {Hero} from './heroes';

@Pipe({
  name: 'flyingHeroes',
})
export class FlyingHeroesPipe implements PipeTransform {
  transform(allHeroes: Hero[]) {
    // #docregion filter
    return allHeroes.filter((hero) => hero.canFly);
    // #enddocregion filter
  }
}
// #enddocregion pure

/////// Identical except for the pure flag
// #docregion impure
// #docregion pipe-decorator
@Pipe({
  name: 'flyingHeroesImpure',
  pure: false,
})
// #enddocregion pipe-decorator
export class FlyingHeroesImpurePipe extends FlyingHeroesPipe {}
// #enddocregion impure

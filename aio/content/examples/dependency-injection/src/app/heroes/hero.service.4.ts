// #docregion
import { Injectable } from '@angular/core';
import { HeroModule } from './hero.module';
import { HEROES } from './mock-heroes';

@Injectable({
  // we declare that this service should be created
  // by any injector that includes HeroModule.
  providedIn: HeroModule,
})
export class HeroService {
  getHeroes() { return HEROES; }
}

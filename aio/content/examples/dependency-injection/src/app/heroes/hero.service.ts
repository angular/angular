// #docregion
import { Injectable } from '@angular/core';
import { HEROES }     from './mock-heroes';
import { Logger }     from '../logger.service';
import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root',
  useFactory: (logger: Logger, userService: UserService) => {
    const heroService = new HeroService(logger);
    heroService.isAuthorized = userService.user.isAuthorized;
    return heroService;
  },
  deps: [Logger, UserService],
})
export class HeroService {
  // #docregion internals
  isAuthorized = false;

  constructor(
    private logger: Logger) { }

  getHeroes() {
    let auth = this.isAuthorized ? 'authorized ' : 'unauthorized';
    this.logger.log(`Getting heroes for ${auth} user.`);
    return HEROES.filter(hero => this.isAuthorized || !hero.isSecret);
  }
  // #enddocregion internals
}

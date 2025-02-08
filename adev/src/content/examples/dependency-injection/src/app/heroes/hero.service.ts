// #docregion
import {Injectable} from '@angular/core';
import {HEROES} from './mock-heroes';
import {Logger} from '../logger.service';
import {UserService} from '../user.service';

@Injectable({
  providedIn: 'root',
  useFactory: (logger: Logger, userService: UserService) =>
    new HeroService(logger, userService.user.isAuthorized),
  deps: [Logger, UserService],
})
export class HeroService {
  // #docregion internals
  constructor(
    private logger: Logger,
    private isAuthorized: boolean,
  ) {}

  getHeroes() {
    const auth = this.isAuthorized ? 'authorized' : 'unauthorized';
    this.logger.log(`Getting heroes for ${auth} user.`);
    return HEROES.filter((hero) => this.isAuthorized || !hero.isSecret);
  }
  // #enddocregion internals
}

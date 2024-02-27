// #docregion
import {HeroService} from './hero.service';
import {Logger} from '../logger.service';
import {UserService} from '../user.service';

// #docregion factory
const heroServiceFactory = (logger: Logger, userService: UserService) =>
  new HeroService(logger, userService.user.isAuthorized);
// #enddocregion factory

// #docregion provider
export const heroServiceProvider = {
  provide: HeroService,
  useFactory: heroServiceFactory,
  deps: [Logger, UserService],
};
// #enddocregion provider

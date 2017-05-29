/* tslint:disable:one-line */
// #docregion
import { HeroService } from './hero.service';
import { Logger }      from '../logger.service';
import { UserService } from '../user.service';

// #docregion factory
export function heroServiceFactory(logger: Logger, userService: UserService): HeroService => {
  return new HeroService(logger, userService.user.isAuthorized);
};
// #enddocregion factory

// #docregion provider
export let heroServiceProvider =
  { provide: HeroService,
    useFactory: heroServiceFactory,
    deps: [Logger, UserService]
  };
// #enddocregion provider

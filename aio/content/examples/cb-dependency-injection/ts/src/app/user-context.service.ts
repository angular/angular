// #docplaster
// #docregion
import { Injectable }    from '@angular/core';

import { LoggerService } from './logger.service';
import { UserService }   from './user.service';

// #docregion injectables, injectable
@Injectable()
export class UserContextService {
// #enddocregion injectables, injectable
  name: string;
  role: string;
  loggedInSince: Date;

  // #docregion ctor, injectables
  constructor(private userService: UserService, private loggerService: LoggerService) {
   // #enddocregion ctor, injectables
    this.loggedInSince = new Date();
   // #docregion ctor, injectables
  }
  // #enddocregion ctor, injectables

  loadUser(userId: number) {
    let user = this.userService.getUserById(userId);
    this.name = user.name;
    this.role = user.role;

    this.loggerService.logDebug('loaded User');
  }
// #docregion injectables, injectable
}
// #enddocregion injectables, injectable

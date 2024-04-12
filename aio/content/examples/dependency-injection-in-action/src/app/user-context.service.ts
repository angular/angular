import { Injectable } from '@angular/core';

import { LoggerService } from './logger.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class UserContextService {
  name = '';
  role = '';
  loggedInSince: Date;

  constructor(private userService: UserService, private loggerService: LoggerService) {
    this.loggedInSince = new Date();
  }

  loadUser(userId: number) {
    const user = this.userService.getUserById(userId);
    this.name = user.name;
    this.role = user.role;

    this.loggerService.logDebug('loaded User');
  }
}

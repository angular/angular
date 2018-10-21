// #docregion
import { Component } from '@angular/core';

// #docregion import-services
import { LoggerService }      from './logger.service';
import { UserContextService } from './user-context.service';
import { UserService }        from './user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
// #enddocregion import-services

  private userId = 1;

  // #docregion ctor
  constructor(logger: LoggerService, public userContext: UserContextService) {
    userContext.loadUser(this.userId);
    logger.logInfo('AppComponent initialized');
  }
  // #enddocregion ctor
// #docregion import-services
}
// #enddocregion import-services

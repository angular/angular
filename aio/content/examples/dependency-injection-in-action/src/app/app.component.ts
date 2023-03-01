import { Component } from '@angular/core';

import { LoggerService } from './logger.service';
import { UserContextService } from './user-context.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {

  private userId = 1;

  constructor(logger: LoggerService, public userContext: UserContextService) {
    userContext.loadUser(this.userId);
    logger.logInfo('AppComponent initialized');
  }
}

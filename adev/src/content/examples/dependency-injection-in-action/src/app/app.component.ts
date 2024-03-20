import {Component} from '@angular/core';

import {LoggerService} from './logger.service';
import {UserContextService} from './user-context.service';
import {HeroBiosAndContactsComponent, HeroBiosComponent} from './hero-bios.component';
import {HeroOfTheMonthComponent} from './hero-of-the-month.component';
import {HeroesBaseComponent, SortedHeroesComponent} from './sorted-heroes.component';
import {ParentFinderComponent} from './parent-finder.component';
import {StorageComponent} from './storage.component';
import {HighlightDirective} from './highlight.directive';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    HeroBiosComponent,
    HeroBiosAndContactsComponent,
    HeroOfTheMonthComponent,
    HeroesBaseComponent,
    SortedHeroesComponent,
    ParentFinderComponent,
    StorageComponent,
    HighlightDirective,
  ],
})
export class AppComponent {
  private userId = 1;

  constructor(
    logger: LoggerService,
    public userContext: UserContextService,
  ) {
    userContext.loadUser(this.userId);
    logger.logInfo('AppComponent initialized');
  }
}

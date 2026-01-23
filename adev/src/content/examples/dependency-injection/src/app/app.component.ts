import {Component, Inject} from '@angular/core';

import {APP_CONFIG, AppConfig} from './injection.config';
import {UserService} from './user.service';
import {HeroesComponent} from './heroes/heroes.component';
import {HeroesTspComponent} from './heroes/heroes-tsp.component';
import {ProvidersComponent} from './providers.component';
import {CarComponent} from './car/car.component';
import {InjectorComponent} from './injector.component';
import {TestComponent} from './test.component';

@Component({
  selector: 'app-root',
  template: `
    <h1>{{ title }}</h1>
    <app-car />
    <app-injectors />
    <app-tests />
    <h2>User</h2>
    <p id="user">
      {{ userInfo }}
      <button type="button" (click)="nextUser()">Next User</button>
    </p>

    <p>
      @if (isAuthorized) {
        <app-heroes id="authorized" />
      }
      @if (!isAuthorized) {
        <app-heroes id="unauthorized" />
      }
      @if (isAuthorized) {
        <app-heroes-tsp id="tspAuthorized" />
      }
      <app-providers />
    </p>
  `,
  imports: [
    HeroesComponent,
    HeroesTspComponent,
    ProvidersComponent,
    CarComponent,
    InjectorComponent,
    TestComponent,
  ],
})
export class AppComponent {
  title: string;

  constructor(
    @Inject(APP_CONFIG) config: AppConfig,
    private userService: UserService,
  ) {
    this.title = config.title;
  }

  get isAuthorized() {
    return this.user.isAuthorized;
  }
  nextUser() {
    this.userService.getNewUser();
  }
  get user() {
    return this.userService.user;
  }

  get userInfo() {
    return (
      `Current user, ${this.user.name}, is ` + `${this.isAuthorized ? '' : 'not'} authorized. `
    );
  }
}

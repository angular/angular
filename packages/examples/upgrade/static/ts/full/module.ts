/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// #docplaster
import {
  Component,
  Directive,
  ElementRef,
  Injectable,
  Injector,
  input,
  NgModule,
  output,
} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';
import {
  downgradeComponent,
  downgradeInjectable,
  UpgradeComponent,
  UpgradeModule,
} from '@angular/upgrade/static';

declare var angular: ng.IAngularStatic;

export interface Hero {
  name: string;
  description: string;
}

// #docregion ng1-text-formatter-service
export class TextFormatter {
  titleCase(value: string) {
    return value.replace(/((^|\s)[a-z])/g, (_, c) => c.toUpperCase());
  }
}

// #enddocregion
// #docregion ng2-heroes
// This Angular component will be "downgraded" to be used in AngularJS
@Component({
  selector: 'ng2-heroes',
  // This template uses the upgraded `ng1-hero` component
  // Note that because its element is compiled by Angular we must use camelCased attribute names
  template: `<header><ng-content selector="h1"></ng-content></header>
    <ng-content selector=".extra"></ng-content>
    <div *ngFor="let hero of heroes()">
      <ng1-hero [hero]="hero" (onRemove)="removeHero.emit(hero)"
        ><strong>Super Hero</strong></ng1-hero
      >
      </div>
    <button (click)="addHero.emit()">Add Hero</button>`,
  standalone: false,
})
export class Ng2HeroesComponent {
  heroes = input<Hero[]>([]);
  addHero = output<void>();
  removeHero = output<Hero>();
}
// #enddocregion

// #docregion ng2-heroes-service
// This Angular service will be "downgraded" to be used in AngularJS
@Injectable()
export class HeroesService {
  heroes: Hero[] = [
    {name: 'superman', description: 'The man of steel'},
    {name: 'wonder woman', description: 'Princess of the Amazons'},
    {name: 'thor', description: 'The hammer-wielding god'},
  ];

  // #docregion use-ng1-upgraded-service
  constructor(textFormatter: TextFormatter) {
    // Change all the hero names to title case, using the "upgraded" AngularJS service
    this.heroes.forEach((hero: Hero) => (hero.name = textFormatter.titleCase(hero.name)));
  }
  // #enddocregion

  addHero() {
    this.heroes = this.heroes.concat([
      {name: 'Kamala Khan', description: 'Epic shape-shifting healer'},
    ]);
  }

  removeHero(hero: Hero) {
    this.heroes = this.heroes.filter((item: Hero) => item !== hero);
  }
}
// #enddocregion

// #docregion ng1-hero-wrapper
// This Angular directive will act as an interface to the "upgraded" AngularJS component
@Directive({
  selector: 'ng1-hero',
  standalone: false,
})
export class Ng1HeroComponentWrapper extends UpgradeComponent {
  // The names of the input and output properties here must match the names of the
  // `<` and `&` bindings in the AngularJS component that is being wrapped
  hero = input.required<Hero>();
  onRemove = output<void>();

  constructor(elementRef: ElementRef, injector: Injector) {
    // We must pass the name of the directive as used by AngularJS to the super
    super('ng1Hero', elementRef, injector);
  }
}
// #enddocregion

// #docregion ng2-module
// This NgModule represents the Angular pieces of the application
@NgModule({
  declarations: [Ng2HeroesComponent, Ng1HeroComponentWrapper],
  providers: [
    HeroesService,
    // #docregion upgrade-ng1-service
    // Register an Angular provider whose value is the "upgraded" AngularJS service
    {provide: TextFormatter, useFactory: (i: any) => i.get('textFormatter'), deps: ['$injector']},
    // #enddocregion
  ],
  // We must import `UpgradeModule` to get access to the AngularJS core services
  imports: [BrowserModule, UpgradeModule],
})
// #docregion bootstrap-ng1
export class Ng2AppModule {
  // #enddocregion ng2-module
  constructor(private upgrade: UpgradeModule) {}

  ngDoBootstrap() {
    // We bootstrap the AngularJS app.
    this.upgrade.bootstrap(document.body, [ng1AppModule.name]);
  }
  // #docregion ng2-module
}
// #enddocregion bootstrap-ng1
// #enddocregion ng2-module

// This Angular 1 module represents the AngularJS pieces of the application
export const ng1AppModule: ng.IModule = angular.module('ng1AppModule', []);

// #docregion ng1-hero
// This AngularJS component will be "upgraded" to be used in Angular
ng1AppModule.component('ng1Hero', {
  bindings: {hero: '<', onRemove: '&'},
  transclude: true,
  template: `<div class="title" ng-transclude></div>
             <h2>{{ $ctrl.hero.name }}</h2>
             <p>{{ $ctrl.hero.description }}</p>
             <button ng-click="$ctrl.onRemove()">Remove</button>`,
});
// #enddocregion

// #docregion ng1-text-formatter-service
// This AngularJS service will be "upgraded" to be used in Angular
ng1AppModule.service('textFormatter', [TextFormatter]);
// #enddocregion

// #docregion downgrade-ng2-heroes-service
// Register an AngularJS service, whose value is the "downgraded" Angular injectable.
ng1AppModule.factory('heroesService', downgradeInjectable(HeroesService) as any);
// #enddocregion

// #docregion ng2-heroes-wrapper
// This directive will act as the interface to the "downgraded" Angular component
ng1AppModule.directive('ng2Heroes', downgradeComponent({component: Ng2HeroesComponent}));
// #enddocregion

// #docregion example-app
// This is our top level application component
ng1AppModule.component('exampleApp', {
  // We inject the "downgraded" HeroesService into this AngularJS component
  // (We don't need the `HeroesService` type for AngularJS DI - it just helps with TypeScript
  // compilation)
  controller: [
    'heroesService',
    function (heroesService: HeroesService) {
      this.heroesService = heroesService;
    },
  ],
  // This template makes use of the downgraded `ng2-heroes` component
  // Note that because its element is compiled by AngularJS we must use kebab-case attributes
  // for inputs and outputs
  template: `<link rel="stylesheet" href="./styles.css">
          <ng2-heroes [heroes]="$ctrl.heroesService.heroes" (add-hero)="$ctrl.heroesService.addHero()" (remove-hero)="$ctrl.heroesService.removeHero($event)">
            <h1>Heroes</h1>
            <p class="extra">There are {{ $ctrl.heroesService.heroes.length }} heroes.</p>
          </ng2-heroes>`,
});
// #enddocregion

// #docregion bootstrap-ng2
// We bootstrap the Angular module as we would do in a normal Angular app.
// (We are using the dynamic browser platform as this example has not been compiled AOT.)
platformBrowser().bootstrapModule(Ng2AppModule);
// #enddocregion

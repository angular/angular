/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// #docplaster
import {Component, Directive, ElementRef, EventEmitter, Inject, Injectable, Injector, Input, NgModule, Output, StaticProvider} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
// #docregion basic-how-to
// Alternatively, we could import and use an `NgModuleFactory` instead:
// import {MyLazyAngularModuleNgFactory} from './my-lazy-angular-module.ngfactory';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
// #enddocregion
/* tslint:disable: no-duplicate-imports */
import {UpgradeComponent} from '@angular/upgrade/static';
import {downgradeComponent} from '@angular/upgrade/static';
// #docregion basic-how-to
import {downgradeModule} from '@angular/upgrade/static';
// #enddocregion
/* tslint:enable: no-duplicate-imports */


declare var angular: ng.IAngularStatic;

interface Hero {
  name: string;
  description: string;
}


// This Angular service will use an "upgraded" AngularJS service.
@Injectable()
class HeroesService {
  heroes: Hero[] = [
    {name: 'superman', description: 'The man of steel'},
    {name: 'wonder woman', description: 'Princess of the Amazons'},
    {name: 'thor', description: 'The hammer-wielding god'}
  ];

  constructor(@Inject('titleCase') titleCase: (v: string) => string) {
    // Change all the hero names to title case, using the "upgraded" AngularJS service.
    this.heroes.forEach((hero: Hero) => hero.name = titleCase(hero.name));
  }

  addHero() {
    const newHero: Hero = {name: 'Kamala Khan', description: 'Epic shape-shifting healer'};
    this.heroes = this.heroes.concat([newHero]);
    return newHero;
  }

  removeHero(hero: Hero) {
    this.heroes = this.heroes.filter((item: Hero) => item !== hero);
  }
}


// This Angular component will be "downgraded" to be used in AngularJS.
@Component({
  selector: 'ng2-heroes',
  // This template uses the "upgraded" `ng1-hero` component
  // (Note that because its element is compiled by Angular we must use camelCased attribute names.)
  template: `
    <div class="ng2-heroes">
      <header><ng-content selector="h1"></ng-content></header>
      <ng-content selector=".extra"></ng-content>
      <div *ngFor="let hero of this.heroesService.heroes">
        <ng1-hero [hero]="hero" (onRemove)="onRemoveHero(hero)">
          <strong>Super Hero</strong>
        </ng1-hero>
      </div>
      <button (click)="onAddHero()">Add Hero</button>
    </div>
  `,
})
class Ng2HeroesComponent {
  @Output() private addHero = new EventEmitter<Hero>();
  @Output() private removeHero = new EventEmitter<Hero>();

  constructor(
      @Inject('$rootScope') private $rootScope: ng.IRootScopeService,
      public heroesService: HeroesService) {}

  onAddHero() {
    const newHero = this.heroesService.addHero();
    this.addHero.emit(newHero);

    // When a new instance of an "upgraded" component - such as `ng1Hero` - is created, we want to
    // run a `$digest` to initialize its bindings. Here, the component will be created by `ngFor`
    // asynchronously, thus we have to schedule the `$digest` to also happen asynchronously.
    this.$rootScope.$applyAsync();
  }

  onRemoveHero(hero: Hero) {
    this.heroesService.removeHero(hero);
    this.removeHero.emit(hero);
  }
}


// This Angular directive will act as an interface to the "upgraded" AngularJS component.
@Directive({selector: 'ng1-hero'})
class Ng1HeroComponentWrapper extends UpgradeComponent {
  // The names of the input and output properties here must match the names of the
  // `<` and `&` bindings in the AngularJS component that is being wrapped.
  @Input() hero!: Hero;
  @Output() onRemove!: EventEmitter<void>;

  constructor(elementRef: ElementRef, injector: Injector) {
    // We must pass the name of the directive as used by AngularJS to the super.
    super('ng1Hero', elementRef, injector);
  }
}


// This Angular module represents the Angular pieces of the application.
@NgModule({
  imports: [BrowserModule],
  declarations: [Ng2HeroesComponent, Ng1HeroComponentWrapper],
  providers: [
    HeroesService,
    // Register an Angular provider whose value is the "upgraded" AngularJS service.
    {provide: 'titleCase', useFactory: (i: any) => i.get('titleCase'), deps: ['$injector']}
  ],
  // All components that are to be "downgraded" must be declared as `entryComponents`.
  entryComponents: [Ng2HeroesComponent]
  // Note that there are no `bootstrap` components, since the "downgraded" component
  // will be instantiated by ngUpgrade.
})
class MyLazyAngularModule {
  // Empty placeholder method to prevent the `Compiler` from complaining.
  ngDoBootstrap() {}
}


// #docregion basic-how-to


// The function that will bootstrap the Angular module (when/if necessary).
// (This would be omitted if we provided an `NgModuleFactory` directly.)
const ng2BootstrapFn = (extraProviders: StaticProvider[]) =>
    platformBrowserDynamic(extraProviders).bootstrapModule(MyLazyAngularModule);
// #enddocregion
// (We are using the dynamic browser platform, as this example has not been compiled AOT.)


// #docregion basic-how-to


// This AngularJS module represents the AngularJS pieces of the application.
const myMainAngularJsModule = angular.module('myMainAngularJsModule', [
  // We declare a dependency on the "downgraded" Angular module.
  downgradeModule(ng2BootstrapFn)
  // or
  // downgradeModule(MyLazyAngularModuleFactory)
]);
// #enddocregion


// This AngularJS component will be "upgraded" to be used in Angular.
myMainAngularJsModule.component('ng1Hero', {
  bindings: {hero: '<', onRemove: '&'},
  transclude: true,
  template: `
    <div class="ng1-hero">
      <div class="title" ng-transclude></div>
      <h2>{{ $ctrl.hero.name }}</h2>
      <p>{{ $ctrl.hero.description }}</p>
      <button ng-click="$ctrl.onRemove()">Remove</button>
    </div>
  `
});


// This AngularJS service will be "upgraded" to be used in Angular.
myMainAngularJsModule.factory(
    'titleCase', () => (value: string) => value.replace(/(^|\s)[a-z]/g, m => m.toUpperCase()));


// This directive will act as the interface to the "downgraded" Angular component.
myMainAngularJsModule.directive(
    'ng2Heroes', downgradeComponent({
      component: Ng2HeroesComponent,
      // Optionally, disable `$digest` propagation to avoid unnecessary change detection.
      // (Change detection is still run when the inputs of a "downgraded" component change.)
      propagateDigest: false
    }));


// This is our top level application component.
myMainAngularJsModule.component('exampleApp', {
  // This template makes use of the "downgraded" `ng2-heroes` component,
  // but loads it lazily only when/if the user clicks the button.
  // (Note that because its element is compiled by AngularJS,
  //  we must use kebab-case attributes for inputs and outputs.)
  template: `
    <link rel="stylesheet" href="./styles.css">
    <button ng-click="$ctrl.toggleHeroes()">{{ $ctrl.toggleBtnText() }}</button>
    <ng2-heroes
        ng-if="$ctrl.showHeroes"
        (add-hero)="$ctrl.setStatusMessage('Added hero ' + $event.name)"
        (remove-hero)="$ctrl.setStatusMessage('Removed hero ' + $event.name)">
      <h1>Heroes</h1>
      <p class="extra">Status: {{ $ctrl.statusMessage }}</p>
    </ng2-heroes>
  `,
  controller: function() {
    this.showHeroes = false;
    this.statusMessage = 'Ready';

    this.setStatusMessage = (msg: string) => this.statusMessage = msg;
    this.toggleHeroes = () => this.showHeroes = !this.showHeroes;
    this.toggleBtnText = () => `${this.showHeroes ? 'Hide' : 'Show'} heroes`;
  }
});


// We bootstrap the Angular module as we would do in a normal Angular app.
angular.bootstrap(document.body, [myMainAngularJsModule.name]);

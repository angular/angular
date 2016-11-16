/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component, Directive, DoCheck, ElementRef, EventEmitter, Inject, Injectable, Injector, Input, NgModule, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {UpgradeComponent, UpgradeModule, downgradeComponent, downgradeInjectable} from '@angular/upgrade/static';

interface Hero {
  name: string;
  description: string;
}

// #docregion Angular 2 Stuff
// #docregion ng2-heroes
// This Angular 2 component will be "downgraded" to be used in Angular 1
@Component({
  selector: 'ng2-heroes',
  // This template uses the upgraded `ng1-hero` component
  // Note that because its element is compiled by Angular 2+ we must use camelCased attribute names
  template: `<h1>Heroes</h1>
             <p><ng-content></ng-content></p>
             <div *ngFor="let hero of heroes">
               <ng1-hero [hero]="hero" (onRemove)="removeHero.emit(hero)"><strong>Super Hero</strong></ng1-hero>
             </div>
             <button (click)="addHero.emit()">Add Hero</button>`,
})
class Ng2HeroesComponent {
  @Input() heroes: Hero[];
  @Output() addHero = new EventEmitter();
  @Output() removeHero = new EventEmitter();
}
// #enddocregion

// #docregion ng2-heroes-service
// This Angular 2 service will be "downgraded" to be used in Angular 1
@Injectable()
class HeroesService {
  heroes: Hero[] = [
    {name: 'superman', description: 'The man of steel'},
    {name: 'wonder woman', description: 'Princess of the Amazons'},
    {name: 'thor', description: 'The hammer-wielding god'}
  ];

  // #docregion use-ng1-upgraded-service
  constructor(@Inject('titleCase') titleCase: (v: string) => string) {
    // Change all the hero names to title case, using the "upgraded" Angular 1 service
    this.heroes.forEach((hero: Hero) => hero.name = titleCase(hero.name));
  }
  // #enddocregion

  addHero() {
    this.heroes =
        this.heroes.concat([{name: 'Kamala Khan', description: 'Epic shape-shifting healer'}]);
  }

  removeHero(hero: Hero) { this.heroes = this.heroes.filter((item: Hero) => item !== hero); }
}
// #enddocregion

// #docregion ng1-hero-wrapper
// This Angular 2 directive will act as an interface to the "upgraded" Angular 1 component
@Directive({selector: 'ng1-hero'})
class Ng1HeroComponentWrapper extends UpgradeComponent implements OnInit, OnChanges, DoCheck,
    OnDestroy {
  // The names of the input and output properties here must match the names of the
  // `<` and `&` bindings in the Angular 1 component that is being wrapped
  @Input() hero: Hero;
  @Output() onRemove: EventEmitter<void>;
  constructor(@Inject(ElementRef) elementRef: ElementRef, @Inject(Injector) injector: Injector) {
    // We must pass the name of the directive as used by Angular 1 to the super
    super('ng1Hero', elementRef, injector);
  }

  // For this class to work when compiled with AoT, we must implement these lifecycle hooks
  // because the AoT compiler will not realise that the super class implements them
  ngOnInit() { super.ngOnInit(); }

  ngOnChanges(changes: SimpleChanges) { super.ngOnChanges(changes); }

  ngDoCheck() { super.ngDoCheck(); }

  ngOnDestroy() { super.ngOnDestroy(); }
}
// #enddocregion

// #docregion ng2-module
// This NgModule represents the Angular 2 pieces of the application
@NgModule({
  declarations: [Ng2HeroesComponent, Ng1HeroComponentWrapper],
  providers: [
    HeroesService,
    // #docregion upgrade-ng1-service
    // Register an Angular 2+ provider whose value is the "upgraded" Angular 1 service
    {provide: 'titleCase', useFactory: (i: any) => i.get('titleCase'), deps: ['$injector']}
    // #enddocregion
  ],
  // All components that are to be "downgraded" must be declared as `entryComponents`
  entryComponents: [Ng2HeroesComponent],
  // We must import `UpgradeModule` to get access to the Angular 1 core services
  imports: [BrowserModule, UpgradeModule]
})
class Ng2AppModule {
  ngDoBootstrap() { /* this is a placeholder to stop the boostrapper from complaining */
  }
}
// #enddocregion
// #enddocregion


// #docregion Angular 1 Stuff
// #docregion ng1-module
// This Angular 1 module represents the Angular 1 pieces of the application
const ng1AppModule = angular.module('ng1AppModule', []);
// #enddocregion

// #docregion ng1-hero
// This Angular 1 component will be "upgraded" to be used in Angular 2+
ng1AppModule.component('ng1Hero', {
  bindings: {hero: '<', onRemove: '&'},
  transclude: true,
  template: `<div class="title" ng-transclude></div>
             <h2>{{ $ctrl.hero.name }}</h2>
             <p>{{ $ctrl.hero.description }}</p>
             <button ng-click="$ctrl.onRemove()">Remove</button>`
});
// #enddocregion

// #docregion ng1-title-case-service
// This Angular 1 service will be "upgraded" to be used in Angular 2+
ng1AppModule.factory(
    'titleCase',
    () => (value: string) => value.replace(/((^|\s)[a-z])/g, (_, c) => c.toUpperCase()));
// #enddocregion

// #docregion downgrade-ng2-heroes-service
// Register an Angular 1 service, whose value is the "downgraded" Angular 2+ injectable.
ng1AppModule.factory('heroesService', downgradeInjectable(HeroesService));
// #enddocregion

// #docregion ng2-heroes-wrapper
// This is directive will act as the interface to the "downgraded"  Angular 2+ component
ng1AppModule.directive(
    'ng2Heroes',
    downgradeComponent(
        // The inputs and outputs here must match the relevant names of the properties on the
        // "downgraded" component
        {component: Ng2HeroesComponent, inputs: ['heroes'], outputs: ['addHero', 'removeHero']}));
// #enddocregion

// #docregion example-app
// This is our top level application component
ng1AppModule.component('exampleApp', {
  // We inject the "downgraded" HeroesService into this Angular 1 component
  // (We don't need the `HeroesService` type for Angular 1 DI - it just helps with TypeScript
  // compilation)
  controller: [
    'heroesService', function(heroesService: HeroesService) { this.heroesService = heroesService; }
  ],
  // This template make use of the downgraded `ng2-heroes` component
  // Note that because its element is compiled by Angular 1 we must use kebab-case attributes for
  // inputs and outputs
  template: `<link rel="stylesheet" href="./styles.css">
             <ng2-heroes [heroes]="$ctrl.heroesService.heroes" (add-hero)="$ctrl.heroesService.addHero()" (remove-hero)="$ctrl.heroesService.removeHero($event)">
               There are {{ $ctrl.heroesService.heroes.length }} heroes.
             </ng2-heroes>`
});
// #enddocregion
// #enddocregion


// #docregion bootstrap
// First we bootstrap the Angular 2 HybridModule
// (We are using the dynamic browser platform as this example has not been compiled AoT)
platformBrowserDynamic().bootstrapModule(Ng2AppModule).then(ref => {
  // Once Angular 2 bootstrap is complete then we bootstrap the Angular 1 module
  const upgrade = ref.injector.get(UpgradeModule) as UpgradeModule;
  upgrade.bootstrap(document.body, [ng1AppModule.name]);
});
// #enddocregion

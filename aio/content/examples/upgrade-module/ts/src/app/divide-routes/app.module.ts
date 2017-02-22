// #docregion
declare var angular: angular.IAngularStatic;
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';

import { HeroModule } from './hero.module';

// #docregion router-config
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { RouterModule, UrlHandlingStrategy, UrlTree } from '@angular/router';
import { AppComponent } from './app.component';

class HybridUrlHandlingStrategy implements UrlHandlingStrategy {
  // use only process the `/hero` url
  shouldProcessUrl(url: UrlTree) { return url.toString().startsWith('/hero'); }
  extract(url: UrlTree) { return url; }
  merge(url: UrlTree, whole: UrlTree) { return url; }
}

@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule,
    HeroModule,
    RouterModule.forRoot([])
  ],
  providers: [
    // use hash location strategy
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    // use custom url handling strategy
    { provide: UrlHandlingStrategy, useClass: HybridUrlHandlingStrategy }
  ],
  declarations: [ AppComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
// #enddocregion router-config

import { Villain } from '../villain';

export const villainDetail = {
  template: `
    <h1>Villain detail</h1>
    <h2>{{$ctrl.villain.name}} - {{$ctrl.villain.description}}</h2>
  `,
  controller: function() {
    this.villain = new Villain(1, 'Mr. Nice', 'No More Mr. Nice Guy');
  }
};

angular.module('heroApp', ['ngRoute'])
  .component('villainDetail', villainDetail)
  .config(['$locationProvider', '$routeProvider',
    function config($locationProvider: angular.ILocationProvider,
                    $routeProvider: angular.route.IRouteProvider) {
      // #docregion ajs-route
      $routeProvider
        .when('/villain', { template: '<villain-detail></villain-detail>' });
      // #enddocregion ajs-route
    }
  ]);

declare const angular: angular.IAngularStatic;
import '@angular/compiler';
import { DoBootstrap, NgModule } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';

import { heroDetailComponent } from './hero-detail.component';

// #docregion ngmodule, register
import { Heroes } from './heroes';
// #enddocregion register

@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule
  ],
  providers: [ Heroes ]
})
export class AppModule implements DoBootstrap {
  constructor(private upgrade: UpgradeModule) { }
  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, ['heroApp'], { strictDi: true });
  }
}
// #enddocregion ngmodule
// #docregion register
import { downgradeInjectable } from '@angular/upgrade/static';

angular.module('heroApp', [])
  .factory('heroes', downgradeInjectable(Heroes))
  .component('heroDetail', heroDetailComponent);
// #enddocregion register

platformBrowserDynamic().bootstrapModule(AppModule);

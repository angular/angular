declare var angular: angular.IAngularStatic;
import { NgModule } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';

import { heroDetailComponent } from './hero-detail.component';

// #docregion ngmodule
import { Heroes } from './heroes';

@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule
  ],
  providers: [ Heroes ]
})
export class AppModule {
  ngDoBootstrap() {}
}
// #enddocregion ngmodule
// #docregion register
import { downgradeInjectable } from '@angular/upgrade/static';

angular.module('heroApp', [])
  .factory('heroes', downgradeInjectable(Heroes))
  .component('heroDetail', heroDetailComponent);
// #enddocregion register

platformBrowserDynamic().bootstrapModule(AppModule).then(platformRef => {
  const upgrade = platformRef.injector.get(UpgradeModule) as UpgradeModule;
  upgrade.bootstrap(document.body, ['heroApp'], {strictDi: true});
});

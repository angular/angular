declare var angular: angular.IAngularStatic;
import { NgModule } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule, downgradeComponent } from '@angular/upgrade/static';

import { MainController } from './main.controller';

// #docregion downgradecomponent
import { HeroDetailComponent } from './hero-detail.component';

// #enddocregion downgradecomponent
@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule
  ],
  declarations: [
    HeroDetailComponent
  ],
  entryComponents: [
    HeroDetailComponent
  ]
})
export class AppModule {
  constructor(private upgrade: UpgradeModule) { }
  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, ['heroApp'], { strictDi: true });
  }
}
// #docregion downgradecomponent

angular.module('heroApp', [])
  .controller('MainController', MainController)
  .directive('heroDetail', downgradeComponent({component: HeroDetailComponent}) as angular.IDirectiveFactory);

// #enddocregion downgradecomponent

platformBrowserDynamic().bootstrapModule(AppModule);

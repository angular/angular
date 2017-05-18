declare var angular: angular.IAngularStatic;
import { NgModule } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';

// #docregion downgradecomponent, ngmodule
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
// #enddocregion ngmodule
// #docregion downgradecomponent

import { downgradeComponent } from '@angular/upgrade/static';

angular.module('heroApp', [])
  .directive(
    'heroDetail',
    downgradeComponent({ component: HeroDetailComponent }) as angular.IDirectiveFactory
  );

// #enddocregion downgradecomponent

platformBrowserDynamic().bootstrapModule(AppModule);

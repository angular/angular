declare var angular: angular.IAngularStatic;
import { NgModule } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule, downgradeComponent } from '@angular/upgrade/static';

import { HeroDetailComponent } from './hero-detail.component';
import { HeroesService } from './heroes.service';
// #docregion register
import { heroesServiceProvider } from './ajs-upgraded-providers';

@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule
  ],
  providers: [
    heroesServiceProvider
  ],
  // #enddocregion register
  declarations: [
    HeroDetailComponent
  ],
  entryComponents: [
    HeroDetailComponent
  ]
// #docregion register
})
export class AppModule {
  constructor(private upgrade: UpgradeModule) { }
  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, ['heroApp'], { strictDi: true });
  }
}
// #enddocregion register

angular.module('heroApp', [])
  .service('heroes', HeroesService)
  .directive(
    'heroDetail',
    downgradeComponent({component: HeroDetailComponent}) as angular.IDirectiveFactory
  );

platformBrowserDynamic().bootstrapModule(AppModule);

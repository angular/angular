declare var angular: angular.IAngularStatic;
import { NgModule } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule, downgradeComponent } from '@angular/upgrade/static';

import { heroDetail, HeroDetailDirective } from './hero-detail.component';
import { ContainerComponent } from './container.component';

// #docregion hero-detail-upgrade
@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule
  ],
  declarations: [
    HeroDetailDirective,
    // #enddocregion hero-detail-upgrade
    ContainerComponent
  ],
  entryComponents: [
    ContainerComponent
  // #docregion hero-detail-upgrade
  ]
})
export class AppModule {
  ngDoBootstrap() {}
}
// #enddocregion hero-detail-upgrade

angular.module('heroApp', [])
  .component('heroDetail', heroDetail)
  .directive(
    'myContainer',
    downgradeComponent({component: ContainerComponent}) as angular.IDirectiveFactory
  );

platformBrowserDynamic().bootstrapModule(AppModule).then(platformRef => {
  const upgrade = platformRef.injector.get(UpgradeModule) as UpgradeModule;
  upgrade.bootstrap(document.body, ['heroApp'], {strictDi: true});
});

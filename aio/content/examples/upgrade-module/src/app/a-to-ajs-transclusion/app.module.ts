declare var angular: angular.IAngularStatic;
import { NgModule } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule, downgradeComponent } from '@angular/upgrade/static';

import { heroDetail, HeroDetailDirective } from './hero-detail.component';
import { ContainerComponent } from './container.component';

@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule
  ],
  declarations: [
    ContainerComponent,
    HeroDetailDirective
  ],
  entryComponents: [
    ContainerComponent
  ]
})
export class AppModule {
  constructor(private upgrade: UpgradeModule) { }
  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, ['heroApp'], { strictDi: true });
  }
}

angular.module('heroApp', [])
  .component('heroDetail', heroDetail)
  .directive(
    'myContainer',
    downgradeComponent({component: ContainerComponent}) as angular.IDirectiveFactory
  );

platformBrowserDynamic().bootstrapModule(AppModule);

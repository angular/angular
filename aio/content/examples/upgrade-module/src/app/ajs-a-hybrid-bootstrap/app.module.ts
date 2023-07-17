declare const angular: angular.IAngularStatic;
import '@angular/compiler';
// #docregion ngmodule
import { DoBootstrap, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';

@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule
  ]
})
export class AppModule implements DoBootstrap {
  constructor(private upgrade: UpgradeModule) { }
  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, ['heroApp'], { strictDi: true });
  }
}
// #enddocregion ngmodule
angular.module('heroApp', [])
  .controller('MainCtrl', function() {
    this.message = 'Hello world';
  });

// #docregion bootstrap
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

platformBrowserDynamic().bootstrapModule(AppModule);
// #enddocregion bootstrap

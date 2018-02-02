import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ServerModule} from '@angular/platform-server';
import {Lib2Module} from 'lib2_built';

@Component({
  selector: 'test-app',
  template: '<test-cmp></test-cmp>',
})
export class TestApp {}

@NgModule({
  declarations: [TestApp],
  bootstrap: [TestApp],
  imports: [
    Lib2Module,
    BrowserModule.withServerTransition({appId: 'appId'}),
    ServerModule,
  ],
})
export class AppModule {}

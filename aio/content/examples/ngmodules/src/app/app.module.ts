// #docplaster

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

/* 애플리케이션 최상위 컴포넌트 */
import { AppComponent } from './app.component';

/* 기능 모듈 */
import { ContactModule } from './contact/contact.module';
// #docregion import-for-root
import { GreetingModule } from './greeting/greeting.module';
// #enddocregion import-for-root

/* 라우팅 모듈 */
import { AppRoutingModule } from './app-routing.module';

// #docregion import-for-root
@NgModule({
  imports: [
    // #enddocregion import-for-root
    BrowserModule,
    ContactModule,
    // #docregion import-for-root
    GreetingModule.forRoot({userName: 'Miss Marple'}),
    // #enddocregion import-for-root
    AppRoutingModule
    // #docregion import-for-root
  ],
  // #enddocregion import-for-root
  declarations: [
    AppComponent
  ],
  bootstrap: [AppComponent]
  // #docregion import-for-root
})
// #enddocregion import-for-root
export class AppModule { }

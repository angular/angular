import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

/* 애플리케이션 최상위 컴포넌트 */
import { AppComponent } from './app.component';

/* 기능 모듈 */
import { ContactModule } from './contact/contact.module';
// #docregion import-for-root
import { CoreModule } from './core/core.module';
// #enddocregion import-for-root

/* 라우팅 모듈 */
import { AppRoutingModule } from './app-routing.module';


// #docregion import-for-root
@NgModule({
  imports: [
    BrowserModule,
    ContactModule,
    CoreModule.forRoot({userName: 'Miss Marple'}),
    AppRoutingModule
  ],
  // #enddocregion import-for-root
  providers: [],
  declarations: [
    AppComponent
  ],
  bootstrap: [AppComponent]
  // #docregion import-for-root
})
export class AppModule { }
// #enddocregion import-for-root

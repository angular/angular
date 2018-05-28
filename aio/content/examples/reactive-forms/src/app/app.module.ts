// #docplaster
// #docregion
// #docregion v1
import { NgModule }            from '@angular/core';
import { BrowserModule }       from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';  // <-- #1 반응형 폼 모듈을 로드합니다.

import { AppComponent }        from './app.component';
import { HeroDetailComponent } from './hero-detail/hero-detail.component';
// #enddocregion v1
// #docregion hero-service-list
// add JavaScript imports
import { HeroListComponent }   from './hero-list/hero-list.component';
import { HeroService }         from './hero.service';
// #docregion v1

@NgModule({
  declarations: [
    AppComponent,
    HeroDetailComponent,
// #enddocregion v1
    HeroListComponent // <--declare HeroListComponent
// #docregion v1
  ],
 // #enddocregion hero-service-list
  imports: [
    BrowserModule,
    ReactiveFormsModule // <-- #2 @NgModule imports 목록에 추가합니다.
  ],
  // #enddocregion v1
  // export for the DemoModule
  // #docregion hero-service-list
  // ...
  exports: [
    AppComponent,
    HeroDetailComponent,
    HeroListComponent // <-- export HeroListComponent
  ],
  providers: [ HeroService ], // <-- provide HeroService
// #enddocregion hero-service-list
// #docregion v1
  bootstrap: [ AppComponent ]
})
export class AppModule { }
// #enddocregion v1

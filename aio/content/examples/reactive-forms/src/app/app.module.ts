// #docplaster
<<<<<<< HEAD
// #docregion
// #docregion v1
import { NgModule }            from '@angular/core';
import { BrowserModule }       from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';  // <-- #1 반응형 폼 모듈을 로드합니다.

import { AppComponent }        from './app.component';
import { HeroDetailComponent } from './hero-detail/hero-detail.component';
// #enddocregion v1
// #docregion hero-service-list
// JavaScript import 목록 추가
import { HeroListComponent }   from './hero-list/hero-list.component';
import { HeroService }         from './hero.service';
// #docregion v1
=======
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// #docregion imports
import { ReactiveFormsModule } from '@angular/forms';

// #enddocregion imports
import { AppComponent } from './app.component';
import { NameEditorComponent } from './name-editor/name-editor.component';
import { ProfileEditorComponent } from './profile-editor/profile-editor.component';
>>>>>>> 6a797d540169ce979048e30abc619d4c6eaf7b1d

// #docregion imports
@NgModule({
// #enddocregion imports
  declarations: [
    AppComponent,
    NameEditorComponent,
    ProfileEditorComponent
  ],
// #docregion imports
  imports: [
// #enddocregion imports
    BrowserModule,
// #docregion imports
    // other imports ...
    ReactiveFormsModule
  ],
// #enddocregion imports
  providers: [],
  bootstrap: [AppComponent]
// #docregion imports
})
export class AppModule { }
// #enddocregion imports

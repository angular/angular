import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module'; // AppRoutingModule을 로드합니다.
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule // Angular CLI가 AppRoutingModule을 AppModule imports 배열에 자동으로 추가합니다.
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

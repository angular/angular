// #docregion
import { NgModule } from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // <--- JavaScript import from Angular

/* 기타 심볼 로드 */

@NgModule({
  imports: [
    BrowserModule,
    FormsModule  // <--- 이 모듈을 현재 NgModule에 로드합니다.
  ],
  /* 모듈 메타데이터 기타 설정 */
})
export class AppModule { }

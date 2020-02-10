// #docplaster
// #docregion, v1
import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
// #docregion import-http-client
import { HttpClientModule }    from '@angular/common/http';
// #enddocregion import-http-client

// #docregion import-in-mem-stuff
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService }  from './in-memory-data.service';
// #enddocregion import-in-mem-stuff

import { AppRoutingModule }     from './app-routing.module';

import { AppComponent }         from './app.component';
import { DashboardComponent }   from './dashboard/dashboard.component';
import { HeroDetailComponent }  from './hero-detail/hero-detail.component';
import { HeroesComponent }      from './heroes/heroes.component';
// #enddocregion v1
import { HeroSearchComponent }  from './hero-search/hero-search.component';
// #docregion v1
import { MessagesComponent }    from './messages/messages.component';

    // #docregion import-httpclientmodule
@NgModule({
  imports: [
    // #enddocregion import-httpclientmodule
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    // #docregion in-mem-web-api-imports
    // #docregion import-httpclientmodule
    HttpClientModule,
    // #enddocregion import-httpclientmodule

    // HttpClientInMemoryWebApiModule 모듈은 HTTP 요청을 가로채고 서버의 응답을 흉내냅니다.
    // 실제 서버가 준비되면 이 부분을 제거하면 됩니다.
    HttpClientInMemoryWebApiModule.forRoot(
      InMemoryDataService, { dataEncapsulation: false }
    )
    // #enddocregion in-mem-web-api-imports
  // #docregion import-httpclientmodule
  ],
  // #enddocregion import-httpclientmodule
  declarations: [
    AppComponent,
    DashboardComponent,
    HeroesComponent,
    HeroDetailComponent,
    MessagesComponent,
    // #enddocregion v1
    HeroSearchComponent
    // #docregion v1
  ],
  bootstrap: [ AppComponent ]
// #docregion import-httpclientmodule
})
// #enddocregion import-httpclientmodule

export class AppModule { }
// #enddocregion , v1

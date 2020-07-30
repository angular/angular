// #docplaster
// #docregion sketch
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
// #enddocregion sketch
import { FormsModule } from '@angular/forms';
// #docregion sketch
import { HttpClientModule } from '@angular/common/http';
// #enddocregion sketch
import { HttpClientXsrfModule } from '@angular/common/http';

import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './in-memory-data.service';

import { RequestCache, RequestCacheWithMap } from './request-cache.service';

import { AppComponent } from './app.component';
import { AuthService } from './auth.service';
import { ConfigComponent } from './config/config.component';
import { DownloaderComponent } from './downloader/downloader.component';
import { HeroesComponent } from './heroes/heroes.component';
import { HttpErrorHandler } from './http-error-handler.service';
import { MessageService } from './message.service';
import { MessagesComponent } from './messages/messages.component';
import { PackageSearchComponent } from './package-search/package-search.component';
import { UploaderComponent } from './uploader/uploader.component';

import { httpInterceptorProviders } from './http-interceptors/index';
// #docregion sketch

@NgModule({
// #docregion xsrf
  imports: [
// #enddocregion xsrf
    BrowserModule,
// #enddocregion sketch
    FormsModule,
// #docregion sketch
    // import HttpClientModule after BrowserModule.
// #docregion xsrf
    HttpClientModule,
// #enddocregion sketch
    HttpClientXsrfModule.withOptions({
      cookieName: 'My-Xsrf-Cookie',
      headerName: 'My-Xsrf-Header',
    }),
// #enddocregion xsrf

    // The HttpClientInMemoryWebApiModule module intercepts HTTP requests
    // and returns simulated server responses.
    // Remove it when a real server is ready to receive requests.
    HttpClientInMemoryWebApiModule.forRoot(
      InMemoryDataService, {
        dataEncapsulation: false,
        passThruUnknownUrl: true,
        put204: false // return entity after PUT/update
      }
    )
// #docregion sketch, xsrf
  ],
// #enddocregion xsrf
  declarations: [
    AppComponent,
// #enddocregion sketch
    ConfigComponent,
    DownloaderComponent,
    HeroesComponent,
    MessagesComponent,
    UploaderComponent,
    PackageSearchComponent,
// #docregion sketch
  ],
// #enddocregion sketch
// #docregion interceptor-providers
  providers: [
    // #enddocregion interceptor-providers
    AuthService,
    HttpErrorHandler,
    MessageService,
    { provide: RequestCache, useClass: RequestCacheWithMap },
    // #docregion interceptor-providers
    httpInterceptorProviders
  ],
// #enddocregion interceptor-providers
// #docregion sketch
  bootstrap: [ AppComponent ]
})
export class AppModule {}
// #enddocregion sketch

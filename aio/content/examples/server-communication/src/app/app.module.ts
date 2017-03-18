// #docplaster
// #docregion
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';


import { InMemoryWebApiModule }     from 'angular-in-memory-web-api';
import { HeroData }                 from './hero-data';
import { requestOptionsProvider }   from './default-request-options.service';

import { AppComponent }             from './app.component';

import { HeroListComponent }        from './toh/hero-list.component';
import { HeroListPromiseComponent } from './toh/hero-list.component.promise';

import { WikiComponent }      from './wiki/wiki.component';
import { WikiSmartComponent } from './wiki/wiki-smart.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    JsonpModule,
    // #docregion in-mem-web-api
    InMemoryWebApiModule.forRoot(HeroData)
    // #enddocregion in-mem-web-api
  ],
  declarations: [
    AppComponent,
    HeroListComponent,
    HeroListPromiseComponent,
    WikiComponent,
    WikiSmartComponent
  ],
// #docregion provide-default-request-options
  providers: [ requestOptionsProvider ],
// #enddocregion provide-default-request-options
  bootstrap: [ AppComponent ]
})
export class AppModule {}




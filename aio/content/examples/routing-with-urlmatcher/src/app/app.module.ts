import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
// #docregion import
import { RouterModule, UrlSegment } from '@angular/router';
// #enddocregion import

import { AppComponent } from './app.component';
import { ProfileComponent } from './profile/profile.component';

// #docregion imports-array
@NgModule({
  imports:      [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot([
// #enddocregion imports-array
// #docregion matcher
      {
        matcher: (url) => {
          if (url.length === 1 && url[0].path.match(/^@[\w]+$/gm)) {
            return {
              consumed: url,
              posParams: {
                username: new UrlSegment(url[0].path.slice(1), {})
              }
            };
          }

          return null;
        },
        component: ProfileComponent
      }
// #enddocregion matcher
// #docregion imports-array
    ])],
  declarations: [ AppComponent, ProfileComponent ],
  bootstrap:    [ AppComponent ]
})
// #enddocregion imports-array
export class AppModule { }

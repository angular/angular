// #docregion
import { NgModule }      from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent }     from './app.component';
import { ContentComponent } from './content.component';
import { heroComponents } from './hero.components';

@NgModule({
  imports: [ BrowserModule, FormsModule ],
  declarations: [
    AppComponent,
    ContentComponent,
    heroComponents
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }

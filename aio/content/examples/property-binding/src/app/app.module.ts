import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { ItemDetailComponent } from './item-detail/item-detail.component';
import { ListItemComponent } from './list-item/list-item.component';
import { StringInitComponent } from './string-init/string-init.component';


@NgModule({
  declarations: [
    AppComponent,
    ItemDetailComponent,
    ListItemComponent,
    StringInitComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

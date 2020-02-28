import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { ItemDetailComponent } from './item-detail/item-detail.component';
import { ItemOutputComponent } from './item-output/item-output.component';
import { InputOutputComponent } from './input-output/input-output.component';
import { InTheMetadataComponent } from './in-the-metadata/in-the-metadata.component';
import { AliasingComponent } from './aliasing/aliasing.component';


@NgModule({
  declarations: [
    AppComponent,
    ItemDetailComponent,
    ItemOutputComponent,
    InputOutputComponent,
    InTheMetadataComponent,
    AliasingComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

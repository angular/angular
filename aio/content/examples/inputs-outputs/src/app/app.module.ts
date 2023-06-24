import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { ItemDetailComponent } from './item-detail/item-detail.component';
import { ItemOutputComponent } from './item-output/item-output.component';
import { InputOutputComponent } from './input-output/input-output.component';
import { InTheMetadataComponent } from './in-the-metadata/in-the-metadata.component';
import { AliasingComponent } from './aliasing/aliasing.component';
import { ItemDetailMetadataComponent } from './item-details-metadata/item-details-metadata.component';


@NgModule({
  declarations: [
    AppComponent,
    ItemDetailComponent,
    ItemOutputComponent,
    InputOutputComponent,
    InTheMetadataComponent,
    AliasingComponent,
    ItemDetailMetadataComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

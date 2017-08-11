import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent }  from './app.component';
import { MixedComponent } from './mixed.component';
import { MixedShimComponent } from './mixed-shim.component';
import { DataGridComponent } from './datagrid.component';

@NgModule({
  imports: [ BrowserModule ],
  declarations: [
    AppComponent,
    MixedComponent, MixedShimComponent,
    DataGridComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }

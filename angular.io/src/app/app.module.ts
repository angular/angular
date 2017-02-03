import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MdToolbarModule } from '@angular/material/toolbar';
import { MdButtonModule} from '@angular/material/button';

import { AppComponent } from './app.component';
import { DocViewerComponent } from './doc-viewer/doc-viewer.component';
import { navDirectives, navProviders } from './nav-engine';
import { embeddedComponents } from './embedded';

@NgModule({
  imports: [
    BrowserModule,
    MdToolbarModule.forRoot(),
    MdButtonModule.forRoot()
  ],
  declarations: [
    AppComponent,
    embeddedComponents,
    DocViewerComponent,
    navDirectives,
  ],
  providers: [
    navProviders
  ],
  entryComponents: [ embeddedComponents ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

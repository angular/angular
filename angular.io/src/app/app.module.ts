import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { MdToolbarModule } from '@angular/material/toolbar';
import { MdButtonModule} from '@angular/material/button';

import { AppComponent } from './app.component';
import { DocViewerComponent } from './doc-viewer/doc-viewer.component';
import { embeddedComponents, EmbeddedComponents } from './embedded';
import { Logger } from './logger.service';
import { navDirectives, navProviders } from './nav-engine';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
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
    EmbeddedComponents,
    Logger,
    navProviders
  ],
  entryComponents: [ embeddedComponents ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

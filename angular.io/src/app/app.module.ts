import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MdToolbarModule } from '@angular/material/toolbar';
import { MdButtonModule} from '@angular/material/button';

import { AppComponent } from './app.component';
import { DocViewerComponent } from './doc-viewer/doc-viewer.component';
import { NavEngine } from './nav-engine/nav-engine.service';
import { NavLinkDirective } from './nav-engine/nav-link.directive';

@NgModule({
  imports: [
    BrowserModule,
    MdToolbarModule.forRoot(),
    MdButtonModule.forRoot()
  ],
  declarations: [
    AppComponent,
    DocViewerComponent,
    NavLinkDirective
  ],
  providers: [NavEngine],
  bootstrap: [AppComponent]
})
export class AppModule { }

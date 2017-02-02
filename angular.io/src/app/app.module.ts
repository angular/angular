import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { MdToolbarModule } from '@angular/material/toolbar';
import { MdButtonModule} from '@angular/material/button';
import { DocViewerComponent } from './doc-viewer/doc-viewer.component';
import { NavEngine } from './nav-engine/nav-engine';
import { NavLinkDirective } from './nav-engine/nav-link';

@NgModule({
  declarations: [
    AppComponent,
    DocViewerComponent,
    NavLinkDirective
  ],
  imports: [
    BrowserModule,
    MdToolbarModule.forRoot(),
    MdButtonModule.forRoot()
  ],
  providers: [NavEngine],
  bootstrap: [AppComponent]
})
export class AppModule { }

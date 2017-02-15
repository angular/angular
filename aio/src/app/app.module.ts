import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { MdToolbarModule } from '@angular/material/toolbar';
import { MdButtonModule} from '@angular/material/button';
import { MdIconModule} from '@angular/material/icon';
import { MdInputModule } from '@angular/material/input';
import { MdSidenavModule } from '@angular/material/sidenav';
import { Platform } from '@angular/material/core';

// Temporary fix for MdSidenavModule issue:
// crashes with "missing first" operator when SideNav.mode is "over"
import 'rxjs/add/operator/first';

import { AppComponent } from './app.component';
import { DocViewerComponent } from './doc-viewer/doc-viewer.component';
import { embeddedComponents, EmbeddedComponents } from './embedded';
import { Logger } from './logger.service';
import { navDirectives, navProviders } from './nav-engine';
import { SidenavComponent } from './sidenav/sidenav.component';
import { NavItemComponent } from './sidenav/nav-item.component';
import { MenuComponent } from './sidenav/menu.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    MdButtonModule.forRoot(),
    MdIconModule.forRoot(),
    MdInputModule.forRoot(),
    MdToolbarModule.forRoot(),
    MdSidenavModule.forRoot()
  ],
  declarations: [
    AppComponent,
    embeddedComponents,
    DocViewerComponent,
    MenuComponent,
    navDirectives,
    NavItemComponent,
    SidenavComponent,
  ],
  providers: [
    EmbeddedComponents,
    Logger,
    navProviders,
    Platform
  ],
  entryComponents: [ embeddedComponents ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

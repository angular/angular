import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

import { MdToolbarModule } from '@angular/material/toolbar';
import { MdButtonModule} from '@angular/material/button';
import { MdIconModule} from '@angular/material/icon';
import { MdInputModule } from '@angular/material/input';
import { MdSidenavModule } from '@angular/material/sidenav';
import { MdTabsModule } from '@angular/material';
import { Platform } from '@angular/material/core';

// Temporary fix for MdSidenavModule issue:
// crashes with "missing first" operator when SideNav.mode is "over"
import 'rxjs/add/operator/first';

import { AppComponent } from 'app/app.component';
import { ApiService } from 'app/embedded/api/api.service';
import { DocViewerComponent } from 'app/layout/doc-viewer/doc-viewer.component';
import { EmbeddedModule } from 'app/embedded/embedded.module';
import { GaService } from 'app/shared/ga.service';
import { Logger } from 'app/shared/logger.service';
import { LocationService } from 'app/shared/location.service';
import { NavigationService } from 'app/navigation/navigation.service';
import { DocumentService } from 'app/documents/document.service';
import { SearchService } from 'app/search/search.service';
import { TopMenuComponent } from 'app/layout/top-menu/top-menu.component';
import { FooterComponent } from 'app/layout/footer/footer.component';
import { NavMenuComponent } from 'app/layout/nav-menu/nav-menu.component';
import { NavItemComponent } from 'app/layout/nav-item/nav-item.component';
import { SearchResultsComponent } from './search/search-results/search-results.component';
import { SearchBoxComponent } from './search/search-box/search-box.component';
import { AutoScrollService } from 'app/shared/auto-scroll.service';

@NgModule({
  imports: [
    BrowserModule,
    EmbeddedModule,
    HttpModule,
    BrowserAnimationsModule,
    MdButtonModule,
    MdIconModule,
    MdInputModule,
    MdToolbarModule,
    MdSidenavModule,
    MdTabsModule
  ],
  declarations: [
    AppComponent,
    DocViewerComponent,
    FooterComponent,
    TopMenuComponent,
    NavMenuComponent,
    NavItemComponent,
    SearchResultsComponent,
    SearchBoxComponent,
  ],
  providers: [
    ApiService,
    GaService,
    Logger,
    Location,
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    LocationService,
    NavigationService,
    DocumentService,
    SearchService,
    Platform,
    AutoScrollService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

import { MdToolbarModule, MdButtonModule, MdIconModule, MdInputModule, MdSidenavModule, MdTabsModule, Platform} from '@angular/material';

// Temporary fix for MdSidenavModule issue:
// crashes with "missing first" operator when SideNav.mode is "over"
import 'rxjs/add/operator/first';

import { SwUpdatesModule } from 'app/sw-updates/sw-updates.module';

import { AppComponent } from 'app/app.component';
import { ApiService } from 'app/embedded/api/api.service';
import { DeviceService } from 'app/shared/device.service';
import { DocViewerComponent } from 'app/layout/doc-viewer/doc-viewer.component';
import { DtComponent } from 'app/layout/doc-viewer/dt.component';
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
    MdTabsModule,
    SwUpdatesModule
  ],
  declarations: [
    AppComponent,
    DocViewerComponent,
    DtComponent,
    FooterComponent,
    TopMenuComponent,
    NavMenuComponent,
    NavItemComponent,
    SearchResultsComponent,
    SearchBoxComponent,
  ],
  providers: [
    ApiService,
    DeviceService,
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

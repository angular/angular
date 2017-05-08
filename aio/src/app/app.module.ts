import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

import { MdToolbarModule, MdButtonModule, MdIconModule, MdInputModule, MdSidenavModule, MdTabsModule, Platform,
         MdIconRegistry } from '@angular/material';

// Temporary fix for MdSidenavModule issue:
// crashes with "missing first" operator when SideNav.mode is "over"
import 'rxjs/add/operator/first';

import { SwUpdatesModule } from 'app/sw-updates/sw-updates.module';

import { AppComponent } from 'app/app.component';
import { ApiService } from 'app/embedded/api/api.service';
import { CustomMdIconRegistry, SVG_ICONS } from 'app/shared/custom-md-icon-registry';
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
import { ScrollService } from 'app/shared/scroll.service';
import { SearchResultsComponent } from './search/search-results/search-results.component';
import { SearchBoxComponent } from './search/search-box/search-box.component';
import { TocService } from 'app/shared/toc.service';

// These are the hardcoded inline svg sources to be used by the `<md-icon>` component
export const svgIconProviders = [
  {
    provide: SVG_ICONS,
    useValue: {
      name: 'keyboard_arrow_right',
      svgSource: '<svg xmlns="http://www.w3.org/2000/svg" focusable="false" ' +
                 'viewBox="0 0 24 24"><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/></svg>'
    },
    multi: true
  },
  {
    provide: SVG_ICONS,
    useValue: {
      name: 'menu',
      svgSource: '<svg xmlns="http://www.w3.org/2000/svg" focusable="false" ' +
                 'viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>'
    },
    multi: true
  }
];

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
    DocumentService,
    GaService,
    Logger,
    Location,
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    LocationService,
    { provide: MdIconRegistry, useClass: CustomMdIconRegistry },
    NavigationService,
    Platform,
    ScrollService,
    SearchService,
    svgIconProviders,
    TocService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

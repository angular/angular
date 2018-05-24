import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AppComponent } from 'app/app.component';
import { CustomIconRegistry, SVG_ICONS } from 'app/shared/custom-icon-registry';
import { Deployment } from 'app/shared/deployment.service';
import { DocViewerComponent } from 'app/layout/doc-viewer/doc-viewer.component';
import { DtComponent } from 'app/layout/doc-viewer/dt.component';
import { ModeBannerComponent } from 'app/layout/mode-banner/mode-banner.component';
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
import { ReportingErrorHandler } from 'app/shared/reporting-error-handler';
import { ScrollService } from 'app/shared/scroll.service';
import { ScrollSpyService } from 'app/shared/scroll-spy.service';
import { SearchBoxComponent } from 'app/search/search-box/search-box.component';
import { NotificationComponent } from 'app/layout/notification/notification.component';
import { TocService } from 'app/shared/toc.service';
import { CurrentDateToken, currentDateProvider } from 'app/shared/current-date';
import { WindowToken, windowProvider } from 'app/shared/window';

import { CustomElementsModule } from 'app/custom-elements/custom-elements.module';
import { SharedModule } from 'app/shared/shared.module';
import { SwUpdatesModule } from 'app/sw-updates/sw-updates.module';

import {environment} from '../environments/environment';

// These are the hardcoded inline svg sources to be used by the `<mat-icon>` component.
// tslint:disable: max-line-length
export const svgIconProviders = [
  {
    provide: SVG_ICONS,
    useValue: {
      name: 'close',
      svgSource:
        '<svg fill="#ffffff" focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />' +
          '<path d="M0 0h24v24H0z" fill="none" />' +
        '</svg>',
    },
    multi: true,
  },
  {
    provide: SVG_ICONS,
    useValue: {
      name: 'error_outline',
      svgSource:
        '<svg focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M0 0h24v24H0V0z" fill="none" />' +
          '<path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />' +
        '</svg>',
    },
    multi: true,
  },
  {
    provide: SVG_ICONS,
    useValue: {
      name: 'insert_comment',
      svgSource:
        '<svg fill="#ffffff" focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />' +
          '<path d="M0 0h24v24H0z" fill="none" />' +
        '</svg>',
    },
    multi: true,
  },
  {
    provide: SVG_ICONS,
    useValue: {
      name: 'keyboard_arrow_right',
      svgSource:
        '<svg focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />' +
        '</svg>',
    },
    multi: true,
  },
  {
    provide: SVG_ICONS,
    useValue: {
      name: 'menu',
      svgSource:
        '<svg focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />' +
        '</svg>',
    },
    multi: true,
  },
];
// tslint:enable: max-line-length

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CustomElementsModule,
    HttpClientModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatToolbarModule,
    SwUpdatesModule,
    SharedModule,
    ServiceWorkerModule.register('/ngsw-worker.js', {enabled: environment.production}),
  ],
  declarations: [
    AppComponent,
    DocViewerComponent,
    DtComponent,
    FooterComponent,
    ModeBannerComponent,
    NavMenuComponent,
    NavItemComponent,
    SearchBoxComponent,
    NotificationComponent,
    TopMenuComponent,
  ],
  providers: [
    Deployment,
    DocumentService,
    { provide: ErrorHandler, useClass: ReportingErrorHandler },
    GaService,
    Logger,
    Location,
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    LocationService,
    { provide: MatIconRegistry, useClass: CustomIconRegistry },
    NavigationService,
    ScrollService,
    ScrollSpyService,
    SearchService,
    svgIconProviders,
    TocService,
    { provide: CurrentDateToken, useFactory: currentDateProvider },
    { provide: WindowToken, useFactory: windowProvider },
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }

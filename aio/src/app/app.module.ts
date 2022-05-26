import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

import { scriptUrl, unwrapScriptUrlForSink } from 'safevalues';

import { AppComponent } from 'app/app.component';
import { Deployment } from 'app/shared/deployment.service';
import { CookiesPopupComponent } from 'app/layout/cookies-popup/cookies-popup.component';
import { DocViewerComponent } from 'app/layout/doc-viewer/doc-viewer.component';
import { DtComponent } from 'app/layout/doc-viewer/dt.component';
import { ModeBannerComponent } from 'app/layout/mode-banner/mode-banner.component';
import { GaService } from 'app/shared/ga.service';
import { Logger } from 'app/shared/logger.service';
import { LocationService } from 'app/shared/location.service';
import { STORAGE_PROVIDERS } from 'app/shared/storage.service';
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
import { ThemeToggleComponent } from 'app/shared/theme-picker/theme-toggle.component';

import { environment } from '../environments/environment';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule.withConfig({disableAnimations: AppComponent.reducedMotion}),
    CustomElementsModule,
    HttpClientModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatToolbarModule,
    SharedModule,
    ServiceWorkerModule.register(
        // Make sure service worker is loaded with a TrustedScriptURL
        unwrapScriptUrlForSink(scriptUrl`/ngsw-worker.js`),
        {enabled: environment.production}),
  ],
  declarations: [
    AppComponent,
    CookiesPopupComponent,
    DocViewerComponent,
    DtComponent,
    FooterComponent,
    ModeBannerComponent,
    NavMenuComponent,
    NavItemComponent,
    SearchBoxComponent,
    NotificationComponent,
    TopMenuComponent,
    ThemeToggleComponent,
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
    NavigationService,
    ScrollService,
    ScrollSpyService,
    SearchService,
    STORAGE_PROVIDERS,
    TocService,
    { provide: CurrentDateToken, useFactory: currentDateProvider },
    { provide: WindowToken, useFactory: windowProvider },
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }

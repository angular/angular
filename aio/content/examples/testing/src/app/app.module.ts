import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AboutComponent } from './about/about.component';
import { BannerComponent } from './banner/banner.component';
import { HeroService } from './model/hero.service';
import { UserService } from './model/user.service';
import { TwainComponent } from './twain/twain.component';
import { TwainService } from './twain/twain.service';
import { MockTokenService, AuthService } from './model/auth.service';
import { WelcomeComponent } from './welcome/welcome.component';

import { DashboardModule } from './dashboard/dashboard.module';
import { SharedModule } from './shared/shared.module';

import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './in-memory-data.service';
import { AuthComponent } from './auth/auth.component';

@NgModule({
  imports: [
    BrowserModule,
    DashboardModule,
    AppRoutingModule,
    SharedModule,
    HttpClientModule,

    // The HttpClientInMemoryWebApiModule module intercepts HTTP requests
    // and returns simulated server responses.
    // Remove it when a real server is ready to receive requests.
    HttpClientInMemoryWebApiModule.forRoot(
      InMemoryDataService, { dataEncapsulation: false }
    )
  ],
  providers: [
    HeroService,
    TwainService,
    UserService,
    MockTokenService,
    AuthService
  ],
  declarations: [
    AppComponent,
    AboutComponent,
    BannerComponent,
    TwainComponent,
    WelcomeComponent,
    AuthComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }

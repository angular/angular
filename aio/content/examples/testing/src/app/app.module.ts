import { NgModule }         from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';

import { AppComponent }     from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AboutComponent }   from './about.component';
import { BannerComponent }  from './banner.component';
import { HeroService,
         UserService }      from './model';
import { TwainService }     from './shared/twain.service';
import { WelcomeComponent } from './welcome.component';


import { DashboardModule }  from './dashboard/dashboard.module';
import { SharedModule }     from './shared/shared.module';

@NgModule({
  imports: [
    BrowserModule,
    DashboardModule,
    AppRoutingModule,
    SharedModule
  ],
  providers:    [ HeroService, TwainService, UserService ],
  declarations: [ AppComponent, AboutComponent, BannerComponent, WelcomeComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }

// #docregion
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent }     from './app.component';
import { Phone } from './core/phone/phone.service';
import { CheckmarkPipe } from './core/checkmark/checkmark.pipe';
import { PhoneListComponent } from './phone-list/phone-list.component';
import { PhoneDetailComponent } from './phone-detail/phone-detail.component';
import { routeParamsProvider } from './ajs-upgraded-providers';

@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule,
    HttpModule,
    FormsModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    PhoneListComponent,
    PhoneDetailComponent,
    CheckmarkPipe
  ],
  entryComponents: [
    PhoneListComponent,
    PhoneDetailComponent
  ],
  providers: [
    Phone,
    routeParamsProvider
  ],
  // #docregion bootstrap
  bootstrap: [ AppComponent ]
})
export class AppModule { }
// #enddocregion bootstrap

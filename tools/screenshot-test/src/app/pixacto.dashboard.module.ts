import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from '@angular/material';
import {FirebaseService} from './firebase.service';
import {routing} from './routes';

import {PixactoDashboardComponent} from './pixacto.dashboard.component';
import {ViewerComponent} from './viewer/viewer.component';
import {ResultComponent} from './result/result.component';
import {NavComponent} from './nav/nav.component';

@NgModule({
  declarations: [
    PixactoDashboardComponent,
    ViewerComponent,
    ResultComponent,
    NavComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    routing,
  ],
  providers: [FirebaseService],
  bootstrap: [PixactoDashboardComponent]
})
export class PixactoDashboardModule { }

import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatChipsModule} from '@angular/material-experimental/mdc-chips';
import {MatFormFieldModule} from '@angular/material-experimental/mdc-form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material-experimental/mdc-menu';
import {MatPaginatorModule} from '@angular/material-experimental/mdc-paginator';
import {MatProgressBarModule} from '@angular/material-experimental/mdc-progress-bar';
import {MatProgressSpinnerModule} from '@angular/material-experimental/mdc-progress-spinner';
import {ChipsComponent} from './components/chips/chips.component';
import {MenuComponent} from './components/menu/menu.component';
import {PaginatorComponent} from './components/paginator/paginator.component';
import {ProgressSpinnerComponent} from './components/progress-spinner/progress-spinner.component';
import {ProgressBarComponent} from './components/progress-bar/progress-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    ChipsComponent,
    MenuComponent,
    PaginatorComponent,
    ProgressBarComponent,
    ProgressSpinnerComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

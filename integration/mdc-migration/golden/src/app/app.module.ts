import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatChipsModule} from '@angular/material-experimental/mdc-chips';
import {MatFormFieldModule} from '@angular/material-experimental/mdc-form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material-experimental/mdc-input';
import {MatMenuModule} from '@angular/material-experimental/mdc-menu';
import {MatPaginatorModule} from '@angular/material-experimental/mdc-paginator';
import {MatProgressBarModule} from '@angular/material-experimental/mdc-progress-bar';
import {MatProgressSpinnerModule} from '@angular/material-experimental/mdc-progress-spinner';
import {MatSelectModule} from '@angular/material-experimental/mdc-select';
import {ChipsComponent} from './components/chips/chips.component';
import {FormFieldComponent} from './components/form-field/form-field.component';
import {InputComponent} from './components/input/input.component';
import {MenuComponent} from './components/menu/menu.component';
import {PaginatorComponent} from './components/paginator/paginator.component';
import {ProgressSpinnerComponent} from './components/progress-spinner/progress-spinner.component';
import {ProgressBarComponent} from './components/progress-bar/progress-bar.component';
import {SelectComponent} from './components/select/select.component';

@NgModule({
  declarations: [
    AppComponent,
    ChipsComponent,
    FormFieldComponent,
    InputComponent,
    MenuComponent,
    PaginatorComponent,
    ProgressBarComponent,
    ProgressSpinnerComponent,
    SelectComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

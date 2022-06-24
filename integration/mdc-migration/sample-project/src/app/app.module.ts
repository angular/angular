import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSliderModule} from '@angular/material/slider';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTableModule} from '@angular/material/table';
import {AutocompleteComponent} from './components/autocomplete/autocomplete.component';
import {ButtonComponent} from './components/button/button.component';
import {CardComponent} from './components/card/card.component';
import {ChipsComponent} from './components/chips/chips.component';
import {FormFieldComponent} from './components/form-field/form-field.component';
import {InputComponent} from './components/input/input.component';
import {ListComponent} from './components/list/list.component';
import {MenuComponent} from './components/menu/menu.component';
import {PaginatorComponent} from './components/paginator/paginator.component';
import {ProgressSpinnerComponent} from './components/progress-spinner/progress-spinner.component';
import {ProgressBarComponent} from './components/progress-bar/progress-bar.component';
import {RadioComponent} from './components/radio/radio.component';
import {SelectComponent} from './components/select/select.component';
import {SlideToggleComponent} from './components/slide-toggle/slide-toggle.component';
import {SliderComponent} from './components/slider/slider.component';
import {SnackBarComponent} from './components/snack-bar/snack-bar.component';
import {TableComponent} from './components/table/table.component';

@NgModule({
  declarations: [
    AutocompleteComponent,
    AppComponent,
    ButtonComponent,
    CardComponent,
    ChipsComponent,
    FormFieldComponent,
    InputComponent,
    ListComponent,
    MenuComponent,
    PaginatorComponent,
    ProgressBarComponent,
    ProgressSpinnerComponent,
    RadioComponent,
    SelectComponent,
    SlideToggleComponent,
    SliderComponent,
    SnackBarComponent,
    TableComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSnackBarModule,
    MatTableModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

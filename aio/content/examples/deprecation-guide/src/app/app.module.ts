// #docplaster
import { BrowserModule } from '@angular/platform-browser';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SubmitButtonComponent } from './submit-button/submit-button.component';

@NgModule({
  declarations: [
    AppComponent,
    SubmitButtonComponent
  ],
  // #docregion reactive-form-no-warning
  imports: [
    // #enddocregion reactive-form-no-warning
    FormsModule,
    BrowserModule,
    // #docregion reactive-form-no-warning
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'})
  ],
  // #enddocregion reactive-form-no-warning
  providers: [],
  bootstrap: [AppComponent],
  exports: [RouterModule]
})
export class AppModule { }

class SomeModule { }
class SomeConfig { }

// #docplaster ...
// #docregion ModuleWithProvidersGeneric, ModuleWithProvidersNonGeneric
@NgModule({
// #enddocregion ModuleWithProvidersGeneric, ModuleWithProvidersNonGeneric
// #docregion ModuleWithProvidersGeneric, ModuleWithProvidersNonGeneric
})
// #docplaster
export class MyModule {
  // #enddocregion ModuleWithProvidersGeneric, ModuleWithProvidersNonGeneric
  /*
  // #docregion ModuleWithProvidersNonGeneric
  static forRoot(config: SomeConfig): ModuleWithProviders {
  // #enddocregion ModuleWithProvidersNonGeneric
  */
  // #docregion ModuleWithProvidersGeneric
  static forRoot(config: SomeConfig): ModuleWithProviders<SomeModule> {
    // #docregion ModuleWithProvidersNonGeneric
    return {
      ngModule: SomeModule,
      providers: [
        {provide: SomeConfig, useValue: config}
      ]
    };
  }
}
// #enddocregion ModuleWithProvidersGeneric, ModuleWithProvidersNonGeneric

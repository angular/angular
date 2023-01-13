// #docplaster
import { BrowserModule } from '@angular/platform-browser';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SubmitButtonComponent } from './submit-button/submit-button.component';

// #docregion lazyload-syntax, lazyload-deprecated-syntax
const routes: Routes = [{
    path: 'lazy',
    // #enddocregion lazyload-deprecated-syntax
    // The new import() syntax
    loadChildren: () => import('./lazy/lazy.module').then(m => m.LazyModule)
    // #enddocregion lazyload-syntax
    /*
    // #docregion lazyload-deprecated-syntax
    // The following string syntax for loadChildren is deprecated
    loadChildren: './lazy/lazy.module#LazyModule',
    // #enddocregion lazyload-deprecated-syntax
    */
    // #docregion lazyload-syntax, lazyload-deprecated-syntax
  }];
  // #enddocregion lazyload-syntax, lazyload-deprecated-syntax
@NgModule({
  declarations: [
    AppComponent,
    SubmitButtonComponent
  ],
  // #docregion reactive-form-no-warning
  imports: [
    // #enddocregion reactive-form-no-warning
    RouterModule.forChild(routes),
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

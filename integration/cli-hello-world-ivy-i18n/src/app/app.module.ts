import {registerLocaleData} from '@angular/common';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import localeFr from '@angular/common/locales/fr';
import {AppComponent} from './app.component';

// adding this code to detect issues like https://github.com/angular/angular-cli/issues/10322
// it should not affect the CLI importing additional locale data for compile time inlined bundles.
registerLocaleData(localeFr);

@NgModule({declarations: [AppComponent], imports: [BrowserModule], bootstrap: [AppComponent]})
export class AppModule {}

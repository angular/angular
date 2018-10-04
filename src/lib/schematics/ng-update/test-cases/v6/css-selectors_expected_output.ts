import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';

const a = By.css('.mat-form-field-label');
const b = By.css('.mat-form-field-label-wrapper');
const c = By.css('.mat-form-field');
const d = By.css('.mat-form-field-flex');
const e = By.css('.mat-form-field-hint-spacer');

@Component({
  template: `
    <ng-content select=".mat-form-field-suffix"></ng-content>

    <style>
      .mat-form-field-suffix {
        border: red 1px solid;
      }

      .mat-form-field-underline {
        background: blue;
      }
    </style>
  `
})
class F {}

@Component({
  styles: [`
    .mat-form-field-subscript-wrapper {
      flex-direction: row;
    }
    .mat-form-field .mat-form-field-label {
      color: lightcoral;
    }
  `]
})
class G {}

@Component({
  // Considering this is SCSS that will be transformed by Webpack loaders.
  styles: [`
    body, html {
      font-family: Roboto, 'Helvetica Neue', sans-serif;
    }
  `]
})
class H {}

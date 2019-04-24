import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';

const a = By.css('.mat-form-field-placeholder');
const b = By.css('.mat-form-field-placeholder-wrapper');
const c = By.css('.mat-input-container');
const d = By.css('.mat-input-flex');
const e = By.css('.mat-input-hint-spacer');

@Component({
  template: `
    <ng-content select=".mat-input-suffix"></ng-content>

    <style>
      .mat-input-suffix {
        border: red 1px solid;
      }

      .mat-input-underline {
        background: blue;
      }
    </style>
  `
})
class F {}

@Component({
  styles: [`
    .mat-input-subscript-wrapper {
      flex-direction: row;
    }
    .mat-input-container .mat-input-placeholder {
      color: lightcoral;
    }
  `]
})
class G {}

@Component({
  // Considering this is SCSS that will be transformed by Webpack loaders.
  styles: [`
    body, html {
      font-family: $mat-font-family;
    }
  `]
})
class H {}

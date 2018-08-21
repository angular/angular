import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';

const a = By.css('mat-form-field');

@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="Test">
    </mat-form-field>

    <style>
      mat-form-field {
        border: red 1px solid;
      }
    </style>
  `
})
class B {}

@Component({
  styles: [`
    mat-form-field {
      flex-direction: row;
    }
    :host > mat-form-field {
      text-align: right;
    }
  `]
})
class C {}

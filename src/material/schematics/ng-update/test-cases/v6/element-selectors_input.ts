import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';

const a = By.css('mat-input-container');

@Component({
  template: `
    <mat-input-container>
      <input matInput placeholder="Test">
    </mat-input-container>

    <style>
      mat-input-container {
        border: red 1px solid;
      }
    </style>
  `
})
class B {}

@Component({
  styles: [`
    mat-input-container {
      flex-direction: row;
    }
    :host > mat-input-container {
      text-align: right;
    }
  `]
})
class C {}

import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public firstExample = 'Hello, World!';
  public secondExample = 'Hello, World!';

  public ref2 = '';

  public desugared1 = `
  <input #ref1 type="text" [(ngModel)]="firstExample" /><!-- A new template! -->
  <ng-template [ngIf]="true">
    <!-- … and it works  -->
    <span>Value: {{ ref1.value }}</span>
  </ng-template>`
  ;

  public desugared2 = `<ng-template [ngIf]="true">
    <!-- The reference, ref2, is defined within a template -->
    <input #ref2 type="text" [(ngModel)]="secondExample" />
  </ng-template>

  <!-- Attempting to access ref2 from outside the above template doesn't work. -->
  <span>Value: {{ ref2?.value }}</span>`;

    public ngForExample = `<ng-container *ngFor="let i of [1,2]">
    <input #ref type="text" [value]="i" />
  </ng-container>

  <!-- The template is instantiated twice because *ngFor iterates
  over the two items in the array, so it's impossible to define what ref2 is referencing.-->

  {{ ref.value }}`;

  @ViewChild('itemForm', { static: false }) form!: NgForm;

  get submitMessage() { return this._submitMessage; }
  private _submitMessage = '';  // tslint:disable-line: variable-name

  onSubmit(form: NgForm) {
    this._submitMessage = 'Submitted. Form value is ' + JSON.stringify(form.value);
  }

  callPhone(value: string) {
    console.warn(`Calling ${value} ...`);
  }

  callFax(value: string) {
    console.warn(`Faxing ${value} ...`);
  }

  log(ref3: any) {
    console.warn(ref3.constructor);
  }
}

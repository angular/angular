/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Component, NgModule} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';

@Component({
  selector: 'app-reactive-forms',
  template: `
    <form [formGroup]="profileForm">
      <div>
        First Name:
        <input type="text" formControlName="firstName" />
      </div>
      <div>
        Last Name:
        <input type="text" formControlName="lastName" />
      </div>

      <div>
        Subscribe:
        <input type="checkbox" formControlName="subscribed" />
      </div>

      <div>Disabled: <input formControlName="disabledInput" /></div>
      <div formArrayName="addresses">
        <div *ngFor="let item of itemControls; let i = index" [formGroupName]="i">
          <div>City: <input formControlName="city" /></div>
        </div>
      </div>
      <button (click)="addCity()">Add City</button>
    </form>
  `,
  standalone: false,
})
class ReactiveFormsComponent {
  profileForm!: FormGroup;
  addresses!: FormArray;

  get itemControls() {
    return (this.profileForm.get('addresses') as FormArray).controls;
  }

  constructor(private formBuilder: FormBuilder) {
    // We use this reference in our test
    (window as any).reactiveFormsComponent = this;
  }

  ngOnInit() {
    this.profileForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl(''),
      addresses: new FormArray([]),
      subscribed: new FormControl(),
      disabledInput: new FormControl({value: '', disabled: true}),
    });

    this.addCity();
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      city: '',
    });
  }

  addCity(): void {
    this.addresses = this.profileForm.get('addresses') as FormArray;
    this.addresses.push(this.createItem());
  }
}

@Component({
  selector: 'app-root',
  template: `
    <app-reactive-forms></app-reactive-forms>
  `,
  standalone: false,
})
class RootComponent {}

@NgModule({
  declarations: [RootComponent, ReactiveFormsComponent],
  imports: [BrowserModule, ReactiveFormsModule],
})
class FormsExampleModule {
  ngDoBootstrap(app: any) {
    app.bootstrap(RootComponent);
  }
}

function bootstrapApp() {
  return platformBrowser().bootstrapModule(FormsExampleModule, {ngZone: 'noop'});
}

(window as any).bootstrapApp = bootstrapApp;

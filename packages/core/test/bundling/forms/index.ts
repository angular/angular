/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component, NgModule, ɵNgModuleFactory as NgModuleFactory} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators} from '@angular/forms';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';

@Component({
  selector: 'app-template-forms',
  template: `
  <form novalidate>
    <div ngModelGroup="profileForm">
      <div>
        First Name:
        <input name="first" ngModel required />
      </div>
      <div>
        Last Name:
        <input name="last" ngModel />
      </div>
      <div>
        Subscribe:
        <input name="subscribed" type="checkbox" ngModel />
      </div>

      <div>Disabled: <input name="foo" ngModel disabled /></div>

      <div *ngFor="let city of addresses; let i = index">
        City <input [(ngModel)]="addresses[i].city" name="name" />
      </div>

      <button (click)="addCity()">Add City</button>
    </div>
  </form>`,
})
class TemplateFormsComponent {
  name = {first: 'Nancy', last: 'Drew', subscribed: true};
  addresses = [{city: 'Toronto'}];
  constructor() {
    // We use this reference in our test
    (window as any).templateFormsComponent = this;
  }

  addCity() {
    this.addresses.push(({city: ''}));
  }
}

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
  </form>`,
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
    <app-template-forms></app-template-forms>
    <app-reactive-forms></app-reactive-forms>
  `
})
class RootComponent {
}

@NgModule({
  declarations: [RootComponent, TemplateFormsComponent, ReactiveFormsComponent],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule]
})
class FormsExampleModule {
  ngDoBootstrap(app: any) {
    app.bootstrap(RootComponent);
  }
}

(window as any).waitForApp = platformBrowser().bootstrapModuleFactory(
    new NgModuleFactory(FormsExampleModule), {ngZone: 'noop'});

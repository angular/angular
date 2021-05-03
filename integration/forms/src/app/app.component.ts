import {Component} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

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
export class TemplateFormsComponent {
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
export class ReactiveFormsComponent {
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
  templateUrl: './app.component.html',
})
export class AppComponent {
}
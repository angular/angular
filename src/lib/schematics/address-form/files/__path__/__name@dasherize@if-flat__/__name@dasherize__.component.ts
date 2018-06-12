import { Component, ViewChild<% if(!!viewEncapsulation) { %>, ViewEncapsulation<% }%><% if(changeDetection !== 'Default') { %>, ChangeDetectionStrategy<% }%> } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: '<%= selector %>',<% if(inlineTemplate) { %>
  template: `
    <form [formGroup]="addressForm" novalidate>
    <mat-card class="shipping-card">
      <mat-card-header>
        <mat-card-title>Shipping Information</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="row">
          <div class="col">
            <mat-form-field class="full-width">
              <input matInput placeholder="Company" formControlName="company">
            </mat-form-field>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <mat-form-field class="full-width">
              <input matInput placeholder="First name" formControlName="firstName">
              <mat-error *ngIf="addressForm.controls['firstName'].hasError('required')">
                First name is <strong>required</strong>
              </mat-error>
            </mat-form-field>
          </div>
          <div class="col">
            <mat-form-field class="full-width">
              <input matInput placeholder="Last name" formControlName="lastName">
              <mat-error *ngIf="addressForm.controls['lastName'].hasError('required')">
                Last name is <strong>required</strong>
              </mat-error>
            </mat-form-field>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <mat-form-field class="full-width">
              <textarea matInput placeholder="Address" formControlName="address"></textarea>
              <mat-error *ngIf="addressForm.controls['address'].hasError('required')">
                Address is <strong>required</strong>
              </mat-error>
            </mat-form-field>
          </div>
        </div>
        <div class="row" *ngIf="!hasUnitNumber">
          <div class="col">
            <button mat-button type="button" (click)="hasUnitNumber = !hasUnitNumber">
              + Add C/O, Apt, Suite, Unit
            </button>
          </div>
        </div>
        <div class="row" *ngIf="hasUnitNumber">
          <div class="col">
            <mat-form-field class="full-width">
              <textarea matInput placeholder="Address 2" formControlName="address2"></textarea>
            </mat-form-field>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <mat-form-field class="full-width">
              <input matInput placeholder="City" formControlName="city">
              <mat-error *ngIf="addressForm.controls['city'].hasError('required')">
                City is <strong>required</strong>
              </mat-error>
            </mat-form-field>
          </div>
          <div class="col">
            <mat-form-field class="full-width">
              <mat-select placeholder="State" formControlName="state">
                <mat-option *ngFor="let state of states" [value]="state.abbreviation">
                  {{ state.name }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="addressForm.controls['state'].hasError('required')">
                State is <strong>required</strong>
              </mat-error>
            </mat-form-field>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <mat-form-field class="full-width">
              <input matInput #postalCode maxlength="5" placeholder="Postal Code" type="number" formControlName="postalCode">
              <mat-hint align="end">{{postalCode.value.length}} / 5</mat-hint>
            </mat-form-field>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <mat-radio-group formControlName="shipping">
              <mat-radio-button value="free">Free Shipping</mat-radio-button>
              <mat-radio-button value="priority">Priority Shipping</mat-radio-button>
              <mat-radio-button value="nextday">Next Day Shipping</mat-radio-button>
            </mat-radio-group>
          </div>
        </div>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary" type="submit">Submit</button>
      </mat-card-actions>
    </mat-card>
  </form>
  `,<% } else { %>
  templateUrl: './<%= dasherize(name) %>.component.html',<% } if(inlineStyle) { %>
    styles: [
      `
      .full-width {
        width: 100%;
      }
      
      .shipping-card {
        min-width: 120px;
        margin: 20px auto;
      }
      
      .mat-radio-button {
        display: block;
        margin: 5px 0;
      }
      
      .row {
        display: flex;
        flex-direction: row;
      }
      
      .col {
        flex: 1;
        margin-right: 20px;
      }
      
      .col:last-child {
        margin-right: 0;
      }
    `
    ]<% } else { %>
    styleUrls: ['./<%= dasherize(name) %>.component.<%= styleext %>']<% } %><% if(!!viewEncapsulation) { %>,
  encapsulation: ViewEncapsulation.<%= viewEncapsulation %><% } if (changeDetection !== 'Default') { %>,
  changeDetection: ChangeDetectionStrategy.<%= changeDetection %><% } %>
})
export class <%= classify(name) %>Component {
  addressForm = this.fb.group({
    company: null,
    firstName: [null, Validators.required],
    lastName: [null, Validators.required],
    address: [null, Validators.required],
    address2: null,
    city: [null, Validators.required],
    state: [null, Validators.required],
    postalCode: [null, Validators.required, Validators.minLength(5), Validators.maxLength(5)],
    shipping: ['free', Validators.required]
  });

  hasUnitNumber = false;

  states = [
    {name:'Alabama', abbreviation:'AL'},
    {name:'Alaska', abbreviation:'AK'},
    {name:'American Samoa', abbreviation:'AS'},
    {name:'Arizona', abbreviation:'AZ'},
    {name:'Arkansas', abbreviation:'AR'},
    {name:'California', abbreviation:'CA'},
    {name:'Colorado', abbreviation:'CO'},
    {name:'Connecticut', abbreviation:'CT'},
    {name:'Delaware', abbreviation:'DE'},
    {name:'District Of Columbia', abbreviation:'DC'},
    {name:'Federated States Of Micronesia', abbreviation:'FM'},
    {name:'Florida', abbreviation:'FL'},
    {name:'Georgia', abbreviation:'GA'},
    {name:'Guam', abbreviation:'GU'},
    {name:'Hawaii', abbreviation:'HI'},
    {name:'Idaho', abbreviation:'ID'},
    {name:'Illinois', abbreviation:'IL'},
    {name:'Indiana', abbreviation:'IN'},
    {name:'Iowa', abbreviation:'IA'},
    {name:'Kansas', abbreviation:'KS'},
    {name:'Kentucky', abbreviation:'KY'},
    {name:'Louisiana', abbreviation:'LA'},
    {name:'Maine', abbreviation:'ME'},
    {name:'Marshall Islands', abbreviation:'MH'},
    {name:'Maryland', abbreviation:'MD'},
    {name:'Massachusetts', abbreviation:'MA'},
    {name:'Michigan', abbreviation:'MI'},
    {name:'Minnesota', abbreviation:'MN'},
    {name:'Mississippi', abbreviation:'MS'},
    {name:'Missouri', abbreviation:'MO'},
    {name:'Montana', abbreviation:'MT'},
    {name:'Nebraska', abbreviation:'NE'},
    {name:'Nevada', abbreviation:'NV'},
    {name:'New Hampshire', abbreviation:'NH'},
    {name:'New Jersey', abbreviation:'NJ'},
    {name:'New Mexico', abbreviation:'NM'},
    {name:'New York', abbreviation:'NY'},
    {name:'North Carolina', abbreviation:'NC'},
    {name:'North Dakota', abbreviation:'ND'},
    {name:'Northern Mariana Islands', abbreviation:'MP'},
    {name:'Ohio', abbreviation:'OH'},
    {name:'Oklahoma', abbreviation:'OK'},
    {name:'Oregon', abbreviation:'OR'},
    {name:'Palau', abbreviation:'PW'},
    {name:'Pennsylvania', abbreviation:'PA'},
    {name:'Puerto Rico', abbreviation:'PR'},
    {name:'Rhode Island', abbreviation:'RI'},
    {name:'South Carolina', abbreviation:'SC'},
    {name:'South Dakota', abbreviation:'SD'},
    {name:'Tennessee', abbreviation:'TN'},
    {name:'Texas', abbreviation:'TX'},
    {name:'Utah', abbreviation:'UT'},
    {name:'Vermont', abbreviation:'VT'},
    {name:'Virgin Islands', abbreviation:'VI'},
    {name:'Virginia', abbreviation:'VA'},
    {name:'Washington', abbreviation:'WA'},
    {name:'West Virginia', abbreviation:'WV'},
    {name:'Wisconsin', abbreviation:'WI'},
    {name:'Wyoming', abbreviation:'WY'}
  ];

  constructor(private fb: FormBuilder) {}

  onSubmit() {
    alert('Thanks!');
  }
}

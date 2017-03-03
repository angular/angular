import {Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {FormControl, NgModel} from '@angular/forms';
import 'rxjs/add/operator/startWith';

@Component({
  moduleId: module.id,
  selector: 'autocomplete-demo',
  templateUrl: 'autocomplete-demo.html',
  styleUrls: ['autocomplete-demo.css'],
  encapsulation: ViewEncapsulation.None
})
export class AutocompleteDemo {
  stateCtrl: FormControl;
  currentState = '';
  topHeightCtrl = new FormControl(0);

  reactiveStates: any;
  tdStates: any[];

  tdDisabled = false;

  @ViewChild(NgModel) modelDir: NgModel;

  states = [
    {code: 'AL', name: 'Alabama'},
    {code: 'AK', name: 'Alaska'},
    {code: 'AZ', name: 'Arizona'},
    {code: 'AR', name: 'Arkansas'},
    {code: 'CA', name: 'California'},
    {code: 'CO', name: 'Colorado'},
    {code: 'CT', name: 'Connecticut'},
    {code: 'DE', name: 'Delaware'},
    {code: 'FL', name: 'Florida'},
    {code: 'GA', name: 'Georgia'},
    {code: 'HI', name: 'Hawaii'},
    {code: 'ID', name: 'Idaho'},
    {code: 'IL', name: 'Illinois'},
    {code: 'IN', name: 'Indiana'},
    {code: 'IA', name: 'Iowa'},
    {code: 'KS', name: 'Kansas'},
    {code: 'KY', name: 'Kentucky'},
    {code: 'LA', name: 'Louisiana'},
    {code: 'ME', name: 'Maine'},
    {code: 'MD', name: 'Maryland'},
    {code: 'MA', name: 'Massachusetts'},
    {code: 'MI', name: 'Michigan'},
    {code: 'MN', name: 'Minnesota'},
    {code: 'MS', name: 'Mississippi'},
    {code: 'MO', name: 'Missouri'},
    {code: 'MT', name: 'Montana'},
    {code: 'NE', name: 'Nebraska'},
    {code: 'NV', name: 'Nevada'},
    {code: 'NH', name: 'New Hampshire'},
    {code: 'NJ', name: 'New Jersey'},
    {code: 'NM', name: 'New Mexico'},
    {code: 'NY', name: 'New York'},
    {code: 'NC', name: 'North Carolina'},
    {code: 'ND', name: 'North Dakota'},
    {code: 'OH', name: 'Ohio'},
    {code: 'OK', name: 'Oklahoma'},
    {code: 'OR', name: 'Oregon'},
    {code: 'PA', name: 'Pennsylvania'},
    {code: 'RI', name: 'Rhode Island'},
    {code: 'SC', name: 'South Carolina'},
    {code: 'SD', name: 'South Dakota'},
    {code: 'TN', name: 'Tennessee'},
    {code: 'TX', name: 'Texas'},
    {code: 'UT', name: 'Utah'},
    {code: 'VT', name: 'Vermont'},
    {code: 'VA', name: 'Virginia'},
    {code: 'WA', name: 'Washington'},
    {code: 'WV', name: 'West Virginia'},
    {code: 'WI', name: 'Wisconsin'},
    {code: 'WY', name: 'Wyoming'},
  ];

  constructor() {
    this.tdStates = this.states;
    this.stateCtrl = new FormControl({code: 'CA', name: 'California'});
    this.reactiveStates = this.stateCtrl.valueChanges
        .startWith(this.stateCtrl.value)
        .map(val => this.displayFn(val))
        .map(name => this.filterStates(name));
  }

  displayFn(value: any): string {
    return value && typeof value === 'object' ? value.name : value;
  }

  filterStates(val: string) {
    return val ? this.states.filter(s => new RegExp(`^${val}`, 'gi').test(s.name))
               : this.states;
  }

}

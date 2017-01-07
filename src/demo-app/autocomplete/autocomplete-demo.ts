import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'autocomplete-demo',
  templateUrl: 'autocomplete-demo.html',
  styleUrls: ['autocomplete-demo.css'],
})
export class AutocompleteDemo {
  states = [
    {code: 'AL', name: 'Alabama'},
    {code: 'AZ', name: 'Arizona'},
    {code: 'CA', name: 'California'},
    {code: 'CO', name: 'Colorado'},
    {code: 'CT', name: 'Connecticut'},
    {code: 'FL', name: 'Florida'},
    {code: 'GA', name: 'Georgia'},
    {code: 'ID', name: 'Idaho'},
    {code: 'KS', name: 'Kansas'},
    {code: 'LA', name: 'Louisiana'},
    {code: 'MA', name: 'Massachusetts'},
    {code: 'MN', name: 'Minnesota'},
    {code: 'MI', name: 'Mississippi'},
    {code: 'NY', name: 'New York'},
    {code: 'NC', name: 'North Carolina'},
    {code: 'OK', name: 'Oklahoma'},
    {code: 'OH', name: 'Ohio'},
    {code: 'OR', name: 'Oregon'},
    {code: 'PA', name: 'Pennsylvania'},
    {code: 'SC', name: 'South Carolina'},
    {code: 'TN', name: 'Tennessee'},
    {code: 'TX', name: 'Texas'},
    {code: 'VA', name: 'Virginia'},
    {code: 'WA', name: 'Washington'},
    {code: 'WI', name: 'Wisconsin'},
    {code: 'WY', name: 'Wyoming'},
  ];
}

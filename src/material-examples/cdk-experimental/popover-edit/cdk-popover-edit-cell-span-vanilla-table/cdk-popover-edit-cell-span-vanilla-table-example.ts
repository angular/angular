import {Component} from '@angular/core';
import {NgForm} from '@angular/forms';

export interface Person {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
}

const PERSON_DATA: Person[] = [
  {id: 1, firstName: 'Terra', middleName: 'Maduin', lastName: 'Branford'},
  {id: 2, firstName: 'Locke', middleName: '', lastName: 'Cole'},
  {id: 3, firstName: 'Celes', middleName: 'Gestahl', lastName: 'Chere'},
  {id: 4, firstName: 'Edgar', middleName: 'Roni', lastName: 'Figaro'},
  {id: 5, firstName: 'Sabin', middleName: 'Rene', lastName: 'Figaro'},
  {id: 6, firstName: 'Clyde', middleName: '"Shadow"', lastName: 'Arrowny'},
  {id: 7, firstName: 'Setzer', middleName: '', lastName: 'Gabbiani'},
  {id: 8, firstName: 'Cid', middleName: 'Del Norte', lastName: 'Marquez'},
  {id: 9, firstName: 'Mog', middleName: '', lastName: 'McMoogle'},
];

/**
 * @title CDK Popover Edit spanning multiple columns on an HTML data-table
 */
@Component({
  selector: 'cdk-popover-edit-cell-span-vanilla-table-example',
  styleUrls: ['cdk-popover-edit-cell-span-vanilla-table-example.css'],
  templateUrl: 'cdk-popover-edit-cell-span-vanilla-table-example.html',
})
export class CdkPopoverEditCellSpanVanillaTableExample {
  readonly preservedValues = new WeakMap<Person, any>();

  readonly persons = PERSON_DATA;

  onSubmit(person: Person, f: NgForm) {
    if (!f.valid) {
      return;
    }

    person.firstName = f.value['firstName'];
    person.middleName = f.value['middleName'];
    person.lastName = f.value['lastName'];
  }
}

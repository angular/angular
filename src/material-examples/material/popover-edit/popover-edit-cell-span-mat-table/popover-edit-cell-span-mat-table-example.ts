import {Component} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {NgForm} from '@angular/forms';
import {BehaviorSubject, Observable} from 'rxjs';

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
 * @title Material Popover Edit spanning multiple columns on a Material data-table
 */
@Component({
  selector: 'popover-edit-cell-span-mat-table-example',
  styleUrls: ['popover-edit-cell-span-mat-table-example.css'],
  templateUrl: 'popover-edit-cell-span-mat-table-example.html',
})
export class PopoverEditCellSpanMatTableExample {
  displayedColumns: string[] = ['id', 'firstName', 'middleName', 'lastName'];
  dataSource = new ExampleDataSource();

  readonly preservedValues = new WeakMap<Person, any>();

  onSubmit(person: Person, f: NgForm) {
    if (!f.valid) {
      return;
    }

    person.firstName = f.value['firstName'];
    person.middleName = f.value['middleName'];
    person.lastName = f.value['lastName'];
  }
}

/**
 * Data source to provide what data should be rendered in the table. Note that the data source
 * can retrieve its data in any way. In this case, the data source is provided a reference
 * to a common data base, ExampleDatabase. It is not the data source's responsibility to manage
 * the underlying data. Instead, it only needs to take the data and send the table exactly what
 * should be rendered.
 */
export class ExampleDataSource extends DataSource<Person> {
  /** Stream of data that is provided to the table. */
  data = new BehaviorSubject<Person[]>(PERSON_DATA);

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Person[]> {
    return this.data;
  }

  disconnect() {}
}

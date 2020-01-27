import {Component} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {FormValueContainer} from '@angular/cdk-experimental/popover-edit';
import {NgForm} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {BehaviorSubject, Observable} from 'rxjs';

export type ElementType = 'Metal' | 'Semimetal' | 'Nonmetal';

export type FantasyElement = 'Earth' | 'Water' | 'Wind' | 'Fire' | 'Light' | 'Dark';

export interface PeriodicElement {
  name: string;
  type: ElementType;
  position: number;
  weight: number;
  symbol: string;
  fantasyCounterparts: FantasyElement[];
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', type: 'Nonmetal', weight: 1.0079, symbol: 'H',
      fantasyCounterparts: ['Fire', 'Wind', 'Light']},
  {position: 2, name: 'Helium', type: 'Nonmetal', weight: 4.0026, symbol: 'He',
      fantasyCounterparts: ['Wind', 'Light']},
  {position: 3, name: 'Lithium', type: 'Metal', weight: 6.941, symbol: 'Li',
      fantasyCounterparts: []},
  {position: 4, name: 'Beryllium', type: 'Metal', weight: 9.0122, symbol: 'Be',
      fantasyCounterparts: []},
  {position: 5, name: 'Boron', type: 'Semimetal', weight: 10.811, symbol: 'B',
      fantasyCounterparts: []},
  {position: 6, name: 'Carbon', type: 'Nonmetal', weight: 12.0107, symbol: 'C',
      fantasyCounterparts: ['Earth', 'Dark']},
  {position: 7, name: 'Nitrogen', type: 'Nonmetal', weight: 14.0067, symbol: 'N',
      fantasyCounterparts: ['Wind']},
  {position: 8, name: 'Oxygen', type: 'Nonmetal', weight: 15.9994, symbol: 'O',
      fantasyCounterparts: ['Fire', 'Water', 'Wind']},
  {position: 9, name: 'Fluorine', type: 'Nonmetal', weight: 18.9984, symbol: 'F',
      fantasyCounterparts: []},
  {position: 10, name: 'Neon', type: 'Nonmetal', weight: 20.1797, symbol: 'Ne',
      fantasyCounterparts: ['Light']},
  {position: 11, name: 'Sodium', type: 'Metal', weight: 22.9897, symbol: 'Na',
      fantasyCounterparts: ['Earth', 'Water']},
  {position: 12, name: 'Magnesium', type: 'Metal', weight: 24.305, symbol: 'Mg',
      fantasyCounterparts: []},
  {position: 13, name: 'Aluminum', type: 'Metal', weight: 26.9815, symbol: 'Al',
      fantasyCounterparts: []},
  {position: 14, name: 'Silicon', type: 'Semimetal', weight: 28.0855, symbol: 'Si',
      fantasyCounterparts: []},
  {position: 15, name: 'Phosphorus', type: 'Nonmetal', weight: 30.9738, symbol: 'P',
      fantasyCounterparts: []},
  {position: 16, name: 'Sulfur', type: 'Nonmetal', weight: 32.065, symbol: 'S',
      fantasyCounterparts: []},
  {position: 17, name: 'Chlorine', type: 'Nonmetal', weight: 35.453, symbol: 'Cl',
      fantasyCounterparts: []},
  {position: 18, name: 'Argon', type: 'Nonmetal', weight: 39.948, symbol: 'Ar',
      fantasyCounterparts: []},
  {position: 19, name: 'Potassium', type: 'Metal', weight: 39.0983, symbol: 'K',
      fantasyCounterparts: []},
  {position: 20, name: 'Calcium', type: 'Metal', weight: 40.078, symbol: 'Ca',
      fantasyCounterparts: []},
];

const TYPES: readonly ElementType[] = ['Metal', 'Semimetal', 'Nonmetal'];
const FANTASY_ELEMENTS: readonly FantasyElement[] =
    ['Earth', 'Water', 'Wind', 'Fire', 'Light', 'Dark'];

/**
 * @title Material Popover Edit on a Material data-table
 */
@Component({
  selector: 'popover-edit-mat-table-example',
  styleUrls: ['popover-edit-mat-table-example.css'],
  templateUrl: 'popover-edit-mat-table-example.html',
})
export class PopoverEditMatTableExample {
  displayedColumns: string[] =
      ['position', 'name', 'type', 'weight', 'symbol', 'fantasyCounterpart'];
  dataSource = new ExampleDataSource();

  nameEditEnabled = true;

  readonly TYPES = TYPES;
  readonly FANTASY_ELEMENTS = FANTASY_ELEMENTS;

  readonly nameValues = new FormValueContainer<PeriodicElement, any>();
  readonly weightValues = new FormValueContainer<PeriodicElement, any>();
  readonly typeValues = new FormValueContainer<PeriodicElement, any>();
  readonly fantasyValues = new FormValueContainer<PeriodicElement, any>();

  constructor(private readonly _snackBar: MatSnackBar) {}

  onSubmitName(element: PeriodicElement, f: NgForm) {
    if (!f.valid) { return; }

    element.name = f.value.name;
  }

  onSubmitWeight(element: PeriodicElement, f: NgForm) {
    if (!f.valid) { return; }

    element.weight = f.value.weight;
  }

  onSubmitType(element: PeriodicElement, f: NgForm) {
    if (!f.valid) { return; }

    element.type = f.value.type[0];
  }

  onSubmitFantasyCounterparts(element: PeriodicElement, f: NgForm) {
    if (!f.valid) { return; }

    element.fantasyCounterparts = f.value.fantasyCounterparts;
  }

  goodJob(element: PeriodicElement) {
    this._snackBar.open(`Way to go, ${element.name}!`, undefined, {duration: 2000});
  }

  badJob(element: PeriodicElement) {
    this._snackBar.open(`You have failed me for the last time, #${element.position}.`, undefined,
        {duration: 2000});
  }
}

/**
 * Data source to provide what data should be rendered in the table. Note that the data source
 * can retrieve its data in any way. In this case, the data source is provided a reference
 * to a common data base, ExampleDatabase. It is not the data source's responsibility to manage
 * the underlying data. Instead, it only needs to take the data and send the table exactly what
 * should be rendered.
 */
export class ExampleDataSource extends DataSource<PeriodicElement> {
  /** Stream of data that is provided to the table. */
  data = new BehaviorSubject<PeriodicElement[]>(ELEMENT_DATA);

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<PeriodicElement[]> {
    return this.data;
  }

  disconnect() {}
}

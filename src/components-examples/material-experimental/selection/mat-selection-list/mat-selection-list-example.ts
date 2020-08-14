import {SelectionChange} from '@angular/cdk-experimental/selection';
import {Component, OnDestroy} from '@angular/core';
import {ReplaySubject} from 'rxjs';

/**
 * @title Mat Selection on a simple list.
 */
@Component({
  selector: 'mat-selection-list-example',
  templateUrl: 'mat-selection-list-example.html',
})
export class MatSelectionListExample implements OnDestroy {
  private readonly _destroyed = new ReplaySubject(1);

  data = ELEMENT_NAMES;

  selected1: string[] = [];
  selected2: string[] = [];
  selected3: string[] = [];
  selected4: string[] = [];

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  getCurrentSelected(event: SelectionChange<string>) {
    return event.after.map((select) => select.value);
  }

  trackByFn(index: number, value: string) {
    return index;
  }

  changeElementName() {
    this.data = ELEMENT_SYMBOLS;
  }

  reset() {
    this.data = ELEMENT_NAMES;
  }
}

const ELEMENT_NAMES = [
  'Hydrogen',   'Helium',   'Lithium',  'Beryllium', 'Boron',     'Carbon',   'Nitrogen',
  'Oxygen',     'Fluorine', 'Neon',     'Sodium',    'Magnesium', 'Aluminum', 'Silicon',
  'Phosphorus', 'Sulfur',   'Chlorine', 'Argon',     'Potassium', 'Calcium',
];

const ELEMENT_SYMBOLS = [
  'H',  'He', 'Li', 'Be', 'B', 'C', 'N',  'O',  'F', 'Ne',
  'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca'
];

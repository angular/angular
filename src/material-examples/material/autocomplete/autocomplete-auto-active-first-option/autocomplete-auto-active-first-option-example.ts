import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

/**
 * @title Highlight the first autocomplete option
 */
@Component({
  selector: 'autocomplete-auto-active-first-option-example',
  templateUrl: 'autocomplete-auto-active-first-option-example.html',
  styleUrls: ['autocomplete-auto-active-first-option-example.css'],
})
export class AutocompleteAutoActiveFirstOptionExample implements OnInit {
  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }
}

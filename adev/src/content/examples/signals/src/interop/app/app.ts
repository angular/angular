import {Component, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {debounceTime, distinctUntilChanged, switchMap, of, delay} from 'rxjs';

@Component({
  selector: 'app-interop',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [FormsModule],
})
export class Interop {
  searchTerm = signal('');

  private searchResults$ = toObservable(this.searchTerm).pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((term) => this.mockCitySearch(term)),
  );

  searchResults = toSignal(this.searchResults$, {initialValue: []});

  private mockCitySearch(term: string) {
    const cities = ['Houston', 'Honolulu', 'Hartford', 'Helsinki', 'New York', 'Phoenix'];
    if (!term) {
      return of([]);
    }
    const filteredCities = cities.filter((c) => c.toLowerCase().startsWith(term.toLowerCase()));
    return of(filteredCities).pipe(delay(200));
  }
}

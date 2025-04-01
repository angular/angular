import {InMemoryDbService} from 'angular-in-memory-web-api';
import {QUOTES} from './twain/twain.data';

// Adjust to reduce number of quotes
const maxQuotes = Infinity; // 0;

/** Create in-memory database of heroes and quotes */
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const heroes = [
      {id: 12, name: 'Dr. Nice'},
      {id: 13, name: 'Bombasto'},
      {id: 14, name: 'Celeritas'},
      {id: 15, name: 'Magneta'},
      {id: 16, name: 'RubberMan'},
      {id: 17, name: 'Dynama'},
      {id: 18, name: 'Dr. IQ'},
      {id: 19, name: 'Magma'},
      {id: 20, name: 'Tornado'},
    ];

    return {heroes, quotes: QUOTES.slice(0, maxQuotes)};
  }
}

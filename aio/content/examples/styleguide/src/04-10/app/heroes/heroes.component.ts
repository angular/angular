// #docregion
import { Component } from '@angular/core';

import { FilterTextService } from '../shared/filter-text/filter-text.service';

@Component({
  selector: 'toh-heroes',
  templateUrl: './heroes.component.html'
})
export class HeroesComponent {

  heroes = [
    { id: 1, name: 'Windstorm' },
    { id: 2, name: 'Bombasto' },
    { id: 3, name: 'Magneta' },
    { id: 4, name: 'Tornado' }
  ];

  filteredHeroes = this.heroes;

  constructor(private filterService: FilterTextService) { }

  filterChanged(searchText: string) {
    this.filteredHeroes = this.filterService.filter(searchText, ['id', 'name'], this.heroes);
  }
}


// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'hero-list',
  template: `
    <h2>Heroes from JSON File</h2>

    <div *ngFor="let hero of ('heroes.json' | fetch) ">
      {{hero.name}}
    </div>

    <p>Heroes as JSON:
      {{'heroes.json' | fetch | json}}
    </p>`
})
export class HeroListComponent { }

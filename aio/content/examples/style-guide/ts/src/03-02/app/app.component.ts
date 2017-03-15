import { Component } from '@angular/core';

import { heroesUrl, mockHeroes, VILLAINS_URL } from './core';

@Component({
  selector: 'sg-app',
  template: `
    <div>Heroes url: {{heroesUrl}}</div>
    <div>Villains url: {{villainsUrl}}</div>

    <h4>Mock Heroes</h4>
    <div *ngFor="let hero of heroes">{{hero}}</div>
  `
})
export class AppComponent {
  heroes      = mockHeroes;   // prefer
  heroesUrl   = heroesUrl;    // prefer
  villainsUrl = VILLAINS_URL; // tolerate
}

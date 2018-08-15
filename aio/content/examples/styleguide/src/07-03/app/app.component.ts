// #docregion
import { Component } from '@angular/core';

import { HeroService } from './heroes';

@Component({
  selector: 'toh-app',
  template: `
      <toh-heroes></toh-heroes>
    `,
})
export class AppComponent {}

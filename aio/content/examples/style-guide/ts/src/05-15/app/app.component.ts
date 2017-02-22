import { Component } from '@angular/core';

import { HeroService } from './heroes';

@Component({
  selector: 'sg-app',
  template: '<toh-hero-list></toh-hero-list>',
  providers: [HeroService]
})
export class AppComponent { }

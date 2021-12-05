// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'hero-detail',
  template: `
    <h2>Windstorm details!</h2>
    <!-- eslint-disable-next-line @angular-eslint/template/accessibility-label-has-associated-control -->
    <div><label>id: </label>1</div>
  `
})
export class HeroDetailComponent { }

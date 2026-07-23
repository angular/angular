import {Component} from '@angular/core';

@Component({
  selector: 'card-cmp',
  template: `
    <div class="header"><ng-content select="[card-title]" /></div>
    <div class="body"><ng-content /></div>
  `,
})
export class CardComponent {}

@Component({
  selector: 'app-root',
  imports: [CardComponent],
  template: `
    <card-cmp>
      <h1 ngProjectAs="[card-title]">Title</h1>
      <p>Body</p>
    </card-cmp>
  `,
})
export class AppComponent {}

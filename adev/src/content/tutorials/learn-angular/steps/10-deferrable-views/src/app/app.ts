import {Component} from '@angular/core';
import {Comments} from './comments';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <h1>How I feel about Angular</h1>
      <article></article>
      <comments />
    </div>
  `,
  imports: [Comments],
})
export class App {}

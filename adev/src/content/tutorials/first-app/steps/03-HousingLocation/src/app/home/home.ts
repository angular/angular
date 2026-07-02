import {Component} from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <section>
      <form>
        <input type="text" placeholder="Filter by city" />
        <button class="primary" type="button">Search</button>
      </form>
    </section>
  `,
  styleUrls: ['./home.css'],
})
export class Home {}

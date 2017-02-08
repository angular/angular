import { Component } from '@angular/core';

@Component({
  selector: 'aio-menu',
  template: `
    <span><a class="nav-link" aioNavLink="home">Home</a></span>
    <!-- <span><a class="nav-link" aioNavLink="api">API</a></span> -->
    <span><a class="nav-link" aioNavLink="api/common/date-pipe">API</a></span>
    <span><a class="nav-link" aioNavLink="news">News</a></span>
    <span><a class="nav-link" aioNavLink="features">Features</a></span>
  `,
  styleUrls: ['./menu.component.scss'],
  animations: []
})
export class MenuComponent {
}

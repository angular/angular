import { Component } from '@angular/core';

import { NavEngine } from './nav-engine/nav-engine.service';

@Component({
  selector: 'aio-shell',
  templateUrl: './app.component.html',
  styleUrls:  ['./app.component.scss']
})
export class AppComponent {
  constructor(public navEngine: NavEngine) {}
}

import { Component } from '@angular/core';
import { NavEngine } from './nav-engine/nav-engine';
@Component({
  selector: 'aio-shell',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app works!';
  constructor(public navEngine: NavEngine) {}
}

import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';

@Component({
  selector: 'home',
  template: `
    <p>e2e website!</p>
  `
})
export class Home {}

@Component({
  moduleId: module.id,
  selector: 'e2e-app',
  providers: [],
  templateUrl: 'e2e-app.html',
  directives: [
    ROUTER_DIRECTIVES,
  ],
  pipes: []
})
export class E2EApp { }

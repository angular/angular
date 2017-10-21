import {Component, ViewEncapsulation} from '@angular/core';


@Component({
  selector: 'home',
  template: `<p>e2e website!</p>`
})
export class Home {}

@Component({
  moduleId: module.id,
  selector: 'e2e-app',
  templateUrl: 'e2e-app.html',
  styleUrls: ['e2e-app.css'],
  encapsulation: ViewEncapsulation.None,
})
export class E2EApp {
  showLinks: boolean = false;
}

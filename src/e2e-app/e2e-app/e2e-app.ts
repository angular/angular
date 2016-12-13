import {Component} from '@angular/core';


@Component({
  selector: 'home',
  template: `<p>e2e website!</p>`
})
export class Home {}

@Component({
  moduleId: module.id,
  selector: 'e2e-app',
  templateUrl: 'e2e-app.html',
})
export class E2EApp {
  showLinks: boolean = false;
}

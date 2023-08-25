import {Component} from '@angular/core';

@Component(
    {selector: 'app-root', templateUrl: 'app.component.html', styleUrls: ['app.component.css']})
export class AppComponent {
  goToItems() {
    this.router.navigate(['items'], {relativeTo: this.route});
  }
}

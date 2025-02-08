import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  standalone: false,
})
export class AppComponent {
  // #docregion relative-to
  goToItems() {
    this.router.navigate(['items'], {relativeTo: this.route});
  }
  // #enddocregion relative-to
}

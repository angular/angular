import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';
@Component({
  selector: 'app-root',
  template: `<router-outlet/>`,
  imports: [RouterModule],
  standalone: true,
})
export class AppComponent {}

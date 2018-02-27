import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { Crisis,
         CrisisService } from './crisis.service';

@Component({
  template: `
    <h3 highlight>Crisis List</h3>
    <div *ngFor='let crisis of crises | async'>
      <a routerLink="{{'../' + crisis.id}}">{{crisis.id}} - {{crisis.name}}</a>
    </div>
  `
})
export class CrisisListComponent {
  crises: Observable<Crisis[]>;

  constructor(private crisisService: CrisisService) {
    this.crises = this.crisisService.getCrises();
  }
}

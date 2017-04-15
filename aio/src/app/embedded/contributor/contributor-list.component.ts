import { Component } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { ContributorGroup } from './contributors.model';
import { ContributorService } from './contributor.service';

@Component({
  selector: 'aio-contributor-list',
  template: `
  <section *ngFor="let group of groups | async" class="grid-fluid">
    <h4 class="title">{{group.name}}</h4>
    <aio-contributor *ngFor="let person of group.contributors" [person]="person"></aio-contributor>
  </section>`
})
export class ContributorListComponent {
  groups: Observable<ContributorGroup[]>;

  constructor(private contributorService: ContributorService) {
    this.groups = this.contributorService.contributors;
  }
}

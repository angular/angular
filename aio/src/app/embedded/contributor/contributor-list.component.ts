import { Component, OnInit } from '@angular/core';
import { Contributor } from './contributors.model';
import { ContributorService } from './contributor.service';

@Component({
  selector: `aio-contributor-list`,
  template: `
  <section *ngFor="let group of groups" class="grid-fluid">
    <h4 class="title">{{group}}</h4>
    <aio-contributor *ngFor="let person of contributorGroups[group]" [person]="person"></aio-contributor>
  </section>`
})
export class ContributorListComponent implements OnInit {
  contributorGroups = new Map<string, Contributor[]>();
  groups: string[];

  constructor(private contributorService: ContributorService) { }

  ngOnInit() {
    this.contributorService.contributors.subscribe(cgs => {
      this.groups = ['Lead', 'Google', 'Community'];
      this.contributorGroups = cgs;
    });
  }
}

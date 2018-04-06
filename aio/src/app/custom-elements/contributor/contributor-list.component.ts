import { Component, OnInit } from '@angular/core';
import { ContributorGroup } from './contributors.model';
import { ContributorService } from './contributor.service';
import { LocationService } from 'app/shared/location.service';

@Component({
  selector: `aio-contributor-list`,
  template: `
  <div class="flex-center group-buttons">
    <a *ngFor="let name of groupNames"
       [class.selected]="name == selectedGroup.name"
       class="button mat-button filter-button"
       (click)="selectGroup(name)">{{name}}</a>
  </div>
  <section *ngIf="selectedGroup" class="grid-fluid">
    <div class="contributor-group">
      <aio-contributor *ngFor="let person of selectedGroup.contributors" [person]="person"></aio-contributor>
    </div>
  </section>`
})
export class ContributorListComponent implements OnInit {
  private groups: ContributorGroup[];
  groupNames: string[];
  selectedGroup: ContributorGroup;

  constructor(
    private contributorService: ContributorService,
    private locationService: LocationService) { }

  ngOnInit() {
    const groupName =  this.locationService.search()['group'] || '';
    // no need to unsubscribe because `contributors` completes
    this.contributorService.contributors
      .subscribe(grps => {
        this.groups = grps;
        this.groupNames = grps.map(g => g.name);
        this.selectGroup(groupName);
      });
  }

  selectGroup(name: string) {
    name = name.toLowerCase();
    this.selectedGroup = this.groups.find(g => g.name.toLowerCase() === name) || this.groups[0];
    this.locationService.setSearch('', {group: this.selectedGroup.name});
  }
}

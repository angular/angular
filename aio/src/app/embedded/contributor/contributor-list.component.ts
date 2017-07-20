import { Component, OnInit } from '@angular/core';
import { ContributorGroup } from './contributors.model';
import { ContributorService } from './contributor.service';

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

  constructor(private contributorService: ContributorService) { }

  ngOnInit() {
    // no need to unsubscribe because `contributors` completes
    this.contributorService.contributors
      .subscribe(grps => {
        this.groups = grps;
        this.groupNames = grps.map(g => g.name);
        this.selectGroup(grps[0].name);
      });
  }

  selectGroup(name) {
    this.selectedGroup = this.groups.find(g => g.name === name);
  }
}

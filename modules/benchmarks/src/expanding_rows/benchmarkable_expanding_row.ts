/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';

export interface MlbTeam {
  name: string;
  id: number;
  division: string;
  stadium: string;
  projection: string;
}

@Component({
  selector: 'benchmarkable-expanding-row',
  template: ` <cfc-expanding-row-host *ngIf="showExpandingRow">
    <cfc-expanding-row *ngFor="let team of teams" [rowId]="$any(team.id)">
      <cfc-expanding-row-summary> Team {{ team.id }} </cfc-expanding-row-summary>
      <cfc-expanding-row-details-caption>
        {{ team.name }}
        <a href="https://www.google.com" class="cfc-demo-expanding-row-caption-link">
          {{ team.id }}
        </a>
      </cfc-expanding-row-details-caption>
      <cfc-expanding-row-details-content>
        <ul ace-list>
          <li>Division: {{ team.division }}</li>
          <li>
            <a href="https://www.google.com">{{ team.stadium }}</a>
          </li>
          <li>Projected Record: {{ team.projection }}</li>
        </ul>
      </cfc-expanding-row-details-content>
    </cfc-expanding-row>
  </cfc-expanding-row-host>`,
  standalone: false,
})
export class BenchmarkableExpandingRow {
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  showExpandingRow!: boolean;

  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  teams!: MlbTeam[];
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  private fakeTeams!: MlbTeam[];

  init(): void {
    this.teams = this.fakeTeams;
    this.showExpandingRow = true;
  }

  reset(numItems = 5000): void {
    this.showExpandingRow = false;

    this.fakeTeams = [];
    for (let i = 0; i < numItems; i++) {
      this.fakeTeams.push({
        name: `name ${i}`,
        id: i,
        division: `division ${i}`,
        stadium: `stadium ${i}`,
        projection: `projection ${i}`,
      });
    }
  }
}

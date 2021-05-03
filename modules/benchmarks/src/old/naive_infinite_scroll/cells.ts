/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgFor} from '@angular/common';
import {Component, Directive} from '@angular/core';

import {Account, Company, CustomDate, Offering, Opportunity, STATUS_LIST} from './common';

export class HasStyle {
  cellWidth: number;

  constructor() {}

  set width(w: number) {
    this.cellWidth = w;
  }
}

@Component({
  selector: 'company-name',
  inputs: ['width: cell-width', 'company'],
  directives: [],
  template: `<div [style.width.px]="cellWidth">{{company.name}}</div>`
})
export class CompanyNameComponent extends HasStyle {
  company: Company;
}

@Component({
  selector: 'opportunity-name',
  inputs: ['width: cell-width', 'opportunity'],
  directives: [],
  template: `<div [style.width.px]="cellWidth">{{opportunity.name}}</div>`
})
export class OpportunityNameComponent extends HasStyle {
  opportunity: Opportunity;
}

@Component({
  selector: 'offering-name',
  inputs: ['width: cell-width', 'offering'],
  directives: [],
  template: `<div [style.width.px]="cellWidth">{{offering.name}}</div>`
})
export class OfferingNameComponent extends HasStyle {
  offering: Offering;
}

export class Stage {
  name: string;
  isDisabled: boolean;
  backgroundColor: string;
  apply: Function;
}

@Component({
  selector: 'stage-buttons',
  inputs: ['width: cell-width', 'offering'],
  directives: [NgFor],
  template: `
      <div [style.width.px]="cellWidth">
          <button *ngFor="let stage of stages"
                  [disabled]="stage.isDisabled"
                  [style.background-color]="stage.backgroundColor"
                  on-click="setStage(stage)">
            {{stage.name}}
          </button>
      </div>`
})
export class StageButtonsComponent extends HasStyle {
  private _offering: Offering;
  stages: Stage[];

  get offering(): Offering {
    return this._offering;
  }

  set offering(offering: Offering) {
    this._offering = offering;
    this._computeStageButtons();
  }

  setStage(stage: Stage) {
    this._offering.status = stage.name;
    this._computeStageButtons();
  }

  private _computeStageButtons() {
    let disabled = true;
    this.stages = STATUS_LIST
                      .map((status) => {
                        const isCurrent = this._offering.status == status;
                        const stage = new Stage();
                        stage.name = status;
                        stage.isDisabled = disabled;
                        stage.backgroundColor = disabled ? '#DDD' : isCurrent ? '#DDF' : '#FDD';
                        if (isCurrent) {
                          disabled = false;
                        }
                        return stage;
                      })
                      .slice();
  }
}

@Component({
  selector: 'account-cell',
  inputs: ['width: cell-width', 'account'],
  directives: [],
  template: `
      <div [style.width.px]="cellWidth">
        <a href="/account/{{account.accountId}}">
          {{account.accountId}}
        </a>
      </div>`
})
export class AccountCellComponent extends HasStyle {
  account: Account;
}

@Component({
  selector: 'formatted-cell',
  inputs: ['width: cell-width', 'value'],
  directives: [],
  template: `<div [style.width.px]="cellWidth">{{formattedValue}}</div>`
})
export class FormattedCellComponent extends HasStyle {
  formattedValue: string;

  set value(value) {
    if (value instanceof CustomDate) {
      this.formattedValue = `${value.month}/${value.day}/${value.year}`;
    } else {
      this.formattedValue = value.toString();
    }
  }
}

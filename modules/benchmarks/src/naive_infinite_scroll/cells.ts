import {List, ListWrapper, Map, MapWrapper} from 'angular2/src/facade/collection';
import {Company, Opportunity, Offering, Account, CustomDate, STATUS_LIST} from './common';
import {NgFor} from 'angular2/directives';

import {Component, Directive, View} from 'angular2/angular2';

export class HasStyle {
  style: Map<any, any>;

  constructor() { this.style = MapWrapper.create(); }

  set width(w) { MapWrapper.set(this.style, 'width', w); }
}

@Component({selector: 'company-name', properties: ['width: cell-width', 'company']})
@View({directives: [], template: `<div [style]="style">{{company.name}}</div>`})
export class CompanyNameComponent extends HasStyle {
  company: Company;
}

@Component({selector: 'opportunity-name', properties: ['width: cell-width', 'opportunity']})
@View({directives: [], template: `<div [style]="style">{{opportunity.name}}</div>`})
export class OpportunityNameComponent extends HasStyle {
  opportunity: Opportunity;
}

@Component({selector: 'offering-name', properties: ['width: cell-width', 'offering']})
@View({directives: [], template: `<div [style]="style">{{offering.name}}</div>`})
export class OfferingNameComponent extends HasStyle {
  offering: Offering;
}

export class Stage {
  name: string;
  isDisabled: boolean;
  style: Map;
  apply: Function;
}

@Component({selector: 'stage-buttons', properties: ['width: cell-width', 'offering']})
@View({
  directives: [NgFor],
  template: `
      <div [style]="style">
          <button template="ng-for #stage of stages"
                  [disabled]="stage.isDisabled"
                  [style]="stage.style"
                  on-click="setStage(stage)">
            {{stage.name}}
          </button>
      </div>`
})
export class StageButtonsComponent extends HasStyle {
  _offering: Offering;
  stages: List<Stage>;

  get offering(): Offering { return this._offering; }

  set offering(offering: Offering) {
    this._offering = offering;
    this._computeStageButtons();
  }

  setStage(stage: Stage) {
    this._offering.status = stage.name;
    this._computeStageButtons();
  }

  _computeStageButtons() {
    var disabled = true;
    this.stages = ListWrapper.clone(STATUS_LIST.map((status) => {
      var isCurrent = this._offering.status == status;
      var stage = new Stage();
      stage.name = status;
      stage.isDisabled = disabled;
      var stageStyle = MapWrapper.create();
      MapWrapper.set(stageStyle, 'background-color',
                     disabled ? '#DDD' : isCurrent ? '#DDF' : '#FDD');
      stage.style = stageStyle;
      if (isCurrent) {
        disabled = false;
      }
      return stage;
    }));
  }
}

@Component({selector: 'account-cell', properties: ['width: cell-width', 'account']})
@View({
  directives: [],
  template: `
      <div [style]="style">
        <a href="/account/{{account.accountId}}">
          {{account.accountId}}
        </a>
      </div>`
})
export class AccountCellComponent extends HasStyle {
  account: Account;
}

@Component({selector: 'formatted-cell', properties: ['width: cell-width', 'value']})
@View({directives: [], template: `<div [style]="style">{{formattedValue}}</div>`})
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

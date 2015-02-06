import {int} from 'angular2/src/facade/lang';
import {reflector} from 'angular2/src/reflection/reflection';
import {getIntParameter, bindAction} from 'angular2/src/test_lib/benchmark_util';
import {bootstrap, Component, Template, TemplateConfig, ViewPort, Compiler}
    from 'angular2/angular2';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {Company, Opportunity, Offering, Account, CustomDate, STATUS_LIST}
    from './common';
import {NgRepeat} from 'angular2/directives';

export class HasStyle {
  style:Map;

  constructor() {
    this.style = MapWrapper.create();
  }

  set width(w) {
    MapWrapper.set(this.style, 'width', w);
  }
}

export class CompanyNameComponent extends HasStyle {
  company:Company;
}

export class OpportunityNameComponent extends HasStyle {
  opportunity:Opportunity;
}

export class OfferingNameComponent extends HasStyle {
  offering:Offering;
}

export class Stage {
  name:string;
  isDisabled:boolean;
  style:Map;
  apply:Function;
}

export class StageButtonsComponent extends HasStyle {
  _offering:Offering;
  stages:List<Stage>;

  get offering():Offering { return this._offering; }

  set offering(offering:Offering) {
    this._offering = offering;
    this._computeStageButtons();
  }

  setStage(stage:Stage) {
    this._offering.status = stage.name;
    this._computeStageButtons();
  }

  _computeStageButtons() {
    var disabled = true;
    this.stages = ListWrapper.clone(STATUS_LIST
      .map((status) => {
        var isCurrent = this._offering.status == status;
        var stage = new Stage();
        stage.name = status;
        stage.isDisabled = disabled;
        var stageStyle = MapWrapper.create();
        MapWrapper.set(stageStyle, 'background-color',
          disabled
            ? '#DDD'
            : isCurrent
              ? '#DDF'
              : '#FDD');
        stage.style = stageStyle;
        if (isCurrent) {
          disabled = false;
        }
        return stage;
      }));
  }
}

export class AccountCellComponent extends HasStyle {
  account:Account;
}

export class FormattedCellComponent extends HasStyle {
  formattedValue:string;

  set value(value) {
    if (value instanceof CustomDate) {
      this.formattedValue = `${value.month}/${value.day}/${value.year}`;
    } else {
      this.formattedValue = value.toString();
    }
  }
}

export function setupReflectorForCells() {
  reflector.registerType(CompanyNameComponent, {
    'factory': () => new CompanyNameComponent(),
    'parameters': [],
    'annotations': [
      new Component({
        selector: 'company-name',
        template: new TemplateConfig({
            directives: [],
            inline: `<div [style]="style">{{company.name}}</div>`
        }),
        bind: {
          'cell-width': 'width',
          'company': 'company'
        }
      })
    ]
  });

  reflector.registerType(OpportunityNameComponent, {
    'factory': () => new OpportunityNameComponent(),
    'parameters': [],
    'annotations': [
      new Component({
        selector: 'opportunity-name',
        template: new TemplateConfig({
            directives: [],
            inline: `<div [style]="style">{{opportunity.name}}</div>`
        }),
        bind: {
          'cell-width': 'width',
          'opportunity': 'opportunity'
        }
      })
    ]
  });

  reflector.registerType(OfferingNameComponent, {
    'factory': () => new OfferingNameComponent(),
    'parameters': [],
    'annotations': [
      new Component({
        selector: 'offering-name',
        template: new TemplateConfig({
            directives: [],
            inline: `<div [style]="style">{{offering.name}}</div>`
        }),
        bind: {
          'cell-width': 'width',
          'offering': 'offering'
        }
      })
    ]
  });

  reflector.registerType(StageButtonsComponent, {
    'factory': () => new StageButtonsComponent(),
    'parameters': [],
    'annotations': [
      new Component({
        selector: 'stage-buttons',
        template: new TemplateConfig({
            directives: [NgRepeat],
            inline: `
              <div [style]="style">
                  <button template="ng-repeat #stage in stages"
                          [disabled]="stage.isDisabled"
                          [style]="stage.style"
                          on-click="setStage(stage)">
                    {{stage.name}}
                  </button>
              </div>`
        }),
        bind: {
          'cell-width': 'width',
          'offering': 'offering'
        }
      })
    ]
  });

  reflector.registerType(AccountCellComponent, {
    'factory': () => new AccountCellComponent(),
    'parameters': [],
    'annotations': [
      new Component({
        selector: 'account-cell',
        template: new TemplateConfig({
            directives: [],
            inline: `
              <div [style]="style">
                <a href="/account/{{account.accountId}}">
                  {{account.accountId}}
                </a>
              </div>`
        }),
        bind: {
          'cell-width': 'width',
          'account': 'account'
        }
      })
    ]
  });

  reflector.registerType(FormattedCellComponent, {
    'factory': () => new FormattedCellComponent(),
    'parameters': [],
    'annotations': [
      new Component({
        selector: 'formatted-cell',
        template: new TemplateConfig({
            directives: [],
            inline: `<div [style]="style">{{formattedValue}}</div>`
        }),
        bind: {
          'cell-width': 'width',
          'value': 'value'
        }
      })
    ]
  });
}

library benchmarks.src.naive_infinite_scroll.cells;

import "package:angular2/src/facade/collection.dart"
    show List, ListWrapper, Map;
import "common.dart"
    show Company, Opportunity, Offering, Account, CustomDate, STATUS_LIST;
import "package:angular2/common.dart" show NgFor;
import "package:angular2/angular2.dart" show Component, Directive, View, ChangeDetectionStrategy;

class HasStyle {
  int cellWidth;
  HasStyle() {}
  set width(int w) {
    this.cellWidth = w;
  }
}
@Component(
    selector: "company-name",
    inputs: const ["width: cell-width", "company"],
    changeDetection: ChangeDetectionStrategy.OnPushObserve
)
@View(
    directives: const [],
    template: '''<div [style.width.px]="cellWidth">{{company.name}}</div>'''
)
class CompanyNameComponent extends HasStyle {
  Company company;
}
@Component(
    selector: "opportunity-name",
    inputs: const ["width: cell-width", "opportunity"],
    changeDetection: ChangeDetectionStrategy.OnPushObserve
)
@View(
    directives: const [],
    template: '''<div [style.width.px]="cellWidth">{{opportunity.name}}</div>'''
)
class OpportunityNameComponent extends HasStyle {
  Opportunity opportunity;
}
@Component(
    selector: "offering-name",
    inputs: const ["width: cell-width", "offering"],
    changeDetection: ChangeDetectionStrategy.OnPushObserve
)
@View(
    directives: const [],
    template: '''<div [style.width.px]="cellWidth">{{offering.name}}</div>'''
)
class OfferingNameComponent extends HasStyle {
  Offering offering;
}
class Stage {
  String name;
  bool isDisabled;
  String backgroundColor;
  Function apply;
}
@Component(
    selector: "stage-buttons",
    inputs: const ["width: cell-width", "offering"],
    changeDetection: ChangeDetectionStrategy.OnPushObserve
)
@View(directives: const [NgFor], template: '''
      <div [style.width.px]="cellWidth">
          <button template="ng-for #stage of stages"
                  [disabled]="stage.isDisabled"
                  [style.background-color]="stage.backgroundColor"
                  on-click="setStage(stage)">
            {{stage.name}}
          </button>
      </div>''')
class StageButtonsComponent extends HasStyle {
  Offering _offering;
  List<Stage> stages;
  Offering get offering {
    return this._offering;
  }
  set offering(Offering offering) {
    this._offering = offering;
    this._computeStageButtons();
  }
  setStage(Stage stage) {
    this._offering.status = stage.name;
    this._offering.name = this._offering.name + "!";
    this._computeStageButtons();
  }
  _computeStageButtons() {
    var disabled = true;
    this.stages = ListWrapper.clone(STATUS_LIST.map((status) {
      var isCurrent = this._offering.status == status;
      var stage = new Stage();
      stage.name = status;
      stage.isDisabled = disabled;
      stage.backgroundColor = disabled ? "#DDD" : isCurrent ? "#DDF" : "#FDD";
      if (isCurrent) {
        disabled = false;
      }
      return stage;
    }).toList());
  }
}
@Component(
    selector: "account-cell",
    inputs: const ["width: cell-width", "account"],
    changeDetection: ChangeDetectionStrategy.OnPushObserve
)
@View(directives: const [], template: '''
      <div [style.width.px]="cellWidth">
        <a href="/account/{{account.accountId}}">
          {{account.accountId}}
        </a>
      </div>''')
class AccountCellComponent extends HasStyle {
  Account account;
}
@Component(
    selector: "formatted-cell",
    inputs: const ["width: cell-width", "value"],
    changeDetection: ChangeDetectionStrategy.OnPushObserve
)
@View(
    directives: const [],
    template: '''<div [style.width.px]="cellWidth">{{formattedValue}}</div>''')
class FormattedCellComponent extends HasStyle {
  String formattedValue;
  set value(value) {
    if (value is CustomDate) {
      this.formattedValue =
          '''${ value . month}/${ value . day}/${ value . year}''';
    } else {
      this.formattedValue = value.toString();
    }
  }
}

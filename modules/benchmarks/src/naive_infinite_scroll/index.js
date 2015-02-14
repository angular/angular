import {int, isBlank} from 'angular2/src/facade/lang';
import {Element} from 'angular2/src/facade/dom';
import {MapWrapper} from 'angular2/src/facade/collection';

import {Parser, Lexer, ChangeDetector, ChangeDetection}
    from 'angular2/change_detection';
import {
  bootstrap, Component, Viewport, Template, ViewContainer, Compiler, onChange
}  from 'angular2/angular2';
import {reflector} from 'angular2/src/reflection/reflection';
import {CompilerCache} from 'angular2/src/core/compiler/compiler';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {ShadowDomStrategy, NativeShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {TemplateLoader} from 'angular2/src/core/compiler/template_loader';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';
import {XHR} from 'angular2/src/core/compiler/xhr/xhr';
import {XHRImpl} from 'angular2/src/core/compiler/xhr/xhr_impl';

import {If, Foreach} from 'angular2/directives';
import {App, setupReflectorForApp} from './app';
import {ScrollAreaComponent, setupReflectorForScrollArea} from './scroll_area';
import {ScrollItemComponent, setupReflectorForScrollItem} from './scroll_item';
import {CompanyNameComponent, OpportunityNameComponent, OfferingNameComponent,
    AccountCellComponent, StageButtonsComponent, FormattedCellComponent,
    setupReflectorForCells}
        from './cells';

export function main() {
  setupReflector();
  bootstrap(App);
}

export function setupReflector() {
  setupReflectorForAngular();
  setupReflectorForApp();
  setupReflectorForScrollArea();
  setupReflectorForScrollItem();
  setupReflectorForCells();

  // TODO: the transpiler is not able to compiles templates used as keys
  var evt = `$event`;

  reflector.registerGetters({
    'scrollAreas': (o) => o.scrollAreas,
    'length': (o) => o.length,
    'iterable': (o) => o.iterable,
    'scrollArea': (o) => o.scrollArea,
    'item': (o) => o.item,
    'visibleItems': (o) => o.visibleItems,
    'condition': (o) => o.condition,
    'width': (o) => o.width,
    'value': (o) => o.value,
    'href': (o) => o.href,
    'company': (o) => o.company,
    'formattedValue': (o) => o.formattedValue,
    'name': (o) => o.name,
    'style': (o) => o.style,
    'offering': (o) => o.offering,
    'account': (o) => o.account,
    'accountId': (o) => o.accountId,
    'companyNameWidth': (o) => o.companyNameWidth,
    'opportunityNameWidth': (o) => o.opportunityNameWidth,
    'offeringNameWidth': (o) => o.offeringNameWidth,
    'accountCellWidth': (o) => o.accountCellWidth,
    'basePointsWidth': (o) => o.basePointsWidth,
    'scrollDivStyle': (o) => o.scrollDivStyle,
    'paddingStyle': (o) => o.paddingStyle,
    'innerStyle': (o) => o.innerStyle,
    'opportunity': (o) => o.opportunity,
    'itemStyle': (o) => o.itemStyle,
    'dueDateWidth': (o) => o.dueDateWidth,
    'basePoints': (o) => o.basePoints,
    'kickerPoints': (o) => o.kickerPoints,
    'kickerPointsWidth': (o) => o.kickerPointsWidth,
    'bundles': (o) => o.bundles,
    'stageButtonsWidth': (o) => o.stageButtonsWidth,
    'bundlesWidth': (o) => o.bundlesWidth,
    'disabled': (o) => o.disabled,
    'isDisabled': (o) => o.isDisabled,
    'dueDate': (o) => o.dueDate,
    'endDate': (o) => o.endDate,
    'aatStatus': (o) => o.aatStatus,
    'stage': (o) => o.stage,
    'stages': (o) => o.stages,
    'aatStatusWidth': (o) => o.aatStatusWidth,
    'endDateWidth': (o) => o.endDateWidth,
    evt: (o) => null
  });

  reflector.registerSetters({
    'scrollAreas': (o, v) => o.scrollAreas = v,
    'length': (o, v) => o.length = v,
    'condition': (o, v) => o.condition = v,
    'scrollArea': (o, v) => o.scrollArea = v,
    'item': (o, v) => o.item = v,
    'visibleItems': (o, v) => o.visibleItems = v,
    'iterable': (o, v) => o.iterable = v,
    'width': (o, v) => o.width = v,
    'value': (o, v) => o.value = v,
    'company': (o, v) => o.company = v,
    'name': (o, v) => o.name = v,
    'offering': (o, v) => o.offering = v,
    'account': (o, v) => o.account = v,
    'accountId': (o, v) => o.accountId = v,
    'formattedValue': (o, v) => o.formattedValue = v,
    'stage': (o, v) => o.stage = v,
    'stages': (o, v) => o.stages = v,
    'disabled': (o, v) => o.disabled = v,
    'isDisabled': (o, v) => o.isDisabled = v,
    'href': (o, v) => o.href = v,
    'companyNameWidth': (o, v) => o.companyNameWidth = v,
    'opportunityNameWidth': (o, v) => o.opportunityNameWidth = v,
    'offeringNameWidth': (o, v) => o.offeringNameWidth = v,
    'accountCellWidth': (o, v) => o.accountCellWidth = v,
    'basePointsWidth': (o, v) => o.basePointsWidth = v,
    'scrollDivStyle': (o, v) => o.scrollDivStyle = v,
    'paddingStyle': (o, v) => o.paddingStyle = v,
    'innerStyle': (o, v) => o.innerStyle = v,
    'opportunity': (o, v) => o.opportunity = v,
    'itemStyle': (o, v) => o.itemStyle = v,
    'basePoints': (o, v) => o.basePoints = v,
    'kickerPoints': (o, v) => o.kickerPoints = v,
    'kickerPointsWidth': (o, v) => o.kickerPointsWidth = v,
    'stageButtonsWidth': (o, v) => o.stageButtonsWidth = v,
    'dueDate': (o, v) => o.dueDate = v,
    'dueDateWidth': (o, v) => o.dueDateWidth = v,
    'endDate': (o, v) => o.endDate = v,
    'endDateWidth': (o, v) => o.endDate = v,
    'aatStatus': (o, v) => o.aatStatus = v,
    'aatStatusWidth': (o, v) => o.aatStatusWidth = v,
    'bundles': (o, v) => o.bundles = v,
    'bundlesWidth': (o, v) => o.bundlesWidth = v,
    evt: (o, v) => null,
    'style': (o, m) => {
      //if (isBlank(m)) return;
      // HACK
      MapWrapper.forEach(m, function(v, k) {
        o.style.setProperty(k, v);
      });
    }
  });

  reflector.registerMethods({
    'onScroll': (o, args) => {
      // HACK
      o.onScroll(args[0]);
    },
    'setStage': (o, args) => o.setStage(args[0])
  });
}

export function setupReflectorForAngular() {
  reflector.registerType(If, {
    'factory': (vp) => new If(vp),
    'parameters': [[ViewContainer]],
    'annotations' : [new Viewport({
      selector: '[if]',
      bind: {
        'if': 'condition'
      }
    })]
  });

  reflector.registerType(Foreach, {
    'factory': (vp) => new Foreach(vp),
    'parameters': [[ViewContainer]],
    'annotations' : [new Viewport({
      selector: '[foreach]',
      lifecycle: [onChange],
      bind: {
        'in': 'iterable[]'
      }
    })]
  });

  reflector.registerType(Compiler, {
    "factory": (changeDetection, templateLoader, reader, parser, compilerCache, shadowDomStrategy,
      resolver) =>
      new Compiler(changeDetection, templateLoader, reader, parser, compilerCache, shadowDomStrategy,
        resolver),
    "parameters": [[ChangeDetection], [TemplateLoader], [DirectiveMetadataReader], [Parser],
                   [CompilerCache], [ShadowDomStrategy], [TemplateResolver]],
    "annotations": []
  });

  reflector.registerType(CompilerCache, {
    'factory': () => new CompilerCache(),
    'parameters': [],
    'annotations': []
  });

  reflector.registerType(Parser, {
    'factory': (lexer) => new Parser(lexer),
    'parameters': [[Lexer]],
    'annotations': []
  });

  reflector.registerType(TemplateLoader, {
    "factory": (xhr) => new TemplateLoader(xhr),
    "parameters": [[XHR]],
    "annotations": []
  });

  reflector.registerType(TemplateResolver, {
    "factory": () => new TemplateResolver(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(XHR, {
    "factory": () => new XHRImpl(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(DirectiveMetadataReader, {
    'factory': () => new DirectiveMetadataReader(),
    'parameters': [],
    'annotations': []
  });

  reflector.registerType(Lexer, {
    'factory': () => new Lexer(),
    'parameters': [],
    'annotations': []
  });

  reflector.registerType(LifeCycle, {
    "factory": (cd) => new LifeCycle(cd),
    "parameters": [[ChangeDetector]],
    "annotations": []
  });

  reflector.registerType(ShadowDomStrategy, {
    "factory": () => new NativeShadowDomStrategy(),
    "parameters": [],
    "annotations": []
  });

}

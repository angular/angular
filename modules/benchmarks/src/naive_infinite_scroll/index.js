import {int, isBlank} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {MapWrapper} from 'angular2/src/facade/collection';

import {Parser, Lexer, ChangeDetector, ChangeDetection}
    from 'angular2/change_detection';
import {ExceptionHandler} from 'angular2/src/core/exception_handler';
import {
  bootstrap, Component, Viewport, Template, ViewContainer, Compiler, onChange, NgElement, Decorator
}  from 'angular2/angular2';
import {reflector} from 'angular2/src/reflection/reflection';
import {CompilerCache} from 'angular2/src/core/compiler/compiler';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {ShadowDomStrategy, NativeShadowDomStrategy, EmulatedUnscopedShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {Content} from 'angular2/src/core/compiler/shadow_dom_emulation/content_tag';
import {DestinationLightDom} from 'angular2/src/core/compiler/shadow_dom_emulation/light_dom';
import {TemplateLoader} from 'angular2/src/core/compiler/template_loader';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';
import {XHR} from 'angular2/src/core/compiler/xhr/xhr';
import {XHRImpl} from 'angular2/src/core/compiler/xhr/xhr_impl';
import {UrlResolver} from 'angular2/src/core/compiler/url_resolver';
import {StyleUrlResolver} from 'angular2/src/core/compiler/style_url_resolver';
import {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {StyleInliner} from 'angular2/src/core/compiler/style_inliner';
import {CssProcessor} from 'angular2/src/core/compiler/css_processor';

import {If, For} from 'angular2/directives';
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
    'iterableChanges': (o) => o.iterableChanges,
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
    'iterableChanges': (o, v) => o.iterableChanges = v,
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
    'if': (o, v) => {},
    'of': (o, v) => {},
    'cellWidth': (o, v) => o.cellWidth = v,
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
        'condition': 'if'
      }
    })]
  });

  reflector.registerType(For, {
    'factory': (vp) => new For(vp),
    'parameters': [[ViewContainer]],
    'annotations' : [new Viewport({
      selector: '[for]',
      bind: {
        'iterableChanges': 'of | iterableDiff'
      }
    })]
  });

  reflector.registerType(Compiler, {
    "factory": (changeDetection, templateLoader, reader, parser, compilerCache, shadowDomStrategy,
      tplResolver, cmpUrlMapper, urlResolver, cssProcessor) =>
      new Compiler(changeDetection, templateLoader, reader, parser, compilerCache, shadowDomStrategy,
        tplResolver, cmpUrlMapper, urlResolver, cssProcessor),
    "parameters": [[ChangeDetection], [TemplateLoader], [DirectiveMetadataReader], [Parser],
                   [CompilerCache], [ShadowDomStrategy], [TemplateResolver], [ComponentUrlMapper],
                   [UrlResolver], [CssProcessor]],
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
    "factory": (xhr, urlResolver) => new TemplateLoader(xhr, urlResolver),
    "parameters": [[XHR], [UrlResolver]],
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

  reflector.registerType(ExceptionHandler, {
    "factory": () => new ExceptionHandler(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(LifeCycle, {
    "factory": (exHandler, cd) => new LifeCycle(exHandler, cd),
    "parameters": [[ExceptionHandler], [ChangeDetector]],
    "annotations": []
  });

  reflector.registerType(ShadowDomStrategy, {
    "factory": (strategy) => strategy,
    "parameters": [[NativeShadowDomStrategy]],
    "annotations": []
  });

  reflector.registerType(NativeShadowDomStrategy, {
    "factory": (styleUrlResolver) => new NativeShadowDomStrategy(styleUrlResolver),
    "parameters": [[StyleUrlResolver]],
    "annotations": []
  });

  reflector.registerType(EmulatedUnscopedShadowDomStrategy, {
    "factory": (styleUrlResolver) => new EmulatedUnscopedShadowDomStrategy(styleUrlResolver, null),
    "parameters": [[StyleUrlResolver]],
    "annotations": []
  });

  reflector.registerType(StyleUrlResolver, {
    "factory": (urlResolver) => new StyleUrlResolver(urlResolver),
    "parameters": [[UrlResolver]],
    "annotations": []
  });

  reflector.registerType(UrlResolver, {
    "factory": () => new UrlResolver(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(ComponentUrlMapper, {
    "factory": () => new ComponentUrlMapper(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(Content, {
    "factory": (lightDom, el) => new Content(lightDom, el),
    "parameters": [[DestinationLightDom], [NgElement]],
    "annotations" : [new Decorator({selector: '[content]'})]
  });

  reflector.registerType(StyleInliner, {
    "factory": (xhr, styleUrlResolver, urlResolver) =>
      new StyleInliner(xhr, styleUrlResolver, urlResolver),
    "parameters": [[XHR], [StyleUrlResolver], [UrlResolver]],
    "annotations": []
  });

  reflector.registerType(CssProcessor, {
    "factory": () => new CssProcessor(null),
    "parameters": [],
    "annotations": []
  });
}

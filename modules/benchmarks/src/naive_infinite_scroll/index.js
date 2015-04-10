import {int, isBlank} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {MapWrapper} from 'angular2/src/facade/collection';

import {Parser, Lexer, ChangeDetector, ChangeDetection}
    from 'angular2/change_detection';
import {ExceptionHandler} from 'angular2/src/core/exception_handler';
import {
  bootstrap, Component, Viewport, View, ViewContainer, Compiler, onChange, NgElement, Decorator
}  from 'angular2/angular2';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';
import {CompilerCache} from 'angular2/src/core/compiler/compiler';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {ShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/shadow_dom_strategy';
import {NativeShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/native_shadow_dom_strategy';
import {EmulatedUnscopedShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/emulated_unscoped_shadow_dom_strategy';
import {TemplateLoader} from 'angular2/src/render/dom/compiler/template_loader';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';
import {XHR} from 'angular2/src/services/xhr';
import {XHRImpl} from 'angular2/src/services/xhr_impl';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {StyleUrlResolver} from 'angular2/src/render/dom/shadow_dom/style_url_resolver';
import {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {StyleInliner} from 'angular2/src/render/dom/shadow_dom/style_inliner';
import {DynamicComponentLoader} from 'angular2/src/core/compiler/dynamic_component_loader';
import {TestabilityRegistry, Testability} from 'angular2/src/core/testability/testability';

import {If, For} from 'angular2/directives';
import {App} from './app';
import {ScrollAreaComponent} from './scroll_area';
import {ScrollItemComponent} from './scroll_item';
import {CompanyNameComponent, OpportunityNameComponent, OfferingNameComponent,
    AccountCellComponent, StageButtonsComponent, FormattedCellComponent}
        from './cells';

import {EventManager} from 'angular2/src/render/dom/events/event_manager';
import {ViewFactory, VIEW_POOL_CAPACITY} from 'angular2/src/core/compiler/view_factory';
import {ProtoViewFactory} from 'angular2/src/core/compiler/proto_view_factory';
import {Renderer} from 'angular2/src/render/api';
import {DirectDomRenderer} from 'angular2/src/render/dom/direct_dom_renderer';
import * as rc from 'angular2/src/render/dom/compiler/compiler';
import * as rvf from 'angular2/src/render/dom/view/view_factory';
import {Inject, bind} from 'angular2/di';

export function main() {
  setupReflector();
  bootstrap(App, createBindings());
}

function createBindings():List {
  return [bind(VIEW_POOL_CAPACITY).toValue(100000)];
}

export function setupReflector() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();

  // TODO(kegluneq): Generate this.
  reflector.registerSetters({
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

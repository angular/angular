import {Injector, bind, Injectable} from 'angular2/di';

import {Type, isPresent, BaseException} from 'angular2/src/facade/lang';
import {Promise} from 'angular2/src/facade/async';
import {isBlank} from 'angular2/src/facade/lang';
import {List} from 'angular2/src/facade/collection';

import {View} from 'angular2/src/core/annotations_impl/view';

import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';
import {AppView} from 'angular2/src/core/compiler/view';
import {internalView} from 'angular2/src/core/compiler/view_ref';
import {
  DynamicComponentLoader,
  ComponentRef
} from 'angular2/src/core/compiler/dynamic_component_loader';

import {queryView, viewRootNodes, el} from './utils';
import {instantiateType, getTypeOf} from './lang_utils';

import {DOCUMENT_TOKEN} from 'angular2/src/render/dom/dom_renderer';
import {DOM} from 'angular2/src/dom/dom_adapter';

/**
 * @exportedAs angular2/test
 * TODO(juliemr): Deprecate in favor of TestComponentBuilder
 */
@Injectable()
export class TestBed {
  _injector: Injector;

  constructor(injector: Injector) { this._injector = injector; }

  /**
   * Overrides the {@link View} of a {@link Component}.
   *
   * @see setInlineTemplate() to only override the html
   *
   * @param {Type} component
   * @param {ViewDefinition} template
   */
  overrideView(component: Type, template: View): void {
    this._injector.get(TemplateResolver).setView(component, template);
  }

  /**
   * Overrides only the html of a {@link Component}.
   * All the other propoerties of the component's {@link View} are preserved.
   *
   * @param {Type} component
   * @param {string} html
   */
  setInlineTemplate(component: Type, html: string): void {
    this._injector.get(TemplateResolver).setInlineTemplate(component, html);
  }

  /**
   * Overrides the directives from the component {@link View}.
   *
   * @param {Type} component
   * @param {Type} from
   * @param {Type} to
   */
  overrideDirective(component: Type, from: Type, to: Type): void {
    this._injector.get(TemplateResolver).overrideViewDirective(component, from, to);
  }

  /**
   * Creates an `AppView` for the given component.
   *
   * Only either a component or a context needs to be specified but both can be provided for
   * advanced use cases (ie subclassing the context).
   *
   * @param {Type} component
   * @param {*} context
   * @param {string} html Use as the component template when specified (shortcut for
   * setInlineTemplate)
   * @return {Promise<ViewProxy>}
   */
  createView(component: Type,
             {context = null, html = null}: {context?: any,
                                             html?: string} = {}): Promise<ViewProxy> {
    if (isBlank(component) && isBlank(context)) {
      throw new BaseException('You must specified at least a component or a context');
    }

    if (isBlank(component)) {
      component = getTypeOf(context);
    } else if (isBlank(context)) {
      context = instantiateType(component);
    }

    if (isPresent(html)) {
      this.setInlineTemplate(component, html);
    }

    var doc = this._injector.get(DOCUMENT_TOKEN);
    var rootEl = el('<div id="root"></div>');
    DOM.appendChild(doc.body, rootEl);

    var componentBinding = bind(component).toValue(context);
    return this._injector.get(DynamicComponentLoader)
        .loadAsRoot(componentBinding, '#root', this._injector)
        .then((hostComponentRef) => { return new ViewProxy(hostComponentRef); });
  }
}

/**
 * Proxy to `AppView` return by `createView` in {@link TestBed} which offers a high level API for
 * tests.
 * TODO(juliemr): Deprecate in favor of TestElement
 */
export class ViewProxy {
  _componentRef: ComponentRef;
  _view: AppView;

  constructor(componentRef: ComponentRef) {
    this._componentRef = componentRef;
    this._view = internalView(componentRef.hostView).componentChildViews[0];
  }

  get context(): any { return this._view.context; }

  get rootNodes(): List</*node*/ any> { return viewRootNodes(this._view); }

  detectChanges(): void {
    this._view.changeDetector.detectChanges();
    this._view.changeDetector.checkNoChanges();
  }

  querySelector(selector): any { return queryView(this._view, selector); }

  destroy() { this._componentRef.dispose(); }

  /**
   * @returns `AppView` returns the underlying `AppView`.
   *
   * Prefer using the other methods which hide implementation details.
   */
  get rawView(): AppView { return this._view; }
}

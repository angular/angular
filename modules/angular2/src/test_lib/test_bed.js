import {Injector, bind} from 'angular2/di';

import {Type, isPresent, BaseException} from 'angular2/src/facade/lang';
import {Promise} from 'angular2/src/facade/async';
import {isBlank} from 'angular2/src/facade/lang';
import {List} from 'angular2/src/facade/collection';

import {View} from 'angular2/src/core/annotations/view';

import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';
import {Compiler} from 'angular2/src/core/compiler/compiler';
import {AppView} from 'angular2/src/core/compiler/view';
import {ViewFactory} from 'angular2/src/core/compiler/view_factory';
import {AppViewHydrator} from 'angular2/src/core/compiler/view_hydrator';

import {DirectiveBinding} from 'angular2/src/core/compiler/element_injector';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';

import {queryView, viewRootNodes, el} from './utils';
import {instantiateType, getTypeOf} from './lang_utils';

/**
 * @exportedAs angular2/test
 */
export class TestBed {
  _injector: Injector;

  constructor(injector: Injector) {
    this._injector = injector;
  }

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
    this._injector.get(TemplateResolver).overrideTemplateDirective(component, from, to);
  }

  /**
   * Creates an `AppView` for the given component.
   *
   * Only either a component or a context needs to be specified but both can be provided for
   * advanced use cases (ie subclassing the context).
   *
   * @param {Type} component
   * @param {*} context
   * @param {string} html Use as the component template when specified (shortcut for setInlineTemplate)
   * @return {Promise<ViewProxy>}
   */
  createView(component: Type,
             {context = null, html = null}: {context:any, html: string} = {}): Promise<AppView> {

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

    var rootEl = el('<div></div>');
    var metadataReader = this._injector.get(DirectiveMetadataReader);
    var componentBinding = DirectiveBinding.createFromBinding(
      bind(component).toValue(context),
      metadataReader.read(component).annotation
    );
    return this._injector.get(Compiler).compileInHost(componentBinding).then((pv) => {
      var viewFactory = this._injector.get(ViewFactory);
      var viewHydrator = this._injector.get(AppViewHydrator);
      var hostView = viewFactory.getView(pv);
      viewHydrator.hydrateInPlaceHostView(null, rootEl, hostView, this._injector);

      return new ViewProxy(this._injector, hostView.componentChildViews[0]);
    });
  }
}

/**
 * Proxy to `AppView` return by `createView` in {@link TestBed} which offers a high level API for tests.
 */
export class ViewProxy {
  _view: AppView;
  _injector: Injector;

  constructor(injector: Injector, view: AppView) {
    this._view = view;
    this._injector = injector;
  }

  get context(): any {
    return this._view.context;
  }

  get rootNodes(): List {
    return viewRootNodes(this._view);
  }

  detectChanges(): void {
    this._view.changeDetector.detectChanges();
  }

  querySelector(selector) {
    return queryView(this._view, selector);
  }

  destroy() {
    var viewHydrator = this._injector.get(AppViewHydrator);
    viewHydrator.dehydrateInPlaceHostView(null, this._view);
  }

  /**
   * @returns `AppView` returns the underlying `AppView`.
   *
   * Prefer using the other methods which hide implementation details.
   */
  get rawView(): AppView {
    return this._view;
  }
}

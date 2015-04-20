import {Injectable, Inject, OpaqueToken} from 'angular2/di';
import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';
import * as eli from './element_injector';
import {isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import {NgElement} from 'angular2/src/core/compiler/ng_element';
import * as viewModule from './view';
import {Renderer} from 'angular2/src/render/api';

// TODO(tbosch): Make this an OpaqueToken as soon as our transpiler supports this!
export const VIEW_POOL_CAPACITY = 'ViewFactory.viewPoolCapacity';

@Injectable()
export class ViewFactory {
  _poolCapacityPerProtoView:number;
  _pooledViewsPerProtoView:Map<viewModule.AppProtoView, List<viewModule.AppView>>;
  _renderer:Renderer;

  constructor(@Inject(VIEW_POOL_CAPACITY) poolCapacityPerProtoView, renderer:Renderer) {
    this._poolCapacityPerProtoView = poolCapacityPerProtoView;
    this._pooledViewsPerProtoView = MapWrapper.create();
    this._renderer = renderer;
  }

  getView(protoView:viewModule.AppProtoView):viewModule.AppView {
    var pooledViews = MapWrapper.get(this._pooledViewsPerProtoView, protoView);
    if (isPresent(pooledViews) && pooledViews.length > 0) {
      return ListWrapper.removeLast(pooledViews);
    }
    return this._createView(protoView);
  }

  returnView(view:viewModule.AppView) {
    if (view.hydrated()) {
      throw new BaseException('Only dehydrated Views can be put back into the pool!');
    }
    var protoView = view.proto;
    var pooledViews = MapWrapper.get(this._pooledViewsPerProtoView, protoView);
    if (isBlank(pooledViews)) {
      pooledViews = [];
      MapWrapper.set(this._pooledViewsPerProtoView, protoView, pooledViews);
    }
    if (pooledViews.length < this._poolCapacityPerProtoView) {
      ListWrapper.push(pooledViews, view);
    }
  }

  _createView(protoView:viewModule.AppProtoView): viewModule.AppView {
    var view = new viewModule.AppView(this._renderer, this, protoView, protoView.protoLocals);
    var changeDetector = protoView.protoChangeDetector.instantiate(view, protoView.bindings,
      protoView.getVariableBindings(), protoView.getdirectiveRecords());

    var binders = protoView.elementBinders;
    var elementInjectors = ListWrapper.createFixedSize(binders.length);
    var rootElementInjectors = [];
    var preBuiltObjects = ListWrapper.createFixedSize(binders.length);
    var componentChildViews = ListWrapper.createFixedSize(binders.length);

    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      var elementInjector = null;

      // elementInjectors and rootElementInjectors
      var protoElementInjector = binder.protoElementInjector;
      if (isPresent(protoElementInjector)) {
        if (isPresent(protoElementInjector.parent)) {
          var parentElementInjector = elementInjectors[protoElementInjector.parent.index];
          elementInjector = protoElementInjector.instantiate(parentElementInjector);
        } else {
          elementInjector = protoElementInjector.instantiate(null);
          ListWrapper.push(rootElementInjectors, elementInjector);
        }
      }
      elementInjectors[binderIdx] = elementInjector;

      // componentChildViews
      var childChangeDetector = null;
      if (binder.hasStaticComponent()) {
        var childView = this._createView(binder.nestedProtoView);
        childChangeDetector = childView.changeDetector;
        changeDetector.addShadowDomChild(childChangeDetector);

        componentChildViews[binderIdx] = childView;
      }

      // preBuiltObjects
      if (isPresent(elementInjector)) {
        preBuiltObjects[binderIdx] = new eli.PreBuiltObjects(view, new NgElement(view, binderIdx), childChangeDetector);
      }
    }

    view.init(changeDetector, elementInjectors, rootElementInjectors,
      preBuiltObjects, componentChildViews);

    return view;
  }

}

import {Injectable, Inject, OpaqueToken} from 'angular2/di';
import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';
import * as eli from './element_injector';
import {isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import {NgElement} from 'angular2/src/core/compiler/ng_element';
import * as vcModule from './view_container';
import * as viewModule from './view';
import {BindingPropagationConfig} from 'angular2/change_detection';

// TODO(tbosch): Make this an OpaqueToken as soon as our transpiler supports this!
export const VIEW_POOL_CAPACITY = 'ViewFactory.viewPoolCapacity';

@Injectable()
export class ViewFactory {
  _poolCapacity:number;
  _pooledViews:List<viewModule.View>;

  constructor(@Inject(VIEW_POOL_CAPACITY) capacity) {
    this._poolCapacity = capacity;
    this._pooledViews = ListWrapper.create();
  }

  getView(protoView:viewModule.ProtoView):viewModule.View {
    // TODO(tbosch): benchmark this scanning of views and maybe
    // replace it with a fancy LRU Map/List combination...
    var view;
    for (var i=this._pooledViews.length-1; i>=0; i--) {
      var pooledView = this._pooledViews[i];
      if (pooledView.proto === protoView) {
        view = ListWrapper.removeAt(this._pooledViews, i);
      }
    }
    if (isBlank(view)) {
      view = this._createView(protoView);
    }
    return view;
  }

  returnView(view:viewModule.View) {
    if (view.hydrated()) {
      throw new BaseException('Only dehydrated Views can be put back into the pool!');
    }
    ListWrapper.push(this._pooledViews, view);
    while (this._pooledViews.length > this._poolCapacity) {
      ListWrapper.removeAt(this._pooledViews, 0);
    }
  }

  _createView(protoView:viewModule.ProtoView): viewModule.View {
    var view = new viewModule.View(protoView, protoView.protoLocals);
    var changeDetector = protoView.protoChangeDetector.instantiate(view, protoView.bindingRecords,
      protoView.getVariableBindings(), protoView.getDirectiveMementos());

    var binders = protoView.elementBinders;
    var elementInjectors = ListWrapper.createFixedSize(binders.length);
    var rootElementInjectors = [];
    var preBuiltObjects = ListWrapper.createFixedSize(binders.length);
    var viewContainers = ListWrapper.createFixedSize(binders.length);
    var componentChildViews = [];

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
      var bindingPropagationConfig = null;
      if (isPresent(binder.nestedProtoView) && isPresent(binder.componentDirective)) {
        var childView = this._createView(binder.nestedProtoView);
        changeDetector.addChild(childView.changeDetector);

        bindingPropagationConfig = new BindingPropagationConfig(childView.changeDetector);

        ListWrapper.push(componentChildViews, childView);
      }

      // viewContainers
      var viewContainer = null;
      if (isPresent(binder.viewportDirective)) {
        viewContainer = new vcModule.ViewContainer(this, view, binder.nestedProtoView, elementInjector);
      }
      viewContainers[binderIdx] = viewContainer;

      // preBuiltObjects
      if (isPresent(elementInjector)) {
        preBuiltObjects[binderIdx] = new eli.PreBuiltObjects(view, new NgElement(view, binderIdx), viewContainer,
          bindingPropagationConfig);
      }
    }

    view.init(changeDetector, elementInjectors, rootElementInjectors,
      viewContainers, preBuiltObjects, componentChildViews);

    return view;
  }

}
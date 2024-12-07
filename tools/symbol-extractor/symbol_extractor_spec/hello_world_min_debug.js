/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

!(function () {
  'use strict';
  /**
   *@license
   *Copyright Google Inc. All Rights Reserved.
   *
   *Use of this source code is governed by an MIT-style license that can be
   *found in the LICENSE file at https://angular.dev/license
   */
  /**
   *@license
   *Copyright Google Inc. All Rights Reserved.
   *
   *Use of this source code is governed by an MIT-style license that can be
   *found in the LICENSE file at https://angular.dev/license
   */
  var ChangeDetectionStrategy, ChangeDetectorStatus, ViewEncapsulation;
  Object;
  ChangeDetectionStrategy || (ChangeDetectionStrategy = {});
  ChangeDetectorStatus || (ChangeDetectorStatus = {});
  /**
   * @license
   * Copyright Google LLC All Rights Reserved.
   *
   * Use of this source code is governed by an MIT-style license that can be
   * found in the LICENSE file at https://angular.dev/license
   */
  Object;
  ViewEncapsulation || (ViewEncapsulation = {});
  /**
   *@license
   *Copyright Google Inc. All Rights Reserved.
   *
   *Use of this source code is governed by an MIT-style license that can be
   *found in the LICENSE file at https://angular.dev/license
   */
  /**
   * @license
   * Copyright Google LLC All Rights Reserved.
   *
   * Use of this source code is governed by an MIT-style license that can be
   * found in the LICENSE file at https://angular.dev/license
   */ 'undefined' != typeof window && window,
    'undefined' != typeof self &&
      'undefined' != typeof WorkerGlobalScope &&
      self instanceof WorkerGlobalScope &&
      self,
    'undefined' != typeof global && global;
  /**
   *@license
   *Copyright Google Inc. All Rights Reserved.
   *
   *Use of this source code is governed by an MIT-style license that can be
   *found in the LICENSE file at https://angular.dev/license
   */
  String;
  /**
   *@license
   *Copyright Google Inc. All Rights Reserved.
   *
   *Use of this source code is governed by an MIT-style license that can be
   *found in the LICENSE file at https://angular.dev/license
   */
  Function;
  var __window$1 = 'undefined' != typeof window && window,
    __self$1 =
      'undefined' != typeof self &&
      'undefined' != typeof WorkerGlobalScope &&
      self instanceof WorkerGlobalScope &&
      self,
    __global$1 = 'undefined' != typeof global && global,
    _root = __window$1 || __global$1 || __self$1;
  !(function () {
    if (!_root) throw new Error('RxJS could not find any global context (window, self, global)');
  })();
  Array;
  !(function () {
    Object.setPrototypeOf || Array;
  })();
  Error;
  var RendererStyleFlags2,
    Symbol$1 = _root.Symbol;
  'function' == typeof Symbol$1 &&
    'function' == typeof Symbol$1.for &&
    Symbol$1.for('rxSubscriber'),
    (function () {
      Object.setPrototypeOf || Array;
    })();
  !(function (context) {
    var $$observable,
      Symbol = _root.Symbol;
    if ('function' == typeof Symbol)
      if (Symbol.observable) $$observable = Symbol.observable;
      else {
        $$observable = Symbol('observable');
        Symbol.observable = $$observable;
      }
    else $$observable = '@@observable';
  })();
  (function () {
    Object.setPrototypeOf || Array;
  })(),
    (function () {
      Object.setPrototypeOf || Array;
    })();
  !(function () {
    Object.setPrototypeOf || Array;
  })();
  (function (root) {
    var Symbol = root.Symbol;
    if ('function' == typeof Symbol) {
      Symbol.iterator || (Symbol.iterator = Symbol('iterator polyfill'));
      return Symbol.iterator;
    }
    var Set_1 = root.Set;
    if (Set_1 && 'function' == typeof new Set_1()['@@iterator']) return '@@iterator';
    var Map_1 = root.Map;
    if (Map_1)
      for (var keys = Object.getOwnPropertyNames(Map_1.prototype), i = 0; i < keys.length; ++i) {
        var key = keys[i];
        if ('entries' !== key && 'size' !== key && Map_1.prototype[key] === Map_1.prototype.entries)
          return key;
      }
  })(_root),
    (function () {
      Object.setPrototypeOf || Array;
    })();
  (function () {
    Object.setPrototypeOf || Array;
  })(),
    (function () {
      Object.setPrototypeOf || Array;
    })();
  !(function () {
    Object.setPrototypeOf || Array;
  })();
  Error,
    (function () {
      Object.setPrototypeOf || Array;
    })(),
    (function () {
      Object.setPrototypeOf || Array;
    })(),
    (function () {
      Object.setPrototypeOf || Array;
    })();
  !(function () {
    Object.setPrototypeOf || Array;
  })();
  Object;
  RendererStyleFlags2 || (RendererStyleFlags2 = {});
  var RendererStyleFlags3,
    _renderCompCount = 0;
  function executeHooks(data, allHooks, checkHooks, creationMode) {
    var hooksToCall = creationMode ? allHooks : checkHooks;
    null != hooksToCall &&
      (function (data, arr) {
        for (var i = 0; i < arr.length; i += 2) arr[1 | i].call(data[arr[i]]);
      })(
        /**
         * @license
         * Copyright Google LLC All Rights Reserved.
         *
         * Use of this source code is governed by an MIT-style license that can be
         * found in the LICENSE file at https://angular.dev/license
         */
        /**
         * @license
         * Copyright Google LLC All Rights Reserved.
         *
         * Use of this source code is governed by an MIT-style license that can be
         * found in the LICENSE file at https://angular.dev/license
         */
        /**
         * @license
         * Copyright Google LLC All Rights Reserved.
         *
         * Use of this source code is governed by an MIT-style license that can be
         * found in the LICENSE file at https://angular.dev/license
         */
        /**
         * @license
         * Copyright Google LLC All Rights Reserved.
         *
         * Use of this source code is governed by an MIT-style license that can be
         * found in the LICENSE file at https://angular.dev/license
         */
        data,
        hooksToCall,
      );
  }
  RendererStyleFlags3 || (RendererStyleFlags3 = {});
  var domRendererFactory3 = {
    createRenderer: function (hostElement, rendererType) {
      return document;
    },
  };
  /**
   *@license
   *Copyright Google Inc. All Rights Reserved.
   *
   *Use of this source code is governed by an MIT-style license that can be
   *found in the LICENSE file at https://angular.dev/license
   */
  /**
   * @license
   * Copyright Google LLC All Rights Reserved.
   *
   * Use of this source code is governed by an MIT-style license that can be
   * found in the LICENSE file at https://angular.dev/license
   */
  function getNextLNodeWithProjection(node) {
    var pNextOrParent = node.pNextOrParent;
    return pNextOrParent ? (1 == (3 & pNextOrParent.flags) ? null : pNextOrParent) : node.next;
  }
  function getNextOrParentSiblingNode(initialNode, rootNode) {
    for (var node = initialNode, nextNode = getNextLNodeWithProjection(node); node && !nextNode; ) {
      if ((node = node.pNextOrParent || node.parent) === rootNode) return null;
      nextNode = node && getNextLNodeWithProjection(node);
    }
    return nextNode;
  }
  function findFirstRNode(rootNode) {
    for (var node = rootNode; node; ) {
      var type = 3 & node.flags,
        nextNode = null;
      if (3 === type) return node.native;
      if (0 === type) {
        var childContainerData = node.data;
        nextNode = childContainerData.views.length ? childContainerData.views[0].child : null;
      } else nextNode = 1 === type ? node.data.head : node.child;
      node = null === nextNode ? getNextOrParentSiblingNode(node, rootNode) : nextNode;
    }
    return null;
  }
  function canInsertNativeNode(parent, view) {
    return 3 == (3 & parent.flags) && (parent.view !== view || null === parent.data);
  }
  function stringify$1(value) {
    return 'function' == typeof value
      ? value.name || value
      : 'string' == typeof value
        ? value
        : null == value
          ? ''
          : '' + value;
  }
  /**
   *@license
   *Copyright Google Inc. All Rights Reserved.
   *
   *Use of this source code is governed by an MIT-style license that can be
   *found in the LICENSE file at https://angular.dev/license
   */
  var renderer,
    rendererFactory,
    previousOrParentNode,
    isParent,
    tData,
    currentView,
    currentQueries,
    creationMode,
    data,
    bindingIndex;
  currentView = createLView(null, null, createTView());
  function enterView(newView, host) {
    var oldView = currentView;
    data = newView.data;
    bindingIndex = newView.bindingStartIndex || 0;
    tData = newView.tView.data;
    creationMode = newView.creationMode;
    renderer = newView.renderer;
    if (null != host) {
      previousOrParentNode = host;
      isParent = !0;
    }
    currentView = newView;
    currentQueries = newView.queries;
    return oldView;
  }
  function leaveView(newView) {
    executeHooks(
      currentView.data,
      currentView.tView.viewHooks,
      currentView.tView.viewCheckHooks,
      creationMode,
    );
    currentView.creationMode = !1;
    currentView.lifecycleStage = 1;
    currentView.tView.firstCreatePass = !1;
    enterView(newView, null);
  }
  function createLView(viewId, renderer, tView, template, context) {
    void 0 === template && (template = null);
    void 0 === context && (context = null);
    return {
      parent: currentView,
      id: viewId,
      node: null,
      data: [],
      tView: tView,
      cleanup: null,
      renderer: renderer,
      child: null,
      tail: null,
      next: null,
      bindingStartIndex: null,
      creationMode: !0,
      template: template,
      context: context,
      dynamicViewCount: 0,
      lifecycleStage: 1,
      queries: null,
    };
  }
  function createLNode(index, type, native, state) {
    var parent = isParent
        ? previousOrParentNode
        : previousOrParentNode && previousOrParentNode.parent,
      queries =
        (isParent ? currentQueries : previousOrParentNode && previousOrParentNode.queries) ||
        (parent && parent.queries && parent.queries.child()),
      isState = null != state,
      node = {
        flags: type,
        native: native,
        view: currentView,
        parent: parent,
        child: null,
        next: null,
        nodeInjector: parent ? parent.nodeInjector : null,
        data: isState ? state : null,
        queries: queries,
        tNode: null,
        pNextOrParent: null,
      };
    2 == (2 & type) && isState && (state.node = node);
    if (null != index) {
      data[index] = node;
      index >= tData.length ? (tData[index] = null) : (node.tNode = tData[index]);
      if (isParent) {
        currentQueries = null;
        (previousOrParentNode.view !== currentView && 2 != (3 & previousOrParentNode.flags)) ||
          (previousOrParentNode.child = node);
      } else previousOrParentNode && (previousOrParentNode.next = node);
    }
    previousOrParentNode = node;
    isParent = !0;
    return node;
  }
  function renderEmbeddedTemplate(viewNode, template, context, renderer) {
    var _isParent = isParent,
      _previousOrParentNode = previousOrParentNode;
    try {
      isParent = !0;
      previousOrParentNode = null;
      var cm = !1;
      if (null == viewNode) {
        viewNode = createLNode(
          null,
          2,
          null,
          createLView(-1, renderer, createTView(), template, context),
        );
        cm = !0;
      }
      enterView(viewNode.data, viewNode);
      template(context, cm);
    } finally {
      refreshDynamicChildren();
      leaveView(currentView.parent);
      isParent = _isParent;
      previousOrParentNode = _previousOrParentNode;
    }
    return viewNode;
  }
  function renderComponentOrTemplate(node, hostView, componentOrContext, template) {
    var oldView = enterView(hostView, node);
    try {
      rendererFactory.begin && rendererFactory.begin();
      template
        ? template(componentOrContext, creationMode)
        : (function (directiveIndex, elementIndex) {
            !(function (currentView, tView, creationMode) {
              if (1 === currentView.lifecycleStage) {
                executeHooks(currentView.data, tView.initHooks, tView.checkHooks, creationMode);
                currentView.lifecycleStage = 2;
              }
            })(currentView, currentView.tView, creationMode);
            !(function (currentView, tView, creationMode) {
              if (currentView.lifecycleStage < 3) {
                executeHooks(
                  currentView.data,
                  tView.contentHooks,
                  tView.contentCheckHooks,
                  creationMode,
                );
                currentView.lifecycleStage = 3;
              }
            })(currentView, currentView.tView, creationMode);
            var template = tData[1].template;
            if (null != template) {
              var element = data[0],
                directive = getDirectiveInstance(data[1]),
                oldView = enterView(element.data, element);
              try {
                template(directive, creationMode);
              } finally {
                refreshDynamicChildren();
                leaveView(oldView);
              }
            }
          })();
    } finally {
      rendererFactory.end && rendererFactory.end();
      leaveView(oldView);
    }
  }
  function createTView() {
    return {
      data: [],
      firstCreatePass: !0,
      initHooks: null,
      checkHooks: null,
      contentHooks: null,
      contentCheckHooks: null,
      viewHooks: null,
      viewCheckHooks: null,
      destroyHooks: null,
      objectLiterals: null,
    };
  }
  function locateHostElement(factory, elementOrSelector) {
    rendererFactory = factory;
    var defaultRenderer = factory.createRenderer(null, null);
    return 'string' == typeof elementOrSelector
      ? defaultRenderer.selectRootElement
        ? defaultRenderer.selectRootElement(elementOrSelector)
        : defaultRenderer.querySelector(elementOrSelector)
      : elementOrSelector;
  }
  function refreshDynamicChildren() {
    for (var current = currentView.child; null !== current; current = current.next)
      if (0 !== current.dynamicViewCount && current.views)
        for (var container_1 = current, i = 0; i < container_1.views.length; i++) {
          var view = container_1.views[i];
          renderEmbeddedTemplate(view, view.data.template, view.data.context, renderer);
        }
  }
  var NO_CHANGE = {};
  function getDirectiveInstance(instanceOrArray) {
    return Array.isArray(instanceOrArray) ? instanceOrArray[0] : instanceOrArray;
  }
  var EMPTY$1 = {};
  function noop$2() {}
  function invertObject(obj) {
    if (null == obj) return EMPTY$1;
    var newObj = {};
    for (var minifiedKey in obj) newObj[obj[minifiedKey]] = minifiedKey;
    return newObj;
  }
  /**
   *@license
   *Copyright Google Inc. All Rights Reserved.
   *
   *Use of this source code is governed by an MIT-style license that can be
   *found in the LICENSE file at https://angular.dev/license
   */
  /**
   *@license
   *Copyright Google Inc. All Rights Reserved.
   *
   *Use of this source code is governed by an MIT-style license that can be
   *found in the LICENSE file at https://angular.dev/license
   */
  /**
   *@license
   *Copyright Google Inc. All Rights Reserved.
   *
   *Use of this source code is governed by an MIT-style license that can be
   *found in the LICENSE file at https://angular.dev/license
   */
  /**
   *@license
   *Copyright Google Inc. All Rights Reserved.
   *
   *Use of this source code is governed by an MIT-style license that can be
   *found in the LICENSE file at https://angular.dev/license
   */
  /**
   * @license
   * Copyright Google LLC All Rights Reserved.
   *
   * Use of this source code is governed by an MIT-style license that can be
   * found in the LICENSE file at https://angular.dev/license
   */
  Object;
  /**
   * @license
   * Copyright Google LLC All Rights Reserved.
   *
   * Use of this source code is governed by an MIT-style license that can be
   * found in the LICENSE file at https://angular.dev/license
   */
  !(
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.dev/license
     */
    (function (componentType, opts) {
      void 0 === opts && (opts = {});
      var component,
        rendererFactory = opts.rendererFactory || domRendererFactory3,
        componentDef = componentType.ɵcmp;
      componentDef.type != componentType && (componentDef.type = componentType);
      var hostNode = locateHostElement(rendererFactory, opts.host || componentDef.tag),
        oldView = enterView(
          createLView(
            -1,
            rendererFactory.createRenderer(hostNode, componentDef.rendererType),
            createTView(),
          ),
          null,
        );
      try {
        !(function (rNode, def) {
          !(function () {
            isParent = !1;
            previousOrParentNode = null;
          })();
          createLNode(
            0,
            3,
            rNode,
            createLView(
              -1,
              renderer,
              (function (template) {
                return template.ngPrivateData || (template.ngPrivateData = createTView());
              })(def.template),
            ),
          );
        })(hostNode, componentDef);
        component = getDirectiveInstance(
          (function (index, directive, directiveDef, queryName) {
            var instance,
              flags = previousOrParentNode.flags;
            0 == (4092 & flags) ? (flags = 4100 | (3 & flags)) : (flags += 4);
            previousOrParentNode.flags = flags;
            Object.defineProperty(directive, '__ngHostLNode__', {
              enumerable: !1,
              value: previousOrParentNode,
            });
            data[1] = instance = directive;
            if (1 >= tData.length) {
              tData[1] = directiveDef;
            }
            var diPublic = directiveDef.diPublic;
            diPublic && diPublic(directiveDef);
            var tNode = previousOrParentNode.tNode;
            tNode &&
              tNode.attrs &&
              (function (instance, inputs, tNode) {
                var directiveIndex = ((4092 & previousOrParentNode.flags) >> 2) - 1,
                  initialInputData = tNode.initialInputs;
                (void 0 === initialInputData || directiveIndex >= initialInputData.length) &&
                  (initialInputData = (function (directiveIndex, inputs, tNode) {
                    var initialInputData = tNode.initialInputs || (tNode.initialInputs = []);
                    initialInputData[directiveIndex] = null;
                    for (var attrs = tNode.attrs, i = 0; i < attrs.length; i += 2) {
                      var minifiedInputName = inputs[attrs[i]];
                      void 0 !== minifiedInputName &&
                        (
                          initialInputData[directiveIndex] ||
                          (initialInputData[directiveIndex] = [])
                        ).push(minifiedInputName, attrs[1 | i]);
                    }
                    return initialInputData;
                  })(directiveIndex, directiveDef.inputs, tNode));
                var initialInputs = initialInputData[directiveIndex];
                if (initialInputs)
                  for (var i = 0; i < initialInputs.length; i += 2)
                    instance[initialInputs[i]] = initialInputs[1 | i];
              })(instance, 0, tNode);
            !(
              /**
               * @license
               * Copyright Google LLC All Rights Reserved.
               *
               * Use of this source code is governed by an MIT-style license that can be
               * found in the LICENSE file at https://angular.dev/license
               */
              (function (index, onInit, doCheck, tView) {
                if (!0 === tView.firstCreatePass) {
                  null != onInit && (tView.initHooks || (tView.initHooks = [])).push(1, onInit);
                  if (null != doCheck) {
                    (tView.initHooks || (tView.initHooks = [])).push(1, doCheck);
                    (tView.checkHooks || (tView.checkHooks = [])).push(1, doCheck);
                  }
                }
              })(0, directiveDef.onInit, directiveDef.doCheck, currentView.tView)
            );
            return instance;
          })(0, componentDef.n(), componentDef),
        );
      } finally {
        leaveView(oldView);
      }
      opts.features &&
        opts.features.forEach(function (feature) {
          return feature(component, componentDef);
        });
      !(function (component) {
        var hostNode = component.__ngHostLNode__;
        renderComponentOrTemplate(hostNode, hostNode.view, component);
      })(
        /**
         * @license
         * Copyright Google LLC All Rights Reserved.
         *
         * Use of this source code is governed by an MIT-style license that can be
         * found in the LICENSE file at https://angular.dev/license
         */
        /**
         * @license
         * Copyright Google LLC All Rights Reserved.
         *
         * Use of this source code is governed by an MIT-style license that can be
         * found in the LICENSE file at https://angular.dev/license
         */
        component,
      );
    })(
      (function () {
        function HelloWorld() {
          this.name = 'World';
        }
        HelloWorld.ɵcmp = (function (componentDefinition) {
          var type = componentDefinition.type,
            def = {
              type: type,
              diPublic: null,
              n: componentDefinition.factory,
              tag: componentDefinition.tag || null,
              template: componentDefinition.template || null,
              h: componentDefinition.hostBindings || noop$2,
              inputs: invertObject(componentDefinition.inputs),
              outputs: invertObject(componentDefinition.outputs),
              methods: invertObject(componentDefinition.methods),
              rendererType:
                (function (type) {
                  if (type && '$$undefined' === type.id) {
                    var isFilled =
                      (null != type.encapsulation &&
                        type.encapsulation !== ViewEncapsulation.None) ||
                      type.styles.length ||
                      Object.keys(type.data).length;
                    type.id = isFilled ? 'c' + _renderCompCount++ : '$$empty';
                  }
                  type && '$$empty' === type.id && (type = null);
                  return type || null;
                })(componentDefinition.rendererType) || null,
              exportAs: componentDefinition.exportAs,
              onInit: type.prototype.ngOnInit || null,
              doCheck: type.prototype.ngDoCheck || null,
              afterContentInit: type.prototype.ngAfterContentInit || null,
              afterContentChecked: type.prototype.ngAfterContentChecked || null,
              afterViewInit: type.prototype.ngAfterViewInit || null,
              afterViewChecked: type.prototype.ngAfterViewChecked || null,
              onDestroy: type.prototype.ngOnDestroy || null,
            },
            feature = componentDefinition.features;
          feature &&
            feature.forEach(function (fn) {
              return fn(def);
            });
          return def;
        })({
          type: HelloWorld,
          tag: 'hello-world',
          factory: function () {
            return new HelloWorld();
          },
          template: function (ctx, cm) {
            cm &&
              (function (index, value) {
                createLNode(0, 3, null);
                isParent = !1;
              })();
            !(function (index, value) {
              var existingNode = data[0];
              if (existingNode.native)
                value !== NO_CHANGE &&
                  (renderer.setValue
                    ? renderer.setValue(existingNode.native, stringify$1(value))
                    : (existingNode.native.textContent = stringify$1(value)));
              else {
                existingNode.native = renderer.createText
                  ? renderer.createText(stringify$1(value))
                  : renderer.createTextNode(stringify$1(value));
                !(function (node, currentView) {
                  var parent = node.parent;
                  if (canInsertNativeNode(parent, currentView)) {
                    var nativeSibling = (function (node, stopNode) {
                        for (var currentNode = node; currentNode && null !== currentNode; ) {
                          var pNextOrParent = currentNode.pNextOrParent;
                          if (pNextOrParent) {
                            for (
                              var pNextOrParentType = 3 & pNextOrParent.flags;
                              1 !== pNextOrParentType;

                            ) {
                              if ((nativeNode = findFirstRNode(pNextOrParent))) return nativeNode;
                              pNextOrParent = pNextOrParent.pNextOrParent;
                            }
                            currentNode = pNextOrParent;
                          } else {
                            for (var currentSibling = currentNode.next; currentSibling; ) {
                              var nativeNode;
                              if ((nativeNode = findFirstRNode(currentSibling))) return nativeNode;
                              currentSibling = currentSibling.next;
                            }
                            var parentNode = currentNode.parent;
                            currentNode = null;
                            if (parentNode) {
                              var parentType = 3 & parentNode.flags;
                              (0 !== parentType && 2 !== parentType) || (currentNode = parentNode);
                            }
                          }
                        }
                        return null;
                      })(node),
                      renderer = currentView.renderer;
                    renderer.listen
                      ? renderer.insertBefore(parent.native, node.native, nativeSibling)
                      : parent.native.insertBefore(node.native, nativeSibling, !1);
                  }
                })(
                  /**
                   * @license
                   * Copyright Google LLC All Rights Reserved.
                   *
                   * Use of this source code is governed by an MIT-style license that can be
                   * found in the LICENSE file at https://angular.dev/license
                   */
                  /**
                   * @license
                   * Copyright Google LLC All Rights Reserved.
                   *
                   * Use of this source code is governed by an MIT-style license that can be
                   * found in the LICENSE file at https://angular.dev/license
                   */
                  existingNode,
                  currentView,
                );
              }
            })(
              0,
              (function (prefix, value, suffix) {
                return (function (value) {
                  if (creationMode) {
                    !(function () {
                      null == currentView.bindingStartIndex &&
                        (bindingIndex = currentView.bindingStartIndex = data.length);
                    })();
                    return (data[bindingIndex++] = value);
                  }
                  var changed =
                    value !== NO_CHANGE &&
                    (function (a, b) {
                      return !(a != a && value != value) && a !== value;
                    })(data[bindingIndex]);
                  changed && (data[bindingIndex] = value);
                  bindingIndex++;
                  return changed ? value : NO_CHANGE;
                })(value) === NO_CHANGE
                  ? NO_CHANGE
                  : 'Hello ' + stringify$1(value) + '!';
              })(0, ctx.name),
            );
          },
        });
        return HelloWorld;
      })(),
    )
  );
})();

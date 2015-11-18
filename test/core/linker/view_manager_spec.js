var testing_internal_1 = require('angular2/testing_internal');
var spies_1 = require('../spies');
var core_1 = require('angular2/core');
var view_ref_1 = require('angular2/src/core/linker/view_ref');
var template_ref_1 = require('angular2/src/core/linker/template_ref');
var api_1 = require('angular2/src/core/render/api');
var view_manager_1 = require('angular2/src/core/linker/view_manager');
var view_manager_utils_1 = require('angular2/src/core/linker/view_manager_utils');
var view_manager_utils_spec_1 = require('./view_manager_utils_spec');
function main() {
    // TODO(tbosch): add missing tests
    testing_internal_1.describe('AppViewManager', function () {
        var renderer;
        var utils;
        var viewListener;
        var viewPool;
        var linker;
        var manager;
        var createdRenderViews;
        function wrapPv(protoView) { return new view_ref_1.ProtoViewRef_(protoView); }
        function wrapView(view) { return new view_ref_1.ViewRef_(view); }
        function resetSpies() {
            viewListener.spy('onViewCreated').reset();
            viewListener.spy('onViewDestroyed').reset();
            renderer.spy('createView').reset();
            renderer.spy('destroyView').reset();
            renderer.spy('createRootHostView').reset();
            renderer.spy('setEventDispatcher').reset();
            renderer.spy('hydrateView').reset();
            renderer.spy('dehydrateView').reset();
            viewPool.spy('returnView').reset();
        }
        testing_internal_1.beforeEach(function () {
            renderer = new spies_1.SpyRenderer();
            utils = new view_manager_utils_1.AppViewManagerUtils();
            viewListener = new spies_1.SpyAppViewListener();
            viewPool = new spies_1.SpyAppViewPool();
            linker = new spies_1.SpyProtoViewFactory();
            manager = new view_manager_1.AppViewManager_(viewPool, viewListener, utils, renderer, linker);
            createdRenderViews = [];
            renderer.spy('createRootHostView')
                .andCallFake(function (_a, renderFragmentCount, _b) {
                var fragments = [];
                for (var i = 0; i < renderFragmentCount; i++) {
                    fragments.push(new api_1.RenderFragmentRef());
                }
                var rv = new api_1.RenderViewWithFragments(new api_1.RenderViewRef(), fragments);
                createdRenderViews.push(rv);
                return rv;
            });
            renderer.spy('createView')
                .andCallFake(function (_a, renderFragmentCount) {
                var fragments = [];
                for (var i = 0; i < renderFragmentCount; i++) {
                    fragments.push(new api_1.RenderFragmentRef());
                }
                var rv = new api_1.RenderViewWithFragments(new api_1.RenderViewRef(), fragments);
                createdRenderViews.push(rv);
                return rv;
            });
            viewPool.spy('returnView').andReturn(true);
        });
        testing_internal_1.describe('createRootHostView', function () {
            var hostProtoView;
            testing_internal_1.beforeEach(function () { hostProtoView = view_manager_utils_spec_1.createHostPv([view_manager_utils_spec_1.createNestedElBinder(view_manager_utils_spec_1.createComponentPv())]); });
            testing_internal_1.it('should initialize the ProtoView', function () {
                manager.createRootHostView(wrapPv(hostProtoView), null, null);
                testing_internal_1.expect(linker.spy('initializeProtoViewIfNeeded')).toHaveBeenCalledWith(hostProtoView);
            });
            testing_internal_1.it('should create the view', function () {
                var rootView = view_ref_1.internalView(manager.createRootHostView(wrapPv(hostProtoView), null, null));
                testing_internal_1.expect(rootView.proto).toBe(hostProtoView);
                testing_internal_1.expect(viewListener.spy('onViewCreated')).toHaveBeenCalledWith(rootView);
            });
            testing_internal_1.it('should hydrate the view', function () {
                var injector = core_1.Injector.resolveAndCreate([]);
                var rootView = view_ref_1.internalView(manager.createRootHostView(wrapPv(hostProtoView), null, injector));
                testing_internal_1.expect(rootView.hydrated()).toBe(true);
                testing_internal_1.expect(renderer.spy('hydrateView')).toHaveBeenCalledWith(rootView.render);
            });
            testing_internal_1.it('should create and set the render view using the component selector', function () {
                var rootView = view_ref_1.internalView(manager.createRootHostView(wrapPv(hostProtoView), null, null));
                testing_internal_1.expect(renderer.spy('createRootHostView'))
                    .toHaveBeenCalledWith(hostProtoView.render, hostProtoView.mergeInfo.embeddedViewCount + 1, 'someComponent');
                testing_internal_1.expect(rootView.render).toBe(createdRenderViews[0].viewRef);
                testing_internal_1.expect(rootView.renderFragment).toBe(createdRenderViews[0].fragmentRefs[0]);
            });
            testing_internal_1.it('should allow to override the selector', function () {
                var selector = 'someOtherSelector';
                view_ref_1.internalView(manager.createRootHostView(wrapPv(hostProtoView), selector, null));
                testing_internal_1.expect(renderer.spy('createRootHostView'))
                    .toHaveBeenCalledWith(hostProtoView.render, hostProtoView.mergeInfo.embeddedViewCount + 1, selector);
            });
            testing_internal_1.it('should set the event dispatcher', function () {
                var rootView = view_ref_1.internalView(manager.createRootHostView(wrapPv(hostProtoView), null, null));
                testing_internal_1.expect(renderer.spy('setEventDispatcher')).toHaveBeenCalledWith(rootView.render, rootView);
            });
        });
        testing_internal_1.describe('destroyRootHostView', function () {
            var hostProtoView;
            var hostView;
            var hostRenderViewRef;
            testing_internal_1.beforeEach(function () {
                hostProtoView = view_manager_utils_spec_1.createHostPv([view_manager_utils_spec_1.createNestedElBinder(view_manager_utils_spec_1.createComponentPv())]);
                hostView =
                    view_ref_1.internalView(manager.createRootHostView(wrapPv(hostProtoView), null, null));
                hostRenderViewRef = hostView.render;
            });
            testing_internal_1.it('should dehydrate', function () {
                manager.destroyRootHostView(wrapView(hostView));
                testing_internal_1.expect(hostView.hydrated()).toBe(false);
                testing_internal_1.expect(renderer.spy('dehydrateView')).toHaveBeenCalledWith(hostView.render);
            });
            testing_internal_1.it('should destroy the render view', function () {
                manager.destroyRootHostView(wrapView(hostView));
                testing_internal_1.expect(renderer.spy('destroyView')).toHaveBeenCalledWith(hostRenderViewRef);
                testing_internal_1.expect(viewListener.spy('onViewDestroyed')).toHaveBeenCalledWith(hostView);
            });
            testing_internal_1.it('should not return the view to the pool', function () {
                manager.destroyRootHostView(wrapView(hostView));
                testing_internal_1.expect(viewPool.spy('returnView')).not.toHaveBeenCalled();
            });
        });
        testing_internal_1.describe('createEmbeddedViewInContainer', function () {
            testing_internal_1.describe('basic functionality', function () {
                var hostView;
                var childProtoView;
                var vcRef;
                var templateRef;
                testing_internal_1.beforeEach(function () {
                    childProtoView = view_manager_utils_spec_1.createEmbeddedPv();
                    var hostProtoView = view_manager_utils_spec_1.createHostPv([view_manager_utils_spec_1.createNestedElBinder(view_manager_utils_spec_1.createComponentPv([view_manager_utils_spec_1.createNestedElBinder(childProtoView)]))]);
                    hostView =
                        view_ref_1.internalView(manager.createRootHostView(wrapPv(hostProtoView), null, null));
                    vcRef = hostView.elementRefs[1];
                    templateRef = new template_ref_1.TemplateRef_(hostView.elementRefs[1]);
                    resetSpies();
                });
                testing_internal_1.it('should initialize the ProtoView', function () {
                    manager.createEmbeddedViewInContainer(vcRef, 0, templateRef);
                    testing_internal_1.expect(linker.spy('initializeProtoViewIfNeeded')).toHaveBeenCalledWith(childProtoView);
                });
                testing_internal_1.describe('create the first view', function () {
                    testing_internal_1.it('should create an AppViewContainer if not yet existing', function () {
                        manager.createEmbeddedViewInContainer(vcRef, 0, templateRef);
                        testing_internal_1.expect(hostView.viewContainers[1]).toBeTruthy();
                    });
                    testing_internal_1.it('should use an existing nested view', function () {
                        var childView = view_ref_1.internalView(manager.createEmbeddedViewInContainer(vcRef, 0, templateRef));
                        testing_internal_1.expect(childView.proto).toBe(childProtoView);
                        testing_internal_1.expect(childView).toBe(hostView.views[2]);
                        testing_internal_1.expect(viewListener.spy('onViewCreated')).not.toHaveBeenCalled();
                        testing_internal_1.expect(renderer.spy('createView')).not.toHaveBeenCalled();
                    });
                    testing_internal_1.it('should attach the fragment', function () {
                        var childView = view_ref_1.internalView(manager.createEmbeddedViewInContainer(vcRef, 0, templateRef));
                        testing_internal_1.expect(childView.proto).toBe(childProtoView);
                        testing_internal_1.expect(hostView.viewContainers[1].views.length).toBe(1);
                        testing_internal_1.expect(hostView.viewContainers[1].views[0]).toBe(childView);
                        testing_internal_1.expect(renderer.spy('attachFragmentAfterElement'))
                            .toHaveBeenCalledWith(vcRef, childView.renderFragment);
                    });
                    testing_internal_1.it('should hydrate the view but not the render view', function () {
                        var childView = view_ref_1.internalView(manager.createEmbeddedViewInContainer(vcRef, 0, templateRef));
                        testing_internal_1.expect(childView.hydrated()).toBe(true);
                        testing_internal_1.expect(renderer.spy('hydrateView')).not.toHaveBeenCalled();
                    });
                    testing_internal_1.it('should not set the EventDispatcher', function () {
                        view_ref_1.internalView(manager.createEmbeddedViewInContainer(vcRef, 0, templateRef));
                        testing_internal_1.expect(renderer.spy('setEventDispatcher')).not.toHaveBeenCalled();
                    });
                });
                testing_internal_1.describe('create the second view', function () {
                    var firstChildView;
                    testing_internal_1.beforeEach(function () {
                        firstChildView =
                            view_ref_1.internalView(manager.createEmbeddedViewInContainer(vcRef, 0, templateRef));
                        resetSpies();
                    });
                    testing_internal_1.it('should create a new view', function () {
                        var childView = view_ref_1.internalView(manager.createEmbeddedViewInContainer(vcRef, 1, templateRef));
                        testing_internal_1.expect(childView.proto).toBe(childProtoView);
                        testing_internal_1.expect(childView).not.toBe(firstChildView);
                        testing_internal_1.expect(viewListener.spy('onViewCreated')).toHaveBeenCalledWith(childView);
                        testing_internal_1.expect(renderer.spy('createView'))
                            .toHaveBeenCalledWith(childProtoView.render, childProtoView.mergeInfo.embeddedViewCount + 1);
                        testing_internal_1.expect(childView.render).toBe(createdRenderViews[1].viewRef);
                        testing_internal_1.expect(childView.renderFragment).toBe(createdRenderViews[1].fragmentRefs[0]);
                    });
                    testing_internal_1.it('should attach the fragment', function () {
                        var childView = view_ref_1.internalView(manager.createEmbeddedViewInContainer(vcRef, 1, templateRef));
                        testing_internal_1.expect(childView.proto).toBe(childProtoView);
                        testing_internal_1.expect(hostView.viewContainers[1].views[1]).toBe(childView);
                        testing_internal_1.expect(renderer.spy('attachFragmentAfterFragment'))
                            .toHaveBeenCalledWith(firstChildView.renderFragment, childView.renderFragment);
                    });
                    testing_internal_1.it('should hydrate the view', function () {
                        var childView = view_ref_1.internalView(manager.createEmbeddedViewInContainer(vcRef, 1, templateRef));
                        testing_internal_1.expect(childView.hydrated()).toBe(true);
                        testing_internal_1.expect(renderer.spy('hydrateView')).toHaveBeenCalledWith(childView.render);
                    });
                    testing_internal_1.it('should set the EventDispatcher', function () {
                        var childView = view_ref_1.internalView(manager.createEmbeddedViewInContainer(vcRef, 1, templateRef));
                        testing_internal_1.expect(renderer.spy('setEventDispatcher'))
                            .toHaveBeenCalledWith(childView.render, childView);
                    });
                });
                testing_internal_1.describe('create another view when the first view has been returned', function () {
                    testing_internal_1.beforeEach(function () {
                        view_ref_1.internalView(manager.createEmbeddedViewInContainer(vcRef, 0, templateRef));
                        manager.destroyViewInContainer(vcRef, 0);
                        resetSpies();
                    });
                    testing_internal_1.it('should use an existing nested view', function () {
                        var childView = view_ref_1.internalView(manager.createEmbeddedViewInContainer(vcRef, 0, templateRef));
                        testing_internal_1.expect(childView.proto).toBe(childProtoView);
                        testing_internal_1.expect(childView).toBe(hostView.views[2]);
                        testing_internal_1.expect(viewListener.spy('onViewCreated')).not.toHaveBeenCalled();
                        testing_internal_1.expect(renderer.spy('createView')).not.toHaveBeenCalled();
                    });
                });
                testing_internal_1.describe('create a host view', function () {
                    testing_internal_1.it('should initialize the ProtoView', function () {
                        var newHostPv = view_manager_utils_spec_1.createHostPv([view_manager_utils_spec_1.createNestedElBinder(view_manager_utils_spec_1.createComponentPv())]);
                        manager.createHostViewInContainer(vcRef, 0, wrapPv(newHostPv), null);
                        testing_internal_1.expect(linker.spy('initializeProtoViewIfNeeded')).toHaveBeenCalledWith(newHostPv);
                    });
                    testing_internal_1.it('should always create a new view and not use the embedded view', function () {
                        var newHostPv = view_manager_utils_spec_1.createHostPv([view_manager_utils_spec_1.createNestedElBinder(view_manager_utils_spec_1.createComponentPv())]);
                        var newHostView = view_ref_1.internalView(manager.createHostViewInContainer(vcRef, 0, wrapPv(newHostPv), null));
                        testing_internal_1.expect(newHostView.proto).toBe(newHostPv);
                        testing_internal_1.expect(newHostView).not.toBe(hostView.views[2]);
                        testing_internal_1.expect(viewListener.spy('onViewCreated')).toHaveBeenCalledWith(newHostView);
                        testing_internal_1.expect(renderer.spy('createView'))
                            .toHaveBeenCalledWith(newHostPv.render, newHostPv.mergeInfo.embeddedViewCount + 1);
                    });
                });
            });
        });
        testing_internal_1.describe('destroyViewInContainer', function () {
            testing_internal_1.describe('basic functionality', function () {
                var hostView;
                var childProtoView;
                var vcRef;
                var templateRef;
                var firstChildView;
                testing_internal_1.beforeEach(function () {
                    childProtoView = view_manager_utils_spec_1.createEmbeddedPv();
                    var hostProtoView = view_manager_utils_spec_1.createHostPv([view_manager_utils_spec_1.createNestedElBinder(view_manager_utils_spec_1.createComponentPv([view_manager_utils_spec_1.createNestedElBinder(childProtoView)]))]);
                    hostView =
                        view_ref_1.internalView(manager.createRootHostView(wrapPv(hostProtoView), null, null));
                    vcRef = hostView.elementRefs[1];
                    templateRef = new template_ref_1.TemplateRef_(hostView.elementRefs[1]);
                    firstChildView =
                        view_ref_1.internalView(manager.createEmbeddedViewInContainer(vcRef, 0, templateRef));
                    resetSpies();
                });
                testing_internal_1.describe('destroy the first view', function () {
                    testing_internal_1.it('should dehydrate the app view but not the render view', function () {
                        manager.destroyViewInContainer(vcRef, 0);
                        testing_internal_1.expect(firstChildView.hydrated()).toBe(false);
                        testing_internal_1.expect(renderer.spy('dehydrateView')).not.toHaveBeenCalled();
                    });
                    testing_internal_1.it('should detach', function () {
                        manager.destroyViewInContainer(vcRef, 0);
                        testing_internal_1.expect(hostView.viewContainers[1].views).toEqual([]);
                        testing_internal_1.expect(renderer.spy('detachFragment'))
                            .toHaveBeenCalledWith(firstChildView.renderFragment);
                    });
                    testing_internal_1.it('should not return the view to the pool', function () {
                        manager.destroyViewInContainer(vcRef, 0);
                        testing_internal_1.expect(viewPool.spy('returnView')).not.toHaveBeenCalled();
                    });
                });
                testing_internal_1.describe('destroy another view', function () {
                    var secondChildView;
                    testing_internal_1.beforeEach(function () {
                        secondChildView =
                            view_ref_1.internalView(manager.createEmbeddedViewInContainer(vcRef, 1, templateRef));
                        resetSpies();
                    });
                    testing_internal_1.it('should dehydrate', function () {
                        manager.destroyViewInContainer(vcRef, 1);
                        testing_internal_1.expect(secondChildView.hydrated()).toBe(false);
                        testing_internal_1.expect(renderer.spy('dehydrateView')).toHaveBeenCalledWith(secondChildView.render);
                    });
                    testing_internal_1.it('should detach', function () {
                        manager.destroyViewInContainer(vcRef, 1);
                        testing_internal_1.expect(hostView.viewContainers[1].views[0]).toBe(firstChildView);
                        testing_internal_1.expect(renderer.spy('detachFragment'))
                            .toHaveBeenCalledWith(secondChildView.renderFragment);
                    });
                    testing_internal_1.it('should return the view to the pool', function () {
                        manager.destroyViewInContainer(vcRef, 1);
                        testing_internal_1.expect(viewPool.spy('returnView')).toHaveBeenCalledWith(secondChildView);
                    });
                });
            });
            testing_internal_1.describe('recursively destroy views in ViewContainers', function () {
                testing_internal_1.describe('destroy child views when a component is destroyed', function () {
                    var hostView;
                    var childProtoView;
                    var vcRef;
                    var templateRef;
                    var firstChildView;
                    var secondChildView;
                    testing_internal_1.beforeEach(function () {
                        childProtoView = view_manager_utils_spec_1.createEmbeddedPv();
                        var hostProtoView = view_manager_utils_spec_1.createHostPv([view_manager_utils_spec_1.createNestedElBinder(view_manager_utils_spec_1.createComponentPv([view_manager_utils_spec_1.createNestedElBinder(childProtoView)]))]);
                        hostView = view_ref_1.internalView(manager.createRootHostView(wrapPv(hostProtoView), null, null));
                        vcRef = hostView.elementRefs[1];
                        templateRef = new template_ref_1.TemplateRef_(hostView.elementRefs[1]);
                        firstChildView =
                            view_ref_1.internalView(manager.createEmbeddedViewInContainer(vcRef, 0, templateRef));
                        secondChildView =
                            view_ref_1.internalView(manager.createEmbeddedViewInContainer(vcRef, 1, templateRef));
                        resetSpies();
                    });
                    testing_internal_1.it('should dehydrate', function () {
                        manager.destroyRootHostView(wrapView(hostView));
                        testing_internal_1.expect(firstChildView.hydrated()).toBe(false);
                        testing_internal_1.expect(secondChildView.hydrated()).toBe(false);
                        testing_internal_1.expect(renderer.spy('dehydrateView')).toHaveBeenCalledWith(hostView.render);
                        testing_internal_1.expect(renderer.spy('dehydrateView')).toHaveBeenCalledWith(secondChildView.render);
                    });
                    testing_internal_1.it('should detach', function () {
                        manager.destroyRootHostView(wrapView(hostView));
                        testing_internal_1.expect(hostView.viewContainers[1].views).toEqual([]);
                        testing_internal_1.expect(renderer.spy('detachFragment'))
                            .toHaveBeenCalledWith(firstChildView.renderFragment);
                        testing_internal_1.expect(renderer.spy('detachFragment'))
                            .toHaveBeenCalledWith(secondChildView.renderFragment);
                    });
                    testing_internal_1.it('should return the view to the pool', function () {
                        manager.destroyRootHostView(wrapView(hostView));
                        testing_internal_1.expect(viewPool.spy('returnView')).not.toHaveBeenCalledWith(firstChildView);
                        testing_internal_1.expect(viewPool.spy('returnView')).toHaveBeenCalledWith(secondChildView);
                    });
                });
                testing_internal_1.describe('destroy child views over multiple levels', function () {
                    var hostView;
                    var childProtoView;
                    var nestedChildProtoView;
                    var vcRef;
                    var templateRef;
                    var nestedVcRefs;
                    var childViews;
                    var nestedChildViews;
                    testing_internal_1.beforeEach(function () {
                        nestedChildProtoView = view_manager_utils_spec_1.createEmbeddedPv();
                        childProtoView = view_manager_utils_spec_1.createEmbeddedPv([
                            view_manager_utils_spec_1.createNestedElBinder(view_manager_utils_spec_1.createComponentPv([view_manager_utils_spec_1.createNestedElBinder(nestedChildProtoView)]))
                        ]);
                        var hostProtoView = view_manager_utils_spec_1.createHostPv([view_manager_utils_spec_1.createNestedElBinder(view_manager_utils_spec_1.createComponentPv([view_manager_utils_spec_1.createNestedElBinder(childProtoView)]))]);
                        hostView = view_ref_1.internalView(manager.createRootHostView(wrapPv(hostProtoView), null, null));
                        vcRef = hostView.elementRefs[1];
                        templateRef = new template_ref_1.TemplateRef_(hostView.elementRefs[1]);
                        nestedChildViews = [];
                        childViews = [];
                        nestedVcRefs = [];
                        for (var i = 0; i < 2; i++) {
                            var view = view_ref_1.internalView(manager.createEmbeddedViewInContainer(vcRef, i, templateRef));
                            childViews.push(view);
                            var nestedVcRef = view.elementRefs[view.elementOffset];
                            nestedVcRefs.push(nestedVcRef);
                            for (var j = 0; j < 2; j++) {
                                var nestedView = view_ref_1.internalView(manager.createEmbeddedViewInContainer(nestedVcRef, j, templateRef));
                                nestedChildViews.push(nestedView);
                            }
                        }
                        resetSpies();
                    });
                    testing_internal_1.it('should dehydrate all child views', function () {
                        manager.destroyRootHostView(wrapView(hostView));
                        childViews.forEach(function (childView) { return testing_internal_1.expect(childView.hydrated()).toBe(false); });
                        nestedChildViews.forEach(function (childView) { return testing_internal_1.expect(childView.hydrated()).toBe(false); });
                    });
                });
            });
        });
        testing_internal_1.describe('attachViewInContainer', function () {
        });
        testing_internal_1.describe('detachViewInContainer', function () {
        });
    });
}
exports.main = main;
//# sourceMappingURL=view_manager_spec.js.map
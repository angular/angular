var testing_internal_1 = require('angular2/testing_internal');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var appCmds = require('angular2/src/core/linker/template_commands');
var view_factory_1 = require('angular2/src/core/render/view_factory');
var api_1 = require('angular2/src/core/render/api');
var spies_1 = require('../spies');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var metadata_1 = require('angular2/src/core/metadata');
function beginElement(name, attrNameAndValues, eventTargetAndNames, isBound, ngContentIndex) {
    return new appCmds.BeginElementCmd(name, attrNameAndValues, eventTargetAndNames, [], [], isBound, ngContentIndex);
}
function endElement() {
    return new appCmds.EndElementCmd();
}
function text(value, isBound, ngContentIndex) {
    return new appCmds.TextCmd(value, isBound, ngContentIndex);
}
function embeddedTemplate(attrNameAndValues, isMerged, ngContentIndex, children) {
    return new appCmds.EmbeddedTemplateCmd(attrNameAndValues, [], [], isMerged, ngContentIndex, null, children);
}
function beginComponent(name, attrNameAndValues, eventTargetAndNames, ngContentIndex, templateId) {
    return new appCmds.BeginComponentCmd(name, attrNameAndValues, eventTargetAndNames, [], [], null, ngContentIndex, function () { return new appCmds.CompiledComponentTemplate(templateId, null, null, null); });
}
function endComponent() {
    return new appCmds.EndComponentCmd();
}
function ngContent(index, ngContentIndex) {
    return new appCmds.NgContentCmd(index, ngContentIndex);
}
function main() {
    testing_internal_1.describe('createRenderView', function () {
        var nodeFactory;
        var eventDispatcher;
        var componentTemplates = new Map();
        var defaultCmpTpl;
        testing_internal_1.beforeEach(function () {
            nodeFactory = new DomNodeFactory(componentTemplates);
            eventDispatcher = new spies_1.SpyRenderEventDispatcher();
            defaultCmpTpl =
                new api_1.RenderComponentTemplate('someId', 'shortid', metadata_1.ViewEncapsulation.None, [], []);
        });
        testing_internal_1.describe('primitives', function () {
            testing_internal_1.it('should create elements with attributes', function () {
                var view = view_factory_1.createRenderView(defaultCmpTpl, [beginElement('div', ['attr1', 'value1'], [], false, null), endElement()], null, nodeFactory);
                testing_internal_1.expect(stringifyFragment(view.fragments[0].nodes)).toEqual('<div attr1="value1"></div>');
            });
            testing_internal_1.it('should create host elements with attributes', function () {
                componentTemplates.set('0', []);
                var view = view_factory_1.createRenderView(defaultCmpTpl, [beginComponent('a-comp', ['attr1', 'value1'], [], null, '0'), endElement()], null, nodeFactory);
                testing_internal_1.expect(stringifyFragment(view.fragments[0].nodes))
                    .toEqual('<a-comp attr1="value1"></a-comp>');
            });
            testing_internal_1.it('should create embedded templates with attributes', function () {
                componentTemplates.set('0', []);
                var view = view_factory_1.createRenderView(defaultCmpTpl, [embeddedTemplate(['attr1', 'value1'], false, null, [])], null, nodeFactory);
                testing_internal_1.expect(stringifyFragment(view.fragments[0].nodes))
                    .toEqual('<template attr1="value1"></template>');
            });
            testing_internal_1.it('should store bound elements', function () {
                componentTemplates.set('0', []);
                var view = view_factory_1.createRenderView(defaultCmpTpl, [
                    beginElement('div', ['id', '1'], [], false, null),
                    endElement(),
                    beginElement('span', ['id', '2'], [], true, null),
                    endElement(),
                    beginComponent('a-comp', ['id', '3'], [], null, '0'),
                    endElement(),
                    embeddedTemplate(['id', '4'], false, null, [])
                ], null, nodeFactory);
                testing_internal_1.expect(mapAttrs(view.boundElements, 'id')).toEqual(['2', '3', '4']);
            });
            testing_internal_1.it('should use the inplace element for the first create element', function () {
                var el = dom_adapter_1.DOM.createElement('span');
                var view = view_factory_1.createRenderView(defaultCmpTpl, [
                    beginElement('div', ['attr1', 'value1'], [], false, null),
                    endElement(),
                    beginElement('div', [], [], false, null),
                    endElement()
                ], el, nodeFactory);
                testing_internal_1.expect(stringifyFragment(view.fragments[0].nodes))
                    .toEqual('<span attr1="value1"></span><div></div>');
            });
            testing_internal_1.it('should create text nodes', function () {
                var view = view_factory_1.createRenderView(defaultCmpTpl, [text('someText', false, null)], null, nodeFactory);
                testing_internal_1.expect(stringifyFragment(view.fragments[0].nodes)).toEqual('someText');
            });
            testing_internal_1.it('should store bound text nodes', function () {
                var view = view_factory_1.createRenderView(defaultCmpTpl, [text('1', false, null), text('2', true, null)], null, nodeFactory);
                testing_internal_1.expect(testing_internal_1.stringifyElement(view.boundTextNodes[0])).toEqual('2');
            });
            testing_internal_1.it('should register element event listeners', function () {
                componentTemplates.set('0', []);
                var view = view_factory_1.createRenderView(defaultCmpTpl, [
                    beginElement('div', [], [null, 'click'], true, null),
                    endElement(),
                    beginComponent('a-comp', [], [null, 'click'], null, '0'),
                    endElement(),
                ], null, nodeFactory);
                view.setEventDispatcher(eventDispatcher);
                var event = {};
                nodeFactory.triggerLocalEvent(view.boundElements[0], 'click', event);
                nodeFactory.triggerLocalEvent(view.boundElements[1], 'click', event);
                testing_internal_1.expect(eventDispatcher.spy('dispatchRenderEvent'))
                    .toHaveBeenCalledWith(0, 'click', collection_1.MapWrapper.createFromStringMap({ '$event': event }));
                testing_internal_1.expect(eventDispatcher.spy('dispatchRenderEvent'))
                    .toHaveBeenCalledWith(1, 'click', collection_1.MapWrapper.createFromStringMap({ '$event': event }));
            });
            testing_internal_1.it('should register element global event listeners', function () {
                var view = view_factory_1.createRenderView(defaultCmpTpl, [
                    beginElement('div', [], ['window', 'scroll'], true, null),
                    endElement(),
                    beginComponent('a-comp', [], ['window', 'scroll'], null, '0'),
                    endElement(),
                ], null, nodeFactory);
                view.hydrate();
                view.setEventDispatcher(eventDispatcher);
                var event = {};
                nodeFactory.triggerGlobalEvent('window', 'scroll', event);
                testing_internal_1.expect(eventDispatcher.spy('dispatchRenderEvent'))
                    .toHaveBeenCalledWith(0, 'window:scroll', collection_1.MapWrapper.createFromStringMap({ '$event': event }));
                testing_internal_1.expect(eventDispatcher.spy('dispatchRenderEvent'))
                    .toHaveBeenCalledWith(1, 'window:scroll', collection_1.MapWrapper.createFromStringMap({ '$event': event }));
            });
        });
        testing_internal_1.describe('nested nodes', function () {
            testing_internal_1.it('should create nested node', function () {
                var view = view_factory_1.createRenderView(defaultCmpTpl, [
                    beginElement('a', [], [], false, null),
                    beginElement('b', [], [], false, null),
                    text('someText', false, null),
                    endElement(),
                    endElement(),
                ], null, nodeFactory);
                testing_internal_1.expect(stringifyFragment(view.fragments[0].nodes)).toEqual('<a><b>someText</b></a>');
            });
            testing_internal_1.it('should store bound elements in depth first order', function () {
                var view = view_factory_1.createRenderView(defaultCmpTpl, [
                    beginElement('a', ['id', '1'], [], false, null),
                    endElement(),
                    beginElement('a', ['id', '2'], [], true, null),
                    beginElement('a', ['id', '3'], [], false, null),
                    endElement(),
                    beginElement('a', ['id', '4'], [], true, null),
                    endElement(),
                    endElement(),
                    beginElement('a', ['id', '5'], [], false, null),
                    endElement(),
                    beginElement('a', ['id', '6'], [], true, null),
                    endElement(),
                ], null, nodeFactory);
                testing_internal_1.expect(mapAttrs(view.boundElements, 'id')).toEqual(['2', '4', '6']);
            });
            testing_internal_1.it('should store bound text nodes in depth first order', function () {
                var view = view_factory_1.createRenderView(defaultCmpTpl, [
                    text('1', false, null),
                    text('2', true, null),
                    beginElement('a', [], [], false, null),
                    text('3', false, null),
                    text('4', true, null),
                    endElement(),
                    text('5', false, null),
                    text('6', true, null),
                ], null, nodeFactory);
                testing_internal_1.expect(mapText(view.boundTextNodes)).toEqual(['2', '4', '6']);
            });
        });
        testing_internal_1.describe('merged embedded templates', function () {
            testing_internal_1.it('should create separate fragments', function () {
                var view = view_factory_1.createRenderView(defaultCmpTpl, [
                    embeddedTemplate(['attr1', 'value1'], true, null, [text('someText', false, null)])
                ], null, nodeFactory);
                testing_internal_1.expect(view.fragments.length).toBe(2);
                testing_internal_1.expect(stringifyFragment(view.fragments[1].nodes)).toEqual('someText');
            });
            testing_internal_1.it('should store bound elements after the bound elements of earlier fragments', function () {
                var view = view_factory_1.createRenderView(defaultCmpTpl, [
                    beginElement('a', ['id', '1.1'], [], true, null),
                    endElement(),
                    embeddedTemplate(['id', '1.2'], true, null, [
                        embeddedTemplate(['id', '2.1'], true, null, [
                            beginElement('a', ['id', '3.1'], [], true, null),
                            endElement()
                        ]),
                        beginElement('a', ['id', '2.2'], [], true, null),
                        endElement(),
                    ]),
                    beginElement('a', ['id', '1.3'], [], true, null),
                    endElement(),
                ], null, nodeFactory);
                testing_internal_1.expect(mapAttrs(view.boundElements, 'id'))
                    .toEqual(['1.1', '1.2', '1.3', '2.1', '2.2', '3.1']);
            });
            testing_internal_1.it('should store bound text nodes after the bound text nodes of earlier fragments', function () {
                var view = view_factory_1.createRenderView(defaultCmpTpl, [
                    text('1.1', true, null),
                    embeddedTemplate(['id', '1.2'], true, null, [
                        text('2.1', true, null),
                        embeddedTemplate(['id', '2.1'], true, null, [
                            text('3.1', true, null),
                        ]),
                        text('2.2', true, null),
                    ]),
                    text('1.2', true, null),
                ], null, nodeFactory);
                testing_internal_1.expect(mapText(view.boundTextNodes))
                    .toEqual(['1.1', '1.2', '2.1', '2.2', '3.1']);
            });
        });
        testing_internal_1.describe('non merged embedded templates', function () {
            testing_internal_1.it('should only create the anchor element', function () {
                var view = view_factory_1.createRenderView(defaultCmpTpl, [
                    embeddedTemplate(['id', '1.1'], false, null, [
                        text('someText', true, null),
                        beginElement('a', ['id', '2.1'], [], true, null),
                        endElement()
                    ])
                ], null, nodeFactory);
                testing_internal_1.expect(view.fragments.length).toBe(1);
                testing_internal_1.expect(stringifyFragment(view.fragments[0].nodes))
                    .toEqual('<template id="1.1"></template>');
                testing_internal_1.expect(view.boundTextNodes.length).toBe(0);
                testing_internal_1.expect(mapAttrs(view.boundElements, 'id')).toEqual(['1.1']);
            });
        });
        testing_internal_1.describe('components', function () {
            testing_internal_1.it('should store the component template in the same fragment', function () {
                componentTemplates.set('0', [
                    text('hello', false, null),
                ]);
                var view = view_factory_1.createRenderView(defaultCmpTpl, [beginComponent('my-comp', [], [], null, '0'), endComponent()], null, nodeFactory);
                testing_internal_1.expect(view.fragments.length).toBe(1);
                testing_internal_1.expect(stringifyFragment(view.fragments[0].nodes)).toEqual('<my-comp>hello</my-comp>');
            });
            testing_internal_1.it('should use native shadow DOM', function () {
                componentTemplates.set('0', new api_1.RenderComponentTemplate('someId', 'shortid', metadata_1.ViewEncapsulation.Native, [
                    text('hello', false, null),
                ], []));
                var view = view_factory_1.createRenderView(defaultCmpTpl, [beginComponent('my-comp', [], [], null, '0'), endComponent()], null, nodeFactory);
                testing_internal_1.expect(view.fragments.length).toBe(1);
                testing_internal_1.expect(stringifyFragment(view.fragments[0].nodes))
                    .toEqual('<my-comp><shadow-root>hello</shadow-root></my-comp>');
            });
            testing_internal_1.it('should store bound elements after the bound elements of the main template', function () {
                componentTemplates.set('0', [
                    beginComponent('b-comp', ['id', '2.1'], [], null, '1'),
                    endComponent(),
                    beginComponent('b-comp', ['id', '2.2'], [], null, '1'),
                    endComponent(),
                ]);
                componentTemplates.set('1', [beginElement('a', ['id', '3.1'], [], true, null), endElement()]);
                var view = view_factory_1.createRenderView(defaultCmpTpl, [
                    beginElement('a', ['id', '1.1'], [], true, null),
                    endElement(),
                    beginComponent('a-comp', ['id', '1.2'], [], null, '0'),
                    beginElement('a', ['id', '1.3'], [], true, null),
                    endElement(),
                    endComponent(),
                    beginElement('a', ['id', '1.4'], [], true, null),
                    endElement(),
                ], null, nodeFactory);
                testing_internal_1.expect(mapAttrs(view.boundElements, 'id'))
                    .toEqual(['1.1', '1.2', '1.3', '1.4', '2.1', '2.2', '3.1', '3.1']);
            });
            testing_internal_1.it('should store bound elements from the view before bound elements from content components', function () {
                componentTemplates.set('0', [
                    beginElement('a', ['id', '2.1'], [], true, null),
                    endElement(),
                ]);
                componentTemplates.set('1', [
                    beginElement('a', ['id', '3.1'], [], true, null),
                    endElement(),
                ]);
                var view = view_factory_1.createRenderView(defaultCmpTpl, [
                    beginComponent('a-comp', ['id', '1.1'], [], null, '0'),
                    beginComponent('b-comp', ['id', '1.2'], [], null, '1'),
                    endComponent(),
                    endComponent(),
                ], null, nodeFactory);
                testing_internal_1.expect(mapAttrs(view.boundElements, 'id')).toEqual(['1.1', '1.2', '2.1', '3.1']);
            });
            testing_internal_1.it('should process nested components in depth first order', function () {
                componentTemplates.set('0', [
                    beginComponent('b11-comp', ['id', '2.1'], [], null, '2'),
                    endComponent(),
                    beginComponent('b12-comp', ['id', '2.2'], [], null, '3'),
                    endComponent(),
                ]);
                componentTemplates.set('1', [
                    beginComponent('b21-comp', ['id', '3.1'], [], null, '4'),
                    endComponent(),
                    beginComponent('b22-comp', ['id', '3.2'], [], null, '5'),
                    endComponent(),
                ]);
                componentTemplates.set('2', [
                    beginElement('b11', ['id', '4.11'], [], true, null),
                    endElement(),
                ]);
                componentTemplates.set('3', [
                    beginElement('b12', ['id', '4.12'], [], true, null),
                    endElement(),
                ]);
                componentTemplates.set('4', [
                    beginElement('b21', ['id', '4.21'], [], true, null),
                    endElement(),
                ]);
                componentTemplates.set('5', [
                    beginElement('b22', ['id', '4.22'], [], true, null),
                    endElement(),
                ]);
                var view = view_factory_1.createRenderView(defaultCmpTpl, [
                    beginComponent('a1-comp', ['id', '1.1'], [], null, '0'),
                    endComponent(),
                    beginComponent('a2-comp', ['id', '1.2'], [], null, '1'),
                    endComponent(),
                ], null, nodeFactory);
                testing_internal_1.expect(mapAttrs(view.boundElements, 'id'))
                    .toEqual(['1.1', '1.2', '2.1', '2.2', '4.11', '4.12', '3.1', '3.2', '4.21', '4.22']);
            });
            testing_internal_1.it('should store bound text nodes after the bound text nodes of the main template', function () {
                componentTemplates.set('0', [
                    text('2.1', true, null),
                    beginComponent('b-comp', [], [], null, '1'),
                    endComponent(),
                    beginComponent('b-comp', [], [], null, '1'),
                    endComponent(),
                    text('2.2', true, null),
                ]);
                componentTemplates.set('1', [
                    text('3.1', true, null),
                ]);
                var view = view_factory_1.createRenderView(defaultCmpTpl, [
                    text('1.1', true, null),
                    beginComponent('a-comp', [], [], null, '0'),
                    text('1.2', true, null),
                    endComponent(),
                    text('1.3', true, null),
                ], null, nodeFactory);
                testing_internal_1.expect(mapText(view.boundTextNodes))
                    .toEqual(['1.1', '1.2', '1.3', '2.1', '2.2', '3.1', '3.1']);
            });
        });
        testing_internal_1.it('should store bound text nodes from the view before bound text nodes from content components', function () {
            componentTemplates.set('0', [text('2.1', true, null)]);
            componentTemplates.set('1', [text('3.1', true, null)]);
            var view = view_factory_1.createRenderView(defaultCmpTpl, [
                beginComponent('a-comp', [], [], null, '0'),
                beginComponent('b-comp', [], [], null, '1'),
                endComponent(),
                endComponent(),
            ], null, nodeFactory);
            testing_internal_1.expect(mapText(view.boundTextNodes)).toEqual(['2.1', '3.1']);
        });
        testing_internal_1.describe('content projection', function () {
            testing_internal_1.it('should remove non projected nodes', function () {
                componentTemplates.set('0', []);
                var view = view_factory_1.createRenderView(defaultCmpTpl, [
                    beginComponent('my-comp', [], [], null, '0'),
                    text('hello', false, null),
                    endComponent()
                ], null, nodeFactory);
                testing_internal_1.expect(stringifyFragment(view.fragments[0].nodes)).toEqual('<my-comp></my-comp>');
            });
            testing_internal_1.it('should keep non projected nodes in the light dom when using native shadow dom', function () {
                componentTemplates.set('0', new api_1.RenderComponentTemplate('someId', 'shortid', metadata_1.ViewEncapsulation.Native, [], []));
                var view = view_factory_1.createRenderView(defaultCmpTpl, [
                    beginComponent('my-comp', [], [], null, '0'),
                    text('hello', false, null),
                    endComponent()
                ], null, nodeFactory);
                var rootEl = view.fragments[0].nodes[0];
                testing_internal_1.expect(testing_internal_1.stringifyElement(rootEl))
                    .toEqual('<my-comp><shadow-root></shadow-root>hello</my-comp>');
            });
            testing_internal_1.it('should project commands based on their ngContentIndex', function () {
                componentTemplates.set('0', [
                    text('(', false, null),
                    ngContent(0, null),
                    text(',', false, null),
                    ngContent(1, null),
                    text(')', false, null)
                ]);
                var view = view_factory_1.createRenderView(defaultCmpTpl, [
                    beginComponent('my-comp', [], [], null, '0'),
                    text('2', false, 1),
                    text('1', false, 0),
                    endComponent()
                ], null, nodeFactory);
                testing_internal_1.expect(stringifyFragment(view.fragments[0].nodes)).toEqual('<my-comp>(1,2)</my-comp>');
            });
            testing_internal_1.it('should reproject nodes over multiple ng-content commands', function () {
                componentTemplates.set('0', [beginComponent('b-comp', [], [], null, '1'), ngContent(0, 0), endComponent()]);
                componentTemplates.set('1', [text('(', false, null), ngContent(0, null), text(')', false, null)]);
                var view = view_factory_1.createRenderView(defaultCmpTpl, [beginComponent('a-comp', [], [], null, '0'), text('hello', false, 0), endComponent()], null, nodeFactory);
                testing_internal_1.expect(stringifyFragment(view.fragments[0].nodes))
                    .toEqual('<a-comp><b-comp>(hello)</b-comp></a-comp>');
            });
            testing_internal_1.it('should store content injection points for root component in a view', function () {
                componentTemplates.set('0', [ngContent(0, null)]);
                var view = view_factory_1.createRenderView(defaultCmpTpl, [beginComponent('a-comp', [], [], null, '0'), endComponent()], dom_adapter_1.DOM.createElement('root'), nodeFactory);
                testing_internal_1.expect(stringifyFragment(view.rootContentInsertionPoints))
                    .toEqual('<root-content-insertion-point></root-content-insertion-point>');
            });
        });
        testing_internal_1.describe('view encapsulation', function () {
            testing_internal_1.it('should not add attributes to elements in template with ViewEncapsulation.None', function () {
                var tpl = new api_1.RenderComponentTemplate('someId', 'shortid', metadata_1.ViewEncapsulation.None, [], []);
                var view = view_factory_1.createRenderView(tpl, [beginElement('div', [], [], false, null), endElement()], null, nodeFactory);
                testing_internal_1.expect(stringifyFragment(view.fragments[0].nodes)).toEqual('<div></div>');
            });
            testing_internal_1.it('should not add attributes to elements in template with ViewEncapsulation.Native', function () {
                var tpl = new api_1.RenderComponentTemplate('someId', 'shortid', metadata_1.ViewEncapsulation.Native, [], []);
                var view = view_factory_1.createRenderView(tpl, [beginElement('div', [], [], false, null), endElement()], null, nodeFactory);
                testing_internal_1.expect(stringifyFragment(view.fragments[0].nodes)).toEqual('<div></div>');
            });
            testing_internal_1.describe('ViewEncapsulation.Emulated', function () {
                var encapsulatedTpl;
                testing_internal_1.beforeEach(function () {
                    encapsulatedTpl =
                        new api_1.RenderComponentTemplate('someId', 'shortid', metadata_1.ViewEncapsulation.Emulated, [], []);
                });
                testing_internal_1.it('should add marker attributes to content elements', function () {
                    var view = view_factory_1.createRenderView(encapsulatedTpl, [beginElement('div', [], [], false, null), endElement()], null, nodeFactory);
                    testing_internal_1.expect(stringifyFragment(view.fragments[0].nodes))
                        .toEqual('<div _ngcontent-shortid=""></div>');
                });
                testing_internal_1.it('should add marker attributes to content elements in merged embedded templates', function () {
                    var view = view_factory_1.createRenderView(encapsulatedTpl, [
                        embeddedTemplate([], true, null, [beginElement('div', [], [], false, null), endElement()])
                    ], null, nodeFactory);
                    testing_internal_1.expect(stringifyFragment(view.fragments[0].nodes)).toEqual('<template></template>');
                    testing_internal_1.expect(stringifyFragment(view.fragments[1].nodes))
                        .toEqual('<div _ngcontent-shortid=""></div>');
                });
                testing_internal_1.it('should add marker attributes to host elements and content elements of nested components', function () {
                    componentTemplates.set('0', new api_1.RenderComponentTemplate('innerComp', 'innerid', metadata_1.ViewEncapsulation.Emulated, [beginElement('div', [], [], false, null), endElement()], []));
                    var view = view_factory_1.createRenderView(encapsulatedTpl, [beginComponent('my-comp', [], [], null, '0'), endComponent()], null, nodeFactory);
                    testing_internal_1.expect(stringifyFragment(view.fragments[0].nodes))
                        .toEqual('<my-comp _ngcontent-shortid="" _nghost-innerid=""><div _ngcontent-innerid=""></div></my-comp>');
                });
            });
        });
    });
    testing_internal_1.describe('encapsulateStyles', function () {
        var input = 'div[%COMP%] {}';
        testing_internal_1.it('should not change styles for ViewEncapsulation.Native', function () {
            var tpl = new api_1.RenderComponentTemplate('someId', 'shortid', metadata_1.ViewEncapsulation.Native, [], [input]);
            testing_internal_1.expect(view_factory_1.encapsulateStyles(tpl)).toEqual([input]);
        });
        testing_internal_1.it('should not change styles for ViewEncapsulation.None', function () {
            var tpl = new api_1.RenderComponentTemplate('someId', 'shortid', metadata_1.ViewEncapsulation.None, [], [input]);
            testing_internal_1.expect(view_factory_1.encapsulateStyles(tpl)).toEqual([input]);
        });
        testing_internal_1.it('should change styles for ViewEncapsulation.Emulated', function () {
            var tpl = new api_1.RenderComponentTemplate('someId', 'shortid', metadata_1.ViewEncapsulation.Emulated, [], [input]);
            testing_internal_1.expect(view_factory_1.encapsulateStyles(tpl)).toEqual(['div[shortid] {}']);
        });
    });
}
exports.main = main;
var DomNodeFactory = (function () {
    function DomNodeFactory(_components) {
        this._components = _components;
        this._globalEventListeners = [];
        this._localEventListeners = [];
    }
    DomNodeFactory.prototype.triggerLocalEvent = function (el, eventName, event) {
        this._localEventListeners.forEach(function (listener) {
            if (listener.eventName == eventName) {
                listener.callback(event);
            }
        });
    };
    DomNodeFactory.prototype.triggerGlobalEvent = function (target, eventName, event) {
        this._globalEventListeners.forEach(function (listener) {
            if (listener.eventName == eventName && listener.target == target) {
                listener.callback(event);
            }
        });
    };
    DomNodeFactory.prototype.resolveComponentTemplate = function (templateId) {
        var data = this._components.get(templateId);
        if (data instanceof api_1.RenderComponentTemplate) {
            return data;
        }
        else {
            return new api_1.RenderComponentTemplate(templateId, templateId, metadata_1.ViewEncapsulation.None, data, []);
        }
    };
    DomNodeFactory.prototype.createTemplateAnchor = function (attrNameAndValues) {
        var el = dom_adapter_1.DOM.createElement('template');
        this._setAttributes(el, attrNameAndValues);
        return el;
    };
    DomNodeFactory.prototype.createElement = function (name, attrNameAndValues) {
        var el = dom_adapter_1.DOM.createElement(name);
        this._setAttributes(el, attrNameAndValues);
        return el;
    };
    DomNodeFactory.prototype.mergeElement = function (existing, attrNameAndValues) {
        dom_adapter_1.DOM.clearNodes(existing);
        this._setAttributes(existing, attrNameAndValues);
    };
    DomNodeFactory.prototype._setAttributes = function (el, attrNameAndValues) {
        for (var attrIdx = 0; attrIdx < attrNameAndValues.length; attrIdx += 2) {
            dom_adapter_1.DOM.setAttribute(el, attrNameAndValues[attrIdx], attrNameAndValues[attrIdx + 1]);
        }
    };
    DomNodeFactory.prototype.createShadowRoot = function (host, templateId) {
        var root = dom_adapter_1.DOM.createElement('shadow-root');
        dom_adapter_1.DOM.appendChild(host, root);
        return root;
    };
    DomNodeFactory.prototype.createText = function (value) { return dom_adapter_1.DOM.createTextNode(lang_1.isPresent(value) ? value : ''); };
    DomNodeFactory.prototype.createRootContentInsertionPoint = function () {
        return dom_adapter_1.DOM.createElement('root-content-insertion-point');
    };
    DomNodeFactory.prototype.appendChild = function (parent, child) { dom_adapter_1.DOM.appendChild(parent, child); };
    DomNodeFactory.prototype.on = function (element, eventName, callback) {
        this._localEventListeners.push(new LocalEventListener(element, eventName, callback));
    };
    DomNodeFactory.prototype.globalOn = function (target, eventName, callback) {
        var _this = this;
        var listener = new GlobalEventListener(target, eventName, callback);
        this._globalEventListeners.push(listener);
        return function () {
            var index = _this._globalEventListeners.indexOf(listener);
            if (index !== -1) {
                _this._globalEventListeners.splice(index, 1);
            }
        };
    };
    return DomNodeFactory;
})();
var LocalEventListener = (function () {
    function LocalEventListener(element, eventName, callback) {
        this.element = element;
        this.eventName = eventName;
        this.callback = callback;
    }
    return LocalEventListener;
})();
var GlobalEventListener = (function () {
    function GlobalEventListener(target, eventName, callback) {
        this.target = target;
        this.eventName = eventName;
        this.callback = callback;
    }
    return GlobalEventListener;
})();
function stringifyFragment(nodes) {
    return nodes.map(testing_internal_1.stringifyElement).join('');
}
function mapAttrs(nodes, attrName) {
    return nodes.map(function (node) { return dom_adapter_1.DOM.getAttribute(node, attrName); });
}
function mapText(nodes) {
    return nodes.map(function (node) { return dom_adapter_1.DOM.getText(node); });
}
//# sourceMappingURL=view_factory_spec.js.map
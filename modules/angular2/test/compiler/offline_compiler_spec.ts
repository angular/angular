import {
  ddescribe,
  describe,
  xdescribe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  AsyncTestCompleter,
  inject,
  beforeEachProviders,
  el
} from 'angular2/testing_internal';

import {IS_DART} from 'angular2/src/facade/lang';
import {Injector} from 'angular2/core';
import {DebugNode, DebugElement, getDebugNode} from 'angular2/src/core/debug/debug_node';

import {HostViewFactoryRef_} from 'angular2/src/core/linker/view_ref';
import {HostViewFactory} from 'angular2/src/core/linker/view';
import * as typed from './offline_compiler_codegen_typed';
import * as untyped from './offline_compiler_codegen_untyped';

import {AppViewManager} from 'angular2/src/core/linker/view_manager';
import {DOCUMENT} from 'angular2/src/platform/dom/dom_tokens';
import {DOM} from 'angular2/src/platform/dom/dom_adapter';
import {SharedStylesHost} from "angular2/src/platform/dom/shared_styles_host";

import {CompA} from './offline_compiler_util';

var _nextRootElementId = 0;

export function main() {
  var outputDefs = [];
  var typedHostViewFactory = typed.hostViewFactory_CompA;
  var untypedHostViewFactory = untyped.hostViewFactory_CompA;

  if (IS_DART || !DOM.supportsDOMEvents()) {
    // Our generator only works on node.js and Dart...
    outputDefs.push({'compAHostViewFactory': typedHostViewFactory, 'name': 'typed'});
  }
  if (!IS_DART) {
    // Our generator only works on node.js and Dart...
    if (!DOM.supportsDOMEvents()) {
      outputDefs.push({'compAHostViewFactory': untypedHostViewFactory, 'name': 'untyped'});
    }
  }
  describe('OfflineCompiler', () => {
    var viewManager: AppViewManager;
    var injector: Injector;
    var sharedStylesHost: SharedStylesHost;
    var rootEl;

    beforeEach(inject([AppViewManager, Injector, SharedStylesHost],
                      (_viewManager, _injector, _sharedStylesHost) => {
                        viewManager = _viewManager;
                        injector = _injector;
                        sharedStylesHost = _sharedStylesHost;
                      }));

    function createHostComp(hvf: HostViewFactory): DebugElement {
      var doc = injector.get(DOCUMENT);
      var oldRoots = DOM.querySelectorAll(doc, hvf.selector);
      for (var i = 0; i < oldRoots.length; i++) {
        DOM.remove(oldRoots[i]);
      }
      rootEl = el(`<${hvf.selector}></${hvf.selector}>`);
      DOM.appendChild(doc.body, rootEl);

      viewManager.createRootHostView(new HostViewFactoryRef_(hvf), hvf.selector, injector, []);
      return <DebugElement>getDebugNode(rootEl);
    }

    outputDefs.forEach((outputDef) => {
      describe(`${outputDef['name']}`, () => {
        it('should compile components', () => {
          var hostEl = createHostComp(outputDef['compAHostViewFactory']);
          expect(hostEl.componentInstance).toBeAnInstanceOf(CompA);
          var styles = sharedStylesHost.getAllStyles();
          expect(styles[0]).toContain('.redStyle[_ngcontent');
          expect(styles[1]).toContain('.greenStyle[_ngcontent');
        });
      });
    });
  });
}
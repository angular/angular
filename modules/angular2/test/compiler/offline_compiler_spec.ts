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

import {ComponentFactory} from 'angular2/src/core/linker/component_factory';
import * as typed from './offline_compiler_codegen_typed';
import * as untyped from './offline_compiler_codegen_untyped';

import {DOM} from 'angular2/src/platform/dom/dom_adapter';
import {SharedStylesHost} from "angular2/src/platform/dom/shared_styles_host";

import {CompA} from './offline_compiler_util';

export function main() {
  var outputDefs = [];
  var typedComponentFactory = typed.CompANgFactory;
  var untypedComponentFactory = untyped.CompANgFactory;

  if (IS_DART || !DOM.supportsDOMEvents()) {
    // Our generator only works on node.js and Dart...
    outputDefs.push({'compAHostComponentFactory': typedComponentFactory, 'name': 'typed'});
  }
  if (!IS_DART) {
    // Our generator only works on node.js and Dart...
    if (!DOM.supportsDOMEvents()) {
      outputDefs.push({'compAHostComponentFactory': untypedComponentFactory, 'name': 'untyped'});
    }
  }
  describe('OfflineCompiler', () => {
    var injector: Injector;
    var sharedStylesHost: SharedStylesHost;

    beforeEach(inject([Injector, SharedStylesHost], (_injector, _sharedStylesHost) => {
      injector = _injector;
      sharedStylesHost = _sharedStylesHost;
    }));

    function createHostComp(cf: ComponentFactory): DebugElement {
      var compRef = cf.create(injector);
      return <DebugElement>getDebugNode(compRef.location.nativeElement);
    }

    outputDefs.forEach((outputDef) => {
      describe(`${outputDef['name']}`, () => {
        it('should compile components', () => {
          var hostEl = createHostComp(outputDef['compAHostComponentFactory']);
          expect(hostEl.componentInstance).toBeAnInstanceOf(CompA);
          var styles = sharedStylesHost.getAllStyles();
          expect(styles[0]).toContain('.redStyle[_ngcontent');
          expect(styles[1]).toContain('.greenStyle[_ngcontent');
        });
      });
    });
  });
}
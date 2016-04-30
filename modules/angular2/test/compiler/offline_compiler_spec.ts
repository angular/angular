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

import {ComponentFactory} from 'angular2/src/core/linker/component_factory';
import * as typed from './offline_compiler_codegen_typed';
import * as untyped from './offline_compiler_codegen_untyped';

import {DOM} from 'angular2/src/platform/dom/dom_adapter';
import {SharedStylesHost} from "angular2/src/platform/dom/shared_styles_host";

import {CompA} from './offline_compiler_util';

export function main() {
  var typedComponentFactory = typed.CompANgFactory;
  var untypedComponentFactory = untyped.CompANgFactory;
  var fixtures: TestFixture[] = [];

  if (IS_DART || !DOM.supportsDOMEvents()) {
    // Our generator only works on node.js and Dart...
    fixtures.push(new TestFixture(typedComponentFactory, 'typed'));
  }
  if (!IS_DART) {
    // Our generator only works on node.js and Dart...
    if (!DOM.supportsDOMEvents()) {
      fixtures.push(new TestFixture(untypedComponentFactory, 'untyped'));
    }
  }
  describe('OfflineCompiler', () => {
    var injector: Injector;
    var sharedStylesHost: SharedStylesHost;

    beforeEach(inject([Injector, SharedStylesHost], (_injector, _sharedStylesHost) => {
      injector = _injector;
      sharedStylesHost = _sharedStylesHost;
    }));

    fixtures.forEach((fixture) => {
      describe(`${fixture.name}`, () => {
        it('should compile components', () => {
          var hostEl = fixture.compFactory.create(injector);
          expect(hostEl.instance).toBeAnInstanceOf(CompA);
          var styles = sharedStylesHost.getAllStyles();
          expect(styles[0]).toContain('.redStyle[_ngcontent');
          expect(styles[1]).toContain('.greenStyle[_ngcontent');
        });
      });
    });
  });
}

class TestFixture {
  constructor(public compFactory: ComponentFactory<CompA>, public name: string) {}
}
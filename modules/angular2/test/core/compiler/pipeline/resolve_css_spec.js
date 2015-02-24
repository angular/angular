import {
  describe,
  beforeEach,
  expect,
  it,
  iit,
  ddescribe,
  el,
  SpyObject,
  proxy,
} from 'angular2/test_lib';

import {CompilePipeline} from 'angular2/src/core/compiler/pipeline/compile_pipeline';
import {ResolveCss} from 'angular2/src/core/compiler/pipeline/resolve_css';
import {CompileElement} from 'angular2/src/core/compiler/pipeline/compile_element';
import {CompileStep} from 'angular2/src/core/compiler/pipeline/compile_step';
import {CompileControl} from 'angular2/src/core/compiler/pipeline/compile_control';

import {Component} from 'angular2/src/core/annotations/annotations';
import {DirectiveMetadata} from 'angular2/src/core/compiler/directive_metadata';
import {ShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {ProtoView} from 'angular2/src/core/compiler/view';

import {IMPLEMENTS, Type, stringify} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/facade/dom';
import {PromiseWrapper} from 'angular2/src/facade/async';

export function main() {
  describe('ResolveCss', () => {
    function createPipeline(strategy:ShadowDomStrategy) {
      var annotation = new Component({selector: 'selector'});
      var meta = new DirectiveMetadata(SomeComponent, annotation);
      var resolveCss = new ResolveCss(meta, strategy, 'http://base');
      return new CompilePipeline([
        new MockStep((parent, current, control) => {
          current.inheritedProtoView = new ProtoView(null, null, null);
        }),
        resolveCss
      ]);
    }

    it('it should set ignoreBindings to true for style elements', () => {
      var strategy = new DummyStrategy();
      strategy.spy('transformStyleText').andCallFake((a, b, c) => '.css {}');
      strategy.spy('handleStyleElement');

      var pipeline = createPipeline(strategy);
      var results = pipeline.process(el('<div><style></style></div>'));
      expect(results[0].ignoreBindings).toBe(false);
      expect(results[1].ignoreBindings).toBe(true);
    });

    it('should delegate the handling of style elements to the strategy', () => {
      var strategy = new DummyStrategy();
      strategy.spy('transformStyleText').andCallFake((a, b, c) => '.css {}');
      strategy.spy('handleStyleElement');

      var pipeline = createPipeline(strategy);
      var template = el('<div></div>');
      var styleEl = el('<style></style>');
      DOM.appendChild(template, styleEl);

      pipeline.process(template);

      expect(strategy.spy('handleStyleElement')).toHaveBeenCalledWith(styleEl);
    });

    it('should handle css transformed synchronously', () => {
      var strategy = new DummyStrategy();
      strategy.spy('transformStyleText').andCallFake((css, url, cmp) => {
        return `${css}, ${url}, ${stringify(cmp)}`;
      });
      strategy.spy('handleStyleElement');

      var pipeline = createPipeline(strategy);
      var template = el('<div></div>');
      var styleEl = el('<style>/*css*/</style>');
      DOM.appendChild(template, styleEl);

      var results = pipeline.process(template);
      expect(styleEl).toHaveText('/*css*/, http://base, SomeComponent');
      expect(results[0].inheritedProtoView.stylePromises.length).toBe(0);
    });

    it('should handle css transformed asynchronously', (done) => {
      var completer = PromiseWrapper.completer();
      var strategy = new DummyStrategy();
      var futureCss;
      strategy.spy('transformStyleText').andCallFake((css, url, cmp) => {
        futureCss = `${css}, ${url}, ${stringify(cmp)}`;
        return completer.promise;
      });
      strategy.spy('handleStyleElement');

      var pipeline = createPipeline(strategy);
      var template = el('<div></div>');
      var styleEl = el('<style>/*css*/</style>');
      DOM.appendChild(template, styleEl);

      var results = pipeline.process(template);

      // The css should be empty before the style promise is resolved
      expect(styleEl).toHaveText('');
      expect(results[0].inheritedProtoView.stylePromises[0]).toBe(completer.promise);

      completer.resolve(futureCss);

      // TODO(vicb): refactor once we have better support for async tests
      completer.promise.then((_) => {
        expect(styleEl).toHaveText('/*css*/, http://base, SomeComponent');
        done();
      });
    });
  });
}

@proxy
@IMPLEMENTS(ShadowDomStrategy)
class DummyStrategy extends SpyObject {
  noSuchMethod(m) {
    return super.noSuchMethod(m)
  }
}

class SomeComponent {}

class MockStep extends CompileStep {
  processClosure:Function;
  constructor(process) {
    super();
    this.processClosure = process;
  }
  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    this.processClosure(parent, current, control);
  }
}


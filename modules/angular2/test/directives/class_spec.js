import {
  AsyncTestCompleter,
  beforeEach,
  beforeEachBindings,
  ddescribe,
  xdescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
  } from 'angular2/test_lib';

import {StringMapWrapper} from 'angular2/src/facade/collection';

import {Injector, bind} from 'angular2/di';

import {Compiler} from 'angular2/src/core/compiler/compiler';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';

import {Template} from 'angular2/src/core/annotations/template';
import {Decorator, Component} from 'angular2/src/core/annotations/annotations';

import {MockTemplateResolver} from 'angular2/src/mock/template_resolver_mock';

import {CSSClass} from 'angular2/src/directives/class';

export function main() {
  describe('binding to CSS class list', () => {

    var view, cd, compiler, component, tplResolver;

    beforeEachBindings(() => [
      bind(TemplateResolver).toClass(MockTemplateResolver)
    ]);

    beforeEach(inject([Compiler, TemplateResolver], (c, t) => {
      compiler = c;
      tplResolver = t;
    }));

    function createView(pv) {
      component = new TestComponent();
      view = pv.instantiate(null, null);
      view.hydrate(new Injector([]), null, null, component, null);
      cd = view.changeDetector;
    }

    function compileWithTemplate(html) {
      var template = new Template({
        inline: html,
        directives: [CSSClass]
      });
      tplResolver.setTemplate(TestComponent, template);
      return compiler.compile(TestComponent);
    }

    it('should add classes specified in an object literal', inject([AsyncTestCompleter], (async) => {
      var template = '<div [class]="{foo: true, bar: false}"></div>';
      compileWithTemplate(template).then((pv) => {
        createView(pv);

        cd.detectChanges();
        expect(view.nodes[0].className).toEqual('ng-binding foo');

        async.done();
      });
    }));

    it('should add and remove classes based on changes in object literal values', inject([AsyncTestCompleter], (async) => {
      var template = '<div [class]="{foo: condition, bar: !condition}"></div>';
      compileWithTemplate(template).then((pv) => {
        createView(pv);
        cd.detectChanges();
        expect(view.nodes[0].className).toEqual('ng-binding foo');

        component.condition = false;
        cd.detectChanges();
        expect(view.nodes[0].className).toEqual('ng-binding bar');

        async.done();
      });
    }));

    it('should add and remove classes based on changes to the expression object', inject([AsyncTestCompleter], (async) => {
      var template = '<div [class]="expr"></div>';
      compileWithTemplate(template).then((pv) => {
        createView(pv);
        cd.detectChanges();
        expect(view.nodes[0].className).toEqual('ng-binding foo');

        StringMapWrapper.set(component.expr, 'bar', true);
        cd.detectChanges();
        expect(view.nodes[0].className).toEqual('ng-binding foo bar');

        StringMapWrapper.set(component.expr, 'baz', true);
        cd.detectChanges();
        expect(view.nodes[0].className).toEqual('ng-binding foo bar baz');

        StringMapWrapper.delete(component.expr, 'bar');
        cd.detectChanges();
        expect(view.nodes[0].className).toEqual('ng-binding foo baz');

        async.done();
      });
    }));

    it('should retain existing classes when expression evaluates to null', inject([AsyncTestCompleter], (async) => {
      var template = '<div [class]="expr"></div>';
      compileWithTemplate(template).then((pv) => {
        createView(pv);
        cd.detectChanges();
        expect(view.nodes[0].className).toEqual('ng-binding foo');

        component.expr = null;
        cd.detectChanges();
        expect(view.nodes[0].className).toEqual('ng-binding foo');

        component.expr = {'foo': false, 'bar': true};
        cd.detectChanges();
        expect(view.nodes[0].className).toEqual('ng-binding bar');

        async.done();
      });
    }));

    it('should co-operate with the class attribute', inject([AsyncTestCompleter], (async) => {
      var template = '<div [class]="expr" class="init foo"></div>';
      compileWithTemplate(template).then((pv) => {
        createView(pv);

        StringMapWrapper.set(component.expr, 'bar', true);
        cd.detectChanges();
        expect(view.nodes[0].className).toEqual('init foo ng-binding bar');

        StringMapWrapper.set(component.expr, 'foo', false);
        cd.detectChanges();
        expect(view.nodes[0].className).toEqual('init ng-binding bar');

        async.done();
      });
    }));

    it('should co-operate with the class attribute and class.name binding', inject([AsyncTestCompleter], (async) => {
      var template = '<div class="init foo" [class]="expr" [class.baz]="condition"></div>';
      compileWithTemplate(template).then((pv) => {
        createView(pv);
        cd.detectChanges();
        expect(view.nodes[0].className).toEqual('init foo ng-binding baz');

        StringMapWrapper.set(component.expr, 'bar', true);
        cd.detectChanges();
        expect(view.nodes[0].className).toEqual('init foo ng-binding baz bar');

        StringMapWrapper.set(component.expr, 'foo', false);
        cd.detectChanges();
        expect(view.nodes[0].className).toEqual('init ng-binding baz bar');

        component.condition = false;
        cd.detectChanges();
        expect(view.nodes[0].className).toEqual('init ng-binding bar');

        async.done();
      });
    }));
  })
}

@Component({selector: 'test-cmp'})
class TestComponent {
  condition:boolean;
  expr;
  constructor() {
    this.condition = true;
    this.expr = {'foo': true, 'bar': false};
  }
}

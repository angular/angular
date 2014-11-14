import {describe, xit, it, expect, beforeEach, ddescribe, iit} from 'test_lib/test_lib';
import {ProtoView, ElementPropertyMemento, DirectivePropertyMemento} from 'core/compiler/view';
import {ProtoElementInjector, ElementInjector} from 'core/compiler/element_injector';
import {ProtoWatchGroup} from 'change_detection/watch_group';
import {ChangeDetector} from 'change_detection/change_detector';
import {Parser} from 'change_detection/parser/parser';
import {ClosureMap} from 'change_detection/parser/closure_map';
import {Lexer} from 'change_detection/parser/lexer';
import {DOM, Element} from 'facade/dom';
import {FIELD} from 'facade/lang';

export function main() {
  describe('view', function() {
    var parser, closureMap;

    beforeEach( () => {
      closureMap = new ClosureMap();
      parser = new Parser(new Lexer(), closureMap);
    });

    describe('ProtoView.instantiate', function() {

      function createCollectDomNodesTestCases(useTemplateElement:boolean) {

        function templateAwareCreateElement(html) {
          return createElement(useTemplateElement ? `<template>${html}</template>` : html);
        }

        it('should collect the root node in the ProtoView element', () => {
          var pv = new ProtoView(templateAwareCreateElement('<div id="1"></div>'), new ProtoWatchGroup());
          var view = pv.instantiate(null, null);
          expect(view.nodes.length).toBe(1);
          expect(view.nodes[0].getAttribute('id')).toEqual('1');
        });

        describe('collect elements with property bindings', () => {

          it('should collect property bindings on the root element if it has the ng-binding class', () => {
            var pv = new ProtoView(templateAwareCreateElement('<div [prop]="a" class="ng-binding"></div>'), new ProtoWatchGroup());
            pv.bindElement(null);
            pv.bindElementProperty('prop', parser.parseBinding('a'));

            var view = pv.instantiate(null, null);
            expect(view.bindElements.length).toEqual(1);
            expect(view.bindElements[0]).toBe(view.nodes[0]);
          });

          it('should collect property bindings on child elements with ng-binding class', () => {
            var pv = new ProtoView(templateAwareCreateElement('<div><span></span><span class="ng-binding"></span></div>'),
              new ProtoWatchGroup());
            pv.bindElement(null);
            pv.bindElementProperty('a', parser.parseBinding('b'));

            var view = pv.instantiate(null, null);
            expect(view.bindElements.length).toEqual(1);
            expect(view.bindElements[0]).toBe(view.nodes[0].childNodes[1]);
          });

        });

        describe('collect text nodes with bindings', () => {

          it('should collect text nodes under the root element', () => {
            var pv = new ProtoView(templateAwareCreateElement('<div class="ng-binding">{{}}<span></span>{{}}</div>'), new ProtoWatchGroup());
            pv.bindElement(null);
            pv.bindTextNode(0, parser.parseBinding('a'));
            pv.bindTextNode(2, parser.parseBinding('b'));

            var view = pv.instantiate(null, null);
            expect(view.textNodes.length).toEqual(2);
            expect(view.textNodes[0]).toBe(view.nodes[0].childNodes[0]);
            expect(view.textNodes[1]).toBe(view.nodes[0].childNodes[2]);
          });

          it('should collect text nodes with bindings on child elements with ng-binding class', () => {
            var pv = new ProtoView(templateAwareCreateElement('<div><span> </span><span class="ng-binding">{{}}</span></div>'),
              new ProtoWatchGroup());
            pv.bindElement(null);
            pv.bindTextNode(0, parser.parseBinding('b'));

            var view = pv.instantiate(null, null);
            expect(view.textNodes.length).toEqual(1);
            expect(view.textNodes[0]).toBe(view.nodes[0].childNodes[1].childNodes[0]);
          });

        });
      }

      describe('collect dom nodes with a regular element as root', () => {
        createCollectDomNodesTestCases(false);
      });

      describe('collect dom nodes with a template element as root', () => {
        createCollectDomNodesTestCases(true);
      });

      describe('create ElementInjectors', () => {
        it('should use the directives of the ProtoElementInjector', () => {
          var pv = new ProtoView(createElement('<div class="ng-binding"></div>'), new ProtoWatchGroup());
          pv.bindElement(new ProtoElementInjector(null, 1, [Directive]));

          var view = pv.instantiate(null, null);
          expect(view.elementInjectors.length).toBe(1);
          expect(view.elementInjectors[0].get(Directive) instanceof Directive).toBe(true);
        });

        it('should use the correct parent', () => {
          var pv = new ProtoView(createElement('<div class="ng-binding"><span class="ng-binding"></span></div>'),
            new ProtoWatchGroup());
          var protoParent = new ProtoElementInjector(null, 0, [Directive]);
          pv.bindElement(protoParent);
          pv.bindElement(new ProtoElementInjector(protoParent, 1, [AnotherDirective]));

          var view = pv.instantiate(null, null);
          expect(view.elementInjectors.length).toBe(2);
          expect(view.elementInjectors[0].get(Directive) instanceof Directive).toBe(true);
          expect(view.elementInjectors[1].parent).toBe(view.elementInjectors[0]);
        });
      });

      describe('collect root element injectors', () => {

        it('should collect a single root element injector', () => {
          var pv = new ProtoView(createElement('<div class="ng-binding"><span class="ng-binding"></span></div>'),
            new ProtoWatchGroup());
          var protoParent = new ProtoElementInjector(null, 0, [Directive]);
          pv.bindElement(protoParent);
          pv.bindElement(new ProtoElementInjector(protoParent, 1, [AnotherDirective]));

          var view = pv.instantiate(null, null);
          expect(view.rootElementInjectors.length).toBe(1);
          expect(view.rootElementInjectors[0].get(Directive) instanceof Directive).toBe(true);
        });

        it('should collect multiple root element injectors', () => {
          var pv = new ProtoView(createElement('<div><span class="ng-binding"></span><span class="ng-binding"></span></div>'),
            new ProtoWatchGroup());
          pv.bindElement(new ProtoElementInjector(null, 1, [Directive]));
          pv.bindElement(new ProtoElementInjector(null, 2, [AnotherDirective]));

          var view = pv.instantiate(null, null);
          expect(view.rootElementInjectors.length).toBe(2);
          expect(view.rootElementInjectors[0].get(Directive) instanceof Directive).toBe(true);
          expect(view.rootElementInjectors[1].get(AnotherDirective) instanceof AnotherDirective).toBe(true);
        });

      });

      describe('react to watch group changes', () => {
        var view, cd, ctx;

        function createView(protoView) {
          ctx = new MyEvaluationContext();
          view = protoView.instantiate(ctx, null);
          cd = new ChangeDetector(view.watchGroup);
        }

        it('should consume text node changes', () => {
          var pv = new ProtoView(createElement('<div class="ng-binding">{{}}</div>'),
            new ProtoWatchGroup());
          pv.bindElement(null);
          pv.bindTextNode(0, parser.parseBinding('foo'));
          createView(pv);

          ctx.foo = 'buz';
          cd.detectChanges();
          expect(view.textNodes[0].nodeValue).toEqual('buz');
        });

        it('should consume element binding changes', () => {
          var pv = new ProtoView(createElement('<div class="ng-binding"></div>'),
            new ProtoWatchGroup());
          pv.bindElement(null);
          pv.bindElementProperty('id', parser.parseBinding('foo'));
          createView(pv);

          ctx.foo = 'buz';
          cd.detectChanges();
          expect(view.bindElements[0].id).toEqual('buz');
        });

        it('should consume directive watch expression change.', () => {
          var pv = new ProtoView(createElement('<div class="ng-binding"></div>'),
            new ProtoWatchGroup());
          pv.bindElement(new ProtoElementInjector(null, 0, [Directive]));
          pv.bindDirectiveProperty( 0, parser.parseBinding('foo'), 'prop', closureMap.setter('prop'));
          createView(pv);

          ctx.foo = 'buz';
          cd.detectChanges();
          expect(view.elementInjectors[0].get(Directive).prop).toEqual('buz');
        });
      });

    });
  });
}

class Directive {
  @FIELD('prop')
  constructor() {
    this.prop = 'foo';
  }
}

class AnotherDirective {
  @FIELD('prop')
  constructor() {
    this.prop = 'anotherFoo';
  }
}

class MyEvaluationContext {
  @FIELD('foo')
  constructor() {
    this.foo = 'bar';
  };
}

function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BindingType, ParsedEventType} from '../../src/expression_parser/ast';
import * as t from '../../src/render3/r3_ast';
import {unparse} from '../expression_parser/utils/unparser';

import {parseR3 as parse} from './view/util';

// Transform an IVY AST to a flat list of nodes to ease testing
class R3AstHumanizer implements t.Visitor<void> {
  result: (string | number | null)[][] = [];

  visitElement(element: t.Element) {
    const res = ['Element', element.name];
    this.result.push(res);
    if (element.isSelfClosing) {
      res.push('#selfClosing');
    }
    this.visitAll([
      element.attributes,
      element.inputs,
      element.outputs,
      element.directives,
      element.references,
      element.children,
    ]);
  }

  visitTemplate(template: t.Template) {
    const res = ['Template'];
    if (template.isSelfClosing) {
      res.push('#selfClosing');
    }
    this.result.push(res);
    this.visitAll([
      template.attributes,
      template.inputs,
      template.outputs,
      template.directives,
      template.templateAttrs,
      template.references,
      template.variables,
      template.children,
    ]);
  }

  visitContent(content: t.Content) {
    const res = ['Content', content.selector];
    this.result.push(res);
    if (content.isSelfClosing) {
      res.push('#selfClosing');
    }
    this.visitAll([content.attributes, content.children]);
  }

  visitVariable(variable: t.Variable) {
    this.result.push(['Variable', variable.name, variable.value]);
  }

  visitReference(reference: t.Reference) {
    this.result.push(['Reference', reference.name, reference.value]);
  }

  visitTextAttribute(attribute: t.TextAttribute) {
    this.result.push(['TextAttribute', attribute.name, attribute.value]);
  }

  visitBoundAttribute(attribute: t.BoundAttribute) {
    this.result.push(['BoundAttribute', attribute.type, attribute.name, unparse(attribute.value)]);
  }

  visitBoundEvent(event: t.BoundEvent) {
    this.result.push(['BoundEvent', event.type, event.name, event.target, unparse(event.handler)]);
  }

  visitText(text: t.Text) {
    this.result.push(['Text', text.value]);
  }

  visitBoundText(text: t.BoundText) {
    this.result.push(['BoundText', unparse(text.value)]);
  }

  visitIcu(icu: t.Icu) {
    return null;
  }

  visitDeferredBlock(deferred: t.DeferredBlock): void {
    this.result.push(['DeferredBlock']);
    deferred.visitAll(this);
  }

  visitSwitchBlock(block: t.SwitchBlock): void {
    this.result.push(['SwitchBlock', unparse(block.expression)]);
    this.visitAll([block.cases]);
  }

  visitSwitchBlockCase(block: t.SwitchBlockCase): void {
    this.result.push([
      'SwitchBlockCase',
      block.expression === null ? null : unparse(block.expression),
    ]);
    this.visitAll([block.children]);
  }

  visitForLoopBlock(block: t.ForLoopBlock): void {
    const result: any[] = ['ForLoopBlock', unparse(block.expression), unparse(block.trackBy)];
    this.result.push(result);
    this.visitAll([[block.item], block.contextVariables, block.children]);
    block.empty?.visit(this);
  }

  visitForLoopBlockEmpty(block: t.ForLoopBlockEmpty): void {
    this.result.push(['ForLoopBlockEmpty']);
    this.visitAll([block.children]);
  }

  visitIfBlock(block: t.IfBlock): void {
    this.result.push(['IfBlock']);
    this.visitAll([block.branches]);
  }

  visitIfBlockBranch(block: t.IfBlockBranch): void {
    this.result.push([
      'IfBlockBranch',
      block.expression === null ? null : unparse(block.expression),
    ]);
    const toVisit = [block.children];
    block.expressionAlias !== null && toVisit.unshift([block.expressionAlias]);
    this.visitAll(toVisit);
  }

  visitDeferredTrigger(trigger: t.DeferredTrigger): void {
    if (trigger instanceof t.BoundDeferredTrigger) {
      this.result.push(['BoundDeferredTrigger', unparse(trigger.value)]);
    } else if (trigger instanceof t.ImmediateDeferredTrigger) {
      this.result.push(['ImmediateDeferredTrigger']);
    } else if (trigger instanceof t.HoverDeferredTrigger) {
      this.result.push(['HoverDeferredTrigger', trigger.reference]);
    } else if (trigger instanceof t.IdleDeferredTrigger) {
      this.result.push(['IdleDeferredTrigger']);
    } else if (trigger instanceof t.TimerDeferredTrigger) {
      this.result.push(['TimerDeferredTrigger', trigger.delay]);
    } else if (trigger instanceof t.InteractionDeferredTrigger) {
      this.result.push(['InteractionDeferredTrigger', trigger.reference]);
    } else if (trigger instanceof t.ViewportDeferredTrigger) {
      this.result.push(['ViewportDeferredTrigger', trigger.reference]);
    } else if (trigger instanceof t.NeverDeferredTrigger) {
      this.result.push(['NeverDeferredTrigger']);
    } else {
      throw new Error('Unknown trigger');
    }
  }

  visitDeferredBlockPlaceholder(block: t.DeferredBlockPlaceholder): void {
    const result = ['DeferredBlockPlaceholder'];
    block.minimumTime !== null && result.push(`minimum ${block.minimumTime}ms`);
    this.result.push(result);
    this.visitAll([block.children]);
  }

  visitDeferredBlockLoading(block: t.DeferredBlockLoading): void {
    const result = ['DeferredBlockLoading'];
    block.afterTime !== null && result.push(`after ${block.afterTime}ms`);
    block.minimumTime !== null && result.push(`minimum ${block.minimumTime}ms`);
    this.result.push(result);
    this.visitAll([block.children]);
  }

  visitDeferredBlockError(block: t.DeferredBlockError): void {
    this.result.push(['DeferredBlockError']);
    this.visitAll([block.children]);
  }

  visitUnknownBlock(block: t.UnknownBlock): void {
    this.result.push(['UnknownBlock', block.name]);
  }

  visitLetDeclaration(decl: t.LetDeclaration) {
    this.result.push(['LetDeclaration', decl.name, unparse(decl.value)]);
  }

  visitComponent(component: t.Component) {
    const res = ['Component', component.componentName, component.tagName, component.fullName];
    if (component.isSelfClosing) {
      res.push('#selfClosing');
    }
    this.result.push(res);
    this.visitAll([
      component.attributes,
      component.inputs,
      component.outputs,
      component.directives,
      component.references,
      component.children,
    ]);
  }

  visitDirective(directive: t.Directive): void {
    this.result.push(['Directive', directive.name]);
    this.visitAll([
      directive.attributes,
      directive.inputs,
      directive.outputs,
      directive.references,
    ]);
  }

  private visitAll(nodes: t.Node[][]) {
    nodes.forEach((node) => t.visitAll(this, node));
  }
}

function expectFromHtml(html: string, ignoreError = false, selectorlessEnabled = false) {
  const res = parse(html, {ignoreError, selectorlessEnabled});
  return expectFromR3Nodes(res.nodes);
}

function expectFromR3Nodes(nodes: t.Node[]) {
  const humanizer = new R3AstHumanizer();
  t.visitAll(humanizer, nodes);
  return expect(humanizer.result);
}

function expectSpanFromHtml(html: string) {
  const {nodes} = parse(html);
  return expect(nodes[0]!.sourceSpan.toString());
}

describe('R3 template transform', () => {
  describe('ParseSpan on nodes toString', () => {
    it('should create valid text span on Element with adjacent start and end tags', () => {
      expectSpanFromHtml('<div></div>').toBe('<div></div>');
    });
  });

  describe('Nodes without binding', () => {
    it('should parse incomplete tags terminated by EOF', () => {
      expectFromHtml('<a', true /* ignoreError */).toEqual([['Element', 'a']]);
    });

    it('should parse incomplete tags terminated by another tag', () => {
      expectFromHtml('<a <span></span>', true /* ignoreError */).toEqual([
        ['Element', 'a'],
        ['Element', 'span'],
      ]);
    });

    it('should parse text nodes', () => {
      expectFromHtml('a').toEqual([['Text', 'a']]);
    });

    it('should parse elements with attributes', () => {
      expectFromHtml('<div a=b></div>').toEqual([
        ['Element', 'div'],
        ['TextAttribute', 'a', 'b'],
      ]);
    });

    it('should parse ngContent', () => {
      const res = parse('<ng-content select="a"></ng-content>');
      expectFromR3Nodes(res.nodes).toEqual([
        ['Content', 'a'],
        ['TextAttribute', 'select', 'a'],
      ]);
    });

    it('should parse ngContent when it contains WS only', () => {
      expectFromHtml('<ng-content select="a">    \n   </ng-content>').toEqual([
        ['Content', 'a'],
        ['TextAttribute', 'select', 'a'],
      ]);
    });

    it('should parse ngContent regardless the namespace', () => {
      expectFromHtml('<svg><ng-content select="a"></ng-content></svg>').toEqual([
        ['Element', ':svg:svg'],
        ['Content', 'a'],
        ['TextAttribute', 'select', 'a'],
      ]);
    });
  });

  describe('Bound text nodes', () => {
    it('should parse bound text nodes', () => {
      expectFromHtml('{{a}}').toEqual([['BoundText', '{{ a }}']]);
    });
  });

  describe('Bound attributes', () => {
    it('should parse mixed case bound properties', () => {
      expectFromHtml('<div [someProp]="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundAttribute', BindingType.Property, 'someProp', 'v'],
      ]);
    });

    it('should parse bound properties via bind- ', () => {
      expectFromHtml('<div bind-prop="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundAttribute', BindingType.Property, 'prop', 'v'],
      ]);
    });

    it('should report missing property names in bind- syntax', () => {
      expect(() => parse('<div bind-></div>')).toThrowError(/Property name is missing in binding/);
    });

    it('should parse bound properties via {{...}}', () => {
      expectFromHtml('<div prop="{{v}}"></div>').toEqual([
        ['Element', 'div'],
        ['BoundAttribute', BindingType.Property, 'prop', '{{ v }}'],
      ]);
    });

    it('should parse dash case bound properties', () => {
      expectFromHtml('<div [some-prop]="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundAttribute', BindingType.Property, 'some-prop', 'v'],
      ]);
    });

    it('should parse dotted name bound properties', () => {
      expectFromHtml('<div [d.ot]="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundAttribute', BindingType.Property, 'd.ot', 'v'],
      ]);
    });

    it('should not normalize property names via the element schema', () => {
      expectFromHtml('<div [mappedAttr]="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundAttribute', BindingType.Property, 'mappedAttr', 'v'],
      ]);
    });

    it('should parse mixed case bound attributes', () => {
      expectFromHtml('<div [attr.someAttr]="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundAttribute', BindingType.Attribute, 'someAttr', 'v'],
      ]);
    });

    it('should parse and dash case bound classes', () => {
      expectFromHtml('<div [class.some-class]="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundAttribute', BindingType.Class, 'some-class', 'v'],
      ]);
    });

    it('should parse mixed case bound classes', () => {
      expectFromHtml('<div [class.someClass]="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundAttribute', BindingType.Class, 'someClass', 'v'],
      ]);
    });

    it('should parse mixed case bound styles', () => {
      expectFromHtml('<div [style.someStyle]="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundAttribute', BindingType.Style, 'someStyle', 'v'],
      ]);
    });
  });

  describe('templates', () => {
    it('should support * directives', () => {
      expectFromHtml('<div *ngIf></div>').toEqual([
        ['Template'],
        ['TextAttribute', 'ngIf', ''],
        ['Element', 'div'],
      ]);
    });

    it('should support <ng-template>', () => {
      expectFromHtml('<ng-template></ng-template>').toEqual([['Template']]);
    });

    it('should support <ng-template> regardless the namespace', () => {
      expectFromHtml('<svg><ng-template></ng-template></svg>').toEqual([
        ['Element', ':svg:svg'],
        ['Template'],
      ]);
    });

    it('should support <ng-template> with structural directive', () => {
      expectFromHtml('<ng-template *ngIf="true"></ng-template>').toEqual([
        ['Template'],
        ['BoundAttribute', 0, 'ngIf', 'true'],
        ['Template'],
      ]);
      const res = parse('<ng-template *ngIf="true"></ng-template>', {ignoreError: false});
      expect((res.nodes[0] as t.Template).tagName).toEqual(null);
      expect(((res.nodes[0] as t.Template).children[0] as t.Template).tagName).toEqual(
        'ng-template',
      );
    });

    it('should support reference via #...', () => {
      expectFromHtml('<ng-template #a></ng-template>').toEqual([
        ['Template'],
        ['Reference', 'a', ''],
      ]);
    });

    it('should support reference via ref-...', () => {
      expectFromHtml('<ng-template ref-a></ng-template>').toEqual([
        ['Template'],
        ['Reference', 'a', ''],
      ]);
    });

    it('should report an error if a reference is used multiple times on the same template', () => {
      expect(() => parse('<ng-template #a #a></ng-template>')).toThrowError(
        /Reference "#a" is defined more than once/,
      );
    });

    it('should parse variables via let-...', () => {
      expectFromHtml('<ng-template let-a="b"></ng-template>').toEqual([
        ['Template'],
        ['Variable', 'a', 'b'],
      ]);
    });

    it('should parse attributes', () => {
      expectFromHtml('<ng-template k1="v1" k2="v2"></ng-template>').toEqual([
        ['Template'],
        ['TextAttribute', 'k1', 'v1'],
        ['TextAttribute', 'k2', 'v2'],
      ]);
    });

    it('should parse bound attributes', () => {
      expectFromHtml('<ng-template [k1]="v1" [k2]="v2"></ng-template>').toEqual([
        ['Template'],
        ['BoundAttribute', BindingType.Property, 'k1', 'v1'],
        ['BoundAttribute', BindingType.Property, 'k2', 'v2'],
      ]);
    });
  });

  describe('inline templates', () => {
    it('should support attribute and bound attributes', () => {
      // Desugared form is
      // <ng-template ngFor [ngForOf]="items" let-item>
      //   <div></div>
      // </ng-template>
      expectFromHtml('<div *ngFor="let item of items"></div>').toEqual([
        ['Template'],
        ['TextAttribute', 'ngFor', ''],
        ['BoundAttribute', BindingType.Property, 'ngForOf', 'items'],
        ['Variable', 'item', '$implicit'],
        ['Element', 'div'],
      ]);

      // Note that this test exercises an *incorrect* usage of the ngFor
      // directive. There is a missing 'let' in the beginning of the expression
      // which causes the template to be desugared into
      // <ng-template [ngFor]="item" [ngForOf]="items">
      //   <div></div>
      // </ng-template>
      expectFromHtml('<div *ngFor="item of items"></div>').toEqual([
        ['Template'],
        ['BoundAttribute', BindingType.Property, 'ngFor', 'item'],
        ['BoundAttribute', BindingType.Property, 'ngForOf', 'items'],
        ['Element', 'div'],
      ]);
    });

    it('should parse variables via let ...', () => {
      expectFromHtml('<div *ngIf="let a=b"></div>').toEqual([
        ['Template'],
        ['TextAttribute', 'ngIf', ''],
        ['Variable', 'a', 'b'],
        ['Element', 'div'],
      ]);
    });

    it('should parse variables via as ...', () => {
      expectFromHtml('<div *ngIf="expr as local"></div>').toEqual([
        ['Template'],
        ['BoundAttribute', BindingType.Property, 'ngIf', 'expr'],
        ['Variable', 'local', 'ngIf'],
        ['Element', 'div'],
      ]);
    });
  });

  describe('events', () => {
    it('should parse bound events with a target', () => {
      expectFromHtml('<div (window:event)="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundEvent', ParsedEventType.Regular, 'event', 'window', 'v'],
      ]);
    });

    it('should parse event names case sensitive', () => {
      expectFromHtml('<div (some-event)="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundEvent', ParsedEventType.Regular, 'some-event', null, 'v'],
      ]);
      expectFromHtml('<div (someEvent)="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundEvent', ParsedEventType.Regular, 'someEvent', null, 'v'],
      ]);
    });

    it('should parse bound events via on-', () => {
      expectFromHtml('<div on-event="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundEvent', ParsedEventType.Regular, 'event', null, 'v'],
      ]);
    });

    it('should report missing event names in on- syntax', () => {
      expect(() => parse('<div on-></div>')).toThrowError(/Event name is missing in binding/);
    });

    it('should parse bound events and properties via [(...)]', () => {
      expectFromHtml('<div [(prop)]="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundAttribute', BindingType.TwoWay, 'prop', 'v'],
        ['BoundEvent', ParsedEventType.TwoWay, 'propChange', null, 'v'],
      ]);
    });

    it('should parse $any in a two-way binding', () => {
      expectFromHtml('<div [(prop)]="$any(v)"></div>').toEqual([
        ['Element', 'div'],
        ['BoundAttribute', BindingType.TwoWay, 'prop', '$any(v)'],
        ['BoundEvent', ParsedEventType.TwoWay, 'propChange', null, '$any(v)'],
      ]);
    });

    it('should parse bound events and properties via bindon-', () => {
      expectFromHtml('<div bindon-prop="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundAttribute', BindingType.TwoWay, 'prop', 'v'],
        ['BoundEvent', ParsedEventType.TwoWay, 'propChange', null, 'v'],
      ]);
    });

    it('should parse bound events and properties via [(...)] with non-null operator', () => {
      expectFromHtml('<div [(prop)]="v!"></div>').toEqual([
        ['Element', 'div'],
        ['BoundAttribute', BindingType.TwoWay, 'prop', 'v!'],
        ['BoundEvent', ParsedEventType.TwoWay, 'propChange', null, 'v!'],
      ]);
    });

    it('should parse property reads bound via [(...)]', () => {
      expectFromHtml('<div [(prop)]="a.b.c"></div>').toEqual([
        ['Element', 'div'],
        ['BoundAttribute', BindingType.TwoWay, 'prop', 'a.b.c'],
        ['BoundEvent', ParsedEventType.TwoWay, 'propChange', null, 'a.b.c'],
      ]);
    });

    it('should parse keyed reads bound via [(...)]', () => {
      expectFromHtml(`<div [(prop)]="a['b']['c']"></div>`).toEqual([
        ['Element', 'div'],
        ['BoundAttribute', BindingType.TwoWay, 'prop', `a["b"]["c"]`],
        ['BoundEvent', ParsedEventType.TwoWay, 'propChange', null, `a["b"]["c"]`],
      ]);
    });

    it('should report assignments in two-way bindings', () => {
      expect(() => parse(`<div [(prop)]="v = 1"></div>`)).toThrowError(
        /Bindings cannot contain assignments/,
      );
    });

    it('should report pipes in two-way bindings', () => {
      expect(() => parse(`<div [(prop)]="v | pipe"></div>`)).toThrowError(
        /Cannot have a pipe in an action expression/,
      );
    });

    it('should report unsupported expressions in two-way bindings', () => {
      const unsupportedExpressions = [
        'v + 1',
        'foo.bar?.baz',
        `foo.bar?.['baz']`,
        'true',
        '123',
        'a.b()',
        'v()',
        '[1, 2, 3]',
        '{a: 1, b: 2, c: 3}',
        'v === 1',
        'a || b',
        'a && b',
        'a ?? b',
        '!a',
        '!!a',
        'a ? b : c',
        '$any(a || b)',
        'this.$any(a)',
        '$any(a, b)',
      ];

      for (const expression of unsupportedExpressions) {
        expect(() => parse(`<div [(prop)]="${expression}"></div>`))
          .withContext(expression)
          .toThrowError(/Unsupported expression in a two-way binding/);
      }
    });

    it('should report an error for assignments into non-null asserted expressions', () => {
      // TODO(joost): this syntax is allowed in TypeScript. Consider changing the grammar to
      //  allow this syntax, or improve the error message.
      // See https://github.com/angular/angular/pull/37809
      expect(() => parse('<div (prop)="v! = $event"></div>')).toThrowError(
        /Unexpected token '=' at column 4/,
      );
    });

    it('should report missing property names in bindon- syntax', () => {
      expect(() => parse('<div bindon-></div>')).toThrowError(
        /Property name is missing in binding/,
      );
    });

    it('should report an error on empty expression', () => {
      expect(() => parse('<div (event)="">')).toThrowError(/Empty expressions are not allowed/);
      expect(() => parse('<div (event)="   ">')).toThrowError(/Empty expressions are not allowed/);
    });

    it('should parse bound animation events when event name is empty', () => {
      expectFromHtml('<div (@)="onAnimationEvent($event)"></div>', true).toEqual([
        ['Element', 'div'],
        ['BoundEvent', ParsedEventType.Animation, '', null, 'onAnimationEvent($event)'],
      ]);
      expect(() => parse('<div (@)></div>')).toThrowError(
        /Animation event name is missing in binding/,
      );
    });

    it('should report invalid phase value of animation event', () => {
      expect(() => parse('<div (@event.invalidPhase)></div>')).toThrowError(
        /The provided animation output phase value "invalidphase" for "@event" is not supported \(use start or done\)/,
      );
      expect(() => parse('<div (@event.)></div>')).toThrowError(
        /The animation trigger output event \(@event\) is missing its phase value name \(start or done are currently supported\)/,
      );
      expect(() => parse('<div (@event)></div>')).toThrowError(
        /The animation trigger output event \(@event\) is missing its phase value name \(start or done are currently supported\)/,
      );
    });
  });

  describe('variables', () => {
    it('should report variables not on template elements', () => {
      expect(() => parse('<div let-a-name="b"></div>')).toThrowError(
        /"let-" is only supported on ng-template elements./,
      );
    });

    it('should report missing variable names', () => {
      expect(() => parse('<ng-template let-><ng-template>')).toThrowError(
        /Variable does not have a name/,
      );
    });
  });

  describe('references', () => {
    it('should parse references via #...', () => {
      expectFromHtml('<div #a></div>').toEqual([
        ['Element', 'div'],
        ['Reference', 'a', ''],
      ]);
    });

    it('should parse references via ref-', () => {
      expectFromHtml('<div ref-a></div>').toEqual([
        ['Element', 'div'],
        ['Reference', 'a', ''],
      ]);
    });

    it('should parse camel case references', () => {
      expectFromHtml('<div #someA></div>').toEqual([
        ['Element', 'div'],
        ['Reference', 'someA', ''],
      ]);
    });

    it('should report invalid reference names', () => {
      expect(() => parse('<div #a-b></div>')).toThrowError(/"-" is not allowed in reference names/);
    });

    it('should report missing reference names', () => {
      expect(() => parse('<div #></div>')).toThrowError(/Reference does not have a name/);
    });

    it('should report an error if a reference is used multiple times on the same element', () => {
      expect(() => parse('<div #a #a></div>')).toThrowError(
        /Reference "#a" is defined more than once/,
      );
    });
  });

  describe('literal attribute', () => {
    it('should report missing animation trigger in @ syntax', () => {
      expect(() => parse('<div @></div>')).toThrowError(/Animation trigger is missing/);
    });
  });

  describe('ng-content', () => {
    it('should parse ngContent without selector', () => {
      const res = parse('<ng-content></ng-content>');
      expectFromR3Nodes(res.nodes).toEqual([['Content', '*']]);
    });

    it('should parse ngContent with a specific selector', () => {
      const res = parse('<ng-content select="tag[attribute]"></ng-content>');
      const selectors = ['', 'tag[attribute]'];
      expectFromR3Nodes(res.nodes).toEqual([
        ['Content', selectors[1]],
        ['TextAttribute', 'select', selectors[1]],
      ]);
    });

    it('should parse ngContent with a selector', () => {
      const res = parse(
        '<ng-content select="a"></ng-content><ng-content></ng-content><ng-content select="b"></ng-content>',
      );
      const selectors = ['*', 'a', 'b'];
      expectFromR3Nodes(res.nodes).toEqual([
        ['Content', selectors[1]],
        ['TextAttribute', 'select', selectors[1]],
        ['Content', selectors[0]],
        ['Content', selectors[2]],
        ['TextAttribute', 'select', selectors[2]],
      ]);
    });

    it('should parse ngProjectAs as an attribute', () => {
      const res = parse('<ng-content ngProjectAs="a"></ng-content>');
      expectFromR3Nodes(res.nodes).toEqual([
        ['Content', '*'],
        ['TextAttribute', 'ngProjectAs', 'a'],
      ]);
    });

    it('should parse ngContent with children', () => {
      const res = parse(
        '<ng-content><section>Root <div>Parent <span>Child</span></div></section></ng-content>',
      );
      expectFromR3Nodes(res.nodes).toEqual([
        ['Content', '*'],
        ['Element', 'section'],
        ['Text', 'Root '],
        ['Element', 'div'],
        ['Text', 'Parent '],
        ['Element', 'span'],
        ['Text', 'Child'],
      ]);
    });
  });

  describe('Ignored elements', () => {
    it('should ignore <script> elements', () => {
      expectFromHtml('<script></script>a').toEqual([['Text', 'a']]);
    });

    it('should ignore <style> elements', () => {
      expectFromHtml('<style></style>a').toEqual([['Text', 'a']]);
    });
  });

  describe('<link rel="stylesheet">', () => {
    it('should keep <link rel="stylesheet"> elements if they have an absolute url', () => {
      expectFromHtml('<link rel="stylesheet" href="http://someurl">').toEqual([
        ['Element', 'link'],
        ['TextAttribute', 'rel', 'stylesheet'],
        ['TextAttribute', 'href', 'http://someurl'],
      ]);
      expectFromHtml('<link REL="stylesheet" href="http://someurl">').toEqual([
        ['Element', 'link'],
        ['TextAttribute', 'REL', 'stylesheet'],
        ['TextAttribute', 'href', 'http://someurl'],
      ]);
    });

    it('should keep <link rel="stylesheet"> elements if they have no uri', () => {
      expectFromHtml('<link rel="stylesheet">').toEqual([
        ['Element', 'link'],
        ['TextAttribute', 'rel', 'stylesheet'],
      ]);
      expectFromHtml('<link REL="stylesheet">').toEqual([
        ['Element', 'link'],
        ['TextAttribute', 'REL', 'stylesheet'],
      ]);
    });

    it('should ignore <link rel="stylesheet"> elements if they have a relative uri', () => {
      expectFromHtml('<link rel="stylesheet" href="./other.css">').toEqual([]);
      expectFromHtml('<link REL="stylesheet" HREF="./other.css">').toEqual([]);
    });
  });

  describe('ngNonBindable', () => {
    it('should ignore bindings on children of elements with ngNonBindable', () => {
      expectFromHtml('<div ngNonBindable>{{b}}</div>').toEqual([
        ['Element', 'div'],
        ['TextAttribute', 'ngNonBindable', ''],
        ['Text', '{{b}}'],
      ]);
    });

    it('should keep nested children of elements with ngNonBindable', () => {
      expectFromHtml('<div ngNonBindable><span>{{b}}</span></div>').toEqual([
        ['Element', 'div'],
        ['TextAttribute', 'ngNonBindable', ''],
        ['Element', 'span'],
        ['Text', '{{b}}'],
      ]);
    });

    it('should ignore <script> elements inside of elements with ngNonBindable', () => {
      expectFromHtml('<div ngNonBindable><script></script>a</div>').toEqual([
        ['Element', 'div'],
        ['TextAttribute', 'ngNonBindable', ''],
        ['Text', 'a'],
      ]);
    });

    it('should ignore <style> elements inside of elements with ngNonBindable', () => {
      expectFromHtml('<div ngNonBindable><style></style>a</div>').toEqual([
        ['Element', 'div'],
        ['TextAttribute', 'ngNonBindable', ''],
        ['Text', 'a'],
      ]);
    });

    it('should ignore <link rel="stylesheet"> elements inside of elements with ngNonBindable', () => {
      expectFromHtml('<div ngNonBindable><link rel="stylesheet">a</div>').toEqual([
        ['Element', 'div'],
        ['TextAttribute', 'ngNonBindable', ''],
        ['Text', 'a'],
      ]);
    });
  });

  describe('deferred blocks', () => {
    it('should parse a simple deferred block', () => {
      expectFromHtml('@defer{hello}').toEqual([['DeferredBlock'], ['Text', 'hello']]);
    });

    it('should parse a deferred block with a `when` trigger', () => {
      expectFromHtml('@defer (when isVisible() && loaded){hello}').toEqual([
        ['DeferredBlock'],
        ['BoundDeferredTrigger', 'isVisible() && loaded'],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with a single `on` trigger', () => {
      expectFromHtml('@defer (on idle){hello}').toEqual([
        ['DeferredBlock'],
        ['IdleDeferredTrigger'],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with multiple `on` triggers', () => {
      expectFromHtml('@defer (on idle, viewport(button)){hello}').toEqual([
        ['DeferredBlock'],
        ['IdleDeferredTrigger'],
        ['ViewportDeferredTrigger', 'button'],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with a non-parenthesized trigger at the end', () => {
      expectFromHtml('@defer (on idle, viewport(button), immediate){hello}').toEqual([
        ['DeferredBlock'],
        ['IdleDeferredTrigger'],
        ['ViewportDeferredTrigger', 'button'],
        ['ImmediateDeferredTrigger'],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with `when` and `on` triggers', () => {
      const template = '@defer (when isVisible(); on timer(100ms), idle, viewport(button)){hello}';

      expectFromHtml(template).toEqual([
        ['DeferredBlock'],
        ['BoundDeferredTrigger', 'isVisible()'],
        ['TimerDeferredTrigger', 100],
        ['IdleDeferredTrigger'],
        ['ViewportDeferredTrigger', 'button'],
        ['Text', 'hello'],
      ]);
    });

    it('should allow new line after trigger name', () => {
      const template = `@defer(\nwhen\nisVisible(); on\ntimer(100ms),\nidle, viewport(button)){hello}`;

      expectFromHtml(template).toEqual([
        ['DeferredBlock'],
        ['BoundDeferredTrigger', 'isVisible()'],
        ['TimerDeferredTrigger', 100],
        ['IdleDeferredTrigger'],
        ['ViewportDeferredTrigger', 'button'],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with a timer set in seconds', () => {
      expectFromHtml('@defer (on timer(10s)){hello}').toEqual([
        ['DeferredBlock'],
        ['TimerDeferredTrigger', 10000],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with a timer with a decimal point', () => {
      expectFromHtml('@defer (on timer(1.5s)){hello}').toEqual([
        ['DeferredBlock'],
        ['TimerDeferredTrigger', 1500],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with a timer that has no units', () => {
      expectFromHtml('@defer (on timer(100)){hello}').toEqual([
        ['DeferredBlock'],
        ['TimerDeferredTrigger', 100],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with a hover trigger', () => {
      expectFromHtml('@defer (on hover(button)){hello}').toEqual([
        ['DeferredBlock'],
        ['HoverDeferredTrigger', 'button'],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with an interaction trigger', () => {
      expectFromHtml('@defer (on interaction(button)){hello}').toEqual([
        ['DeferredBlock'],
        ['InteractionDeferredTrigger', 'button'],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with connected blocks', () => {
      expectFromHtml(
        '@defer {<calendar-cmp [date]="current"/>}' +
          '@loading {Loading...}' +
          '@placeholder {Placeholder content!}' +
          '@error {Loading failed :(}',
      ).toEqual([
        ['DeferredBlock'],
        ['Element', 'calendar-cmp', '#selfClosing'],
        ['BoundAttribute', 0, 'date', 'current'],
        ['DeferredBlockPlaceholder'],
        ['Text', 'Placeholder content!'],
        ['DeferredBlockLoading'],
        ['Text', 'Loading...'],
        ['DeferredBlockError'],
        ['Text', 'Loading failed :('],
      ]);
    });

    it('should parse a deferred block with comments between the connected blocks', () => {
      expectFromHtml(
        '@defer {<calendar-cmp [date]="current"/>}' +
          '<!-- Show this while loading --> @loading {Loading...}' +
          '<!-- Show this on the server --> @placeholder {Placeholder content!}' +
          '<!-- Show this on error --> @error {Loading failed :(}',
      ).toEqual([
        ['DeferredBlock'],
        ['Element', 'calendar-cmp', '#selfClosing'],
        ['BoundAttribute', 0, 'date', 'current'],
        ['DeferredBlockPlaceholder'],
        ['Text', 'Placeholder content!'],
        ['DeferredBlockLoading'],
        ['Text', 'Loading...'],
        ['DeferredBlockError'],
        ['Text', 'Loading failed :('],
      ]);
    });

    it(
      'should parse a deferred block with connected blocks that have an arbitrary ' +
        'amount of whitespace between them when preserveWhitespaces is enabled',
      () => {
        const template =
          '@defer {<calendar-cmp [date]="current"/>}' +
          '           @loading {Loading...}       ' +
          '\n\n @placeholder {Placeholder content!} \n\n' +
          '@error {Loading failed :(}';

        expectFromR3Nodes(parse(template, {preserveWhitespaces: true}).nodes).toEqual([
          // Note: we also expect the whitespace nodes between the blocks to be ignored here.
          ['DeferredBlock'],
          ['Element', 'calendar-cmp', '#selfClosing'],
          ['BoundAttribute', 0, 'date', 'current'],
          ['DeferredBlockPlaceholder'],
          ['Text', 'Placeholder content!'],
          ['DeferredBlockLoading'],
          ['Text', 'Loading...'],
          ['DeferredBlockError'],
          ['Text', 'Loading failed :('],
        ]);
      },
    );

    it('should parse a loading block with parameters', () => {
      expectFromHtml(
        '@defer{<calendar-cmp [date]="current"/>}' +
          '@loading (after 100ms; minimum 1.5s){Loading...}',
      ).toEqual([
        ['DeferredBlock'],
        ['Element', 'calendar-cmp', '#selfClosing'],
        ['BoundAttribute', 0, 'date', 'current'],
        ['DeferredBlockLoading', 'after 100ms', 'minimum 1500ms'],
        ['Text', 'Loading...'],
      ]);
    });

    it('should parse a placeholder block with parameters', () => {
      expectFromHtml(
        '@defer {<calendar-cmp [date]="current"/>}' + '@placeholder (minimum 1.5s){Placeholder...}',
      ).toEqual([
        ['DeferredBlock'],
        ['Element', 'calendar-cmp', '#selfClosing'],
        ['BoundAttribute', 0, 'date', 'current'],
        ['DeferredBlockPlaceholder', 'minimum 1500ms'],
        ['Text', 'Placeholder...'],
      ]);
    });

    it('should parse a deferred block with prefetch triggers', () => {
      const html =
        '@defer (on idle; prefetch on viewport(button), hover(button); prefetch when shouldPrefetch()){hello}';

      expectFromHtml(html).toEqual([
        ['DeferredBlock'],
        ['IdleDeferredTrigger'],
        ['ViewportDeferredTrigger', 'button'],
        ['HoverDeferredTrigger', 'button'],
        ['BoundDeferredTrigger', 'shouldPrefetch()'],
        ['Text', 'hello'],
      ]);
    });

    it('should allow arbitrary number of spaces after the `prefetch` keyword', () => {
      const html =
        '@defer (on idle; prefetch         on viewport(button), hover(button); prefetch    when shouldPrefetch()){hello}';

      expectFromHtml(html).toEqual([
        ['DeferredBlock'],
        ['IdleDeferredTrigger'],
        ['ViewportDeferredTrigger', 'button'],
        ['HoverDeferredTrigger', 'button'],
        ['BoundDeferredTrigger', 'shouldPrefetch()'],
        ['Text', 'hello'],
      ]);
    });

    it('should parse the hydrate-specific `never` trigger', () => {
      const html = '@defer (on idle; hydrate never){hello}';

      expectFromHtml(html).toEqual([
        ['DeferredBlock'],
        ['NeverDeferredTrigger'],
        ['IdleDeferredTrigger'],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with hydrate triggers', () => {
      const html =
        '@defer (on idle; hydrate on viewport, hover, timer(500); hydrate when shouldHydrate()){hello}';

      expectFromHtml(html).toEqual([
        ['DeferredBlock'],
        ['ViewportDeferredTrigger', null],
        ['HoverDeferredTrigger', null],
        ['TimerDeferredTrigger', 500],
        ['BoundDeferredTrigger', 'shouldHydrate()'],
        ['IdleDeferredTrigger'],
        ['Text', 'hello'],
      ]);
    });

    it('should allow arbitrary number of spaces after the `hydrate` keyword', () => {
      const html =
        '@defer (on idle; hydrate         on viewport, hover; hydrate    when shouldHydrate()){hello}';

      expectFromHtml(html).toEqual([
        ['DeferredBlock'],
        ['ViewportDeferredTrigger', null],
        ['HoverDeferredTrigger', null],
        ['BoundDeferredTrigger', 'shouldHydrate()'],
        ['IdleDeferredTrigger'],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a complete example', () => {
      expectFromHtml(
        '@defer (when isVisible() && foo; on hover(button), timer(10s), idle, immediate, ' +
          'interaction(button), viewport(container); prefetch on immediate; ' +
          'prefetch when isDataLoaded(); hydrate when shouldHydrate(); hydrate on viewport){' +
          '<calendar-cmp [date]="current"/>}@loading (minimum 1s; after 100ms){Loading...}' +
          '@placeholder (minimum 500){Placeholder content!}' +
          '@error {Loading failed :(}',
      ).toEqual([
        ['DeferredBlock'],
        ['BoundDeferredTrigger', 'shouldHydrate()'],
        ['ViewportDeferredTrigger', null],
        ['BoundDeferredTrigger', 'isVisible() && foo'],
        ['HoverDeferredTrigger', 'button'],
        ['TimerDeferredTrigger', 10000],
        ['IdleDeferredTrigger'],
        ['ImmediateDeferredTrigger'],
        ['InteractionDeferredTrigger', 'button'],
        ['ViewportDeferredTrigger', 'container'],
        ['ImmediateDeferredTrigger'],
        ['BoundDeferredTrigger', 'isDataLoaded()'],
        ['Element', 'calendar-cmp', '#selfClosing'],
        ['BoundAttribute', 0, 'date', 'current'],
        ['DeferredBlockPlaceholder', 'minimum 500ms'],
        ['Text', 'Placeholder content!'],
        ['DeferredBlockLoading', 'after 100ms', 'minimum 1000ms'],
        ['Text', 'Loading...'],
        ['DeferredBlockError'],
        ['Text', 'Loading failed :('],
      ]);
    });

    it('should treat blocks as plain text inside ngNonBindable', () => {
      expectFromHtml(
        '<div ngNonBindable>' +
          '@defer (when isVisible() && foo; on hover(button), timer(10s), idle, immediate, ' +
          'interaction(button), viewport(container); prefetch on immediate; ' +
          'prefetch when isDataLoaded(); hydrate when shouldHydrate(); hydrate on viewport){' +
          '<calendar-cmp [date]="current"/>}@loading (minimum 1s; after 100ms){Loading...}' +
          '@placeholder (minimum 500){Placeholder content!}' +
          '@error {Loading failed :(}' +
          '</div>',
      ).toEqual([
        ['Element', 'div'],
        ['TextAttribute', 'ngNonBindable', ''],
        [
          'Text',
          '@defer (when isVisible() && foo; on hover(button), timer(10s), idle, immediate, ' +
            'interaction(button), viewport(container); prefetch on immediate; ' +
            'prefetch when isDataLoaded(); hydrate when shouldHydrate(); hydrate on viewport){',
        ],
        ['Element', 'calendar-cmp', '#selfClosing'],
        ['TextAttribute', '[date]', 'current'],
        ['Text', '}'],
        ['Text', '@loading (minimum 1s; after 100ms){'],
        ['Text', 'Loading...'],
        ['Text', '}'],
        ['Text', '@placeholder (minimum 500){'],
        ['Text', 'Placeholder content!'],
        ['Text', '}'],
        ['Text', '@error {'],
        ['Text', 'Loading failed :('],
        ['Text', '}'],
      ]);
    });

    it('should parse triggers with implied target elements', () => {
      expectFromHtml(
        '@defer (on hover, interaction, viewport; prefetch on hover, interaction, viewport) {hello}' +
          '@placeholder {<implied-trigger/>}',
      ).toEqual([
        ['DeferredBlock'],
        ['HoverDeferredTrigger', null],
        ['InteractionDeferredTrigger', null],
        ['ViewportDeferredTrigger', null],
        ['HoverDeferredTrigger', null],
        ['InteractionDeferredTrigger', null],
        ['ViewportDeferredTrigger', null],
        ['Text', 'hello'],
        ['DeferredBlockPlaceholder'],
        ['Element', 'implied-trigger', '#selfClosing'],
      ]);
    });

    describe('block validations', () => {
      it('should report syntax error in `when` trigger', () => {
        expect(() => parse('@defer (when isVisible#){hello}')).toThrowError(
          /Invalid character \[#\]/,
        );
      });

      it('should report unrecognized trigger', () => {
        expect(() => parse('@defer (unknown visible()){hello}')).toThrowError(
          /Unrecognized trigger/,
        );
      });

      it('should report content before a connected block', () => {
        expect(() => parse('@defer {hello} <br> @placeholder {placeholder}')).toThrowError(
          /@placeholder block can only be used after an @defer block/,
        );
      });

      it('should report connected defer blocks used without a defer block', () => {
        expect(() => parse('@placeholder {placeholder}')).toThrowError(
          /@placeholder block can only be used after an @defer block/,
        );
        expect(() => parse('@loading {loading}')).toThrowError(
          /@loading block can only be used after an @defer block/,
        );
        expect(() => parse('@error {error}')).toThrowError(
          /@error block can only be used after an @defer block/,
        );
      });

      it('should report multiple placeholder blocks', () => {
        expect(() => parse('@defer {hello} @placeholder {p1} @placeholder {p2}')).toThrowError(
          /@defer block can only have one @placeholder block/,
        );
      });

      it('should report multiple loading blocks', () => {
        expect(() => parse('@defer {hello} @loading {l1} @loading {l2}')).toThrowError(
          /@defer block can only have one @loading block/,
        );
      });

      it('should report multiple error blocks', () => {
        expect(() => parse('@defer {hello} @error {e1} @error {e2}')).toThrowError(
          /@defer block can only have one @error block/,
        );
      });

      it('should report unrecognized parameter in placeholder block', () => {
        expect(() => parse('@defer {hello} @placeholder (unknown 100ms) {hi}')).toThrowError(
          /Unrecognized parameter in @placeholder block: "unknown 100ms"/,
        );
      });

      it('should report unrecognized parameter in loading block', () => {
        expect(() => parse('@defer {hello} @loading (unknown 100ms) {hi}')).toThrowError(
          /Unrecognized parameter in @loading block: "unknown 100ms"/,
        );
      });

      it('should report any parameter usage in error block', () => {
        expect(() => parse('@defer {hello} @error (foo) {hi}')).toThrowError(
          /@error block cannot have parameters/,
        );
      });

      it('should report if minimum placeholder time cannot be parsed', () => {
        expect(() => parse('@defer {hello} @placeholder (minimum 123abc) {hi}')).toThrowError(
          /Could not parse time value of parameter "minimum"/,
        );
      });

      it('should report if minimum loading time cannot be parsed', () => {
        expect(() => parse('@defer {hello} @loading (minimum 123abc) {hi}')).toThrowError(
          /Could not parse time value of parameter "minimum"/,
        );
      });

      it('should report if after loading time cannot be parsed', () => {
        expect(() => parse('@defer {hello} @loading (after 123abc) {hi}')).toThrowError(
          /Could not parse time value of parameter "after"/,
        );
      });

      it('should report unrecognized `on` trigger', () => {
        expect(() => parse('@defer (on foo) {hello}')).toThrowError(
          /Unrecognized trigger type "foo"/,
        );
      });

      it('should report missing comma after unparametarized `on` trigger', () => {
        expect(() => parse('@defer (on hover idle) {hello}')).toThrowError(/Unexpected token/);
      });

      it('should report missing comma after parametarized `on` trigger', () => {
        expect(() => parse('@defer (on viewport(button) idle) {hello}')).toThrowError(
          /Unexpected token/,
        );
      });

      it('should report mutliple commas after between `on` triggers', () => {
        expect(() => parse('@defer (on viewport(button), , idle) {hello}')).toThrowError(
          /Unexpected token/,
        );
      });

      it('should report unclosed parenthesis in `on` trigger', () => {
        expect(() => parse('@defer (on viewport(button) {hello}')).toThrowError(
          /Incomplete block "defer"/,
        );
      });

      it('should report incorrect closing parenthesis in `on` trigger', () => {
        expect(() => parse('@defer (on viewport(but)ton) {hello}')).toThrowError(
          /Unexpected token/,
        );
      });

      it('should report stray closing parenthesis in `on` trigger', () => {
        expect(() => parse('@defer (on idle)) {hello}')).toThrowError(/Unexpected character "EOF"/);
      });

      it('should report non-identifier token usage in `on` trigger', () => {
        expect(() => parse('@defer (on 123) {hello}')).toThrowError(/Unexpected token/);
      });

      it('should report if identifier is not followed by an opening parenthesis', () => {
        expect(() => parse('@defer (on viewport[]) {hello}')).toThrowError(/Unexpected token/);
      });

      it('should report if parameters are passed to `idle` trigger', () => {
        expect(() => parse('@defer (on idle(1)) {hello}')).toThrowError(
          /"idle" trigger cannot have parameters/,
        );
      });

      it('should report if no parameters are passed into `timer` trigger', () => {
        expect(() => parse('@defer (on timer) {hello}')).toThrowError(
          /"timer" trigger must have exactly one parameter/,
        );
      });

      it('should report if `timer` trigger value cannot be parsed', () => {
        expect(() => parse('@defer (on timer(123abc)) {hello}')).toThrowError(
          /Could not parse time value of trigger "timer"/,
        );
      });

      it('should report if `interaction` trigger has more than one parameter', () => {
        expect(() => parse('@defer (on interaction(a, b)) {hello}')).toThrowError(
          /"interaction" trigger can only have zero or one parameters/,
        );
      });

      it('should report if parameters are passed to `immediate` trigger', () => {
        expect(() => parse('@defer (on immediate(1)) {hello}')).toThrowError(
          /"immediate" trigger cannot have parameters/,
        );
      });

      it('should report if `hover` trigger has more than one parameter', () => {
        expect(() => parse('@defer (on hover(a, b)) {hello}')).toThrowError(
          /"hover" trigger can only have zero or one parameters/,
        );
      });

      it('should report if `viewport` trigger has more than one parameter', () => {
        expect(() => parse('@defer (on viewport(a, b)) {hello}')).toThrowError(
          /"viewport" trigger can only have zero or one parameters/,
        );
      });

      it('should report duplicate when triggers', () => {
        expect(() => parse('@defer (when isVisible(); when somethingElse()) {hello}')).toThrowError(
          /Duplicate "when" trigger is not allowed/,
        );
      });

      it('should report duplicate on triggers', () => {
        expect(() =>
          parse('@defer (on idle; when isVisible(); on timer(10), idle) {hello}'),
        ).toThrowError(/Duplicate "idle" trigger is not allowed/);
      });

      it('should report duplicate prefetch when triggers', () => {
        expect(() =>
          parse('@defer (prefetch when isVisible(); prefetch when somethingElse()) {hello}'),
        ).toThrowError(/Duplicate "when" trigger is not allowed/);
      });

      it('should report duplicate prefetch on triggers', () => {
        expect(() =>
          parse(
            '@defer (prefetch on idle; prefetch when isVisible(); prefetch on timer(10), idle) {hello}',
          ),
        ).toThrowError(/Duplicate "idle" trigger is not allowed/);
      });

      it('should report multiple minimum parameters on a placeholder block', () => {
        expect(() =>
          parse('@defer {hello} @placeholder (minimum 1s; minimum 500ms) {placeholder}'),
        ).toThrowError(/@placeholder block can only have one "minimum" parameter/);
      });

      it('should report multiple minimum parameters on a loading block', () => {
        expect(() =>
          parse('@defer {hello} @loading (minimum 1s; minimum 500ms) {loading}'),
        ).toThrowError(/@loading block can only have one "minimum" parameter/);
      });

      it('should report multiple after parameters on a loading block', () => {
        expect(() =>
          parse('@defer {hello} @loading (after 1s; after 500ms) {loading}'),
        ).toThrowError(/@loading block can only have one "after" parameter/);
      });

      it('should report if reference-based trigger has no reference and there is no placeholder block', () => {
        expect(() => parse('@defer (on viewport) {hello}')).toThrowError(
          /"viewport" trigger with no parameters can only be placed on an @defer that has a @placeholder block/,
        );
      });

      it('should report if reference-based trigger has no reference and the placeholder is empty', () => {
        expect(() => parse('@defer (on viewport) {hello} @placeholder {}')).toThrowError(
          /"viewport" trigger with no parameters can only be placed on an @defer that has a @placeholder block with exactly one root element node/,
        );
      });

      it('should report if reference-based trigger has no reference and the placeholder with text at the root', () => {
        expect(() => parse('@defer (on viewport) {hello} @placeholder {placeholder}')).toThrowError(
          /"viewport" trigger with no parameters can only be placed on an @defer that has a @placeholder block with exactly one root element node/,
        );
      });

      it('should report if reference-based trigger has no reference and the placeholder has multiple root elements', () => {
        expect(() =>
          parse('@defer (on viewport) {hello} @placeholder {<div></div><span></span>}'),
        ).toThrowError(
          /"viewport" trigger with no parameters can only be placed on an @defer that has a @placeholder block with exactly one root element node/,
        );
      });

      it('should report parameter passed to hydrate trigger with reference-based equivalent', () => {
        expect(() =>
          parse('@defer (on interaction(button); hydrate on interaction(button)) {hello}'),
        ).toThrowError(/Hydration trigger "interaction" cannot have parameters/);
      });

      it('should not report missing reference on hydrate trigger', () => {
        expect(() => parse('@defer (on immediate; hydrate on viewport) {hello}')).not.toThrow();
      });

      it('should report if reference-based trigger has no reference and there is no placeholder block but a hydrate trigger exists', () => {
        expect(() => parse('@defer (on viewport; hydrate on immediate) {hello}')).toThrowError(
          /"viewport" trigger with no parameters can only be placed on an @defer that has a @placeholder block/,
        );
      });

      it('should report if reference-based trigger has no reference and there is no placeholder block but a hydrate trigger exists and it is also viewport', () => {
        expect(() => parse('@defer (on viewport; hydrate on viewport) {hello}')).toThrowError(
          /"viewport" trigger with no parameters can only be placed on an @defer that has a @placeholder block/,
        );
      });

      it('should report never trigger used without `hydrate`', () => {
        expect(() => parse('@defer (on immediate; never) {hello}')).toThrowError(
          /Unrecognized trigger/,
        );
        expect(() => parse('@defer (on immediate; prefetch never) {hello}')).toThrowError(
          /Unrecognized trigger/,
        );
      });

      it('should report `hydrate never` used with additonal characters', () => {
        expect(() => parse('@defer (hydrate never, and thank you) {hello}')).toThrowError(
          /Unrecognized trigger/,
        );
      });

      it('should not report an error when `hydrate never` is used with additonal blocks', () => {
        expect(() => parse('@defer (hydrate never; on idle;) {hello}')).not.toThrowError(
          /Unrecognized trigger/,
        );
      });

      it('should not report an error when `hydrate never` is used with spaces', () => {
        expect(() => parse('@defer(hydrate never ; on idle ;) {hello}')).not.toThrowError(
          /Unrecognized trigger/,
        );
      });

      it('should not report an error when `hydrate never` is used after another block', () => {
        expect(() =>
          parse(`@defer(
        on idle;
        hydrate never) {hello}`),
        ).not.toThrowError(/Unrecognized trigger/);
      });

      it('should report when `hydrate never` is used together with another `hydrate` trigger', () => {
        // Extra trigger after `hydrate never`.
        expect(() =>
          parse('@defer (hydrate never; hydrate when shouldHydrate()) {hello}'),
        ).toThrowError(
          /Cannot specify additional `hydrate` triggers if `hydrate never` is present/,
        );

        // Extra trigger before `hydrate never`.
        expect(() =>
          parse('@defer (hydrate when shouldHydrate(); hydrate never) {hello}'),
        ).toThrowError(
          /Cannot specify additional `hydrate` triggers if `hydrate never` is present/,
        );
      });
    });
  });

  describe('switch blocks', () => {
    it('should parse a switch block', () => {
      expectFromHtml(`
          @switch (cond.kind) {
            @case (x()) { X case }
            @case ('hello') {<button>Y case</button>}
            @case (42) { Z case }
            @default { No case matched }
          }
        `).toEqual([
        ['SwitchBlock', 'cond.kind'],
        ['SwitchBlockCase', 'x()'],
        ['Text', ' X case '],
        ['SwitchBlockCase', '"hello"'],
        ['Element', 'button'],
        ['Text', 'Y case'],
        ['SwitchBlockCase', '42'],
        ['Text', ' Z case '],
        ['SwitchBlockCase', null],
        ['Text', ' No case matched '],
      ]);
    });

    // This is a special case for `switch` blocks, because `preserveWhitespaces` will cause
    // some text nodes with whitespace to be preserve in the primary block.
    it('should parse a switch block when preserveWhitespaces is enabled', () => {
      const template = `
        @switch (cond.kind) {
          @case (x()) {
            X case
          }
          @case ('hello') {
            <button>Y case</button>
          }
          @case (42) {
            Z case
          }
          @default {
            No case matched
          }
        }
      `;

      expectFromR3Nodes(parse(template, {preserveWhitespaces: true}).nodes).toEqual([
        ['Text', '\n        '],
        ['SwitchBlock', 'cond.kind'],
        ['SwitchBlockCase', 'x()'],
        ['Text', '\n            X case\n          '],
        ['SwitchBlockCase', '"hello"'],
        ['Text', '\n            '],
        ['Element', 'button'],
        ['Text', 'Y case'],
        ['Text', '\n          '],
        ['SwitchBlockCase', '42'],
        ['Text', '\n            Z case\n          '],
        ['SwitchBlockCase', null],
        ['Text', '\n            No case matched\n          '],
        ['Text', '\n      '],
      ]);
    });

    it('should parse a switch block with optional parentheses', () => {
      expectFromHtml(`
          @switch ((cond.kind)) {
            @case ((x())) { X case }
            @case (('hello')) {<button>Y case</button>}
            @case ((42)) { Z case }
            @default { No case matched }
          }
        `).toEqual([
        ['SwitchBlock', '(cond.kind)'],
        ['SwitchBlockCase', '(x())'],
        ['Text', ' X case '],
        ['SwitchBlockCase', '("hello")'],
        ['Element', 'button'],
        ['Text', 'Y case'],
        ['SwitchBlockCase', '(42)'],
        ['Text', ' Z case '],
        ['SwitchBlockCase', null],
        ['Text', ' No case matched '],
      ]);
    });

    it('should parse a nested switch block', () => {
      expectFromHtml(`
          @switch (cond) {
            @case ('a') {
              @switch (innerCond) {
                @case ('innerA') { Inner A }
                @case ('innerB') { Inner B }
              }
            }
            @case ('b') {<button>Y case</button>}
            @case ('c') { Z case }
            @default {
              @switch (innerCond) {
                @case ('innerC') { Inner C }
                @case ('innerD') { Inner D }
                @default {
                  @switch (innerInnerCond) {
                    @case ('innerInnerA') { Inner inner A }
                    @case ('innerInnerA') { Inner inner B }
                  }
                }
              }
            }
          }
        `).toEqual([
        ['SwitchBlock', 'cond'],
        ['SwitchBlockCase', '"a"'],
        ['SwitchBlock', 'innerCond'],
        ['SwitchBlockCase', '"innerA"'],
        ['Text', ' Inner A '],
        ['SwitchBlockCase', '"innerB"'],
        ['Text', ' Inner B '],
        ['SwitchBlockCase', '"b"'],
        ['Element', 'button'],
        ['Text', 'Y case'],
        ['SwitchBlockCase', '"c"'],
        ['Text', ' Z case '],
        ['SwitchBlockCase', null],
        ['SwitchBlock', 'innerCond'],
        ['SwitchBlockCase', '"innerC"'],
        ['Text', ' Inner C '],
        ['SwitchBlockCase', '"innerD"'],
        ['Text', ' Inner D '],
        ['SwitchBlockCase', null],
        ['SwitchBlock', 'innerInnerCond'],
        ['SwitchBlockCase', '"innerInnerA"'],
        ['Text', ' Inner inner A '],
        ['SwitchBlockCase', '"innerInnerA"'],
        ['Text', ' Inner inner B '],
      ]);
    });

    it('should parse a switch block containing comments', () => {
      expectFromHtml(`
          @switch (cond.kind) {
            <!-- X case -->
            @case (x) { X case }

            <!-- default case -->
            @default { No case matched }
          }
        `).toEqual([
        ['SwitchBlock', 'cond.kind'],
        ['SwitchBlockCase', 'x'],
        ['Text', ' X case '],
        ['SwitchBlockCase', null],
        ['Text', ' No case matched '],
      ]);
    });

    describe('validations', () => {
      it('should report syntax error in switch expression', () => {
        expect(() =>
          parse(`
          @switch (cond/.kind) {
            @case (x()) {X case}
            @default {No case matched}
          }
        `),
        ).toThrowError(/Parser Error: Unexpected token \./);
      });

      it('should report syntax error in case expression', () => {
        expect(() =>
          parse(`
          @switch (cond) {
            @case (x/.y) {X case}
          }
        `),
        ).toThrowError(/Parser Error: Unexpected token \./);
      });

      it('should report if a block different from "case" and "default" is used in a switch', () => {
        const result = parse(
          `
              @switch (cond) {
                @case (x()) {X case}
                @foo {Foo}
              }
            `,
          {ignoreError: true},
        );

        const switchNode = result.nodes[0] as t.SwitchBlock;
        expect(result.errors.map((e) => e.msg)).toEqual([
          '@switch block can only contain @case and @default blocks',
        ]);
        expect(switchNode.unknownBlocks.map((b) => b.name)).toEqual(['foo']);
      });

      it('should report if @case or @default is used outside of a switch block', () => {
        expect(() => parse(`@case (foo) {}`)).toThrowError(/Unrecognized block @case/);
        expect(() => parse(`@default {}`)).toThrowError(/Unrecognized block @default/);
      });

      it('should report if a switch has no parameters', () => {
        expect(() =>
          parse(`
          @switch {
            @case (1) {case}
          }
        `),
        ).toThrowError(/@switch block must have exactly one parameter/);
      });

      it('should report if a switch has more than one parameter', () => {
        expect(() =>
          parse(`
          @switch (foo; bar) {
            @case (1) {case}
          }
        `),
        ).toThrowError(/@switch block must have exactly one parameter/);
      });

      it('should report if a case has no parameters', () => {
        expect(() =>
          parse(`
          @switch (cond) {
            @case {case}
          }
        `),
        ).toThrowError(/@case block must have exactly one parameter/);
        expect(() =>
          parse(`
          @switch (cond) {
            @case (            ) {case}
          }
        `),
        ).toThrowError(/@case block must have exactly one parameter/);
      });

      it('should report if a case has more than one parameter', () => {
        expect(() =>
          parse(`
          @switch (cond) {
            @case (foo; bar) {case}
          }
        `),
        ).toThrowError(/@case block must have exactly one parameter/);
      });

      it('should report if a switch has multiple default blocks', () => {
        expect(() =>
          parse(`
          @switch (cond) {
            @case (foo) {foo}
            @default {one}
            @default {two}
          }
        `),
        ).toThrowError(/@switch block can only have one @default block/);
      });

      it('should report if a default block has parameters', () => {
        expect(() =>
          parse(`
          @switch (cond) {
            @case (foo) {foo}
            @default (bar) {bar}
          }
        `),
        ).toThrowError(/@default block cannot have parameters/);
      });
    });
  });

  describe('for loop blocks', () => {
    it('should parse a for loop block', () => {
      expectFromHtml(`
        @for (item of items.foo.bar; track item.id) {
          {{ item }}
        } @empty {
          There were no items in the list.
        }
      `).toEqual([
        ['ForLoopBlock', 'items.foo.bar', 'item.id'],
        ['Variable', 'item', '$implicit'],
        ['Variable', '$index', '$index'],
        ['Variable', '$first', '$first'],
        ['Variable', '$last', '$last'],
        ['Variable', '$even', '$even'],
        ['Variable', '$odd', '$odd'],
        ['Variable', '$count', '$count'],
        ['BoundText', ' {{ item }} '],
        ['ForLoopBlockEmpty'],
        ['Text', ' There were no items in the list. '],
      ]);
    });

    it('should parse a for loop block with optional parentheses', () => {
      expectFromHtml(`
        @for ((item of items.foo.bar); track item.id){
          {{ item }}
        }
      `).toEqual([
        ['ForLoopBlock', 'items.foo.bar', 'item.id'],
        ['Variable', 'item', '$implicit'],
        ['Variable', '$index', '$index'],
        ['Variable', '$first', '$first'],
        ['Variable', '$last', '$last'],
        ['Variable', '$even', '$even'],
        ['Variable', '$odd', '$odd'],
        ['Variable', '$count', '$count'],
        ['BoundText', ' {{ item }} '],
      ]);

      expectFromHtml(`
        @for ((item of items.foo.bar()); track item.id) {
          {{ item }}
        }
      `).toEqual([
        ['ForLoopBlock', 'items.foo.bar()', 'item.id'],
        ['Variable', 'item', '$implicit'],
        ['Variable', '$index', '$index'],
        ['Variable', '$first', '$first'],
        ['Variable', '$last', '$last'],
        ['Variable', '$even', '$even'],
        ['Variable', '$odd', '$odd'],
        ['Variable', '$count', '$count'],
        ['BoundText', ' {{ item }} '],
      ]);

      expectFromHtml(`
        @for ((   ( (item of items.foo.bar()) )   ); track item.id) {
          {{ item }}
        }
      `).toEqual([
        ['ForLoopBlock', 'items.foo.bar()', 'item.id'],
        ['Variable', 'item', '$implicit'],
        ['Variable', '$index', '$index'],
        ['Variable', '$first', '$first'],
        ['Variable', '$last', '$last'],
        ['Variable', '$even', '$even'],
        ['Variable', '$odd', '$odd'],
        ['Variable', '$count', '$count'],
        ['BoundText', ' {{ item }} '],
      ]);
    });

    it('should parse a for loop block with let parameters', () => {
      expectFromHtml(`
        @for (item of items.foo.bar; track item.id; let idx = $index, f = $first, c = $count; let l = $last, ev = $even, od = $odd) {
          {{ item }}
        }
      `).toEqual([
        ['ForLoopBlock', 'items.foo.bar', 'item.id'],
        ['Variable', 'item', '$implicit'],
        ['Variable', '$index', '$index'],
        ['Variable', '$first', '$first'],
        ['Variable', '$last', '$last'],
        ['Variable', '$even', '$even'],
        ['Variable', '$odd', '$odd'],
        ['Variable', '$count', '$count'],
        ['Variable', 'idx', '$index'],
        ['Variable', 'f', '$first'],
        ['Variable', 'c', '$count'],
        ['Variable', 'l', '$last'],
        ['Variable', 'ev', '$even'],
        ['Variable', 'od', '$odd'],
        ['BoundText', ' {{ item }} '],
      ]);
    });

    it('should parse a for loop block with newlines in its let parameters', () => {
      expectFromHtml(`
        @for (item of items.foo.bar; track item.id; let\nidx = $index,\nf = $first,\nc = $count,\nl = $last,\nev = $even,\nod = $odd) {
          {{ item }}
        }
      `).toEqual([
        ['ForLoopBlock', 'items.foo.bar', 'item.id'],
        ['Variable', 'item', '$implicit'],
        ['Variable', '$index', '$index'],
        ['Variable', '$first', '$first'],
        ['Variable', '$last', '$last'],
        ['Variable', '$even', '$even'],
        ['Variable', '$odd', '$odd'],
        ['Variable', '$count', '$count'],
        ['Variable', 'idx', '$index'],
        ['Variable', 'f', '$first'],
        ['Variable', 'c', '$count'],
        ['Variable', 'l', '$last'],
        ['Variable', 'ev', '$even'],
        ['Variable', 'od', '$odd'],
        ['BoundText', ' {{ item }} '],
      ]);
    });

    it('should parse nested for loop blocks', () => {
      expectFromHtml(`
        @for (item of items.foo.bar; track item.id) {
          {{ item }}

          <div>
            @for (subitem of item.items; track subitem.id) {<h1>{{subitem}}</h1>}
          </div>
        } @empty {
          There were no items in the list.
        }
      `).toEqual([
        ['ForLoopBlock', 'items.foo.bar', 'item.id'],
        ['Variable', 'item', '$implicit'],
        ['Variable', '$index', '$index'],
        ['Variable', '$first', '$first'],
        ['Variable', '$last', '$last'],
        ['Variable', '$even', '$even'],
        ['Variable', '$odd', '$odd'],
        ['Variable', '$count', '$count'],
        ['BoundText', ' {{ item }} '],
        ['Element', 'div'],
        ['ForLoopBlock', 'item.items', 'subitem.id'],
        ['Variable', 'subitem', '$implicit'],
        ['Variable', '$index', '$index'],
        ['Variable', '$first', '$first'],
        ['Variable', '$last', '$last'],
        ['Variable', '$even', '$even'],
        ['Variable', '$odd', '$odd'],
        ['Variable', '$count', '$count'],
        ['Element', 'h1'],
        ['BoundText', '{{ subitem }}'],
        ['ForLoopBlockEmpty'],
        ['Text', ' There were no items in the list. '],
      ]);
    });

    it('should parse a for loop block with a function call in the `track` expression', () => {
      expectFromHtml(`
        @for (item of items.foo.bar; track trackBy(item.id, 123)) {
          {{ item }}
        }
      `).toEqual([
        ['ForLoopBlock', 'items.foo.bar', 'trackBy(item.id, 123)'],
        ['Variable', 'item', '$implicit'],
        ['Variable', '$index', '$index'],
        ['Variable', '$first', '$first'],
        ['Variable', '$last', '$last'],
        ['Variable', '$even', '$even'],
        ['Variable', '$odd', '$odd'],
        ['Variable', '$count', '$count'],
        ['BoundText', ' {{ item }} '],
      ]);
    });

    it('should parse a for loop block with newlines in its expression', () => {
      const expectedResult = [
        ['ForLoopBlock', 'items.foo.bar', 'item.id + foo'],
        ['Variable', 'item', '$implicit'],
        ['Variable', '$index', '$index'],
        ['Variable', '$first', '$first'],
        ['Variable', '$last', '$last'],
        ['Variable', '$even', '$even'],
        ['Variable', '$odd', '$odd'],
        ['Variable', '$count', '$count'],
        ['BoundText', '{{ item }}'],
      ];
      const expectedExtraParensResult = [
        ['ForLoopBlock', 'items.foo.bar', '(item.id + foo)'],
        ['Variable', 'item', '$implicit'],
        ['Variable', '$index', '$index'],
        ['Variable', '$first', '$first'],
        ['Variable', '$last', '$last'],
        ['Variable', '$even', '$even'],
        ['Variable', '$odd', '$odd'],
        ['Variable', '$count', '$count'],
        ['BoundText', '{{ item }}'],
      ];

      expectFromHtml(`
        @for (item\nof\nitems.foo.bar; track item.id +\nfoo) {{{ item }}}
      `).toEqual(expectedResult);
      expectFromHtml(`
        @for ((item\nof\nitems.foo.bar); track (item.id +\nfoo)) {{{ item }}}
      `).toEqual(expectedExtraParensResult);
    });

    it('should parse for loop block expression containing new lines', () => {
      expectFromHtml(`
        @for (item of [
          { id: 1 },
          { id: 2 }
        ]; track item.id) {
          {{ item }}
        }
      `).toEqual([
        ['ForLoopBlock', '[{id: 1}, {id: 2}]', 'item.id'],
        ['Variable', 'item', '$implicit'],
        ['Variable', '$index', '$index'],
        ['Variable', '$first', '$first'],
        ['Variable', '$last', '$last'],
        ['Variable', '$even', '$even'],
        ['Variable', '$odd', '$odd'],
        ['Variable', '$count', '$count'],
        ['BoundText', ' {{ item }} '],
      ]);
    });

    describe('validations', () => {
      it('should report if for loop does not have an expression', () => {
        expect(() => parse(`@for {hello}`)).toThrowError(/@for loop does not have an expression/);
      });

      it('should report if for loop does not have a tracking expression', () => {
        expect(() => parse(`@for (a of b) {hello}`)).toThrowError(
          /@for loop must have a "track" expression/,
        );
        expect(() => parse(`@for (a of b; track      ) {hello}`)).toThrowError(
          /@for loop must have a "track" expression/,
        );
      });

      it('should report mismatching optional parentheses around for loop expression', () => {
        expect(() => parse(`@for ((a of b; track c) {hello}`)).toThrowError(
          /Unclosed parentheses in expression/,
        );
        expect(() => parse(`@for ((a of b(); track c) {hello}`)).toThrowError(
          /Unexpected end of expression: b\(/,
        );
        expect(() => parse(`@for (a of b); track c) {hello}`)).toThrowError(
          /Unexpected character "EOF"/,
        );
      });

      it('should report unrecognized for loop parameters', () => {
        expect(() => parse(`@for (a of b; foo bar) {hello}`)).toThrowError(
          /Unrecognized @for loop parameter "foo bar"/,
        );
      });

      it('should report multiple `track` parameters', () => {
        expect(() => parse(`@for (a of b; track c; track d) {hello}`)).toThrowError(
          /@for loop can only have one "track" expression/,
        );
      });

      it('should report invalid for loop expression', () => {
        const errorPattern =
          /Cannot parse expression\. @for loop expression must match the pattern "<identifier> of <expression>"/;

        expect(() => parse(`@for (//invalid of items) {hello}`)).toThrowError(errorPattern);
        expect(() => parse(`@for (item) {hello}`)).toThrowError(errorPattern);
        expect(() => parse(`@for (item in items) {hello}`)).toThrowError(errorPattern);
        expect(() => parse(`@for (item of    ) {hello}`)).toThrowError(errorPattern);
      });

      it('should report syntax error in for loop expression', () => {
        expect(() => parse(`@for (item of items..foo) {hello}`)).toThrowError(
          /Unexpected token \./,
        );
      });

      it('should report for loop with multiple `empty` blocks', () => {
        expect(() =>
          parse(`
          @for (a of b; track a) {
            Main
          } @empty {
            Empty one
          } @empty {
            Empty two
          }
        `),
        ).toThrowError(/@for loop can only have one @empty block/);
      });

      it('should report empty block with parameters', () => {
        expect(() =>
          parse(`
          @for (a of b; track a) {
            main
          } @empty (foo) {
            empty
          }
        `),
        ).toThrowError(/@empty block cannot have parameters/);
      });

      it('should content between @for and @empty blocks', () => {
        expect(() =>
          parse(`
          @for (a of b; track a) {
            main
          } <div></div> @empty {
            empty
          }
        `),
        ).toThrowError(/@empty block can only be used after an @for block/);
      });

      it('should report an empty block used without a @for loop block', () => {
        expect(() => parse(`@empty {hello}`)).toThrowError(
          /@empty block can only be used after an @for block/,
        );
      });

      it('should report an empty `let` parameter', () => {
        expect(() => parse(`@for (item of items.foo.bar; track item.id; let ) {}`)).toThrowError(
          /Invalid @for loop "let" parameter. Parameter should match the pattern "<name> = <variable name>"/,
        );
      });

      it('should report an invalid `let` parameter', () => {
        expect(() =>
          parse(`@for (item of items.foo.bar; track item.id; let i = $index, $odd) {}`),
        ).toThrowError(
          /Invalid @for loop "let" parameter\. Parameter should match the pattern "<name> = <variable name>"/,
        );
      });

      it('should an unknown variable in a `let` parameter', () => {
        expect(() =>
          parse(`@for (item of items.foo.bar; track item.id; let foo = $foo) {}`),
        ).toThrowError(/Unknown "let" parameter variable "\$foo"\. The allowed variables are:/);
      });

      it('should report duplicate `let` parameter variables', () => {
        expect(() =>
          parse(
            `@for (item of items.foo.bar; track item.id; let i = $index, f = $first, i = $index) {}`,
          ),
        ).toThrowError(/Duplicate "let" parameter variable "\$index"/);
        expect(() =>
          parse(`@for (item of items.foo.bar; track item.id; let $index = $index) {}`),
        ).toThrowError(/Duplicate "let" parameter variable "\$index"/);
      });

      it('should report an item name that conflicts with the implicit context variables', () => {
        ['$index', '$count', '$first', '$last', '$even', '$odd'].forEach((varName) => {
          expect(() => parse(`@for (${varName} of items; track $index) {}`)).toThrowError(
            /@for loop item name cannot be one of \$index, \$first, \$last, \$even, \$odd, \$count/,
          );
        });
      });

      it('should report a context variable alias that is the same as the variable name', () => {
        expect(() =>
          parse(`@for (item of items; let item = $index; track $index) {}`),
        ).toThrowError(/Invalid @for loop "let" parameter. Variable cannot be called "item"/);
      });
    });
  });

  describe('if blocks', () => {
    it('should parse an if block', () => {
      expectFromHtml(`
        @if (cond.expr; as foo) {
          Main case was true!
        } @else if (other.expr) {
          Extra case was true!
        } @else {
          False case!
        }
        `).toEqual([
        ['IfBlock'],
        ['IfBlockBranch', 'cond.expr'],
        ['Variable', 'foo', 'foo'],
        ['Text', ' Main case was true! '],
        ['IfBlockBranch', 'other.expr'],
        ['Text', ' Extra case was true! '],
        ['IfBlockBranch', null],
        ['Text', ' False case! '],
      ]);
    });

    it('should parse an if block with optional parentheses', () => {
      expectFromHtml(`
        @if ((cond.expr)) {
          Main case was true!
        } @else if ((other.expr)) {
          Extra case was true!
        } @else {
          False case!
        }
        `).toEqual([
        ['IfBlock'],
        ['IfBlockBranch', '(cond.expr)'],
        ['Text', ' Main case was true! '],
        ['IfBlockBranch', '(other.expr)'],
        ['Text', ' Extra case was true! '],
        ['IfBlockBranch', null],
        ['Text', ' False case! '],
      ]);
    });

    it('should parse nested if blocks', () => {
      expectFromHtml(`
        @if (a) {
          @if (a1) {
            a1
          } @else {
            b1
          }
        }
        @else if (b) {
          b
        } @else {
          @if (c1) {
            c1
          } @else if (c2) {
            c2
          } @else {
            c3
          }
        }
        `).toEqual([
        ['IfBlock'],
        ['IfBlockBranch', 'a'],
        ['IfBlock'],
        ['IfBlockBranch', 'a1'],
        ['Text', ' a1 '],
        ['IfBlockBranch', null],
        ['Text', ' b1 '],
        ['IfBlockBranch', 'b'],
        ['Text', ' b '],
        ['IfBlockBranch', null],
        ['IfBlock'],
        ['IfBlockBranch', 'c1'],
        ['Text', ' c1 '],
        ['IfBlockBranch', 'c2'],
        ['Text', ' c2 '],
        ['IfBlockBranch', null],
        ['Text', ' c3 '],
      ]);
    });

    it('should parse an else if block with multiple spaces', () => {
      expectFromHtml(`
        @if (cond.expr; as foo) {
          Main case was true!
        } @else        if (other.expr) {
          Other case was true!
        }
        `).toEqual([
        ['IfBlock'],
        ['IfBlockBranch', 'cond.expr'],
        ['Variable', 'foo', 'foo'],
        ['Text', ' Main case was true! '],
        ['IfBlockBranch', 'other.expr'],
        ['Text', ' Other case was true! '],
      ]);
    });

    it('should parse an else if block with a tab between `else` and `if`', () => {
      expectFromHtml(`
        @if (cond.expr; as foo) {
          Main case was true!
        } @else\tif (other.expr) {
          Other case was true!
        }
        `).toEqual([
        ['IfBlock'],
        ['IfBlockBranch', 'cond.expr'],
        ['Variable', 'foo', 'foo'],
        ['Text', ' Main case was true! '],
        ['IfBlockBranch', 'other.expr'],
        ['Text', ' Other case was true! '],
      ]);
    });

    it('should parse an if block containing comments between the branches', () => {
      expectFromHtml(`
        @if (cond.expr; as foo) {
          Main case was true!
        }
        <!-- Extra case -->
        @else if (other.expr) {
          Extra case was true!
        }
        <!-- False case -->
        @else {
          False case!
        }
        `).toEqual([
        ['IfBlock'],
        ['IfBlockBranch', 'cond.expr'],
        ['Variable', 'foo', 'foo'],
        ['Text', ' Main case was true! '],
        ['IfBlockBranch', 'other.expr'],
        ['Text', ' Extra case was true! '],
        ['IfBlockBranch', null],
        ['Text', ' False case! '],
      ]);
    });

    describe('validations', () => {
      it('should report an if block without a condition', () => {
        expect(() =>
          parse(`
          @if {hello}
        `),
        ).toThrowError(/Conditional block does not have an expression/);
        expect(() =>
          parse(`
          @if (      ) {hello}
        `),
        ).toThrowError(/Conditional block does not have an expression/);
      });

      it('should report an unknown parameter in an if block', () => {
        expect(() =>
          parse(`
          @if (foo; bar) {hello}
        `),
        ).toThrowError(/Unrecognized conditional parameter "bar"/);
      });

      it('should report an unknown parameter in an else if block', () => {
        expect(() =>
          parse(`
          @if (foo) {hello} @else if (bar; baz) {goodbye}
        `),
        ).toThrowError(/Unrecognized conditional parameter "baz"/);
      });

      it('should report an if block that has multiple `as` expressions', () => {
        expect(() =>
          parse(`
          @if (foo; as foo; as bar) {hello}
        `),
        ).toThrowError(/Conditional can only have one "as" expression/);
      });

      it('should report an else if block with a newline in the name', () => {
        expect(() =>
          parse(`
          @if (foo) {hello} @else\nif (bar) {goodbye}
        `),
        ).toThrowError(/Unrecognized block @else\nif/);
      });

      it('should report an else if block that has an `as` expression', () => {
        expect(() =>
          parse(`
          @if (foo) {hello} @else if (bar; as alias) {goodbye}
        `),
        ).toThrowError(/"as" expression is only allowed on the primary @if block/);
      });

      it('should report an @else if block used without an @if block', () => {
        expect(() => parse(`@else if (foo) {hello}`)).toThrowError(
          /@else if block can only be used after an @if or @else if block/,
        );
      });

      it('should report an @else block used without an @if block', () => {
        expect(() => parse(`@else (foo) {hello}`)).toThrowError(
          /@else block can only be used after an @if or @else if block/,
        );
      });

      it('should report content between an @if and @else if block', () => {
        expect(() => parse(`@if (foo) {hello} <div></div> @else if (bar) {goodbye}`)).toThrowError(
          /@else if block can only be used after an @if or @else if block/,
        );
      });

      it('should report content between an @if and @else block', () => {
        expect(() => parse(`@if (foo) {hello} <div></div> @else {goodbye}`)).toThrowError(
          /@else block can only be used after an @if or @else if block/,
        );
      });

      it('should report an else block with parameters', () => {
        expect(() =>
          parse(`
          @if (foo) {hello} @else (bar) {goodbye}
        `),
        ).toThrowError(/@else block cannot have parameters/);
      });

      it('should report a conditional with multiple else blocks', () => {
        expect(() =>
          parse(`
          @if (foo) {hello} @else {goodbye} @else {goodbye again}
        `),
        ).toThrowError(/Conditional can only have one @else block/);
      });

      it('should report an else if block after an else block', () => {
        expect(() =>
          parse(`
          @if (foo) {hello} @else {goodbye} @else (if bar) {goodbye again}
        `),
        ).toThrowError(/@else block must be last inside the conditional/);
      });

      it('should throw if "as" expression is not a valid identifier', () => {
        expect(() =>
          parse(`
          @if (foo; as foo && bar) {hello}
        `),
        ).toThrowError(/"as" expression must be a valid JavaScript identifier/);
      });
    });
  });

  describe('unknown blocks', () => {
    it('should parse unknown blocks', () => {
      expectFromHtml('@unknown {}', true /* ignoreError */).toEqual([['UnknownBlock', 'unknown']]);
    });
  });

  describe('@let declarations', () => {
    it('should parse a let declaration', () => {
      expectFromHtml('@let foo = 123 + 456;').toEqual([['LetDeclaration', 'foo', '123 + 456']]);
    });

    it('should report syntax errors in the let declaration value', () => {
      expect(() => parse('@let foo = {one: 1;')).toThrowError(
        /Parser Error: Missing expected } at the end of the expression \[\{one: 1]/,
      );
    });

    it('should report a let declaration with no value', () => {
      expect(() => parse('@let foo =  ;')).toThrowError(/@let declaration value cannot be empty/);
    });

    it('should produce a text node when @let is used inside ngNonBindable', () => {
      expectFromHtml('<div ngNonBindable>@let foo = 123;</div>').toEqual([
        ['Element', 'div'],
        ['TextAttribute', 'ngNonBindable', ''],
        ['Text', '@let foo = 123;'],
      ]);
    });
  });

  describe('component nodes', () => {
    function expectSelectorless(html: string, ignoreError?: boolean) {
      return expectFromHtml(html, ignoreError, true);
    }

    function parseSelectorless(html: string) {
      return parse(html, {selectorlessEnabled: true});
    }

    it('should parse a simple component node', () => {
      expectSelectorless('<MyComp>Hello</MyComp>').toEqual([
        ['Component', 'MyComp', null, 'MyComp'],
        ['Text', 'Hello'],
      ]);
    });

    it('should parse a component node with a tag name', () => {
      expectSelectorless('<MyComp:button>Hello</MyComp:button>').toEqual([
        ['Component', 'MyComp', 'button', 'MyComp:button'],
        ['Text', 'Hello'],
      ]);
    });

    it('should parse a component tag nested within other markup', () => {
      expectSelectorless(
        '@if (expr) {<div>Hello: <MyComp><span><OtherComp/></span></MyComp></div>}',
      ).toEqual([
        ['IfBlock'],
        ['IfBlockBranch', 'expr'],
        ['Element', 'div'],
        ['Text', 'Hello: '],
        ['Component', 'MyComp', null, 'MyComp'],
        ['Element', 'span'],
        ['Component', 'OtherComp', null, 'OtherComp', '#selfClosing'],
      ]);
    });

    it('should parse a component node with attributes and directives', () => {
      expectSelectorless(
        '<MyComp before="foo" @Dir middle @OtherDir([a]="a" (b)="b()") after="123">Hello</MyComp>',
      ).toEqual([
        ['Component', 'MyComp', null, 'MyComp'],
        ['TextAttribute', 'before', 'foo'],
        ['TextAttribute', 'middle', ''],
        ['TextAttribute', 'after', '123'],
        ['Directive', 'Dir'],
        ['Directive', 'OtherDir'],
        ['BoundAttribute', 0, 'a', 'a'],
        ['BoundEvent', 0, 'b', null, 'b()'],
        ['Text', 'Hello'],
      ]);
    });

    it('should parse a component node with * directives', () => {
      expectSelectorless('<MyComp *ngIf="expr">Hello</MyComp>').toEqual([
        ['Template'],
        ['BoundAttribute', 0, 'ngIf', 'expr'],
        ['Component', 'MyComp', null, 'MyComp'],
        ['Text', 'Hello'],
      ]);
    });

    it('should not pick up attributes from directives when using * syntax', () => {
      expectSelectorless(
        '<MyComp *ngIf="true" @Dir(static="1" [bound]="expr" (event)="fn()")/>',
      ).toEqual([
        ['Template'],
        ['BoundAttribute', 0, 'ngIf', 'true'],
        ['Component', 'MyComp', null, 'MyComp', '#selfClosing'],
        ['Directive', 'Dir'],
        ['TextAttribute', 'static', '1'],
        ['BoundAttribute', 0, 'bound', 'expr'],
        ['BoundEvent', 0, 'event', null, 'fn()'],
      ]);
    });

    it('should treat components as elements inside ngNonBindable', () => {
      expectSelectorless(
        '<div ngNonBindable><MyComp foo="bar" @Dir(some="attr")></MyComp></div>',
      ).toEqual([
        ['Element', 'div'],
        ['TextAttribute', 'ngNonBindable', ''],
        ['Element', 'MyComp'],
        ['TextAttribute', 'foo', 'bar'],
      ]);
    });

    it('should not allow a selectorless component with an unsupported tag name', () => {
      const unsupportedTags = [
        'link',
        'style',
        'script',
        'ng-template',
        'ng-container',
        'ng-content',
      ];

      for (const name of unsupportedTags) {
        expect(() => parseSelectorless(`<MyComp:${name}></MyComp:${name}>`)).toThrowError(
          new RegExp(`Tag name "${name}" cannot be used as a component tag`),
        );
      }
    });
  });

  describe('directives', () => {
    function expectSelectorless(html: string, ignoreError?: boolean) {
      return expectFromHtml(html, ignoreError, true);
    }

    function parseSelectorless(html: string) {
      return parse(html, {selectorlessEnabled: true});
    }

    it('should parse a directive with no attributes', () => {
      expectSelectorless('<div @Dir></div>').toEqual([
        ['Element', 'div'],
        ['Directive', 'Dir'],
      ]);
    });

    it('should parse a directive with attributes', () => {
      expectSelectorless('<div @Dir(a="1" [b]="two" (c)="c()" [(d)]="d")></div>').toEqual([
        ['Element', 'div'],
        ['Directive', 'Dir'],
        ['TextAttribute', 'a', '1'],
        ['BoundAttribute', 0, 'b', 'two'],
        ['BoundAttribute', 5, 'd', 'd'],
        ['BoundEvent', 0, 'c', null, 'c()'],
        ['BoundEvent', 2, 'dChange', null, 'd'],
      ]);
    });

    it('should parse a directive mixed with other attributes', () => {
      expectSelectorless(
        '<div before="foo" @Dir middle @OtherDir([a]="a" (b)="b()") after="123"></div>',
      ).toEqual([
        ['Element', 'div'],
        ['TextAttribute', 'before', 'foo'],
        ['TextAttribute', 'middle', ''],
        ['TextAttribute', 'after', '123'],
        ['Directive', 'Dir'],
        ['Directive', 'OtherDir'],
        ['BoundAttribute', 0, 'a', 'a'],
        ['BoundEvent', 0, 'b', null, 'b()'],
      ]);
    });

    it('should remove directives inside ngNonBindable', () => {
      expectSelectorless(
        '<div ngNonBindable><span @EmptyDir @WithAttrs(foo="123" [bar]="321")></span></div>',
      ).toEqual([
        ['Element', 'div'],
        ['TextAttribute', 'ngNonBindable', ''],
        ['Element', 'span'],
      ]);
    });

    it('should pick up attributes from selectorless directives when using * syntax', () => {
      expectSelectorless(
        '<div *ngIf="true" @Dir(static="1" [bound]="expr" (event)="fn()")></div>',
      ).toEqual([
        ['Template'],
        ['BoundAttribute', 0, 'ngIf', 'true'],
        ['Element', 'div'],
        ['Directive', 'Dir'],
        ['TextAttribute', 'static', '1'],
        ['BoundAttribute', 0, 'bound', 'expr'],
        ['BoundEvent', 0, 'event', null, 'fn()'],
      ]);
    });

    describe('validations', () => {
      it('should not allow * syntax inside directives', () => {
        expect(() => parseSelectorless(`<div @Dir(*ngIf="true")></div>`)).toThrowError(
          /Shorthand template syntax "\*ngIf" is not supported inside a directive context/,
        );
      });

      it('should not allow ngProjectAs inside directive syntax', () => {
        expect(() => parseSelectorless(`<div @Dir(ngProjectAs="foo")></div>`)).toThrowError(
          /Attribute "ngProjectAs" is not supported in a directive context/,
        );
      });

      it('should not allow ngNonBindable inside directive syntax', () => {
        expect(() => parseSelectorless(`<div @Dir(ngNonBindable)></div>`)).toThrowError(
          /Attribute "ngNonBindable" is not supported in a directive context/,
        );
      });

      it('should not allow the same directive to be applied multiple times', () => {
        expect(() => parseSelectorless(`<div @One @Two @One(input="123")></div>`)).toThrowError(
          /Cannot apply directive "One" multiple times on the same element/,
        );
      });

      it('should not allow class bindings inside directives', () => {
        expect(() => parseSelectorless(`<div @Dir([class.foo]="expr")></div>`)).toThrowError(
          /Binding is not supported in a directive context/,
        );
      });

      it('should not allow style bindings inside directives', () => {
        expect(() => parseSelectorless(`<div @Dir([style.foo]="expr")></div>`)).toThrowError(
          /Binding is not supported in a directive context/,
        );
      });

      it('should not allow attribute bindings inside directives', () => {
        expect(() => parseSelectorless(`<div @Dir([attr.foo]="expr")></div>`)).toThrowError(
          /Binding is not supported in a directive context/,
        );
      });

      it('should not allow animation bindings inside directives', () => {
        expect(() => parseSelectorless(`<div @Dir([@animation]="expr")></div>`)).toThrowError(
          /Binding is not supported in a directive context/,
        );
      });

      it('should not allow named references', () => {
        const pattern = /Cannot specify a value for a local reference in this context/;
        expect(() => parseSelectorless('<MyComp #foo="bar"/>')).toThrowError(pattern);
        expect(() => parseSelectorless('<div @Dir(#foo="bar")></div>')).toThrowError(pattern);
      });

      it('should not allow duplicate references', () => {
        const pattern = /Duplicate reference names are not allowed/;
        expect(() => parseSelectorless('<MyComp #foo #foo/>')).toThrowError(pattern);
        expect(() => parseSelectorless('<div @Dir(#foo #foo)></div>')).toThrowError(pattern);
      });
    });
  });
});

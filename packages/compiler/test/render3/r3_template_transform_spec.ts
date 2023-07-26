/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BindingType} from '../../src/expression_parser/ast';
import * as t from '../../src/render3/r3_ast';
import {unparse} from '../expression_parser/utils/unparser';

import {parseR3 as parse} from './view/util';


// Transform an IVY AST to a flat list of nodes to ease testing
class R3AstHumanizer implements t.Visitor<void> {
  result: any[] = [];

  visitElement(element: t.Element) {
    this.result.push(['Element', element.name]);
    this.visitAll([
      element.attributes,
      element.inputs,
      element.outputs,
      element.references,
      element.children,
    ]);
  }

  visitTemplate(template: t.Template) {
    this.result.push(['Template']);
    this.visitAll([
      template.attributes,
      template.inputs,
      template.outputs,
      template.templateAttrs,
      template.references,
      template.variables,
      template.children,
    ]);
  }

  visitContent(content: t.Content) {
    this.result.push(['Content', content.selector]);
    t.visitAll(this, content.attributes);
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
    this.result.push([
      'BoundAttribute',
      attribute.type,
      attribute.name,
      unparse(attribute.value),
    ]);
  }

  visitBoundEvent(event: t.BoundEvent) {
    this.result.push([
      'BoundEvent',
      event.name,
      event.target,
      unparse(event.handler),
    ]);
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
    const blocks: t.Node[] = [];
    deferred.placeholder && blocks.push(deferred.placeholder);
    deferred.loading && blocks.push(deferred.loading);
    deferred.error && blocks.push(deferred.error);
    this.result.push(['DeferredBlock']);
    this.visitAll([
      deferred.triggers,
      deferred.prefetchTriggers,
      deferred.children,
      blocks,
    ]);
  }

  visitDeferredTrigger(trigger: t.DeferredTrigger): void {
    if (trigger instanceof t.BoundDeferredTrigger) {
      this.result.push(['BoundDeferredTrigger', unparse(trigger.value)]);
    } else if (trigger instanceof t.ImmediateDeferredTrigger) {
      this.result.push(['ImmediateDeferredTrigger']);
    } else if (trigger instanceof t.HoverDeferredTrigger) {
      this.result.push(['HoverDeferredTrigger']);
    } else if (trigger instanceof t.IdleDeferredTrigger) {
      this.result.push(['IdleDeferredTrigger']);
    } else if (trigger instanceof t.TimerDeferredTrigger) {
      this.result.push(['TimerDeferredTrigger', trigger.delay]);
    } else if (trigger instanceof t.InteractionDeferredTrigger) {
      this.result.push(['InteractionDeferredTrigger', trigger.reference]);
    } else if (trigger instanceof t.ViewportDeferredTrigger) {
      this.result.push(['ViewportDeferredTrigger', trigger.reference]);
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

  private visitAll(nodes: t.Node[][]) {
    nodes.forEach(node => t.visitAll(this, node));
  }
}

function expectFromHtml(html: string, ignoreError = false, enabledBlockTypes?: string[]) {
  const res = parse(html, {ignoreError, enabledBlockTypes});
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
      expectFromHtml('<a', true /* ignoreError */).toEqual([
        ['Element', 'a'],
      ]);
    });

    it('should parse incomplete tags terminated by another tag', () => {
      expectFromHtml('<a <span></span>', true /* ignoreError */).toEqual([
        ['Element', 'a'],
        ['Element', 'span'],
      ]);
    });

    it('should parse text nodes', () => {
      expectFromHtml('a').toEqual([
        ['Text', 'a'],
      ]);
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
      expectFromHtml('{{a}}').toEqual([
        ['BoundText', '{{ a }}'],
      ]);
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
      expectFromHtml('<ng-template></ng-template>').toEqual([
        ['Template'],
      ]);
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
      expect(((res.nodes[0] as t.Template).children[0] as t.Template).tagName)
          .toEqual('ng-template');
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
      expect(() => parse('<ng-template #a #a></ng-template>'))
          .toThrowError(/Reference "#a" is defined more than once/);
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
        ['BoundEvent', 'event', 'window', 'v'],
      ]);
    });

    it('should parse event names case sensitive', () => {
      expectFromHtml('<div (some-event)="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundEvent', 'some-event', null, 'v'],
      ]);
      expectFromHtml('<div (someEvent)="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundEvent', 'someEvent', null, 'v'],
      ]);
    });

    it('should parse bound events via on-', () => {
      expectFromHtml('<div on-event="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundEvent', 'event', null, 'v'],
      ]);
    });

    it('should report missing event names in on- syntax', () => {
      expect(() => parse('<div on-></div>')).toThrowError(/Event name is missing in binding/);
    });

    it('should parse bound events and properties via [(...)]', () => {
      expectFromHtml('<div [(prop)]="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundAttribute', BindingType.Property, 'prop', 'v'],
        ['BoundEvent', 'propChange', null, 'v = $event'],
      ]);
    });

    it('should parse bound events and properties via bindon-', () => {
      expectFromHtml('<div bindon-prop="v"></div>').toEqual([
        ['Element', 'div'],
        ['BoundAttribute', BindingType.Property, 'prop', 'v'],
        ['BoundEvent', 'propChange', null, 'v = $event'],
      ]);
    });

    it('should parse bound events and properties via [(...)] with non-null operator', () => {
      expectFromHtml('<div [(prop)]="v!"></div>').toEqual([
        ['Element', 'div'],
        ['BoundAttribute', BindingType.Property, 'prop', 'v!'],
        ['BoundEvent', 'propChange', null, 'v = $event'],
      ]);
    });

    it('should report an error for assignments into non-null asserted expressions', () => {
      // TODO(joost): this syntax is allowed in TypeScript. Consider changing the grammar to
      //  allow this syntax, or improve the error message.
      // See https://github.com/angular/angular/pull/37809
      expect(() => parse('<div (prop)="v! = $event"></div>'))
          .toThrowError(/Unexpected token '=' at column 4/);
    });

    it('should report missing property names in bindon- syntax', () => {
      expect(() => parse('<div bindon-></div>'))
          .toThrowError(/Property name is missing in binding/);
    });

    it('should report an error on empty expression', () => {
      expect(() => parse('<div (event)="">')).toThrowError(/Empty expressions are not allowed/);
      expect(() => parse('<div (event)="   ">')).toThrowError(/Empty expressions are not allowed/);
    });

    it('should parse bound animation events when event name is empty', () => {
      expectFromHtml('<div (@)="onAnimationEvent($event)"></div>', true).toEqual([
        ['Element', 'div'],
        ['BoundEvent', '', null, 'onAnimationEvent($event)'],
      ]);
      expect(() => parse('<div (@)></div>'))
          .toThrowError(/Animation event name is missing in binding/);
    });

    it('should report invalid phase value of animation event', () => {
      expect(() => parse('<div (@event.invalidPhase)></div>'))
          .toThrowError(
              /The provided animation output phase value "invalidphase" for "@event" is not supported \(use start or done\)/);
      expect(() => parse('<div (@event.)></div>'))
          .toThrowError(
              /The animation trigger output event \(@event\) is missing its phase value name \(start or done are currently supported\)/);
      expect(() => parse('<div (@event)></div>'))
          .toThrowError(
              /The animation trigger output event \(@event\) is missing its phase value name \(start or done are currently supported\)/);
    });
  });

  describe('variables', () => {
    it('should report variables not on template elements', () => {
      expect(() => parse('<div let-a-name="b"></div>'))
          .toThrowError(/"let-" is only supported on ng-template elements./);
    });

    it('should report missing variable names', () => {
      expect(() => parse('<ng-template let-><ng-template>'))
          .toThrowError(/Variable does not have a name/);
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
      expect(() => parse('<div #a #a></div>'))
          .toThrowError(/Reference "#a" is defined more than once/);
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
      expectFromR3Nodes(res.nodes).toEqual([
        ['Content', '*'],
      ]);
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
          '<ng-content select="a"></ng-content><ng-content></ng-content><ng-content select="b"></ng-content>');
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
  });

  describe('Ignored elements', () => {
    it('should ignore <script> elements', () => {
      expectFromHtml('<script></script>a').toEqual([
        ['Text', 'a'],
      ]);
    });

    it('should ignore <style> elements', () => {
      expectFromHtml('<style></style>a').toEqual([
        ['Text', 'a'],
      ]);
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

    it('should ignore <link rel="stylesheet"> elements inside of elements with ngNonBindable',
       () => {
         expectFromHtml('<div ngNonBindable><link rel="stylesheet">a</div>').toEqual([
           ['Element', 'div'],
           ['TextAttribute', 'ngNonBindable', ''],
           ['Text', 'a'],
         ]);
       });
  });

  describe('deferred blocks', () => {
    // TODO(crisbeto): temporary utility while blocks are disabled by default.
    function expectDeferred(html: string) {
      return expectFromR3Nodes(parse(html, {enabledBlockTypes: ['defer']}).nodes);
    }

    function expectDeferredError(html: string) {
      return expect(() => parse(html, {enabledBlockTypes: ['defer']}));
    }

    it('should parse a simple deferred block', () => {
      expectDeferred('{#defer}hello{/defer}').toEqual([
        ['DeferredBlock'],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with a `when` trigger', () => {
      expectDeferred('{#defer when isVisible() && loaded}hello{/defer}').toEqual([
        ['DeferredBlock'],
        ['BoundDeferredTrigger', 'isVisible() && loaded'],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with a single `on` trigger', () => {
      expectDeferred('{#defer on idle}hello{/defer}').toEqual([
        ['DeferredBlock'],
        ['IdleDeferredTrigger'],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with multiple `on` triggers', () => {
      expectDeferred('{#defer on idle, viewport(button)}hello{/defer}').toEqual([
        ['DeferredBlock'],
        ['IdleDeferredTrigger'],
        ['ViewportDeferredTrigger', 'button'],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with a non-parenthesized trigger at the end', () => {
      expectDeferred('{#defer on idle, viewport(button), immediate}hello{/defer}').toEqual([
        ['DeferredBlock'],
        ['IdleDeferredTrigger'],
        ['ViewportDeferredTrigger', 'button'],
        ['ImmediateDeferredTrigger'],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with `when` and `on` triggers', () => {
      const markup =
          '{#defer when isVisible(); on timer(100ms), idle, viewport(button)}hello{/defer}';

      expectDeferred(markup).toEqual([
        ['DeferredBlock'],
        ['BoundDeferredTrigger', 'isVisible()'],
        ['TimerDeferredTrigger', 100],
        ['IdleDeferredTrigger'],
        ['ViewportDeferredTrigger', 'button'],
        ['Text', 'hello'],
      ]);
    });

    it('should allow new line after trigger name', () => {
      const markup =
          `{#defer\nwhen\nisVisible(); on\ntimer(100ms),\nidle, viewport(button)}hello{/defer}`;

      expectDeferred(markup).toEqual([
        ['DeferredBlock'],
        ['BoundDeferredTrigger', 'isVisible()'],
        ['TimerDeferredTrigger', 100],
        ['IdleDeferredTrigger'],
        ['ViewportDeferredTrigger', 'button'],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with a timeout set in seconds', () => {
      expectDeferred('{#defer on timer(10s)}hello{/defer}').toEqual([
        ['DeferredBlock'],
        ['TimerDeferredTrigger', 10000],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with a timeout that has no units', () => {
      expectDeferred('{#defer on timer(100)}hello{/defer}').toEqual([
        ['DeferredBlock'],
        ['TimerDeferredTrigger', 100],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with a hover trigger', () => {
      expectDeferred('{#defer on hover}hello{/defer}').toEqual([
        ['DeferredBlock'],
        ['HoverDeferredTrigger'],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with an interaction trigger', () => {
      expectDeferred('{#defer on interaction(button)}hello{/defer}').toEqual([
        ['DeferredBlock'],
        ['InteractionDeferredTrigger', 'button'],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a deferred block with secondary blocks', () => {
      expectDeferred(
          '{#defer}' +
          '<calendar-cmp [date]="current"/>' +
          '{:loading}' +
          'Loading...' +
          '{:placeholder}' +
          'Placeholder content!' +
          '{:error}' +
          'Loading failed :(' +
          '{/defer}')
          .toEqual([
            ['DeferredBlock'],
            ['Element', 'calendar-cmp'],
            ['BoundAttribute', 0, 'date', 'current'],
            ['DeferredBlockPlaceholder'],
            ['Text', 'Placeholder content!'],
            ['DeferredBlockLoading'],
            ['Text', 'Loading...'],
            ['DeferredBlockError'],
            ['Text', 'Loading failed :('],
          ]);
    });

    it('should parse a loading block with parameters', () => {
      expectDeferred(
          '{#defer}' +
          '<calendar-cmp [date]="current"/>' +
          '{:loading after 100ms; minimum 1s}' +
          'Loading...' +
          '{/defer}')
          .toEqual([
            ['DeferredBlock'],
            ['Element', 'calendar-cmp'],
            ['BoundAttribute', 0, 'date', 'current'],
            ['DeferredBlockLoading', 'after 100ms', 'minimum 1000ms'],
            ['Text', 'Loading...'],
          ]);
    });

    it('should parse a placeholder block with parameters', () => {
      expectDeferred(
          '{#defer}' +
          '<calendar-cmp [date]="current"/>' +
          '{:placeholder minimum 1s}' +
          'Placeholder...' +
          '{/defer}')
          .toEqual([
            ['DeferredBlock'],
            ['Element', 'calendar-cmp'],
            ['BoundAttribute', 0, 'date', 'current'],
            ['DeferredBlockPlaceholder', 'minimum 1000ms'],
            ['Text', 'Placeholder...'],
          ]);
    });

    it('should parse a deferred block with prefetch triggers', () => {
      const html =
          '{#defer on idle; prefetch on viewport(button), hover; prefetch when shouldPrefetch()}hello{/defer}';

      expectDeferred(html).toEqual([
        ['DeferredBlock'],
        ['IdleDeferredTrigger'],
        ['ViewportDeferredTrigger', 'button'],
        ['HoverDeferredTrigger'],
        ['BoundDeferredTrigger', 'shouldPrefetch()'],
        ['Text', 'hello'],
      ]);
    });

    it('should allow arbitrary number of spaces after the `prefetch` keyword', () => {
      const html =
          '{#defer on idle; prefetch         on viewport(button), hover; prefetch    when shouldPrefetch()}hello{/defer}';

      expectDeferred(html).toEqual([
        ['DeferredBlock'],
        ['IdleDeferredTrigger'],
        ['ViewportDeferredTrigger', 'button'],
        ['HoverDeferredTrigger'],
        ['BoundDeferredTrigger', 'shouldPrefetch()'],
        ['Text', 'hello'],
      ]);
    });

    it('should parse a complete example', () => {
      expectDeferred(
          '{#defer when isVisible() && foo; on hover, timer(10s), idle, immediate, ' +
          'interaction(button), viewport(container); prefetch on immediate; ' +
          'prefetch when isDataLoaded()}' +
          '<calendar-cmp [date]="current"/>' +
          '{:loading minimum 1s; after 100ms}' +
          'Loading...' +
          '{:placeholder minimum 500}' +
          'Placeholder content!' +
          '{:error}' +
          'Loading failed :(' +
          '{/defer}')
          .toEqual([
            ['DeferredBlock'],
            ['BoundDeferredTrigger', 'isVisible() && foo'],
            ['HoverDeferredTrigger'],
            ['TimerDeferredTrigger', 10000],
            ['IdleDeferredTrigger'],
            ['ImmediateDeferredTrigger'],
            ['InteractionDeferredTrigger', 'button'],
            ['ViewportDeferredTrigger', 'container'],
            ['ImmediateDeferredTrigger'],
            ['BoundDeferredTrigger', 'isDataLoaded()'],
            ['Element', 'calendar-cmp'],
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
      expectDeferred(
          '<div ngNonBindable>' +
          '{#defer when isVisible() && foo; on hover, timer(10s); ' +
          'prefetch on immediate; prefetch when isDataLoaded()}' +
          '<calendar-cmp [date]="current"/>' +
          '{:loading}' +
          'Loading...' +
          '{:placeholder}' +
          'Placeholder content!' +
          '{:error}' +
          'Loading failed :(' +
          '{/defer}' +
          '</div>')
          .toEqual([
            ['Element', 'div'],
            ['TextAttribute', 'ngNonBindable', ''],
            [
              'Text',
              '{#defer when isVisible() && foo; on hover, timer(10s); prefetch on immediate; prefetch when isDataLoaded()}'
            ],
            ['Element', 'calendar-cmp'],
            ['TextAttribute', '[date]', 'current'],
            ['Text', '{:loading}'],
            ['Text', 'Loading...'],
            ['Text', '{:placeholder}'],
            ['Text', 'Placeholder content!'],
            ['Text', '{:error}'],
            ['Text', 'Loading failed :('],
            ['Text', '{/defer}'],
          ]);
    });

    describe('block validations', () => {
      it('should report syntax error in `when` trigger', () => {
        expectDeferredError('{#defer when isVisible(}hello{/defer}')
            .toThrowError(/Unexpected end of expression/);
      });

      it('should report unrecognized trigger', () => {
        expectDeferredError('{#defer unknown visible()}hello{/defer}')
            .toThrowError(/Unrecognized trigger/);
      });

      it('should report unrecognized block', () => {
        expectDeferredError('{#defer}hello{:unknown}world{/defer}')
            .toThrowError(/Unrecognized block "unknown"/);
      });

      it('should report multiple placeholder blocks', () => {
        expectDeferredError('{#defer}hello{:placeholder}p1{:placeholder}p2{/defer}')
            .toThrowError(/"defer" block can only have one "placeholder" block/);
      });

      it('should report multiple loading blocks', () => {
        expectDeferredError('{#defer}hello{:loading}l1{:loading}l2{/defer}')
            .toThrowError(/"defer" block can only have one "loading" block/);
      });

      it('should report multiple error blocks', () => {
        expectDeferredError('{#defer}hello{:error}e1{:error}e2{/defer}')
            .toThrowError(/"defer" block can only have one "error" block/);
      });

      it('should report unrecognized parameter in placeholder block', () => {
        expectDeferredError('{#defer}hello{:placeholder unknown 100ms}hi{/defer}')
            .toThrowError(/Unrecognized parameter in "placeholder" block: "unknown 100ms"/);
      });

      it('should report unrecognized parameter in loading block', () => {
        expectDeferredError('{#defer}hello{:loading unknown 100ms}hi{/defer}')
            .toThrowError(/Unrecognized parameter in "loading" block: "unknown 100ms"/);
      });

      it('should report any parameter usage in error block', () => {
        expectDeferredError('{#defer}hello{:error foo}hi{/defer}')
            .toThrowError(/"error" block cannot have parameters/);
      });

      it('should report if minimum placeholder time cannot be parsed', () => {
        expectDeferredError('{#defer}hello{:placeholder minimum 123abc}hi{/defer}')
            .toThrowError(/Could not parse time value of parameter "minimum"/);
      });

      it('should report if minimum loading time cannot be parsed', () => {
        expectDeferredError('{#defer}hello{:loading minimum 123abc}hi{/defer}')
            .toThrowError(/Could not parse time value of parameter "minimum"/);
      });

      it('should report if after loading time cannot be parsed', () => {
        expectDeferredError('{#defer}hello{:loading after 123abc}hi{/defer}')
            .toThrowError(/Could not parse time value of parameter "after"/);
      });

      it('should report unrecognized `on` trigger', () => {
        expectDeferredError('{#defer on foo}hello{/defer}')
            .toThrowError(/Unrecognized trigger type "foo"/);
      });

      it('should report missing comma after unparametarized `on` trigger', () => {
        expectDeferredError('{#defer on hover idle}hello{/defer}').toThrowError(/Unexpected token/);
      });

      it('should report missing comma after parametarized `on` trigger', () => {
        expectDeferredError('{#defer on viewport(button) idle}hello{/defer}')
            .toThrowError(/Unexpected token/);
      });

      it('should report mutliple commas after between `on` triggers', () => {
        expectDeferredError('{#defer on viewport(button), , idle}hello{/defer}')
            .toThrowError(/Unexpected token/);
      });

      it('should report unclosed parenthesis in `on` trigger', () => {
        expectDeferredError('{#defer on viewport(button}hello{/defer}')
            .toThrowError(/Unexpected end of expression/);
      });

      it('should report incorrect closing parenthesis in `on` trigger', () => {
        expectDeferredError('{#defer on viewport(but)ton}hello{/defer}')
            .toThrowError(/Unexpected token/);
      });

      it('should report stray closing parenthesis in `on` trigger', () => {
        expectDeferredError('{#defer on idle)}hello{/defer}').toThrowError(/Unexpected token/);
      });

      it('should report non-identifier token usage in `on` trigger', () => {
        expectDeferredError('{#defer on 123)}hello{/defer}').toThrowError(/Unexpected token/);
      });

      it('should report if identifier is not followed by an opening parenthesis', () => {
        expectDeferredError('{#defer on viewport[]}hello{/defer}').toThrowError(/Unexpected token/);
      });

      it('should report if parameters are passed to `idle` trigger', () => {
        expectDeferredError('{#defer on idle(1)}hello{/defer}')
            .toThrowError(/"idle" trigger cannot have parameters/);
      });

      it('should report if no parameters are passed into `timer` trigger', () => {
        expectDeferredError('{#defer on timer}hello{/defer}')
            .toThrowError(/"timer" trigger must have exactly one parameter/);
      });

      it('should report if `timer` trigger value cannot be parsed', () => {
        expectDeferredError('{#defer on timer(123abc)}hello{/defer}')
            .toThrowError(/Could not parse time value of trigger "timer"/);
      });

      it('should report if `interaction` trigger has more than one parameter', () => {
        expectDeferredError('{#defer on interaction(a, b)}hello{/defer}')
            .toThrowError(/"interaction" trigger can only have zero or one parameters/);
      });

      it('should report if parameters are passed to `immediate` trigger', () => {
        expectDeferredError('{#defer on immediate(1)}hello{/defer}')
            .toThrowError(/"immediate" trigger cannot have parameters/);
      });

      it('should report if parameters are passed to `hover` trigger', () => {
        expectDeferredError('{#defer on hover(1)}hello{/defer}')
            .toThrowError(/"hover" trigger cannot have parameters/);
      });

      it('should report if `viewport` trigger has more than one parameter', () => {
        expectDeferredError('{#defer on viewport(a, b)}hello{/defer}')
            .toThrowError(/"viewport" trigger can only have zero or one parameters/);
      });
    });
  });
});

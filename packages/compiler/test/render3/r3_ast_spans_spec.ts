/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ASTWithSource} from '../../src/expression_parser/ast';
import {ParseSourceSpan} from '../../src/parse_util';
import * as t from '../../src/render3/r3_ast';

import {parseR3 as parse} from './view/util';

class R3AstSourceSpans implements t.Visitor<void> {
  result: any[] = [];

  visitElement(element: t.Element) {
    this.result.push([
      'Element',
      humanizeSpan(element.sourceSpan),
      humanizeSpan(element.startSourceSpan),
      humanizeSpan(element.endSourceSpan),
    ]);
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
    this.result.push([
      'Template',
      humanizeSpan(template.sourceSpan),
      humanizeSpan(template.startSourceSpan),
      humanizeSpan(template.endSourceSpan),
    ]);
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
    this.result.push(['Content', humanizeSpan(content.sourceSpan)]);
    this.visitAll([content.attributes, content.children]);
  }

  visitVariable(variable: t.Variable) {
    this.result.push([
      'Variable',
      humanizeSpan(variable.sourceSpan),
      humanizeSpan(variable.keySpan),
      humanizeSpan(variable.valueSpan),
    ]);
  }

  visitReference(reference: t.Reference) {
    this.result.push([
      'Reference',
      humanizeSpan(reference.sourceSpan),
      humanizeSpan(reference.keySpan),
      humanizeSpan(reference.valueSpan),
    ]);
  }

  visitTextAttribute(attribute: t.TextAttribute) {
    this.result.push([
      'TextAttribute',
      humanizeSpan(attribute.sourceSpan),
      humanizeSpan(attribute.keySpan),
      humanizeSpan(attribute.valueSpan),
    ]);
  }

  visitBoundAttribute(attribute: t.BoundAttribute) {
    this.result.push([
      'BoundAttribute',
      humanizeSpan(attribute.sourceSpan),
      humanizeSpan(attribute.keySpan),
      humanizeSpan(attribute.valueSpan),
    ]);
  }

  visitBoundEvent(event: t.BoundEvent) {
    this.result.push([
      'BoundEvent',
      humanizeSpan(event.sourceSpan),
      humanizeSpan(event.keySpan),
      humanizeSpan(event.handlerSpan),
    ]);
  }

  visitText(text: t.Text) {
    this.result.push(['Text', humanizeSpan(text.sourceSpan)]);
  }

  visitBoundText(text: t.BoundText) {
    this.result.push(['BoundText', humanizeSpan(text.sourceSpan)]);
  }

  visitIcu(icu: t.Icu) {
    this.result.push(['Icu', humanizeSpan(icu.sourceSpan)]);
    for (const key of Object.keys(icu.vars)) {
      this.result.push(['Icu:Var', humanizeSpan(icu.vars[key].sourceSpan)]);
    }
    for (const key of Object.keys(icu.placeholders)) {
      this.result.push(['Icu:Placeholder', humanizeSpan(icu.placeholders[key].sourceSpan)]);
    }
  }

  visitDeferredBlock(deferred: t.DeferredBlock): void {
    this.result.push([
      'DeferredBlock',
      humanizeSpan(deferred.sourceSpan),
      humanizeSpan(deferred.startSourceSpan),
      humanizeSpan(deferred.endSourceSpan),
    ]);
    deferred.visitAll(this);
  }

  visitSwitchBlock(block: t.SwitchBlock): void {
    this.result.push([
      'SwitchBlock',
      humanizeSpan(block.sourceSpan),
      humanizeSpan(block.startSourceSpan),
      humanizeSpan(block.endSourceSpan),
    ]);
    this.visitAll([block.cases]);
  }

  visitSwitchBlockCase(block: t.SwitchBlockCase): void {
    this.result.push([
      'SwitchBlockCase',
      humanizeSpan(block.sourceSpan),
      humanizeSpan(block.startSourceSpan),
    ]);
    this.visitAll([block.children]);
  }

  visitForLoopBlock(block: t.ForLoopBlock): void {
    this.result.push([
      'ForLoopBlock',
      humanizeSpan(block.sourceSpan),
      humanizeSpan(block.startSourceSpan),
      humanizeSpan(block.endSourceSpan),
    ]);
    this.visitVariable(block.item);
    this.visitAll([block.contextVariables]);
    this.visitAll([block.children]);
    block.empty?.visit(this);
  }

  visitForLoopBlockEmpty(block: t.ForLoopBlockEmpty): void {
    this.result.push([
      'ForLoopBlockEmpty',
      humanizeSpan(block.sourceSpan),
      humanizeSpan(block.startSourceSpan),
    ]);
    this.visitAll([block.children]);
  }

  visitIfBlock(block: t.IfBlock): void {
    this.result.push([
      'IfBlock',
      humanizeSpan(block.sourceSpan),
      humanizeSpan(block.startSourceSpan),
      humanizeSpan(block.endSourceSpan),
    ]);
    this.visitAll([block.branches]);
  }

  visitIfBlockBranch(block: t.IfBlockBranch): void {
    this.result.push([
      'IfBlockBranch',
      humanizeSpan(block.sourceSpan),
      humanizeSpan(block.startSourceSpan),
    ]);
    if (block.expressionAlias) {
      this.visitVariable(block.expressionAlias);
    }
    this.visitAll([block.children]);
  }

  visitDeferredTrigger(trigger: t.DeferredTrigger): void {
    let name: string;

    if (trigger instanceof t.BoundDeferredTrigger) {
      name = 'BoundDeferredTrigger';
    } else if (trigger instanceof t.ImmediateDeferredTrigger) {
      name = 'ImmediateDeferredTrigger';
    } else if (trigger instanceof t.HoverDeferredTrigger) {
      name = 'HoverDeferredTrigger';
    } else if (trigger instanceof t.IdleDeferredTrigger) {
      name = 'IdleDeferredTrigger';
    } else if (trigger instanceof t.TimerDeferredTrigger) {
      name = 'TimerDeferredTrigger';
    } else if (trigger instanceof t.InteractionDeferredTrigger) {
      name = 'InteractionDeferredTrigger';
    } else if (trigger instanceof t.ViewportDeferredTrigger) {
      name = 'ViewportDeferredTrigger';
    } else if (trigger instanceof t.NeverDeferredTrigger) {
      name = 'NeverDeferredTrigger';
    } else {
      throw new Error('Unknown trigger');
    }

    this.result.push([name, humanizeSpan(trigger.sourceSpan)]);
  }

  visitDeferredBlockPlaceholder(block: t.DeferredBlockPlaceholder): void {
    this.result.push([
      'DeferredBlockPlaceholder',
      humanizeSpan(block.sourceSpan),
      humanizeSpan(block.startSourceSpan),
      humanizeSpan(block.endSourceSpan),
    ]);
    this.visitAll([block.children]);
  }

  visitDeferredBlockError(block: t.DeferredBlockError): void {
    this.result.push([
      'DeferredBlockError',
      humanizeSpan(block.sourceSpan),
      humanizeSpan(block.startSourceSpan),
      humanizeSpan(block.endSourceSpan),
    ]);
    this.visitAll([block.children]);
  }

  visitDeferredBlockLoading(block: t.DeferredBlockLoading): void {
    this.result.push([
      'DeferredBlockLoading',
      humanizeSpan(block.sourceSpan),
      humanizeSpan(block.startSourceSpan),
      humanizeSpan(block.endSourceSpan),
    ]);
    this.visitAll([block.children]);
  }

  visitUnknownBlock(block: t.UnknownBlock): void {
    this.result.push(['UnknownBlock', humanizeSpan(block.sourceSpan)]);
  }

  visitLetDeclaration(decl: t.LetDeclaration): void {
    this.result.push([
      'LetDeclaration',
      humanizeSpan(decl.sourceSpan),
      humanizeSpan(decl.nameSpan),
      humanizeSpan(decl.valueSpan),
    ]);
  }

  visitComponent(component: t.Component) {
    this.result.push([
      'Component',
      humanizeSpan(component.sourceSpan),
      humanizeSpan(component.startSourceSpan),
      humanizeSpan(component.endSourceSpan),
    ]);
    this.visitAll([
      component.attributes,
      component.inputs,
      component.outputs,
      component.directives,
      component.references,
      component.children,
    ]);
  }

  visitDirective(directive: t.Directive) {
    this.result.push([
      'Directive',
      humanizeSpan(directive.sourceSpan),
      humanizeSpan(directive.startSourceSpan),
      humanizeSpan(directive.endSourceSpan),
    ]);
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

function humanizeSpan(span: ParseSourceSpan | null | undefined): string {
  if (span === null || span === undefined) {
    return `<empty>`;
  }
  return span.toString();
}

function expectFromHtml(html: string, selectorlessEnabled = false) {
  return expectFromR3Nodes(parse(html, {selectorlessEnabled}).nodes);
}

function expectFromR3Nodes(nodes: t.Node[]) {
  const humanizer = new R3AstSourceSpans();
  t.visitAll(humanizer, nodes);
  return expect(humanizer.result);
}

describe('R3 AST source spans', () => {
  describe('nodes without binding', () => {
    it('is correct for text nodes', () => {
      expectFromHtml('a').toEqual([['Text', 'a']]);
    });

    it('is correct for elements with attributes', () => {
      expectFromHtml('<div a="b"></div>').toEqual([
        ['Element', '<div a="b"></div>', '<div a="b">', '</div>'],
        ['TextAttribute', 'a="b"', 'a', 'b'],
      ]);
    });

    it('is correct for elements with attributes without value', () => {
      expectFromHtml('<div a></div>').toEqual([
        ['Element', '<div a></div>', '<div a>', '</div>'],
        ['TextAttribute', 'a', 'a', '<empty>'],
      ]);
    });

    it('is correct for self-closing elements with trailing whitespace', () => {
      expectFromHtml('<input />\n  <span>\n</span>').toEqual([
        ['Element', '<input />', '<input />', '<input />'],
        ['Element', '<span>\n</span>', '<span>', '</span>'],
      ]);
    });
  });

  describe('bound text nodes', () => {
    it('is correct for bound text nodes', () => {
      expectFromHtml('{{a}}').toEqual([['BoundText', '{{a}}']]);
    });
  });

  describe('bound attributes', () => {
    it('is correct for bound properties', () => {
      expectFromHtml('<div [someProp]="v"></div>').toEqual([
        ['Element', '<div [someProp]="v"></div>', '<div [someProp]="v">', '</div>'],
        ['BoundAttribute', '[someProp]="v"', 'someProp', 'v'],
      ]);
    });

    it('is correct for bound properties without value', () => {
      expectFromHtml('<div [someProp]></div>').toEqual([
        ['Element', '<div [someProp]></div>', '<div [someProp]>', '</div>'],
        ['BoundAttribute', '[someProp]', 'someProp', '<empty>'],
      ]);
    });

    it('is correct for bound properties via bind- ', () => {
      expectFromHtml('<div bind-prop="v"></div>').toEqual([
        ['Element', '<div bind-prop="v"></div>', '<div bind-prop="v">', '</div>'],
        ['BoundAttribute', 'bind-prop="v"', 'prop', 'v'],
      ]);
    });

    it('is correct for bound properties via {{...}}', () => {
      expectFromHtml('<div prop="{{v}}"></div>').toEqual([
        ['Element', '<div prop="{{v}}"></div>', '<div prop="{{v}}">', '</div>'],
        ['BoundAttribute', 'prop="{{v}}"', 'prop', '{{v}}'],
      ]);
    });

    it('is correct for bound properties via data-', () => {
      expectFromHtml('<div data-prop="{{v}}"></div>').toEqual([
        ['Element', '<div data-prop="{{v}}"></div>', '<div data-prop="{{v}}">', '</div>'],
        ['BoundAttribute', 'data-prop="{{v}}"', 'prop', '{{v}}'],
      ]);
    });

    it('is correct for bound properties via @', () => {
      expectFromHtml('<div bind-@animation="v"></div>').toEqual([
        ['Element', '<div bind-@animation="v"></div>', '<div bind-@animation="v">', '</div>'],
        ['BoundAttribute', 'bind-@animation="v"', 'animation', 'v'],
      ]);
    });

    it('is correct for bound properties via animation-', () => {
      expectFromHtml('<div bind-animate-animationName="v"></div>').toEqual([
        [
          'Element',
          '<div bind-animate-animationName="v"></div>',
          '<div bind-animate-animationName="v">',
          '</div>',
        ],
        ['BoundAttribute', 'bind-animate-animationName="v"', 'animationName', 'v'],
      ]);
    });

    it('is correct for bound properties via @ without value', () => {
      expectFromHtml('<div @animation></div>').toEqual([
        ['Element', '<div @animation></div>', '<div @animation>', '</div>'],
        ['BoundAttribute', '@animation', 'animation', '<empty>'],
      ]);
    });

    it('should not throw off span of value in bound attribute when leading spaces are present', () => {
      const assertValueSpan = (template: string, start: number, end: number) => {
        const result = parse(template);
        const boundAttribute = (result.nodes[0] as t.Element).inputs[0];
        const span = (boundAttribute.value as ASTWithSource).ast.sourceSpan;

        expect(span.start).toBe(start);
        expect(span.end).toBe(end);
      };

      assertValueSpan('<a [b]="helloWorld"></a>', 8, 18);
      assertValueSpan('<a [b]=" helloWorld"></a>', 9, 19);
      assertValueSpan('<a [b]="  helloWorld"></a>', 10, 20);
      assertValueSpan('<a [b]="   helloWorld"></a>', 11, 21);
      assertValueSpan('<a [b]="    helloWorld"></a>', 12, 22);
      assertValueSpan('<a [b]="                                          helloWorld"></a>', 50, 60);
    });

    it('should not throw off span of value in template attribute when leading spaces are present', () => {
      const assertValueSpan = (template: string, start: number, end: number) => {
        const result = parse(template);
        const boundAttribute = (result.nodes[0] as t.Template).templateAttrs[0];
        const span = (boundAttribute.value as ASTWithSource).ast.sourceSpan;

        expect(span.start).toBe(start);
        expect(span.end).toBe(end);
      };

      assertValueSpan('<ng-container *ngTemplateOutlet="helloWorld"/>', 33, 43);
      assertValueSpan('<ng-container *ngTemplateOutlet=" helloWorld"/>', 34, 44);
      assertValueSpan('<ng-container *ngTemplateOutlet="  helloWorld"/>', 35, 45);
      assertValueSpan('<ng-container *ngTemplateOutlet="   helloWorld"/>', 36, 46);
      assertValueSpan('<ng-container *ngTemplateOutlet="    helloWorld"/>', 37, 47);
      assertValueSpan('<ng-container *ngTemplateOutlet="                    helloWorld"/>', 53, 63);
    });
  });

  describe('templates', () => {
    it('is correct for * directives', () => {
      expectFromHtml('<div *ngIf></div>').toEqual([
        ['Template', '<div *ngIf></div>', '<div *ngIf>', '</div>'],
        ['TextAttribute', 'ngIf', 'ngIf', '<empty>'],
        ['Element', '<div *ngIf></div>', '<div *ngIf>', '</div>'],
      ]);
    });

    it('is correct for <ng-template>', () => {
      expectFromHtml('<ng-template></ng-template>').toEqual([
        ['Template', '<ng-template></ng-template>', '<ng-template>', '</ng-template>'],
      ]);
    });

    it('is correct for reference via #...', () => {
      expectFromHtml('<ng-template #a></ng-template>').toEqual([
        ['Template', '<ng-template #a></ng-template>', '<ng-template #a>', '</ng-template>'],
        ['Reference', '#a', 'a', '<empty>'],
      ]);
    });

    it('is correct for reference with name', () => {
      expectFromHtml('<ng-template #a="b"></ng-template>').toEqual([
        [
          'Template',
          '<ng-template #a="b"></ng-template>',
          '<ng-template #a="b">',
          '</ng-template>',
        ],
        ['Reference', '#a="b"', 'a', 'b'],
      ]);
    });

    it('is correct for reference via ref-...', () => {
      expectFromHtml('<ng-template ref-a></ng-template>').toEqual([
        ['Template', '<ng-template ref-a></ng-template>', '<ng-template ref-a>', '</ng-template>'],
        ['Reference', 'ref-a', 'a', '<empty>'],
      ]);
    });

    it('is correct for reference via data-ref-...', () => {
      expectFromHtml('<ng-template data-ref-a></ng-template>').toEqual([
        [
          'Template',
          '<ng-template data-ref-a></ng-template>',
          '<ng-template data-ref-a>',
          '</ng-template>',
        ],
        ['Reference', 'data-ref-a', 'a', '<empty>'],
      ]);
    });

    it('is correct for variables via let-...', () => {
      expectFromHtml('<ng-template let-a="b"></ng-template>').toEqual([
        [
          'Template',
          '<ng-template let-a="b"></ng-template>',
          '<ng-template let-a="b">',
          '</ng-template>',
        ],
        ['Variable', 'let-a="b"', 'a', 'b'],
      ]);
    });

    it('is correct for variables via data-let-...', () => {
      expectFromHtml('<ng-template data-let-a="b"></ng-template>').toEqual([
        [
          'Template',
          '<ng-template data-let-a="b"></ng-template>',
          '<ng-template data-let-a="b">',
          '</ng-template>',
        ],
        ['Variable', 'data-let-a="b"', 'a', 'b'],
      ]);
    });

    it('is correct for attributes', () => {
      expectFromHtml('<ng-template k1="v1"></ng-template>').toEqual([
        [
          'Template',
          '<ng-template k1="v1"></ng-template>',
          '<ng-template k1="v1">',
          '</ng-template>',
        ],
        ['TextAttribute', 'k1="v1"', 'k1', 'v1'],
      ]);
    });

    it('is correct for bound attributes', () => {
      expectFromHtml('<ng-template [k1]="v1"></ng-template>').toEqual([
        [
          'Template',
          '<ng-template [k1]="v1"></ng-template>',
          '<ng-template [k1]="v1">',
          '</ng-template>',
        ],
        ['BoundAttribute', '[k1]="v1"', 'k1', 'v1'],
      ]);
    });
  });

  // TODO(joost): improve spans of nodes extracted from macrosyntax
  describe('inline templates', () => {
    it('is correct for attribute and bound attributes', () => {
      // Desugared form is
      // <ng-template ngFor [ngForOf]="items" let-item>
      //   <div></div>
      // </ng-template>
      expectFromHtml('<div *ngFor="let item of items"></div>').toEqual([
        [
          'Template',
          '<div *ngFor="let item of items"></div>',
          '<div *ngFor="let item of items">',
          '</div>',
        ],
        ['TextAttribute', 'ngFor', 'ngFor', '<empty>'],
        ['BoundAttribute', 'of items', 'of', 'items'],
        ['Variable', 'let item ', 'item', '<empty>'],
        [
          'Element',
          '<div *ngFor="let item of items"></div>',
          '<div *ngFor="let item of items">',
          '</div>',
        ],
      ]);

      // Note that this test exercises an *incorrect* usage of the ngFor
      // directive. There is a missing 'let' in the beginning of the expression
      // which causes the template to be desugared into
      // <ng-template [ngFor]="item" [ngForOf]="items">
      //   <div></div>
      // </ng-template>
      expectFromHtml('<div *ngFor="item of items"></div>').toEqual([
        [
          'Template',
          '<div *ngFor="item of items"></div>',
          '<div *ngFor="item of items">',
          '</div>',
        ],
        ['BoundAttribute', 'ngFor="item ', 'ngFor', 'item'],
        ['BoundAttribute', 'of items', 'of', 'items'],
        ['Element', '<div *ngFor="item of items"></div>', '<div *ngFor="item of items">', '</div>'],
      ]);

      expectFromHtml('<div *ngFor="let item of items; trackBy: trackByFn"></div>').toEqual([
        [
          'Template',
          '<div *ngFor="let item of items; trackBy: trackByFn"></div>',
          '<div *ngFor="let item of items; trackBy: trackByFn">',
          '</div>',
        ],
        ['TextAttribute', 'ngFor', 'ngFor', '<empty>'],
        ['BoundAttribute', 'of items; ', 'of', 'items'],
        ['BoundAttribute', 'trackBy: trackByFn', 'trackBy', 'trackByFn'],
        ['Variable', 'let item ', 'item', '<empty>'],
        [
          'Element',
          '<div *ngFor="let item of items; trackBy: trackByFn"></div>',
          '<div *ngFor="let item of items; trackBy: trackByFn">',
          '</div>',
        ],
      ]);
    });

    it('is correct for variables via let ...', () => {
      expectFromHtml('<div *ngIf="let a=b"></div>').toEqual([
        ['Template', '<div *ngIf="let a=b"></div>', '<div *ngIf="let a=b">', '</div>'],
        ['TextAttribute', 'ngIf', 'ngIf', '<empty>'],
        ['Variable', 'let a=b', 'a', 'b'],
        ['Element', '<div *ngIf="let a=b"></div>', '<div *ngIf="let a=b">', '</div>'],
      ]);
    });

    it('is correct for variables via as ...', () => {
      expectFromHtml('<div *ngIf="expr as local"></div>').toEqual([
        ['Template', '<div *ngIf="expr as local"></div>', '<div *ngIf="expr as local">', '</div>'],
        ['BoundAttribute', 'ngIf="expr ', 'ngIf', 'expr'],
        ['Variable', 'ngIf="expr as local', 'local', 'ngIf'],
        ['Element', '<div *ngIf="expr as local"></div>', '<div *ngIf="expr as local">', '</div>'],
      ]);
    });
  });

  describe('events', () => {
    it('is correct for event names case sensitive', () => {
      expectFromHtml('<div (someEvent)="v"></div>').toEqual([
        ['Element', '<div (someEvent)="v"></div>', '<div (someEvent)="v">', '</div>'],
        ['BoundEvent', '(someEvent)="v"', 'someEvent', 'v'],
      ]);
    });

    it('is correct for bound events via on-', () => {
      expectFromHtml('<div on-event="v"></div>').toEqual([
        ['Element', '<div on-event="v"></div>', '<div on-event="v">', '</div>'],
        ['BoundEvent', 'on-event="v"', 'event', 'v'],
      ]);
    });

    it('is correct for bound events via data-on-', () => {
      expectFromHtml('<div data-on-event="v"></div>').toEqual([
        ['Element', '<div data-on-event="v"></div>', '<div data-on-event="v">', '</div>'],
        ['BoundEvent', 'data-on-event="v"', 'event', 'v'],
      ]);
    });

    it('is correct for bound events and properties via [(...)]', () => {
      expectFromHtml('<div [(prop)]="v"></div>').toEqual([
        ['Element', '<div [(prop)]="v"></div>', '<div [(prop)]="v">', '</div>'],
        ['BoundAttribute', '[(prop)]="v"', 'prop', 'v'],
        ['BoundEvent', '[(prop)]="v"', 'prop', 'v'],
      ]);
    });

    it('is correct for bound events and properties via bindon-', () => {
      expectFromHtml('<div bindon-prop="v"></div>').toEqual([
        ['Element', '<div bindon-prop="v"></div>', '<div bindon-prop="v">', '</div>'],
        ['BoundAttribute', 'bindon-prop="v"', 'prop', 'v'],
        ['BoundEvent', 'bindon-prop="v"', 'prop', 'v'],
      ]);
    });

    it('is correct for bound events and properties via data-bindon-', () => {
      expectFromHtml('<div data-bindon-prop="v"></div>').toEqual([
        ['Element', '<div data-bindon-prop="v"></div>', '<div data-bindon-prop="v">', '</div>'],
        ['BoundAttribute', 'data-bindon-prop="v"', 'prop', 'v'],
        ['BoundEvent', 'data-bindon-prop="v"', 'prop', 'v'],
      ]);
    });

    it('is correct for bound events via @', () => {
      expectFromHtml('<div (@name.done)="v"></div>').toEqual([
        ['Element', '<div (@name.done)="v"></div>', '<div (@name.done)="v">', '</div>'],
        ['BoundEvent', '(@name.done)="v"', 'name.done', 'v'],
      ]);
    });
  });

  describe('references', () => {
    it('is correct for references via #...', () => {
      expectFromHtml('<div #a></div>').toEqual([
        ['Element', '<div #a></div>', '<div #a>', '</div>'],
        ['Reference', '#a', 'a', '<empty>'],
      ]);
    });

    it('is correct for references with name', () => {
      expectFromHtml('<div #a="b"></div>').toEqual([
        ['Element', '<div #a="b"></div>', '<div #a="b">', '</div>'],
        ['Reference', '#a="b"', 'a', 'b'],
      ]);
    });

    it('is correct for references via ref-', () => {
      expectFromHtml('<div ref-a></div>').toEqual([
        ['Element', '<div ref-a></div>', '<div ref-a>', '</div>'],
        ['Reference', 'ref-a', 'a', '<empty>'],
      ]);
    });

    it('is correct for references via data-ref-', () => {
      expectFromHtml('<div ref-a></div>').toEqual([
        ['Element', '<div ref-a></div>', '<div ref-a>', '</div>'],
        ['Reference', 'ref-a', 'a', '<empty>'],
      ]);
    });
  });

  describe('ICU expressions', () => {
    it('is correct for variables and placeholders', () => {
      expectFromHtml(
        '<span i18n>{item.var, plural, other { {{item.placeholder}} items } }</span>',
      ).toEqual([
        [
          'Element',
          '<span i18n>{item.var, plural, other { {{item.placeholder}} items } }</span>',
          '<span i18n>',
          '</span>',
        ],
        ['Icu', '{item.var, plural, other { {{item.placeholder}} items } }'],
        ['Icu:Var', 'item.var'],
        ['Icu:Placeholder', '{{item.placeholder}}'],
      ]);
    });

    it('is correct for nested ICUs', () => {
      expectFromHtml(
        '<span i18n>{item.var, plural, other { {{item.placeholder}} {nestedVar, plural, other { {{nestedPlaceholder}} }}} }</span>',
      ).toEqual([
        [
          'Element',
          '<span i18n>{item.var, plural, other { {{item.placeholder}} {nestedVar, plural, other { {{nestedPlaceholder}} }}} }</span>',
          '<span i18n>',
          '</span>',
        ],
        [
          'Icu',
          '{item.var, plural, other { {{item.placeholder}} {nestedVar, plural, other { {{nestedPlaceholder}} }}} }',
        ],
        ['Icu:Var', 'nestedVar'],
        ['Icu:Var', 'item.var'],
        ['Icu:Placeholder', '{{item.placeholder}}'],
        ['Icu:Placeholder', '{{nestedPlaceholder}}'],
      ]);
    });
  });

  describe('deferred blocks', () => {
    it('is correct for deferred blocks', () => {
      const html =
        '@defer (when isVisible() && foo; on hover(button), timer(10s), idle, immediate, ' +
        'interaction(button), viewport(container); prefetch on immediate; ' +
        'prefetch when isDataLoaded(); hydrate on interaction; hydrate when isVisible(); hydrate on timer(1200)) {<calendar-cmp [date]="current"/>}' +
        '@loading (minimum 1s; after 100ms) {Loading...}' +
        '@placeholder (minimum 500) {Placeholder content!}' +
        '@error {Loading failed :(}';

      expectFromHtml(html).toEqual([
        [
          'DeferredBlock',
          '@defer (when isVisible() && foo; on hover(button), timer(10s), idle, immediate, interaction(button), viewport(container); prefetch on immediate; prefetch when isDataLoaded(); hydrate on interaction; hydrate when isVisible(); hydrate on timer(1200)) {<calendar-cmp [date]="current"/>}@loading (minimum 1s; after 100ms) {Loading...}@placeholder (minimum 500) {Placeholder content!}@error {Loading failed :(}',
          '@defer (when isVisible() && foo; on hover(button), timer(10s), idle, immediate, interaction(button), viewport(container); prefetch on immediate; prefetch when isDataLoaded(); hydrate on interaction; hydrate when isVisible(); hydrate on timer(1200)) {',
          '}',
        ],
        ['InteractionDeferredTrigger', 'hydrate on interaction'],
        ['BoundDeferredTrigger', 'hydrate when isVisible()'],
        ['TimerDeferredTrigger', 'hydrate on timer(1200)'],
        ['BoundDeferredTrigger', 'when isVisible() && foo'],
        ['HoverDeferredTrigger', 'on hover(button)'],
        ['TimerDeferredTrigger', 'timer(10s)'],
        ['IdleDeferredTrigger', 'idle'],
        ['ImmediateDeferredTrigger', 'immediate'],
        ['InteractionDeferredTrigger', 'interaction(button)'],
        ['ViewportDeferredTrigger', 'viewport(container)'],
        ['ImmediateDeferredTrigger', 'prefetch on immediate'],
        ['BoundDeferredTrigger', 'prefetch when isDataLoaded()'],
        [
          'Element',
          '<calendar-cmp [date]="current"/>',
          '<calendar-cmp [date]="current"/>',
          '<calendar-cmp [date]="current"/>',
        ],
        ['BoundAttribute', '[date]="current"', 'date', 'current'],
        [
          'DeferredBlockPlaceholder',
          '@placeholder (minimum 500) {Placeholder content!}',
          '@placeholder (minimum 500) {',
          '}',
        ],
        ['Text', 'Placeholder content!'],
        [
          'DeferredBlockLoading',
          '@loading (minimum 1s; after 100ms) {Loading...}',
          '@loading (minimum 1s; after 100ms) {',
          '}',
        ],
        ['Text', 'Loading...'],
        ['DeferredBlockError', '@error {Loading failed :(}', '@error {', '}'],
        ['Text', 'Loading failed :('],
      ]);
    });
  });

  describe('switch blocks', () => {
    it('is correct for switch blocks', () => {
      const html =
        `@switch (cond.kind) {` +
        `@case (x()) {X case}` +
        `@case ('hello') {Y case}` +
        `@case (42) {Z case}` +
        `@default {No case matched}` +
        `}`;

      expectFromHtml(html).toEqual([
        [
          'SwitchBlock',
          "@switch (cond.kind) {@case (x()) {X case}@case ('hello') {Y case}@case (42) {Z case}@default {No case matched}}",
          '@switch (cond.kind) {',
          '}',
        ],
        ['SwitchBlockCase', '@case (x()) {X case}', '@case (x()) {'],
        ['Text', 'X case'],
        ['SwitchBlockCase', "@case ('hello') {Y case}", "@case ('hello') {"],
        ['Text', 'Y case'],
        ['SwitchBlockCase', '@case (42) {Z case}', '@case (42) {'],
        ['Text', 'Z case'],
        ['SwitchBlockCase', '@default {No case matched}', '@default {'],
        ['Text', 'No case matched'],
      ]);
    });
  });

  describe('for loop blocks', () => {
    it('is correct for loop blocks', () => {
      const html =
        `@for (item of items.foo.bar; track item.id; let i = $index, _o_d_d_ = $odd) {<h1>{{ item }}</h1>}` +
        `@empty {There were no items in the list.}`;

      expectFromHtml(html).toEqual([
        [
          'ForLoopBlock',
          '@for (item of items.foo.bar; track item.id; let i = $index, _o_d_d_ = $odd) {<h1>{{ item }}</h1>}@empty {There were no items in the list.}',
          '@for (item of items.foo.bar; track item.id; let i = $index, _o_d_d_ = $odd) {',
          '}',
        ],
        ['Variable', 'item', 'item', '<empty>'],
        ['Variable', '', '', '<empty>'],
        ['Variable', '', '', '<empty>'],
        ['Variable', '', '', '<empty>'],
        ['Variable', '', '', '<empty>'],
        ['Variable', '', '', '<empty>'],
        ['Variable', '', '', '<empty>'],
        ['Variable', 'i = $index', 'i', '$index'],
        ['Variable', '_o_d_d_ = $odd', '_o_d_d_', '$odd'],
        ['Element', '<h1>{{ item }}</h1>', '<h1>', '</h1>'],
        ['BoundText', '{{ item }}'],
        ['ForLoopBlockEmpty', '@empty {There were no items in the list.}', '@empty {'],
        ['Text', 'There were no items in the list.'],
      ]);
    });
  });

  describe('if blocks', () => {
    it('is correct for if blocks', () => {
      const html =
        `@if (cond.expr; as foo) {Main case was true!}` +
        `@else if (other.expr) {Extra case was true!}` +
        `@else {False case!}`;

      expectFromHtml(html).toEqual([
        [
          'IfBlock',
          '@if (cond.expr; as foo) {Main case was true!}@else if (other.expr) {Extra case was true!}@else {False case!}',
          '@if (cond.expr; as foo) {',
          '}',
        ],
        [
          'IfBlockBranch',
          '@if (cond.expr; as foo) {Main case was true!}',
          '@if (cond.expr; as foo) {',
        ],
        ['Variable', 'foo', 'foo', '<empty>'],
        ['Text', 'Main case was true!'],
        [
          'IfBlockBranch',
          '@else if (other.expr) {Extra case was true!}',
          '@else if (other.expr) {',
        ],
        ['Text', 'Extra case was true!'],
        ['IfBlockBranch', '@else {False case!}', '@else {'],
        ['Text', 'False case!'],
      ]);
    });
  });

  describe('@let declaration', () => {
    it('is correct for a let declaration', () => {
      expectFromHtml('@let foo = 123;').toEqual([
        ['LetDeclaration', '@let foo = 123', 'foo', '123'],
      ]);
    });
  });

  describe('component tags', () => {
    it('is correct for a simple component', () => {
      expectFromHtml('<MyComp></MyComp>', true).toEqual([
        ['Component', '<MyComp></MyComp>', '<MyComp>', '</MyComp>'],
      ]);
    });

    it('is correct for a self-closing component', () => {
      expectFromHtml('<MyComp/>', true).toEqual([
        ['Component', '<MyComp/>', '<MyComp/>', '<MyComp/>'],
      ]);
    });

    it('is correct for a component with a tag name', () => {
      expectFromHtml('<MyComp:button></MyComp:button>', true).toEqual([
        ['Component', '<MyComp:button></MyComp:button>', '<MyComp:button>', '</MyComp:button>'],
      ]);
    });

    it('is correct for a component with attributes and directives', () => {
      expectFromHtml(
        '<MyComp before="foo" @Dir middle @OtherDir([a]="a" (b)="b()") after="123">Hello</MyComp>',
        true,
      ).toEqual([
        [
          'Component',
          '<MyComp before="foo" @Dir middle @OtherDir([a]="a" (b)="b()") after="123">Hello</MyComp>',
          '<MyComp before="foo" @Dir middle @OtherDir([a]="a" (b)="b()") after="123">',
          '</MyComp>',
        ],
        ['TextAttribute', 'before="foo"', 'before', 'foo'],
        ['TextAttribute', 'middle', 'middle', '<empty>'],
        ['TextAttribute', 'after="123"', 'after', '123'],
        ['Directive', '@Dir', '@Dir', '<empty>'],
        ['Directive', '@OtherDir([a]="a" (b)="b()")', '@OtherDir(', ')'],
        ['BoundAttribute', '[a]="a"', 'a', 'a'],
        ['BoundEvent', '(b)="b()"', 'b', 'b()'],
        ['Text', 'Hello'],
      ]);
    });

    it('is correct for a component nested inside other markup', () => {
      expectFromHtml(
        '@if (expr) {<div>Hello: <MyComp><span><OtherComp/></span></MyComp></div>}',
        true,
      ).toEqual([
        [
          'IfBlock',
          '@if (expr) {<div>Hello: <MyComp><span><OtherComp/></span></MyComp></div>}',
          '@if (expr) {',
          '}',
        ],
        [
          'IfBlockBranch',
          '@if (expr) {<div>Hello: <MyComp><span><OtherComp/></span></MyComp></div>}',
          '@if (expr) {',
        ],
        [
          'Element',
          '<div>Hello: <MyComp><span><OtherComp/></span></MyComp></div>',
          '<div>',
          '</div>',
        ],
        ['Text', 'Hello: '],
        ['Component', '<MyComp><span><OtherComp/></span></MyComp>', '<MyComp>', '</MyComp>'],
        ['Element', '<span><OtherComp/></span>', '<span>', '</span>'],
        ['Component', '<OtherComp/>', '<OtherComp/>', '<OtherComp/>'],
      ]);
    });
  });

  describe('directives', () => {
    it('is correct for a directive with no attributes', () => {
      expectFromHtml('<div @Dir></div>', true).toEqual([
        ['Element', '<div @Dir></div>', '<div @Dir>', '</div>'],
        ['Directive', '@Dir', '@Dir', '<empty>'],
      ]);
    });

    it('is correct for a directive with attributes', () => {
      expectFromHtml('<div @Dir(a="1" [b]="two" (c)="c()")></div>', true).toEqual([
        [
          'Element',
          '<div @Dir(a="1" [b]="two" (c)="c()")></div>',
          '<div @Dir(a="1" [b]="two" (c)="c()")>',
          '</div>',
        ],
        ['Directive', '@Dir(a="1" [b]="two" (c)="c()")', '@Dir(', ')'],
        ['TextAttribute', 'a="1"', 'a', '1'],
        ['BoundAttribute', '[b]="two"', 'b', 'two'],
        ['BoundEvent', '(c)="c()"', 'c', 'c()'],
      ]);
    });

    it('is correct for directives mixed with other attributes', () => {
      expectFromHtml(
        '<div before="foo" @Dir middle @OtherDir([a]="a" (b)="b()") after="123"></div>',
        true,
      ).toEqual([
        [
          'Element',
          '<div before="foo" @Dir middle @OtherDir([a]="a" (b)="b()") after="123"></div>',
          '<div before="foo" @Dir middle @OtherDir([a]="a" (b)="b()") after="123">',
          '</div>',
        ],
        ['TextAttribute', 'before="foo"', 'before', 'foo'],
        ['TextAttribute', 'middle', 'middle', '<empty>'],
        ['TextAttribute', 'after="123"', 'after', '123'],
        ['Directive', '@Dir', '@Dir', '<empty>'],
        ['Directive', '@OtherDir([a]="a" (b)="b()")', '@OtherDir(', ')'],
        ['BoundAttribute', '[a]="a"', 'a', 'a'],
        ['BoundEvent', '(b)="b()"', 'b', 'b()'],
      ]);
    });
  });
});

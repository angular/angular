/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ParseError,
  parseTemplate,
  PropertyRead,
  SafePropertyRead,
  SafeKeyedRead,
  KeyedRead,
  PropertyWrite,
  KeyedWrite,
  Binary,
  BindingPipe,
  SafeCall,
  Call,
  EmptyExpr,
  LiteralArray,
  LiteralMap,
  Conditional,
  LiteralPrimitive,
  TmplAstNode as Node,
  TmplAstBoundEvent as BoundEvent,
  TmplAstTextAttribute as TextAttribute,
  TmplAstVariable as Variable,
  TmplAstBoundAttribute as BoundAttribute,
  TmplAstElement as Element,
  TmplAstTimerDeferredTrigger as TimerDeferredTrigger,
  TmplAstReference as Reference,
  TmplAstTemplate as Template,
  TmplAstLetDeclaration as LetDeclaration,
  TmplAstContent as Content,
  TmplAstSwitchBlock as SwitchBlock,
  TmplAstSwitchBlockCase as SwitchBlockCase,
  TmplAstIfBlockBranch as IfBlockBranch,
  TmplAstForLoopBlock as ForLoopBlock,
  TmplAstForLoopBlockEmpty as ForLoopBlockEmpty,
  TmplAstDeferredBlockError as DeferredBlockError,
  TmplAstDeferredBlockPlaceholder as DeferredBlockPlaceholder,
  TmplAstDeferredBlockLoading as DeferredBlockLoading,
} from '@angular/compiler';

import {
  getTargetAtPosition,
  SingleNodeTarget,
  TargetNodeKind,
  TwoWayBindingContext,
} from '../../src/template_target';
import {isExpressionNode, isTemplateNode} from '../../src/utils';

interface ParseResult {
  nodes: Node[];
  errors: ParseError[] | null;
  position: number;
}

function parse(template: string): ParseResult {
  const position = template.indexOf('¦');
  if (position < 0) {
    throw new Error(`Template "${template}" does not contain the cursor`);
  }
  template = template.replace('¦', '');
  const templateUrl = '/foo';
  return {
    ...parseTemplate(template, templateUrl, {
      // Set `leadingTriviaChars` and `preserveWhitespaces` such that whitespace is not stripped
      // and fully accounted for in source spans. Without these flags the source spans can be
      // inaccurate.
      // Note: template parse options should be aligned with the `diagNodes` in
      // `ComponentDecoratorHandler._parseTemplate`.
      leadingTriviaChars: [],
      preserveWhitespaces: true,
      alwaysAttemptHtmlToR3AstConversion: true,
    }),
    position,
  };
}

describe('getTargetAtPosition for template AST', () => {
  it('should locate incomplete tag', () => {
    const {errors, nodes, position} = parse(`<div¦`);
    expect(errors?.length).toBe(1);
    expect(errors![0].msg).toContain('Opening tag "div" not terminated.');
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Element);
  });

  it('should locate element in opening tag', () => {
    const {errors, nodes, position} = parse(`<di¦v></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Element);
  });

  it('should locate element in closing tag', () => {
    const {errors, nodes, position} = parse(`<div></di¦v>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Element);
  });

  it('should locate element when cursor is at the beginning', () => {
    const {errors, nodes, position} = parse(`<¦div></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Element);
  });

  it('should locate element when cursor is at the end', () => {
    const {errors, nodes, position} = parse(`<div¦></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Element);
  });

  it('should locate attribute key', () => {
    const {errors, nodes, position} = parse(`<div cla¦ss="foo"></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(TextAttribute);
  });

  it('should locate attribute value', () => {
    const {errors, nodes, position} = parse(`<div class="fo¦o"></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    // TODO: Note that we do not have the ability to detect the RHS (yet)
    expect(node).toBeInstanceOf(TextAttribute);
  });

  it('should locate bound attribute key', () => {
    const {errors, nodes, position} = parse(`<test-cmp [fo¦o]="bar"></test-cmp>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(BoundAttribute);
  });

  it('should locate bound attribute value', () => {
    const {errors, nodes, position} = parse(`<test-cmp [foo]="b¦ar"></test-cmp>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
  });

  it('should not locate bound attribute if cursor is between key and value', () => {
    const {errors, nodes, position} = parse(`<test-cmp [foo]¦="bar"></test-cmp>`);
    expect(errors).toBeNull();
    const nodeInfo = getTargetAtPosition(nodes, position)!;
    expect(nodeInfo).toBeNull();
  });

  it('should locate bound event key', () => {
    const {errors, nodes, position} = parse(`<test-cmp (fo¦o)="bar()"></test-cmp>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(BoundEvent);
  });

  it('should locate bound event value', () => {
    const {errors, nodes, position} = parse(`<test-cmp (foo)="b¦ar()"></test-cmp>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
  });

  it('should locate bound event nested value', () => {
    const {errors, nodes, position} = parse(`<test-cmp (foo)="nested.b¦ar()"></test-cmp>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
  });

  it('should locate element children', () => {
    const {errors, nodes, position} = parse(`<div><sp¦an></span></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Element);
    expect((node as Element).name).toBe('span');
  });

  it('should locate element reference', () => {
    const {errors, nodes, position} = parse(`<div #my¦div></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Reference);
  });

  it('should locate template text attribute', () => {
    const {errors, nodes, position} = parse(`<ng-template ng¦If></ng-template>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(TextAttribute);
  });

  it('should locate template bound attribute key', () => {
    const {errors, nodes, position} = parse(`<ng-template [ng¦If]="foo"></ng-template>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(BoundAttribute);
  });

  it('should locate template bound attribute value', () => {
    const {errors, nodes, position} = parse(`<ng-template [ngIf]="f¦oo"></ng-template>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
  });

  it('should locate template bound attribute key in two-way binding', () => {
    const {errors, nodes, position} = parse(`<ng-template [(f¦oo)]="bar"></ng-template>`);
    expect(errors).toBe(null);
    const {context, parent} = getTargetAtPosition(nodes, position)!;
    expect(parent).toBeInstanceOf(Template);
    const {
      nodes: [boundAttribute, boundEvent],
    } = context as TwoWayBindingContext;
    expect(boundAttribute.name).toBe('foo');
    expect(boundEvent.name).toBe('fooChange');
  });

  it('should locate template bound attribute value in two-way binding', () => {
    const {errors, nodes, position} = parse(`<ng-template [(foo)]="b¦ar"></ng-template>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    // It doesn't actually matter if the template target returns the read or the write.
    // When the template target returns a property read, we only use the LHS downstream because the
    // RHS would have its own node in the AST that would have been returned instead. The LHS of the
    // `PropertyWrite` is the same as the `PropertyRead`.
    expect(node instanceof PropertyRead || node instanceof PropertyWrite).toBeTrue();
    expect((node as PropertyRead | PropertyWrite).name).toBe('bar');
  });

  it('should locate template bound event key', () => {
    const {errors, nodes, position} = parse(`<ng-template (cl¦ick)="foo()"></ng-template>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(BoundEvent);
  });

  it('should locate template bound event value', () => {
    const {errors, nodes, position} = parse(`<ng-template (click)="f¦oo()"></ng-template>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(node).toBeInstanceOf(PropertyRead);
  });

  it('should locate template attribute key', () => {
    const {errors, nodes, position} = parse(`<ng-template i¦d="foo"></ng-template>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(TextAttribute);
  });

  it('should locate template attribute value', () => {
    const {errors, nodes, position} = parse(`<ng-template id="f¦oo"></ng-template>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    // TODO: Note that we do not have the ability to detect the RHS (yet)
    expect(node).toBeInstanceOf(TextAttribute);
  });

  it('should locate template reference key via the # notation', () => {
    const {errors, nodes, position} = parse(`<ng-template #f¦oo></ng-template>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Reference);
    expect((node as Reference).name).toBe('foo');
  });

  it('should locate local reference read', () => {
    const {errors, nodes, position} = parse(`<input #myInputFoo> {{myIn¦putFoo.value}}`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
    expect((node as PropertyRead).name).toBe('myInputFoo');
  });

  it('should locate template reference key via the ref- notation', () => {
    const {errors, nodes, position} = parse(`<ng-template ref-fo¦o></ng-template>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Reference);
    expect((node as Reference).name).toBe('foo');
  });

  it('should locate template reference value via the # notation', () => {
    const {errors, nodes, position} = parse(`<ng-template #foo="export¦As"></ng-template>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Reference);
    expect((node as Reference).value).toBe('exportAs');
    // TODO: Note that we do not have the ability to distinguish LHS and RHS
  });

  it('should locate template reference value via the ref- notation', () => {
    const {errors, nodes, position} = parse(`<ng-template ref-foo="export¦As"></ng-template>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Reference);
    expect((node as Reference).value).toBe('exportAs');
    // TODO: Note that we do not have the ability to distinguish LHS and RHS
  });

  it('should locate template variable key', () => {
    const {errors, nodes, position} = parse(`<ng-template let-f¦oo="bar"></ng-template>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Variable);
  });

  it('should locate template variable value', () => {
    const {errors, nodes, position} = parse(`<ng-template let-foo="b¦ar"></ng-template>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Variable);
  });

  it('should locate a @let name', () => {
    const {errors, nodes, position} = parse(`@let va¦lue = 1337;`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(LetDeclaration);
  });

  it('should locate template children', () => {
    const {errors, nodes, position} = parse(`<ng-template><d¦iv></div></ng-template>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Element);
  });

  it('should locate ng-content', () => {
    const {errors, nodes, position} = parse(`<ng-co¦ntent></ng-content>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Content);
  });

  it('should locate ng-content attribute key', () => {
    const {errors, nodes, position} = parse('<ng-content cla¦ss="red"></ng-content>');
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(TextAttribute);
  });

  it('should locate ng-content attribute value', () => {
    const {errors, nodes, position} = parse('<ng-content class="r¦ed"></ng-content>');
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    // TODO: Note that we do not have the ability to detect the RHS (yet)
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(TextAttribute);
  });

  it('should locate element inside ng-content', () => {
    const {errors, nodes, position} = parse(`<ng-content><¦div></div></ng-content>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Element);
  });

  it('should not locate implicit receiver', () => {
    const {errors, nodes, position} = parse(`<div [foo]="¦bar"></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
  });

  it('should locate bound attribute key in two-way binding', () => {
    const {errors, nodes, position} = parse(`<cmp [(f¦oo)]="bar"></cmp>`);
    expect(errors).toBe(null);
    const {context, parent} = getTargetAtPosition(nodes, position)!;
    expect(parent).toBeInstanceOf(Element);
    const {
      nodes: [boundAttribute, boundEvent],
    } = context as TwoWayBindingContext;
    expect(boundAttribute.name).toBe('foo');
    expect(boundEvent.name).toBe('fooChange');
  });

  it('should locate node when in value span of two-way binding', () => {
    const {errors, nodes, position} = parse(`<cmp [(foo)]="b¦ar"></cmp>`);
    expect(errors).toBe(null);
    const {context, parent} = getTargetAtPosition(nodes, position)!;
    // It doesn't actually matter if the template target returns the read or the write.
    // When the template target returns a property read, we only use the LHS downstream because the
    // RHS would have its own node in the AST that would have been returned instead. The LHS of the
    // `PropertyWrite` is the same as the `PropertyRead`.
    expect(parent instanceof BoundAttribute || parent instanceof BoundEvent).toBe(true);
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node instanceof PropertyRead || node instanceof PropertyWrite).toBeTrue();
    expect((node as PropertyRead | PropertyWrite).name).toBe('bar');
  });

  it('should locate switch value in ICUs', () => {
    const {errors, nodes, position} = parse(`<span i18n>{sw¦itch, plural, other {text}}"></span>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
    expect((node as PropertyRead).name).toBe('switch');
  });

  it('should locate switch value in nested ICUs', () => {
    const {errors, nodes, position} = parse(
      `<span i18n>{expr, plural, other { {ne¦sted, plural, =1 { {{nestedInterpolation}} }} }}"></span>`,
    );
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
    expect((node as PropertyRead).name).toBe('nested');
  });

  it('should locate interpolation expressions in ICUs', () => {
    const {errors, nodes, position} = parse(
      `<span i18n>{expr, plural, other { {{ i¦nterpolation }} }}"></span>`,
    );
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
    expect((node as PropertyRead).name).toBe('interpolation');
  });

  it('should locate interpolation expressions in nested ICUs', () => {
    const {errors, nodes, position} = parse(
      `<span i18n>{expr, plural, other { {nested, plural, =1 { {{n¦estedInterpolation}} }} }}"></span>`,
    );
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
    expect((node as PropertyRead).name).toBe('nestedInterpolation');
  });
});

describe('getTargetAtPosition for expression AST', () => {
  it('should not locate implicit receiver', () => {
    const {errors, nodes, position} = parse(`{{ ¦title }}`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
    expect((node as PropertyRead).name).toBe('title');
  });

  it('should locate property read', () => {
    const {errors, nodes, position} = parse(`{{ ti¦tle }}`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
    expect((node as PropertyRead).name).toBe('title');
  });

  it('should locate safe property read', () => {
    const {errors, nodes, position} = parse(`{{ foo?¦.bar }}`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(SafePropertyRead);
    expect((node as SafePropertyRead).name).toBe('bar');
  });

  it('should locate keyed read', () => {
    const {errors, nodes, position} = parse(`{{ foo['bar']¦ }}`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(KeyedRead);
  });

  it('should locate safe keyed read', () => {
    const {errors, nodes, position} = parse(`{{ foo?.['bar']¦ }}`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(SafeKeyedRead);
  });

  it('should locate property write', () => {
    const {errors, nodes, position} = parse(`<div (foo)="b¦ar=$event"></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyWrite);
  });

  it('should locate keyed write', () => {
    const {errors, nodes, position} = parse(`<div (foo)="bar['baz']¦=$event"></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(KeyedWrite);
  });

  it('should locate binary', () => {
    const {errors, nodes, position} = parse(`{{ 1 +¦ 2 }}`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Binary);
  });

  it('should locate binding pipe with an identifier', () => {
    const {errors, nodes, position} = parse(`{{ title | p¦ }}`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(BindingPipe);
  });

  it('should locate binding pipe without identifier', () => {
    const {errors, nodes, position} = parse(`{{ title | ¦ }}`);
    expect(errors?.length).toBe(1);
    expect(errors![0].toString()).toContain(
      'Unexpected end of input, expected identifier or keyword at the end of the expression',
    );
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(BindingPipe);
  });

  it('should locate binding pipe without identifier', () => {
    // TODO: We are not able to locate pipe if identifier is missing because the
    // parser throws an error. This case is important for autocomplete.
    // const {errors, nodes, position} = parse(`{{ title | ¦ }}`);
    // expect(errors).toBe(null);
    // const {context} = findNodeAtPosition(nodes, position)!;
    // expect(isExpressionNode(node!)).toBe(true);
    // expect(node).toBeInstanceOf(BindingPipe);
  });

  it('should locate method call', () => {
    const {errors, nodes, position} = parse(`{{ title.toString(¦) }}`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Call);
  });

  it('should locate safe method call', () => {
    const {errors, nodes, position} = parse(`{{ title?.toString(¦) }}`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Call);
  });

  it('should locate safe call', () => {
    const {errors, nodes, position} = parse(`{{ title.toString?.(¦) }}`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(SafeCall);
  });

  it('should identify when in the argument position in a no-arg method call', () => {
    const {errors, nodes, position} = parse(`{{ title.toString(¦) }}`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    expect(context.kind).toEqual(TargetNodeKind.CallExpressionInArgContext);
    const {node} = context as SingleNodeTarget;
    expect(node).toBeInstanceOf(Call);
  });

  it('should locate literal primitive in interpolation', () => {
    const {errors, nodes, position} = parse(`{{ title.indexOf('t¦') }}`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(LiteralPrimitive);
    expect((node as LiteralPrimitive).value).toBe('t');
  });

  it('should locate literal primitive in binding', () => {
    const {errors, nodes, position} = parse(`<div [id]="'t¦'"></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(LiteralPrimitive);
    expect((node as LiteralPrimitive).value).toBe('t');
  });

  it('should locate empty expression', () => {
    const {errors, nodes, position} = parse(`<div [id]="¦"></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(EmptyExpr);
  });

  it('should locate literal array', () => {
    const {errors, nodes, position} = parse(`{{ [1, 2,¦ 3] }}`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(LiteralArray);
  });

  it('should locate literal map', () => {
    const {errors, nodes, position} = parse(`{{ { hello:¦ "world" } }}`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(LiteralMap);
  });

  it('should locate conditional', () => {
    const {errors, nodes, position} = parse(`{{ cond ?¦ true : false }}`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Conditional);
  });

  it('should locate a @let value', () => {
    const {errors, nodes, position} = parse(`@let value = 13¦37;`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(LiteralPrimitive);
    expect((node as LiteralPrimitive).value).toBe(1337);
  });

  describe('object literal shorthand', () => {
    it('should locate on literal with one shorthand property', () => {
      const {errors, nodes, position} = parse(`{{ {va¦l1} }}`);
      expect(errors).toBe(null);
      const {context} = getTargetAtPosition(nodes, position)!;
      expect(context.kind).toBe(TargetNodeKind.RawExpression);
      const {node} = context as SingleNodeTarget;
      expect(node).toBeInstanceOf(PropertyRead);
      expect((node as PropertyRead).name).toBe('val1');
    });

    it('should locate on literal with multiple shorthand properties', () => {
      const {errors, nodes, position} = parse(`{{ {val1, va¦l2} }}`);
      expect(errors).toBe(null);
      const {context} = getTargetAtPosition(nodes, position)!;
      expect(context.kind).toBe(TargetNodeKind.RawExpression);
      const {node} = context as SingleNodeTarget;
      expect(node).toBeInstanceOf(PropertyRead);
      expect((node as PropertyRead).name).toBe('val2');
    });

    it('should locale on property with mixed shorthand and regular properties', () => {
      const {errors, nodes, position} = parse(`{{ {val1: 'val1', va¦l2} }}`);
      expect(errors).toBe(null);
      const {context} = getTargetAtPosition(nodes, position)!;
      expect(context.kind).toBe(TargetNodeKind.RawExpression);
      const {node} = context as SingleNodeTarget;
      expect(node).toBeInstanceOf(PropertyRead);
      expect((node as PropertyRead).name).toBe('val2');
    });
  });
});

describe('findNodeAtPosition for microsyntax expression', () => {
  it('should locate template key', () => {
    const {errors, nodes, position} = parse(`<div *ng¦If="foo"></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(BoundAttribute);
  });

  it('should locate template value', () => {
    const {errors, nodes, position} = parse(`<div *ngIf="f¦oo"></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
  });

  it('should locate property read next to variable in structural directive syntax', () => {
    const {errors, nodes, position} = parse(`<div *ngIf="fo¦o as bar"></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
  });

  it('should locate text attribute', () => {
    const {errors, nodes, position} = parse(`<div *ng¦For="let item of items"></div>`);
    // ngFor is a text attribute because the desugared form is
    // <ng-template ngFor let-item [ngForOf]="items">
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBeTrue();
    expect(node).toBeInstanceOf(TextAttribute);
    expect((node as TextAttribute).name).toBe('ngFor');
  });

  it('should not locate let keyword', () => {
    const {errors, nodes, position} = parse(`<div *ngFor="l¦et item of items"></div>`);
    expect(errors).toBeNull();
    const target = getTargetAtPosition(nodes, position)!;
    expect(target).toBeNull();
  });

  it('should locate let variable', () => {
    const {errors, nodes, position} = parse(`<div *ngFor="let i¦tem of items"></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Variable);
    expect((node as Variable).name).toBe('item');
  });

  it('should locate bound attribute key', () => {
    const {errors, nodes, position} = parse(`<div *ngFor="let item o¦f items"></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(BoundAttribute);
    expect((node as BoundAttribute).name).toBe('ngForOf');
  });

  it('should locate bound attribute key when cursor is at the start', () => {
    const {errors, nodes, position} = parse(`<div *ngFor="let item ¦of items"></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const node = (context as SingleNodeTarget).node;
    expect(isTemplateNode(node)).toBe(true);
    expect(node).toBeInstanceOf(BoundAttribute);
    expect((node as BoundAttribute).name).toBe('ngForOf');
  });

  it('should locate bound attribute key for trackBy', () => {
    const {errors, nodes, position} = parse(
      `<div *ngFor="let item of items; trac¦kBy: trackByFn"></div>`,
    );
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(BoundAttribute);
    expect((node as BoundAttribute).name).toBe('ngForTrackBy');
  });

  it('should locate first bound attribute when there are two', () => {
    // It used to be the case that all microsyntax bindings share the same
    // source span, so the second bound attribute would overwrite the first.
    // This has been fixed in pr/39036, this case is added to prevent regression.
    const {errors, nodes, position} = parse(
      `<div *ngFor="let item o¦f items; trackBy: trackByFn"></div>`,
    );
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(BoundAttribute);
    expect((node as BoundAttribute).name).toBe('ngForOf');
  });

  it('should locate bound attribute value', () => {
    const {errors, nodes, position} = parse(`<div *ngFor="let item of it¦ems"></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
    expect((node as PropertyRead).name).toBe('items');
  });

  it('should locate template children', () => {
    const {errors, nodes, position} = parse(`<di¦v *ngIf></div>`);
    expect(errors).toBe(null);
    const {context, template} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Element);
    expect((node as Element).name).toBe('div');
    expect(template).toBeInstanceOf(Template);
  });

  it('should locate property read of variable declared within template', () => {
    const {errors, nodes, position} = parse(`
      <div *ngFor="let item of items; let i=index">
        {{ i¦ }}
      </div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
  });

  it('should locate LHS of variable declaration', () => {
    const {errors, nodes, position} = parse(`<div *ngFor="let item of items; let i¦=index">`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Variable);
    // TODO: Currently there is no way to distinguish LHS from RHS
    expect((node as Variable).name).toBe('i');
  });

  it('should locate RHS of variable declaration', () => {
    const {errors, nodes, position} = parse(`<div *ngFor="let item of items; let i=in¦dex">`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Variable);
    // TODO: Currently there is no way to distinguish LHS from RHS
    expect((node as Variable).value).toBe('index');
  });

  it('should locate an element in its tag context', () => {
    const {errors, nodes, position} = parse(`<div¦ attr></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    expect(context.kind).toBe(TargetNodeKind.ElementInTagContext);
    expect((context as SingleNodeTarget).node).toBeInstanceOf(Element);
  });

  it('should locate an element in its body context', () => {
    const {errors, nodes, position} = parse(`<div ¦ attr></div>`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    expect(context.kind).toBe(TargetNodeKind.ElementInBodyContext);
    expect((context as SingleNodeTarget).node).toBeInstanceOf(Element);
  });
});

describe('unclosed elements', () => {
  it('should locate children of unclosed elements', () => {
    const {errors, nodes, position} = parse(`<div> {{b¦ar}}`);
    expect(errors).toBe(null);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
  });

  it('should locate children of outside of unclosed when parent is closed elements', () => {
    const {nodes, position} = parse(`<li><div></li> {{b¦ar}}`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
  });

  it('should locate nodes before unclosed element', () => {
    const {nodes, position} = parse(`<li>{{b¦ar}}<div></li>`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
  });

  it('should be correct for end tag of parent node with unclosed child', () => {
    const {nodes, position} = parse(`<li><div><div>{{bar}}</l¦i>`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Element);
    expect((node as Element).name).toBe('li');
  });
});

describe('blocks', () => {
  it('should visit switch block', () => {
    const {nodes, position} = parse(`@swi¦tch (foo) { @case (bar) { } }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(SwitchBlock);
  });

  it('should visit switch block test expression', () => {
    const {nodes, position} = parse(`@switch (fo¦o) { @case (bar) { } }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
    expect((node as PropertyRead).name).toBe('foo');
  });

  it('should visit case block', () => {
    const {nodes, position} = parse(`@switch (foo) { @c¦ase (bar) { } }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(SwitchBlockCase);
  });

  it('should visit case expression', () => {
    const {nodes, position} = parse(`@switch (foo) { @case (b¦ar) { } }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
    expect((node as PropertyRead).name).toBe('bar');
  });

  it('should visit case body', () => {
    const {nodes, position} = parse(`@switch (foo) { @case (bar) { <sp¦an></span> } }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Element);
    expect((node as Element).name).toBe('span');
  });

  it('should visit default block on switch', () => {
    const {nodes, position} = parse(`@switch (foo) { @d¦efault { } }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(SwitchBlockCase);
  });

  it('should visit if block main branch', () => {
    const {nodes, position} = parse(`@i¦f (title) { }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(IfBlockBranch);
  });

  it('should visit if condition of if block', () => {
    const {nodes, position} = parse(`@if (tit¦le) { }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
    expect((node as PropertyRead).name).toBe('title');
  });

  it('should visit else condition of else if block', () => {
    const {nodes, position} = parse(`@if (title) { } @else if (ti¦tle)`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
    expect((node as PropertyRead).name).toBe('title');
  });

  it('should visit alias declaration of if block', () => {
    const {nodes, position} = parse(`@if (title; as fo¦o) { }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(node).toBeInstanceOf(Variable);
    expect((node as Variable).name).toBe('foo');
  });

  it('should visit alias usage of if block', () => {
    const {nodes, position} = parse(`@if (title; as foo) { {{ fo¦o }} }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
    expect((node as PropertyRead).name).toBe('foo');
  });

  it('should visit keyword in for blocks', () => {
    const {nodes, position} = parse(`@fo¦r (foo of bar; track foo) { }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(ForLoopBlock);
  });

  it('should visit LHS of expression in for blocks', () => {
    const {nodes, position} = parse(`@for (fo¦o of bar; track foo) {  }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Variable);
    expect((node as Variable).name).toBe('foo');
  });

  it('should visit RHS of expression in for blocks', () => {
    const {nodes, position} = parse(`@for (foo of ba¦r; track foo) { }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
    expect((node as PropertyRead).name).toBe('bar');
  });

  it('should visit track expression in for blocks', () => {
    const {nodes, position} = parse(`@for (foo of bar; track f¦oo) { }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
    expect((node as PropertyRead).name).toBe('foo');
  });

  it('should visit LHS of assignment expression in for blocks', () => {
    const {nodes, position} = parse(`@for (foo of bar; track foo; let i¦1 = $index) { }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Variable);
    expect((node as Variable).name).toBe('i1');
    expect((node as Variable).value).toBe('$index');
  });

  it('should visit RHS of assignment expression in for blocks', () => {
    const {nodes, position} = parse(`@for (foo of bar; track foo; let i1 = $i¦ndex) { }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Variable);
    expect((node as Variable).name).toBe('i1');
    expect((node as Variable).value).toBe('$index');
  });

  it('should visit for block body in for blocks', () => {
    const {nodes, position} = parse(`@for (foo of bar; track foo) { <sp¦an></span> }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Element);
    expect((node as Element).name).toBe('span');
  });

  it('should visit empty block in for blocks', () => {
    const {nodes, position} = parse(
      `@for (foo of bar; track foo; let i1 = $index) { } @em¦pty { }`,
    );
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(ForLoopBlockEmpty);
  });

  it('should visit empty block body in for blocks', () => {
    const {nodes, position} = parse(`@for (foo of bar; track foo) { } @empty { <sp¦an></span> }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(Element);
    expect((node as Element).name).toBe('span');
  });

  it('should visit body of if block', () => {
    const {nodes, position} = parse(`@if (title; as foo) { {{ fo¦o }} }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
    expect((node as PropertyRead).name).toBe('foo');
  });

  it('should visit when conditions on defer blocks', () => {
    const {nodes, position} = parse(`@defer (when fo¦o) { }`);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
    expect((node as PropertyRead).name).toBe('foo');
  });

  it('should visit numeric on conditions on defer blocks', () => {
    const {nodes, position} = parse(` @defer (on timer(2¦s)) { } `);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(TimerDeferredTrigger);
    expect((node as TimerDeferredTrigger).delay).toBe(2000);
  });

  // TODO: Should the parser ingest a property read for `localRef`, instead of a string?
  // (Talk to Kristiyan?)
  // xit('should visit on conditions on defer blocks', () => {
  //   const {nodes, position} = parse(`
  //   <div #localRef></div>
  //   @defer (on viewport(local¦Ref)) { }
  //   `);
  //   const {context} = getTargetAtPosition(nodes, position)!;
  //   const {node} = context as SingleNodeTarget;
  //   expect(isExpressionNode(node!)).toBe(true);
  //   expect(node).toBeInstanceOf(PropertyRead);
  //   expect((node as PropertyRead).name).toBe('localRef');
  // });

  it('should visit secondary blocks on defer blocks', () => {
    const {nodes, position} = parse(`@defer { } @er¦ror { <span></span> } `);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(DeferredBlockError);
  });

  it('should descend into secondary blocks on defer blocks', () => {
    const {nodes, position} = parse(`@defer (on immediate) { } @error { {{fo¦o}} } `);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isExpressionNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(PropertyRead);
    expect((node as PropertyRead).name).toBe('foo');
  });

  it('should visit placeholder blocks on defer blocks', () => {
    const {nodes, position} = parse(`@defer { } @placehol¦der { <span></span> } `);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(DeferredBlockPlaceholder);
  });

  it('should visit loading blocks on defer blocks', () => {
    const {nodes, position} = parse(`@defer { } @load¦ing {  } `);
    const {context} = getTargetAtPosition(nodes, position)!;
    const {node} = context as SingleNodeTarget;
    expect(isTemplateNode(node!)).toBe(true);
    expect(node).toBeInstanceOf(DeferredBlockLoading);
  });
});

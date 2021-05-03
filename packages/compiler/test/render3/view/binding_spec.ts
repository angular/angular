/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as e from '../../../src/expression_parser/ast';
import * as a from '../../../src/render3/r3_ast';
import {DirectiveMeta, InputOutputPropertySet} from '../../../src/render3/view/t2_api';
import {R3TargetBinder} from '../../../src/render3/view/t2_binder';
import {parseTemplate} from '../../../src/render3/view/template';
import {CssSelector, SelectorMatcher} from '../../../src/selector';

import {findExpression} from './util';

/**
 * A `InputOutputPropertySet` which only uses an identity mapping for fields and properties.
 */
class IdentityInputMapping implements InputOutputPropertySet {
  private names: Set<string>;

  constructor(names: string[]) {
    this.names = new Set(names);
  }

  hasBindingPropertyName(propertyName: string): boolean {
    return this.names.has(propertyName);
  }
}

function makeSelectorMatcher(): SelectorMatcher<DirectiveMeta> {
  const matcher = new SelectorMatcher<DirectiveMeta>();
  matcher.addSelectables(CssSelector.parse('[ngFor][ngForOf]'), {
    name: 'NgFor',
    exportAs: null,
    inputs: new IdentityInputMapping(['ngForOf']),
    outputs: new IdentityInputMapping([]),
    isComponent: false,
    isStructural: true,
    selector: '[ngFor][ngForOf]',
  });
  matcher.addSelectables(CssSelector.parse('[dir]'), {
    name: 'Dir',
    exportAs: null,
    inputs: new IdentityInputMapping([]),
    outputs: new IdentityInputMapping([]),
    isComponent: false,
    isStructural: false,
    selector: '[dir]'
  });
  matcher.addSelectables(CssSelector.parse('[hasOutput]'), {
    name: 'HasOutput',
    exportAs: null,
    inputs: new IdentityInputMapping([]),
    outputs: new IdentityInputMapping(['outputBinding']),
    isComponent: false,
    isStructural: false,
    selector: '[hasOutput]'
  });
  matcher.addSelectables(CssSelector.parse('[hasInput]'), {
    name: 'HasInput',
    exportAs: null,
    inputs: new IdentityInputMapping(['inputBinding']),
    outputs: new IdentityInputMapping([]),
    isComponent: false,
    isStructural: false,
    selector: '[hasInput]'
  });
  return matcher;
}

describe('t2 binding', () => {
  it('should bind a simple template', () => {
    const template = parseTemplate('<div *ngFor="let item of items">{{item.name}}</div>', '', {});
    const binder = new R3TargetBinder(new SelectorMatcher<DirectiveMeta>());
    const res = binder.bind({template: template.nodes});

    const itemBinding =
        (findExpression(template.nodes, '{{item.name}}')! as e.Interpolation).expressions[0] as
        e.PropertyRead;
    const item = itemBinding.receiver;
    const itemTarget = res.getExpressionTarget(item);
    if (!(itemTarget instanceof a.Variable)) {
      return fail('Expected item to point to a Variable');
    }
    expect(itemTarget.value).toBe('$implicit');
    const itemTemplate = res.getTemplateOfSymbol(itemTarget);
    expect(itemTemplate).not.toBeNull();
    expect(res.getNestingLevel(itemTemplate!)).toBe(1);
  });

  it('should match directives when binding a simple template', () => {
    const template = parseTemplate('<div *ngFor="let item of items">{{item.name}}</div>', '', {});
    const binder = new R3TargetBinder(makeSelectorMatcher());
    const res = binder.bind({template: template.nodes});
    const tmpl = template.nodes[0] as a.Template;
    const directives = res.getDirectivesOfNode(tmpl)!;
    expect(directives).not.toBeNull();
    expect(directives.length).toBe(1);
    expect(directives[0].name).toBe('NgFor');
  });

  it('should match directives on namespaced elements', () => {
    const template = parseTemplate('<svg><text dir>SVG</text></svg>', '', {});
    const matcher = new SelectorMatcher<DirectiveMeta>();
    matcher.addSelectables(CssSelector.parse('text[dir]'), {
      name: 'Dir',
      exportAs: null,
      inputs: new IdentityInputMapping([]),
      outputs: new IdentityInputMapping([]),
      isComponent: false,
      isStructural: false,
      selector: 'text[dir]'
    });
    const binder = new R3TargetBinder(matcher);
    const res = binder.bind({template: template.nodes});
    const svgNode = template.nodes[0] as a.Element;
    const textNode = svgNode.children[0] as a.Element;
    const directives = res.getDirectivesOfNode(textNode)!;
    expect(directives).not.toBeNull();
    expect(directives.length).toBe(1);
    expect(directives[0].name).toBe('Dir');
  });

  it('should not match directives intended for an element on a microsyntax template', () => {
    const template = parseTemplate('<div *ngFor="let item of items" dir></div>', '', {});
    const binder = new R3TargetBinder(makeSelectorMatcher());
    const res = binder.bind({template: template.nodes});
    const tmpl = template.nodes[0] as a.Template;
    const tmplDirectives = res.getDirectivesOfNode(tmpl)!;
    expect(tmplDirectives).not.toBeNull();
    expect(tmplDirectives.length).toBe(1);
    expect(tmplDirectives[0].name).toBe('NgFor');
    const elDirectives = res.getDirectivesOfNode(tmpl.children[0] as a.Element)!;
    expect(elDirectives).not.toBeNull();
    expect(elDirectives.length).toBe(1);
    expect(elDirectives[0].name).toBe('Dir');
  });

  describe('matching inputs to consuming directives', () => {
    it('should work for bound attributes', () => {
      const template = parseTemplate('<div hasInput [inputBinding]="myValue"></div>', '', {});
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const res = binder.bind({template: template.nodes});
      const el = template.nodes[0] as a.Element;
      const attr = el.inputs[0];
      const consumer = res.getConsumerOfBinding(attr) as DirectiveMeta;
      expect(consumer.name).toBe('HasInput');
    });

    it('should work for text attributes on elements', () => {
      const template = parseTemplate('<div hasInput inputBinding="text"></div>', '', {});
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const res = binder.bind({template: template.nodes});
      const el = template.nodes[0] as a.Element;
      const attr = el.attributes[1];
      const consumer = res.getConsumerOfBinding(attr) as DirectiveMeta;
      expect(consumer.name).toBe('HasInput');
    });

    it('should work for text attributes on templates', () => {
      const template =
          parseTemplate('<ng-template hasInput inputBinding="text"></ng-template>', '', {});
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const res = binder.bind({template: template.nodes});
      const el = template.nodes[0] as a.Element;
      const attr = el.attributes[1];
      const consumer = res.getConsumerOfBinding(attr) as DirectiveMeta;
      expect(consumer.name).toBe('HasInput');
    });

    it('should bind to the encompassing node when no directive input is matched', () => {
      const template = parseTemplate('<span dir></span>', '', {});
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const res = binder.bind({template: template.nodes});
      const el = template.nodes[0] as a.Element;
      const attr = el.attributes[0];
      const consumer = res.getConsumerOfBinding(attr);
      expect(consumer).toEqual(el);
    });
  });

  describe('matching outputs to consuming directives', () => {
    it('should work for bound events', () => {
      const template =
          parseTemplate('<div hasOutput (outputBinding)="myHandler($event)"></div>', '', {});
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const res = binder.bind({template: template.nodes});
      const el = template.nodes[0] as a.Element;
      const attr = el.outputs[0];
      const consumer = res.getConsumerOfBinding(attr) as DirectiveMeta;
      expect(consumer.name).toBe('HasOutput');
    });

    it('should bind to the encompassing node when no directive output is matched', () => {
      const template = parseTemplate('<span dir (fakeOutput)="myHandler($event)"></span>', '', {});
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const res = binder.bind({template: template.nodes});
      const el = template.nodes[0] as a.Element;
      const attr = el.outputs[0];
      const consumer = res.getConsumerOfBinding(attr);
      expect(consumer).toEqual(el);
    });
  });

  describe('used pipes', () => {
    it('should record pipes used in interpolations', () => {
      const template = parseTemplate('{{value|date}}', '', {});
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const res = binder.bind({template: template.nodes});
      expect(res.getUsedPipes()).toEqual(['date']);
    });

    it('should record pipes used in bound attributes', () => {
      const template = parseTemplate('<person [age]="age|number"></person>', '', {});
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const res = binder.bind({template: template.nodes});
      expect(res.getUsedPipes()).toEqual(['number']);
    });

    it('should record pipes used in bound template attributes', () => {
      const template = parseTemplate('<ng-template [ngIf]="obs|async"></ng-template>', '', {});
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const res = binder.bind({template: template.nodes});
      expect(res.getUsedPipes()).toEqual(['async']);
    });

    it('should record pipes used in ICUs', () => {
      const template = parseTemplate(
          `<span i18n>{count|number, plural,
            =1 { {{value|date}} }
          }</span>`,
          '', {});
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const res = binder.bind({template: template.nodes});
      expect(res.getUsedPipes()).toEqual(['number', 'date']);
    });
  });
});

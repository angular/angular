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

function makeSelectorMatcher(): SelectorMatcher<DirectiveMeta[]> {
  const matcher = new SelectorMatcher<DirectiveMeta[]>();
  matcher.addSelectables(CssSelector.parse('[ngFor][ngForOf]'), [{
                           name: 'NgFor',
                           exportAs: null,
                           inputs: new IdentityInputMapping(['ngForOf']),
                           outputs: new IdentityInputMapping([]),
                           isComponent: false,
                           isStructural: true,
                           selector: '[ngFor][ngForOf]',
                           animationTriggerNames: null,
                           ngContentSelectors: null,
                           preserveWhitespaces: false,
                         }]);
  matcher.addSelectables(CssSelector.parse('[dir]'), [{
                           name: 'Dir',
                           exportAs: ['dir'],
                           inputs: new IdentityInputMapping([]),
                           outputs: new IdentityInputMapping([]),
                           isComponent: false,
                           isStructural: false,
                           selector: '[dir]',
                           animationTriggerNames: null,
                           ngContentSelectors: null,
                           preserveWhitespaces: false,
                         }]);
  matcher.addSelectables(CssSelector.parse('[hasOutput]'), [{
                           name: 'HasOutput',
                           exportAs: null,
                           inputs: new IdentityInputMapping([]),
                           outputs: new IdentityInputMapping(['outputBinding']),
                           isComponent: false,
                           isStructural: false,
                           selector: '[hasOutput]',
                           animationTriggerNames: null,
                           ngContentSelectors: null,
                           preserveWhitespaces: false,
                         }]);
  matcher.addSelectables(CssSelector.parse('[hasInput]'), [{
                           name: 'HasInput',
                           exportAs: null,
                           inputs: new IdentityInputMapping(['inputBinding']),
                           outputs: new IdentityInputMapping([]),
                           isComponent: false,
                           isStructural: false,
                           selector: '[hasInput]',
                           animationTriggerNames: null,
                           ngContentSelectors: null,
                           preserveWhitespaces: false,
                         }]);
  matcher.addSelectables(CssSelector.parse('[sameSelectorAsInput]'), [{
                           name: 'SameSelectorAsInput',
                           exportAs: null,
                           inputs: new IdentityInputMapping(['sameSelectorAsInput']),
                           outputs: new IdentityInputMapping([]),
                           isComponent: false,
                           isStructural: false,
                           selector: '[sameSelectorAsInput]',
                           animationTriggerNames: null,
                           ngContentSelectors: null,
                           preserveWhitespaces: false,
                         }]);
  matcher.addSelectables(CssSelector.parse('comp'), [{
                           name: 'Comp',
                           exportAs: null,
                           inputs: new IdentityInputMapping([]),
                           outputs: new IdentityInputMapping([]),
                           isComponent: true,
                           isStructural: false,
                           selector: 'comp',
                           animationTriggerNames: null,
                           ngContentSelectors: null,
                           preserveWhitespaces: false,
                         }]);

  const simpleDirectives = ['a', 'b', 'c', 'd', 'e', 'f'];
  const deferBlockDirectives = ['loading', 'error', 'placeholder'];
  for (const dir of [...simpleDirectives, ...deferBlockDirectives]) {
    const name = dir[0].toUpperCase() + dir.slice(1).toLowerCase();
    matcher.addSelectables(CssSelector.parse(`[${dir}]`), [{
                             name: `Dir${name}`,
                             exportAs: null,
                             inputs: new IdentityInputMapping([]),
                             outputs: new IdentityInputMapping([]),
                             isComponent: false,
                             isStructural: true,
                             selector: `[${dir}]`,
                             animationTriggerNames: null,
                             ngContentSelectors: null,
                             preserveWhitespaces: false,
                           }]);
  }

  return matcher;
}

describe('t2 binding', () => {
  it('should bind a simple template', () => {
    const template = parseTemplate('<div *ngFor="let item of items">{{item.name}}</div>', '', {});
    const binder = new R3TargetBinder(new SelectorMatcher<DirectiveMeta[]>());
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
    const itemTemplate = res.getDefinitionNodeOfSymbol(itemTarget);
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
    const matcher = new SelectorMatcher<DirectiveMeta[]>();
    matcher.addSelectables(CssSelector.parse('text[dir]'), [{
                             name: 'Dir',
                             exportAs: null,
                             inputs: new IdentityInputMapping([]),
                             outputs: new IdentityInputMapping([]),
                             isComponent: false,
                             isStructural: false,
                             selector: 'text[dir]',
                             animationTriggerNames: null,
                             ngContentSelectors: null,
                             preserveWhitespaces: false,
                           }]);
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

    it('should not match directives on attribute bindings with the same name as an input', () => {
      const template =
          parseTemplate('<ng-template [attr.sameSelectorAsInput]="123"></ng-template>', '', {});
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const res = binder.bind({template: template.nodes});
      const el = template.nodes[0] as a.Element;
      const input = el.inputs[0];
      const consumer = res.getConsumerOfBinding(input);
      expect(consumer).toEqual(el);
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

  describe('extracting defer blocks info', () => {
    it('should extract top-level defer blocks', () => {
      const template = parseTemplate(
          `
            @defer {<cmp-a />}
            @defer {<cmp-b />}
            <cmp-c />
          `,
          '');
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const deferBlocks = bound.getDeferBlocks();
      expect(deferBlocks.length).toBe(2);
    });

    it('should extract nested defer blocks and associated pipes', () => {
      const template = parseTemplate(
          `
            @defer {
              {{ name | pipeA }}
              @defer {
                {{ name | pipeB }}
              }
            } @loading {
              @defer {
                {{ name | pipeC }}
              }
              {{ name | loading }}
            } @placeholder {
              @defer {
                {{ name | pipeD }}
              }
              {{ name | placeholder }}
            } @error {
              @defer {
                {{ name | pipeE }}
              }
              {{ name | error }}
            }
            {{ name | pipeF }}
          `,
          '');
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const deferBlocks = bound.getDeferBlocks();

      expect(deferBlocks.length).toBe(5);

      // Record all pipes used within :placeholder, :loading and :error sub-blocks,
      // also record pipes used outside of any defer blocks.
      expect(bound.getEagerlyUsedPipes()).toEqual(['placeholder', 'loading', 'error', 'pipeF']);

      // Record *all* pipes from the template, including the ones from defer blocks.
      expect(bound.getUsedPipes()).toEqual([
        'pipeA', 'pipeB', 'pipeD', 'placeholder', 'pipeC', 'loading', 'pipeE', 'error', 'pipeF'
      ]);
    });

    it('should identify pipes used after a nested defer block as being lazy', () => {
      const template = parseTemplate(
          `
          @defer {
            {{ name | pipeA }}
            @defer {
              {{ name | pipeB }}
            }
            {{ name | pipeC }}
          }
          `,
          '');
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});

      expect(bound.getUsedPipes()).toEqual(['pipeA', 'pipeB', 'pipeC']);
      expect(bound.getEagerlyUsedPipes()).toEqual([]);
    });

    it('should extract nested defer blocks and associated directives', () => {
      const template = parseTemplate(
          `
            @defer {
              <img *a />
              @defer {
                <img *b />
              }
            } @loading {
              @defer {
                <img *c />
              }
              <img *loading />
            } @placeholder {
              @defer {
                <img *d />
              }
              <img *placeholder />
            } @error {
              @defer {
                <img *e />
              }
              <img *error />
            }
            <img *f />
          `,
          '');
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const deferBlocks = bound.getDeferBlocks();

      expect(deferBlocks.length).toBe(5);

      // Record all directives used within placeholder, loading and error sub-blocks,
      // also record directives used outside of any defer blocks.
      const eagerDirs = bound.getEagerlyUsedDirectives();
      expect(eagerDirs.length).toBe(4);
      expect(eagerDirs.map(dir => dir.name)).toEqual([
        'DirPlaceholder', 'DirLoading', 'DirError', 'DirF'
      ]);

      // Record *all* directives from the template, including the ones from defer blocks.
      const allDirs = bound.getUsedDirectives();
      expect(allDirs.length).toBe(9);
      expect(allDirs.map(dir => dir.name)).toEqual([
        'DirA', 'DirB', 'DirD', 'DirPlaceholder', 'DirC', 'DirLoading', 'DirE', 'DirError', 'DirF'
      ]);
    });

    it('should identify directives used after a nested defer block as being lazy', () => {
      const template = parseTemplate(
          `
          @defer {
            <img *a />
            @defer {<img *b />}
            <img *c />
          }
          `,
          '');
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const allDirs = bound.getUsedDirectives().map(dir => dir.name);
      const eagerDirs = bound.getEagerlyUsedDirectives().map(dir => dir.name);

      expect(allDirs).toEqual(['DirA', 'DirB', 'DirC']);
      expect(eagerDirs).toEqual([]);
    });

    it('should identify a trigger element that is a parent of the deferred block', () => {
      const template = parseTemplate(
          `
          <div #trigger>
            @defer (on viewport(trigger)) {}
          </div>
          `,
          '');
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const block = Array.from(bound.getDeferBlocks())[0];
      const triggerEl = bound.getDeferredTriggerTarget(block, block.triggers.viewport!);
      expect(triggerEl?.name).toBe('div');
    });

    it('should identify a trigger element outside of the deferred block', () => {
      const template = parseTemplate(
          `
            <div>
              @defer (on viewport(trigger)) {}
            </div>

            <div>
              <div>
                <button #trigger></button>
              </div>
            </div>
          `,
          '');
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const block = Array.from(bound.getDeferBlocks())[0];
      const triggerEl = bound.getDeferredTriggerTarget(block, block.triggers.viewport!);
      expect(triggerEl?.name).toBe('button');
    });

    it('should identify a trigger element in a parent embedded view', () => {
      const template = parseTemplate(
          `
            <div *ngFor="let item of items">
              <button #trigger></button>

              <div *ngFor="let child of item.children">
                <div *ngFor="let grandchild of child.children">
                  @defer (on viewport(trigger)) {}
                </div>
              </div>
            </div>
          `,
          '');
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const block = Array.from(bound.getDeferBlocks())[0];
      const triggerEl = bound.getDeferredTriggerTarget(block, block.triggers.viewport!);
      expect(triggerEl?.name).toBe('button');
    });

    it('should identify a trigger element inside the placeholder', () => {
      const template = parseTemplate(
          `
            @defer (on viewport(trigger)) {
              main
            } @placeholder {
              <button #trigger></button>
            }
          `,
          '');
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const block = Array.from(bound.getDeferBlocks())[0];
      const triggerEl = bound.getDeferredTriggerTarget(block, block.triggers.viewport!);
      expect(triggerEl?.name).toBe('button');
    });

    it('should not identify a trigger inside the main content block', () => {
      const template = parseTemplate(
          `
            @defer (on viewport(trigger)) {<button #trigger></button>}
          `,
          '');
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const block = Array.from(bound.getDeferBlocks())[0];
      const triggerEl = bound.getDeferredTriggerTarget(block, block.triggers.viewport!);
      expect(triggerEl).toBeNull();
    });

    it('should identify a trigger element on a component', () => {
      const template = parseTemplate(
          `
            @defer (on viewport(trigger)) {}

            <comp #trigger/>
          `,
          '');
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const block = Array.from(bound.getDeferBlocks())[0];
      const triggerEl = bound.getDeferredTriggerTarget(block, block.triggers.viewport!);
      expect(triggerEl?.name).toBe('comp');
    });

    it('should identify a trigger element on a directive', () => {
      const template = parseTemplate(
          `
            @defer (on viewport(trigger)) {}

            <button dir #trigger="dir"></button>
          `,
          '');
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const block = Array.from(bound.getDeferBlocks())[0];
      const triggerEl = bound.getDeferredTriggerTarget(block, block.triggers.viewport!);
      expect(triggerEl?.name).toBe('button');
    });

    it('should identify an implicit trigger inside the placeholder block', () => {
      const template = parseTemplate(
          `
          <div #trigger>
            @defer (on viewport) {} @placeholder {<button></button>}
          </div>
          `,
          '');
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const block = Array.from(bound.getDeferBlocks())[0];
      const triggerEl = bound.getDeferredTriggerTarget(block, block.triggers.viewport!);
      expect(triggerEl?.name).toBe('button');
    });

    it('should identify an implicit trigger inside the placeholder block with comments', () => {
      const template = parseTemplate(
          `
            @defer (on viewport) {
              main
            } @placeholder {
              <!-- before -->
              <button #trigger></button>
              <!-- after -->
            }
          `,
          '');
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const block = Array.from(bound.getDeferBlocks())[0];
      const triggerEl = bound.getDeferredTriggerTarget(block, block.triggers.viewport!);
      expect(triggerEl?.name).toBe('button');
    });

    it('should not identify an implicit trigger if the placeholder has multiple root nodes', () => {
      const template = parseTemplate(
          `
            <div #trigger>
              @defer (on viewport) {} @placeholder {<button></button><div></div>}
            </div>
            `,
          '');
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const block = Array.from(bound.getDeferBlocks())[0];
      const triggerEl = bound.getDeferredTriggerTarget(block, block.triggers.viewport!);
      expect(triggerEl).toBeNull();
    });

    it('should not identify an implicit trigger if there is no placeholder', () => {
      const template = parseTemplate(
          `
          <div #trigger>
            @defer (on viewport) {}
            <button></button>
          </div>
          `,
          '');
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const block = Array.from(bound.getDeferBlocks())[0];
      const triggerEl = bound.getDeferredTriggerTarget(block, block.triggers.viewport!);
      expect(triggerEl).toBeNull();
    });

    it('should not identify an implicit trigger if the placeholder has a single root text node',
       () => {
         const template = parseTemplate(
             `
              <div #trigger>
                @defer (on viewport) {} @placeholder {hello}
              </div>
              `,
             '');
         const binder = new R3TargetBinder(makeSelectorMatcher());
         const bound = binder.bind({template: template.nodes});
         const block = Array.from(bound.getDeferBlocks())[0];
         const triggerEl = bound.getDeferredTriggerTarget(block, block.triggers.viewport!);
         expect(triggerEl).toBeNull();
       });

    it('should not identify a trigger inside a sibling embedded view', () => {
      const template = parseTemplate(
          `
            <div *ngIf="cond">
              <button #trigger></button>
            </div>

            @defer (on viewport(trigger)) {}
          `,
          '');
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const block = Array.from(bound.getDeferBlocks())[0];
      const triggerEl = bound.getDeferredTriggerTarget(block, block.triggers.viewport!);
      expect(triggerEl).toBeNull();
    });

    it('should not identify a trigger element in an embedded view inside the placeholder', () => {
      const template = parseTemplate(
          `
            @defer (on viewport(trigger)) {
              main
            } @placeholder {
              <div *ngIf="cond"><button #trigger></button></div>
            }
          `,
          '');
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const block = Array.from(bound.getDeferBlocks())[0];
      const triggerEl = bound.getDeferredTriggerTarget(block, block.triggers.viewport!);
      expect(triggerEl).toBeNull();
    });

    it('should not identify a trigger element inside the a deferred block within the placeholder',
       () => {
         const template = parseTemplate(
             `
                @defer (on viewport(trigger)) {
                  main
                } @placeholder {
                  @defer {
                    <button #trigger></button>
                  }
                }
              `,
             '');
         const binder = new R3TargetBinder(makeSelectorMatcher());
         const bound = binder.bind({template: template.nodes});
         const block = Array.from(bound.getDeferBlocks())[0];
         const triggerEl = bound.getDeferredTriggerTarget(block, block.triggers.viewport!);
         expect(triggerEl).toBeNull();
       });

    it('should not identify a trigger element on a template', () => {
      const template = parseTemplate(
          `
            @defer (on viewport(trigger)) {}

            <ng-template #trigger></ng-template>
          `,
          '');
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const block = Array.from(bound.getDeferBlocks())[0];
      const triggerEl = bound.getDeferredTriggerTarget(block, block.triggers.viewport!);
      expect(triggerEl).toBeNull();
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

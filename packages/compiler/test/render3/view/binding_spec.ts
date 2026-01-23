/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as e from '../../../src/expression_parser/ast';
import * as a from '../../../src/render3/r3_ast';
import {DirectiveMeta, InputOutputPropertySet} from '../../../src/render3/view/t2_api';
import {findMatchingDirectivesAndPipes, R3TargetBinder} from '../../../src/render3/view/t2_binder';
import {parseTemplate, ParseTemplateOptions} from '../../../src/render3/view/template';
import {CssSelector, SelectorlessMatcher, SelectorMatcher} from '../../../src/directive_matching';

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
  matcher.addSelectables(CssSelector.parse('[ngFor][ngForOf]'), [
    {
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
    },
  ]);
  matcher.addSelectables(CssSelector.parse('[dir]'), [
    {
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
    },
  ]);
  matcher.addSelectables(CssSelector.parse('[hasOutput]'), [
    {
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
    },
  ]);
  matcher.addSelectables(CssSelector.parse('[hasInput]'), [
    {
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
    },
  ]);
  matcher.addSelectables(CssSelector.parse('[sameSelectorAsInput]'), [
    {
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
    },
  ]);
  matcher.addSelectables(CssSelector.parse('comp'), [
    {
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
    },
  ]);

  const simpleDirectives = ['a', 'b', 'c', 'd', 'e', 'f'];
  const deferBlockDirectives = ['loading', 'error', 'placeholder'];
  for (const dir of [...simpleDirectives, ...deferBlockDirectives]) {
    const name = dir[0].toUpperCase() + dir.slice(1).toLowerCase();
    matcher.addSelectables(CssSelector.parse(`[${dir}]`), [
      {
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
      },
    ]);
  }

  return matcher;
}

describe('findMatchingDirectivesAndPipes', () => {
  it('should match directives and detect pipes in eager and deferrable parts of a template', () => {
    const template = `
      <div [title]="abc | uppercase"></div>
      @defer {
        <my-defer-cmp [label]="abc | lowercase" />
      } @placeholder {}
    `;
    const directiveSelectors = ['[title]', 'my-defer-cmp', 'not-matching'];
    const result = findMatchingDirectivesAndPipes(template, directiveSelectors);
    expect(result).toEqual({
      directives: {
        regular: ['[title]'],
        deferCandidates: ['my-defer-cmp'],
      },
      pipes: {
        regular: ['uppercase'],
        deferCandidates: ['lowercase'],
      },
    });
  });

  it('should return empty directive list if no selectors are provided', () => {
    const template = `
        <div [title]="abc | uppercase"></div>
        @defer {
          <my-defer-cmp [label]="abc | lowercase" />
        } @placeholder {}
      `;
    const directiveSelectors: string[] = [];
    const result = findMatchingDirectivesAndPipes(template, directiveSelectors);
    expect(result).toEqual({
      directives: {
        regular: [],
        deferCandidates: [],
      },
      // Expect pipes to be present still.
      pipes: {
        regular: ['uppercase'],
        deferCandidates: ['lowercase'],
      },
    });
  });

  it('should return a directive and a pipe only once (either as a regular or deferrable)', () => {
    const template = `
        <my-defer-cmp [label]="abc | lowercase" [title]="abc | uppercase" />
        @defer {
          <my-defer-cmp [label]="abc | lowercase" [title]="abc | uppercase" />
        } @placeholder {}
      `;
    const directiveSelectors = ['[title]', 'my-defer-cmp', 'not-matching'];
    const result = findMatchingDirectivesAndPipes(template, directiveSelectors);
    expect(result).toEqual({
      directives: {
        regular: ['my-defer-cmp', '[title]'],
        // All directives/components are used eagerly.
        deferCandidates: [],
      },
      pipes: {
        regular: ['lowercase', 'uppercase'],
        // All pipes are used eagerly.
        deferCandidates: [],
      },
    });
  });

  it('should handle directives on elements with local refs', () => {
    const template = `
        <input [(ngModel)]="name" #ctrl="ngModel" required />
        @defer {
          <my-defer-cmp [label]="abc | lowercase" [title]="abc | uppercase" />
          <input [(ngModel)]="name" #ctrl="ngModel" required />
        } @placeholder {}
      `;
    const directiveSelectors = [
      '[ngModel]:not([formControlName]):not([formControl])',
      '[title]',
      'my-defer-cmp',
      'not-matching',
    ];
    const result = findMatchingDirectivesAndPipes(template, directiveSelectors);
    expect(result).toEqual({
      directives: {
        // `ngModel` is used both eagerly and in a defer block, thus it's located
        // in the "regular" (eager) bucket.
        regular: ['[ngModel]:not([formControlName]):not([formControl])'],
        deferCandidates: ['my-defer-cmp', '[title]'],
      },
      pipes: {
        regular: [],
        deferCandidates: ['lowercase', 'uppercase'],
      },
    });
  });
});

describe('t2 binding', () => {
  it('should bind a simple template', () => {
    const template = parseTemplate('<div *ngFor="let item of items">{{item.name}}</div>', '', {});
    const binder = new R3TargetBinder(new SelectorMatcher<DirectiveMeta[]>());
    const res = binder.bind({template: template.nodes});

    const itemBinding = (findExpression(template.nodes, '{{item.name}}')! as e.Interpolation)
      .expressions[0] as e.PropertyRead;
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
    matcher.addSelectables(CssSelector.parse('text[dir]'), [
      {
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
      },
    ]);
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

  it('should get @let declarations when resolving entities at the root', () => {
    const template = parseTemplate(
      `
        @let one = 1;
        @let two = 2;
        @let sum = one + two;
      `,
      '',
    );
    const binder = new R3TargetBinder(new SelectorMatcher<DirectiveMeta[]>());
    const res = binder.bind({template: template.nodes});
    const entities = Array.from(res.getEntitiesInScope(null));

    expect(entities.map((entity) => entity.name)).toEqual(['one', 'two', 'sum']);
  });

  it('should scope @let declarations to their current view', () => {
    const template = parseTemplate(
      `
        @let one = 1;

        @if (true) {
          @let two = 2;
        }

        @if (true) {
          @let three = 3;
        }
      `,
      '',
    );
    const binder = new R3TargetBinder(new SelectorMatcher<DirectiveMeta[]>());
    const res = binder.bind({template: template.nodes});
    const rootEntities = Array.from(res.getEntitiesInScope(null));
    const firstBranchEntities = Array.from(
      res.getEntitiesInScope((template.nodes[1] as a.IfBlock).branches[0]),
    );
    const secondBranchEntities = Array.from(
      res.getEntitiesInScope((template.nodes[2] as a.IfBlock).branches[0]),
    );

    expect(rootEntities.map((entity) => entity.name)).toEqual(['one']);
    expect(firstBranchEntities.map((entity) => entity.name)).toEqual(['one', 'two']);
    expect(secondBranchEntities.map((entity) => entity.name)).toEqual(['one', 'three']);
  });

  it('should resolve expressions to an @let declaration', () => {
    const template = parseTemplate(
      `
        @let value = 1;
        {{value}}
      `,
      '',
    );
    const binder = new R3TargetBinder(new SelectorMatcher<DirectiveMeta[]>());
    const res = binder.bind({template: template.nodes});
    const interpolationWrapper = (template.nodes[1] as a.BoundText).value as e.ASTWithSource;
    const propertyRead = (interpolationWrapper.ast as e.Interpolation).expressions[0];
    const target = res.getExpressionTarget(propertyRead);

    expect(target instanceof a.LetDeclaration).toBe(true);
    expect((target as a.LetDeclaration)?.name).toBe('value');
  });

  it('should not resolve a `this` access to a template reference', () => {
    const template = parseTemplate(
      `
        <input #value>
        {{this.value}}
      `,
      '',
    );
    const binder = new R3TargetBinder(new SelectorMatcher<DirectiveMeta[]>());
    const res = binder.bind({template: template.nodes});
    const interpolationWrapper = (template.nodes[1] as a.BoundText).value as e.ASTWithSource;
    const propertyRead = (interpolationWrapper.ast as e.Interpolation).expressions[0];
    const target = res.getExpressionTarget(propertyRead);

    expect(target).toBe(null);
  });

  it('should not resolve a `this` access to a template variable', () => {
    const template = parseTemplate(`<ng-template let-value>{{this.value}}</ng-template>`, '');
    const binder = new R3TargetBinder(new SelectorMatcher<DirectiveMeta[]>());
    const res = binder.bind({template: template.nodes});
    const templateNode = template.nodes[0] as a.Template;
    const interpolationWrapper = (templateNode.children[0] as a.BoundText).value as e.ASTWithSource;
    const propertyRead = (interpolationWrapper.ast as e.Interpolation).expressions[0];
    const target = res.getExpressionTarget(propertyRead);

    expect(target).toBe(null);
  });

  it('should not resolve a `this` access to a `@let` declaration', () => {
    const template = parseTemplate(
      `
        @let value = 1;
        {{this.value}}
      `,
      '',
    );
    const binder = new R3TargetBinder(new SelectorMatcher<DirectiveMeta[]>());
    const res = binder.bind({template: template.nodes});
    const interpolationWrapper = (template.nodes[1] as a.BoundText).value as e.ASTWithSource;
    const propertyRead = (interpolationWrapper.ast as e.Interpolation).expressions[0];
    const target = res.getExpressionTarget(propertyRead);

    expect(target).toBe(null);
  });

  it('should resolve the definition node of let declarations', () => {
    const template = parseTemplate(
      `
        @if (true) {
          @let one = 1;
        }

        @if (true) {
          @let two = 2;
        }
      `,
      '',
    );
    const binder = new R3TargetBinder(new SelectorMatcher<DirectiveMeta[]>());
    const res = binder.bind({template: template.nodes});
    const firstBranch = (template.nodes[0] as a.IfBlock).branches[0];
    const firstLet = firstBranch.children[0] as a.LetDeclaration;
    const secondBranch = (template.nodes[1] as a.IfBlock).branches[0];
    const secondLet = secondBranch.children[0] as a.LetDeclaration;

    expect(res.getDefinitionNodeOfSymbol(firstLet)).toBe(firstBranch);
    expect(res.getDefinitionNodeOfSymbol(secondLet)).toBe(secondBranch);
  });

  it('should resolve an element reference without a directive matcher', () => {
    const template = parseTemplate('<div #foo></div>', '');
    const binder = new R3TargetBinder(null);
    const res = binder.bind({template: template.nodes});
    const node = template.nodes[0] as a.Component;
    const reference = node.references[0];
    const result = res.getReferenceTarget(reference) as a.Element;
    expect(result instanceof a.Element).toBe(true);
    expect(result.name).toBe('div');
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
      const template = parseTemplate(
        '<ng-template hasInput inputBinding="text"></ng-template>',
        '',
        {},
      );
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const res = binder.bind({template: template.nodes});
      const el = template.nodes[0] as a.Element;
      const attr = el.attributes[1];
      const consumer = res.getConsumerOfBinding(attr) as DirectiveMeta;
      expect(consumer.name).toBe('HasInput');
    });

    it('should not match directives on attribute bindings with the same name as an input', () => {
      const template = parseTemplate(
        '<ng-template [attr.sameSelectorAsInput]="123"></ng-template>',
        '',
        {},
      );
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
      const template = parseTemplate(
        '<div hasOutput (outputBinding)="myHandler($event)"></div>',
        '',
        {},
      );
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
        '',
      );
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
        '',
      );
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const deferBlocks = bound.getDeferBlocks();

      expect(deferBlocks.length).toBe(5);

      // Record all pipes used within :placeholder, :loading and :error sub-blocks,
      // also record pipes used outside of any defer blocks.
      expect(bound.getEagerlyUsedPipes()).toEqual(['placeholder', 'loading', 'error', 'pipeF']);

      // Record *all* pipes from the template, including the ones from defer blocks.
      expect(bound.getUsedPipes()).toEqual([
        'pipeA',
        'pipeB',
        'pipeD',
        'placeholder',
        'pipeC',
        'loading',
        'pipeE',
        'error',
        'pipeF',
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
        '',
      );
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
        '',
      );
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const deferBlocks = bound.getDeferBlocks();

      expect(deferBlocks.length).toBe(5);

      // Record all directives used within placeholder, loading and error sub-blocks,
      // also record directives used outside of any defer blocks.
      const eagerDirs = bound.getEagerlyUsedDirectives();
      expect(eagerDirs.length).toBe(4);
      expect(eagerDirs.map((dir) => dir.name)).toEqual([
        'DirPlaceholder',
        'DirLoading',
        'DirError',
        'DirF',
      ]);

      // Record *all* directives from the template, including the ones from defer blocks.
      const allDirs = bound.getUsedDirectives();
      expect(allDirs.length).toBe(9);
      expect(allDirs.map((dir) => dir.name)).toEqual([
        'DirA',
        'DirB',
        'DirD',
        'DirPlaceholder',
        'DirC',
        'DirLoading',
        'DirE',
        'DirError',
        'DirF',
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
        '',
      );
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const allDirs = bound.getUsedDirectives().map((dir) => dir.name);
      const eagerDirs = bound.getEagerlyUsedDirectives().map((dir) => dir.name);

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
        '',
      );
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
        '',
      );
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
        '',
      );
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
        '',
      );
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
        '',
      );
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
        '',
      );
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
        '',
      );
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
        '',
      );
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
        '',
      );
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
        '',
      );
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
        '',
      );
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const block = Array.from(bound.getDeferBlocks())[0];
      const triggerEl = bound.getDeferredTriggerTarget(block, block.triggers.viewport!);
      expect(triggerEl).toBeNull();
    });

    it('should not identify an implicit trigger if the placeholder has a single root text node', () => {
      const template = parseTemplate(
        `
              <div #trigger>
                @defer (on viewport) {} @placeholder {hello}
              </div>
              `,
        '',
      );
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
        '',
      );
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
        '',
      );
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const bound = binder.bind({template: template.nodes});
      const block = Array.from(bound.getDeferBlocks())[0];
      const triggerEl = bound.getDeferredTriggerTarget(block, block.triggers.viewport!);
      expect(triggerEl).toBeNull();
    });

    it('should not identify a trigger element inside the a deferred block within the placeholder', () => {
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
        '',
      );
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
        '',
      );
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
        '',
        {},
      );
      const binder = new R3TargetBinder(makeSelectorMatcher());
      const res = binder.bind({template: template.nodes});
      expect(res.getUsedPipes()).toEqual(['number', 'date']);
    });
  });

  describe('selectorless', () => {
    const options: ParseTemplateOptions = {enableSelectorless: true};
    const baseMeta = {
      selector: null,
      inputs: new IdentityInputMapping([]),
      outputs: new IdentityInputMapping([]),
      exportAs: null,
      isStructural: false,
      ngContentSelectors: null,
      preserveWhitespaces: false,
      animationTriggerNames: null,
      isComponent: false,
    };

    function makeSelectorlessMatcher(
      directives: (DirectiveMeta | {root: DirectiveMeta; additionalDirectives: DirectiveMeta[]})[],
    ): SelectorlessMatcher<DirectiveMeta> {
      const registry = new Map<string, DirectiveMeta[]>();
      const isSingleDirective = (value: any): value is DirectiveMeta =>
        !value.root && !value.additionalDirectives;

      for (const dir of directives) {
        if (isSingleDirective(dir)) {
          registry.set(dir.name, [dir]);
        } else {
          registry.set(dir.root.name, [dir.root, ...dir.additionalDirectives]);
        }
      }

      return new SelectorlessMatcher(registry);
    }

    it('should resolve directives applied on a component node', () => {
      const template = parseTemplate('<MyComp @Dir @OtherDir/>', '', options);
      const binder = new R3TargetBinder(
        makeSelectorlessMatcher([
          {
            root: {
              ...baseMeta,
              name: 'MyComp',
              isComponent: true,
            },
            additionalDirectives: [
              {
                ...baseMeta,
                name: 'MyHostDir',
              },
            ],
          },
          {
            ...baseMeta,
            name: 'Dir',
          },
          {
            ...baseMeta,
            name: 'OtherDir',
          },
        ]),
      );
      const res = binder.bind({template: template.nodes});
      const node = template.nodes[0] as a.Component;
      expect(res.getDirectivesOfNode(node)?.map((d) => d.name)).toEqual(['MyComp', 'MyHostDir']);
    });

    it('should resolve directives applied on a directive node', () => {
      const template = parseTemplate('<MyComp @Dir @OtherDir/>', '', options);
      const binder = new R3TargetBinder(
        makeSelectorlessMatcher([
          {
            ...baseMeta,
            name: 'MyComp',
            isComponent: true,
          },
          {
            root: {
              ...baseMeta,
              name: 'Dir',
            },
            additionalDirectives: [
              {
                ...baseMeta,
                name: 'HostDir',
              },
            ],
          },
          {
            ...baseMeta,
            name: 'OtherDir',
          },
        ]),
      );
      const res = binder.bind({template: template.nodes});
      const dirs = (template.nodes[0] as a.Component).directives;
      expect(res.getDirectivesOfNode(dirs[0])?.map((d) => d.name)).toEqual(['Dir', 'HostDir']);
      expect(res.getDirectivesOfNode(dirs[1])?.map((d) => d.name)).toEqual(['OtherDir']);
    });

    it('should not apply selectorless directives on an element node', () => {
      const template = parseTemplate('<div @Dir @OtherDir></div>', '', options);
      const binder = new R3TargetBinder(
        makeSelectorlessMatcher([
          {
            ...baseMeta,
            name: 'Dir',
          },
          {
            ...baseMeta,
            name: 'OtherDir',
          },
        ]),
      );
      const res = binder.bind({template: template.nodes});
      const node = template.nodes[0] as a.Element;
      expect(res.getDirectivesOfNode(node)).toBe(null);
    });

    it('should resolve a reference on a component node to the component', () => {
      const template = parseTemplate('<MyComp #foo/>', '', options);
      const binder = new R3TargetBinder(
        makeSelectorlessMatcher([
          {
            ...baseMeta,
            name: 'MyComp',
            isComponent: true,
          },
        ]),
      );
      const res = binder.bind({template: template.nodes});
      const node = template.nodes[0] as a.Component;
      const reference = node.references[0];
      const result = res.getReferenceTarget(reference) as {node: a.Node; directive: DirectiveMeta};
      expect(result.node).toBe(node);
      expect(result.directive.name).toBe('MyComp');
    });

    it('should resolve a reference on a directive node to the component', () => {
      const template = parseTemplate('<div @Dir(#foo)></div>', '', options);
      const binder = new R3TargetBinder(
        makeSelectorlessMatcher([
          {
            ...baseMeta,
            name: 'Dir',
          },
        ]),
      );
      const res = binder.bind({template: template.nodes});
      const node = template.nodes[0] as a.Element;
      const directive = node.directives[0];
      const reference = directive.references[0];
      const result = res.getReferenceTarget(reference) as {node: a.Node; directive: DirectiveMeta};
      expect(result.node).toBe(directive);
      expect(result.directive.name).toBe('Dir');
    });

    it('should resolve a reference on an element when using a selectorless matcher', () => {
      const template = parseTemplate('<div #foo></div>', '', options);
      const binder = new R3TargetBinder(makeSelectorlessMatcher([]));
      const res = binder.bind({template: template.nodes});
      const node = template.nodes[0] as a.Component;
      const reference = node.references[0];
      const result = res.getReferenceTarget(reference) as a.Element;
      expect(result instanceof a.Element).toBe(true);
      expect(result.name).toBe('div');
    });

    it('should get consumer of component bindings', () => {
      const template = parseTemplate(
        '<MyComp [input]="value" static="value" (output)="doStuff()" [doesNotExist]="value" [attr.input]="value"/>',
        '',
        options,
      );
      const binder = new R3TargetBinder(
        makeSelectorlessMatcher([
          {
            ...baseMeta,
            name: 'MyComp',
            isComponent: true,
            inputs: new IdentityInputMapping(['input', 'static']),
            outputs: new IdentityInputMapping(['output']),
          },
        ]),
      );
      const res = binder.bind({template: template.nodes});
      const node = template.nodes[0] as a.Component;
      const input = node.inputs[0];
      const staticAttr = node.attributes[0];
      const output = node.outputs[0];
      const doesNotExist = node.inputs[1];
      const attrBinding = node.attributes[1];

      expect((res.getConsumerOfBinding(input) as DirectiveMeta)?.name).toBe('MyComp');
      expect((res.getConsumerOfBinding(staticAttr) as DirectiveMeta)?.name).toBe('MyComp');
      expect((res.getConsumerOfBinding(output) as DirectiveMeta)?.name).toBe('MyComp');
      expect(res.getConsumerOfBinding(doesNotExist)).toBe(null);
      expect(res.getConsumerOfBinding(attrBinding)).toBe(null);
    });

    it('should get consumer of directive bindings', () => {
      const template = parseTemplate(
        '<div @Dir([input]="value" static="value" (output)="doStuff()" [doesNotExist]="value")></div>',
        '',
        options,
      );
      const binder = new R3TargetBinder(
        makeSelectorlessMatcher([
          {
            ...baseMeta,
            name: 'Dir',
            inputs: new IdentityInputMapping(['input', 'static']),
            outputs: new IdentityInputMapping(['output']),
          },
        ]),
      );
      const res = binder.bind({template: template.nodes});
      const node = template.nodes[0] as a.Element;
      const directive = node.directives[0];
      const input = directive.inputs[0];
      const staticAttr = directive.attributes[0];
      const output = directive.outputs[0];
      const doesNotExist = directive.inputs[1];

      expect((res.getConsumerOfBinding(input) as DirectiveMeta)?.name).toBe('Dir');
      expect((res.getConsumerOfBinding(staticAttr) as DirectiveMeta)?.name).toBe('Dir');
      expect((res.getConsumerOfBinding(output) as DirectiveMeta)?.name).toBe('Dir');
      expect(res.getConsumerOfBinding(doesNotExist)).toBe(null);
    });

    it('should get eagerly-used selectorless directives', () => {
      const template = parseTemplate('<MyComp @Dir @OtherDir/>', '', options);
      const binder = new R3TargetBinder(
        makeSelectorlessMatcher([
          {
            ...baseMeta,
            name: 'MyComp',
            isComponent: true,
          },
          {
            ...baseMeta,
            name: 'Dir',
          },
          {
            ...baseMeta,
            name: 'OtherDir',
          },
          {
            ...baseMeta,
            name: 'UnusedDir',
          },
        ]),
      );
      const res = binder.bind({template: template.nodes});
      expect(res.getUsedDirectives().map((dir) => dir.name)).toEqual(['MyComp', 'Dir', 'OtherDir']);
      expect(res.getEagerlyUsedDirectives().map((dir) => dir.name)).toEqual([
        'MyComp',
        'Dir',
        'OtherDir',
      ]);
    });

    it('should get deferred selectorless directives', () => {
      const template = parseTemplate('@defer {<MyComp @Dir @OtherDir/>}', '', options);
      const binder = new R3TargetBinder(
        makeSelectorlessMatcher([
          {
            ...baseMeta,
            name: 'MyComp',
            isComponent: true,
          },
          {
            ...baseMeta,
            name: 'Dir',
          },
          {
            ...baseMeta,
            name: 'OtherDir',
          },
        ]),
      );
      const res = binder.bind({template: template.nodes});
      expect(res.getUsedDirectives().map((dir) => dir.name)).toEqual(['MyComp', 'Dir', 'OtherDir']);
      expect(res.getEagerlyUsedDirectives().map((dir) => dir.name)).toEqual([]);
    });

    it('should get selectorless directives nested in other code', () => {
      const template = parseTemplate(
        `
        <section>
          @if (someCond) {
            <MyComp>
              <div>
                <h1>
                  <span @Dir></span>
                </h1>
              </div>
            </MyComp>
          }
        </section>
      `,
        '',
        options,
      );
      const binder = new R3TargetBinder(
        makeSelectorlessMatcher([
          {
            ...baseMeta,
            name: 'MyComp',
            isComponent: true,
          },
          {
            ...baseMeta,
            name: 'Dir',
          },
          {
            ...baseMeta,
            name: 'UnusedDir',
          },
        ]),
      );
      const res = binder.bind({template: template.nodes});
      expect(res.getUsedDirectives().map((dir) => dir.name)).toEqual(['MyComp', 'Dir']);
      expect(res.getEagerlyUsedDirectives().map((dir) => dir.name)).toEqual(['MyComp', 'Dir']);
    });

    it('should check whether a referenced directive exists', () => {
      const template = parseTemplate('<MyComp @MissingDir/><MissingComp @Dir/>', '', options);
      const binder = new R3TargetBinder(
        makeSelectorlessMatcher([
          {
            ...baseMeta,
            name: 'MyComp',
            isComponent: true,
          },
          {
            ...baseMeta,
            name: 'Dir',
          },
        ]),
      );
      const res = binder.bind({template: template.nodes});
      expect(res.referencedDirectiveExists('MyComp')).toBe(true);
      expect(res.referencedDirectiveExists('Dir')).toBe(true);
      expect(res.referencedDirectiveExists('MissingDir')).toBe(false);
      expect(res.referencedDirectiveExists('MissingComp')).toBe(false);
    });
  });
});

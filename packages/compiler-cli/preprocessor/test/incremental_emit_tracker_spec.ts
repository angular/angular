/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BoundTarget, MatchSource, TcbDirectiveMetadata} from '@angular/compiler';

import {makeClassKey} from '../src/compiler-utils.js';
import {IncrementalEmitTracker} from '../src/incremental.js';
import type * as nga from '../src/types.js';

interface DirectiveDecl {
  name: string;
  filePath: string;
  selector: string;
  inputs?: Array<{name: string; required?: boolean}>;
}

interface ComponentDecl {
  className: string;
  /** Declarations in the component's scope. */
  scope?: DirectiveDecl[];
  /** Names of the scope's directives its template matches. */
  matched?: string[];
  templateUrl?: string;
}

/** A recorded file: its analysis plus the bound targets of its components. */
interface FileDecl {
  result: nga.AnalysisResult;
  boundTargets: Map<string, BoundTarget<TcbDirectiveMetadata>>;
}

function declarationOf(dir: DirectiveDecl): nga.DeclarationMetadata {
  return {
    name: dir.name,
    filePath: dir.filePath,
    declarationType: 'directive',
    selector: dir.selector,
    ref: {},
    fields: (dir.inputs ?? []).map(({name, required}) => ({
      kind: 'input',
      input: {name, required: required ?? false},
    })),
  } as unknown as nga.DeclarationMetadata;
}

function file(
  filePath: string,
  {
    dependencies = [],
    components = [],
  }: {dependencies?: string[]; components?: ComponentDecl[]} = {},
): FileDecl {
  const boundTargets = new Map<string, BoundTarget<TcbDirectiveMetadata>>();
  const classes = components.map((cmp, i) => {
    const span = {start: i * 100, end: i * 100 + 50};
    const scope = cmp.scope ?? [];
    const matched = scope.filter((dir) => (cmp.matched ?? []).includes(dir.name));
    boundTargets.set(makeClassKey(cmp.className, span.start), {
      getUsedDirectives: () =>
        matched.map((dir) => ({
          matchSource: MatchSource.Selector,
          name: dir.name,
          ref: {nodeFilePath: dir.filePath},
        })),
      getUsedPipes: () => [],
    } as unknown as BoundTarget<TcbDirectiveMetadata>);
    return {
      className: cmp.className,
      span,
      component: {
        resolvedDeclarations: scope.map(declarationOf),
        templateUrl: cmp.templateUrl
          ? {url: cmp.templateUrl, resolvedPath: cmp.templateUrl}
          : undefined,
      },
    } as unknown as nga.ClassMetadata;
  });
  return {
    result: {
      fileId: 0,
      filePath,
      importsEnd: 0,
      classes,
      imports: [],
      typeOnlyExports: [],
      diagnostics: [],
      signalDebugNames: [],
      staticDependencies: dependencies,
    },
    boundTargets,
  };
}

/** Records a build of `files`, returning the files it emits. */
function build(tracker: IncrementalEmitTracker, files: FileDecl[]): string[] {
  for (const {result, boundTargets} of files) {
    tracker.recordFile(result, boundTargets, undefined);
  }
  const shouldEmit = tracker.createEmitFilter();
  return files.map(({result}) => result.filePath).filter(shouldEmit);
}

/** Records a build of `files` whose output was emitted. */
function emit(tracker: IncrementalEmitTracker, files: FileDecl[]): string[] {
  const emitted = build(tracker, files);
  tracker.recordSuccessfulEmit(emitted);
  return emitted;
}

describe('IncrementalEmitTracker', () => {
  const dir = (inputs: DirectiveDecl['inputs'] = [{name: 'value'}]): DirectiveDecl => ({
    name: 'Dir',
    filePath: '/dir.ts',
    selector: '[dir]',
    inputs,
  });
  const program = (directive: DirectiveDecl, matched = ['Dir']) => [
    file('/dir.ts'),
    file('/cmp.ts', {components: [{className: 'Cmp', scope: [directive], matched}]}),
    file('/mod.ts', {dependencies: ['/cmp.ts', '/dir.ts']}),
    file('/service.ts'),
  ];

  it('should emit every file before the first successful emit', () => {
    const tracker = new IncrementalEmitTracker();
    expect(emit(tracker, program(dir()))).toEqual(['/dir.ts', '/cmp.ts', '/mod.ts', '/service.ts']);
  });

  it('should re-emit a changed file and the files depending on it, but nothing else', () => {
    const tracker = new IncrementalEmitTracker();
    emit(tracker, program(dir()));

    tracker.recordChanges(['/cmp.ts']);
    expect(emit(tracker, program(dir()))).toEqual(['/cmp.ts', '/mod.ts']);
  });

  it('should treat a change with unchanged content as a change', () => {
    const tracker = new IncrementalEmitTracker();
    emit(tracker, program(dir()));

    tracker.recordChanges(['/service.ts']);
    expect(emit(tracker, program(dir()))).toEqual(['/service.ts']);
  });

  it('should re-emit components whose matched directive changed its public API', () => {
    const tracker = new IncrementalEmitTracker();
    emit(tracker, program(dir()));

    tracker.recordChanges(['/dir.ts']);
    expect(emit(tracker, program(dir([{name: 'renamed'}])))).toEqual([
      '/dir.ts',
      '/cmp.ts',
      '/mod.ts',
    ]);
  });

  it('should not re-emit components when an input of a matched directive becomes required', () => {
    const tracker = new IncrementalEmitTracker();
    emit(tracker, program(dir()));

    tracker.recordChanges(['/dir.ts']);
    expect(emit(tracker, program(dir([{name: 'value', required: true}])))).toEqual([
      '/dir.ts',
      '/mod.ts',
    ]);
  });

  it('should not re-emit components that do not match a changed directive', () => {
    const tracker = new IncrementalEmitTracker();
    emit(tracker, program(dir(), []));

    tracker.recordChanges(['/dir.ts']);
    expect(emit(tracker, program(dir([{name: 'renamed'}]), []))).toEqual(['/dir.ts', '/mod.ts']);
  });

  it('should re-emit a component that starts matching a directive although it did not change', () => {
    const tracker = new IncrementalEmitTracker();
    emit(tracker, program(dir(), []));

    tracker.recordChanges(['/mod.ts']);
    expect(emit(tracker, program(dir(), ['Dir']))).toEqual(['/cmp.ts', '/mod.ts']);
  });

  it('should re-emit the component using a changed external template', () => {
    const tracker = new IncrementalEmitTracker();
    const files = [
      file('/cmp.ts', {components: [{className: 'Cmp', templateUrl: '/cmp.html'}]}),
      file('/other.ts'),
    ];
    emit(tracker, files);

    tracker.recordChanges(['/cmp.html']);
    expect(emit(tracker, files)).toEqual(['/cmp.ts']);
  });

  it('should keep changes made during builds that were not emitted', () => {
    const tracker = new IncrementalEmitTracker();
    emit(tracker, program(dir()));

    // The first change is made while the program is broken, so its build emits nothing.
    tracker.recordChanges(['/service.ts']);
    build(tracker, program(dir()));
    tracker.recordChanges(['/dir.ts']);
    expect(emit(tracker, program(dir()))).toEqual(['/dir.ts', '/mod.ts', '/service.ts']);

    // Once emitted, the changes are no longer pending.
    expect(emit(tracker, program(dir()))).toEqual([]);
  });

  it('should emit every file after a declaration file changed', () => {
    const tracker = new IncrementalEmitTracker();
    emit(tracker, program(dir()));

    tracker.recordChanges(['/node_modules/lib/index.d.ts']);
    expect(emit(tracker, program(dir()))).toEqual(['/dir.ts', '/cmp.ts', '/mod.ts', '/service.ts']);
  });

  it('should re-emit the importers of a deleted file', () => {
    const tracker = new IncrementalEmitTracker();
    emit(tracker, program(dir()));

    tracker.recordChanges([], ['/dir.ts']);
    const withoutDir = program(dir()).filter(({result}) => result.filePath !== '/dir.ts');
    expect(emit(tracker, withoutDir)).toEqual(['/mod.ts']);
  });

  it('should use getTemplateUsedDirectives when present to exclude host ownDeclaration', () => {
    const tracker = new IncrementalEmitTracker();
    const makeCmpWithHostEntry = (selfSelector: string): FileDecl => {
      const f = file('/cmp.ts', {
        components: [
          {
            className: 'Cmp',
            scope: [{name: 'Cmp', filePath: '/cmp.ts', selector: selfSelector}],
            matched: ['Cmp'],
          },
        ],
      });
      const key = makeClassKey('Cmp', 0);
      const orig = f.boundTargets.get(key)!;
      (
        orig as BoundTarget<TcbDirectiveMetadata> & {
          getTemplateUsedDirectives?: () => TcbDirectiveMetadata[];
        }
      ).getTemplateUsedDirectives = () => [];
      return f;
    };

    emit(tracker, [makeCmpWithHostEntry('app-cmp-v1'), file('/other.ts')]);
    // Even if Cmp's selector in scope metadata changed without `/cmp.ts` being marked changed,
    // Cmp is not in its own template-used directives so it is not marked emit-affected by self.
    expect(emit(tracker, [makeCmpWithHostEntry('app-cmp-v2'), file('/other.ts')])).toEqual([]);
  });

  it('should deduplicate repeated input names in publicApiOf', () => {
    const tracker = new IncrementalEmitTracker();
    emit(tracker, program(dir([{name: 'value'}])));

    tracker.recordChanges(['/dir.ts']);
    expect(emit(tracker, program(dir([{name: 'value'}, {name: 'value'}])))).toEqual([
      '/dir.ts',
      '/mod.ts',
    ]);
  });

  it('should re-emit a component when an extra resource such as a template-linked stylesheet changes', () => {
    const tracker = new IncrementalEmitTracker();
    const cmp = file('/cmp.ts', {components: [{className: 'Cmp'}]});
    const other = file('/other.ts');

    tracker.recordFile(cmp.result, cmp.boundTargets, undefined, ['/linked.css']);
    tracker.recordFile(other.result, other.boundTargets, undefined);
    tracker.recordSuccessfulEmit(['/cmp.ts', '/other.ts']);

    tracker.recordChanges(['/linked.css']);
    tracker.recordFile(cmp.result, cmp.boundTargets, undefined, ['/linked.css']);
    tracker.recordFile(other.result, other.boundTargets, undefined);
    const shouldEmit = tracker.createEmitFilter();
    expect(['/cmp.ts', '/other.ts'].filter(shouldEmit)).toEqual(['/cmp.ts']);
  });
});

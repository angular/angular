/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  effect,
  isSignal,
  ɵRuntimeError as RuntimeError,
  type Signal,
  signal,
  untracked,
  type ValueEqualityFn,
} from '@angular/core';
import {RuntimeErrorCode} from '../../errors';
import type {FormFieldManager} from '../../field/manager';
import type {FieldNode} from '../../field/node';
import {setBoundPathDepthForResolution} from '../../field/resolution';
import type {FieldNodeStructure} from '../../field/structure';
import {FieldPathNode} from '../../schema/path_node';
import {assertPathIsCurrent} from '../../schema/schema';
import {isArray, isObject} from '../../util/type_guards';
import type {FieldContext, LogicFn, PathKind, SchemaPath, SchemaPathRules} from '../types';
import {createManagedMetadataKey, metadata} from './metadata';

interface LinkEntry {
  readonly node: FieldNode;
  readonly emission: Signal<{readonly value: unknown} | undefined>;
  evaluate(emission: {readonly value: unknown} | undefined): boolean;
  rebaseline(): void;
}

const UNSET = Symbol('UNSET');
const MAX_LINK_PASSES = 100;

/**
 * Controls when a `link()` rule writes its computed value to the target field.
 *
 * - `'always'` (default): Computes and applies on initial activation and whenever inputs change.
 * - `'change'`: Preserves the initial model value and only writes when inputs subsequently change.
 *
 * @category logic
 * @experimental
 */
export type LinkTrigger = 'always' | 'change';

/**
 * Controls how the target field's interaction state (`dirty`, `touched`, and parse errors) is
 * updated when a `link()` rule triggers.
 *
 * - `'preserve'` (default): Keeps existing `dirty` and `touched` state unchanged.
 * - `'reset'`: Resets `dirty`, `touched`, and parse errors on the field and its descendants
 *   (equivalent to `field().reset(linkedValue)`), even if the newly computed value equals the
 *   current value.
 *
 * @category logic
 * @experimental
 */
export type LinkFieldStateMode = 'preserve' | 'reset';

/**
 * Snapshot of the preceding `source` value and the target field's current value prior to applying
 * a `link()` update.
 *
 * @template TSource The type returned by the `source` expression.
 * @template TValue The value type of the target field.
 *
 * @category logic
 * @experimental
 */
export interface LinkPrevious<TSource, TValue> {
  /** The source value from the preceding link evaluation. */
  readonly source: TSource;
  /** The target field's current value prior to this update (including manual edits). */
  readonly value: TValue;
}

/**
 * Field context passed to the `computation` callback of a source-driven `link()` rule.
 *
 * @template TValue The value type of the target field.
 * @template TSource The type returned by the `source` expression.
 * @template TPathKind The kind of path the rule is bound to (root, child, or item of an array).
 * @template TPrevious The type of {@link LinkPrevious} exposed as `previous`.
 *
 * @category logic
 * @experimental
 */
export type LinkContext<
  TValue,
  TSource,
  TPathKind extends PathKind = PathKind.Root,
  TPrevious extends LinkPrevious<TSource, TValue> | undefined =
    LinkPrevious<TSource, TValue> | undefined,
> = FieldContext<TValue, TPathKind> & {
  /**
   * Snapshot of the prior source and target values before applying the current update.
   *
   * - `undefined` on initial evaluation when `on` is `'always'` (default).
   * - Always defined when `on` is `'change'`.
   */
  readonly previous: TPrevious;
};

/**
 * Configuration options for a source-driven `link()` rule.
 *
 * Separating `source` from `computation` guarantees that `computation` only runs when `source`
 * produces a new value (compared via `Object.is`). `computation` executes **untracked** so reading
 * the target field or sibling values does not introduce unintended triggers.
 *
 * @template TValue The value type of the target field.
 * @template TSource The type returned by `source`.
 * @template TPathKind The kind of path the rule is bound to (root, child, or item of an array).
 * @template TTrigger The literal `LinkTrigger` configured via `on`.
 *
 * @category logic
 * @experimental
 */
export interface LinkOptions<
  TValue,
  TSource,
  TPathKind extends PathKind = PathKind.Root,
  TTrigger extends LinkTrigger = LinkTrigger,
> {
  /**
   * Reactive source whose changes trigger {@link computation}. Accepts a `LogicFn`
   * (e.g. `({valueOf}) => valueOf(p.country)`) or any Angular `Signal<TSource>`.
   */
  readonly source:
    Signal<TSource> | ((ctx: FieldContext<NoInfer<TValue>, NoInfer<TPathKind>>) => TSource);

  /**
   * Computes the next value for the target field when {@link source} changes.
   *
   * This function executes **untracked**; only reads inside {@link source} (and any enclosing
   * `when` / `applyWhen` predicates) trigger re-evaluation.
   */
  readonly computation: (
    source: NoInfer<TSource>,
    ctx: LinkContext<
      NoInfer<TValue>,
      NoInfer<TSource>,
      NoInfer<TPathKind>,
      [TTrigger] extends ['change']
        ? LinkPrevious<NoInfer<TSource>, NoInfer<TValue>>
        : LinkPrevious<NoInfer<TSource>, NoInfer<TValue>> | undefined
    >,
  ) => NoInfer<TValue>;

  /**
   * A reactive predicate controlling whether this link rule is currently active.
   * When `false`, the rule does not evaluate its inputs or modify the target field.
   */
  readonly when?: NoInfer<LogicFn<TValue, boolean, TPathKind>>;

  /**
   * Determines whether the rule writes on activation as well as subsequent changes.
   *
   * - `'always'` (default): Computes and applies on initial activation, whenever `source` changes,
   *   and whenever the rule transitions from inactive to active.
   * - `'change'`: Captures the active `source` snapshot as its baseline without writing (on
   *   initial activation and on re-activation after `when`/`applyWhen` was `false`), preserving
   *   the existing model value and guaranteeing `ctx.previous` is defined inside `computation`.
   */
  readonly on?: TTrigger;

  /**
   * Custom equality function used to compare the target field's current value against the newly
   * computed value. When equal, writing to the model signal is skipped.
   * Defaults to `Object.is`.
   */
  readonly equal?: ValueEqualityFn<NoInfer<TValue>>;

  /**
   * How to update the target field's interaction state when the link rule triggers:
   *
   * - `'preserve'` (default): Keeps existing `dirty` and `touched` state unchanged.
   * - `'reset'`: Resets `dirty`, `touched`, and parse errors on the field and its descendants,
   *   even if the newly computed value equals the current value.
   */
  readonly fieldState?: LinkFieldStateMode;
}

/**
 * Declares a reactive value link rule for a form field, following Angular's `linkedSignal` mental
 * model.
 *
 * All reactive reads inside `computation` are tracked; whenever they change, the returned value is
 * written back to the underlying form model. Manual edits to the target field are preserved until
 * the tracked dependencies change again. Multiple `link()` rules may target the same field and
 * execute in declaration order.
 *
 * Link updates flush asynchronously via a form-level coordinator `effect()` (batching multi-field
 * writes and avoiding eager evaluation during `form()` construction) and are flushed synchronously
 * before validation and execution in `submit()`.
 *
 * Unlike validation rules, `link()` rules continue running when a field is `readonly`, `disabled`,
 * or `hidden`. Combine with `readonly(path)` or `disabled(path)` when a linked field should not be
 * editable, or guard the rule with `applyWhen` / `when`.
 *
 * @example
 * ```ts
 * // Reactive calculated value
 * link(p.total, ({valueOf}) => valueOf(p.quantity) * valueOf(p.unitPrice));
 * ```
 *
 * @param path The target path whose value will be linked.
 * @param computation A reactive function computing the linked value for the target field.
 * @template TValue The value type of the target field.
 * @template TPathKind The kind of path the rule is bound to (root, child, or item of an array).
 *
 * @category logic
 * @experimental
 */
export function link<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  computation: NoInfer<LogicFn<TValue, TValue, TPathKind>>,
): void;

/**
 * Declares a source-driven value link rule for a form field with explicit dependency tracking and
 * access to the previous source and target values.
 *
 * Only reads inside `source` trigger re-evaluation; `computation` executes **untracked** so reading
 * other fields (including `ctx.value()`) does not trigger self-updates. When `on` is `'change'`,
 * `ctx.previous` is guaranteed to be defined and the initial model value is preserved on setup.
 *
 * @example
 * ```ts
 * // Auto-populate while pristine
 * link(p.slug, {
 *   source: ({valueOf}) => valueOf(p.title),
 *   computation: (title) => slugify(title),
 *   when: ({state}) => !state.dirty(),
 * });
 *
 * // Reset `state` when `country` changes, preserving hydrated initial data
 * link(p.state, {
 *   source: ({valueOf}) => valueOf(p.country),
 *   on: 'change',
 *   fieldState: 'reset',
 *   computation: (country, {previous}) =>
 *     allowedStates[country]?.includes(previous.value) ? previous.value : '',
 * });
 * ```
 *
 * @param path The target path whose value will be linked.
 * @param options Configuration for the source-driven link rule.
 * @template TValue The value type of the target field.
 * @template TSource The type returned by `options.source`.
 * @template TPathKind The kind of path the rule is bound to (root, child, or item of an array).
 * @template TTrigger The literal trigger mode configured via `options.on`.
 *
 * @category logic
 * @experimental
 */
export function link<
  TValue,
  TSource,
  TPathKind extends PathKind = PathKind.Root,
  const TTrigger extends LinkTrigger = 'always',
>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  options: LinkOptions<TValue, TSource, TPathKind, TTrigger>,
): void;

export function link<TValue, TSource, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  computationOrOptions:
    LogicFn<TValue, TValue, TPathKind> | LinkOptions<TValue, TSource, TPathKind>,
): void {
  assertPathIsCurrent(path);

  if (typeof computationOrOptions === 'function') {
    registerLink<TValue, TValue, TPathKind>(path, {
      when: undefined,
      on: 'always',
      equal: Object.is,
      fieldState: 'preserve',
      track: computationOrOptions,
      resolve: (trackedValue) => trackedValue,
    });
    return;
  }

  const options = computationOrOptions;
  const pathNode = FieldPathNode.unwrapFieldPath(path);
  const rawSource = options.source;
  const normalizedSource: (ctx: FieldContext<TValue, TPathKind>) => TSource = isSignal(rawSource)
    ? () => rawSource()
    : rawSource;
  const boundComputation = setBoundPathDepthForResolution(
    options.computation,
    pathNode.keys.length,
  );

  registerLink<TValue, TSource, TPathKind>(path, {
    when: options.when,
    on: options.on ?? 'always',
    equal: (options.equal ?? Object.is) as ValueEqualityFn<unknown>,
    fieldState: options.fieldState ?? 'preserve',
    track: normalizedSource,
    resolve: (nextSource, node, prevSource) => {
      const previous: LinkPrevious<TSource, TValue> | undefined =
        prevSource === UNSET
          ? undefined
          : {source: prevSource as TSource, value: node.structure.value() as TValue};
      const ctx = createLinkContext<TValue, TSource>(node.context, previous);
      return boundComputation(nextSource, ctx as any);
    },
  });
}

interface NormalizedLink<TValue, TTracked, TPathKind extends PathKind> {
  readonly when?: LogicFn<TValue, boolean, TPathKind>;
  readonly on: LinkTrigger;
  readonly equal: ValueEqualityFn<unknown>;
  readonly fieldState: LinkFieldStateMode;
  readonly track: (ctx: FieldContext<TValue, TPathKind>) => TTracked;
  readonly resolve: (tracked: TTracked, node: FieldNode, prevTracked: unknown) => TValue;
}

class LinkCoordinator {
  private readonly entries = new Set<LinkEntry>();
  private readonly entriesByStructure = new Map<FieldNodeStructure, LinkEntry[]>();
  private readonly version = signal(0);
  private flushing = false;

  constructor(manager: FormFieldManager) {
    manager.flushLinks = () => this.flush(false);
    manager.rebaselineLinks = (node) => this.rebaselineSubtree(node);
    manager.onStructureDestroy = (structure) => this.unregisterStructure(structure);

    effect(
      () => {
        this.version();
        this.flush(true);
      },
      {injector: manager.injector},
    );
  }

  private rebaselineSubtree(node: FieldNode): void {
    const list = this.entriesByStructure.get(node.structure);
    if (list !== undefined) {
      for (const entry of list) {
        entry.rebaseline();
      }
    }
    for (const child of node.structure.materializedChildren()) {
      this.rebaselineSubtree(child);
    }
  }

  register(entry: LinkEntry): void {
    this.entries.add(entry);
    const structure = entry.node.structure;
    let list = this.entriesByStructure.get(structure);
    if (list === undefined) {
      list = [];
      this.entriesByStructure.set(structure, list);
    }
    list.push(entry);
    if (!this.flushing) {
      untracked(() => this.version.update((v) => v + 1));
    }
  }

  private unregisterStructure(structure: FieldNodeStructure): void {
    const list = this.entriesByStructure.get(structure);
    if (list === undefined) {
      return;
    }
    for (const entry of list) {
      this.entries.delete(entry);
    }
    this.entriesByStructure.delete(structure);
  }

  flush(track: boolean): void {
    if (this.flushing) {
      return;
    }
    this.flushing = true;
    try {
      let pass = 0;
      while (true) {
        let wrote = false;
        let lastWritingNode: FieldNode | undefined;
        for (const entry of this.entries) {
          if (entry.node.structure.isOrphaned()) {
            continue;
          }
          const emission = track ? entry.emission() : untracked(entry.emission);
          if (entry.evaluate(emission)) {
            wrote = true;
            lastWritingNode = entry.node;
          }
        }
        if (!wrote) {
          break;
        }
        pass++;
        if (pass > MAX_LINK_PASSES) {
          const pathKeys = lastWritingNode!.structure.pathKeys();
          const pathStr = pathKeys.length === 0 ? '<root>' : `<root>.${pathKeys.join('.')}`;
          throw new RuntimeError(
            RuntimeErrorCode.LINK_CYCLE,
            (typeof ngDevMode === 'undefined' || ngDevMode) &&
              `Circular or non-converging link() rule detected on ${pathStr} after ${MAX_LINK_PASSES} consecutive passes. ` +
                `Consider adding a custom \`equal\` comparator or guarding mutual rules with \`on: 'change'\`.`,
          );
        }
      }
    } finally {
      this.flushing = false;
    }
  }
}

function getLinkCoordinator(manager: FormFieldManager): LinkCoordinator {
  return ((manager.linkCoordinator as LinkCoordinator | undefined) ??= new LinkCoordinator(
    manager,
  ));
}

function registerLink<TValue, TTracked, TPathKind extends PathKind>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  spec: NormalizedLink<TValue, TTracked, TPathKind>,
): void {
  const {when, on, equal, fieldState, track, resolve} = spec;

  const LINK_KEY = createManagedMetadataKey<void, {readonly value: TTracked} | undefined>(
    (state, emissionSignal) => {
      const node = state as FieldNode;
      let wasActive = false;
      let lastTracked: unknown = UNSET;
      let lastEmission: {readonly value: TTracked} | undefined;
      let rebaselinedEmission: {readonly value: TTracked} | undefined;

      const entry: LinkEntry = {
        node,
        emission: emissionSignal,
        evaluate(emission) {
          if (emission === undefined) {
            wasActive = false;
            lastTracked = UNSET;
            lastEmission = undefined;
            rebaselinedEmission = undefined;
            return false;
          }
          if (emission === lastEmission) {
            return false;
          }
          lastEmission = emission as {readonly value: TTracked};

          const nextTracked = emission.value as TTracked;
          const becameActive = !wasActive;
          wasActive = true;

          if (rebaselinedEmission === emission) {
            rebaselinedEmission = undefined;
            lastTracked = nextTracked;
            return false;
          }

          if (becameActive) {
            lastTracked = nextTracked;
            if (on === 'change') {
              return false;
            }
            return untracked(() => {
              const nextValue = resolve(nextTracked, node, UNSET);
              return applyLinkedValue(node, nextValue, equal, fieldState);
            });
          }

          if (Object.is(lastTracked, nextTracked)) {
            return false;
          }

          const prevTracked = lastTracked;
          lastTracked = nextTracked;

          return untracked(() => {
            const nextValue = resolve(nextTracked, node, prevTracked);
            return applyLinkedValue(node, nextValue, equal, fieldState);
          });
        },
        rebaseline() {
          if (on !== 'change') {
            return;
          }
          const current = emissionSignal();
          if (current === undefined) {
            wasActive = false;
            lastTracked = UNSET;
            lastEmission = undefined;
            rebaselinedEmission = undefined;
          } else {
            wasActive = true;
            lastTracked = current.value;
            lastEmission = current;
            rebaselinedEmission = current;
          }
        },
      };

      getLinkCoordinator(node.structure.fieldManager).register(entry);
    },
  );
  LINK_KEY.noInjector = true;

  metadata(path, LINK_KEY, (ctx) => {
    if (when && !when(ctx)) {
      return undefined;
    }
    return {value: track(ctx)};
  });
}

function applyLinkedValue(
  node: FieldNode,
  nextValue: unknown,
  equal: ValueEqualityFn<unknown>,
  fieldState: LinkFieldStateMode,
): boolean {
  const currentValue = node.structure.value();
  const valueChanged = !equal(currentValue, nextValue);
  if (valueChanged) {
    const valueToWrite = preserveArrayIdentity(
      currentValue,
      nextValue,
      node.structure.parent?.structure.identitySymbol,
    );
    node.value.set(valueToWrite);
  }
  if (fieldState === 'reset') {
    node.reset();
  }
  return valueChanged;
}

function createLinkContext<TValue, TSource>(
  base: FieldNode['context'],
  previous: LinkPrevious<TSource, TValue> | undefined,
): LinkContext<TValue, TSource> {
  return Object.create(base, {
    previous: {
      value: previous,
      enumerable: true,
    },
  }) as LinkContext<TValue, TSource>;
}

/**
 * Copies the parent array's tracking `identitySymbol` when replacing an array item object so
 * existing child `FieldNode` identity (`dirty`, `touched`, focus, DOM bindings) is preserved.
 */
function preserveArrayIdentity(
  oldItem: unknown,
  newItem: unknown,
  identitySymbol: symbol | undefined,
): unknown {
  if (
    identitySymbol === undefined ||
    !isObject(oldItem) ||
    isArray(oldItem) ||
    !Object.hasOwn(oldItem, identitySymbol) ||
    !isObject(newItem) ||
    isArray(newItem) ||
    Object.hasOwn(newItem, identitySymbol)
  ) {
    return newItem;
  }
  const trackingKey = (oldItem as Record<PropertyKey, unknown>)[identitySymbol];
  if (Object.isFrozen(newItem) || !Object.isExtensible(newItem)) {
    const clone = {...(newItem as Record<string, unknown>)};
    (clone as Record<PropertyKey, unknown>)[identitySymbol] = trackingKey;
    return clone;
  }
  (newItem as Record<PropertyKey, unknown>)[identitySymbol] = trackingKey;
  return newItem;
}

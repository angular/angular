/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, inject, input, DestroyRef, output, computed} from '@angular/core';
import {WINDOW} from '../../application-providers/window_provider';
import {Debouncer} from '../utils/debouncer';
import {SplitComponent} from './split.component';
import {Direction} from './interface';

export const RESIZE_DEBOUNCE = 50; // in milliseconds

export type ResponsiveSplitConfig = AspectRatioConfig | WidthConfig;

interface BaseConfig {
  /** Default direction of the as-split. */
  defaultDirection: Direction;

  /** Direction that is applied when the breakpoint condition is true. */
  breakpointDirection: Direction;
}

interface AspectRatioConfig extends BaseConfig {
  /**
   * Breakpoint condition based on the container aspect ration.
   * When true, `breakpointDirection` is applied.
   *
   * Examples: `>1.5`, `<=2`, etc.
   */
  aspectRatioBreakpoint: string;
}

interface WidthConfig extends BaseConfig {
  /**
   * Breakpoint condition based on the container width (always in pixels).
   * When true, `breakpointDirection` is applied.
   *
   * Examples: `>300`, `<=200px`, etc.
   */
  widthBreakpoint: string;
}

/** Make as-split direction responsive. */
@Directive({
  selector: 'as-split[ngResponsiveSplit]',
})
export class ResponsiveSplitDirective {
  private readonly host = inject(SplitComponent);
  private readonly elementRef = inject(ElementRef);
  private readonly window = inject<typeof globalThis>(WINDOW);

  protected readonly config = input.required<ResponsiveSplitConfig>({
    alias: 'ngResponsiveSplit',
  });

  protected readonly directionChange = output<Direction>();

  private readonly parsedBpCondition = computed(() => {
    const cfg = this.config();
    const bp = isAspectRatioConfig(cfg)
      ? cfg.aspectRatioBreakpoint
      : isWidthConfig(cfg)
        ? cfg.widthBreakpoint
        : null;

    if (!bp) {
      throwError('Breakpoint not recognized.');
    }

    return parseBreakpointCondition(bp);
  });

  constructor() {
    const debouncer = new Debouncer();
    // We use the ResizeObserver from the injected window object to allow mocking in tests.
    const resizeObserver = new this.window.ResizeObserver(
      debouncer.debounce(([entry]) => {
        if (entry.contentBoxSize) {
          const [{inlineSize, blockSize}] = entry.contentBoxSize;
          this.applyDirection(inlineSize, blockSize);
        }
      }, RESIZE_DEBOUNCE),
    );

    resizeObserver.observe(this.elementRef.nativeElement);
    inject(DestroyRef).onDestroy(() => {
      debouncer.cancel();
      resizeObserver.unobserve(this.elementRef.nativeElement);
    });
  }

  private applyDirection(width: number, height: number) {
    const cfg = this.config();
    let newDir: Direction = cfg.defaultDirection;
    let shouldSwitch = false;

    if (isAspectRatioConfig(cfg)) {
      const ratio = width / height;
      shouldSwitch = evalBreakpointCondition(this.parsedBpCondition(), ratio);
    } else if (isWidthConfig(cfg)) {
      shouldSwitch = evalBreakpointCondition(this.parsedBpCondition(), width);
    }

    if (shouldSwitch) {
      newDir = cfg.breakpointDirection;
    }

    if (this.host.direction() !== newDir) {
      this.host.direction.set(newDir);
      this.directionChange.emit(newDir);
    }
  }
}

/** A helper that throws a `NgResponsiveSplit`-prefixed error. */
function throwError(msg: string): never {
  throw new Error(`NgResponsiveSplit: ${msg}`);
}

function isAspectRatioConfig(config: ResponsiveSplitConfig): config is AspectRatioConfig {
  return 'aspectRatioBreakpoint' in config;
}

function isWidthConfig(config: ResponsiveSplitConfig): config is WidthConfig {
  return 'widthBreakpoint' in config;
}

type Operator = 'gt' | 'lt' | 'gte' | 'lte';

type Condition = {value: number; operator: Operator};

const SIGN_TO_OPERATOR: {[key: string]: Operator} = {
  '>': 'gt',
  '<': 'lt',
  '>=': 'gte',
  '<=': 'lte',
};

function parseBreakpointCondition(bp: string): Condition {
  if (!bp) {
    throwError('Empty breakpoint condition.');
  }
  const parts = /([><=]+)(\s+)?(\d+(?:\.\d+)?)/.exec(bp);
  if (!parts) {
    throwError('Unable to parse breakpoint condition.');
  }

  const operator = SIGN_TO_OPERATOR[parts[1]];
  if (!operator) {
    throwError('Invalid breakpoint comparison operator ' + parts[1]);
  }

  const parsedValue = parseFloat(parts[3]);
  if (isNaN(parsedValue)) {
    throwError('Unable to parse breakpoint value.');
  }

  return {
    value: parsedValue,
    operator,
  };
}

function evalBreakpointCondition({value, operator}: Condition, comparerVal: number): boolean {
  switch (operator) {
    case 'gt':
      return comparerVal > value;
    case 'gte':
      return comparerVal >= value;
    case 'lt':
      return comparerVal < value;
    case 'lte':
      return comparerVal <= value;
  }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  NgIterable,
  TemplateRef,
  TrackByFunction,
  ɵɵDirectiveDeclaration,
  ɵɵNgModuleDeclaration,
  ɵɵPipeDeclaration,
} from '@angular/core';

export interface NgForOfContext<T, U extends NgIterable<T>> {
  $implicit: T;
  ngForOf: U;
  odd: boolean;
  event: boolean;
  first: boolean;
  last: boolean;
  count: number;
  index: number;
}

export interface NgIfContext<T = unknown> {
  $implicit: T;
  ngIf: T;
}

/**
 * A fake version of the NgFor directive.
 */
export declare class NgForOf<T, U extends NgIterable<T>> {
  ngForOf: (U & NgIterable<T>) | null | undefined;
  ngForTrackBy: TrackByFunction<T>;
  ngForTemplate: TemplateRef<NgForOfContext<T, U>>;

  static ɵdir: ɵɵDirectiveDeclaration<
    NgForOf<any, any>,
    '[ngFor][ngForOf]',
    never,
    {
      'ngForOf': 'ngForOf';
      'ngForTrackBy': 'ngForTrackBy';
      'ngForTemplate': 'ngForTemplate';
    },
    {},
    never
  >;
  static ngTemplateContextGuard<T, U extends NgIterable<T>>(
    dir: NgForOf<T, U>,
    ctx: any,
  ): ctx is NgForOfContext<T, U>;
}

export declare class NgIf<T = unknown> {
  ngIf: T;
  ngIfThen: TemplateRef<NgIfContext<T>> | null;
  ngIfElse: TemplateRef<NgIfContext<T>> | null;
  static ɵdir: ɵɵDirectiveDeclaration<
    NgIf<any>,
    '[ngIf]',
    never,
    {
      'ngIf': 'ngIf';
      'ngIfThen': 'ngIfThen';
      'ngIfElse': 'ngIfElse';
    },
    {},
    never
  >;
  static ngTemplateGuard_ngIf: 'binding';
  static ngTemplateContextGuard<T>(
    dir: NgIf<T>,
    ctx: any,
  ): ctx is NgIfContext<Exclude<T, false | 0 | '' | null | undefined>>;
}

export declare class NgTemplateOutlet<C = unknown> {
  ngTemplateOutlet: TemplateRef<C> | null;
  ngTemplateOutletContext: C | null;

  static ɵdir: ɵɵDirectiveDeclaration<
    NgTemplateOutlet<any>,
    '[ngTemplateOutlet]',
    never,
    {
      'ngTemplateOutlet': 'ngTemplateOutlet';
      'ngTemplateOutletContext': 'ngTemplateOutletContext';
    },
    {},
    never
  >;
  static ngTemplateContextGuard<T>(dir: NgTemplateOutlet<T>, ctx: any): ctx is T;
}

export declare class DatePipe {
  transform(
    value: Date | string | number,
    format?: string,
    timezone?: string,
    locale?: string,
  ): string | null;
  transform(value: null | undefined, format?: string, timezone?: string, locale?: string): null;
  transform(
    value: Date | string | number | null | undefined,
    format?: string,
    timezone?: string,
    locale?: string,
  ): string | null;
  static ɵpipe: ɵɵPipeDeclaration<DatePipe, 'date'>;
}

export declare class IndexPipe {
  transform<T>(value: T[], index: number): T;

  static ɵpipe: ɵɵPipeDeclaration<IndexPipe, 'index'>;
}

export declare class CommonModule {
  static ɵmod: ɵɵNgModuleDeclaration<
    CommonModule,
    [typeof NgForOf, typeof NgIf, typeof DatePipe, typeof IndexPipe, typeof NgTemplateOutlet],
    never,
    [typeof NgForOf, typeof NgIf, typeof DatePipe, typeof IndexPipe, typeof NgTemplateOutlet]
  >;
}

export declare class MatCard {
  static ɵcmp: ɵɵDirectiveDeclaration<
    MatCard,
    'mat-card',
    ['matCard'],
    {'appearance': {'alias': 'appearance'; 'required': false}},
    {},
    never,
    never,
    true,
    never
  >;
}

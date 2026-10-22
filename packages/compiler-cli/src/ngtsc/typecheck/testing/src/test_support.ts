/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TypeCheckingConfig} from '@angular/compiler';
import {readFileSync} from 'fs';
import path from 'path';
import {globSync} from 'tinyglobby';

import {absoluteFrom, AbsoluteFsPath} from '../../../file_system';
import {TestFile} from '../../../file_system/testing';
import {OwningModule} from '../../../imports';
import {DecoratorInputTransform} from '../../../metadata';
import {AmbientImport} from '../../../reflection';
import {resolveFromRunfiles} from '../../../testing';
import {TypeCheckableDirectiveMeta} from '../../api/api';

export function typescriptLibDts(): TestFile {
  return {
    name: absoluteFrom('/lib.d.ts'),
    contents: `
      type Partial<T> = { [P in keyof T]?: T[P]; };
      type Pick<T, K extends keyof T> = { [P in K]: T[P]; };
      type NonNullable<T> = T extends null | undefined ? never : T;

      // The following native type declarations are required for proper type inference
      declare interface Function {
        call(...args: any[]): any;
      }
      declare interface Array<T> {
        [index: number]: T;
        length: number;
      }
      declare interface Iterable<T> {}
      declare interface String {
        length: number;
      }

      declare interface Event {
        preventDefault(): void;
      }
      declare interface MouseEvent extends Event {
        readonly x: number;
        readonly y: number;
      }

      declare interface HTMLElementEventMap {
        "click": MouseEvent;
      }
      declare interface HTMLElement {
        addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any): void;
        addEventListener(type: string, listener: (evt: Event) => void): void;
      }
      declare interface HTMLDivElement extends HTMLElement {}
      declare interface HTMLImageElement extends HTMLElement {
        src: string;
        alt: string;
        width: number;
        height: number;
      }
      declare interface HTMLQuoteElement extends HTMLElement {
        cite: string;
      }
      declare interface HTMLElementTagNameMap {
        "blockquote": HTMLQuoteElement;
        "div": HTMLDivElement;
        "img": HTMLImageElement;
      }
      declare interface Document {
        createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K];
        createElement(tagName: string): HTMLElement;
      }
      declare const document: Document;
   `,
  };
}

let _angularCoreDts: TestFile[] | null = null;
export function angularCoreDtsFiles(): TestFile[] {
  if (_angularCoreDts !== null) {
    return _angularCoreDts;
  }

  const directory = resolveFromRunfiles('_main/packages/core/npm_package');
  const dtsFiles = globSync('**/*.d.ts', {cwd: directory});

  return (_angularCoreDts = ['package.json', ...dtsFiles].map((fileName) => ({
    name: absoluteFrom(`/node_modules/@angular/core/${fileName}`),
    contents: readFileSync(path.join(directory, fileName), 'utf8'),
  })));
}

let _angularFormsDts: TestFile[] | null = null;
export function angularFormsDtsFiles(): TestFile[] {
  if (_angularFormsDts !== null) {
    return _angularFormsDts;
  }

  const directory = resolveFromRunfiles('_main/packages/forms/npm_package');
  const dtsFiles = globSync('**/*.d.ts', {cwd: directory});

  return (_angularFormsDts = ['package.json', ...dtsFiles].map((fileName) => ({
    name: absoluteFrom(`/node_modules/@angular/forms/${fileName}`),
    contents: readFileSync(path.join(directory, fileName), 'utf8'),
  })));
}

export function angularAnimationsDts(): TestFile {
  return {
    name: absoluteFrom('/node_modules/@angular/animations/index.d.ts'),
    contents: `
    export declare class AnimationEvent {
      element: any;
    }
   `,
  };
}

export function ngIfDeclaration(): TestDeclaration {
  return {
    type: 'directive',
    file: absoluteFrom('/ngif.d.ts'),
    selector: '[ngIf]',
    name: 'NgIf',
    inputs: {ngIf: 'ngIf'},
    ngTemplateGuards: [{type: 'binding', inputName: 'ngIf'}],
    hasNgTemplateContextGuard: true,
    isGeneric: true,
  };
}

export function ngIfDts(): TestFile {
  return {
    name: absoluteFrom('/ngif.d.ts'),
    contents: `
    export declare class NgIf<T> {
      ngIf: T;
      static ngTemplateContextGuard<T>(dir: NgIf<T>, ctx: any): ctx is NgIfContext<Exclude<T, false|0|''|null|undefined>>
    }

    export declare class NgIfContext<T> {
      $implicit: T;
      ngIf: T;
    }`,
  };
}

export function ngForDeclaration(): TestDeclaration {
  return {
    type: 'directive',
    file: absoluteFrom('/ngfor.d.ts'),
    selector: '[ngForOf]',
    name: 'NgForOf',
    inputs: {ngForOf: 'ngForOf', ngForTrackBy: 'ngForTrackBy', ngForTemplate: 'ngForTemplate'},
    hasNgTemplateContextGuard: true,
    isGeneric: true,
  };
}

export function ngForDts(): TestFile {
  return {
    name: absoluteFrom('/ngfor.d.ts'),
    contents: `
    export declare class NgForOf<T> {
      ngForOf: T[];
      ngForTrackBy: TrackByFunction<T>;
      static ngTemplateContextGuard<T>(dir: NgForOf<T>, ctx: any): ctx is NgForOfContext<T>;
    }

    export interface TrackByFunction<T> {
      (index: number, item: T): any;
    }

    export declare class NgForOfContext<T> {
      $implicit: T;
      index: number;
      count: number;
      readonly odd: boolean;
      readonly even: boolean;
      readonly first: boolean;
      readonly last: boolean;
    }`,
  };
}

export function ngForTypeCheckTarget(): TypeCheckingTarget {
  const dts = ngForDts();
  return {...dts, fileName: dts.name, source: dts.contents, templates: {}};
}

export const ALL_ENABLED_CONFIG: Readonly<TypeCheckingConfig> = {
  applyTemplateContextGuards: true,
  checkTemplateBodies: true,
  checkControlFlowBodies: true,
  alwaysCheckSchemaInTemplateBodies: true,
  checkTypeOfInputBindings: true,
  honorAccessModifiersForInputBindings: true,
  strictNullInputBindings: true,
  checkTypeOfAttributes: true,
  // Feature is still in development.
  // TODO(alxhub): enable when DOM checking via lib.dom.d.ts is further along.
  checkTypeOfDomBindings: false,
  checkTypeOfOutputEvents: true,
  checkTypeOfAnimationEvents: true,
  checkTypeOfDomEvents: true,
  // Requires an explicit opt-in in production as well, since the check is heuristic.
  checkUnclaimedEventNames: false,
  checkTypeOfDomReferences: true,
  checkTypeOfNonDomReferences: true,
  checkTypeOfPipes: true,
  strictSafeNavigationTypes: true,
  useContextGenericType: true,
  strictLiteralTypes: true,
  enableTemplateTypeChecker: false,
  useInlineTypeConstructors: true,
  controlFlowPreventingContentProjection: 'warning',
  unusedStandaloneImports: 'warning',
  allowSignalsInTwoWayBindings: true,
  allowDomEventAssertion: true,
  checkUnknownElements: true,
};

// Remove 'ref' from TypeCheckableDirectiveMeta and add a 'selector' instead.
export interface TestDirective extends Partial<
  Pick<
    TypeCheckableDirectiveMeta,
    Exclude<
      keyof TypeCheckableDirectiveMeta,
      | 'ref'
      | 'coercedInputFields'
      | 'restrictedInputFields'
      | 'stringLiteralInputFields'
      | 'undeclaredInputFields'
      | 'publicMethods'
      | 'inputs'
      | 'outputs'
      | 'hostDirectives'
    >
  >
> {
  selector: string | null;
  name: string;
  file?: AbsoluteFsPath;
  type: 'directive';
  inputs?: {
    [fieldName: string]:
      | string
      | {
          classPropertyName: string;
          bindingPropertyName: string;
          required: boolean;
          isSignal: boolean;
          transform: DecoratorInputTransform | null;
        };
  };
  outputs?: {[fieldName: string]: string};
  coercedInputFields?: string[];
  restrictedInputFields?: string[];
  stringLiteralInputFields?: string[];
  undeclaredInputFields?: string[];
  publicMethods?: string[];
  isGeneric?: boolean;
  code?: string;
  ngContentSelectors?: string[] | null;
  preserveWhitespaces?: boolean;
  hostDirectives?: {
    directive: TestDirective & {isStandalone: true};
    inputs?: string[];
    outputs?: string[];
  }[];
  bestGuessOwningModule?: OwningModule | AmbientImport;
  hasNgFieldDirective?: boolean;
}

export interface TestPipe {
  name: string;
  file?: AbsoluteFsPath;
  isStandalone?: boolean;
  pipeName: string;
  type: 'pipe';
  code?: string;
  bestGuessOwningModule?: OwningModule | AmbientImport;
  isGeneric?: boolean;
}

export type TestDeclaration = TestDirective | TestPipe;

/**
 * A file in the test program, along with any template information for components within the file.
 */
export interface TypeCheckingTarget {
  /**
   * Path to the file in the virtual test filesystem.
   */
  fileName: AbsoluteFsPath;

  /**
   * Raw source code for the file.
   *
   * If this is omitted, source code for the file will be generated based on any expected component
   * classes.
   */
  source?: string;

  /**
   * A map of component class names to string templates for that component.
   */
  templates?: {[className: string]: string};

  /**
   * Any declarations (e.g. directives) which should be considered as part of the scope for the
   * components in this file.
   */
  declarations?: TestDeclaration[];

  /**
   * Names of foreign components that are available in the template scope.
   */
  foreignComponents?: string[];
}

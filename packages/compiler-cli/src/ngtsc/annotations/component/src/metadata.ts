/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationTriggerNames, R3ClassMetadata, R3ComponentMetadata, R3TemplateDependency, R3TemplateDependencyMetadata} from '@angular/compiler';
import ts from 'typescript';

import {Reference} from '../../../imports';
import {ClassPropertyMapping, ComponentResources, DirectiveTypeCheckMeta} from '../../../metadata';
import {ClassDeclaration} from '../../../reflection';
import {SubsetOfKeys} from '../../../util/src/typescript';

import {ParsedTemplateWithSource, StyleUrlMeta} from './resources';

/**
 * These fields of `R3ComponentMetadata` are updated in the `resolve` phase.
 *
 * The `keyof R3ComponentMetadata &` condition ensures that only fields of `R3ComponentMetadata` can
 * be included here.
 */
export type ComponentMetadataResolvedFields = SubsetOfKeys<
    R3ComponentMetadata<R3TemplateDependencyMetadata>, 'declarations'|'declarationListEmitMode'>;

export interface ComponentAnalysisData {
  /**
   * `meta` includes those fields of `R3ComponentMetadata` which are calculated at `analyze` time
   * (not during resolve).
   */
  meta: Omit<R3ComponentMetadata<R3TemplateDependencyMetadata>, ComponentMetadataResolvedFields>;
  baseClass: Reference<ClassDeclaration>|'dynamic'|null;
  typeCheckMeta: DirectiveTypeCheckMeta;
  template: ParsedTemplateWithSource;
  classMetadata: R3ClassMetadata|null;

  inputs: ClassPropertyMapping;
  outputs: ClassPropertyMapping;

  /**
   * Providers extracted from the `providers` field of the component annotation which will require
   * an Angular factory definition at runtime.
   */
  providersRequiringFactory: Set<Reference<ClassDeclaration>>|null;

  /**
   * Providers extracted from the `viewProviders` field of the component annotation which will
   * require an Angular factory definition at runtime.
   */
  viewProvidersRequiringFactory: Set<Reference<ClassDeclaration>>|null;

  resources: ComponentResources;

  /**
   * `styleUrls` extracted from the decorator, if present.
   */
  styleUrls: StyleUrlMeta[]|null;

  /**
   * Inline stylesheets extracted from the decorator, if present.
   */
  inlineStyles: string[]|null;

  isPoisoned: boolean;
  animationTriggerNames: AnimationTriggerNames|null;

  imports: {
    resolved: Reference<ClassDeclaration>[],
    raw: ts.Expression,
  }|null;
}

export type ComponentResolutionData =
    Pick<R3ComponentMetadata<R3TemplateDependencyMetadata>, ComponentMetadataResolvedFields>;

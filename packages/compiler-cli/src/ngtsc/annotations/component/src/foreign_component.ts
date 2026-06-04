/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  BindingType,
  SelectorlessMatcher,
  TmplAstElement,
  TmplAstRecursiveVisitor,
  tmplAstVisitAll,
  TypeCheckId,
} from '@angular/compiler';
import ts from 'typescript';

import {ParsedTemplateWithSource} from './resources';
import {ErrorCode, ngErrorCode} from '../../../diagnostics';
import {ForeignComponentMeta} from '../../../metadata';
import {makeTemplateDiagnostic} from '../../../typecheck/diagnostics';
import {SourceMapping} from '../../../typecheck/api';

/**
 * Analyzes the template for invalid use of features relating to foreign components.
 *
 * @param template The template to analyze.
 * @param foreignMatcher A matcher that can be used to identify foreign components.
 * @returns A list of diagnostics that should be reported for the template.
 */
export function analyzeForeignComponentFeatures(
  template: ParsedTemplateWithSource,
  foreignMatcher: SelectorlessMatcher<ForeignComponentMeta> | null,
): ts.Diagnostic[] {
  const analyzer = new ForeignComponentFeatureAnalyzer(foreignMatcher, template.sourceMapping);
  tmplAstVisitAll(analyzer, template.nodes);
  return analyzer.diagnostics;
}

class ForeignComponentFeatureAnalyzer extends TmplAstRecursiveVisitor {
  readonly diagnostics: ts.Diagnostic[] = [];

  constructor(
    private readonly foreignMatcher: SelectorlessMatcher<ForeignComponentMeta> | null,
    private readonly sourceMapping: SourceMapping,
  ) {
    super();
  }

  private elementIsForeignComponent(tagName: string): boolean {
    return this.foreignMatcher !== null && this.foreignMatcher.match(tagName).length > 0;
  }

  override visitElement(element: TmplAstElement): void {
    if (this.elementIsForeignComponent(element.name)) {
      if (element.outputs.length > 0) {
        this.diagnostics.push(
          makeTemplateDiagnostic(
            '' as TypeCheckId,
            this.sourceMapping,
            element.sourceSpan,
            ts.DiagnosticCategory.Error,
            ngErrorCode(ErrorCode.FOREIGN_COMPONENT_UNSUPPORTED_BINDING),
            'Foreign components do not support event bindings.',
          ),
        );
      }
      if (element.references.length > 0) {
        this.diagnostics.push(
          makeTemplateDiagnostic(
            '' as TypeCheckId,
            this.sourceMapping,
            element.sourceSpan,
            ts.DiagnosticCategory.Error,
            ngErrorCode(ErrorCode.FOREIGN_COMPONENT_UNSUPPORTED_BINDING),
            'Foreign components do not support references.',
          ),
        );
      }
      if (element.inputs.some((input) => input.type !== BindingType.Property)) {
        this.diagnostics.push(
          makeTemplateDiagnostic(
            '' as TypeCheckId,
            this.sourceMapping,
            element.sourceSpan,
            ts.DiagnosticCategory.Error,
            ngErrorCode(ErrorCode.FOREIGN_COMPONENT_UNSUPPORTED_BINDING),
            'Foreign components only support static attributes and property bindings.',
          ),
        );
      }
    }

    super.visitElement(element);
  }
}

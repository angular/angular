/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BindingType, TmplAstComponent, TmplAstElement, TmplAstHostElement} from '@angular/compiler';
import ts from 'typescript';
import {REGISTRY} from '../dom';
import {TcbOp} from './base';
import {Context} from './context';
import {getComponentTagName} from './selectorless';

/**
 * A `TcbOp` which feeds elements and unclaimed properties to the `DomSchemaChecker`.
 *
 * The DOM schema is not checked via TCB code generation. Instead, the `DomSchemaChecker` ingests
 * elements and property bindings and accumulates synthetic `ts.Diagnostic`s out-of-band. These are
 * later merged with the diagnostics generated from the TCB.
 *
 * For convenience, the TCB iteration of the template is used to drive the `DomSchemaChecker` via
 * the `TcbDomSchemaCheckerOp`.
 */
export class TcbDomSchemaCheckerOp extends TcbOp {
  constructor(
    private tcb: Context,
    private element: TmplAstElement | TmplAstComponent | TmplAstHostElement,
    private checkElement: boolean,
    private claimedInputs: Set<string> | null,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): ts.Expression | null {
    const element = this.element;
    const isTemplateElement =
      element instanceof TmplAstElement || element instanceof TmplAstComponent;
    const bindings = isTemplateElement ? element.inputs : element.bindings;

    if (this.checkElement && isTemplateElement) {
      this.tcb.domSchemaChecker.checkElement(
        this.tcb.id,
        this.getTagName(element),
        element.startSourceSpan,
        this.tcb.schemas,
        this.tcb.hostIsStandalone,
      );
    }

    // TODO(alxhub): this could be more efficient.
    for (const binding of bindings) {
      const isPropertyBinding =
        binding.type === BindingType.Property || binding.type === BindingType.TwoWay;

      if (isPropertyBinding && this.claimedInputs?.has(binding.name)) {
        // Skip this binding as it was claimed by a directive.
        continue;
      }

      if (isPropertyBinding && binding.name !== 'style' && binding.name !== 'class') {
        // A direct binding to a property.
        const propertyName = REGISTRY.getMappedPropName(binding.name);

        if (isTemplateElement) {
          this.tcb.domSchemaChecker.checkTemplateElementProperty(
            this.tcb.id,
            this.getTagName(element),
            propertyName,
            binding.sourceSpan,
            this.tcb.schemas,
            this.tcb.hostIsStandalone,
          );
        } else {
          this.tcb.domSchemaChecker.checkHostElementProperty(
            this.tcb.id,
            element,
            propertyName,
            binding.keySpan,
            this.tcb.schemas,
          );
        }
      }
    }
    return null;
  }

  private getTagName(node: TmplAstElement | TmplAstComponent): string {
    return node instanceof TmplAstElement ? node.name : getComponentTagName(node);
  }
}

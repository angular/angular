/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import {ParseSourceSpan} from '../../../../parse_util';
import * as t from '../../../../render3/r3_ast';
import * as ir from '../../ir';
import {ComponentCompilationJob, ViewCompilationUnit} from '../compilation';

/**
 * Returns the source surrounding each static text node. The array preserves the boundaries
 * between nodes and compares bindings, attributes and other markup verbatim.
 */
export function getHmrTextSignature(nodes: t.Node[]): o.Expression | null {
  const first = nodes[0]?.sourceSpan.start;
  const end = nodes.at(-1)?.sourceSpan.end;
  if (first === undefined || end === undefined || first.file !== end.file) {
    return null;
  }

  const spans: ParseSourceSpan[] = [];
  if (!collectTextSpans(nodes, spans) || spans.length === 0) {
    return null;
  }

  const parts: o.Expression[] = [];
  let offset = first.offset;
  for (const {start, end: textEnd} of spans) {
    if (
      start.file !== first.file ||
      textEnd.file !== first.file ||
      start.offset < offset ||
      textEnd.offset <= start.offset ||
      textEnd.offset > end.offset
    ) {
      return null;
    }
    parts.push(o.literal(first.file.content.slice(offset, start.offset)));
    offset = textEnd.offset;
  }
  parts.push(o.literal(first.file.content.slice(offset, end.offset)));
  return o.literalArr(parts);
}

function collectTextSpans(nodes: t.Node[], spans: ParseSourceSpan[]): boolean {
  for (const node of nodes) {
    if (node instanceof t.Text) {
      spans.push(node.sourceSpan);
    } else if (node instanceof t.Element || node instanceof t.Template) {
      if (
        node.i18n !== undefined ||
        node.attributes.some((attribute) => attribute.i18n !== undefined) ||
        node.inputs.some((input) => input.i18n !== undefined) ||
        !collectTextSpans(node.children, spans)
      ) {
        return false;
      }
    } else if (!(node instanceof t.BoundText) || node.i18n !== undefined) {
      // Control flow, projection and i18n use different view creation instructions.
      return false;
    }
  }
  return true;
}

/** Collects slots after allocation, while template and text operations still carry their IR data. */
export function collectHmrTextViews(job: ComponentCompilationJob): void {
  if (job.hmrTextEnabled) {
    job.hmrTextViews = collectView(job.root);
  }
}

function collectView(view: ViewCompilationUnit): o.Expression | null {
  const text: o.Expression[] = [];
  const children: o.Expression[] = [];
  for (const op of view.create) {
    switch (op.kind) {
      case ir.OpKind.Text:
        if (op.initialValue !== '') {
          text.push(o.literalArr([o.literal(op.handle.slot!), o.literal(op.initialValue)]));
        }
        break;
      case ir.OpKind.Template:
        const child = view.job.views.get(op.xref)!;
        const childMetadata = collectView(child);
        if (childMetadata === null) {
          return null;
        }
        children.push(
          o.literalArr([o.literal(op.handle.slot!), o.variable(child.fnName!), childMetadata]),
        );
        break;
      case ir.OpKind.Element:
      case ir.OpKind.ElementStart:
      case ir.OpKind.ElementEnd:
      case ir.OpKind.Container:
      case ir.OpKind.ContainerStart:
      case ir.OpKind.ContainerEnd:
      case ir.OpKind.Listener:
      case ir.OpKind.TwoWayListener:
      case ir.OpKind.Pipe:
        break;
      default:
        return null;
    }
  }
  return o.literalArr([
    o.literal(view.decls!),
    o.literal(view.vars!),
    o.literalArr(text),
    o.literalArr(children),
  ]);
}

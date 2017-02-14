/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileQueryMetadata, tokenReference} from '../compile_metadata';
import {ListWrapper} from '../facade/collection';
import {Identifiers, createIdentifier} from '../identifiers';
import * as o from '../output/output_ast';

import {CompileElement} from './compile_element';
import {CompileMethod} from './compile_method';
import {CompileView} from './compile_view';
import {getPropertyInView} from './util';

class ViewQueryValues {
  constructor(public view: CompileView, public values: Array<o.Expression|ViewQueryValues>) {}
}

export class CompileQuery {
  private _values: ViewQueryValues;

  constructor(
      public meta: CompileQueryMetadata, public queryList: o.Expression,
      public ownerDirectiveExpression: o.Expression, public view: CompileView) {
    this._values = new ViewQueryValues(view, []);
  }

  addValue(value: o.Expression, view: CompileView) {
    let currentView = view;
    const elPath: CompileElement[] = [];
    while (currentView && currentView !== this.view) {
      const parentEl = currentView.declarationElement;
      elPath.unshift(parentEl);
      currentView = parentEl.view;
    }
    const queryListForDirtyExpr = getPropertyInView(this.queryList, view, this.view);

    let viewValues = this._values;
    elPath.forEach((el) => {
      const last =
          viewValues.values.length > 0 ? viewValues.values[viewValues.values.length - 1] : null;
      if (last instanceof ViewQueryValues && last.view === el.embeddedView) {
        viewValues = last;
      } else {
        const newViewValues = new ViewQueryValues(el.embeddedView, []);
        viewValues.values.push(newViewValues);
        viewValues = newViewValues;
      }
    });
    viewValues.values.push(value);

    if (elPath.length > 0) {
      view.dirtyParentQueriesMethod.addStmt(
          queryListForDirtyExpr.callMethod('setDirty', []).toStmt());
    }
  }

  private _isStatic(): boolean {
    return !this._values.values.some(value => value instanceof ViewQueryValues);
  }

  generateStatements(targetStaticMethod: CompileMethod, targetDynamicMethod: CompileMethod) {
    const values = createQueryValues(this._values);
    const updateStmts = [this.queryList.callMethod('reset', [o.literalArr(values)]).toStmt()];
    if (this.ownerDirectiveExpression) {
      const valueExpr = this.meta.first ? this.queryList.prop('first') : this.queryList;
      updateStmts.push(
          this.ownerDirectiveExpression.prop(this.meta.propertyName).set(valueExpr).toStmt());
    }
    if (!this.meta.first) {
      updateStmts.push(this.queryList.callMethod('notifyOnChanges', []).toStmt());
    }
    if (this.meta.first && this._isStatic()) {
      // for queries that don't change and the user asked for a single element,
      // set it immediately. That is e.g. needed for querying for ViewContainerRefs, ...
      // we don't do this for QueryLists for now as this would break the timing when
      // we call QueryList listeners...
      targetStaticMethod.addStmts(updateStmts);
    } else {
      targetDynamicMethod.addStmt(new o.IfStmt(this.queryList.prop('dirty'), updateStmts));
    }
  }
}

function createQueryValues(viewValues: ViewQueryValues): o.Expression[] {
  return ListWrapper.flatten(viewValues.values.map((entry) => {
    if (entry instanceof ViewQueryValues) {
      return mapNestedViews(
          entry.view.declarationElement.viewContainer, entry.view, createQueryValues(entry));
    } else {
      return <o.Expression>entry;
    }
  }));
}

function mapNestedViews(
    viewContainer: o.Expression, view: CompileView, expressions: o.Expression[]): o.Expression {
  const adjustedExpressions: o.Expression[] = expressions.map(
      (expr) => o.replaceVarInExpression(o.THIS_EXPR.name, o.variable('nestedView'), expr));
  return viewContainer.callMethod('mapNestedViews', [
    o.variable(view.className),
    o.fn(
        [new o.FnParam('nestedView', view.classType)],
        [new o.ReturnStatement(o.literalArr(adjustedExpressions))], o.DYNAMIC_TYPE)
  ]);
}

export function createQueryList(propertyName: string, compileView: CompileView): o.Expression {
  compileView.fields.push(new o.ClassField(
      propertyName, o.importType(createIdentifier(Identifiers.QueryList), [o.DYNAMIC_TYPE])));
  const expr = o.THIS_EXPR.prop(propertyName);
  compileView.createMethod.addStmt(
      o.THIS_EXPR.prop(propertyName)
          .set(o.importExpr(createIdentifier(Identifiers.QueryList), [o.DYNAMIC_TYPE]).instantiate([
          ]))
          .toStmt());
  return expr;
}

export function addQueryToTokenMap(map: Map<any, CompileQuery[]>, query: CompileQuery) {
  query.meta.selectors.forEach((selector) => {
    let entry = map.get(tokenReference(selector));
    if (!entry) {
      entry = [];
      map.set(tokenReference(selector), entry);
    }
    entry.push(query);
  });
}

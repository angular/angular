import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';

import * as o from '../output/output_ast';
import {Identifiers} from '../identifiers';

import {
  CompileQueryMetadata,
  CompileIdentifierMetadata,
  CompileTokenMap
} from '../compile_metadata';

import {CompileView} from './compile_view';
import {CompileElement} from './compile_element';
import {CompileMethod} from './compile_method';
import {getPropertyInView} from './util';

class ViewQueryValues {
  constructor(public view: CompileView, public values: Array<o.Expression | ViewQueryValues>) {}
}

export class CompileQuery {
  private _values: ViewQueryValues;

  constructor(public meta: CompileQueryMetadata, public queryList: o.Expression,
              public ownerDirectiveExpression: o.Expression, public view: CompileView) {
    this._values = new ViewQueryValues(view, []);
  }

  addValue(value: o.Expression, view: CompileView) {
    var currentView = view;
    var elPath: CompileElement[] = [];
    var viewPath: CompileView[] = [];
    while (isPresent(currentView) && currentView !== this.view) {
      var parentEl = currentView.declarationElement;
      elPath.unshift(parentEl);
      currentView = parentEl.view;
      viewPath.push(currentView);
    }
    var queryListForDirtyExpr = getPropertyInView(this.queryList, viewPath);

    var viewValues = this._values;
    elPath.forEach((el) => {
      var last =
          viewValues.values.length > 0 ? viewValues.values[viewValues.values.length - 1] : null;
      if (last instanceof ViewQueryValues && last.view === el.embeddedView) {
        viewValues = last;
      } else {
        var newViewValues = new ViewQueryValues(el.embeddedView, []);
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

  afterChildren(targetMethod: CompileMethod) {
    var values = createQueryValues(this._values);
    var notifyChangesStmt;
    if (this.meta.first && isPresent(this.ownerDirectiveExpression)) {
      notifyChangesStmt = this.ownerDirectiveExpression.prop(this.meta.propertyName)
                              .set(this.queryList.prop('first'))
                              .toStmt();
    } else {
      notifyChangesStmt = this.queryList.callMethod('notifyOnChanges', []).toStmt();
    }
    targetMethod.addStmt(new o.IfStmt(
        this.queryList.prop('dirty'),
        [this.queryList.callMethod('reset', [o.literalArr(values)]).toStmt(), notifyChangesStmt]));
  }
}

function createQueryValues(viewValues: ViewQueryValues): o.Expression[] {
  return ListWrapper.flatten(viewValues.values.map((entry) => {
    if (entry instanceof ViewQueryValues) {
      return mapNestedViews(entry.view.declarationElement.getOrCreateAppElement(), entry.view,
                            createQueryValues(entry));
    } else {
      return <o.Expression>entry;
    }
  }));
}

function mapNestedViews(declarationAppElement: o.Expression, view: CompileView,
                        expressions: o.Expression[]): o.Expression {
  var adjustedExpressions: o.Expression[] = expressions.map((expr) => {
    return o.replaceVarInExpression(o.THIS_EXPR.name, o.variable('nestedView'), expr);
  });
  return declarationAppElement.callMethod('mapNestedViews', [
    o.variable(view.className),
    o.fn([new o.FnParam('nestedView', view.classType)],
         [new o.ReturnStatement(o.literalArr(adjustedExpressions))])
  ]);
}

export function createQueryList(query: CompileQueryMetadata, directiveInstance: o.Expression,
                                propertyName: string, compileView: CompileView): o.Expression {
  compileView.fields.push(new o.ClassField(propertyName, o.importType(Identifiers.QueryList),
                                           [o.StmtModifier.Private]));
  var expr = o.THIS_EXPR.prop(propertyName);
  compileView.constructorMethod.addStmt(
      o.THIS_EXPR.prop(propertyName)
          .set(o.importExpr(Identifiers.QueryList).instantiate([]))
          .toStmt());
  if (!query.first && isPresent(directiveInstance)) {
    compileView.constructorMethod.addStmt(
        directiveInstance.prop(query.propertyName).set(expr).toStmt());
  }
  return expr;
}

export function addQueryToTokenMap(map: CompileTokenMap<CompileQuery[]>, query: CompileQuery) {
  query.meta.selectors.forEach((selector) => {
    var entry = map.get(selector);
    if (isBlank(entry)) {
      entry = [];
      map.add(selector, entry);
    }
    entry.push(query);
  });
}

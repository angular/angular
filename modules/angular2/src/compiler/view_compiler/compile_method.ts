import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {MapWrapper, ListWrapper} from 'angular2/src/facade/collection';

import * as o from '../output/output_ast';
import {Identifiers} from '../identifiers';
import {AllMethodVars} from './constants';

import {createDiTokenExpression, getTemplateSource} from './util';

import {CompileView} from './compile_view';

class _DebugState {
  constructor(public nodeIndex: number, public bindingIndex: number) {}
}

var NULL_DEBUG_STATE = new _DebugState(null, null);

export class CompileMethod {
  private _currState: _DebugState = NULL_DEBUG_STATE;
  private _newState: _DebugState = NULL_DEBUG_STATE;

  private _debugEnabled: boolean;
  private _hasDebugStmts: boolean = false;

  private _bodyStatements: o.Statement[] = [];
  private _errorStatements: o.Statement[] = [];

  constructor(private _view: CompileView, private _displayName: string) {
    this._debugEnabled = this._view.genConfig.genDebugInfo;
  }

  private _updateDebugContextIfNeeded() {
    if (this._newState.nodeIndex !== this._currState.nodeIndex ||
        this._newState.bindingIndex !== this._currState.bindingIndex) {
      if (isPresent(this._newState.nodeIndex)) {
        this._bodyStatements.push(new o.CommentStmt(
            `${getTemplateSource(this._view.nodes[this._newState.nodeIndex].sourceAst)}`));
      }
      if (this._debugEnabled) {
        this._bodyStatements.push(
            AllMethodVars.debugContext.set(o.THIS_EXPR.callMethod(
                                               'debugContext',
                                               [
                                                 o.literal(this._newState.nodeIndex),
                                                 o.literal(this._newState.bindingIndex),
                                               ]))
                .toStmt());
      }
      this._hasDebugStmts = true;
      this._currState = this._newState;
    }
  }

  resetDebugInfo({nodeIndex = null,
                  bindingIndex = null}: {nodeIndex?: number, bindingIndex?: number} = {}) {
    this._newState = new _DebugState(nodeIndex, bindingIndex);
  }

  addStmt(stmt: o.Statement) {
    this._updateDebugContextIfNeeded();
    this._bodyStatements.push(stmt);
  }

  addStmts(stmts: o.Statement[]) {
    this._updateDebugContextIfNeeded();
    ListWrapper.addAll(this._bodyStatements, stmts);
  }

  addDebugErrorStmt(stmt: o.Statement) { this._errorStatements.push(stmt); }

  finish(): o.Statement[] {
    if (this._debugEnabled && this._hasDebugStmts) {
      var errorStmts = this._errorStatements.concat([
        o.THIS_EXPR.callMethod('rethrowWithContext',
                               [
                                 o.literal(this._displayName),
                                 AllMethodVars.debugContext,
                                 o.CATCH_ERROR_VAR,
                                 o.CATCH_STACK_VAR
                               ])
            .toStmt()
      ]);
      return [
        AllMethodVars.debugContext.set(o.THIS_EXPR.callMethod('debugContext',
                                                              [o.NULL_EXPR, o.NULL_EXPR]))
            .toDeclStmt(new o.ExternalType(Identifiers.DebugContext)),
        new o.TryCatchStmt(this._bodyStatements, errorStmts)
      ];
    } else {
      return this._bodyStatements;
    }
  }
}

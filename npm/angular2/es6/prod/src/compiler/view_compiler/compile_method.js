import { isPresent } from 'angular2/src/facade/lang';
import { ListWrapper } from 'angular2/src/facade/collection';
import * as o from '../output/output_ast';
class _DebugState {
    constructor(nodeIndex, sourceAst) {
        this.nodeIndex = nodeIndex;
        this.sourceAst = sourceAst;
    }
}
var NULL_DEBUG_STATE = new _DebugState(null, null);
export class CompileMethod {
    constructor(_view) {
        this._view = _view;
        this._newState = NULL_DEBUG_STATE;
        this._currState = NULL_DEBUG_STATE;
        this._bodyStatements = [];
        this._debugEnabled = this._view.genConfig.genDebugInfo;
    }
    _updateDebugContextIfNeeded() {
        if (this._newState.nodeIndex !== this._currState.nodeIndex ||
            this._newState.sourceAst !== this._currState.sourceAst) {
            var expr = this._updateDebugContext(this._newState);
            if (isPresent(expr)) {
                this._bodyStatements.push(expr.toStmt());
            }
        }
    }
    _updateDebugContext(newState) {
        this._currState = this._newState = newState;
        if (this._debugEnabled) {
            var sourceLocation = isPresent(newState.sourceAst) ? newState.sourceAst.sourceSpan.start : null;
            return o.THIS_EXPR.callMethod('debug', [
                o.literal(newState.nodeIndex),
                isPresent(sourceLocation) ? o.literal(sourceLocation.line) : o.NULL_EXPR,
                isPresent(sourceLocation) ? o.literal(sourceLocation.col) : o.NULL_EXPR
            ]);
        }
        else {
            return null;
        }
    }
    resetDebugInfoExpr(nodeIndex, templateAst) {
        var res = this._updateDebugContext(new _DebugState(nodeIndex, templateAst));
        return isPresent(res) ? res : o.NULL_EXPR;
    }
    resetDebugInfo(nodeIndex, templateAst) {
        this._newState = new _DebugState(nodeIndex, templateAst);
    }
    addStmt(stmt) {
        this._updateDebugContextIfNeeded();
        this._bodyStatements.push(stmt);
    }
    addStmts(stmts) {
        this._updateDebugContextIfNeeded();
        ListWrapper.addAll(this._bodyStatements, stmts);
    }
    finish() { return this._bodyStatements; }
    isEmpty() { return this._bodyStatements.length === 0; }
}

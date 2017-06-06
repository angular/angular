import { isBlank } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import * as o from '../output/output_ast';
import { Identifiers, identifierToken } from '../identifiers';
import { injectFromViewParentInjector, createPureProxy, getPropertyInView } from './util';
class _PurePipeProxy {
    constructor(instance, argCount) {
        this.instance = instance;
        this.argCount = argCount;
    }
}
export class CompilePipe {
    constructor(view, name) {
        this.view = view;
        this._purePipeProxies = [];
        this.meta = _findPipeMeta(view, name);
        this.instance = o.THIS_EXPR.prop(`_pipe_${name}_${view.pipeCount++}`);
    }
    get pure() { return this.meta.pure; }
    create() {
        var deps = this.meta.type.diDeps.map((diDep) => {
            if (diDep.token.equalsTo(identifierToken(Identifiers.ChangeDetectorRef))) {
                return getPropertyInView(o.THIS_EXPR.prop('ref'), this.view, this.view.componentView);
            }
            return injectFromViewParentInjector(diDep.token, false);
        });
        this.view.fields.push(new o.ClassField(this.instance.name, o.importType(this.meta.type)));
        this.view.createMethod.resetDebugInfo(null, null);
        this.view.createMethod.addStmt(o.THIS_EXPR.prop(this.instance.name)
            .set(o.importExpr(this.meta.type).instantiate(deps))
            .toStmt());
        this._purePipeProxies.forEach((purePipeProxy) => {
            createPureProxy(this.instance.prop('transform').callMethod(o.BuiltinMethod.bind, [this.instance]), purePipeProxy.argCount, purePipeProxy.instance, this.view);
        });
    }
    call(callingView, args) {
        if (this.meta.pure) {
            var purePipeProxy = new _PurePipeProxy(o.THIS_EXPR.prop(`${this.instance.name}_${this._purePipeProxies.length}`), args.length);
            this._purePipeProxies.push(purePipeProxy);
            return getPropertyInView(o.importExpr(Identifiers.castByValue)
                .callFn([purePipeProxy.instance, this.instance.prop('transform')]), callingView, this.view)
                .callFn(args);
        }
        else {
            return getPropertyInView(this.instance, callingView, this.view).callMethod('transform', args);
        }
    }
}
function _findPipeMeta(view, name) {
    var pipeMeta = null;
    for (var i = view.pipeMetas.length - 1; i >= 0; i--) {
        var localPipeMeta = view.pipeMetas[i];
        if (localPipeMeta.name == name) {
            pipeMeta = localPipeMeta;
            break;
        }
    }
    if (isBlank(pipeMeta)) {
        throw new BaseException(`Illegal state: Could not find pipe ${name} although the parser should have detected this error!`);
    }
    return pipeMeta;
}

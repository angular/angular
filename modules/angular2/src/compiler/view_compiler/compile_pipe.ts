import {isBlank, isPresent} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import * as o from '../output/output_ast';
import {CompileView} from './compile_view';
import {CompilePipeMetadata} from '../compile_metadata';
import {Identifiers, identifierToken} from '../identifiers';
import {injectFromViewParentInjector, createPureProxy, getPropertyInView} from './util';

class _PurePipeProxy {
  constructor(public instance: o.ReadPropExpr, public argCount: number) {}
}

export class CompilePipe {
  meta: CompilePipeMetadata;
  instance: o.ReadPropExpr;
  private _purePipeProxies: _PurePipeProxy[] = [];

  constructor(public view: CompileView, name: string) {
    this.meta = _findPipeMeta(view, name);
    this.instance = o.THIS_EXPR.prop(`_pipe_${name}_${view.pipeCount++}`);
  }

  get pure(): boolean { return this.meta.pure; }

  create(): void {
    var deps = this.meta.type.diDeps.map((diDep) => {
      if (diDep.token.equalsTo(identifierToken(Identifiers.ChangeDetectorRef))) {
        return o.THIS_EXPR.prop('ref');
      }
      return injectFromViewParentInjector(diDep.token, false);
    });
    this.view.fields.push(new o.ClassField(this.instance.name, o.importType(this.meta.type),
                                           [o.StmtModifier.Private]));
    this.view.createMethod.resetDebugInfo(null, null);
    this.view.createMethod.addStmt(o.THIS_EXPR.prop(this.instance.name)
                                       .set(o.importExpr(this.meta.type).instantiate(deps))
                                       .toStmt());
    this._purePipeProxies.forEach((purePipeProxy) => {
      createPureProxy(
          this.instance.prop('transform').callMethod(o.BuiltinMethod.bind, [this.instance]),
          purePipeProxy.argCount, purePipeProxy.instance, this.view);
    });
  }

  call(callingView: CompileView, args: o.Expression[]): o.Expression {
    if (this.meta.pure) {
      var purePipeProxy = new _PurePipeProxy(
          o.THIS_EXPR.prop(`${this.instance.name}_${this._purePipeProxies.length}`), args.length);
      this._purePipeProxies.push(purePipeProxy);
      return getPropertyInView(
                 o.importExpr(Identifiers.castByValue)
                     .callFn([purePipeProxy.instance, this.instance.prop('transform')]),
                 callingView, this.view)
          .callFn(args);
    } else {
      return getPropertyInView(this.instance, callingView, this.view).callMethod('transform', args);
    }
  }
}


function _findPipeMeta(view: CompileView, name: string): CompilePipeMetadata {
  var pipeMeta: CompilePipeMetadata = null;
  for (var i = view.pipeMetas.length - 1; i >= 0; i--) {
    var localPipeMeta = view.pipeMetas[i];
    if (localPipeMeta.name == name) {
      pipeMeta = localPipeMeta;
      break;
    }
  }
  if (isBlank(pipeMeta)) {
    throw new BaseException(
        `Illegal state: Could not find pipe ${name} although the parser should have detected this error!`);
  }
  return pipeMeta;
}

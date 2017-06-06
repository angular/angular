import { isPresent } from 'angular2/src/facade/lang';
import { AppView, DebugAppView } from 'angular2/src/core/linker/view';
import { BaseException } from 'angular2/src/facade/exceptions';
export class InterpretiveAppViewInstanceFactory {
    createInstance(superClass, clazz, args, props, getters, methods) {
        if (superClass === AppView) {
            // We are always using DebugAppView as parent.
            // However, in prod mode we generate a constructor call that does
            // not have the argument for the debugNodeInfos.
            args = args.concat([null]);
            return new _InterpretiveAppView(args, props, getters, methods);
        }
        else if (superClass === DebugAppView) {
            return new _InterpretiveAppView(args, props, getters, methods);
        }
        throw new BaseException(`Can't instantiate class ${superClass} in interpretative mode`);
    }
}
class _InterpretiveAppView extends DebugAppView {
    constructor(args, props, getters, methods) {
        super(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
        this.props = props;
        this.getters = getters;
        this.methods = methods;
    }
    createInternal(rootSelector) {
        var m = this.methods.get('createInternal');
        if (isPresent(m)) {
            return m(rootSelector);
        }
        else {
            return super.createInternal(rootSelector);
        }
    }
    injectorGetInternal(token, nodeIndex, notFoundResult) {
        var m = this.methods.get('injectorGetInternal');
        if (isPresent(m)) {
            return m(token, nodeIndex, notFoundResult);
        }
        else {
            return super.injectorGet(token, nodeIndex, notFoundResult);
        }
    }
    destroyInternal() {
        var m = this.methods.get('destroyInternal');
        if (isPresent(m)) {
            return m();
        }
        else {
            return super.destroyInternal();
        }
    }
    dirtyParentQueriesInternal() {
        var m = this.methods.get('dirtyParentQueriesInternal');
        if (isPresent(m)) {
            return m();
        }
        else {
            return super.dirtyParentQueriesInternal();
        }
    }
    detectChangesInternal(throwOnChange) {
        var m = this.methods.get('detectChangesInternal');
        if (isPresent(m)) {
            return m(throwOnChange);
        }
        else {
            return super.detectChangesInternal(throwOnChange);
        }
    }
}

import {hasInjectableFields} from '../../../metadata';
import {getConstructorDependencies, unwrapConstructorDependencies} from './di';
/**
 * Registry that keeps track of classes that can be constructed via dependency injection (e.g.
 * injectables, directives, pipes).
 */
export class InjectableClassRegistry {
  host;
  isCore;
  classes = new Map();
  constructor(host, isCore) {
    this.host = host;
    this.isCore = isCore;
  }
  registerInjectable(declaration, meta) {
    this.classes.set(declaration, meta);
  }
  getInjectableMeta(declaration) {
    // Figure out whether the class is injectable based on the registered classes, otherwise
    // fall back to looking at its members since we might not have been able to register the class
    // if it was compiled in another compilation unit.
    if (this.classes.has(declaration)) {
      return this.classes.get(declaration);
    }
    if (!hasInjectableFields(declaration, this.host)) {
      return null;
    }
    const ctorDeps = getConstructorDependencies(declaration, this.host, this.isCore);
    const meta = {
      ctorDeps: unwrapConstructorDependencies(ctorDeps),
    };
    this.classes.set(declaration, meta);
    return meta;
  }
}
//# sourceMappingURL=injectable_registry.js.map

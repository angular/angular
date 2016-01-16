import {Compiler, Compiler_} from 'angular2/src/core/linker/compiler';
import {HostViewFactoryRef, HostViewFactoryRef_} from 'angular2/src/core/linker/view_ref';
import {TemplateCompiler} from './template_compiler';

import {Injectable} from 'angular2/src/core/di';
import {Type} from 'angular2/src/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';

export abstract class RuntimeCompiler extends Compiler {
  abstract compileInHost(componentType: Type): Promise<HostViewFactoryRef>;
  abstract clearCache();
}

@Injectable()
export class RuntimeCompiler_ extends Compiler_ implements RuntimeCompiler {
  constructor(private _templateCompiler: TemplateCompiler) { super(); }

  compileInHost(componentType: Type): Promise<HostViewFactoryRef_> {
    return this._templateCompiler.compileHostComponentRuntime(componentType)
        .then(hostViewFactory => new HostViewFactoryRef_(hostViewFactory));
  }

  clearCache() {
    super.clearCache();
    this._templateCompiler.clearCache();
  }
}

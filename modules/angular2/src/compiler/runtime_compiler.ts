import {Compiler, internalCreateProtoView} from 'angular2/src/core/compiler/compiler';
import {ProtoViewRef} from 'angular2/src/core/compiler/view_ref';
import {ProtoViewFactory} from 'angular2/src/core/compiler/proto_view_factory';
import {TemplateCompiler} from './template_compiler';

import {Injectable} from 'angular2/src/core/di';
import {Type} from 'angular2/src/core/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/core/facade/async';
import {CompiledHostTemplate} from 'angular2/src/core/compiler/template_commands';

@Injectable()
export class RuntimeCompiler extends Compiler {
  constructor(protoViewFactory: ProtoViewFactory, private _templateCompiler: TemplateCompiler) {
    super(protoViewFactory);
  }

  compileInHost(componentType: Type): Promise<ProtoViewRef> {
    return this._templateCompiler.compileHostComponentRuntime(componentType)
        .then(compiledHostTemplate => internalCreateProtoView(this, compiledHostTemplate));
  }

  clearCache() {
    super.clearCache();
    this._templateCompiler.clearCache();
  }
}

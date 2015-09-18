import {Compiler} from 'angular2/src/core/compiler/compiler';
import {ProtoViewRef} from 'angular2/src/core/compiler/view_ref';
import {ProtoViewFactory} from 'angular2/src/core/compiler/proto_view_factory';
import {TemplateCompiler} from './template_compiler';

import {Injectable} from 'angular2/src/core/di';
import {Type} from 'angular2/src/core/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/core/facade/async';
import {reflector} from 'angular2/src/core/reflection/reflection';
import {CompiledHostTemplate} from 'angular2/src/core/compiler/template_commands';

@Injectable()
export class RuntimeCompiler extends Compiler {
  constructor(private _protoViewFactory: ProtoViewFactory,
              private _templateCompiler: TemplateCompiler) {
    super();
  }

  private _readTemplate(componentType: Type): Promise<CompiledHostTemplate> {
    var metadatas = reflector.annotations(componentType);
    for (var i = 0; i < metadatas.length; i++) {
      var metadata = metadatas[i];
      if (metadata instanceof CompiledHostTemplate) {
        return PromiseWrapper.resolve(metadata);
      }
    }
    return this._templateCompiler.compileHostComponentRuntime(componentType);
  }

  compileInHost(componentType: Type): Promise<ProtoViewRef> {
    return this._readTemplate(componentType)
        .then(compiledHostTemplate => this._protoViewFactory.createHost(compiledHostTemplate).ref);
  }

  clearCache() {
    this._templateCompiler.clearCache();
    this._protoViewFactory.clearCache();
  }
}

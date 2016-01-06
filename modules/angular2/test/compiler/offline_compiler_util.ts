import {print, IS_DART} from 'angular2/src/facade/lang';
import {OutputEmitter} from 'angular2/src/compiler/output/abstract_emitter';

import {
  OfflineCompiler,
  NormalizedComponentWithViewDirectives,
  SourceModule
} from 'angular2/src/compiler/offline_compiler';
import {TemplateParser} from 'angular2/src/compiler/template_parser';
import {Parser} from 'angular2/src/compiler/expression_parser/parser';
import {Lexer} from 'angular2/src/compiler/expression_parser/lexer';
import {HtmlParser} from 'angular2/src/compiler/html_parser';
import {StyleCompiler} from 'angular2/src/compiler/style_compiler';
import {ViewCompiler} from 'angular2/src/compiler/view_compiler/view_compiler';
import {DirectiveNormalizer} from 'angular2/src/compiler/directive_normalizer';
import {CompilerConfig} from 'angular2/src/compiler/config';
import {createOfflineCompileUrlResolver} from 'angular2/src/compiler/url_resolver';
import {MockSchemaRegistry} from './schema_registry_mock';
import {MODULE_SUFFIX} from 'angular2/src/compiler/util';
import {MockXHR} from 'angular2/src/compiler/xhr_mock';

import {
  CompileDirectiveMetadata,
  CompileTypeMetadata,
  CompileTemplateMetadata
} from 'angular2/src/compiler/compile_metadata';

export class CompA { user: string; }

var THIS_MODULE_PATH = `asset:angular2/test/compiler`;
var THIS_MODULE_URL = `${THIS_MODULE_PATH}/offline_compiler_util${MODULE_SUFFIX}`;

export var compAMetadata = CompileDirectiveMetadata.create({
  isComponent: true,
  selector: 'comp-a',
  type: new CompileTypeMetadata(
      {name: 'CompA', moduleUrl: THIS_MODULE_URL, runtime: CompA, diDeps: []}),
  template: new CompileTemplateMetadata({
    templateUrl: './offline_compiler_compa.html',
    styles: ['.redStyle { color: red; }'],
    styleUrls: ['./offline_compiler_compa.css']
  })
});

function _createOfflineCompiler(xhr: MockXHR, emitter: OutputEmitter): OfflineCompiler {
  var urlResolver = createOfflineCompileUrlResolver();
  xhr.when(`${THIS_MODULE_PATH}/offline_compiler_compa.html`, 'Hello World {{user}}!');
  var htmlParser = new HtmlParser();
  var normalizer = new DirectiveNormalizer(xhr, urlResolver, htmlParser);
  return new OfflineCompiler(
      normalizer,
      new TemplateParser(new Parser(new Lexer()), new MockSchemaRegistry({}, {}), htmlParser, []),
      new StyleCompiler(urlResolver), new ViewCompiler(new CompilerConfig(true, true, true)),
      emitter);
}

export function compileComp(emitter: OutputEmitter,
                            comp: CompileDirectiveMetadata): Promise<string> {
  var xhr = new MockXHR();
  var compiler = _createOfflineCompiler(xhr, emitter);
  var result = compiler.normalizeDirectiveMetadata(comp).then((normComp) => {
    return compiler.compileTemplates([new NormalizedComponentWithViewDirectives(normComp, [], [])])
        .source;
  });
  xhr.flush();
  return result;
}

import {print, isPresent, IS_DART} from '../src/facade/lang';
import {OutputEmitter} from '@angular/compiler/src/output/abstract_emitter';
import {Console} from '../core_private';

import {
  OfflineCompiler,
  NormalizedComponentWithViewDirectives,
  SourceModule
} from '@angular/compiler/src/offline_compiler';
import {TemplateParser} from '@angular/compiler/src/template_parser';
import {Parser} from '@angular/compiler/src/expression_parser/parser';
import {Lexer} from '@angular/compiler/src/expression_parser/lexer';
import {HtmlParser} from '@angular/compiler/src/html_parser';
import {StyleCompiler} from '@angular/compiler/src/style_compiler';
import {ViewCompiler} from '@angular/compiler/src/view_compiler/view_compiler';
import {DirectiveNormalizer} from '@angular/compiler/src/directive_normalizer';
import {CompilerConfig} from '@angular/compiler/src/config';
import {createOfflineCompileUrlResolver} from '@angular/compiler/src/url_resolver';
import {MockSchemaRegistry} from '../testing/schema_registry_mock';
import {MODULE_SUFFIX} from '@angular/compiler/src/util';
import {MockXHR} from '../testing/xhr_mock';
import {ImportGenerator} from '@angular/compiler/src/output/path_util';

import {
  CompileDirectiveMetadata,
  CompileTypeMetadata,
  CompileTemplateMetadata
} from '@angular/compiler/src/compile_metadata';


export class CompA { user: string; }

var THIS_MODULE_PATH = `asset:@angular/lib/compiler/test`;
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
  var config = new CompilerConfig(true, true, true);
  var normalizer = new DirectiveNormalizer(xhr, urlResolver, htmlParser, config);
  return new OfflineCompiler(
      normalizer, new TemplateParser(new Parser(new Lexer(), config), new MockSchemaRegistry({}, {}),
                                     htmlParser, new Console(), []),
      new StyleCompiler(urlResolver), new ViewCompiler(config),
      emitter, xhr);
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

export class SimpleJsImportGenerator implements ImportGenerator {
  getImportPath(moduleUrlStr: string, importedUrlStr: string): string {
    // var moduleAssetUrl = ImportGenerator.parseAssetUrl(moduleUrlStr);
    var importedAssetUrl = ImportGenerator.parseAssetUrl(importedUrlStr);
    if (isPresent(importedAssetUrl)) {
      return `${importedAssetUrl.packageName}/${importedAssetUrl.modulePath}`;
    } else {
      return importedUrlStr;
    }
  }
}

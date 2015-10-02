library angular2.transform.template_compiler.ng_compiler;

import 'package:angular2/src/core/compiler/command_compiler.dart';
import 'package:angular2/src/core/compiler/html_parser.dart';
import 'package:angular2/src/core/compiler/style_compiler.dart';
import 'package:angular2/src/core/compiler/template_compiler.dart';
import 'package:angular2/src/core/compiler/template_normalizer.dart';
import 'package:angular2/src/core/compiler/template_parser.dart';
import 'package:angular2/src/core/change_detection/parser/lexer.dart' as ng;
import 'package:angular2/src/core/change_detection/parser/parser.dart' as ng;
import 'package:angular2/src/core/compiler/schema/dom_element_schema_registry.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/core/change_detection/interfaces.dart';
import 'package:angular2/src/core/compiler/change_detector_compiler.dart';

import 'xhr_impl.dart';
import 'url_resolver.dart';

TemplateCompiler createTemplateCompiler(AssetReader reader,
    {ChangeDetectorGenConfig changeDetectionConfig}) {
  var _xhr = new XhrImpl(reader);
  var _htmlParser = new HtmlParser();
  var _urlResolver = const TransformerUrlResolver();

  var templateParser = new TemplateParser(new ng.Parser(new ng.Lexer()),
      new DomElementSchemaRegistry(), _htmlParser);

  var cdCompiler = changeDetectionConfig != null
      ? new ChangeDetectionCompiler(changeDetectionConfig)
      : null;

  return new TemplateCompiler(
      null /* RuntimeMetadataResolver */,
      new TemplateNormalizer(_xhr, _urlResolver, _htmlParser),
      templateParser,
      new StyleCompiler(_xhr, _urlResolver),
      new CommandCompiler(),
      cdCompiler,
      null /* appId */);
}

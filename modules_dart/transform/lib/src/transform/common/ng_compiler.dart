library angular2.transform.template_compiler.ng_compiler;

import 'package:angular2/src/compiler/command_compiler.dart';
import 'package:angular2/src/compiler/html_parser.dart';
import 'package:angular2/src/compiler/style_compiler.dart';
import 'package:angular2/src/compiler/template_compiler.dart';
import 'package:angular2/src/compiler/template_normalizer.dart';
import 'package:angular2/src/compiler/template_parser.dart';
import 'package:angular2/src/core/change_detection/parser/lexer.dart' as ng;
import 'package:angular2/src/core/change_detection/parser/parser.dart' as ng;
import 'package:angular2/src/compiler/schema/dom_element_schema_registry.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/core/change_detection/interfaces.dart';
import 'package:angular2/src/compiler/change_detector_compiler.dart';
import 'package:angular2/router/router_link_dsl.dart';

import 'xhr_impl.dart';
import 'url_resolver.dart';

TemplateCompiler createTemplateCompiler(AssetReader reader,
    {ChangeDetectorGenConfig changeDetectionConfig}) {
  var _xhr = new XhrImpl(reader);
  var _htmlParser = new HtmlParser();
  var _urlResolver = const TransformerUrlResolver();

  // TODO(yjbanov): add router AST transformer when ready
  var parser = new ng.Parser(new ng.Lexer());
  var templateParser = new TemplateParser(parser,
      new DomElementSchemaRegistry(), _htmlParser, [new RouterLinkTransform(parser)]);

  var cdCompiler = changeDetectionConfig != null
      ? new ChangeDetectionCompiler(changeDetectionConfig)
      : null;

  return new TemplateCompiler(
      null /* RuntimeMetadataResolver */,
      new TemplateNormalizer(_xhr, _urlResolver, _htmlParser),
      templateParser,
      new StyleCompiler(_xhr, _urlResolver),
      new CommandCompiler(),
      cdCompiler);
}

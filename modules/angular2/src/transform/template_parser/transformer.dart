library angular2.src.transform.template_parser.transformer;

import 'dart:async';
import 'package:angular2/src/change_detection/parser/ast.dart';
import 'package:angular2/src/change_detection/parser/lexer.dart';
import 'package:angular2/src/change_detection/parser/parser.dart';
import 'package:angular2/src/core/compiler/pipeline/compile_element.dart';
import 'package:angular2/src/core/compiler/pipeline/compile_pipeline.dart';
import 'package:angular2/src/core/compiler/pipeline/compile_step.dart';
import 'package:angular2/src/core/compiler/pipeline/property_binding_parser.dart';
import 'package:angular2/src/core/compiler/pipeline/text_interpolation_parser.dart';
import 'package:angular2/src/core/compiler/pipeline/view_splitter.dart';
import 'package:angular2/src/dom/dom_adapter.dart';
import 'package:angular2/src/dom/html5lib_adapter.dart';
import 'package:angular2/src/reflection/reflection.dart';
import 'package:angular2/src/reflection/reflection_capabilities.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/formatter.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/options.dart';
import 'package:barback/barback.dart';
import 'package:html5lib/dom.dart' as html;
import 'package:html5lib/parser.dart' as html;
import 'package:path/path.dart' as path;

import 'generator.dart';

class TemplateParser extends Transformer {
  final TransformerOptions options;

  TemplateParser(this.options);

  @override
  bool isPrimary(AssetId id) => id.path.endsWith(DEPS_EXTENSION);

  @override
  Future apply(Transform transform) async {
    log.init(transform);

    Html5LibDomAdapter.makeCurrent();

    try {

//      var doc = html.parse(inlineTemplate);
//      parseTemplate(doc);

      var id = transform.primaryInput.id;
      var reader = new AssetReader.fromTransform(transform);
      var transformedCode = await processTemplates(reader, id);
      transform.addOutput(new Asset.fromString(id, transformedCode));
    } catch (ex, stackTrace) {
      log.logger.error('Parsing ng templates failed.\n'
          'Exception: $ex\n'
          'Stack Trace: $stackTrace');
    }
  }
}

const inlineTemplate =
    '''<div class=\"greeting\">{{greeting}} <span red>world</span>!</div>
<button class=\"changeButton\" (click)=\"changeGreeting()\">
change greeting
</button>
''';

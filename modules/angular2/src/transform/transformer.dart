library angular2.transform;

import 'package:barback/barback.dart';
import 'package:dart_style/dart_style.dart';

import 'directive_linker/transformer.dart';
import 'directive_processor/transformer.dart';
import 'bind_generator/transformer.dart';
import 'reflection_remover/transformer.dart';
import 'template_compiler/transformer.dart';
import 'common/formatter.dart' as formatter;
import 'common/options.dart';
import 'common/options_reader.dart';

export 'common/options.dart';

/// Replaces Angular 2 mirror use with generated code.
class AngularTransformerGroup extends TransformerGroup {
  AngularTransformerGroup._(phases) : super(phases) {
    formatter.init(new DartFormatter());
  }

  factory AngularTransformerGroup(TransformerOptions options) {
    var phases = [
      [new ReflectionRemover(options)],
      [new DirectiveProcessor(options)],
      [new DirectiveLinker()],
      [new BindGenerator(options)],
      [new TemplateCompiler(options)]
    ];
    return new AngularTransformerGroup._(phases);
  }

  factory AngularTransformerGroup.asPlugin(BarbackSettings settings) {
    return new AngularTransformerGroup(parseBarbackSettings(settings));
  }
}

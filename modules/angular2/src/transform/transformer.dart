library angular2.transform;

import 'package:barback/barback.dart';
import 'package:dart_style/dart_style.dart';

import 'directive_linker/transformer.dart';
import 'directive_processor/transformer.dart';
import 'bind_generator/transformer.dart';
import 'reflection_remover/transformer.dart';
import 'template_compiler/transformer.dart';
import 'common/formatter.dart' as formatter;
import 'common/names.dart';
import 'common/options.dart';

export 'common/options.dart';

/// Replaces Angular 2 mirror use with generated code.
class AngularTransformerGroup extends TransformerGroup {
  AngularTransformerGroup._(phases) : super(phases) {
    formatter.init(new DartFormatter());
  }

  factory AngularTransformerGroup(TransformerOptions options) {
    var phases = [[new DirectiveProcessor(options)], [new DirectiveLinker()]];
    if (options.modeName == TRANSFORM_MODE) {
      phases.addAll([
        [new BindGenerator(options)],
        [new TemplateComplier(options)],
        [new ReflectionRemover(options)]
      ]);
    }
    return new AngularTransformerGroup._(phases);
  }

  factory AngularTransformerGroup.asPlugin(BarbackSettings settings) {
    return new AngularTransformerGroup(_parseOptions(settings));
  }
}

TransformerOptions _parseOptions(BarbackSettings settings) {
  var config = settings.configuration;
  return new TransformerOptions(config[ENTRY_POINT_PARAM],
      reflectionEntryPoint: config[REFLECTION_ENTRY_POINT_PARAM],
      modeName: settings.mode.name);
}

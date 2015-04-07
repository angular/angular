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
import 'common/options_reader.dart';

export 'common/options.dart';

/// Replaces Angular 2 mirror use with generated code.
class AngularTransformerGroup extends TransformerGroup {
  AngularTransformerGroup._(phases) : super(phases) {
    formatter.init(new DartFormatter());
  }

  factory AngularTransformerGroup(TransformerOptions options) {
    _validate(options);

    var phases = [[new DirectiveProcessor(options)], [new DirectiveLinker()]];
    if (options.modeName == TRANSFORM_MODE) {
      phases.addAll(
          [[new BindGenerator(options)], [new TemplateCompiler(options)]]);
      // [ReflectionRemover] needs to occur prior to [DirectiveProcessor] and
      // [DirectiveLinker], otherwise their generated code will maintain the
      // transitive import to `dart:mirrors`.
      phases.insert(0, [new ReflectionRemover(options)]);
    }
    return new AngularTransformerGroup._(phases);
  }

  factory AngularTransformerGroup.asPlugin(BarbackSettings settings) {
    return new AngularTransformerGroup(parseBarbackSettings(settings));
  }
}

void _validate(TransformerOptions options) {
  if (options.entryPoints == null) {
    throw new ArgumentError.notNull(ENTRY_POINT_PARAM);
  } else if (options.entryPoints.isEmpty) {
    throw new ArgumentError.value(entryPoints, 'entryPoints');
  }
}

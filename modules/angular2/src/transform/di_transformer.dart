library angular2.src.transform.di_transformer;

import 'package:barback/barback.dart';
import 'package:dart_style/dart_style.dart';

import 'directive_linker/transformer.dart';
import 'directive_processor/transformer.dart';
import 'reflection_remover/transformer.dart';
import 'common/formatter.dart' as formatter;
import 'common/options.dart';
import 'common/options_reader.dart';

export 'common/options.dart';

/// Removes the mirror-based initialization logic and replaces it with static
/// logic.
class DiTransformerGroup extends TransformerGroup {
  DiTransformerGroup._(phases) : super(phases) {
    formatter.init(new DartFormatter());
  }

  factory DiTransformerGroup(TransformerOptions options) {
    var phases = [
      [new ReflectionRemover(options)],
      [new DirectiveProcessor(null)]
    ];
    phases.addAll(new List.generate(
        options.optimizationPhases, (_) => [new EmptyNgDepsRemover()]));
    phases.add([new DirectiveLinker()]);
    return new DiTransformerGroup._(phases);
  }

  factory DiTransformerGroup.asPlugin(BarbackSettings settings) {
    return new DiTransformerGroup(parseBarbackSettings(settings));
  }
}

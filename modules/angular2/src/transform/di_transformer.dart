library angular2.src.transform.di_transformer;

import 'package:barback/barback.dart';
import 'package:dart_style/dart_style.dart';

import 'directive_linker/transformer.dart';
import 'directive_processor/transformer.dart';
import 'bind_generator/transformer.dart';
import 'reflection_remover/transformer.dart';
import 'common/formatter.dart' as formatter;
import 'common/options.dart';

export 'common/options.dart';

/// Removes the mirror-based initialization logic and replaces it with static
/// logic.
class DiTransformerGroup extends TransformerGroup {
  DiTransformerGroup()
      : super([[new DirectiveProcessor(null)], [new DirectiveLinker()]]) {
    formatter.init(new DartFormatter());
  }

  factory DiTransformerGroup.asPlugin(BarbackSettings settings) {
    return new DiTransformerGroup();
  }
}

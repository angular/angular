library angular2.src.transform;

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
class AngularTransformerGroup extends TransformerGroup {
  AngularTransformerGroup(TransformerOptions options) : super([
        [new DirectiveProcessor(options)],
        [new DirectiveLinker(options)],
        [new BindGenerator(options), new ReflectionRemover(options)]
      ]) {
    formatter.init(new DartFormatter());
  }

  factory AngularTransformerGroup.asPlugin(BarbackSettings settings) {
    return new AngularTransformerGroup(_parseOptions(settings));
  }
}

TransformerOptions _parseOptions(BarbackSettings settings) {
  var config = settings.configuration;
  return new TransformerOptions(config[ENTRY_POINT_PARAM],
      reflectionEntryPoint: config[REFLECTION_ENTRY_POINT_PARAM]);
}

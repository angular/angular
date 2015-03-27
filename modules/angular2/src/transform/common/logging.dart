library angular2.transform.common.logging;

import 'package:barback/barback.dart';
import 'package:code_transformers/messages/build_logger.dart';

BuildLogger _logger;

/// Prepares [logger] for use throughout the transformer.
void init(Transform t) {
  _logger = new BuildLogger(t);
}

/// Sets [logger] directly. Used for testing - in general use [init].
void setLogger(BuildLogger logger) {
  _logger = logger;
}

/// The logger the transformer should use for messaging.
BuildLogger get logger {
  if (_logger == null) {
    throw new StateError('Logger never initialized.');
  }
  return _logger;
}

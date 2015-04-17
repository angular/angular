library angular2.transform.common.logging;

import 'dart:async';
import 'package:barback/barback.dart';
import 'package:code_transformers/messages/build_logger.dart';
import 'package:source_span/source_span.dart';

BuildLogger _logger;

/// Prepares {@link logger} for use throughout the transformer.
void init(Transform t) {
  _logger = new BuildLogger(t);
}

/// Sets {@link logger} directly. Used for testing - in general use {@link init}.
void setLogger(BuildLogger logger) {
  _logger = logger;
}

/// The logger the transformer should use for messaging.
BuildLogger get logger {
  if (_logger == null) {
    _logger = new PrintLogger();
  }
  return _logger;
}

class PrintLogger implements BuildLogger {
  @override
  final String detailsUri = '';
  @override
  final bool convertErrorsToWarnings = false;

  void _printWithPrefix(prefix, msg) => print('$prefix: $msg');
  void info(msg, {AssetId asset, SourceSpan span}) =>
      _printWithPrefix('INFO', msg);
  void fine(msg, {AssetId asset, SourceSpan span}) =>
      _printWithPrefix('FINE', msg);
  void warning(msg, {AssetId asset, SourceSpan span}) =>
      _printWithPrefix('WARN', msg);
  void error(msg, {AssetId asset, SourceSpan span}) {
    throw new PrintLoggerError(msg, asset, span);
  }
  Future writeOutput() => null;
  Future addLogFilesFromAsset(AssetId id, [int nextNumber = 1]) => null;
}

class PrintLoggerError extends Error {
  final String message;
  final AssetId asset;
  final SourceSpan span;

  PrintLoggerError(this.message, this.asset, this.span);

  @override
  String toString() {
    return 'Message: ${Error.safeToString(message)}, '
        'Asset: ${Error.safeToString(asset)}, '
        'Span: ${Error.safeToString(span)}.';
  }
}

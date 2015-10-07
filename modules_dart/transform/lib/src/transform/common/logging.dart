library angular2.transform.common.logging;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/messages/build_logger.dart';
import 'package:source_span/source_span.dart';

typedef _SimpleCallback();

// The key used to store the logger on the current zone.
final _key = #loggingZonedLoggerKey;

/// Executes {@link fn} inside a new {@link Zone} with its own logger.
Future<dynamic> initZoned(Transform t, _SimpleCallback fn) =>
    setZoned(new BuildLogger(t), fn);

Future<dynamic> setZoned(BuildLogger logger, _SimpleCallback fn) async {
  return runZoned(() async {
    try {
      return await fn();
    } on AnalyzerError catch (e) {
      // Do not worry about printing the stack trace, barback will handle that
      // on its own when it catches the rethrown exception.
      logger
          .error('  Failed with ${e.runtimeType}\n${_friendlyError(e.error)}');
      rethrow;
    } on AnalyzerErrorGroup catch (eGroup) {
      // See above re: stack trace.
      var numErrors = eGroup.errors.length;
      if (numErrors == 1) {
        logger.error(_friendlyError(eGroup.errors[0].error));
      } else {
        var buf = new StringBuffer();
        buf.writeln('  Failed with ${numErrors} errors');
        for (var i = 0; i < numErrors; ++i) {
          buf.writeln(
              'Error ${i + 1}: ${_friendlyError(eGroup.errors[i].error)}');
        }
        logger.error('$buf');
      }
      rethrow;
    }
  }, zoneValues: {_key: logger});
}

/// The logger for the current {@link Zone}.
BuildLogger get logger {
  var current = Zone.current[_key] as BuildLogger;
  return current == null ? new PrintLogger() : current;
}

/// Writes a log entry at `LogLevel.FINE` granularity with the time taken by
/// `asyncOperation`.
///
/// Returns the result of executing `asyncOperation`.
Future logElapsedAsync(Future asyncOperation(),
    {String operationName: 'unknown', AssetId assetId}) async {
  final timer = new Stopwatch()..start();
  final result = await asyncOperation();
  timer.stop();
  final buf =
      new StringBuffer('[$operationName] took ${timer.elapsedMilliseconds} ms');
  if (assetId != null) {
    buf.write(' on $assetId');
  }
  logger.fine(buf.toString(), asset: assetId);
  return result;
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

/// Generate a human-readable error message from `error`.
String _friendlyError(AnalysisError error) {
  if (error.source != null) {
    var file =
        new SourceFile(error.source.contents.data, url: error.source.fullName);

    return file
        .span(error.offset, error.offset + error.length)
        .message(error.message, color: false);
  } else {
    return '<unknown location>: ${error.message}';
  }
}

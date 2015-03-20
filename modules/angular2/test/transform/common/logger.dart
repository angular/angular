library angular2.test.transform.common.logger;

import 'package:code_transformers/messages/build_logger.dart';

class NullLogger implements BuildLogger {
  const NullLogger();
  void info(String message, {AssetId asset, SourceSpan span}) {}
  void fine(String message, {AssetId asset, SourceSpan span}) {}
  void warning(String message, {AssetId asset, SourceSpan span}) {}
  void error(String message, {AssetId asset, SourceSpan span}) {
    throw new NullLoggerError(message, asset, span);
  }
  Future writeOutput() => null;
  Future addLogFilesFromAsset(AssetId id, [int nextNumber = 1]) => null;
}

class NullLoggerError extends Error {
  final String message;
  final AssetId asset;
  final SourceSpan span;

  NullLoggerError(message, asset, span);
}

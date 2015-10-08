library angular2.test.transform.common.read_file;

import 'package:barback/barback.dart';
import 'package:code_transformers/messages/build_logger.dart';
import 'package:source_span/source_span.dart';

class RecordingLogger implements BuildLogger {
  @override
  final String detailsUri = '';
  @override
  final bool convertErrorsToWarnings = false;

  bool hasErrors = false;

  List<String> logs = [];

  void _record(prefix, msg) => logs.add('$prefix: $msg');

  void info(msg, {AssetId asset, SourceSpan span}) => _record('INFO', msg);

  void fine(msg, {AssetId asset, SourceSpan span}) => _record('FINE', msg);

  void warning(msg, {AssetId asset, SourceSpan span}) => _record('WARN', msg);

  void error(msg, {AssetId asset, SourceSpan span}) {
    hasErrors = true;
    _record('ERROR', msg);
  }

  Future writeOutput() => throw new UnimplementedError();
  Future addLogFilesFromAsset(AssetId id, [int nextNumber = 1]) =>
      throw new UnimplementedError();
}

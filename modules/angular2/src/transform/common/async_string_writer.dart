library angular2.transform.common.async_string_writer;

import 'dart:async';
import 'package:analyzer/src/generated/java_core.dart';

/// [PrintWriter] implementation that allows asynchronous printing via
/// [asyncPrint] and [asyncToString]. See those methods for details.
class AsyncStringWriter extends PrintWriter {
  /// All [Future]s we are currently waiting on.
  final List<Future<String>> _awaiting = <Future<String>>[];
  final List<StringBuffer> _bufs;
  StringBuffer _curr;

  AsyncStringWriter._(StringBuffer curr)
      : _curr = curr,
        _bufs = <StringBuffer>[curr];

  AsyncStringWriter() : this._(new StringBuffer());

  void print(x) {
    _curr.write(x);
  }

  /// Adds the result of `futureText` to the writer at the current position
  /// in the string being built. If using this method, you must use
  /// [asyncToString] instead of [toString] to get the value of the writer or
  /// your string may not appear as expected.
  void asyncPrint(Future<String> futureText) {
    var myBuf = _curr;
    _curr = new StringBuffer();
    _bufs.add(_curr);
    _awaiting.add(futureText);
    futureText
        .then(myBuf.write)
        .whenComplete(() => _awaiting.remove(futureText));
  }

  /// Waits for any values added via [asyncPrint] and returns the fully
  /// built string.
  Future<String> asyncToString() async {
    // Save length in case it is updated while we wait.
    var bufLen = _bufs.length;
    if (bufLen == 1) return '$_curr';
    await Future.wait(_awaiting);

    _curr = _bufs.first;
    for (var i = 1; i < bufLen; ++i) {
      _curr.write('${_bufs[i]}');
    }
    _bufs.removeRange(1, bufLen);
    return '$_curr';
  }

  String toString() => _bufs.map((buf) => '$buf').join('(async gap)');
}

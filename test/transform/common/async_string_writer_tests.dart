library angular2.test.transform.common.async_string_writer;

import 'dart:async';
import 'package:angular2/src/transform/common/async_string_writer.dart';
import 'package:guinness/guinness.dart';

void allTests() {
  it('should function as a basic Writer without async calls.', () {
    var writer = new AsyncStringWriter();
    writer.print('hello');
    expect('$writer').toEqual('hello');
    writer.println(', world');
    expect('$writer').toEqual('hello, world\n');
  });

  it('should concatenate futures added with `asyncPrint`.', () async {
    var writer = new AsyncStringWriter();
    writer.print('hello');
    expect('$writer').toEqual('hello');
    writer.asyncPrint(new Future.value(', world.'));
    writer.print(' It is a beautiful day.');
    expect(await writer.asyncToString())
        .toEqual('hello, world. It is a beautiful day.');
  });

  it('should concatenate multiple futures regardless of order.', () async {
    var completer1 = new Completer<String>();
    var completer2 = new Completer<String>();

    var writer = new AsyncStringWriter();
    writer.print('hello');
    expect('$writer').toEqual('hello');
    writer.asyncPrint(completer1.future);
    writer.asyncPrint(completer2.future);

    completer2.complete(' It is a beautiful day.');
    completer1.complete(', world.');

    expect(await writer.asyncToString())
        .toEqual('hello, world. It is a beautiful day.');
  });

  it('should allow multiple "rounds" of `asyncPrint`.', () async {
    var writer = new AsyncStringWriter();
    writer.print('hello');
    expect('$writer').toEqual('hello');
    writer.asyncPrint(new Future.value(', world.'));
    expect(await writer.asyncToString()).toEqual('hello, world.');

    writer.asyncPrint(new Future.value(' It is '));
    writer.asyncPrint(new Future.value('a beautiful '));
    writer.asyncPrint(new Future.value('day.'));

    expect(await writer.asyncToString())
        .toEqual('hello, world. It is a beautiful day.');
  });

  it('should handle calls to async methods while waiting.', () {
    var completer1 = new Completer<String>();
    var completer2 = new Completer<String>();

    var writer = new AsyncStringWriter();
    writer.print('hello');
    expect('$writer').toEqual('hello');

    writer.asyncPrint(completer1.future);
    var f1 = writer.asyncToString().then((result) {
      expect(result).toEqual('hello, world.');
    });

    writer.asyncPrint(completer2.future);
    var f2 = writer.asyncToString().then((result) {
      expect(result).toEqual('hello, world. It is a beautiful day.');
    });

    completer1.complete(', world.');
    completer2.complete(' It is a beautiful day.');

    return Future.wait([f1, f2]);
  });

  it(
      'should handle calls to async methods that complete in reverse '
      'order while waiting.', () {
    var completer1 = new Completer<String>();
    var completer2 = new Completer<String>();

    var writer = new AsyncStringWriter();
    writer.print('hello');
    expect('$writer').toEqual('hello');

    writer.asyncPrint(completer1.future);
    var f1 = writer.asyncToString().then((result) {
      expect(result).toEqual('hello, world.');
    });

    writer.asyncPrint(completer2.future);
    var f2 = writer.asyncToString().then((result) {
      expect(result).toEqual('hello, world. It is a beautiful day.');
    });

    completer2.complete(' It is a beautiful day.');
    completer1.complete(', world.');

    return Future.wait([f1, f2]);
  });
}

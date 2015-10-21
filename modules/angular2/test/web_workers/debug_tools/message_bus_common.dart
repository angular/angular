library angular2.test.web_workers.debug_tools.message_bus_common;

import "dart:convert" show JSON;
import "package:angular2/src/web_workers/shared/message_bus.dart";
import "package:angular2/testing_internal.dart"
    show AsyncTestCompleter, expect, SpyObject;

var MESSAGE = const {'test': 10};
const CHANNEL = "TEST_CHANNEL";

void expectSinkSendsEncodedJson(SpyObject socket, MessageBusSink sink,
    String sendMethodName, AsyncTestCompleter async) {
  socket.spy(sendMethodName).andCallFake((message) {
    expectMessageEquality(message, MESSAGE, CHANNEL);
    async.done();
  });
  sink.to(CHANNEL).add(MESSAGE);
}

void expectMessageEquality(String message, Map expectedData, String channel) {
  expect(JSON.decode(message)).toEqual([
    {'channel': channel, 'message': expectedData}
  ]);
}

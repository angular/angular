library angular2.test.web_workers.debug_tools.single_client_server_message_bus;

import "dart:io";
import "dart:async";
import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        inject,
        describe,
        it,
        expect,
        beforeEach,
        createTestInjector,
        beforeEachBindings,
        SpyObject,
        proxy;
import "package:angular2/src/web_workers/debug_tools/single_client_server_message_bus.dart";
import "./message_bus_common.dart";
import "./spy_web_socket.dart";
import "dart:convert" show JSON;

main() {
  var MESSAGE = const {'test': 10};
  const CHANNEL = "TEST_CHANNEL";
  describe("SingleClientServerMessageBusSink", () {
    it(
        "should send JSON encoded data over the WebSocket",
        inject([AsyncTestCompleter], (async) {
          var socket = new SpyWebSocket();
          var sink = new SingleClientServerMessageBusSink();
          sink.initChannel(CHANNEL, false);

          sink.setConnection(socket);
          expectSinkSendsEncodedJson(socket, sink, "add", async);
        }));

    it(
        "should buffer messages before connect",
        inject([AsyncTestCompleter], (async) {
          var sink = new SingleClientServerMessageBusSink();
          sink.initChannel(CHANNEL, false);
          sink.to(CHANNEL).add(MESSAGE);

          var socket = new SpyWebSocket();
          socket.spy("add").andCallFake((message) {
            expectMessageEquality(message, MESSAGE, CHANNEL);
            async.done();
          });
          sink.setConnection(socket);
        }));

    it(
        "should buffer messages in between disconnect and connect",
        inject([AsyncTestCompleter], (async) {
          var SECOND_MESSAGE = const {'test': 12, 'second': 'hi'};
          var sink = new SingleClientServerMessageBusSink();
          sink.initChannel(CHANNEL, false);

          sink.to(CHANNEL).add(MESSAGE);

          var socket = new SpyWebSocket();
          sink.setConnection(socket);

          int numMessages = 0;

          socket.spy("add").andCallFake((message) {
            numMessages++;
            if (numMessages == 1) {
              expectMessageEquality(message, MESSAGE, CHANNEL);
            } else {
              expectMessageEquality(message, SECOND_MESSAGE, CHANNEL);
              async.done();
            }
          });

          sink.removeConnection();
          sink.to(CHANNEL).add(SECOND_MESSAGE);
          sink.setConnection(socket);
        }));
  });

  describe("SingleClientServerMessageBusSource", () {
    it(
        "should decode JSON messages and emit them",
        inject([AsyncTestCompleter], (async) {
          StreamController<String> controller =
              new StreamController.broadcast();

          var source = new SingleClientServerMessageBusSource();
          source.initChannel(CHANNEL, false);
          source.attachTo(controller.stream);
          source.from(CHANNEL).listen((message) {
            expect(message).toEqual(MESSAGE);
            async.done();
          });

          controller.add(JSON.encode([
            {'channel': CHANNEL, 'message': MESSAGE}
          ]));
        }));
  });
}

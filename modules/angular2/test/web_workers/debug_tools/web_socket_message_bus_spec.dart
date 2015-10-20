library angular2.test.web_workers.debug_tools.web_socket_server_message_bus;

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
import "package:angular2/src/web_workers/debug_tools/web_socket_message_bus.dart";
import "dart:html" show WebSocket, MessageEvent;
import "./message_bus_common.dart";
import "dart:async";
import "dart:convert" show JSON;

main() {
  var MESSAGE = const {'test': 10};
  const CHANNEL = "TEST_CHANNEL";

  describe("WebSocketMessageBusSink", () {
    it(
        "should send JSON encoded data over the WebSocket",
        inject([AsyncTestCompleter], (async) {
          var socket = new SpyWebSocket();
          var sink = new WebSocketMessageBusSink(socket);
          sink.initChannel(CHANNEL, false);
          expectSinkSendsEncodedJson(socket, sink, "send", async);
        }));
  });

  describe("WebSocketMessageBusSource", () {
    it(
        "should decode JSON messages and emit them",
        inject([AsyncTestCompleter], (async) {
          var socket = new SpyWebSocket();
          StreamController<MessageEvent> controller =
              new StreamController.broadcast();
          socket.spy("get:onMessage").andCallFake(() => controller.stream);
          var source = new WebSocketMessageBusSource(socket);
          source.initChannel(CHANNEL, false);

          source.from(CHANNEL).listen((message) {
            expect(message).toEqual(MESSAGE);
            async.done();
          });

          var event = new SpyMessageEvent();
          event.spy("get:data").andCallFake(() => JSON.encode([
                {'channel': CHANNEL, 'message': MESSAGE}
              ]));
          controller.add(event);
        }));
  });
}

@proxy
class SpyMessageEvent extends SpyObject implements MessageEvent {
  SpyMessageEvent() : super(SpyMessageEvent);
  noSuchMethod(m) {
    return super.noSuchMethod(m);
  }
}

@proxy
class SpyWebSocket extends SpyObject implements WebSocket {
  SpyWebSocket() : super(SpyWebSocket);
  noSuchMethod(m) {
    return super.noSuchMethod(m);
  }
}

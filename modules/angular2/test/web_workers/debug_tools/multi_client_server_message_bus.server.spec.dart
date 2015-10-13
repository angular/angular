library angular2.test.web_workers.debug_tools.multi_client_server_message_bus;

import "dart:io";
import "dart:async";
import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        inject,
        describe,
        it,
        iit,
        expect,
        beforeEach,
        createTestInjector,
        beforeEachBindings,
        SpyObject,
        proxy;
import "package:angular2/src/web_workers/debug_tools/multi_client_server_message_bus.dart";
import "package:angular2/src/web_workers/shared/messaging_api.dart";
import "./message_bus_common.dart";
import "./spy_web_socket.dart";
import "dart:convert" show JSON;
import 'dart:math';

main() {
  List<String> messageHistory = new List<String>();
  List<int> resultMarkers = new List<int>();
  describe("MultiClientServerMessageBusSink", () {
    const CHANNEL = "TEST_CHANNEL";
    var MESSAGE = const {'test': 10};

    beforeEach(() {
      messageHistory.clear();
      resultMarkers.clear();
    });

    it(
        "should send messages to all connected clients",
        inject([AsyncTestCompleter], (async) {
          const NUM_CLIENTS = 5;
          var sink = new MultiClientServerMessageBusSink();
          sink.initChannel(CHANNEL, false);
          int numMessagesSent = 0;
          // initialize all the sockets
          var sockets = new List<WebSocketWrapper>(NUM_CLIENTS);
          for (var i = 0; i < sockets.length; i++) {
            var messageSent =
                false; // ensure this socket only receives one message
            var socketWrapper = createSocket(messageHandler: (message) {
              expect(messageSent).toEqual(false);
              messageSent = true;
              expectMessageEquality(message, MESSAGE, CHANNEL);
              numMessagesSent++;
              if (numMessagesSent == NUM_CLIENTS) {
                async.done();
              }
            });
            var socket = socketWrapper.socket;
            sockets[i] =
                new WebSocketWrapper(messageHistory, resultMarkers, socket);
            sink.addConnection(sockets[i]);
          }
          sink.to(CHANNEL).add(MESSAGE);
        }));
  });

  describe("WebSocketWrapper", () {
    beforeEach(() {
      messageHistory.clear();
      resultMarkers.clear();
    });

    /**
     * Generates the given number of random messages, inserts them into messageHistory,
     * and then returns a cloned version of messageHistory
     */
    List<String> generateRandomMessages(int numMessages) {
      const MAX = 1 << 31;
      var random = new Random();
      for (var i = 0; i < numMessages; i++) {
        var message = {'value': random.nextInt(MAX)};
        messageHistory
            .add(JSON.encode([{'channel': CHANNEL, 'message': message}]));
      }
      // copy the message history to ensure the test fails if the wrapper modifies the list
      return new List.from(messageHistory);
    }

    it(
        "should send all messages when there are no markers",
        inject([AsyncTestCompleter], (async) {
          const NUM_MESSAGES = 10;
          var messageHistoryClone = generateRandomMessages(NUM_MESSAGES);

          int numMessagesSent = 0;
          var socketWrapper = createSocket(messageHandler: (message) {
            expect(message).toEqual(messageHistoryClone[numMessagesSent]);
            //expectMessageEquality(message, expected, CHANNEL);
            numMessagesSent++;
            if (numMessagesSent == messageHistoryClone.length) {
              async.done();
            }
          });
          var wrapper = new WebSocketWrapper(
              messageHistory, resultMarkers, socketWrapper.socket);
          wrapper.sendToMarker(0);
        }));

    it(
        "should send between two markers",
        inject([AsyncTestCompleter], (async) {
          const NUM_MESSAGES = 50;
          const FIRST_MARKER = 5;
          const SECOND_MARKER = 15;
          var messageHistoryClone = generateRandomMessages(NUM_MESSAGES);

          int numMessagesSent = 0;
          resultMarkers.add(FIRST_MARKER);
          resultMarkers.add(SECOND_MARKER);
          var socketWrapper = createSocket(messageHandler: (message) {
            expect(message)
                .toEqual(messageHistoryClone[FIRST_MARKER + numMessagesSent]);
            numMessagesSent++;
            if (numMessagesSent == SECOND_MARKER - FIRST_MARKER) {
              async.done();
            }
          });
          var wrapper = new WebSocketWrapper(
              messageHistory, resultMarkers, socketWrapper.socket);
          wrapper.sendToMarker(1);
        }));
  });

  describe("MultiClientServerMessageBusSource", () {
    beforeEach(() {
      messageHistory.clear();
      resultMarkers.clear();
    });

    void sendMessage(StreamController controller, dynamic message) {
      controller.add(JSON.encode([message]));
    }

    void testForwardingMessages(bool primary, bool events, Function done) {
      var result = createSocket();
      var controller = result.controller;
      var socket =
          new WebSocketWrapper(messageHistory, resultMarkers, result.socket);
      socket.setPrimary(primary);

      var source = new MultiClientServerMessageBusSource();
      source.addConnection(socket);

      var channel = events ? EVENT_CHANNEL : CHANNEL;
      source.initChannel(channel, false);
      source.from(channel).listen((message) {
        expect(message).toEqual(MESSAGE);
        done();
      });

      var message = {'channel': channel, 'message': MESSAGE};
      sendMessage(controller, message);
    }

    it(
        "should forward messages from the primary",
        inject([AsyncTestCompleter], (async) {
          testForwardingMessages(true, false, async.done);
        }));

    it(
        "should forward event channel messages from non primaries",
        inject([AsyncTestCompleter], (async) {
          testForwardingMessages(false, true, async.done);
        }));

    it(
        "should forward event channel messages from the primary",
        inject([AsyncTestCompleter], (async) {
          testForwardingMessages(true, true, async.done);
        }));

    it(
        "should mark results from the primary",
        inject([AsyncTestCompleter], (async) {
          var result = createSocket();
          var controller = result.controller;
          var socket = new WebSocketWrapper(
              messageHistory, resultMarkers, result.socket);
          socket.setPrimary(true);

          var source =
              new MultiClientServerMessageBusSource();
          source.onResult.listen((result) => async.done());
          source.initChannel(CHANNEL, false);
          source.addConnection(socket);

          var message = {
            'channel': CHANNEL,
            'message': {'type': 'result'}
          };
          sendMessage(controller, message);
        }));
  });
}

/**
 * Returns a new SpyWebSocket that calls messageHandler when a new message is sent.
 * Also returns a StreamController instance that you can use to send messages to anything
 * that is subscribed to this socket.
 */
SpySocketWrapper createSocket({Function messageHandler}) {
  var socket = new SpyWebSocket();
  if (messageHandler != null) {
    socket.spy("add").andCallFake(messageHandler);
  }

  var controller = new StreamController<String>.broadcast();
  socket.spy("asBroadcastStream").andCallFake(() => controller.stream);
  return new SpySocketWrapper(socket, controller);
}

class SpySocketWrapper {
  SpyWebSocket socket;
  StreamController controller;

  SpySocketWrapper(this.socket, this.controller);
}

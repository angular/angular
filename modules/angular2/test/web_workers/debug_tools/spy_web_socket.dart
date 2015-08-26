/**
 * Contains code shared between all server message bus tests
 */
library angular2.test.web_workers.debug_tools.server_message_bus_common;

import "package:angular2/test_lib.dart";
import "dart:io";

@proxy
class SpyWebSocket extends SpyObject implements WebSocket {
  SpyWebSocket() : super(SpyWebSocket);
  noSuchMethod(m) {
    return super.noSuchMethod(m);
  }
}

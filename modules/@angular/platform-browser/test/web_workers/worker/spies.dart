library web_workers.spies;

import 'package:angular2/src/web_workers/shared/client_message_broker.dart';
import 'package:angular2/src/testing/testing_internal_core.dart';

@proxy
class SpyMessageBroker extends SpyObject implements ClientMessageBroker {}

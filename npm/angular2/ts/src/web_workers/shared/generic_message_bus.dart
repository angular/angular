library angular2.src.web_workers.shared.generic_message_bus;

import 'dart:async';
import 'package:angular2/src/facade/async.dart' show EventEmitter;
import 'package:angular2/src/web_workers/shared/message_bus.dart'
    show MessageBus, MessageBusSink, MessageBusSource;
import 'package:angular2/src/core/zone/ng_zone.dart';
import 'package:angular2/src/facade/lang.dart';
import 'package:angular2/src/facade/exceptions.dart';

class GenericMessageBus implements MessageBus {
  final MessageBusSink _sink;
  final MessageBusSource _source;

  MessageBusSink get sink => _sink;
  MessageBusSource get source => _source;

  GenericMessageBus(MessageBusSink sink, MessageBusSource source)
      : _sink = sink,
        _source = source;

  void attachToZone(NgZone zone) {
    _sink.attachToZone(zone);
    _source.attachToZone(zone);
  }

  void initChannel(String channel, [bool runInZone = true]) {
    _sink.initChannel(channel, runInZone);
    _source.initChannel(channel, runInZone);
  }

  EventEmitter from(String channel) {
    return _source.from(channel);
  }

  EventEmitter to(String channel) {
    return _sink.to(channel);
  }
}

abstract class GenericMessageBusSink implements MessageBusSink {
  NgZone _zone;
  final _channels = new Map<String, _Channel>();
  final _messageBuffer = new List<dynamic>();

  void attachToZone(NgZone zone) {
    _zone = zone;
    _zone.runOutsideAngular(() {
      _zone.onStable.listen((_) {
        if (_messageBuffer.length > 0) {
          sendMessages(_messageBuffer);
          _messageBuffer.clear();
        }
      });
    });
  }

  void initChannel(String channelName, [bool runInZone = true]) {
    if (_channels.containsKey(channelName)) {
      throw new BaseException("${channelName} has already been initialized.");
    }

    var emitter = new EventEmitter();
    var channel = new _Channel(emitter, runInZone);

    emitter.listen((data) {
      var message = {'channel': channelName, 'message': data};
      if (runInZone) {
        _messageBuffer.add(message);
      } else {
        sendMessages([message]);
      }
    });

    _channels[channelName] = channel;
  }

  EventEmitter to(String channelName) {
    if (_channels.containsKey(channelName)) {
      return _channels[channelName].emitter;
    } else {
      throw new BaseException(
          "${channelName} is not set up. Did you forget to call initChannel?");
    }
  }

  void sendMessages(List<dynamic> messages);
}

abstract class GenericMessageBusSource implements MessageBusSource {
  Stream _stream;
  final _channels = new Map<String, _Channel>();
  NgZone _zone;

  Stream get stream => _stream;

  GenericMessageBusSource(Stream stream) {
    attachTo(stream);
  }

  void attachTo(Stream stream) {
    _stream = stream;
    if (stream != null) {
      stream.listen((messages) {
        List<dynamic> decodedMessages = decodeMessages(messages);
        if (decodedMessages != null) {
          decodedMessages.forEach((message) => _handleMessage(message));
        }
      });
    }
  }

  void attachToZone(NgZone zone) {
    _zone = zone;
  }

  void initChannel(String channelName, [bool runInZone = true]) {
    if (_channels.containsKey(channelName)) {
      throw new BaseException("${channelName} has already been initialized.");
    }

    var emitter = new EventEmitter();
    var channelInfo = new _Channel(emitter, runInZone);
    _channels[channelName] = channelInfo;
  }

  EventEmitter from(String channelName) {
    if (_channels.containsKey(channelName)) {
      return _channels[channelName].emitter;
    } else {
      throw new BaseException(
          "${channelName} is not set up. Did you forget to call initChannel?");
    }
  }

  void _handleMessage(dynamic data) {
    var channelName = data['channel'];
    if (_channels.containsKey(channelName)) {
      var channelInfo = _channels[channelName];
      if (channelInfo.runInZone) {
        _zone.run(() => channelInfo.emitter.add(data['message']));
      } else {
        channelInfo.emitter.add(data['message']);
      }
    }
  }

  List<dynamic> decodeMessages(dynamic message);
}

class _Channel {
  EventEmitter emitter;
  bool runInZone;

  _Channel(this.emitter, this.runInZone);
}

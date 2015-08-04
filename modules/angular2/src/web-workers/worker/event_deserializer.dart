library angular2.src.web_workers.worker.event_deserializer;

class GenericEvent {
  Map<String, dynamic> properties;
  EventTarget _target = null;

  GenericEvent(this.properties);

  bool get bubbles => properties['bubbles'];
  bool get cancelable => properties['cancelable'];
  bool get defaultPrevented => properties['defaultPrevented'];
  int get eventPhase => properties['eventPhase'];
  int get timeStamp => properties['timeStamp'];
  String get type => properties['type'];
  bool get altKey => properties['altKey'];

  int get charCode => properties['charCode'];
  bool get ctrlKey => properties['ctrlKey'];
  int get detail => properties['detail'];
  int get keyCode => properties['keyCode'];
  int get keyLocation => properties['keyLocation'];
  Point get layer => _getPoint('layer');
  int get location => properties['location'];
  bool get repeat => properties['repeat'];
  bool get shiftKey => properties['shiftKey'];

  int get button => properties['button'];
  Point get client => _getPoint('client');
  bool get metaKey => properties['metaKey'];
  Point get offset => _getPoint('offset');
  Point get page => _getPoint('page');
  Point get screen => _getPoint('screen');

  EventTarget get target {
    if (_target != null) {
      return _target;
    } else if (properties.containsKey("target")) {
      _target = new EventTarget(properties['target']);
      return _target;
    } else {
      return null;
    }
  }

  dynamic _getPoint(name) {
    Map<String, dynamic> point = properties[name];
    return new Point(point['x'], point['y'], point['magnitude']);
  }
}

class EventTarget {
  dynamic value;

  EventTarget(Map<String, dynamic> properties) {
    value = properties['value'];
  }
}

class Point {
  int x;
  int y;
  double magnitude;

  Point(this.x, this.y, this.magnitude);
}

GenericEvent deserializeGenericEvent(Map<String, dynamic> serializedEvent) {
  return new GenericEvent(serializedEvent);
}

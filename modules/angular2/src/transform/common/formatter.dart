library angular2.transform.common.formatter;

import 'package:dart_style/dart_style.dart';

import 'logging.dart';

DartFormatter _formatter = null;

void init(DartFormatter formatter) {
  _formatter = formatter;
}

DartFormatter get formatter {
  if (_formatter == null) {
    logger.info('Formatter never initialized, using default formatter.');
    _formatter = new DartFormatter();
  }
  return _formatter;
}

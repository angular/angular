library angular2.dom.htmlAdapter;

import 'abstract_html_adapter.dart';
import 'dom_adapter.dart';
import 'dart:io';

class Html5LibDomAdapter extends AbstractHtml5LibAdapter {
  static void makeCurrent() {
    setRootDomAdapter(new Html5LibDomAdapter());
  }

  logError(error) {
    stderr.writeln('${error}');
  }

  log(error) {
    stdout.writeln('${error}');
  }

  logGroup(error) {
    stdout.writeln('${error}');
  }

  logGroupEnd() {}
}

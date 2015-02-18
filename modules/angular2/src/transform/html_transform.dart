library angular2.src.transform;

import 'dart:async';
import 'package:barback/barback.dart';
import 'package:html5lib/dom.dart' as dom;
import 'package:html5lib/parser.dart' show parse;
import 'package:path/path.dart' as path;

import 'options.dart';

Future transformHtmlEntryPoint(
    TransformerOptions options, Transform transform) {
  // For now at least, [options.htmlEntryPoint], [options.entryPoint], and
  // [options.newEntryPoint] need to be in the same folder.
  // TODO(jakemac): support package urls with [options.entryPoint] or
  // [options.newEntryPoint] in `lib`, and [options.htmlEntryPoint] in another
  // directory.
  var _expectedDir = path.split(options.htmlEntryPoint)[0];
  if (!options.inSameTopLevelDir()) {
    transform.logger.error(
        '${options.htmlEntryPointParam}, ${options.entryPointParam}, and '
        '${options.newEntryPointParam} (if supplied) all must be in the '
        'same top level directory.');
  }

  // The relative path from [options.htmlEntryPoint] to [dartEntry]. You must
  // ensure that neither of these is null before calling this function.
  String _relativeDartEntryPath(String dartEntry) =>
      path.relative(dartEntry, from: path.dirname(options.htmlEntryPoint));

  // Checks if the src of this script tag is pointing at `options.entryPoint`.
  bool _isEntryPointScript(dom.Element script) =>
      path.normalize(script.attributes['src']) ==
          _relativeDartEntryPath(options.entryPoint);

  return transform.primaryInput.readAsString().then((String html) {
    var found = false;
    var doc = parse(html);
    var scripts = doc.querySelectorAll('script[type="application/dart"]');
    for (dom.Element script in scripts) {
      if (!_isEntryPointScript(script)) continue;
      script.attributes['src'] = _relativeDartEntryPath(options.newEntryPoint);
      found = true;
    }
    if (!found) {
      transform.logger.error('Unable to find script for ${options.entryPoint} '
          'in ${options.htmlEntryPoint}.');
    }
    return transform.addOutput(
        new Asset.fromString(transform.primaryInput.id, doc.outerHtml));
  });
}

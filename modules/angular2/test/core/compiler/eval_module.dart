import "dart:isolate";
import "dart:async";

Uri toDartDataUri(String source) {
  return Uri.parse("data:application/dart;charset=utf-8,"
                   "${Uri.encodeComponent(source)}");
}

createIsolateSource(String moduleSource, List<List<String>> moduleImports) {
  var moduleSourceParts = ['import "dart:isolate";'];
  moduleImports.forEach((sourceImport) {
    String modName = sourceImport[0];
    String modAlias = sourceImport[1];
    moduleSourceParts.add("import '${modName}' as ${modAlias};");
  });
  moduleSourceParts.add(moduleSource);
  moduleSourceParts.add("""
main(List args, SendPort replyPort) {
  replyPort.send(run(args));
}
""");
  return moduleSourceParts.join('\n');
}

var timeStamp = new DateTime.now().millisecondsSinceEpoch;

dynamic callModule(dynamic data) { return data.map( (a) => a+1); }

evalModule(String moduleSource, List<List<String>> imports, List args) {
    String source = createIsolateSource(moduleSource, imports);
    Completer completer = new Completer();
    RawReceivePort receivePort;
    receivePort = new RawReceivePort( (message) {
      receivePort.close();
      completer.complete(message);
    });
    // Note: we have a special karma plugin that sends files under
    // urls like /package_1234 as permanently cached.
    // With this, spawning multiple isolates gets faster as Darts does not
    // reload the files from the server.
    var packageRoot = Uri.parse('/packages_${timeStamp}');
    return Isolate.spawnUri(toDartDataUri(source), args, receivePort.sendPort, packageRoot: packageRoot).then( (isolate) {
      RawReceivePort errorPort;
      errorPort = new RawReceivePort( (message) {
        completer.completeError(message);
      });
      isolate.addErrorListener(errorPort.sendPort);
      return completer.future;
    });
}

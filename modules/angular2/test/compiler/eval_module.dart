import "dart:isolate";
import "dart:async";

Uri toDartDataUri(String source) {
  return Uri.parse("data:application/dart;charset=utf-8,"
                   "${Uri.encodeComponent(source)}");
}

createIsolateSource(String moduleSource, List<List<String>> moduleImports) {
  var moduleSourceParts = [];
  moduleImports.forEach((sourceImport) {
    String modName = sourceImport[0];
    String modAlias = sourceImport[1];
    moduleSourceParts.add("import 'package:${modName}.dart' as ${modAlias};");
  });
  moduleSourceParts.add(moduleSource); 
  
  return """
import "dart:isolate";
import "${toDartDataUri(moduleSourceParts.join('\n'))}" as mut;

main(List args, SendPort replyPort) {
  replyPort.send(mut.run(args));
}
""";

} 

var timeStamp = new DateTime.now().millisecondsSinceEpoch;

dynamic callModule(dynamic data) { return data.map( (a) => a+1); }

evalModule(String moduleSource, List<List<String>> moduleImports, List args) {
    String source = createIsolateSource(moduleSource, moduleImports);
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

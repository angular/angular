library tree;

import "package:polymer/polymer.dart";
import "dart:async";

Zone polymerZone;

main() { 
  polymerZone = initPolymer();
  polymerZone.run(() { 
    // code here works most of the time 
    print('init');
    Polymer.onReady.then((_) {
      print('ready');
      // some things must wait until onReady callback is called 
      // for an example look at the discussion linked below 
    });
  }); 
}
import 'package:polymer/polymer.dart';
import './tree-node.dart';
import 'dart:html';
import 'dart:async';
import './main.dart' show polymerZone;


/// Class to represent a collection of Codelab objects.
@CustomTag('root-tree')
class BinaryTree extends PolymerElement {
  static int count = 0;
  @observable TreeNode data = null;
  @observable bool show = true;

  /// Named constructor. Sets initial value of filtered codelabs and sets
  /// the new codelab's level to the default.
  BinaryTree.created() : super.created() {
    generateData();
  }

  void measure(Event event, Object detail, Node sender) {
    Zone.ROOT.run((){
      polymerZone.run((){
        print('Start');
        Stopwatch sw = new Stopwatch();
        sw.start();
        if (show) {
          show = false;
          data = null;
        } else {
          show = true;
          generateData();
        }
        while(deliverChanges()) {
          print('deliverChanges()');
        }
        new Future.value(null).then((_) {
          sw.stop();
          print('microtask: ${sw.elapsedMilliseconds}');    
        });
      });
      print('after zone');
    });
  }
  
  void generateData() {
    var maxDepth = 9;
    var values = count++ % 2 == 0 ?
      ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*'] :
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', '-'];

    data = buildTree(maxDepth, values, 0);
  }

  buildTree(int maxDepth, List<String> values, int curDepth) {
    if (maxDepth == curDepth) return new TreeNode('', null, null);
    return new TreeNode(
        values[curDepth],
        buildTree(maxDepth, values, curDepth+1),
        buildTree(maxDepth, values, curDepth+1));
  }
 }

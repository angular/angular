import 'package:polymer/polymer.dart';
import 'tree-node.dart';

/// Class to represent a collection of Codelab objects.
@CustomTag('binary-tree')
class BinaryTree extends PolymerElement {
  static int count = 0;
  @published @observable TreeNode data = null;

  BinaryTree.created() : super.created() {
  }

}

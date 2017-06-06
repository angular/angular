import 'package:polymer/polymer.dart';

class TreeNode {
  @observable String value;
  @observable TreeNode left;
  @observable TreeNode right;
  TreeNode(this.value, this.left, this.right);
}

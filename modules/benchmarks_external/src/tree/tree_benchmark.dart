// tree benchmark in AngularDart 1.x
library tree_benchmark_ng10;

import 'package:angular/angular.dart';
import 'package:angular/application_factory.dart';
import 'dart:html';

var MAX_DEPTH = 9;

setup() {

  var m = new Module()
    ..bind(CompilerConfig, toValue: new CompilerConfig.withOptions(elementProbeEnabled: false))
    ..bind(ScopeDigestTTL, toFactory: () => new ScopeDigestTTL.value(15), inject: [])
    ..bind(TreeComponent);

  final injector = applicationFactory().addModule(m).run();

  return injector;
}

main() {
  final injector = setup();
  final zone = injector.get(VmTurnZone);
  final rootScope = injector.get(Scope);
  var count = 0;

  destroyDom(_) {
    zone.run(() {
      rootScope.context['initData'] = new TreeNode('');
    });
  }

  createDom(_) {
    zone.run(() {
      var values = count++ % 2 == 0 ?
        ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*'] :
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', '-'];

      rootScope.context['initData'] = buildTree(MAX_DEPTH, values, 0);
    });
  }

  document.querySelector('#destroyDom').addEventListener('click', destroyDom);
  document.querySelector('#createDom').addEventListener('click', createDom);
}

@Component(
  selector: 'tree',
  map: const {'data': '=>data'},
  template: '<span> {{data.value}}'
  '<span ng-if="data.right != null"><tree data=data.right></span>'
  '<span ng-if="data.left != null"><tree data=data.left></span>'
  '</span>'
)
class TreeComponent {
  var data;
}

buildTree(maxDepth, values, curDepth) {
  if (maxDepth == curDepth) return new TreeNode('');
  return new TreeNode(
      values[curDepth],
      buildTree(maxDepth, values, curDepth+1),
      buildTree(maxDepth, values, curDepth+1));
}

class TreeNode {
  var value;
  TreeNode left;
  TreeNode right;
  TreeNode([this.value, this.left, this.right]);
}


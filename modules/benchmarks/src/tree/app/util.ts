import {
  getIntParameter,
  windowProfile,
  windowProfileEnd
} from '@angular/platform-browser/testing/benchmark_util';

export class TreeNode {
  constructor(public value: string, public left: TreeNode, public right: TreeNode) {
  }
}

let treeCreateCount: number;
let maxDepth: number;
let numberData: string[];
let charData: string[];

init();

function init() {
  maxDepth = getIntParameter('depth');
  treeCreateCount = 0;
  numberData = [];
  charData = [];
  for (let i = 0; i<maxDepth; i++) {
    numberData.push(i.toString());
    charData.push(String.fromCharCode('A'.charCodeAt(0) + i));
  }
}

function _buildTree(values: string[], curDepth: number = 0): TreeNode {
  if (maxDepth === curDepth) return new TreeNode('', null, null);
  return new TreeNode(values[curDepth], _buildTree(values, curDepth + 1),
                      _buildTree(values, curDepth + 1));
}

export function emptyTree(): TreeNode {
  return new TreeNode('', null, null);
}

export function buildTree(): TreeNode {
  treeCreateCount++;
  return _buildTree(treeCreateCount % 2 ? numberData : charData);
}

export function profile(create: () => void, destroy: () => void, name: string) {
    return function() {
      windowProfile(name + ' w GC');
      var duration = 0;
      var count = 0;
      while (count++ < 150) {
        (<any>window)['gc']();
        var start = window.performance.now();
        create();
        duration += window.performance.now() - start;
        destroy();
      }
      windowProfileEnd(name + ' w GC');
      window.console.log(`Iterations: ${count}; time: ${duration / count} ms / iteration`);

      windowProfile(name + ' w/o GC');
      duration = 0;
      count = 0;
      while (count++ < 150) {
        var start = window.performance.now();
        create();
        duration += window.performance.now() - start;
        destroy();
      }
      windowProfileEnd(name + ' w/o GC');
      window.console.log(`Iterations: ${count}; time: ${duration / count} ms / iteration`);
    };
  }
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {TreeNode} from '../util';

declare var angular: any;

export function addTreeToModule(mod: any): any {
  return mod
      .directive(
          'tree',
          function() {
            return {
              scope: {data: '='},
              template:
                  `<span ng-style="{'background-color': data.depth % 2 ? '' : 'grey'}"> {{data.value}} </span><tree-if data='data.right'></tree-if><tree-if data='data.left'></tree-if>`
            };
          })
      // special directive for "if" as angular 1.3 does not support
      // recursive components.
      // Cloned from real ngIf directive, but using a lazily created transclude function.
      .directive(
          'treeIf',
          [
            '$compile', '$animate',
            function($compile: any, $animate: any) {
              let transcludeFn: any;
              return {
                transclude: 'element',
                priority: 600,
                terminal: true,
                $$tlb: true,
                link: function($scope: any, $element: any, $attr: any, ctrl: any) {
                  if (!transcludeFn) {
                    const template = '<tree data="' + $attr.data + '"></tree>';
                    transcludeFn = $compile(template);
                  }
                  let childElement: any, childScope: any;
                  $scope.$watch($attr.data, function ngIfWatchAction(value: any) {
                    if (value) {
                      if (!childScope) {
                        childScope = $scope.$new();
                        transcludeFn(childScope, function(clone: any) {
                          childElement = clone;
                          $animate.enter(clone, $element.parent(), $element);
                        });
                      }
                    } else {
                      if (childScope) {
                        childScope.$destroy();
                        childScope = null;
                      }
                      if (childElement) {
                        $animate.leave(childElement);
                        childElement = null;
                      }
                    }
                  });
                }
              };
            }
          ])
      .config([
        '$compileProvider',
        function($compileProvider: any) {
          $compileProvider.debugInfoEnabled(false);
        }
      ]);
}

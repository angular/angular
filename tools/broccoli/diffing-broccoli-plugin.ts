/// <reference path="broccoli.d.ts" />
/// <reference path="../typings/fs-extra/fs-extra.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');
import {TreeDiffer, DiffResult} from './tree-differ';
import stabilizeTree from './broccoli-tree-stabilizer';
let symlinkOrCopy = require('symlink-or-copy');


export {DiffResult} from './tree-differ';


/**
 * Makes writing diffing plugins easy.
 *
 * Factory method that takes a class that implements the DiffingBroccoliPlugin interface and returns
 * an instance of BroccoliTree.
 *
 * @param pluginClass
 * @returns {DiffingPlugin}
 */
export function wrapDiffingPlugin(pluginClass): DiffingPluginWrapperFactory {
  return function() { return new DiffingPluginWrapper(pluginClass, arguments); };
}


export interface DiffingBroccoliPlugin {
  rebuild(diff: DiffResult): (Promise<any>| void);
  cleanup ? () : void;
}


type DiffingPluginWrapperFactory = (inputTrees: (BroccoliTree | BroccoliTree[]), options?) =>
    BroccoliTree;


class DiffingPluginWrapper implements BroccoliTree {
  treeDiffer: TreeDiffer;
  initialized = false;
  wrappedPlugin: DiffingBroccoliPlugin = null;
  inputTree = null;
  inputTrees = null;
  description = null;

  // props monkey-patched by broccoli builder:
  inputPath = null;
  cachePath = null;
  outputPath = null;

  constructor(private pluginClass, private wrappedPluginArguments) {
    if (Array.isArray(wrappedPluginArguments[0])) {
      this.inputTrees = this.stabilizeTrees(wrappedPluginArguments[0]);
    } else {
      this.inputTree = this.stabilizeTree(wrappedPluginArguments[0]);
    }

    this.description = this.pluginClass.name;
  }


  rebuild() {
    try {
      let firstRun = !this.initialized;
      this.init();

      let diffResult = this.treeDiffer.diffTree();
      diffResult.log(!firstRun);

      var rebuildPromise = this.wrappedPlugin.rebuild(diffResult);

      if (rebuildPromise) {
        return (<Promise<any>>rebuildPromise).then(this.relinkOutputAndCachePaths.bind(this));
      }

      this.relinkOutputAndCachePaths();
    } catch (e) {
      e.message = `[${this.description}]: ${e.message}`;
      throw e;
    }
  }


  cleanup() {
    if (this.wrappedPlugin.cleanup) {
      this.wrappedPlugin.cleanup();
    }
  }


  private relinkOutputAndCachePaths() {
    // just symlink the cache and output tree
    fs.rmdirSync(this.outputPath);
    symlinkOrCopy.sync(this.cachePath, this.outputPath);
  }


  private init() {
    if (!this.initialized) {
      let includeExtensions = this.pluginClass.includeExtensions || [];
      let excludeExtensions = this.pluginClass.excludeExtensions || [];
      this.initialized = true;
      this.treeDiffer =
          new TreeDiffer(this.description, this.inputPath, includeExtensions, excludeExtensions);
      this.wrappedPlugin =
          new this.pluginClass(this.inputPath, this.cachePath, this.wrappedPluginArguments[1]);
    }
  }


  private stabilizeTrees(trees: BroccoliTree[]) {
    return trees.map((tree) => this.stabilizeTree(tree));
  }


  private stabilizeTree(tree: BroccoliTree) {
    // Ignore all DiffingPlugins as they are already stable, for others we don't know for sure
    // so we need to stabilize them.
    // Since it's not safe to use instanceof operator in node, we are checking the constructor.name.
    return (tree.constructor['name'] === 'DiffingPluginWrapper') ? tree : stabilizeTree(tree);
  }
}

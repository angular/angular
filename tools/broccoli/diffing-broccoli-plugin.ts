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
  rebuild(diff: (DiffResult | DiffResult[])): (Promise<any>| void);
  cleanup ? () : void;
}


type DiffingPluginWrapperFactory = (inputTrees: (BroccoliTree | BroccoliTree[]), options?) =>
    BroccoliTree;


class DiffingPluginWrapper implements BroccoliTree {
  treeDiffer: TreeDiffer = null;
  treeDiffers: TreeDiffer[] = null;
  initialized = false;
  wrappedPlugin: DiffingBroccoliPlugin = null;
  inputTree = null;
  inputTrees = null;
  description = null;

  // props monkey-patched by broccoli builder:
  inputPath = null;
  inputPaths = null;
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

  private calculateDiff(firstRun: boolean): (DiffResult | DiffResult[]) {
    // TODO(caitp): optionally log trees based on environment variable or
    // command line option. It may be worth logging for trees where elapsed
    // time exceeds some threshold, like 10ms.
    if (this.treeDiffer) {
      return this.treeDiffer.diffTree();
    } else if (this.treeDiffers) {
      return this.treeDiffers.map((treeDiffer) => treeDiffer.diffTree());
    } else {
      throw new Error("Missing TreeDiffer");
    }
  }


  rebuild() {
    try {
      let firstRun = !this.initialized;
      this.init();

      let diffResult = this.calculateDiff(firstRun);

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
      let description = this.description;
      this.initialized = true;
      if (this.inputPaths) {
        this.treeDiffers =
            this.inputPaths.map((inputPath) => new TreeDiffer(
                                    description, inputPath, includeExtensions, excludeExtensions));
      } else if (this.inputPath) {
        this.treeDiffer =
            new TreeDiffer(description, this.inputPath, includeExtensions, excludeExtensions);
      }
      this.wrappedPlugin = new this.pluginClass(this.inputPaths || this.inputPath, this.cachePath,
                                                this.wrappedPluginArguments[1]);
    }
  }


  private stabilizeTrees(trees: BroccoliTree[]) {
    // Prevent extensions to prevent array from being mutated from the outside.
    // For-loop used to avoid re-allocating a new array.
    for (let i = 0; i < trees.length; ++i) {
      trees[i] = this.stabilizeTree(trees[i]);
    }
    return Object.freeze(trees);
  }


  private stabilizeTree(tree: BroccoliTree) {
    // Ignore all DiffingPlugins as they are already stable, for others we don't know for sure
    // so we need to stabilize them.
    // Since it's not safe to use instanceof operator in node, we are checking the constructor.name.
    //
    // New-styler/rebuild trees should always be stable.
    let isNewStyleTree = !!(tree['newStyleTree'] || typeof tree.rebuild === 'function' ||
                            tree['isReadAPICompatTree'] || tree.constructor['name'] === 'Funnel');

    return isNewStyleTree ? tree : stabilizeTree(tree);
  }
}

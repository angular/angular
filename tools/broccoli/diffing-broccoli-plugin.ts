/// <reference path="broccoli.d.ts" />
/// <reference path="../typings/fs-extra/fs-extra.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');
import {TreeDiffer, DiffResult} from './tree-differ';
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
      this.inputTrees = wrappedPluginArguments[0];
    } else {
      this.inputTree = wrappedPluginArguments[0];
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


  private relinkOutputAndCachePaths() {
    // just symlink the cache and output tree
    fs.rmdirSync(this.outputPath);
    symlinkOrCopy.sync(this.cachePath, this.outputPath);
  }


  private init() {
    if (!this.initialized) {
      this.initialized = true;
      this.treeDiffer = new TreeDiffer(this.inputPath);
      this.wrappedPlugin =
          new this.pluginClass(this.inputPath, this.cachePath, this.wrappedPluginArguments[1]);
    }
  }


  cleanup() {
    if (this.wrappedPlugin.cleanup) {
      this.wrappedPlugin.cleanup();
    }
  }
}

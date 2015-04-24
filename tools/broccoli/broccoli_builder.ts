var broccoli = require('broccoli');
var destCopy = require('./broccoli-dest-copy');
var fse = require('fs-extra');
var makeBrowserTree = require('./trees/browser_tree');
var makeNodeTree = require('./trees/node_tree');
var makeDartTree = require('./trees/dart_tree');
var path = require('path');
var printSlowTrees = require('broccoli-slow-trees');

/**
 * Helper for building with broccoli.
 */
export class BroccoliBuilder {
  private builder;
  private broccoliExecuted: {[s: string]: boolean} = {};

  // Named constructors
  static forDevTree(): BroccoliBuilder {
    return new BroccoliBuilder(makeBrowserTree({name: 'dev', typeAssertions: true}),
                               path.join('js', 'dev'));
  }
  static forNodeTree(): BroccoliBuilder {
    return new BroccoliBuilder(makeNodeTree(), path.join('js', 'cjs'));
  }
  static forProdTree(): BroccoliBuilder {
    return new BroccoliBuilder(makeBrowserTree({name: 'prod', typeAssertions: false}),
                               path.join('js', 'prod'));
  }
  static forDartTree(): BroccoliBuilder { return new BroccoliBuilder(makeDartTree(), 'dart'); }

  constructor(tree, private outputRoot: string) {
    if (this.broccoliExecuted[outputRoot]) {
      throw new Error('The broccoli task can be called only once for outputRoot ' + outputRoot);
    }
    this.broccoliExecuted[outputRoot] = true;

    var distPath = path.join('dist', outputRoot);

    // We do a clean build every time to avoid stale outputs.
    // Broccoli's cache folders allow it to remain incremental without reading this dir.
    fse.removeSync(distPath);

    tree = destCopy(tree, 'dist');

    this.builder = new broccoli.Builder(tree);
  }

  doBuild(): Promise<any> {
    return this.builder.build()
        .then(hash =>
              {
                console.log('=== Stats for %s (total: %ds) ===', this.outputRoot,
                            Math.round(hash.totalTime / 1000000) / 1000);
                printSlowTrees(hash.graph);
              })
        .catch(err => {
          console.log(err.toString());
          // Should show file and line/col if present
          if (err.file) {
            console.error('File: ' + err.file);
          }
          if (err.stack) {
            console.error(err.stack);
          }
          throw err;
        });
  }

  buildOnce(): Promise<any> {
    // es6-promise doesn't have finally()
    return (<any>this.doBuild())
        .finally(() =>
                 {
                   this.time('Build cleanup', () => this.builder.cleanup());
                   console.log('=== Done building %s ===', this.outputRoot);
                 })
        .catch(err => {
          console.error('\nBuild failed');
          process.exit(1);
        });
  }

  time(label, work) {
    var start = Date.now();
    work();
    var duration = Date.now() - start;
    console.log("%s: %dms", label, duration);
  }
}

var broccoli = require('broccoli');
var fse = require('fs-extra');
var makeBrowserTree = require('./trees/browser_tree');
var makeNodeTree = require('./trees/node_tree');
var makeDartTree = require('./trees/dart_tree');
var path = require('path');
var printSlowTrees = require('broccoli-slow-trees');
var Q = require('q');


/**
 * BroccoliBuilder facade for all of our build pipelines.
 */
export class AngularBuilder {
  private nodeBuilder: BroccoliBuilder;
  private browserDevBuilder: BroccoliBuilder;
  private browserProdBuilder: BroccoliBuilder;
  private dartBuilder: BroccoliBuilder;


  constructor(private outputPath: string) {}


  public rebuildBrowserDevTree(): Promise<BuildResult> {
    this.browserDevBuilder = this.browserDevBuilder || this.makeBrowserDevBuilder();
    return this.rebuild(this.browserDevBuilder);
  }


  public rebuildBrowserProdTree(): Promise<BuildResult> {
    this.browserProdBuilder = this.browserProdBuilder || this.makeBrowserProdBuilder();
    return this.rebuild(this.browserProdBuilder);
  }


  public rebuildNodeTree(): Promise<BuildResult> {
    this.nodeBuilder = this.nodeBuilder || this.makeNodeBuilder();
    return this.rebuild(this.nodeBuilder);
  }


  public rebuildDartTree(): Promise<BuildResult> {
    this.dartBuilder = this.dartBuilder || this.makeDartBuilder();
    return this.rebuild(this.dartBuilder);
  }


  cleanup(): Promise<any> {
    return Q.all([
      this.nodeBuilder && this.nodeBuilder.cleanup(),
      this.browserDevBuilder && this.browserDevBuilder.cleanup(),
      this.browserProdBuilder && this.browserProdBuilder.cleanup()
    ]);
  }


  private makeBrowserDevBuilder(): BroccoliBuilder {
    let tree = makeBrowserTree({name: 'dev', typeAssertions: true},
                               path.join(this.outputPath, 'js', 'dev'));
    return new broccoli.Builder(tree);
  }


  private makeBrowserProdBuilder(): BroccoliBuilder {
    let tree = makeBrowserTree({name: 'prod', typeAssertions: false},
                               path.join(this.outputPath, 'js', 'prod'));
    return new broccoli.Builder(tree);
  }


  private makeNodeBuilder(): BroccoliBuilder {
    let tree = makeNodeTree(path.join(this.outputPath, 'js', 'cjs'));
    return new broccoli.Builder(tree);
  }


  private makeDartBuilder(): BroccoliBuilder {
    let tree = makeDartTree(path.join(this.outputPath, 'dart'));
    return new broccoli.Builder(tree);
  }


  private rebuild(builder) {
    return builder.build()
        .then((result) => { printSlowTrees(result.graph); })
        .catch((err) => {
          console.error(err.toString());
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
}

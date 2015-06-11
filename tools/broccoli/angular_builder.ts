var broccoli = require('broccoli');
var fs = require('fs');
var makeBrowserTree = require('./trees/browser_tree');
var makeES6Tree = require('./trees/es6_tree');
var makeNodeTree = require('./trees/node_tree');
var makeDartTree = require('./trees/dart_tree');
var path = require('path');
var printSlowTrees = require('broccoli-slow-trees');
var Q = require('q');

/**
 * BroccoliBuilder facade for all of our build pipelines.
 */
export class AngularBuilder {
  private nodeDevBuilder: BroccoliBuilder;
  private nodeProdBuilder: BroccoliBuilder;
  private browserDevBuilder: BroccoliBuilder;
  private browserProdBuilder: BroccoliBuilder;
  private es6DevBuilder: BroccoliBuilder;
  private es6ProdBuilder: BroccoliBuilder;
  private dartBuilder: BroccoliBuilder;
  private outputPath: string;
  private firstResult: BuildResult;

  constructor(public options: AngularBuilderOptions) { this.outputPath = options.outputPath; }


  public rebuildBrowserDevTree(): Promise<BuildResult> {
    this.browserDevBuilder = this.browserDevBuilder || this.makeBrowserDevBuilder();
    return this.rebuild(this.browserDevBuilder, 'js.dev');
  }


  public rebuildBrowserProdTree(): Promise<BuildResult> {
    this.browserProdBuilder = this.browserProdBuilder || this.makeBrowserProdBuilder();
    return this.rebuild(this.browserProdBuilder, 'js.prod');
  }
  
  public rebuildES6DevTree(): Promise<BuildResult> {
    this.es6DevBuilder = this.es6DevBuilder || this.makeES6DevBuilder();
    return this.rebuild(this.es6DevBuilder, 'js.es6.dev');
  }
  
  public rebuildES6ProdTree(): Promise<BuildResult> {
    this.es6ProdBuilder = this.es6ProdBuilder || this.makeES6ProdBuilder();
    return this.rebuild(this.es6ProdBuilder, 'js.es6.prod');
  }

  public rebuildNodeDevTree(): Promise<BuildResult> {
    this.nodeDevBuilder = this.nodeDevBuilder || this.makeNodeDevBuilder();
    return this.rebuild(this.nodeDevBuilder, 'js.cjs.dev');
  }


  public rebuildNodeProdTree(): Promise<BuildResult> {
    this.nodeProdBuilder = this.nodeProdBuilder || this.makeNodeProdBuilder();
    return this.rebuild(this.nodeProdBuilder, 'js.cjs.prod');
  }


  public rebuildDartTree(): Promise<BuildResult> {
    this.dartBuilder = this.dartBuilder || this.makeDartBuilder();
    return this.rebuild(this.dartBuilder, 'dart');
  }


  cleanup(): Promise<any> {
    return Q.all([
      this.nodeDevBuilder && this.nodeDevBuilder.cleanup(),
      this.nodeProdBuilder && this.nodeProdBuilder.cleanup(),
      this.browserDevBuilder && this.browserDevBuilder.cleanup(),
      this.browserProdBuilder && this.browserProdBuilder.cleanup(),
      this.es6DevBuilder && this.es6DevBuilder.cleanup(),
      this.es6ProdBuilder && this.es6ProdBuilder.cleanup()
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
  
  
  private makeES6DevBuilder(): BroccoliBuilder {
    let tree = makeES6Tree({name: 'dev', typeAssertions: true},
                               path.join(this.outputPath, 'js', 'es6', 'dev'));
    return new broccoli.Builder(tree);
  }


  private makeES6ProdBuilder(): BroccoliBuilder {
    let tree = makeES6Tree({name: 'prod', typeAssertions: false},
                               path.join(this.outputPath, 'js', 'es6', 'prod'));
    return new broccoli.Builder(tree);
  }


  private makeNodeDevBuilder(): BroccoliBuilder {
    let tree = makeNodeTree(path.join(this.outputPath, 'js', 'cjs', 'dev'));
    return new broccoli.Builder(tree);
  }

  private makeNodeProdBuilder(): BroccoliBuilder {
    let tree = makeNodeTree(path.join(this.outputPath, 'js', 'cjs', 'prod'));
    return new broccoli.Builder(tree);
  }


  private makeDartBuilder(): BroccoliBuilder {
    let options = {
      outputPath: path.join(this.outputPath, 'dart'),
      dartSDK: this.options.dartSDK,
      logs: this.options.logs
    };
    let tree = makeDartTree(options);
    return new broccoli.Builder(tree);
  }


  private rebuild(builder, name) {
    return builder.build().then(
        (result) => {
          if (!this.firstResult) {
            this.firstResult = result;
          }

          printSlowTrees(result.graph);
          writeBuildLog(result, name);
        },
        (error) => {
          // the build tree is the same during rebuilds, only leaf properties of the nodes change
          // so let's traverse it and get updated values for input/cache/output paths
          if (this.firstResult) {
            writeBuildLog(this.firstResult, name);
          }
          throw error;
        });
  }
}


function writeBuildLog(result: BuildResult, name: string) {
  let logPath = `tmp/build.${name}.log`;
  let prevLogPath = logPath + '.previous';
  let formattedLogContent = JSON.stringify(broccoliNodeToBuildNode(result.graph), null, 2);

  if (fs.existsSync(prevLogPath)) fs.unlinkSync(prevLogPath);
  if (fs.existsSync(logPath)) fs.renameSync(logPath, prevLogPath);
  fs.writeFileSync(logPath, formattedLogContent, {encoding: 'utf-8'});
}


function broccoliNodeToBuildNode(broccoliNode) {
  let tree = broccoliNode.tree.newStyleTree || broccoliNode.tree;

  return new BuildNode(tree.description || tree.constructor.name,
                       tree.inputPath ? [tree.inputPath] : tree.inputPaths, tree.cachePath,
                       tree.outputPath, broccoliNode.subtrees.map(broccoliNodeToBuildNode));
}


class BuildNode {
  constructor(public pluginName: string, public inputPaths: string[], public cachePath: string,
              public outputPath: string, public inputNodes: BroccoliNode[]) {}
}

/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/jasmine/jasmine.d.ts" />

let mockfs = require('mock-fs');
import fs = require('fs');
import {TreeDiffer} from './tree-differ';
import {MergeTrees} from './broccoli-merge-trees';

describe('MergeTrees', () => {
  afterEach(() => mockfs.restore());

  function mergeTrees(inputPaths, cachePath, options) {
    return new MergeTrees(inputPaths, cachePath, options);
  }

  function MakeTreeDiffers(rootDirs) {
    let treeDiffers = rootDirs.map((rootDir) => new TreeDiffer('MergeTrees', rootDir));
    treeDiffers.diffTrees = () => { return treeDiffers.map(tree => tree.diffTree()); };
    return treeDiffers;
  }

  function read(path) { return fs.readFileSync(path, "utf-8"); }

  it('should copy the file from the right-most inputTree with overwrite=true', () => {
    let testDir: any = {
      'tree1': {'foo.js': mockfs.file({content: 'tree1/foo.js content', mtime: new Date(1000)})},
      'tree2': {'foo.js': mockfs.file({content: 'tree2/foo.js content', mtime: new Date(1000)})},
      'tree3': {'foo.js': mockfs.file({content: 'tree3/foo.js content', mtime: new Date(1000)})}
    };
    mockfs(testDir);
    let treeDiffer = MakeTreeDiffers(['tree1', 'tree2', 'tree3']);
    let treeMerger = mergeTrees(['tree1', 'tree2', 'tree3'], 'dest', {overwrite: true});
    treeMerger.rebuild(treeDiffer.diffTrees());
    expect(read('dest/foo.js')).toBe('tree3/foo.js content');

    delete testDir.tree2['foo.js'];
    delete testDir.tree3['foo.js'];
    mockfs(testDir);
    treeMerger.rebuild(treeDiffer.diffTrees());
    expect(read('dest/foo.js')).toBe('tree1/foo.js content');

    testDir.tree2['foo.js'] = mockfs.file({content: 'tree2/foo.js content', mtime: new Date(1000)});
    mockfs(testDir);
    treeMerger.rebuild(treeDiffer.diffTrees());
    expect(read('dest/foo.js')).toBe('tree2/foo.js content');
  });

  it('should throw if duplicates are found during the initial build', () => {
    let testDir: any = {
      'tree1': {'foo.js': mockfs.file({content: 'tree1/foo.js content', mtime: new Date(1000)})},
      'tree2': {'foo.js': mockfs.file({content: 'tree2/foo.js content', mtime: new Date(1000)})},
      'tree3': {'foo.js': mockfs.file({content: 'tree3/foo.js content', mtime: new Date(1000)})}
    };
    mockfs(testDir);
    let treeDiffer = MakeTreeDiffers(['tree1', 'tree2', 'tree3']);
    let treeMerger = mergeTrees(['tree1', 'tree2', 'tree3'], 'dest', {});
    expect(() => treeMerger.rebuild(treeDiffer.diffTrees()))
        .toThrowError("`overwrite` option is required for handling duplicates.");

    testDir = {
      'tree1': {'foo.js': mockfs.file({content: 'tree1/foo.js content', mtime: new Date(1000)})},
      'tree2': {},
      'tree3': {}
    };
    mockfs(testDir);
  });


  it('should throw if duplicates are found during rebuild', () => {
    let testDir = {
      'tree1': {'foo.js': mockfs.file({content: 'tree1/foo.js content', mtime: new Date(1000)})},
      'tree2': {},
      'tree3': {}
    };
    mockfs(testDir);

    let treeDiffer = MakeTreeDiffers(['tree1', 'tree2', 'tree3']);
    let treeMerger = mergeTrees(['tree1', 'tree2', 'tree3'], 'dest', {});
    expect(() => treeMerger.rebuild(treeDiffer.diffTrees())).not.toThrow();


    testDir.tree2['foo.js'] = mockfs.file({content: 'tree2/foo.js content', mtime: new Date(1000)});
    mockfs(testDir);
    expect(() => treeMerger.rebuild(treeDiffer.diffTrees()))
        .toThrowError("`overwrite` option is required for handling duplicates.");
  });
});

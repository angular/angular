/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/jasmine/jasmine.d.ts" />

let mockfs = require('mock-fs');
import fs = require('fs');
import path = require('path');
import {TreeDiffer} from './tree-differ';
import {DiffingFunnel} from './broccoli-funnel';


//describe('DiffingFunnel', () => {
//  afterEach(() => mockfs.restore());
//
//
//  it('should pick all files under the root', () => {
//    let testDir = {
//      'inputTree': {
//        'dir1': {
//          'file-1.txt': mockfs.file({content: 'file-1.txt content', mtime: new Date(1000)}),
//          'file-2.txt': mockfs.file({content: 'file-2.txt content', mtime: new Date(1000)}),
//          'subdir-1': {
//            'file-1.1.txt': mockfs.file({content: 'file-1.1.txt content', mtime: new Date(1000)})
//          },
//          'empty-dir': {}
//        }
//      },
//      'outputTree': {}
//    };
//    mockfs(testDir);
//
//    let funnelTree = funnel('dir1');
//    let treeDiffer = new TreeDiffer('test label', 'dir1');
//    funnelTree.rebuild(treeDiffer.diffTree());
//    //funnelTree.rebuild({
//    //  changedPaths: ['file-1.txt', 'file-2.txt', 'subdir-1/file-1.1.txt'],
//    //  removedPaths: []
//    //});
//
//    expectOutputToBe(['dir1/file-1.txt', 'dir1/file-2.txt', 'dir1/subdir-1/file-1.1.txt']);
//
//    delete testDir.inputTree.dir1['file-1.txt'];
//    mockfs(testDir);
//    funnelTree.rebuild(treeDiffer.diffTree());
//    expectOutputToBe(['dir1/file-2.txt', 'dir1/subdir-1/file-1.1.txt']);
//
//    testDir.inputTree.dir1['subdir-1']['file-1.2.txt'] =
//      mockfs.file({content: 'file-1.2.txt content', mtime: new Date(1000)});
//    mockfs(testDir);
//
//    funnelTree.rebuild(treeDiffer.diffTree());
//    expectOutputToBe(['dir1/file-2.txt', 'dir1/subdir-1/file-1.1.txt',
//      'dir1/subdir-1/file-1.2.txt']);
//  });
//
//
//
//  function funnel(rootDir) {
//    return new DiffingFunnel('inputTree', 'outputTree', [rootDir]);
//  }
//
//  function expectOutputToBe(paths) {
//    paths.forEach(path => {
//      expect(fs.readdirSync('outputTree/' + path)).toBe('inputTree/' + path);
//    });
//  }
//
//  function extractPaths(object) {
//    let files = [];
//
//    Object.keys(object).forEach(segment => {
//      let segmentType = typeof object[segment].getContent;
//      if (segmentType === 'function' || segmentType === 'string') {
//        files.push(segment);
//      }
//    })
//  }
//});

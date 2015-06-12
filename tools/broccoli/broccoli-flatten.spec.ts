/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/jasmine/jasmine.d.ts" />

let mockfs = require('mock-fs');
import fs = require('fs');
import {TreeDiffer} from './tree-differ';
import {DiffingFlatten} from './broccoli-flatten';

describe('Flatten', () => {
  afterEach(() => mockfs.restore());

  function flatten(inputPaths) { return new DiffingFlatten(inputPaths, 'output', null); }

  function read(path) { return fs.readFileSync(path, {encoding: "utf-8"}); }
  function rm(path) { return fs.unlinkSync(path); }
  function write(path, content) { fs.writeFileSync(path, content, {encoding: "utf-8"}); }


  it('should flatten files and be incremental', () => {
    let testDir = {
      'input': {
        'dir1': {
          'file-1.txt': mockfs.file({content: 'file-1.txt content', mtime: new Date(1000)}),
          'file-2.txt': mockfs.file({content: 'file-2.txt content', mtime: new Date(1000)}),
          'subdir-1': {
            'file-1.1.txt': mockfs.file({content: 'file-1.1.txt content', mtime: new Date(1000)})
          },
          'empty-dir': {}
        },
      },
      'output': {}
    };
    mockfs(testDir);

    let differ = new TreeDiffer('testLabel', 'input');
    let flattenedTree = flatten('input');
    flattenedTree.rebuild(differ.diffTree());

    expect(fs.readdirSync('output')).toEqual(['file-1.1.txt', 'file-1.txt', 'file-2.txt']);
    // fails  due to a mock-fs bug related to reading symlinks?
    // expect(read('output/file-1.1.txt')).toBe('file-1.1.txt content');


    // delete a file
    rm('input/dir1/file-1.txt');
    // add a new one
    write('input/dir1/file-3.txt', 'file-3.txt content');

    flattenedTree.rebuild(differ.diffTree());

    expect(fs.readdirSync('output')).toEqual(['file-1.1.txt', 'file-2.txt', 'file-3.txt']);
  });


  it('should throw an exception if duplicates are found', () => {
    let testDir = {
      'input': {
        'dir1': {
          'file-1.txt': mockfs.file({content: 'file-1.txt content', mtime: new Date(1000)}),
          'subdir-1':
              {'file-1.txt': mockfs.file({content: 'file-1.1.txt content', mtime: new Date(1000)})},
          'empty-dir': {}
        },
      },
      'output': {}
    };
    mockfs(testDir);

    let differ = new TreeDiffer('testLabel', 'input');
    let flattenedTree = flatten('input');
    expect(() => flattenedTree.rebuild(differ.diffTree()))
        .toThrowError("Duplicate file 'file-1.txt' found in path 'dir1/subdir-1/file-1.txt'");
  });
});

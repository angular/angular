/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/jasmine/jasmine.d.ts" />

let mockfs = require('mock-fs');
import fs = require('fs');
import {TreeDiffer} from './tree-differ';


describe('TreeDiffer', () => {

  afterEach(() => mockfs.restore());


  describe('diff of changed files', () => {

    it('should list all files but no directories during the first diff', () => {
      let testDir = {
        'dir1': {
          'file-1.txt': mockfs.file({content: 'file-1.txt content', mtime: new Date(1000)}),
          'file-2.txt': mockfs.file({content: 'file-2.txt content', mtime: new Date(1000)}),
          'subdir-1': {
            'file-1.1.txt': mockfs.file({content: 'file-1.1.txt content', mtime: new Date(1000)})
          },
          'empty-dir': {}
        }
      };
      mockfs(testDir);

      let differ = new TreeDiffer('dir1');

      let diffResult = differ.diffTree();

      expect(diffResult.changedPaths)
          .toEqual(['file-1.txt', 'file-2.txt', 'subdir-1/file-1.1.txt']);

      expect(diffResult.removedPaths).toEqual([]);
    });


    it('should return empty diff if nothing has changed', () => {
      let testDir = {
        'dir1': {
          'file-1.txt': mockfs.file({content: 'file-1.txt content', mtime: new Date(1000)}),
          'file-2.txt': mockfs.file({content: 'file-2.txt content', mtime: new Date(1000)}),
          'subdir-1': {
            'file-1.1.txt': mockfs.file({content: 'file-1.1.txt content', mtime: new Date(1000)})
          },
        }
      };
      mockfs(testDir);

      let differ = new TreeDiffer('dir1');

      let diffResult = differ.diffTree();

      expect(diffResult.changedPaths).not.toEqual([]);
      expect(diffResult.removedPaths).toEqual([]);

      diffResult = differ.diffTree();

      expect(diffResult.changedPaths).toEqual([]);
      expect(diffResult.removedPaths).toEqual([]);
    });


    it('should list only changed files during the subsequent diffs', () => {
      let testDir = {
        'dir1': {
          'file-1.txt': mockfs.file({content: 'file-1.txt content', mtime: new Date(1000)}),
          'file-2.txt': mockfs.file({content: 'file-2.txt content', mtime: new Date(1000)}),
          'subdir-1': {
            'file-1.1.txt':
                mockfs.file({content: 'file-1.1.txt content', mtime: new Date(1000)})
          }
        }
      };
      mockfs(testDir);

      let differ = new TreeDiffer('dir1');

      let diffResult = differ.diffTree();

      expect(diffResult.changedPaths)
          .toEqual(['file-1.txt', 'file-2.txt', 'subdir-1/file-1.1.txt']);

      // change two files
      testDir['dir1']['file-1.txt'] = mockfs.file({content: 'new content', mtime: new Date(1000)});
      testDir['dir1']['subdir-1']['file-1.1.txt'] =
          mockfs.file({content: 'file-1.1.txt content', mtime: new Date(9999)});
      mockfs(testDir);

      diffResult = differ.diffTree();

      expect(diffResult.changedPaths).toEqual(['file-1.txt', 'subdir-1/file-1.1.txt']);

      expect(diffResult.removedPaths).toEqual([]);

      // change one file
      testDir['dir1']['file-1.txt'] = mockfs.file({content: 'super new', mtime: new Date(1000)});
      mockfs(testDir);

      diffResult = differ.diffTree();
      expect(diffResult.changedPaths).toEqual(['file-1.txt']);
    });
  });

  describe('diff of new files', () => {

    it('should detect file additions and report them as changed files', () => {
      let testDir = {
        'dir1':
            {'file-1.txt': mockfs.file({content: 'file-1.txt content', mtime: new Date(1000)})}
      };
      mockfs(testDir);

      let differ = new TreeDiffer('dir1');
      differ.diffTree();

      testDir['dir1']['file-2.txt'] = 'new file';
      mockfs(testDir);

      let diffResult = differ.diffTree();
      expect(diffResult.changedPaths).toEqual(['file-2.txt']);
    });
  });


  it('should detect file additions mixed with file changes', () => {
    let testDir = {
      'dir1': {'file-1.txt': mockfs.file({content: 'file-1.txt content', mtime: new Date(1000)})}
    };
    mockfs(testDir);

    let differ = new TreeDiffer('dir1');
    differ.diffTree();

    testDir['dir1']['file-1.txt'] = 'new content';
    testDir['dir1']['file-2.txt'] = 'new file';
    mockfs(testDir);

    let diffResult = differ.diffTree();
    expect(diffResult.changedPaths).toEqual(['file-1.txt', 'file-2.txt']);
  });


  describe('diff of removed files', () => {

    it('should detect file removals and report them as removed files', () => {
      let testDir = {
        'dir1':
            {'file-1.txt': mockfs.file({content: 'file-1.txt content', mtime: new Date(1000)})}
      };
      mockfs(testDir);

      let differ = new TreeDiffer('dir1');
      differ.diffTree();

      delete testDir['dir1']['file-1.txt'];
      mockfs(testDir);

      let diffResult = differ.diffTree();
      expect(diffResult.changedPaths).toEqual([]);
      expect(diffResult.removedPaths).toEqual(['file-1.txt']);
    });
  });


  it('should detect file removals mixed with file changes and additions', () => {
    let testDir = {
      'dir1': {
        'file-1.txt': mockfs.file({content: 'file-1.txt content', mtime: new Date(1000)}),
        'file-2.txt': mockfs.file({content: 'file-1.txt content', mtime: new Date(1000)})
      }
    };

    mockfs(testDir);

    let differ = new TreeDiffer('dir1');
    differ.diffTree();

    testDir['dir1']['file-1.txt'] = 'changed content';
    delete testDir['dir1']['file-2.txt'];
    testDir['dir1']['file-3.txt'] = 'new content';
    mockfs(testDir);

    let diffResult = differ.diffTree();
    expect(diffResult.changedPaths).toEqual(['file-1.txt', 'file-3.txt']);
    expect(diffResult.removedPaths).toEqual(['file-2.txt']);
  });
});

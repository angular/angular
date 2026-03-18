/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatTreeNode} from '@angular/material/tree';
import {By} from '@angular/platform-browser';

import {ObjectTreeExplorerComponent} from './object-tree-explorer.component';
import {FlatNode} from './object-tree-types';
import {PropType} from '../../../../../protocol';

const mockDataSource: FlatNode[] = [
  {
    level: 0,
    expandable: false,
    prop: {
      name: 'foo',
      parent: null,
      descriptor: {
        editable: false,
        containerType: null,
        type: PropType.Unknown,
        expandable: false,
        preview: 'string_val',
        value: [],
      },
    },
  },
  {
    level: 0,
    expandable: false,
    prop: {
      name: 'bar',
      parent: null,
      descriptor: {
        editable: true,
        containerType: null,
        type: PropType.Unknown,
        expandable: false,
        preview: 'editable_string_val',
        value: [],
      },
    },
  },
  {
    level: 1,
    expandable: true,
    prop: {
      name: 'baz',
      parent: null,
      descriptor: {
        editable: false,
        containerType: null,
        type: PropType.Unknown,
        expandable: true,
        preview: 'editable_string_val',
        value: [
          {
            level: 1,
            expandable: false,
            prop: {
              name: 'qux',
              parent: null,
              descriptor: {
                editable: false,
                containerType: null,
                type: PropType.Unknown,
                expandable: false,
                preview: 'false',
                value: [],
              },
            },
          },
        ],
      },
    },
  },
];

describe('ObjectTreeExplorerComponent', () => {
  let component: ObjectTreeExplorerComponent;
  let fixture: ComponentFixture<ObjectTreeExplorerComponent>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(ObjectTreeExplorerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('dataSource', mockDataSource);
    fixture.componentRef.setInput('childrenAccessor', (fl: FlatNode) => fl.prop.descriptor.value);
    fixture.componentRef.setInput('editingEnabled', true);

    await fixture.whenStable();
  });

  it('should throw an error if treeControl and childrenAccessor are missing', async () => {
    await expectAsync(
      (async () => {
        fixture.componentRef.setInput('dataSource', mockDataSource);
        fixture.componentRef.setInput('childrenAccessor', null);
        fixture.componentRef.setInput('treeControl', null);
        await fixture.whenStable();
      })(),
    ).toBeRejectedWithError(
      'The object tree explorer requires a "treeControl" or "childrenAccessor"',
    );
  });

  it('should render property preview if the property is NOT editable', () => {
    const nodes = fixture.debugElement.queryAll(By.directive(MatTreeNode));
    const firstNode = nodes[0];
    const propPreview = firstNode.query(By.css('.non-expandable-node ng-property-preview'));

    expect(propPreview).toBeTruthy();
  });

  it('should enable the property editor if the property is editable', () => {
    const nodes = fixture.debugElement.queryAll(By.directive(MatTreeNode));
    const secondNode = nodes[1];
    const propEditor = secondNode.query(By.css('.non-expandable-node ng-property-editor'));

    expect(propEditor).toBeTruthy();
  });

  it('should render an expandable node if the node is expandable', () => {
    const nodes = fixture.debugElement.queryAll(By.directive(MatTreeNode));
    const thirdNode = nodes[2];
    const expandableWrapper = thirdNode.query(By.css('.expandable-node'));

    expect(expandableWrapper).toBeTruthy();
  });

  it('should NOT render root nodes names when omitRootNodesNames is provided', async () => {
    fixture.componentRef.setInput('omitRootNodesNames', true);
    await fixture.whenStable();

    const nodes = fixture.debugElement.queryAll(By.directive(MatTreeNode));

    for (const node of nodes) {
      const name = node.query(By.css('.node'));
      expect(name).toBeFalsy();
    }
  });
});

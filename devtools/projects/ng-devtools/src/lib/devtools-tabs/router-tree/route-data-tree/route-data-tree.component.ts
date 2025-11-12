/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTreeModule} from '@angular/material/tree';

interface TreeNode {
  name: string;
  value: any;
  preview: string;
  isExpandable: boolean;
  children: TreeNode[];
}

@Component({
  selector: 'ng-route-data-tree',
  templateUrl: './route-data-tree.component.html',
  styleUrls: ['./route-data-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTreeModule, MatIconModule, MatTooltipModule],
})
export class RouteDataTreeComponent {
  readonly data = input.required<any>();

  readonly showViewSourceButton = input(false);

  readonly viewSource = output<string>();

  protected readonly treeData = computed(() => this.buildTree(this.data()));

  protected readonly childrenAccessor = (node: TreeNode): TreeNode[] => node.children;

  private buildTree(data: any): TreeNode[] {
    const isArray = Array.isArray(data);
    const hasKeyValue = isArray && data?.[0]?.key !== undefined;

    if (isArray && hasKeyValue) {
      const obj: Record<string, any> = {};

      for (const item of data) {
        obj[item.key] = item.value;
      }

      return this.buildObjectNodes(obj);
    }

    return isArray ? this.buildArrayNodes(data) : this.buildObjectNodes(data);
  }

  private isObject(value: any): boolean {
    return value !== null && typeof value === 'object';
  }

  private buildArrayNodes(items: any[]): TreeNode[] {
    return items.map((item, index) => this.createNode(`[${index}]`, item));
  }

  private buildObjectNodes(obj: Record<string, any>): TreeNode[] {
    return Object.keys(obj).map((key) => this.createNode(key, obj[key]));
  }

  private createNode(name: string, value: any): TreeNode {
    const isExpandable = this.isObject(value);
    return {
      name,
      value,
      preview: this.getValuePreview(value),
      isExpandable,
      children: isExpandable ? this.buildTree(value) : [],
    };
  }

  protected hasChild = (_: number, node: TreeNode): boolean => node.isExpandable;

  protected handleViewSource(node: TreeNode): void {
    this.viewSource.emit(node.value);
  }

  private getValuePreview(value: any): string {
    const type = typeof value;

    if (type === 'string') return value;
    if (type === 'number' || type === 'boolean') return String(value);
    if (Array.isArray(value)) return `[${value.length}]`;
    if (type === 'object') return `{...}`;

    return String(value);
  }
}

import {Component, computed, signal} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {Tree, TreeItem, TreeItemGroup} from '@angular/aria/tree';

type TreeNode = {
  name: string;
  value: string;
  children?: TreeNode[];
  disabled?: boolean;
  expanded?: boolean;
};

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [Tree, TreeItem, TreeItemGroup, NgTemplateOutlet],
})
export class App {
  readonly nodes: readonly TreeNode[] = [
    {
      name: 'C:',
      value: 'C:',
      expanded: true,
      children: [
        {
          name: 'Program Files/',
          value: 'C:/Program Files',
          children: [
            {name: 'Common Files', value: 'C:/Program Files/Common Files'},
            {name: 'Internet Explorer', value: 'C:/Program Files/Internet Explorer'},
          ],
          expanded: false,
        },
        {
          name: 'Users/',
          value: 'C:/Users',
          children: [
            {name: 'Default', value: 'C:/Users/Default'},
            {name: 'Public', value: 'C:/Users/Public'},
          ],
          expanded: false,
        },
        {
          name: 'Windows/',
          value: 'C:/Windows',
          children: [
            {name: 'System32', value: 'C:/Windows/System32'},
            {name: 'Web', value: 'C:/Windows/Web'},
          ],
          expanded: false,
        },
        {name: 'pagefile.sys', value: 'C:/pagefile.sys'},
        {name: 'swapfile.sys', value: 'C:/swapfile.sys', disabled: true},
      ],
    },
  ];

  readonly selected = signal([]);
  readonly selectedCount = computed(() => this.selected().length);
}

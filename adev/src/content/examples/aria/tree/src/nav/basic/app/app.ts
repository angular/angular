import {Component, signal} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {Tree, TreeItem, TreeItemGroup} from '@angular/aria/tree';

type TreeNode = {
  name: string;
  value: string;
  icon: string;
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
  readonly nodes: TreeNode[] = [
    {
      name: 'Inbox',
      value: 'inbox',
      icon: 'inbox',
    },
    {
      name: 'Sent',
      value: 'sent',
      icon: 'send',
    },
    {
      name: 'Drafts',
      value: 'drafts',
      icon: 'draft',
    },
    {
      name: 'Spam',
      value: 'spam',
      icon: 'report',
    },
    {
      name: 'Trash',
      value: 'trash',
      icon: 'delete',
    },
    {
      name: 'Labels',
      value: 'labels',
      expanded: true,
      icon: 'label',
      children: [
        {name: 'Personal', value: 'folders/personal', icon: 'label'},
        {name: 'Work', value: 'folders/work', icon: 'label'},
        {name: 'Travel', value: 'folders/travel', icon: 'label'},
        {name: 'Receipts', value: 'folders/receipts', icon: 'label'},
      ],
    },
  ];

  readonly selected = signal(['inbox']);
}

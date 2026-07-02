import {Component, signal} from '@angular/core';
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
  readonly nodes: TreeNode[] = [
    {
      name: 'public',
      value: 'public',
      children: [
        {name: 'index.html', value: 'public/index.html'},
        {name: 'favicon.ico', value: 'public/favicon.ico'},
        {name: 'styles.css', value: 'public/styles.css'},
      ],
      expanded: true,
    },
    {
      name: 'src',
      value: 'src',
      children: [
        {
          name: 'app',
          value: 'src/app',
          children: [
            {name: 'app.ts', value: 'src/app/app.ts'},
            {name: 'app.html', value: 'src/app/app.html'},
            {name: 'app.css', value: 'src/app/app.css'},
          ],
          expanded: false,
        },
        {
          name: 'assets',
          value: 'src/assets',
          children: [{name: 'logo.png', value: 'src/assets/logo.png'}],
          expanded: false,
        },
        {
          name: 'environments',
          value: 'src/environments',
          children: [
            {
              name: 'environment.prod.ts',
              value: 'src/environments/environment.prod.ts',
              expanded: false,
            },
            {name: 'environment.ts', value: 'src/environments/environment.ts'},
          ],
          expanded: false,
        },
        {name: 'main.ts', value: 'src/main.ts'},
        {name: 'polyfills.ts', value: 'src/polyfills.ts'},
        {name: 'styles.css', value: 'src/styles.css', disabled: true},
        {name: 'test.ts', value: 'src/test.ts'},
      ],
      expanded: false,
    },
    {name: 'angular.json', value: 'angular.json'},
    {name: 'package.json', value: 'package.json'},
    {name: 'README.md', value: 'README.md'},
  ];

  readonly selected = signal(['angular.json']);
}

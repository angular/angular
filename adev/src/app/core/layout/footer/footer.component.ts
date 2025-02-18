/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExternalLink } from '@angular/docs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'footer[adev-footer]',
  imports: [ExternalLink, RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly links = {
    socialMedia: {
      blog: { href: 'https://medium.com', title: 'Angular blog' },
      x: { href: 'https://twitter.com', title: 'X (formerly Twitter)' },
      youtube: { href: 'https://youtube.com', title: 'YouTube' },
      discord: {
        href: 'https://discord.gg/angular',
        title: 'Join the discussions at Angular Community Discord server.',
      },
      github: { href: 'https://github.com', title: 'GitHub' },
      stackOverflow: {
        href: 'https://stackoverflow.com/questions/tagged/angular',
        title: 'Stack Overflow: where the community answers your technical Angular questions.',
      },
    },
    community: {
      contribute: {
        href: 'https://github.com/angular/angular/blob/main/CONTRIBUTING.md',
        title: 'Contribute to Angular',
      },
      codeOfConduct: {
        href: 'https://github.com/angular/code-of-conduct/blob/main/CODE_OF_CONDUCT.md',
        title: 'Treating each other with respect.',
      },
      reportIssues: {
        href: 'https://github.com/angular/angular/issues',
        title: 'Post issues and suggestions on github.',
      },
      devLibrary: {
        href: 'https://devlibrary.withgoogle.com/products/angular?sort=updated',
        title: "Google's DevLibrary",
      },
      experts: {
        href: 'https://developers.google.com/community/experts/directory?specialization=angular',
        title: 'Angular Google Developer Experts',
      },
    },
    resources: {
      pressKit: {
        routerLink: '/press-kit',
        title: 'Press contacts, logos, and branding.',
      },
      roadmap: { routerLink: '/roadmap', title: 'Roadmap' },
    },
    languages: {
      chineseSimplified: {
        href: 'https://angular.cn/',
        title: '简体中文版',
      },
      chineseTraditional: {
        href: 'https://angular.tw/',
        title: '正體中文版',
      },
      japanese: { href: 'https://angular.jp/', title: '日本語版' },
      korean: { href: 'https://angular.kr/', title: '한국어' },
      greek: {
        href: 'https://angular-gr.web.app',
        title: 'Ελληνικά',
      },
    },
  };
}

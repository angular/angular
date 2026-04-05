import {Component, inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SUB_NAVIGATION_DATA} from '../../routing/sub-navigation-data';
import {flatNavigationData} from '@angular/docs';

@Component({
  selector: 'adev-random',
  standalone: true,
  template: ``,
})
export default class Random implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {
    const allItems = [
      ...flatNavigationData(SUB_NAVIGATION_DATA.docs),
      ...flatNavigationData(SUB_NAVIGATION_DATA.reference),
      ...flatNavigationData(SUB_NAVIGATION_DATA.tutorials),
    ];

    const paths = allItems
      .map((item) => item.path)
      .filter((path): path is string => !!path && !path.startsWith('http'));

    if (paths.length > 0) {
      const randomPath = paths[Math.floor(Math.random() * paths.length)];
      this.router.navigateByUrl(`/${randomPath}`, {replaceUrl: true});
    } else {
      this.router.navigateByUrl('/', {replaceUrl: true});
    }
  }
}

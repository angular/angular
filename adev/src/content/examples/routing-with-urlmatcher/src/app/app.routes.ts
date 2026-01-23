import {Routes, UrlSegment} from '@angular/router';

import {ProfileComponent} from './profile/profile.component';

export const routes: Routes = [
  // #docregion matcher
  {
    matcher: (url) => {
      if (url.length === 1 && url[0].path.match(/^@[\w]+$/gm)) {
        return {consumed: url, posParams: {username: new UrlSegment(url[0].path.slice(1), {})}};
      }

      return null;
    },
    component: ProfileComponent,
  },
  // #enddocregion matcher
];

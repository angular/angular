# Use RouterLink for Navigation

In the app's current state, the entire page refreshes when we click on an internal link that exists within the app. While this may not seem significant with a small app, this can have performance implications for larger pages with more content where users have to redownload assets and run calculations again.

Note: Learn more about [adding routes to your application in the in-depth guide](/guide/routing/common-router-tasks#add-your-routes-to-your-application).

In this activity, you'll learn how to leverage the `RouterLink` directive to make the most use of Angular Router.

<hr>

<docs-workflow>

<docs-step title="Import `RouterLink` directive">

In `app.ts` add the `RouterLink` directive import to the existing import statement from `@angular/router` and add it to the `imports` array of your component decorator.

```ts
...
import {RouterLink, RouterOutlet} from '@angular/router';

@Component({
  imports: [RouterLink, RouterOutlet],
  ...
})
```

</docs-step>

<docs-step title="Add a `routerLink` to template">

To use the `RouterLink` directive, replace the `href` attributes with `routerLink`. Update the template with this change.

```angular-ts
import {RouterLink, RouterOutlet} from '@angular/router';

@Component({
  ...
  template: `
    ...
    <a routerLink="/">Home</a>
    <a routerLink="/user">User</a>
    ...
  `,
  imports: [RouterLink, RouterOutlet],
})
```

</docs-step>

</docs-workflow>

When you click on the links in the navigation now, you should not see any blinking and only the content of the page itself (i.e., `router-outlet`) being changed 🎉

Great job learning about routing with Angular. This is just the surface of the `Router` API, to learn more check out the [Angular Router Documentation](guide/routing).

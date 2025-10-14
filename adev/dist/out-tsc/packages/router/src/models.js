/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Can be returned by a `Router` guard to instruct the `Router` to redirect rather than continue
 * processing the path of the in-flight navigation. The `redirectTo` indicates _where_ the new
 * navigation should go to and the optional `navigationBehaviorOptions` can provide more information
 * about _how_ to perform the navigation.
 *
 * ```ts
 * const route: Route = {
 *   path: "user/:userId",
 *   component: User,
 *   canActivate: [
 *     () => {
 *       const router = inject(Router);
 *       const authService = inject(AuthenticationService);
 *
 *       if (!authService.isLoggedIn()) {
 *         const loginPath = router.parseUrl("/login");
 *         return new RedirectCommand(loginPath, {
 *           skipLocationChange: true,
 *         });
 *       }
 *
 *       return true;
 *     },
 *   ],
 * };
 * ```
 * @see [Routing guide](guide/routing/common-router-tasks#preventing-unauthorized-access)
 *
 * @publicApi
 */
export class RedirectCommand {
  redirectTo;
  navigationBehaviorOptions;
  constructor(redirectTo, navigationBehaviorOptions) {
    this.redirectTo = redirectTo;
    this.navigationBehaviorOptions = navigationBehaviorOptions;
  }
}
//# sourceMappingURL=models.js.map

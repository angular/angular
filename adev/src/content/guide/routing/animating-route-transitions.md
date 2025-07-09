# Animating route transitions

Route transition animations can enhance the user experience by providing smooth visual feedback when users navigate between different views in your application. You can customize the animation timing, effects, and triggers to match your desired design requirements.

## Setting up route animations

Route animations in Angular require several components working together. You'll need to:

1. [Define the animation](#define-the-animation)
2. [Add animation to component](#add-animation-to-component)
3. [Configure route animations](#configure-route-animations)
4. [Enable animations in your application](#enable-animations-in-your-application)

### Define the animation

An animation consists of a TypeScript file that leverages functions from the `@angular/animations` library to configure the transition animation.

Here is an example of a fade transition animation:

```ts
import { trigger, transition, style, query, animate } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    // Set the entering component to be invisible initially
    query(':enter', [
      style({ opacity: 0 })
    ], { optional: true }),

    // Fade out the leaving component
    query(':leave', [
      animate('200ms ease-out', style({ opacity: 0 }))
    ], { optional: true }),

    // Fade in the entering component
    query(':enter', [
      animate('200ms ease-in', style({ opacity: 1 }))
    ], { optional: true })
  ])
]);
```

### Add animation to component

Import the animation and add it to your component. Create a method to prepare the route data for the animation and apply the animation to the router-outlet in the template:

```angular-ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { routeAnimations } from './route-animations';

@Component({
  selector: 'app-root',
  template: `
    <div [@routeAnimations]="prepareRoute(o)" class="route-container">
      <router-outlet #o="outlet" />
    </div>
  `,
  animations: [routeAnimations]
})
export class AppComponent {
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }
}
```

### Configure route animations

Next, you need to add animation data to your routes so the animation can differentiate between them:

```typescript
import { Routes } from '@angular/router';
import { BlogComponent } from './blog/blog.component';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
  { path: 'blog', component: BlogComponent, data: { animation: 'BlogPage' } },
  { path: 'about', component: AboutComponent, data: { animation: 'AboutPage' } }
];
```

### Enable animations in your application

Finally, you add the animations provider to your application configuration with `provideAnimations()`:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations()
  ]
};
```

## Understanding how route animations work

When a user navigates from one route to another, the Angular router maps the URL path to a relevant component and displays its view through the general workflow:

1. User navigates to a new route
2. Angular creates the new component (`:enter` state) for the new route
3. A function (usually named `prepareRoute()`) returns the animation data from the route
4. Animation trigger activates based on the route data
5. Leaving component (`:leave` state) animates
6. Entering component animates
7. Animation completes and the old component is destroyed

The major building blocks of an animation include:

| Animation Function                        | Description                                  |
| ----------------------------------------- | -------------------------------------------- |
| [`trigger`](api/animations/trigger)       | Creates a named animation trigger            |
| [`transition`](api/animations/transition) | Defines when the animation runs              |
| [`style`](api/animations/style)           | Sets CSS styles for animation states         |
| [`query`](api/animations/query)           | Finds elements within the animated component |
| [`group`](api/animations/group)           | Runs multiple animations in parallel         |
| [`animate`](api/animations/animate)       | Applies timing and animation effects         |

## Cookbook

Here is an example of a transition where the route slides from right to left:

```ts
import { trigger, transition, style, query, animateChild, group, animate } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0, transform: 'translateX(100%)' })
    ], { optional: true }),
    query(':leave', animateChild(), { optional: true }),
    group([
      query(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(-100%)' }))
      ], { optional: true }),
      query(':enter', [
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0%)' }))
      ], { optional: true })
    ]),
    query(':enter', animateChild(), { optional: true }),
  ])
]);
```

## Troubleshooting route transitions

If you find that your route transitions aren't behaving as expected, here are some things to consider:

### Animation not working at all

- Ensure you've imported `provideAnimations()` in your app configuration
- Check that the animation trigger name matches between your component and animation file
- Verify that your routes have the `data: { animation: 'RouteName' }` property

### Error: "Cannot read property 'animation' of undefined"

- Make sure all routes have animation data defined
- Use optional chaining in your `prepareRoute` method: `outlet?.activatedRouteData?.animation`

### Components overlap during animation

- Ensure your route container has `position: relative` in CSS
- Consider using `position: absolute` on animated components if needed

### Animation feels choppy or slow

- Try shorter animation durations (100-300ms work well)
- Use `ease-in-out` timing functions for smoother transitions
- Test on different devices and browsers

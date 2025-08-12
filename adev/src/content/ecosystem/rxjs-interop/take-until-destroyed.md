# Unsubscribing with `takeUntilDestroyed`

TIP: This guide assumes you're familiar with [component and directive lifecycle](guide/components/lifecycle).

The `takeUntilDestroyed` operator, from `@angular/core/rxjs-interop`, provides a concise and reliable way to automatically unsubscribe from an Observable when a component or directive is destroyed. This prevents common memory leaks with RxJS subscriptions. It works similarly to the RxJS [`takeUntil`](https://rxjs.dev/api/operators/takeUntil) operator but without the need for a separate Subject.

```typescript
import {Component, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NotificationDispatcher, CustomPopupShower} from './some-shared-project-code';

@Component(/* ... */)
export class UserProfile {
  private dispatcher = inject(NotificationDispatcher);
  private popup = inject(CustomPopupShower);

  constructor() {
    // This subscription the 'notifications' Observable is automatically
    // unsubscribed when the 'UserProfile' component is destroyed.
    const messages: Observable<string> = this.dispatcher.notifications;
    messages.pipe(takeUntilDestroyed()).subscribe(message => {
      this.popup.show(message);
    });
  }
}
```

The `takeUntilDestroyed` operator accepts a single optional [`DestroyRef`](https://angular.dev/api/core/DestroyRef) argument. The operator uses `DestroyRef` to know when the component or directive has been destroyed. You can omit this argument when calling `takeUntilDestroyed` in an [injection context](https://angular.dev/guide/di/dependency-injection-context), typically the constructor of a component or directive. Always provide a `DestroyRef` if your code may call `takeUntilDestroyed` outside of an injection context.

```typescript
@Component(/* ... */)
export class UserProfile {
  private dispatcher = inject(NotificationDispatcher);
  private popup = inject(CustomPopupShower);
  private destroyRef = inject(DestroyRef);

  startListeningToNotifications() {
    // Always pass a `DestroyRef` if you call `takeUntilDestroyed` outside
    // of an injection context.
    const messages: Observable<string> = this.dispatcher.notifications;
    messages.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(message => {
      this.popup.show(message);
    });
  }
}
```

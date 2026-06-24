# Отписка с помощью `takeUntilDestroyed`

СОВЕТ: Это руководство предполагает, что вы знакомы
с [жизненным циклом компонентов и директив](guide/components/lifecycle).

Оператор `takeUntilDestroyed` из `@angular/core/rxjs-interop` предоставляет лаконичный и надежный способ автоматической
отписки от Observable при уничтожении компонента или директивы. Это предотвращает распространенные утечки памяти,
связанные с подписками RxJS. Он работает аналогично оператору RxJS [
`takeUntil`](https://rxjs.dev/api/operators/takeUntil), но не требует создания отдельного Subject.

```typescript
import {Component, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NotificationDispatcher, CustomPopupShower} from './some-shared-project-code';

@Component(/* ... */)
export class UserProfile {
  private dispatcher = inject(NotificationDispatcher);
  private popup = inject(CustomPopupShower);

  constructor() {
    // Эта подписка на Observable 'notifications' автоматически
    // отменяется при уничтожении компонента 'UserProfile'.
    const messages: Observable<string> = this.dispatcher.notifications;
    messages.pipe(takeUntilDestroyed()).subscribe(message => {
      this.popup.show(message);
    });
  }
}
```

Оператор `takeUntilDestroyed` принимает один необязательный аргумент [`DestroyRef`](/api/core/DestroyRef). Оператор
использует `DestroyRef`, чтобы узнать, когда компонент или директива были уничтожены. Вы можете опустить этот аргумент
при вызове `takeUntilDestroyed` в [контексте внедрения](/guide/di/dependency-injection-context), обычно в конструкторе
компонента или директивы. Всегда передавайте `DestroyRef`, если ваш код может вызывать `takeUntilDestroyed` вне
контекста внедрения.

```typescript
@Component(/* ... */)
export class UserProfile {
  private dispatcher = inject(NotificationDispatcher);
  private popup = inject(CustomPopupShower);
  private destroyRef = inject(DestroyRef);

  startListeningToNotifications() {
    // Всегда передавайте `DestroyRef`, если вызываете `takeUntilDestroyed` вне
    // контекста внедрения.
    const messages: Observable<string> = this.dispatcher.notifications;
    messages.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(message => {
      this.popup.show(message);
    });
  }
}
```

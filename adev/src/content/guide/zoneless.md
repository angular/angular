# Angular без ZoneJS (Zoneless)

## Зачем использовать Zoneless? {#why-use-zoneless}

Основные преимущества отказа от ZoneJS как зависимости:

- **Лучшая производительность**: ZoneJS использует DOM-события и асинхронные задачи как индикаторы того, что состояние приложения _могло_ обновиться, и затем запускает синхронизацию приложения — обнаружение изменений во views. ZoneJS не знает, изменилось ли состояние на самом деле, поэтому синхронизация срабатывает чаще, чем нужно.
- **Улучшение Core Web Vitals**: ZoneJS добавляет заметный overhead — и по размеру payload, и по времени старта.
- **Удобнее отладка**: ZoneJS усложняет отладку. Stack traces с ZoneJS труднее читать. Также сложно понять, когда код ломается из‑за выполнения вне Angular Zone.
- **Лучшая совместимость с экосистемой**: ZoneJS патчит browser API, но не имеет патчей для каждого нового API. Некоторые API, например `async`/`await`, нельзя эффективно пропатчить и приходится downlevel'ить для работы с ZoneJS. Иногда библиотеки несовместимы с тем, как ZoneJS патчит нативные API. Отказ от ZoneJS улучшает долгосрочную совместимость, убирая источник сложности, monkey patching и постоянной поддержки.

## Включение Zoneless в приложении {#enabling-zoneless-in-an-application}

В Angular v21+ zoneless — режим по умолчанию, ничего дополнительно включать не нужно. Убедитесь, что нигде не используется `provideZoneChangeDetection`, переопределяющий конфигурацию по умолчанию.

В Angular v20 включите zoneless change detection, добавив `provideZonelessChangeDetection()` при bootstrap:

```ts {header: 'standalone bootstrap'}
bootstrapApplication(MyApp, {providers: [provideZonelessChangeDetection()]});
```

```ts {header: 'NgModule bootstrap'}
platformBrowser().bootstrapModule(AppModule);

@NgModule({
  providers: [provideZonelessChangeDetection()],
})
export class AppModule {}
```

## Удаление ZoneJS {#removing-zonejs}

В zoneless-приложениях ZoneJS следует полностью убрать из сборки, чтобы уменьшить размер бандла. Обычно ZoneJS подключается через опцию `polyfills` в `angular.json` — и в `build`, и в `test`. Удалите `zone.js` и `zone.js/testing` из обоих, чтобы убрать его из сборки. В проектах с явным файлом `polyfills.ts` удалите `import 'zone.js';` и `import 'zone.js/testing';`.

После удаления ZoneJS из сборки зависимость `zone.js` больше не нужна — пакет можно удалить полностью:

```shell
npm uninstall zone.js
```

## Требования совместимости с Zoneless {#requirements-for-zoneless-compatibility}

Angular опирается на уведомления от core API, чтобы понять, когда запускать обнаружение изменений и для каких views.
Эти уведомления включают:

- `ChangeDetectorRef.markForCheck` (вызывается автоматически `AsyncPipe`)
- `ComponentRef.setInput`
- Обновление сигнала, который читается в шаблоне
- Callback'и привязанных host- или template-слушателей
- Присоединение view, помеченного dirty одним из способов выше

### Компоненты, совместимые с `OnPush` {#onpush-compatible-components}

Один из способов убедиться, что компонент использует правильные механизмы уведомлений — использовать [ChangeDetectionStrategy.OnPush](/best-practices/skipping-subtrees#using-onpush).

Стратегия `OnPush` не обязательна, но это рекомендуемый шаг к совместимости с zoneless для компонентов приложения. Для библиотечных компонентов не всегда возможно использовать `ChangeDetectionStrategy.OnPush`.
Если библиотечный компонент — host для пользовательских компонентов, которые могут использовать `ChangeDetectionStrategy.Eager`/`Default`, он не может использовать `OnPush`: это помешало бы обновлению дочернего компонента, если тот не совместим с `OnPush` и полагается на ZoneJS для запуска change detection. Компоненты могут использовать стратегию `Default`, пока уведомляют Angular о необходимости запуска change detection (вызов `markForCheck`, сигналы, `AsyncPipe` и т.д.).
Быть host'ом пользовательского компонента означает использовать API вроде `ViewContainerRef.createComponent`, а не просто размещать часть шаблона пользовательского компонента (то есть проекцию контента или input с template ref).

### Удалите `NgZone.onMicrotaskEmpty`, `NgZone.onUnstable`, `NgZone.isStable` или `NgZone.onStable` {#remove-ngzoneonmicrotaskempty-ngzoneonunstable-ngzoneisstable-or-ngzoneonstable}

Приложениям и библиотекам нужно убрать использование `NgZone.onMicrotaskEmpty`, `NgZone.onUnstable` и `NgZone.onStable`.
Эти Observable никогда не эмитят, когда в приложении включён zoneless change detection.
Аналогично, `NgZone.isStable` всегда будет `true` и не должен использоваться как условие выполнения кода.

`NgZone.onMicrotaskEmpty` и `NgZone.onStable` чаще всего используют, чтобы дождаться завершения change detection перед задачей. Вместо этого их можно заменить на `afterNextRender`, если нужно дождаться одного цикла change detection, или на `afterEveryRender`, если условие может охватывать несколько раундов. В других случаях эти Observable использовали просто потому, что они знакомы и по таймингу похожи на нужное. Вместо них можно использовать более прямые DOM API, например `MutationObserver`, когда нужно дождаться определённого состояния DOM (а не ждать его косвенно через render hooks Angular).

<docs-callout title="NgZone.run and NgZone.runOutsideAngular are compatible with Zoneless">
`NgZone.run` и `NgZone.runOutsideAngular` не нужно удалять для совместимости с Zoneless.
Напротив, удаление этих вызовов может привести к регрессии производительности в библиотеках, которые используются в приложениях, всё ещё зависящих от ZoneJS.
</docs-callout>

### `PendingTasks` для Server Side Rendering (SSR) {#pendingtasks-for-server-side-rendering-ssr}

Если вы используете SSR с Angular, вы можете знать, что он опирается на ZoneJS, чтобы определить, когда приложение «стабильно» и его можно сериализовать. Если есть асинхронные задачи, которые должны отложить сериализацию, приложение без ZoneJS должно сообщить о них Angular через сервис [PendingTasks](/api/core/PendingTasks). Сериализация дождётся первого момента, когда все pending tasks будут сняты.

Два самых простых способа использовать pending tasks — метод `run`:

```typescript
const taskService = inject(PendingTasks);
taskService.run(async () => {
  const someResult = await doSomeWorkThatNeedsToBeRendered();
  this.someState.set(someResult);
});
```

Для более сложных сценариев можно вручную добавить и снять pending task:

```typescript
const taskService = inject(PendingTasks);
const taskCleanup = taskService.add();
try {
  await doSomeWorkThatNeedsToBeRendered();
} catch {
  // handle error
} finally {
  taskCleanup();
}
```

Кроме того, хелпер [pendingUntilEvent](/api/core/rxjs-interop/pendingUntilEvent#) в `rxjs-interop` гарантирует, что приложение остаётся нестабильным, пока Observable не эмитит, не завершится, не ошибётся или не будет отписан.

```typescript
readonly myObservableState = someObservable.pipe(pendingUntilEvent());
```

Фреймворк также использует этот сервис внутри, чтобы отложить сериализацию до завершения асинхронных задач. В том числе — незавершённая навигация Router и незавершённый запрос `HttpClient`.

### Reactive forms в zoneless-приложениях {#reactive-forms-in-zoneless-applications}

Обновления модели reactive forms (`setValue`, `patchValue`, `FormArray.push` и похожие API) обновляют состояние формы и эмитят form Observables, но автоматически не планируют change detection компонента.

Если шаблон зависит от состояния reactive forms, свяжите Observables форм с уведомлением change detection (например, `ChangeDetectorRef.markForCheck()`) или отразите данные через сигналы, которые потребляет шаблон.

## Тестирование и отладка {#testing-and-debugging}

### Использование Zoneless в `TestBed` {#using-zoneless-in-testbed}

`TestBed` по умолчанию использует Zone-based change detection, когда `zone.js` загружен через `polyfills`.

Если `zone.js` отсутствует, `TestBed` по умолчанию работает в zoneless. Чтобы принудительно включить zoneless при загруженном `zone.js`, добавьте `provideZonelessChangeDetection()`:

```typescript
TestBed.configureTestingModule({
  // Optional: include the provider to force the testing environment
  // uses the same zoneless behavior as a zoneless application.
  providers: [provideZonelessChangeDetection()],
});

const fixture = TestBed.createComponent(MyComponent);
await fixture.whenStable();
```

Чтобы поведение тестов было максимально близко к production, по возможности избегайте `fixture.detectChanges()`. Этот вызов принудительно запускает change detection, когда Angular мог бы его не планировать. Тесты должны убедиться, что уведомления происходят, и позволить Angular самому решать, когда синхронизировать состояние, а не форсировать это вручную.

В существующих наборах тестов `fixture.detectChanges()` — распространённый паттерн, и, скорее всего, не стоит тратить усилия на перевод всех таких мест на `await fixture.whenStable()`. `TestBed` по-прежнему будет требовать совместимость компонента fixture с `OnPush` и выбрасывать `ExpressionChangedAfterItHasBeenCheckedError`, если значения шаблона обновились без уведомления об изменении (например, `fixture.componentInstance.someValue = 'newValue';`).
Если компонент используется в production, проблему нужно решать: перевести состояние на сигналы или вызывать `ChangeDetectorRef.markForCheck()`.
Если компонент — только тестовая обёртка и никогда не используется в приложении, допустимо вызвать `fixture.changeDetectorRef.markForCheck()`.

### Проверка в debug-режиме, что обновления обнаруживаются {#debug-mode-check-to-ensure-updates-are-detected}

Angular также предоставляет дополнительный инструмент, чтобы проверить, что приложение обновляет состояние способом, совместимым с zoneless. `provideCheckNoChangesConfig({exhaustive: true, interval: <milliseconds>})` можно использовать для периодической проверки: нет ли обновлённых привязок без уведомления. Angular выбросит `ExpressionChangedAfterItHasBeenCheckedError`, если есть обновлённая привязка, которую zoneless change detection не обновил бы.

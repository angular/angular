# Angular без ZoneJS (Zoneless) {#angular-without-zonejs-zoneless}

## Зачем использовать Zoneless? {#why-use-zoneless}

Основные преимущества удаления ZoneJS как зависимости:

- **Улучшенная производительность**: ZoneJS использует DOM-события и асинхронные задачи как индикаторы возможного обновления состояния приложения и запускает синхронизацию приложения для обнаружения изменений в представлениях. ZoneJS не знает, действительно ли изменилось состояние приложения, поэтому синхронизация запускается чаще, чем необходимо.
- **Улучшенные Core Web Vitals**: ZoneJS привносит значительные накладные расходы как по размеру полезной нагрузки, так и по стоимости времени запуска.
- **Улучшенный опыт отладки**: ZoneJS усложняет отладку кода. Трассировки стека труднее понять с ZoneJS. Также сложно понять, когда код нарушается из-за выполнения вне Angular Zone.
- **Лучшая совместимость с экосистемой**: ZoneJS работает путём патчинга браузерных API, но не имеет автоматических патчей для каждого нового браузерного API. Некоторые API не могут быть эффективно запатчены, например `async`/`await`, и должны понижаться для работы с ZoneJS. Иногда библиотеки в экосистеме также несовместимы со способом, которым ZoneJS патчит нативные API. Удаление ZoneJS как зависимости обеспечивает лучшую долгосрочную совместимость, устраняя источник сложности, monkey patching и текущего обслуживания.

## Включение Zoneless в приложении {#enabling-zoneless-in-an-application}

Zoneless используется по умолчанию в Angular v21+ и не требует никаких действий для включения. Убедитесь, что `provideZoneChangeDetection` нигде не используется для переопределения конфигурации по умолчанию.

Если вы используете Angular v20, включите обнаружение изменений без zone, добавив `provideZonelessChangeDetection()` при загрузке:

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

Zoneless-приложениям следует полностью удалить ZoneJS из сборки для уменьшения размера бандла. ZoneJS обычно
загружается через опцию `polyfills` в `angular.json`, как в целевых объектах `build`, так и `test`. Удалите `zone.js`
и `zone.js/testing` из обоих, чтобы исключить его из сборки. Проекты, использующие явный файл `polyfills.ts`,
должны удалить `import 'zone.js';` и `import 'zone.js/testing';` из файла.

После удаления ZoneJS из сборки зависимость от `zone.js` больше не нужна, и
пакет можно полностью удалить:

```shell
npm uninstall zone.js
```

## Требования для совместимости с Zoneless {#requirements-for-zoneless-compatibility}

Angular полагается на уведомления от основных API для определения того, когда запускать обнаружение изменений и в каких представлениях.
К таким уведомлениям относятся:

- `ChangeDetectorRef.markForCheck` (вызывается автоматически `AsyncPipe`)
- `ComponentRef.setInput`
- Обновление сигнала, читаемого в шаблоне
- Обратные вызовы привязанных слушателей хоста или шаблона
- Присоединение представления, помеченного как грязное одним из вышеуказанных

### Компоненты, совместимые с `OnPush` {#onpush-compatible-components}

Один из способов убедиться, что компонент использует правильные механизмы уведомлений, описанные выше, — использовать [ChangeDetectionStrategy.OnPush](/best-practices/skipping-subtrees#using-onpush).

Стратегия обнаружения изменений `OnPush` не является обязательной, но является рекомендуемым шагом к совместимости с Zoneless для компонентов приложения. Для компонентов библиотек не всегда возможно использовать `ChangeDetectionStrategy.OnPush`.
Когда компонент библиотеки является хостом для пользовательских компонентов, которые могут использовать `ChangeDetectionStrategy.Eager`/`Default`, он не может использовать `OnPush`, поскольку это предотвратит обновление дочернего компонента, если он не совместим с `OnPush` и зависит от ZoneJS для запуска обнаружения изменений. Компоненты могут использовать стратегию `Default`, если они уведомляют Angular о необходимости запуска обнаружения изменений (вызов `markForCheck`, использование сигналов, `AsyncPipe` и т. д.).
Быть хостом для пользовательского компонента означает использование API, такого как `ViewContainerRef.createComponent`, а не просто размещение части шаблона из пользовательского компонента (т. е. проекция контента или использование входного шаблонного ref).

### Удаление `NgZone.onMicrotaskEmpty`, `NgZone.onUnstable`, `NgZone.isStable` или `NgZone.onStable` {#remove-ngzone-onmicrotaskempty-ngzone-onunstable-ngzone-isstable-or-ngzone-onstable}

Приложениям и библиотекам необходимо удалить использование `NgZone.onMicrotaskEmpty`, `NgZone.onUnstable` и `NgZone.onStable`.
Эти наблюдаемые никогда не будут генерировать события, когда приложение включает обнаружение изменений без zone.
Аналогично, `NgZone.isStable` всегда будет `true` и не должен использоваться как условие для выполнения кода.

Наблюдаемые `NgZone.onMicrotaskEmpty` и `NgZone.onStable` чаще всего используются для ожидания завершения обнаружения изменений Angular перед выполнением задачи. Вместо них можно использовать `afterNextRender`,
если нужно подождать одного цикла обнаружения изменений, или `afterEveryRender`, если есть условие, которое может охватывать
несколько циклов. В других случаях эти наблюдаемые использовались потому, что они были знакомы и имели похожий тайминг с тем, что требовалось. Вместо них можно использовать более прямолинейные или прямые DOM API,
например `MutationObserver`, когда коду нужно дождаться определённого состояния DOM (а не ждать этого косвенно
через хуки рендеринга Angular).

<docs-callout title="NgZone.run и NgZone.runOutsideAngular совместимы с Zoneless">
`NgZone.run` и `NgZone.runOutsideAngular` не нужно удалять для того, чтобы код был совместим с
Zoneless-приложениями. Фактически, удаление этих вызовов может привести к снижению производительности для библиотек,
используемых в приложениях, которые по-прежнему зависят от ZoneJS.
</docs-callout>

### `PendingTasks` для серверного рендеринга (SSR) {#pendingtasks-for-server-side-rendering-ssr}

Если вы используете SSR с Angular, вы, вероятно, знаете, что он зависит от ZoneJS для определения момента, когда приложение
«стабильно» и может быть сериализовано. Если есть асинхронные задачи, которые должны предотвратить сериализацию, приложение,
не использующее ZoneJS, должно уведомить Angular об этом с помощью сервиса [PendingTasks](/api/core/PendingTasks). Сериализация
будет ждать первого момента, когда все ожидающие задачи будут удалены.

Два наиболее простых способа использования ожидающих задач — метод `run`:

```typescript
const taskService = inject(PendingTasks);
taskService.run(async () => {
  const someResult = await doSomeWorkThatNeedsToBeRendered();
  this.someState.set(someResult);
});
```

Для более сложных случаев можно вручную добавлять и удалять ожидающую задачу:

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

Кроме того, вспомогательная функция [pendingUntilEvent](/api/core/rxjs-interop/pendingUntilEvent#) в `rxjs-interop` гарантирует,
что приложение остаётся нестабильным до тех пор, пока наблюдаемая не сгенерирует событие, не завершится, не выдаст ошибку или не отпишется.

```typescript
readonly myObservableState = someObservable.pipe(pendingUntilEvent());
```

Фреймворк также использует этот сервис внутри для предотвращения сериализации до завершения асинхронных задач. К ним относятся, но не ограничиваются: текущая навигация Router и незавершённый запрос `HttpClient`.

### Реактивные формы в Zoneless-приложениях {#reactive-forms-in-zoneless-applications}

Обновления модели реактивных форм (`setValue`, `patchValue`, `FormArray.push` и аналогичные API) обновляют состояние формы и генерируют события форм, но не запускают автоматически обнаружение изменений компонента.

Если шаблон зависит от состояния реактивных форм, подключите наблюдаемые форм к уведомлению об обнаружении изменений (например, `ChangeDetectorRef.markForCheck()`), или отразите данные через сигналы, потребляемые шаблоном.

## Тестирование и отладка {#testing-and-debugging}

### Использование Zoneless в `TestBed` {#using-zoneless-in-testbed}

`TestBed` по умолчанию использует обнаружение изменений на основе Zone, когда `zone.js` загружается через `polyfills`.

Если `zone.js` отсутствует, `TestBed` по умолчанию работает без zone. Чтобы принудительно включить режим без zone при загруженном `zone.js`, добавьте `provideZonelessChangeDetection()`:

```typescript
TestBed.configureTestingModule({
  // Optional: include the provider to force the testing environment
  // uses the same zoneless behavior as a zoneless application.
  providers: [provideZonelessChangeDetection()],
});

const fixture = TestBed.createComponent(MyComponent);
await fixture.whenStable();
```

Чтобы тесты имели наиболее схожее поведение с производственным кодом,
по возможности избегайте использования `fixture.detectChanges()`. Это принудительно
запускает обнаружение изменений, когда Angular иначе мог бы не
планировать его. Тесты должны гарантировать, что эти уведомления
происходят, и позволить Angular управлять синхронизацией
состояния, вместо принудительного запуска в тесте.

Для существующих наборов тестов использование `fixture.detectChanges()` является распространённым паттерном,
и вероятно, не стоит тратить усилия на их преобразование в
`await fixture.whenStable()`. `TestBed` всё равно будет проверять, что компонент
fixture совместим с `OnPush`, и выбрасывает `ExpressionChangedAfterItHasBeenCheckedError`,
если обнаружит, что значения шаблона были обновлены без
уведомления об изменении (т. е. `fixture.componentInstance.someValue = 'newValue';`).
Если компонент используется в продакшене, эту проблему следует решить, обновив
компонент для использования сигналов для хранения состояния или вызова `ChangeDetectorRef.markForCheck()`.
Если компонент используется только как обёртка для теста и никогда не используется в приложении,
допустимо использовать `fixture.changeDetectorRef.markForCheck()`.

### Проверка в режиме отладки для обеспечения обнаружения обновлений {#debug-mode-check-to-ensure-updates-are-detected}

Angular также предоставляет дополнительный инструмент для проверки того, что приложение обновляет
состояние способом, совместимым с Zoneless. `provideCheckNoChangesConfig({exhaustive: true, interval: <milliseconds>})`
можно использовать для периодической проверки того, что никакие привязки не были обновлены
без уведомления. Angular выбрасывает `ExpressionChangedAfterItHasBeenCheckedError`,
если есть обновлённая привязка, которая не была бы обновлена обнаружением изменений
без zone.

# Кастомные события с outputs

TIP: Это руководство предполагает, что вы уже прочитали [Essentials Guide](essentials). Если вы новичок в Angular, начните с него.

Компоненты Angular могут определять кастомные события, назначая свойство функции `output`:

```ts {highlight:[5]}
@Component({
  /*...*/
})
export class ExpandablePanel {
  panelClosed = output<void>();
}
```

```angular-html
<expandable-panel (panelClosed)="savePanelState()" />
```

Функция `output` возвращает `OutputEmitterRef`. Событие можно эмитить, вызвав метод `emit` на `OutputEmitterRef`:

```ts
this.panelClosed.emit();
```

Angular называет свойства, инициализированные функцией `output`, **outputs**. Outputs можно использовать для генерации кастомных событий, аналогично нативным событиям браузера вроде `click`.

**Кастомные события Angular не всплывают по DOM**.

**Имена outputs чувствительны к регистру.**

При расширении класса компонента **outputs наследуются дочерним классом.**

Функция `output` имеет особое значение для компилятора Angular. **Вызывать `output` можно исключительно в инициализаторах свойств компонентов и директив.**

## Эмит данных события {#emitting-event-data}

При вызове `emit` можно передать данные события:

```ts
// You can emit primitive values.
this.valueChanged.emit(7);

// You can emit custom event objects
this.thumbDropped.emit({
  pointerX: 123,
  pointerY: 456,
});
```

При определении слушателя события в шаблоне к данным события можно обратиться через переменную `$event`:

```angular-html
<custom-slider (valueChanged)="logValue($event)" />
```

Получите данные события в родительском компоненте:

```ts
@Component({
 /*...*/
})
export class App {
  logValue(value: number) {
    ...
  }
}

```

## Кастомизация имён outputs {#customizing-output-names}

Функция `output` принимает параметр, позволяющий указать другое имя события в шаблоне:

```ts
@Component(/* ... */)
export class CustomSlider {
  changed = output({alias: 'valueChanged'});
}
```

```angular-html
<custom-slider (valueChanged)="saveVolume()" />
```

Этот alias не влияет на использование свойства в коде TypeScript.

Хотя в целом следует избегать aliasing outputs для компонентов, эта возможность полезна для переименования свойств с сохранением alias для исходного имени или для избежания коллизий с именами нативных DOM-событий.

## Программная подписка на outputs {#subscribing-to-outputs-programmatically}

При динамическом создании компонента можно программно подписаться на события output
из экземпляра компонента. Тип `OutputRef` включает метод `subscribe`:

```ts
const someComponentRef: ComponentRef<SomeComponent> = viewContainerRef.createComponent(/*...*/);

someComponentRef.instance.someEventProperty.subscribe((eventData) => {
  console.log(eventData);
});
```

Angular автоматически очищает подписки на события при уничтожении компонентов с подписчиками. Альтернативно можно вручную отписаться от события. Функция `subscribe` возвращает `OutputRefSubscription` с методом `unsubscribe`:

```ts
const eventSubscription = someComponent.someEventProperty.subscribe((eventData) => {
  console.log(eventData);
});

// ...

eventSubscription.unsubscribe();
```

## Выбор имён событий {#choosing-event-names}

Избегайте имён outputs, которые совпадают с событиями на DOM-элементах вроде HTMLElement. Коллизии имён создают путаницу: принадлежит ли привязанное свойство компоненту или DOM-элементу.

Избегайте префиксов для outputs компонентов, как для selectors компонентов. Поскольку данный элемент может хостить только один компонент, любые кастомные свойства можно считать принадлежащими компоненту.

Всегда используйте имена outputs в [camelCase](https://en.wikipedia.org/wiki/Camel_case). Избегайте префикса «on» в именах outputs.

## Использование outputs с RxJS {#using-outputs-with-rxjs}

Подробности о взаимодействии outputs и RxJS — в [RxJS interop with component and directive outputs](ecosystem/rxjs-interop/output-interop).

## Объявление outputs декоратором `@Output` {#declaring-outputs-with-the-output-decorator}

TIP: Хотя команда Angular рекомендует функцию `output` для новых проектов,
оригинальный decorator-based API `@Output` остаётся полностью поддерживаемым.

Альтернативно кастомные события можно определить, назначив свойство новому `EventEmitter` и добавив декоратор `@Output`:

```ts
@Component(/* ... */)
export class ExpandablePanel {
  @Output() panelClosed = new EventEmitter<void>();
}
```

Событие можно эмитить, вызвав метод `emit` на `EventEmitter`.

### Aliases с декоратором `@Output` {#aliases-with-the-output-decorator}

Декоратор `@Output` принимает параметр, позволяющий указать другое имя события в шаблоне:

```ts
@Component(/* ... */)
export class CustomSlider {
  @Output('valueChanged') changed = new EventEmitter<number>();
}
```

```angular-html
<custom-slider (valueChanged)="saveVolume()" />
```

Этот alias не влияет на использование свойства в коде TypeScript.

## Указание outputs в декораторе `@Component` {#specify-outputs-in-the-component-decorator}

Помимо декоратора `@Output`, outputs компонента можно указать через свойство `outputs` в декораторе `@Component`. Это полезно, когда компонент наследует свойство от базового класса:

```ts
// `CustomSlider` inherits the `valueChanged` property from `BaseSlider`.
@Component({
  /*...*/
  outputs: ['valueChanged'],
})
export class CustomSlider extends BaseSlider {}
```

Дополнительно можно указать alias output в списке `outputs`, поставив alias после двоеточия в строке:

```ts
// `CustomSlider` inherits the `valueChanged` property from `BaseSlider`.
@Component({
  /*...*/
  outputs: ['valueChanged: volumeChanged'],
})
export class CustomSlider extends BaseSlider {}
```

# Пользовательские события и outputs

СОВЕТ: Это руководство предполагает, что вы уже ознакомились с [Руководством по основам](essentials). Прочитайте его в
первую очередь, если вы новичок в Angular.

Компоненты Angular могут определять пользовательские события, присваивая свойству результат вызова функции `output`:

```ts {highlight:[3]}
@Component({/*...*/})
export class ExpandablePanel {
  panelClosed = output<void>();
}
```

```angular-html
<expandable-panel (panelClosed)="savePanelState()" />
```

Функция `output` возвращает `OutputEmitterRef`. Вы можете сгенерировать событие, вызвав метод `emit` у
`OutputEmitterRef`:

```ts
  this.panelClosed.emit();
```

Angular называет свойства, инициализированные функцией `output`, **outputs** (выходными свойствами). Вы можете
использовать outputs для создания пользовательских событий, аналогичных нативным событиям браузера, таким как `click`.

**Пользовательские события Angular не всплывают (bubble up) по DOM**.

**Имена output-свойств чувствительны к регистру.**

При расширении класса компонента **outputs наследуются дочерним классом.**

Функция `output` имеет особое значение для компилятора Angular. **Вызывать `output` можно исключительно в
инициализаторах свойств компонентов и директив.**

## Передача данных события

Вы можете передавать данные события при вызове `emit`:

```ts
// Можно передавать примитивные значения.
this.valueChanged.emit(7);

// Можно передавать пользовательские объекты событий
this.thumbDropped.emit({
  pointerX: 123,
  pointerY: 456,
})
```

При определении слушателя событий в шаблоне вы можете получить доступ к данным события через переменную `$event`:

```angular-html
<custom-slider (valueChanged)="logValue($event)" />
```

Получение данных события в родительском компоненте:

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

## Настройка имен output-свойств

Функция `output` принимает параметр, который позволяет указать другое имя для события в шаблоне:

```ts
@Component({/*...*/})
export class CustomSlider {
  changed = output({alias: 'valueChanged'});
}
```

```angular-html
<custom-slider (valueChanged)="saveVolume()" />
```

Этот псевдоним не влияет на использование свойства в TypeScript-коде.

Хотя, как правило, следует избегать использования псевдонимов для outputs компонентов, эта возможность может быть
полезна для переименования свойств с сохранением псевдонима для исходного имени или для предотвращения конфликтов с
именами нативных событий DOM.

## Программная подписка на outputs

При динамическом создании компонента вы можете программно подписаться на output-события экземпляра компонента. Тип
`OutputRef` включает метод `subscribe`:

```ts
const someComponentRef: ComponentRef<SomeComponent> = viewContainerRef.createComponent(/*...*/);

someComponentRef.instance.someEventProperty.subscribe(eventData => {
  console.log(eventData);
});
```

Angular автоматически очищает подписки на события при уничтожении компонентов с подписчиками. В качестве альтернативы вы
можете отписаться от события вручную. Функция `subscribe` возвращает `OutputRefSubscription` с методом `unsubscribe`:

```ts
const eventSubscription = someComponent.someEventProperty.subscribe(eventData => {
  console.log(eventData);
});

// ...

eventSubscription.unsubscribe();
```

## Выбор имен событий

Избегайте выбора имен output-свойств, которые конфликтуют с событиями элементов DOM, таких как HTMLElement. Конфликты
имен создают путаницу относительно того, принадлежит ли привязанное свойство компоненту или элементу DOM.

Не добавляйте префиксы к output-свойствам компонентов, как это делается с селекторами компонентов. Поскольку один
элемент может содержать только один компонент, можно считать, что любые пользовательские свойства принадлежат этому
компоненту.

Всегда используйте имена в [camelCase](https://en.wikipedia.org/wiki/Camel_case). Избегайте префикса "on" в именах
output-свойств.

## Использование outputs с RxJS

Подробнее о взаимодействии между outputs и RxJS см. в
разделе [Взаимодействие RxJS с outputs компонентов и директив](ecosystem/rxjs-interop/output-interop).

## Объявление outputs с помощью декоратора `@Output`

СОВЕТ: Хотя команда Angular рекомендует использовать функцию `output` для новых проектов, оригинальный API на основе
декоратора `@Output` по-прежнему полностью поддерживается.

В качестве альтернативы вы можете определять пользовательские события, присваивая свойству новый `EventEmitter` и
добавляя декоратор `@Output`:

```ts
@Component({/*...*/})
export class ExpandablePanel {
  @Output() panelClosed = new EventEmitter<void>();
}
```

Сгенерировать событие можно, вызвав метод `emit` у `EventEmitter`.

### Псевдонимы с декоратором `@Output`

Декоратор `@Output` принимает параметр, позволяющий указать другое имя для события в шаблоне:

```ts
@Component({/*...*/})
export class CustomSlider {
  @Output('valueChanged') changed = new EventEmitter<number>();
}
```

```angular-html
<custom-slider (valueChanged)="saveVolume()" />
```

Этот псевдоним не влияет на использование свойства в TypeScript-коде.

## Указание outputs в декораторе `@Component`

Помимо декоратора `@Output`, вы также можете указать outputs компонента с помощью свойства `outputs` в декораторе
`@Component`. Это может быть полезно, когда компонент наследует свойство от базового класса:

```ts
// `CustomSlider` наследует свойство `valueChanged` от `BaseSlider`.
@Component({
  /*...*/
  outputs: ['valueChanged'],
})
export class CustomSlider extends BaseSlider {}
```

Вы также можете указать псевдоним output-свойства в списке `outputs`, поместив псевдоним после двоеточия в строке:

```ts
// `CustomSlider` наследует свойство `valueChanged` от `BaseSlider`.
@Component({
  /*...*/
  outputs: ['valueChanged: volumeChanged'],
})
export class CustomSlider extends BaseSlider {}
```

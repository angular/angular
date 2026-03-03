# Приём данных через свойства Input {#accepting-data-with-input-properties}

TIP: В этом руководстве предполагается, что вы уже ознакомились с [Руководством по основам](essentials). Прочитайте его в первую очередь, если вы новичок в Angular.

TIP: Если вы знакомы с другими веб-фреймворками, Input-свойства аналогичны _props_.

Когда вы используете компонент, часто необходимо передавать ему данные. Компонент указывает, какие данные он принимает, объявляя **Input-свойства**:

```ts {highlight:[8]}
import {Component, input} from '@angular/core';

@Component({
  /*...*/
})
export class CustomSlider {
  // Declare an input named 'value' with a default value of zero.
  value = input(0);
}
```

Это позволяет привязать свойство в шаблоне:

```angular-html
<custom-slider [value]="50" />
```

Если Input имеет значение по умолчанию, TypeScript определяет тип из значения по умолчанию:

```ts
@Component({
  /*...*/
})
export class CustomSlider {
  // TypeScript infers that this input is a number, returning InputSignal<number>.
  value = input(0);
}
```

Вы можете явно указать тип Input, передав обобщённый (generic) параметр в функцию.

Если Input без значения по умолчанию не установлен, его значение будет `undefined`:

```ts
@Component({
  /*...*/
})
export class CustomSlider {
  // Produces an InputSignal<number | undefined> because `value` may not be set.
  value = input<number>();
}
```

**Angular записывает Input-свойства статически во время компиляции**. Input-свойства нельзя добавлять или удалять во время выполнения.

Функция `input` имеет особое значение для компилятора Angular. **Вызывать `input` можно исключительно в инициализаторах свойств компонентов и директив.**

При расширении класса компонента **Input-свойства наследуются дочерним классом.**

**Имена Input-свойств чувствительны к регистру.**

## Чтение Input-свойств {#reading-inputs}

Функция `input` возвращает `InputSignal`. Вы можете прочитать значение, вызвав сигнал:

```ts {highlight:[11]}
import {Component, input, computed} from '@angular/core';

@Component({
  /*...*/
})
export class CustomSlider {
  // Declare an input named 'value' with a default value of zero.
  value = input(0);

  // Create a computed expression that reads the value input
  label = computed(() => `The slider's value is ${this.value()}`);
}
```

Сигналы, созданные функцией `input`, доступны только для чтения.

## Обязательные Input-свойства {#required-inputs}

Вы можете объявить Input как `required`, вызвав `input.required` вместо `input`:

```ts {highlight:[6]}
@Component({
  /*...*/
})
export class CustomSlider {
  // Declare a required input named value. Returns an `InputSignal<number>`.
  value = input.required<number>();
}
```

Angular требует, чтобы обязательные Input-свойства были _обязательно_ установлены при использовании компонента в шаблоне. Если вы попытаетесь использовать компонент без указания всех его обязательных Input-свойств, Angular сообщит об ошибке во время сборки.

Обязательные Input-свойства автоматически не включают `undefined` в generic-параметр возвращаемого `InputSignal`.

## Настройка Input-свойств {#configuring-inputs}

Функция `input` принимает объект конфигурации в качестве второго параметра, позволяющего изменять поведение Input.

### Трансформации Input {#input-transforms}

Вы можете указать функцию `transform` для изменения значения Input при его установке Angular.

```ts {highlight:[6]}
@Component({
  selector: 'custom-slider',
  /*...*/
})
export class CustomSlider {
  label = input('', {transform: trimString});
}

function trimString(value: string | undefined): string {
  return value?.trim() ?? '';
}
```

```angular-html
<custom-slider [label]="systemVolume" />
```

В примере выше всякий раз, когда значение `systemVolume` изменяется, Angular вызывает `trimString` и устанавливает `label` равным результату.

Наиболее распространённый сценарий использования трансформаций Input — расширение диапазона принимаемых типов значений в шаблонах, часто включая `null` и `undefined`.

**Функция трансформации Input должна быть статически анализируемой во время сборки.** Нельзя устанавливать функции трансформации условно или как результат вычисления выражения.

**Функции трансформации Input должны быть [чистыми функциями](https://en.wikipedia.org/wiki/Pure_function).** Зависимость от состояния вне функции трансформации может привести к непредсказуемому поведению.

#### Проверка типов {#type-checking}

Когда вы указываете трансформацию Input, тип параметра функции трансформации определяет типы значений, которые можно задать для Input в шаблоне.

```ts
@Component({
  /*...*/
})
export class CustomSlider {
  widthPx = input('', {transform: appendPx});
}

function appendPx(value: number): string {
  return `${value}px`;
}
```

В примере выше Input `widthPx` принимает `number`, тогда как свойство `InputSignal` возвращает `string`.

#### Встроенные трансформации {#built-in-transformations}

Angular включает две встроенные функции трансформации для двух наиболее распространённых сценариев: приведение значений к boolean и числам.

```ts
import {Component, input, booleanAttribute, numberAttribute} from '@angular/core';

@Component({
  /*...*/
})
export class CustomSlider {
  disabled = input(false, {transform: booleanAttribute});
  value = input(0, {transform: numberAttribute});
}
```

`booleanAttribute` имитирует поведение стандартных HTML [булевых атрибутов](https://developer.mozilla.org/docs/Glossary/Boolean/HTML), где _наличие_ атрибута указывает на значение «true». Однако `booleanAttribute` в Angular интерпретирует строковый литерал `"false"` как булево `false`.

`numberAttribute` пытается разобрать заданное значение в число, возвращая `NaN`, если разбор не удался.

### Псевдонимы Input {#input-aliases}

Вы можете указать параметр `alias`, чтобы изменить имя Input в шаблонах.

```ts {highlight:[5]}
@Component({
  /*...*/
})
export class CustomSlider {
  value = input(0, {alias: 'sliderValue'});
}
```

```angular-html
<custom-slider [sliderValue]="50" />
```

Этот псевдоним не влияет на использование свойства в TypeScript-коде.

Хотя, как правило, следует избегать использования псевдонимов для Input-свойств компонентов, эта возможность может быть полезна для переименования свойств с сохранением псевдонима для исходного имени или для предотвращения конфликтов с именами нативных свойств DOM-элемента.

## Модельные Input-свойства {#model-inputs}

**Модельные Input-свойства** — это особый тип Input, который позволяет компоненту передавать новые значения обратно в родительский компонент.

При создании компонента вы можете определить модельный Input аналогично стандартному Input.

Оба типа Input позволяют привязать значение к свойству. Однако **модельные Input позволяют автору компонента записывать значения в свойство**. Если свойство привязано с помощью двусторонней привязки, новое значение передаётся в эту привязку.

```ts
@Component({
  /* ... */
})
export class CustomSlider {
  // Define a model input named "value".
  value = model(0);

  increment() {
    // Update the model input with a new value, propagating the value to any bindings.
    this.value.update((oldValue) => oldValue + 10);
  }
}

@Component({
  /* ... */
  // Using the two-way binding syntax means that any changes to the slider's
  // value automatically propagate back to the `volume` signal.
  // Note that this binding uses the signal *instance*, not the signal value.
  template: `<custom-slider [(value)]="volume" />`,
})
export class MediaControls {
  // Create a writable signal for the `volume` local state.
  volume = signal(0);
}
```

В примере выше `CustomSlider` может записывать значения в свой модельный Input `value`, который затем передаёт эти значения обратно в сигнал `volume` компонента `MediaControls`. Эта привязка синхронизирует значения `value` и `volume`. Обратите внимание, что привязка передаёт _экземпляр_ сигнала `volume`, а не _значение_ сигнала.

Во всех остальных аспектах модельные Input работают аналогично стандартным Input. Вы можете прочитать значение, вызвав сигнальную функцию, в том числе в [реактивных контекстах](guide/signals#reactive-contexts), таких как `computed` и `effect`.

Подробнее о двусторонней привязке в шаблонах см. в разделе [Двусторонняя привязка](guide/templates/two-way-binding).

### Двусторонняя привязка с обычными свойствами {#two-way-binding-with-plain-properties}

Вы можете привязать обычное JavaScript-свойство к модельному Input.

```angular-ts
@Component({
  /* ... */
  // `value` is a model input.
  // The parenthesis-inside-square-brackets syntax (aka "banana-in-a-box") creates a two-way binding
  template: '<custom-slider [(value)]="volume" />',
})
export class MediaControls {
  protected volume = 0;
}
```

В примере выше `CustomSlider` может записывать значения в свой модельный Input `value`, который затем передаёт эти значения обратно в свойство `volume` компонента `MediaControls`. Эта привязка синхронизирует значения `value` и `volume`.

### Неявные события `change` {#implicit-change-events}

Когда вы объявляете модельный Input в компоненте или директиве, Angular автоматически создаёт соответствующий [Output](guide/components/outputs) для этой модели. Имя Output формируется из имени модельного Input с суффиксом «Change».

```ts
@Directive({
  /* ... */
})
export class CustomCheckbox {
  // This automatically creates an output named "checkedChange".
  // Can be subscribed to using `(checkedChange)="handler()"` in the template.
  checked = model(false);
}
```

Angular генерирует это событие изменения при каждой записи нового значения в модельный Input через методы `set` или `update`.

Подробнее см. в разделе [Пользовательские события и outputs](guide/components/outputs).

### Настройка модельных Input {#customizing-model-inputs}

Вы можете пометить модельный Input как обязательный или задать ему псевдоним так же, как и для [стандартного Input](guide/components/inputs).

Модельные Input не поддерживают трансформации Input.

### Когда использовать модельные Input {#when-to-use-model-inputs}

Используйте модельные Input, когда хотите, чтобы компонент поддерживал двустороннюю привязку. Это обычно уместно, когда компонент предназначен для модификации значения на основе пользовательского взаимодействия. Чаще всего пользовательские элементы управления формами, такие как выбор даты (date picker) или выпадающий список (combobox), должны использовать модельные Input для своего основного значения.

## Выбор имён Input {#choosing-input-names}

Избегайте выбора имён Input, которые конфликтуют со свойствами DOM-элементов, таких как HTMLElement. Конфликты имён создают путаницу относительно того, принадлежит ли привязанное свойство компоненту или DOM-элементу.

Не добавляйте префиксы к Input-свойствам компонентов, как это делается с селекторами компонентов. Поскольку один элемент может содержать только один компонент, можно считать, что любые пользовательские свойства принадлежат компоненту.

## Объявление Input с помощью декоратора `@Input` {#declaring-inputs-with-the-input-decorator}

TIP: Хотя команда Angular рекомендует использовать сигнальную функцию `input` для новых проектов, оригинальный API на основе декоратора `@Input` по-прежнему полностью поддерживается.

Вы можете альтернативно объявить Input компонента, добавив декоратор `@Input` к свойству:

```ts {highlight:[5]}
@Component({
  /*...*/
})
export class CustomSlider {
  @Input() value = 0;
}
```

Привязка к Input работает одинаково как для сигнальных, так и для декораторных Input:

```angular-html
<custom-slider [value]="50" />
```

### Настройка декораторных Input {#customizing-decorator-based-inputs}

Декоратор `@Input` принимает объект конфигурации, позволяющий изменять поведение Input.

#### Обязательные Input {#required-inputs-1}

Вы можете указать параметр `required` для обеспечения обязательного наличия значения у данного Input.

```ts {highlight:[5]}
@Component({
  /*...*/
})
export class CustomSlider {
  @Input({required: true}) value = 0;
}
```

Если вы попытаетесь использовать компонент без указания всех его обязательных Input, Angular сообщит об ошибке во время сборки.

#### Трансформации Input {#input-transforms-1}

Вы можете указать функцию `transform` для изменения значения Input при его установке Angular. Эта функция трансформации работает идентично функциям трансформации для сигнальных Input, описанным выше.

```ts {highlight:[6]}
@Component({
  selector: 'custom-slider',
  ...
})
export class CustomSlider {
  @Input({transform: trimString}) label = '';
}

function trimString(value: string | undefined) {
  return value?.trim() ?? '';
}
```

#### Псевдонимы Input {#input-aliases-1}

Вы можете указать параметр `alias`, чтобы изменить имя Input в шаблонах.

```ts {highlight:[5]}
@Component({
  /*...*/
})
export class CustomSlider {
  @Input({alias: 'sliderValue'}) value = 0;
}
```

```angular-html
<custom-slider [sliderValue]="50" />
```

Декоратор `@Input` также принимает псевдоним в качестве первого параметра вместо объекта конфигурации.

Псевдонимы Input работают так же, как и для сигнальных Input, описанных выше.

### Input с геттерами и сеттерами {#inputs-with-getters-and-setters}

При использовании декораторных Input свойство, реализованное с помощью геттера и сеттера, может быть Input:

```ts
export class CustomSlider {
  @Input()
  get value(): number {
    return this.internalValue;
  }

  set value(newValue: number) {
    this.internalValue = newValue;
  }

  private internalValue = 0;
}
```

Вы можете даже создать Input _только для записи_, определив только публичный сеттер:

```ts
export class CustomSlider {
  @Input()
  set value(newValue: number) {
    this.internalValue = newValue;
  }

  private internalValue = 0;
}
```

**По возможности отдавайте предпочтение трансформациям Input вместо геттеров и сеттеров.**

Избегайте сложных или ресурсоёмких геттеров и сеттеров. Angular может вызывать сеттер Input несколько раз, что может негативно повлиять на производительность приложения, если сеттер выполняет ресурсоёмкие операции, такие как манипуляции с DOM.

## Указание Input в декораторе `@Component` {#specify-inputs-in-the-component-decorator}

Помимо декоратора `@Input`, вы также можете указать Input компонента с помощью свойства `inputs` в декораторе `@Component`. Это может быть полезно, когда компонент наследует свойство от базового класса:

```ts {highlight:[4]}
// `CustomSlider` inherits the `disabled` property from `BaseSlider`.
@Component({
  ...,
  inputs: ['disabled'],
})
export class CustomSlider extends BaseSlider { }
```

Вы также можете указать псевдоним Input в списке `inputs`, поместив псевдоним после двоеточия в строке:

```ts {highlight:[4]}
// `CustomSlider` inherits the `disabled` property from `BaseSlider`.
@Component({
  ...,
  inputs: ['disabled: sliderDisabled'],
})
export class CustomSlider extends BaseSlider { }
```

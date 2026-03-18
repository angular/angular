# Приём данных через свойства Input

СОВЕТ: Это руководство предполагает, что вы уже ознакомились с [Руководством по основам](essentials). Прочитайте его в первую очередь, если вы новичок в Angular.

СОВЕТ: Если вы знакомы с другими веб-фреймворками, свойства Input аналогичны _props_.

При использовании компонента зачастую требуется передать ему какие-то данные. Компонент объявляет принимаемые данные через **inputs**:

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

Это позволяет выполнять привязку к свойству в шаблоне:

```angular-html
<custom-slider [value]="50" />
```

Если Input имеет значение по умолчанию, TypeScript выводит тип из этого значения:

```ts
@Component({
  /*...*/
})
export class CustomSlider {
  // TypeScript infers that this input is a number, returning InputSignal<number>.
  value = input(0);
}
```

Можно явно указать тип Input, задав generic-параметр функции.

Если Input без значения по умолчанию не установлен, его значение равно `undefined`:

```ts
@Component({
  /*...*/
})
export class CustomSlider {
  // Produces an InputSignal<number | undefined> because `value` may not be set.
  value = input<number>();
}
```

**Angular записывает inputs статически во время компиляции**. Inputs нельзя добавлять или удалять во время выполнения.

Функция `input` имеет особое значение для компилятора Angular. **Вызывать `input` можно исключительно в инициализаторах свойств компонентов и директив.**

При расширении класса компонента **inputs наследуются дочерним классом.**

**Имена Input чувствительны к регистру.**

## Чтение inputs {#reading-inputs}

Функция `input` возвращает `InputSignal`. Значение можно прочитать, вызвав сигнал:

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

## Обязательные inputs {#required-inputs}

Можно объявить Input как `required`, вызвав `input.required` вместо `input`:

```ts {highlight:[6]}
@Component({
  /*...*/
})
export class CustomSlider {
  // Declare a required input named value. Returns an `InputSignal<number>`.
  value = input.required<number>();
}
```

Angular обеспечивает соблюдение требования: обязательные inputs _должны_ быть установлены при использовании компонента в шаблоне. Если попытаться использовать компонент без указания всех обязательных inputs, Angular сообщит об ошибке во время сборки.

Обязательные inputs не включают `undefined` автоматически в generic-параметр возвращаемого `InputSignal`.

## Настройка inputs {#configuring-inputs}

Функция `input` принимает объект конфигурации вторым параметром, позволяющий изменить поведение Input.

### Трансформации Input {#input-transforms}

Можно указать функцию `transform` для изменения значения Input при его установке Angular.

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

В примере выше каждый раз при изменении значения `systemVolume` Angular запускает `trimString` и устанавливает `label` в результат.

Наиболее распространённый случай применения трансформаций Input — принятие более широкого диапазона типов значений в шаблонах, часто включая `null` и `undefined`.

**Функция трансформации Input должна быть статически анализируема во время сборки.** Задавать функции трансформации условно или как результат вычисления выражения нельзя.

**Функции трансформации Input должны быть [чистыми функциями](https://en.wikipedia.org/wiki/Pure_function).** Обращение к состоянию за пределами функции трансформации может приводить к непредсказуемому поведению.

#### Проверка типов {#type-checking}

При указании трансформации Input тип параметра функции трансформации определяет допустимые типы значений, которые можно передать Input в шаблоне.

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

В примере выше Input `widthPx` принимает `number`, а свойство `InputSignal` возвращает `string`.

#### Встроенные трансформации {#built-in-transformations}

Angular включает две встроенные функции трансформации для двух наиболее распространённых сценариев: приведение значений к булевому типу и к числу.

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

`booleanAttribute` имитирует поведение стандартных HTML [булевых атрибутов](https://developer.mozilla.org/docs/Glossary/Boolean/HTML), где само
_наличие_ атрибута означает значение «true». Однако `booleanAttribute` Angular рассматривает строку `"false"` как булево `false`.

`numberAttribute` пытается разобрать переданное значение как число; при неудаче возвращает `NaN`.

### Псевдонимы Input {#input-aliases}

Можно указать опцию `alias` для изменения имени Input в шаблонах.

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

Хотя в общем случае следует избегать псевдонимов для inputs компонентов, эта возможность может быть полезна при переименовании свойств с сохранением псевдонима для исходного имени или при необходимости избежать конфликтов с именами нативных свойств DOM-элементов.

## Model inputs {#model-inputs}

**Model inputs** — это особый тип Input, позволяющий компоненту передавать новые значения обратно в родительский компонент.

При создании компонента model input объявляется аналогично стандартному Input.

Оба типа Input позволяют привязывать значение к свойству. Однако **model inputs позволяют автору компонента записывать значения в свойство**. Если свойство привязано двусторонней привязкой, новое значение распространяется в эту привязку.

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

В примере выше `CustomSlider` может записывать значения в свой model input `value`, которые затем распространяются обратно в сигнал `volume` компонента `MediaControls`. Эта привязка синхронизирует значения `value` и `volume`. Обратите внимание, что привязка передаёт _экземпляр_ сигнала `volume`, а не его _значение_.

В остальных отношениях model inputs работают аналогично стандартным inputs. Значение можно прочитать, вызвав функцию сигнала, в том числе в [реактивных контекстах](guide/signals#reactive-contexts), таких как `computed` и `effect`.

Подробнее о двусторонней привязке в шаблонах см. в разделе [Двусторонняя привязка](guide/templates/two-way-binding).

### Двусторонняя привязка с обычными свойствами {#two-way-binding-with-plain-properties}

Можно привязать обычное JavaScript-свойство к model input.

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

В примере выше `CustomSlider` может записывать значения в свой model input `value`, которые затем распространяются обратно в свойство `volume` компонента `MediaControls`. Эта привязка синхронизирует значения `value` и `volume`.

### Неявные события `change` {#implicit-change-events}

При объявлении model input в компоненте или директиве Angular автоматически создаёт соответствующий [output](guide/components/outputs) для этой модели. Имя output формируется как имя model input с суффиксом "Change".

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

Angular генерирует это событие изменения каждый раз, когда вы записываете новое значение в model input, вызывая его методы `set` или `update`.

Подробнее об outputs см. в разделе [Пользовательские события и outputs](guide/components/outputs).

### Настройка model inputs {#customizing-model-inputs}

Model input можно пометить как обязательный или задать псевдоним так же, как для [стандартного Input](guide/components/inputs).

Model inputs не поддерживают трансформации Input.

### Когда использовать model inputs {#when-to-use-model-inputs}

Используйте model inputs, когда компонент должен поддерживать двустороннюю привязку. Это, как правило, уместно, когда компонент предназначен для изменения значения на основе взаимодействия с пользователем. Чаще всего пользовательские элементы форм, такие как выбор даты или combobox, должны использовать model inputs для своего основного значения.

## Выбор имён inputs {#choosing-input-names}

Избегайте имён inputs, конфликтующих со свойствами DOM-элементов, таких как HTMLElement. Конфликты имён создают путаницу: неясно, принадлежит ли привязанное свойство компоненту или DOM-элементу.

Не добавляйте префиксы к inputs компонентов, как это делается с селекторами компонентов. Поскольку один элемент может содержать только один компонент, можно считать, что любые пользовательские свойства принадлежат этому компоненту.

## Объявление inputs с помощью декоратора `@Input` {#declaring-inputs-with-the-input-decorator}

СОВЕТ: Хотя команда Angular рекомендует использовать функцию `input` на основе сигналов для новых проектов, оригинальный API на основе декоратора `@Input` по-прежнему полностью поддерживается.

Можно объявлять inputs компонента альтернативным способом — добавляя декоратор `@Input` к свойству:

```ts {highlight:[5]}
@Component({
  /*...*/
})
export class CustomSlider {
  @Input() value = 0;
}
```

Привязка к Input одинакова как для основанных на сигналах, так и для основанных на декораторах inputs:

```angular-html
<custom-slider [value]="50" />
```

### Настройка inputs на основе декораторов {#customizing-decorator-based-inputs}

Декоратор `@Input` принимает объект конфигурации, позволяющий изменить поведение Input.

#### Обязательные inputs {#required-inputs-decorator}

Можно указать опцию `required`, чтобы гарантировать, что данный Input всегда имеет значение.

```ts {highlight:[5]}
@Component({
  /*...*/
})
export class CustomSlider {
  @Input({required: true}) value = 0;
}
```

При попытке использовать компонент без указания всех обязательных inputs Angular сообщает об ошибке во время сборки.

#### Трансформации Input {#input-transforms-decorator}

Можно указать функцию `transform` для изменения значения Input при его установке Angular. Эта функция трансформации работает идентично функциям трансформации для inputs на основе сигналов, описанных выше.

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

#### Псевдонимы Input {#input-aliases-decorator}

Можно указать опцию `alias` для изменения имени Input в шаблонах.

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

Псевдонимы Input работают так же, как и для inputs на основе сигналов, описанных выше.

### Inputs с геттерами и сеттерами {#inputs-with-getters-and-setters}

При использовании inputs на основе декораторов свойство, реализованное с помощью геттера и сеттера, может быть Input:

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

Можно даже создать Input _только для записи_, определив лишь публичный сеттер:

```ts
export class CustomSlider {
  @Input()
  set value(newValue: number) {
    this.internalValue = newValue;
  }

  private internalValue = 0;
}
```

**По возможности предпочитайте трансформации Input вместо геттеров и сеттеров.**

Избегайте сложных или затратных геттеров и сеттеров. Angular может вызывать сеттер Input несколько раз, что может негативно влиять на производительность приложения, если сеттер выполняет дорогостоящие операции, например манипуляции с DOM.

## Указание inputs в декораторе `@Component` {#specify-inputs-in-the-component-decorator}

Помимо декоратора `@Input`, можно также указать inputs компонента с помощью свойства `inputs` в декораторе `@Component`. Это может быть полезно, когда компонент наследует свойство от базового класса:

```ts {highlight:[4]}
// `CustomSlider` inherits the `disabled` property from `BaseSlider`.
@Component({
  ...,
  inputs: ['disabled'],
})
export class CustomSlider extends BaseSlider { }
```

Дополнительно можно указать псевдоним Input в списке `inputs`, поместив псевдоним после двоеточия в строке:

```ts {highlight:[4]}
// `CustomSlider` inherits the `disabled` property from `BaseSlider`.
@Component({
  ...,
  inputs: ['disabled: sliderDisabled'],
})
export class CustomSlider extends BaseSlider { }
```

# Прием данных с помощью входных свойств (Inputs)

TIP: Это руководство предполагает, что вы уже ознакомились с [Руководством по основам](essentials). Прочтите его первым,
если вы новичок в Angular.

TIP: Если вы знакомы с другими веб-фреймворками, входные свойства похожи на _пропсы_ (props).

Когда вы используете компонент, часто требуется передать ему данные. Компонент определяет принимаемые данные, объявляя \*
\*inputs\*\* (входные свойства):

```ts {highlight:[5]}
import {Component, input} from '@angular/core';

@Component({/*...*/})
export class CustomSlider {
  // Declare an input named 'value' with a default value of zero.
  value = input(0);
}
```

Это позволяет выполнить привязку к свойству в шаблоне:

```angular-html
<custom-slider [value]="50" />
```

Если у input есть значение по умолчанию, TypeScript выводит тип из этого значения:

```ts
@Component({/*...*/})
export class CustomSlider {
  // TypeScript infers that this input is a number, returning InputSignal<number>.
  value = input(0);
}
```

Вы можете явно объявить тип для input, указав обобщенный (generic) параметр функции.

Если input без значения по умолчанию не установлен, его значением будет `undefined`:

```ts
@Component({/*...*/})
export class CustomSlider {
  // Produces an InputSignal<number | undefined> because `value` may not be set.
  value = input<number>();
}
```

**Angular регистрирует inputs статически во время компиляции**. Inputs нельзя добавлять или удалять во время выполнения.

Функция `input` имеет особое значение для компилятора Angular. **Вы можете вызывать `input` исключительно в
инициализаторах свойств компонента и директивы.**

При расширении класса компонента **inputs наследуются дочерним классом.**

**Имена input чувствительны к регистру.**

## Чтение inputs

Функция `input` возвращает `InputSignal`. Вы можете прочитать значение, вызвав сигнал:

```ts {highlight:[5]}
import {Component, input, computed} from '@angular/core';

@Component({/*...*/})
export class CustomSlider {
  // Declare an input named 'value' with a default value of zero.
  value = input(0);

  // Create a computed expression that reads the value input
  label = computed(() => `The slider's value is ${this.value()}`);
}
```

Сигналы, созданные функцией `input`, доступны только для чтения.

## Обязательные inputs

Вы можете объявить input как `required` (обязательный), вызвав `input.required` вместо `input`:

```ts {highlight:[3]}
@Component({/*...*/})
export class CustomSlider {
  // Declare a required input named value. Returns an `InputSignal<number>`.
  value = input.required<number>();
}
```

Angular следит за тем, чтобы обязательные inputs _обязательно_ устанавливались при использовании компонента в шаблоне.
Если вы попытаетесь использовать компонент без указания всех его обязательных inputs, Angular сообщит об ошибке во время
сборки.

Обязательные inputs не включают автоматически `undefined` в обобщенный параметр возвращаемого `InputSignal`.

## Настройка inputs

Функция `input` принимает объект конфигурации в качестве второго параметра, который позволяет изменить способ работы
input.

### Трансформация input (Input transforms)

Вы можете указать функцию `transform` для изменения значения input, когда оно устанавливается Angular.

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

В примере выше, всякий раз, когда меняется значение `systemVolume`, Angular запускает `trimString` и устанавливает
результат в `label`.

Наиболее частый сценарий использования трансформаций input — это прием более широкого диапазона типов значений в
шаблонах, часто включая `null` и `undefined`.

**Функция трансформации input должна поддаваться статическому анализу во время сборки.** Вы не можете устанавливать
функции трансформации условно или как результат вычисления выражения.

**Функции трансформации input всегда должны быть [чистыми функциями](https://en.wikipedia.org/wiki/Pure_function).**
Зависимость от состояния вне функции трансформации может привести к непредсказуемому поведению.

#### Проверка типов

Когда вы указываете трансформацию input, тип параметра функции трансформации определяет типы значений, которые можно
установить для input в шаблоне.

```ts
@Component({/*...*/})
export class CustomSlider {
  widthPx = input('', {transform: appendPx});
}

function appendPx(value: number): string {
  return `${value}px`;
}
```

В примере выше input `widthPx` принимает `number`, в то время как свойство `InputSignal` возвращает `string`.

#### Встроенные трансформации

Angular включает две встроенные функции трансформации для двух наиболее распространенных сценариев: приведение значений
к логическому типу (boolean) и числам (number).

```ts
import {Component, input, booleanAttribute, numberAttribute} from '@angular/core';

@Component({/*...*/})
export class CustomSlider {
  disabled = input(false, {transform: booleanAttribute});
  value = input(0, {transform: numberAttribute});
}
```

`booleanAttribute` имитирует поведение стандартных
HTML [булевых атрибутов](https://developer.mozilla.org/docs/Glossary/Boolean/HTML), где _наличие_ атрибута указывает на
значение "true". Однако `booleanAttribute` в Angular трактует строковый литерал `"false"` как булево `false`.

`numberAttribute` пытается распарсить переданное значение в число, выдавая `NaN`, если парсинг не удался.

### Псевдонимы input (Input aliases)

Вы можете указать опцию `alias`, чтобы изменить имя input в шаблонах.

```ts {highlight:[3]}
@Component({/*...*/})
export class CustomSlider {
  value = input(0, {alias: 'sliderValue'});
}
```

```angular-html
<custom-slider [sliderValue]="50" />
```

Этот псевдоним не влияет на использование свойства в коде TypeScript.

Хотя обычно следует избегать псевдонимов для inputs компонентов, эта функция может быть полезна для переименования
свойств с сохранением псевдонима для исходного имени или для избежания коллизий с именами свойств нативных
DOM-элементов.

## Model inputs

**Model inputs** — это особый тип input, который позволяет компоненту передавать новые значения обратно родительскому
компоненту.

При создании компонента вы можете определить model input аналогично созданию стандартного input.

Оба типа позволяют привязать значение к свойству. Однако **model inputs позволяют автору компонента записывать значения
в свойство**. Если свойство связано двусторонней привязкой, новое значение распространяется на эту привязку.

```ts
@Component({ /* ... */})
export class CustomSlider {
  // Define a model input named "value".
  value = model(0);

  increment() {
    // Update the model input with a new value, propagating the value to any bindings.
    this.value.update(oldValue => oldValue + 10);
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

В примере выше `CustomSlider` может записывать значения в свой `value` model input, который затем передает эти значения
обратно в сигнал `volume` в `MediaControls`. Эта привязка синхронизирует значения `value` и `volume`. Обратите внимание,
что привязка передает экземпляр сигнала `volume`, а не _значение_ сигнала.

В остальном model inputs работают аналогично стандартным inputs. Вы можете читать значение, вызывая функцию сигнала, в
том числе в реактивных контекстах, таких как `computed` и `effect`.

См. [Двусторонняя привязка](guide/templates/two-way-binding) для получения более подробной информации о двусторонней
привязке в шаблонах.

### Двусторонняя привязка с обычными свойствами

Вы можете привязать обычное свойство JavaScript к model input.

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

В примере выше `CustomSlider` может записывать значения в свой `value` model input, который затем передает эти значения
обратно в свойство `volume` в `MediaControls`. Эта привязка синхронизирует значения `value` и `volume`.

### Неявные события `change`

Когда вы объявляете model input в компоненте или директиве, Angular автоматически создает
соответствующий [output](guide/components/outputs) для этой модели. Имя output — это имя model input с суффиксом "
Change".

```ts
@Directive({ /* ... */ })
export class CustomCheckbox {
  // This automatically creates an output named "checkedChange".
  // Can be subscribed to using `(checkedChange)="handler()"` in the template.
  checked = model(false);
}
```

Angular генерирует это событие изменения всякий раз, когда вы записываете новое значение в model input, вызывая его
методы `set` или `update`.

См. [Пользовательские события с outputs](guide/components/outputs) для получения более подробной информации об outputs.

### Настройка model inputs

Вы можете пометить model input как обязательный или предоставить псевдоним так же, как и
для [стандартного input](guide/signals/inputs).

Model inputs не поддерживают трансформации (input transforms).

### Когда использовать model inputs

Используйте model inputs, когда хотите, чтобы компонент поддерживал двустороннюю привязку. Обычно это уместно, когда
компонент существует для изменения значения на основе взаимодействия с пользователем. Чаще всего пользовательские
элементы управления формой, такие как выбор даты или выпадающий список (combobox), должны использовать model inputs для
своего основного значения.

## Выбор имен input

Избегайте выбора имен input, которые конфликтуют со свойствами DOM-элементов, такими как `HTMLElement`. Коллизии имен
вносят путаницу в то, принадлежит ли привязанное свойство компоненту или DOM-элементу.

Избегайте добавления префиксов для inputs компонентов, как вы делаете это с селекторами компонентов. Поскольку данный
элемент может содержать только один компонент, любые пользовательские свойства можно считать принадлежащими компоненту.

## Объявление inputs с помощью декоратора `@Input`

TIP: Хотя команда Angular рекомендует использовать функцию `input` на основе сигналов для новых проектов, оригинальный
API `@Input` на основе декораторов остается полностью поддерживаемым.

Вы можете альтернативно объявить inputs компонента, добавив декоратор `@Input` к свойству:

```ts {highlight:[3]}
@Component({...})
export class CustomSlider {
  @Input() value = 0;
}
```

Привязка к input одинакова как для inputs на основе сигналов, так и для inputs на основе декораторов:

```angular-html
<custom-slider [value]="50" />
```

### Настройка inputs на основе декораторов

Декоратор `@Input` принимает объект конфигурации, который позволяет изменить способ работы input.

#### Обязательные inputs

Вы можете указать опцию `required`, чтобы принудительно требовать наличие значения для данного input.

```ts {highlight:[3]}
@Component({...})
export class CustomSlider {
  @Input({required: true}) value = 0;
}
```

Если вы попытаетесь использовать компонент без указания всех его обязательных inputs, Angular сообщит об ошибке во время
сборки.

#### Трансформация input (Input transforms)

Вы можете указать функцию `transform` для изменения значения input, когда оно устанавливается Angular. Эта функция
трансформации работает идентично функциям трансформации для inputs на основе сигналов, описанным выше.

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

#### Псевдонимы input (Input aliases)

Вы можете указать опцию `alias`, чтобы изменить имя input в шаблонах.

```ts {highlight:[3]}
@Component({...})
export class CustomSlider {
  @Input({alias: 'sliderValue'}) value = 0;
}
```

```angular-html
<custom-slider [sliderValue]="50" />
```

Декоратор `@Input` также принимает псевдоним в качестве первого параметра вместо объекта конфигурации.

Псевдонимы input работают так же, как и для inputs на основе сигналов, описанных выше.

### Inputs с геттерами и сеттерами

При использовании inputs на основе декораторов свойство, реализованное с помощью геттера и сеттера, может быть input-ом:

```ts
export class CustomSlider {
  @Input()
  get value(): number {
    return this.internalValue;
  }

  set value(newValue: number) { this.internalValue = newValue; }

  private internalValue = 0;
}
```

Вы даже можете создать input _только для записи_, определив только публичный сеттер:

```ts
export class CustomSlider {
  @Input()
  set value(newValue: number) {
    this.internalValue = newValue;
  }

  private internalValue = 0;
}
```

**Предпочитайте использование трансформаций input вместо геттеров и сеттеров**, если это возможно.

Избегайте сложных или дорогостоящих геттеров и сеттеров. Angular может вызывать сеттер input несколько раз, что может
негативно сказаться на производительности приложения, если сеттер выполняет какие-либо дорогостоящие действия, такие как
манипуляции с DOM.

## Указание inputs в декораторе `@Component`

В дополнение к декоратору `@Input`, вы также можете указать inputs компонента с помощью свойства `inputs` в декораторе
`@Component`. Это может быть полезно, когда компонент наследует свойство от базового класса:

```ts {highlight:[4]}
// `CustomSlider` inherits the `disabled` property from `BaseSlider`.
@Component({
  ...,
  inputs: ['disabled'],
})
export class CustomSlider extends BaseSlider { }
```

Вы можете дополнительно указать псевдоним input в списке `inputs`, поместив псевдоним после двоеточия в строке:

```ts {highlight:[4]}
// `CustomSlider` inherits the `disabled` property from `BaseSlider`.
@Component({
  ...,
  inputs: ['disabled: sliderDisabled'],
})
export class CustomSlider extends BaseSlider { }
```

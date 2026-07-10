# Принятие данных через input-свойства

TIP: Это руководство предполагает, что вы уже прочитали [Essentials Guide](essentials). Прочитайте его сначала, если вы новичок в Angular.

TIP: Если вы знакомы с другими веб-фреймворками, input-свойства похожи на _props_.

Когда вы используете компонент, обычно нужно передать ему какие-то данные. Компонент указывает данные, которые принимает, объявляя
**inputs**:

```ts {highlight:[6]}
import {Component, input} from '@angular/core';

@Component(/* ... */)
export class CustomSlider {
  // Declare an input named 'value' with a default value of zero.
  value = input(0);
}
```

Это позволяет привязаться к свойству в шаблоне:

```angular-html
<custom-slider [value]="50" />
```

Если у input есть значение по умолчанию, TypeScript выводит тип из значения по умолчанию:

```ts
@Component(/* ... */)
export class CustomSlider {
  // TypeScript infers that this input is a number, returning InputSignal<number>.
  value = input(0);
}
```

Можно явно объявить тип для input, указав generic-параметр функции.

Если input без значения по умолчанию не задан, его значение — `undefined`:

```ts
@Component(/* ... */)
export class CustomSlider {
  // Produces an InputSignal<number | undefined> because `value` may not be set.
  value = input<number>();
}
```

**Angular записывает inputs статически на этапе компиляции**. Inputs нельзя добавлять или удалять во время выполнения.

Функция `input` имеет особое значение для компилятора Angular. **Вызывать `input` можно исключительно в инициализаторах свойств компонентов и директив.**

При расширении класса компонента **inputs наследуются дочерним классом.**

**Имена inputs чувствительны к регистру.**

## Чтение inputs {#reading-inputs}

Функция `input` возвращает `InputSignal`. Значение можно прочитать, вызвав сигнал:

```ts {highlight:[9]}
import {Component, input, computed} from '@angular/core';

@Component(/* ... */)
export class CustomSlider {
  // Declare an input named 'value' with a default value of zero.
  value = input(0);

  // Create a computed expression that reads the value input
  label = computed(() => `The slider's value is ${this.value()}`);
}
```

Сигналы, созданные функцией `input`, — read-only.

## Обязательные inputs {#required-inputs}

Можно объявить, что input является `required`, вызвав `input.required` вместо `input`:

```ts {highlight:[4]}
@Component(/* ... */)
export class CustomSlider {
  // Declare a required input named value. Returns an `InputSignal<number>`.
  value = input.required<number>();
}
```

Angular обеспечивает, что обязательные inputs _должны_ быть заданы при использовании компонента в шаблоне. Если попытаться использовать компонент без указания всех обязательных inputs, Angular сообщит об ошибке на этапе сборки.

Обязательные inputs не включают автоматически `undefined` в generic-параметр возвращаемого `InputSignal`.

## Настройка inputs {#configuring-inputs}

Функция `input` принимает config-объект как второй параметр, который позволяет изменить способ работы input.

### Input transforms {#input-transforms}

Можно указать функцию `transform`, чтобы изменить значение input, когда его задаёт Angular.

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

В примере выше при каждом изменении значения `systemVolume` Angular выполняет `trimString` и задаёт `label` результатом.

Самый распространённый use-case для input transforms — принимать более широкий диапазон типов значений в шаблонах, часто включая `null` и `undefined`.

**Функция input transform должна быть статически анализируема на этапе сборки.** Нельзя задавать transform-функции условно или как результат вычисления выражения.

**Функции input transform всегда должны быть [pure functions](https://en.wikipedia.org/wiki/Pure_function).** Опора на состояние вне transform-функции может привести к непредсказуемому поведению.

#### Проверка типов {#type-checking}

Когда вы указываете input transform, тип параметра transform-функции определяет типы значений, которые можно задать input в шаблоне.

```ts
@Component(/* ... */)
export class CustomSlider {
  widthPx = input('', {transform: appendPx});
}

function appendPx(value: number): string {
  return `${value}px`;
}
```

В примере выше input `widthPx` принимает `number`, а свойство `InputSignal` возвращает `string`.

#### Встроенные преобразования {#built-in-transformations}

Angular включает две встроенные transform-функции для двух самых распространённых сценариев: приведение значений к boolean и numbers.

```ts
import {Component, input, booleanAttribute, numberAttribute} from '@angular/core';

@Component(/* ... */)
export class CustomSlider {
  disabled = input(false, {transform: booleanAttribute});
  value = input(0, {transform: numberAttribute});
}
```

`booleanAttribute` имитирует поведение стандартных HTML [boolean attributes](https://developer.mozilla.org/docs/Glossary/Boolean/HTML), где
_присутствие_ атрибута указывает на значение «true». Однако `booleanAttribute` Angular трактует литеральную строку `"false"` как boolean `false`.

`numberAttribute` пытается разобрать данное значение как число, производя `NaN`, если разбор не удался.

### Алиасы inputs {#input-aliases}

Можно указать опцию `alias`, чтобы изменить имя input в шаблонах.

```ts {highlight:[3]}
@Component(/* ... */)
export class CustomSlider {
  value = input(0, {alias: 'sliderValue'});
}
```

```angular-html
<custom-slider [sliderValue]="50" />
```

Этот алиас не влияет на использование свойства в коде TypeScript.

Хотя в целом следует избегать алиасинга inputs для компонентов, эта возможность может быть полезна для переименования свойств с сохранением алиаса для исходного имени или для избежания коллизий с именами свойств нативных DOM-элементов.

## Model inputs {#model-inputs}

**Model inputs** — особый тип input, который позволяет компоненту распространять новые значения обратно родительскому компоненту.

При создании компонента можно определить model input аналогично тому, как создаётся стандартный input.

Оба типа input позволяют привязать значение к свойству. Однако **model inputs позволяют автору компонента записывать значения в свойство**. Если свойство привязано two-way binding, новое значение распространяется к этой привязке.

```ts
@Component(/* ... */)
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

В примере выше `CustomSlider` может записывать значения в свой model input `value`, который затем распространяет эти значения обратно к сигналу `volume` в `MediaControls`. Эта привязка синхронизирует значения `value` и `volume`. Обратите внимание, что привязка передаёт экземпляр сигнала `volume`, а не _значение_ сигнала.

В остальных отношениях model inputs работают аналогично стандартным inputs. Значение можно прочитать, вызвав функцию сигнала, в том числе в [реактивных контекстах](guide/signals#reactive-contexts) вроде `computed` и `effect`.

См. [Two-way binding](guide/templates/two-way-binding) для дополнительных деталей о two-way binding в шаблонах.

### Two-way binding с обычными свойствами {#two-way-binding-with-plain-properties}

Можно привязать обычное свойство JavaScript к model input.

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

В примере выше `CustomSlider` может записывать значения в свой model input `value`, который затем распространяет эти значения обратно к свойству `volume` в `MediaControls`. Эта привязка синхронизирует значения `value` и `volume`.

### Неявные события `change` {#implicit-change-events}

Когда вы объявляете model input в компоненте или директиве, Angular автоматически создаёт соответствующий [output](guide/components/outputs) для этой модели. Имя output — имя model input с суффиксом «Change».

```ts
@Directive(/* ... */)
export class CustomCheckbox {
  // This automatically creates an output named "checkedChange".
  // Can be subscribed to using `(checkedChange)="handler()"` in the template.
  checked = model(false);
}
```

Angular испускает это событие изменения всякий раз, когда вы записываете новое значение в model input вызовом методов `set` или `update`.

См. [Custom events with outputs](guide/components/outputs) для дополнительных деталей об outputs.

### Настройка model inputs {#customizing-model-inputs}

Можно пометить model input как required или предоставить алиас так же, как для [стандартного input](guide/components/inputs).

Model inputs не поддерживают input transforms.

### Когда использовать model inputs {#when-to-use-model-inputs}

Используйте model inputs, когда хотите, чтобы компонент поддерживал two-way binding. Это обычно уместно, когда компонент существует для изменения значения на основе взаимодействия пользователя. Чаще всего пользовательские form controls — например, date picker или combobox — должны использовать model inputs для своего основного значения.

## Выбор имён inputs {#choosing-input-names}

Избегайте выбора имён inputs, которые конфликтуют со свойствами DOM-элементов вроде HTMLElement. Коллизии имён вносят путаницу относительно того, принадлежит ли привязанное свойство компоненту или DOM-элементу.

Избегайте добавления префиксов для inputs компонентов, как вы бы делали с селекторами компонентов. Поскольку данный элемент может хостить только один компонент, любые пользовательские свойства можно считать принадлежащими компоненту.

## Объявление inputs декоратором `@Input` {#declaring-inputs-with-the-input-decorator}

TIP: Хотя команда Angular рекомендует использовать signal-based функцию `input` для новых проектов, оригинальный decorator-based API `@Input` остаётся полностью поддерживаемым.

Альтернативно можно объявить inputs компонента, добавив декоратор `@Input` к свойству:

```ts {highlight:[3]}
@Component(/* ... */)
export class CustomSlider {
  @Input() value = 0;
}
```

Привязка к input одинакова и для signal-based, и для decorator-based inputs:

```angular-html
<custom-slider [value]="50" />
```

### Настройка decorator-based inputs {#customizing-decorator-based-inputs}

Декоратор `@Input` принимает config-объект, который позволяет изменить способ работы input.

#### Обязательные inputs {#required-inputs-1}

Можно указать опцию `required`, чтобы обеспечить, что данный input всегда должен иметь значение.

```ts {highlight:[3]}
@Component(/* ... */)
export class CustomSlider {
  @Input({required: true}) value = 0;
}
```

Если попытаться использовать компонент без указания всех обязательных inputs, Angular сообщит об ошибке на этапе сборки.

#### Input transforms {#input-transforms-1}

Можно указать функцию `transform`, чтобы изменить значение input, когда его задаёт Angular. Эта transform-функция работает идентично transform-функциям для signal-based inputs, описанным выше.

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

#### Алиасы inputs {#input-aliases-1}

Можно указать опцию `alias`, чтобы изменить имя input в шаблонах.

```ts {highlight:[3]}
@Component(/* ... */)
export class CustomSlider {
  @Input({alias: 'sliderValue'}) value = 0;
}
```

```angular-html
<custom-slider [sliderValue]="50" />
```

Декоратор `@Input` также принимает алиас как первый параметр вместо config-объекта.

Алиасы inputs работают так же, как для signal-based inputs, описанных выше.

### Inputs с getters и setters {#inputs-with-getters-and-setters}

При использовании decorator-based inputs свойство, реализованное с getter и setter, может быть input:

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

Можно даже создать _write-only_ input, определив только публичный setter:

```ts
export class CustomSlider {
  @Input()
  set value(newValue: number) {
    this.internalValue = newValue;
  }

  private internalValue = 0;
}
```

**Предпочитайте использовать input transforms вместо getters и setters**, если возможно.

Избегайте сложных или дорогих getters и setters. Angular может вызывать setter input несколько раз, что может негативно влиять на производительность приложения, если setter выполняет какие-либо дорогие действия, например манипуляции с DOM.

## Указание inputs в декораторе `@Component` {#specify-inputs-in-the-component-decorator}

В дополнение к декоратору `@Input` можно также указать inputs компонента свойством `inputs` в декораторе `@Component`. Это может быть полезно, когда компонент наследует свойство от базового класса:

```ts {highlight:[4]}
// `CustomSlider` inherits the `disabled` property from `BaseSlider`.
@Component({
  ...,
  inputs: ['disabled'],
})
export class CustomSlider extends BaseSlider { }
```

Дополнительно можно указать алиас input в списке `inputs`, поместив алиас после двоеточия в строке:

```ts {highlight:[4]}
// `CustomSlider` inherits the `disabled` property from `BaseSlider`.
@Component({
  ...,
  inputs: ['disabled: sliderDisabled'],
})
export class CustomSlider extends BaseSlider { }
```

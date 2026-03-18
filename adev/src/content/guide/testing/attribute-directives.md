# Тестирование атрибутных директив {#testing-attribute-directives}

_Атрибутная директива_ изменяет поведение элемента, компонента или другой директивы.
Её название отражает способ применения директивы: в виде атрибута на хост-элементе.

## Тестирование директивы `Highlight` {#testing-the-highlight-directive}

Директива `Highlight` из примера приложения устанавливает цвет фона элемента на основе привязанного цвета или цвета по умолчанию (lightgray).
Также она устанавливает пользовательское свойство элемента (`customProperty`) в `true` — просто чтобы показать, что это возможно.

```ts
import {Directive, inject, input} from '@angular/core';

/**
 * Set backgroundColor for the attached element to highlight color
 * and set the element's customProperty attribute to true
 */
@Directive({
  selector: '[highlight]',
  host: {
    '[style.backgroundColor]': 'bgColor() || defaultColor',
  },
})
export class Highlight {
  readonly defaultColor = 'rgb(211, 211, 211)'; // lightgray

  readonly bgColor = input('', {alias: 'highlight'});
}
```

Директива используется во всём приложении, и наиболее просто — в компоненте `About`:

```ts
@Component({
  imports: [Twain, Highlight],
  template: `
    <h2 highlight="skyblue">About</h2>
    <h3>Quote of the day:</h3>
    <twain-quote />
  `,
})
export class About {}
```

Тестирование конкретного использования директивы `Highlight` внутри компонента `About` требует только техник, описанных в разделе [«Тесты вложенных компонентов»](guide/testing/components-scenarios#nested-component-tests) руководства [Сценарии тестирования компонентов](guide/testing/components-scenarios).

```ts
let fixture: ComponentFixture<About>;

beforeEach(async () => {
  TestBed.configureTestingModule({
    providers: [TwainService, UserService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  });
  fixture = TestBed.createComponent(About);
  await fixture.whenStable();
});

it('should have skyblue <h2>', () => {
  const h2: HTMLElement = fixture.nativeElement.querySelector('h2');
  const bgColor = h2.style.backgroundColor;
  expect(bgColor).toBe('skyblue');
});
```

Однако тестирование одного варианта использования вряд ли охватит весь диапазон возможностей директивы.
Поиск и тестирование всех компонентов, использующих директиву, утомителен, ненадёжен и также с трудом обеспечивает полное покрытие.

_Тесты только класса_ могут оказаться полезными, но атрибутные директивы, подобные этой, как правило, манипулируют DOM.
Изолированные модульные тесты не затрагивают DOM и, следовательно, не дают уверенности в эффективности директивы.

Лучшим решением является создание искусственного тестового компонента, который демонстрирует все способы применения директивы.

```angular-ts
@Component({
  imports: [Highlight],
  template: `
    <h2 highlight="yellow">Something Yellow</h2>
    <h2 highlight>The Default (Gray)</h2>
    <h2>No Highlight</h2>
    <input #box [highlight]="box.value" value="cyan" />
  `,
})
class Test {}
```

<img alt="HighlightDirective spec in action" src="assets/images/guide/testing/highlight-directive-spec.png">

ПОЛЕЗНО: Случай с `<input>` привязывает `Highlight` к имени значения цвета в поле ввода.
Начальное значение — слово «cyan», которое должно стать цветом фона поля ввода.

Вот некоторые тесты этого компонента:

```ts
let fixture: ComponentFixture<Test>;
let des: DebugElement[]; // the three elements w/ the directive

beforeEach(async () => {
  fixture = TestBed.createComponent(Test);
  await fixture.whenStable();

  // all elements with an attached Highlight
  des = fixture.debugElement.queryAll(By.directive(Highlight));
});

// color tests
it('should have three highlighted elements', () => {
  expect(des.length).toBe(3);
});

it('should color 1st <h2> background "yellow"', () => {
  const bgColor = des[0].nativeElement.style.backgroundColor;
  expect(bgColor).toBe('yellow');
});

it('should color 2nd <h2> background w/ default color', () => {
  const dir = des[1].injector.get(Highlight);
  const bgColor = des[1].nativeElement.style.backgroundColor;
  expect(bgColor).toBe(dir.defaultColor);
});

it('should bind <input> background to value color', async () => {
  // easier to work with nativeElement
  const input = des[2].nativeElement as HTMLInputElement;
  expect(input.style.backgroundColor, 'initial backgroundColor').toBe('cyan');

  input.value = 'green';

  // Dispatch a DOM event so that Angular responds to the input value change.
  input.dispatchEvent(new Event('input'));
  await fixture.whenStable();

  expect(input.style.backgroundColor, 'changed backgroundColor').toBe('green');
});

it('bare <h2> should not have a backgroundColor', () => {
  // the h2 without the Highlight directive
  const bareH2 = fixture.debugElement.query(By.css('h2:not([highlight])'));

  expect(bareH2.styles.backgroundColor).toBeUndefined();
});
```

Несколько техник заслуживают внимания:

- Предикат `By.directive` — отличный способ получить элементы с этой директивой _когда типы их элементов неизвестны_.
- [Псевдокласс `:not`](https://developer.mozilla.org/docs/Web/CSS/:not) в `By.css('h2:not([highlight])')` помогает найти элементы `<h2>`, _не имеющие_ директивы.
  `By.css('*:not([highlight])')` находит _любой_ элемент без директивы.

- `DebugElement.styles` обеспечивает доступ к стилям элементов даже в отсутствие реального браузера, благодаря абстракции `DebugElement`.
  Однако не стесняйтесь использовать `nativeElement`, когда это проще или понятнее абстракции.

- Angular добавляет директиву в инжектор элемента, к которому она применяется.
  Тест для цвета по умолчанию использует инжектор второго `<h2>` для получения экземпляра `Highlight` и его `defaultColor`.

- `DebugElement.properties` обеспечивает доступ к искусственному пользовательскому свойству, установленному директивой.

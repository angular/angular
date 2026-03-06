# Тестирование атрибутивных директив {#testing-attribute-directives}

_Атрибутивная директива_ изменяет поведение элемента, компонента или другой директивы.
Её название отражает способ применения: в виде атрибута на элементе-хосте.

## Тестирование директивы `Highlight` {#testing-the-highlight-directive}

Директива `Highlight` в примере приложения устанавливает цвет фона элемента на основе привязанного значения цвета или значения по умолчанию \(lightgray\).
Она также устанавливает пользовательское свойство элемента \(`customProperty`\) в значение `true` — просто чтобы показать, что это возможно.

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

Она используется во всём приложении, в том числе в компоненте `About`:

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

Тестирование конкретного использования директивы `Highlight` в компоненте `About` требует лишь тех техник, которые рассмотрены в разделе [«Тесты вложенных компонентов»](guide/testing/components-scenarios#nested-component-tests) руководства [Сценарии тестирования компонентов](guide/testing/components-scenarios).

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

Однако тестирование единственного сценария использования вряд ли охватит весь спектр возможностей директивы.
Поиск и тестирование всех компонентов, использующих директиву, — задача утомительная, хрупкая и тоже не гарантирующая полного покрытия.

_Тесты только на уровне класса_ могут помочь, но атрибутивные директивы, подобные этой, как правило, взаимодействуют с DOM.
Изолированные юнит-тесты не касаются DOM и поэтому не дают уверенности в корректной работе директивы.

Лучшее решение — создать искусственный тестовый компонент, демонстрирующий все варианты применения директивы.

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

HELPFUL: Случай с `<input>` привязывает директиву `Highlight` к значению цвета в поле ввода.
Начальное значение — слово «cyan», которое должно стать цветом фона поля.

Вот несколько тестов для этого компонента:

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

Несколько примечательных приёмов:

- Предикат `By.directive` — отличный способ найти элементы с данной директивой, _когда типы элементов неизвестны_
- [Псевдокласс `:not`](https://developer.mozilla.org/docs/Web/CSS/:not) в `By.css('h2:not([highlight])')` помогает найти элементы `<h2>`, у которых директива _отсутствует_.
  `By.css('*:not([highlight])')` найдёт _любой_ элемент без директивы.

- `DebugElement.styles` обеспечивает доступ к стилям элементов даже в отсутствие реального браузера, благодаря абстракции `DebugElement`.
  Тем не менее смело используйте `nativeElement`, если это удобнее или нагляднее.

- Angular добавляет директиву в инжектор элемента, к которому она применена.
  Тест для цвета по умолчанию использует инжектор второго `<h2>`, чтобы получить экземпляр `Highlight` и его `defaultColor`.

- `DebugElement.properties` обеспечивает доступ к пользовательскому свойству, устанавливаемому директивой

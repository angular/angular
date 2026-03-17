# Тестирование пайпов

Вы можете тестировать [пайпы](guide/templates/pipes) без использования утилит тестирования Angular.

## Тестирование `TitleCasePipe`

Класс пайпа (Pipe) имеет один метод, `transform`, который преобразует входное значение в выходное.
Реализация `transform` редко взаимодействует с DOM.
Большинство пайпов не зависят от Angular, за исключением метаданных `@Pipe` и интерфейса.

Рассмотрим `TitleCasePipe`, который делает заглавной первую букву каждого слова.
Вот реализация с использованием регулярного выражения.

```ts
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'titlecase', pure: true})
/** Transform to Title Case: uppercase the first letter of the words in a string. */
export class TitleCasePipe implements PipeTransform {
  transform(input: string): string {
    return input.length === 0
      ? ''
      : input.replace(/\w\S*/g, (txt) => txt[0].toUpperCase() + txt.slice(1).toLowerCase());
  }
}
```

Все, что использует регулярные выражения, стоит тщательно тестировать. Вы можете использовать стандартные техники
модульного тестирования для проверки ожидаемых сценариев и граничных случаев.

```ts
describe('TitleCasePipe', () => {
  // This pipe is a pure, stateless function so no need for BeforeEach
  const pipe = new TitleCasePipe();

  it('transforms "abc" to "Abc"', () => {
    expect(pipe.transform('abc')).toBe('Abc');
  });

  it('transforms "abc def" to "Abc Def"', () => {
    expect(pipe.transform('abc def')).toBe('Abc Def');
  });

  // ... more tests ...
});
```

## Написание DOM-тестов для поддержки тестирования пайпа

Это тесты пайпа _в изоляции_.
Они не могут показать, правильно ли работает `TitleCasePipe` при применении в компонентах приложения.

Рассмотрите возможность добавления тестов компонента, таких как этот:

```ts
it('should convert hero name to Title Case', async () => {
  // get the name's input and display elements from the DOM
  const hostElement: HTMLElement = harness.routeNativeElement!;
  const nameInput: HTMLInputElement = hostElement.querySelector('input')!;
  const nameDisplay: HTMLElement = hostElement.querySelector('span')!;

  // simulate user entering a new name into the input box
  nameInput.value = 'quick BROWN  fOx';

  // Dispatch a DOM event so that Angular learns of input value change.
  nameInput.dispatchEvent(new Event('input'));

  // Wait for Angular to update the display binding through the title pipe
  await harness.fixture.whenStable();

  expect(nameDisplay.textContent).toBe('Quick Brown  Fox');
});
```

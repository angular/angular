# Тестирование Signal Forms

Формы часто критичны для приложений, и тестирование даёт уверенность, что они ведут себя корректно при изменении кодовой базы. Signal Forms держат большую часть логики в схеме, а не в шаблоне, что значит: большинство поведения формы можно тестировать без рендера компонента.

Это руководство показывает, как настраивать такие тесты: начиная с изолированных тестов логики и затем переходя к тестам, привязанным к компоненту, для случаев, когда важно взаимодействие с DOM.

## Тестирование логики формы изолированно {#testing-form-logic-in-isolation}

Когда нужно только проверить валидацию, состояние disabled, required или вывод ошибок, тестируйте форму напрямую вместо рендера компонента. Изолированные тесты держат настройку небольшой и позволяют тесту сосредоточиться на поведении формы.

Ключевое требование — инжектор. Signal Forms нужен контекст внедрения во время создания формы. Если тест вызывает `form()` без него, вызов выбросит ошибку до того, как тест сможет что-то утверждать о форме.

Самый прямой способ удовлетворить это требование — передать инжектор явно. Следующий тест создаёт форму с правилом `required` и проверяет, что поле становится валидным после получения значения:

```ts {header: 'profile-form.spec.ts'}
import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, required} from '@angular/forms/signals';
import {describe, expect, it} from 'vitest';

describe('profileForm', () => {
  it('marks required fields as invalid until they have a value', () => {
    const model = signal({name: ''});

    const profileForm = form(
      model,
      (path) => {
        required(path.name);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(profileForm.name().valid()).toBe(false);
    expect(profileForm.name().errors()).toEqual([expect.objectContaining({kind: 'required'})]);

    profileForm.name().value.set('Ada');

    expect(profileForm.name().valid()).toBe(true);
    expect(profileForm.name().errors()).toEqual([]);
  });
});
```

Этот паттерн хорошо работает для большинства изолированных тестов, потому что требование инжектора остаётся видимым в месте вызова. Он также зеркалит то, как unit-тесты Signal Forms в исходниках Angular создают формы.

Когда тестируемый код вызывает `form()` внутренне, вы можете не иметь возможности передать инжектор напрямую. В этом случае оберните вызов в ambient-контекст внедрения:

```ts {header: 'profile-form.spec.ts'}
import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, required} from '@angular/forms/signals';
import {describe, expect, it} from 'vitest';

describe('profileForm', () => {
  it('can create a form inside an injection context', () => {
    const model = signal({name: ''});

    TestBed.runInInjectionContext(() => {
      const profileForm = form(model, (path) => {
        required(path.name);
      });

      expect(profileForm.name().valid()).toBe(false);
    });
  });
});
```

Оба паттерна создают один и тот же вид формы. Передача `{injector}` часто самый ясный выбор, когда тест создаёт форму напрямую. `TestBed.runInInjectionContext()` полезен, когда тестируемый код вызывает `form()` внутренне и нужно предоставить окружающий контекст внедрения.

Когда форма существует, тестируйте её через сигналы состояния полей. Типичные утверждения включают `valid()`, `invalid()`, `disabled()`, `required()` и `errors()`. Для большинства логики формы этого достаточно, чтобы проверить поведение без участия DOM.

## Тестирование формы с несколькими правилами {#testing-a-form-with-multiple-rules}

После настройки инжектора хороший следующий шаг — полный тест, который упражняет несколько частей логики формы вместе. Такой тест всё ещё изолирован, но гораздо ближе к реальной форме приложения.

Например, этот тест проверяет и базовое правило required, и условное правило required, зависящее от другого поля:

```ts {header: 'profile-form.spec.ts'}
import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, required} from '@angular/forms/signals';
import {describe, expect, it} from 'vitest';

describe('profileForm', () => {
  it('updates validation state when related fields change', () => {
    const model = signal({
      name: '',
      age: 5,
    });

    const profileForm = form(
      model,
      (path) => {
        required(path.name);
        required(path.name, {
          error: (ctx) => ({kind: `required-${ctx.valueOf(path.age)}`}),
          when: ({valueOf}) => valueOf(path.age) > 10,
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(profileForm.name().invalid()).toBe(true);
    expect(profileForm.name().errors()).toEqual([expect.objectContaining({kind: 'required'})]);

    profileForm.age().value.set(15);

    expect(profileForm.name().errors()).toEqual([
      expect.objectContaining({kind: 'required'}),
      expect.objectContaining({kind: 'required-15'}),
    ]);

    profileForm.name().value.set('Ada');

    expect(profileForm.name().valid()).toBe(true);
    expect(profileForm.name().errors()).toEqual([]);
  });
});
```

Этот пример показывает важный паттерн тестирования: обновите одно поле, затем утверждайте против состояния другого поля. Поскольку правила Signal Forms реактивны, валидация поля может зависеть от значений соседей, родителя или других производных условий. Тесты должны проверять эти отношения напрямую, а не только проверять поле, которое изменилось.

Для тестов, ориентированных на валидацию, `errors()` обычно самое полезное утверждение. `valid()` и `invalid()` говорят, проходит ли поле валидацию сейчас, а `errors()` показывает, какое правило вызвало сбой. Это особенно полезно, когда у поля несколько валидаторов или условных правил.

Та же структура работает для большинства повседневных тестов форм:

1. Создайте signal модели с наименьшей формой, воспроизводящей поведение.
1. Постройте форму с явным инжектором.
1. Утвердите начальное состояние поля.
1. Измените поле через `.value.set(...)`, включая соседние поля при тестировании cross-field правил.
1. Утвердите обновлённые сигналы состояния, обычно `errors()`, `valid()` или `invalid()`.

Когда тест о поведении схемы, а не о рендере, по умолчанию используйте этот изолированный стиль. Он быстрее компонентного теста и упрощает понимание, какое правило отвечает за изменение поведения.

## Тестирование форм, привязанных к компонентам {#testing-forms-bound-to-components}

Когда нужно проверить поведение, зависящее от привязок шаблона, взаимодействия пользователя через `dispatchEvent` или пользовательских form controls, управляющих собственным рендером, изолированных тестов недостаточно. Нужны тесты, привязанные к компоненту, чтобы отрендерить шаблон и взаимодействовать с реальными DOM-элементами.

### Настройка компонентного теста {#setting-up-a-component-test}

Тесты, привязанные к компоненту, рендерят компонент, чтобы можно было взаимодействовать с реальными DOM-элементами. Создайте компонент с `TestBed.createComponent()` и дождитесь завершения рендера перед утверждениями:

```angular-ts {header: 'profile-form.ts'}
import {Component, signal} from '@angular/core';
import {form, FormField, required} from '@angular/forms/signals';

@Component({
  selector: 'app-profile-form',
  imports: [FormField],
  template: `<input [formField]="profileForm.name" />`,
})
export class ProfileForm {
  readonly model = signal({name: 'Ada'});
  readonly profileForm = form(this.model, (path) => {
    required(path.name);
  });
}
```

```ts {header: 'profile-form.spec.ts'}
import {TestBed} from '@angular/core/testing';
import {describe, expect, it} from 'vitest';
import {ProfileForm} from './profile-form';

describe('ProfileForm', () => {
  it('reflects model values in the DOM and updates the model on user input', async () => {
    const fixture = TestBed.createComponent(ProfileForm);
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    // Model → View: the input reflects the model's initial value
    expect(input.value).toBe('Ada');

    // View → Model: simulate the user clearing the field
    input.value = '';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.profileForm.name().value()).toBe('');
    expect(fixture.componentInstance.profileForm.name().valid()).toBe(false);
  });
});
```

Обратите внимание: компонент использует `form()` без явного инжектора, потому что собственный контекст внедрения компонента предоставляет его автоматически. После каждого изменения `await fixture.whenStable()` ждёт завершения рендера и effects перед утверждениями.

Тот же паттерн работает для async-операций, таких как async-валидаторы или серверные вызовы. Вызывайте `await fixture.whenStable()` после разрешения async-работы.

## Когда использовать каждый подход {#when-to-use-each-approach}

| Что нужно проверить                                  | Подход          |
| ---------------------------------------------------- | --------------- |
| Правила валидации, `errors()`, `valid()`, `invalid()` | Изолированный   |
| Состояние disabled, required или readonly            | Изолированный   |
| Cross-field реактивные зависимости                   | Изолированный   |
| Условные схемы (`applyWhen`, `applyWhenValue`)       | Изолированный   |
| Значения input, рендерящиеся в DOM                   | Привязанный к компоненту |
| Ввод пользователя, обновляющий модель                | Привязанный к компоненту |
| Пользовательские form controls с собственными шаблонами | Привязанный к компоненту |
| Управление фокусом или атрибуты доступности          | Привязанный к компоненту |

Большинству форм нужны только изолированные тесты. Логика формы (валидация, состояние disabled, cross-field правила) живёт в схеме, и схемам не нужен шаблон для выполнения. Тесты, привязанные к компоненту, добавляют ценность, когда поведение, которое вас интересует, пересекает границу между формой и DOM.

## Следующие шаги {#next-steps}

Это руководство охватило тестирование Signal Forms изолированно и с шаблонами компонентов. Связанные руководства, исследующие другие аспекты Signal Forms:

<docs-pill-row>
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
  <docs-pill href="guide/forms/signals/form-submission" title="Form submission" />
</docs-pill-row>

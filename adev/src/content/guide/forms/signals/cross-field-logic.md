# Cross-field логика

**Cross-field логика** необходима, когда любое правило, валидация или поведение одного поля зависит от значения или состояния другого поля.

Signal forms предоставляют **контекст поля** каждой функции правила. Контекст поля даёт доступ к значению и состоянию текущего поля и позволяет читать другие поля формы через `valueOf()`, `stateOf()` и `fieldTreeOf()`.

Это руководство подробно описывает API контекста поля и показывает распространённые cross-field паттерны. Для валидации одного поля см. [руководство по валидации](/guide/forms/signals/validation).

## Понимание контекста поля {#understanding-the-field-context}

Каждая функция правила в signal forms получает параметр **контекста поля** — объект, описывающий текущее поле и предоставляющий доступ к остальной форме.

Есть три свойства, к которым можно обращаться для текущего поля:

| Свойство    | Тип                  | Описание                                                             |
| ----------- | -------------------- | -------------------------------------------------------------------- |
| `value`     | `Signal<TValue>`     | Значение текущего поля как сигнал                                    |
| `state`     | `FieldState<TValue>` | Состояние текущего поля (валидность, ошибки, touched, dirty)         |
| `fieldTree` | `FieldTree<TValue>`  | Дерево текущего поля для программного доступа к дочерним полям       |

Для cross-field логики следующие три свойства позволяют обращаться к другим частям формы:

| Свойство        | Тип                            | Описание                                                                                                                        |
| --------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `valueOf()`     | `(path) => PValue`             | Самый распространённый. Когда нужно сырое значение другого поля для сравнений или вычислений.                                   |
| `stateOf()`     | `(path) => FieldState<PValue>` | Когда логика зависит от состояния другого поля — валидно ли оно, touched или dirty.                                             |
| `fieldTreeOf()` | `(path) => FieldTree<PModel>`  | Когда нужен программный доступ к дереву другого поля, например для передачи ошибок конкретному дочернему полю через validateTree. |

Пример использования `value` и `valueOf()` для валидации того, что текущее поле (дата окончания) идёт после даты начала в форме:

```ts
import {Component, signal} from '@angular/core';
import {form, validate} from '@angular/forms/signals';

@Component({
  /* ... */
})
export class EventForm {
  eventModel = signal({
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-06-05'),
  });

  eventForm = form(this.eventModel, (schemaPath) => {
    validate(schemaPath.endDate, ({value, valueOf}) => {
      if (value() <= valueOf(schemaPath.startDate)) {
        return {
          kind: 'invalidDateRange',
          message: 'End date must be after start date',
        };
      }

      return null;
    });
  });
}
```

NOTE: Параметр `fieldContext` обычно деструктурируют, чтобы извлечь только то, что нужно правилу. Остальные примеры в этом руководстве используют этот паттерн.

## Паттерны cross-field валидации {#cross-field-validation-patterns}

Пример диапазона дат из предыдущего раздела валидирует дату окончания относительно даты начала. Поскольку правило читает `valueOf(schemaPath.startDate)`, оно автоматически переоценивается при изменении любой из дат. Иными словами, одного валидатора достаточно, чтобы состояние ошибки оставалось корректным.

Однако этот один валидатор размещает ошибку только на поле даты окончания. Если нужно, чтобы оба поля показывали ошибку при невалидном диапазоне, добавьте соответствующее правило валидации к каждому полю:

```ts
import {Component, signal} from '@angular/core';
import {form, validate} from '@angular/forms/signals';

@Component({
  /* ... */
})
export class EventForm {
  eventModel = signal({
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-06-05'),
  });

  eventForm = form(this.eventModel, (schemaPath) => {
    validate(schemaPath.startDate, ({value, valueOf}) => {
      if (value() >= valueOf(schemaPath.endDate)) {
        return {
          kind: 'invalidDateRange',
          message: 'Start date must be before end date',
        };
      }
      return null;
    });

    validate(schemaPath.endDate, ({value, valueOf}) => {
      if (value() <= valueOf(schemaPath.startDate)) {
        return {
          kind: 'invalidDateRange',
          message: 'End date must be after start date',
        };
      }
      return null;
    });
  });
}
```

Оба правила используют `valueOf()` для чтения другого поля. Поскольку каждое правило реактивно, изменение любой даты автоматически переоценивает обе валидации.

NOTE: Когда правило затрагивает несколько полей, нужно решить, где должна быть ошибка: на конкретном поле, на нескольких полях или на родителе. В общем случае размещайте ошибку там, куда пользователь с наибольшей вероятностью пойдёт, чтобы исправить проблему.

### Условные требования {#conditional-requirements}

В некоторых формах определённые поля обязательны только при определённых условиях. Например, форма регистрации может требовать название компании только когда пользователь выбирает тип бизнес-аккаунта:

```ts
import {Component, signal} from '@angular/core';
import {form, required} from '@angular/forms/signals';

@Component({
  /* ... */
})
export class RegistrationForm {
  registrationModel = signal({
    accountType: 'personal' as 'personal' | 'business',
    companyName: '',
  });

  registrationForm = form(this.registrationModel, (schemaPath) => {
    required(schemaPath.companyName, {
      when: ({valueOf}) => valueOf(schemaPath.accountType) === 'business',
      message: 'Company name is required for business accounts',
    });
  });
}
```

Опция `when` получает тот же контекст поля, что и любая другая функция правила, поэтому `valueOf` работает так же. Когда пользователь переключается обратно на `'personal'`, условие переоценивается и требование — вместе с его ошибкой — очищается автоматически.

Использование `required()` с `when` вместо ручной проверки `validate()` также добавляет корректные метаданные required к полю, что включает возможности доступности вроде пометки поля как обязательного для screen readers.

### Валидация на основе состояния другого поля {#validating-based-on-another-fields-state}

Примеры до сих пор используют `valueOf()` для чтения значения другого поля. Иногда логика зависит от _состояния_ другого поля — валидно ли оно, touched или dirty. Для этого используйте `stateOf()`.

Например, поле confirm-password должно проверять совпадение только после того, как пользователь взаимодействовал с полем password. Если пользователь ещё не трогал password, помечать несовпадение на подтверждении преждевременно:

```ts
import {Component, signal} from '@angular/core';
import {form, validate} from '@angular/forms/signals';

@Component({
  /* ... */
})
export class PasswordForm {
  passwordModel = signal({
    password: '',
    confirmPassword: '',
  });

  passwordForm = form(this.passwordModel, (schemaPath) => {
    validate(schemaPath.confirmPassword, ({value, valueOf, stateOf}) => {
      if (!stateOf(schemaPath.password).touched()) {
        return null;
      }
      if (value() !== valueOf(schemaPath.password)) {
        return {
          kind: 'passwordMismatch',
          message: 'Passwords do not match',
        };
      }
      return null;
    });
  });
}
```

Вызов `stateOf()` возвращает [состояние поля](api/forms/signals/FieldState) другого поля, давая доступ к сигналам вроде `invalid()`, `touched()` и `dirty()`. Поскольку это сигналы, правило переоценивается при изменении валидности поля password.

CRITICAL: Будьте осторожны, не читайте состояние, которое зависит от валидации вашего поля — это создаёт циклический цикл. Например, валидатор, проверяющий, валидно ли родительское поле, создаст бесконечный цикл, потому что валидность родителя зависит от валидности его потомков (включая ваш валидатор).

## Использование validateTree {#using-validatetree}

Примеры до сих пор используют `validate()` для проверки отдельных полей. Иногда нужно валидировать группу полей, где логика по сути о нескольких полях в группе, и направлять ошибки конкретным потомкам внутри неё. `validateTree` идеален для таких сценариев.

Например, в головоломке Sudoku каждая строка должна содержать уникальные числа. Это правило уровня группы: вы проверяете всю строку, затем помечаете конкретные ячейки, которые его нарушают. Такую валидацию нельзя чисто выразить через `validate` на отдельных полях, потому что каждой ячейке нужно знать о каждой другой ячейке.

```ts
import {Component, signal} from '@angular/core';
import {form, validateTree} from '@angular/forms/signals';

@Component({
  /* ... */
})
export class SudokuRow {
  rowModel = signal({
    cell1: 1,
    cell2: 3,
    cell3: 1,
    cell4: 4,
  });

  rowForm = form(this.rowModel, (schemaPath) => {
    validateTree(schemaPath, ({value, fieldTreeOf}) => {
      const row = value();
      const entries = [
        {val: row.cell1, fieldTree: fieldTreeOf(schemaPath.cell1)},
        {val: row.cell2, fieldTree: fieldTreeOf(schemaPath.cell2)},
        {val: row.cell3, fieldTree: fieldTreeOf(schemaPath.cell3)},
        {val: row.cell4, fieldTree: fieldTreeOf(schemaPath.cell4)},
      ];

      const counts = new Map<number, number>();
      for (const {val} of entries) {
        if (val !== 0) {
          counts.set(val, (counts.get(val) ?? 0) + 1);
        }
      }

      const errors = entries
        .filter(({val}) => val !== 0 && (counts.get(val) ?? 0) > 1)
        .map(({val, fieldTree}) => ({
          kind: 'duplicateInRow',
          message: `${val} already appears in this row`,
          fieldTree,
        }));

      return errors.length > 0 ? errors : null;
    });
  });
}
```

Валидатор выполняется на родительском поле (строке), читает все значения ячеек, считает дубликаты и возвращает ошибку для каждой ячейки, содержащей повторяющееся число. Свойство `fieldTree` на каждой ошибке сообщает Angular, какая именно ячейка должна показать ошибку. Без `fieldTree` ошибки применялись бы к самой строке — не туда, где пользователю нужно их видеть.

Поскольку `validateTree` может возвращать массив ошибок, один валидатор может пометить несколько ячеек сразу. Каждая ошибка включает `fieldTree`, указывающий на цель, поэтому Angular направляет ошибки к корректным полям.

### Когда использовать validateTree vs validate {#when-to-use-validatetree-vs-validate}

Предпочитайте `validate()` с `valueOf()`, когда ошибка принадлежит полю, которое валидируется — даже если правило читает из других полей. Обращайтесь к `validateTree`, когда:

- Логика валидации по сути о группе полей, а не о любом одном поле
- Валидатору нужно возвращать ошибки, нацеленные на разные дочерние поля

TIP: Введение в `validateTree` и его тип возврата см. в [руководстве по валидации](/guide/forms/signals/validation).

## Следующие шаги {#next-steps}

Это руководство охватило API контекста поля и распространённые cross-field паттерны. Чтобы узнать больше о связанных руководствах Signal Forms:

<docs-pill-row>
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
  <docs-pill href="guide/forms/signals/custom-controls" title="Custom controls" />
</docs-pill-row>

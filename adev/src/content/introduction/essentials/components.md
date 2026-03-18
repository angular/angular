<docs-decorative-header title="Компоненты" imgSrc="adev/src/assets/images/components.svg"> <!-- markdownlint-disable-line -->
Основной строительный блок для создания приложений в Angular.
</docs-decorative-header>

Компоненты — это главные строительные блоки Angular-приложений. Каждый компонент представляет собой часть более крупной веб-страницы. Организация приложения в компоненты помогает структурировать проект, чётко разделяя код на конкретные части, которые удобно поддерживать и развивать со временем.

## Определение компонента {#defining-a-component}

Каждый компонент состоит из нескольких основных частей:

1. [Декоратор](https://www.typescriptlang.org/docs/handbook/decorators.html) `@Component`, содержащий конфигурацию, используемую Angular.
2. HTML-шаблон, управляющий тем, что отображается в DOM.
3. [CSS-селектор](https://developer.mozilla.org/docs/Learn/CSS/Building_blocks/Selectors), определяющий, как компонент используется в HTML.
4. Класс TypeScript с поведением, например обработкой пользовательского ввода или выполнением запросов к серверу.

Вот упрощённый пример компонента `UserProfile`.

```angular-ts
// user-profile.ts
@Component({
  selector: 'user-profile',
  template: `
    <h1>User profile</h1>
    <p>This is the user profile page</p>
  `,
})
export class UserProfile {
  /* Your component code goes here */
}
```

Декоратор `@Component` также опционально принимает свойство `styles` для CSS, которые вы хотите применить к своему шаблону:

```angular-ts
// user-profile.ts
@Component({
  selector: 'user-profile',
  template: `
    <h1>User profile</h1>
    <p>This is the user profile page</p>
  `,
  styles: `
    h1 {
      font-size: 3em;
    }
  `,
})
export class UserProfile {
  /* Your component code goes here */
}
```

### Разделение HTML и CSS на отдельные файлы {#separating-html-and-css-into-separate-files}

Вы можете определить HTML и CSS компонента в отдельных файлах с помощью `templateUrl` и `styleUrl`:

```angular-ts
// user-profile.ts
@Component({
  selector: 'user-profile',
  templateUrl: 'user-profile.html',
  styleUrl: 'user-profile.css',
})
export class UserProfile {
  // Component behavior is defined in here
}
```

```angular-html
<!-- user-profile.html -->
<h1>User profile</h1>
<p>This is the user profile page</p>
```

```css
/* user-profile.css */
h1 {
  font-size: 3em;
}
```

## Использование компонентов {#using-components}

Приложение создаётся путём объединения нескольких компонентов. Например, если вы строите страницу профиля пользователя, вы можете разбить страницу на несколько компонентов вот так:

```mermaid
flowchart TD
    A[UserProfile]-->B
    A-->C
    B[UserBiography]-->D
    C[ProfilePhoto]
    D[UserAddress]
```

Здесь компонент `UserProfile` использует несколько других компонентов для формирования итоговой страницы.

Чтобы импортировать и использовать компонент, необходимо:

1. В TypeScript-файле вашего компонента добавить оператор `import` для компонента, который вы хотите использовать.
2. В декораторе `@Component` добавить запись в массив `imports` для нужного компонента.
3. В шаблоне компонента добавить элемент, соответствующий селектору используемого компонента.

Вот пример компонента `UserProfile`, импортирующего компонент `ProfilePhoto`:

```angular-ts
// user-profile.ts
import {ProfilePhoto} from 'profile-photo.ts';

@Component({
  selector: 'user-profile',
  imports: [ProfilePhoto],
  template: `
    <h1>User profile</h1>
    <profile-photo />
    <p>This is the user profile page</p>
  `,
})
export class UserProfile {
  // Component behavior is defined in here
}
```

TIP: Хотите узнать больше о компонентах Angular? Смотрите [Углубленное руководство по компонентам](guide/components) для получения полной информации.

## Следующий шаг {#next-step}

Теперь, когда вы знаете, как работают компоненты в Angular, пришло время узнать, как добавлять и управлять динамическими данными в приложении.

<docs-pill-row>
  <docs-pill title="Реактивность с сигналами" href="essentials/signals" />
  <docs-pill title="Углубленное руководство по компонентам" href="guide/components" />
</docs-pill-row>

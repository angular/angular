<docs-decorative-header title="Компоненты" imgSrc="adev/src/assets/images/components.svg"> <!-- markdownlint-disable-line -->
Основной строительный блок для создания приложений в Angular.
</docs-decorative-header>

Компоненты являются главными строительными блоками приложений Angular. Каждый компонент представляет собой часть более крупной веб-страницы. Организация приложения в компоненты помогает структурировать ваш проект, четко разделяя код на отдельные части, которые легко поддерживать и развивать с течением времени.

## Определение компонента {#defining-a-component}

Каждый компонент состоит из нескольких основных частей:

1. [Декоратор](https://www.typescriptlang.org/docs/handbook/decorators.html) `@Component`, содержащий конфигурацию, используемую Angular.
2. HTML-шаблон, который управляет тем, что отрисовывается в DOM.
3. [CSS-селектор](https://developer.mozilla.org/docs/Learn/CSS/Building_blocks/Selectors), который определяет, как компонент используется в HTML.
4. Класс TypeScript с поведением, таким как обработка пользовательского ввода или выполнение запросов к серверу.

Вот упрощенный пример компонента `UserProfile`.

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

Декоратор `@Component` также опционально принимает свойство `styles` для любого CSS, который вы хотите применить к вашему шаблону:

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

### Вынесение HTML и CSS в отдельные файлы {#separating-html-and-css-into-separate-files}

Вы можете определить HTML и CSS компонента в отдельных файлах, используя `templateUrl` и `styleUrl`:

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

Приложение строится путем композиции нескольких компонентов вместе. Например, если вы создаете страницу профиля пользователя, вы можете разбить страницу на несколько компонентов следующим образом:

```mermaid
flowchart TD
    A[UserProfile]-->B
    A-->C
    B[UserBiography]-->D
    C[ProfilePhoto]
    D[UserAddress]
```

Здесь компонент `UserProfile` использует несколько других компонентов для создания итоговой страницы.

Чтобы импортировать и использовать компонент, вам нужно:

1. В TypeScript-файле вашего компонента добавить оператор `import` для компонента, который вы хотите использовать.
2. В декораторе `@Component` добавить запись в массив `imports` для компонента, который вы хотите использовать.
3. В шаблоне вашего компонента добавить элемент, соответствующий селектору компонента, который вы хотите использовать.

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

Теперь, когда вы знаете, как работают компоненты в Angular, пришло время узнать, как мы добавляем и управляем динамическими данными в нашем приложении.

<docs-pill-row>
  <docs-pill title="Реактивность с сигналами" href="essentials/signals" />
  <docs-pill title="Углубленное руководство по компонентам" href="guide/components" />
</docs-pill-row>

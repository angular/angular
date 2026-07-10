# Безопасность

В этой теме описаны встроенные защиты Angular от распространённых уязвимостей веб-приложений и атак, таких как cross-site scripting.
Тема не охватывает безопасность на уровне приложения — аутентификацию и авторизацию.

Подробнее об атаках и мерах защиты ниже — в [руководстве Open Web Application Security Project (OWASP)](https://www.owasp.org/index.php/Category:OWASP_Guide_Project).

<a id="report-issues"></a>

<docs-callout title="Reporting vulnerabilities">

Angular входит в Google [Open Source Software Vulnerability Reward Program](https://bughunters.google.com/about/rules/6521337925468160/google-open-source-software-vulnerability-reward-program-rules). Уязвимости в Angular сообщайте на [https://bughunters.google.com](https://bughunters.google.com/report).

О том, как Google обрабатывает вопросы безопасности, см. [философию безопасности Google](https://www.google.com/about/appsecurity).

</docs-callout>

## Лучшие практики {#best-practices}

Ниже — практики, которые помогают сделать Angular-приложение безопасным.

1. **Следите за актуальными релизами библиотек Angular** — библиотеки Angular регулярно обновляются, и обновления могут исправлять уязвимости, найденные в предыдущих версиях. Смотрите [change log](https://github.com/angular/angular/blob/main/CHANGELOG.md) Angular на предмет обновлений, связанных с безопасностью.
2. **Не изменяйте свою копию Angular** — частные кастомные версии Angular обычно отстают от текущей и могут не включать важные исправления и улучшения безопасности. Вместо этого делитесь улучшениями с сообществом и делайте pull request.
3. **Избегайте Angular API, помеченных в документации как "_Security Risk_"** — подробнее см. раздел [Доверие безопасным значениям](#trusting-safe-values) на этой странице.

## Предотвращение cross-site scripting (XSS) {#preventing-cross-site-scripting-xss}

[Cross-site scripting (XSS)](https://en.wikipedia.org/wiki/Cross-site_scripting) позволяет злоумышленникам внедрять вредоносный код в веб-страницы.
Такой код может, например, красть данные пользователя и логины или выполнять действия от имени пользователя.
Это одна из самых распространённых атак в вебе.

Чтобы блокировать XSS, нужно не допускать попадания вредоносного кода в Document Object Model (DOM).
Например, если злоумышленники заставят вас вставить тег `<script>` в DOM, они смогут выполнить произвольный код на сайте.
Атака не ограничивается тегами `<script>` — многие элементы и свойства DOM позволяют выполнять код, например `<img alt="" onerror="...">` и `<a href="javascript:...">`.
Если данные, контролируемые злоумышленником, попадают в DOM, ждите уязвимостей.

### Модель безопасности Angular против XSS {#angulars-cross-site-scripting-security-model}

Чтобы системно блокировать XSS-баги, Angular по умолчанию считает все значения недоверенными.
Когда значение вставляется в DOM из привязки шаблона или интерполяции, Angular санитизирует и экранирует недоверенные значения.
Если значение уже санитизировано вне Angular и считается безопасным, сообщите об этом Angular, пометив [значение как доверенное](#trusting-safe-values).

В отличие от значений для рендеринга, шаблоны Angular по умолчанию считаются доверенными и должны рассматриваться как исполняемый код.
Никогда не создавайте шаблоны конкатенацией пользовательского ввода и синтаксиса шаблона.
Это позволило бы злоумышленникам [внедрять произвольный код](https://en.wikipedia.org/wiki/Code_injection) в приложение.
Чтобы предотвратить такие уязвимости, всегда используйте компилятор шаблонов [Ahead-Of-Time (AOT)](#use-the-aot-template-compiler) по умолчанию в production-развёртываниях.

Дополнительный слой защиты дают Content Security Policy и Trusted Types.
Эти возможности веб-платформы работают на уровне DOM — самом эффективном месте для предотвращения XSS. Их нельзя обойти через другие, более низкоуровневые API.
Поэтому настоятельно рекомендуется ими пользоваться. Для этого настройте [content security policy](#content-security-policy) приложения и включите [enforcement Trusted Types](#enforcing-trusted-types).

### Санитизация и контексты безопасности {#sanitization-and-security-contexts}

_Санитизация_ — проверка недоверенного значения и превращение его в значение, безопасное для вставки в DOM.
Во многих случаях санитизация вообще не меняет значение.
Санитизация зависит от контекста.
Например, значение, безвредное в CSS, потенциально опасно в URL.

Angular определяет следующие контексты безопасности:

| Контекст безопасности | Подробности                                                                    |
| :-------------------- | :----------------------------------------------------------------------------- |
| HTML                  | Когда значение интерпретируется как HTML, например при привязке к `innerHtml`. |
| Style                 | При привязке CSS к свойству `style`.                                           |
| URL                   | Для URL-свойств, например `<a href>`.                                          |
| Resource URL          | URL, который загружается и выполняется как код, например в `<script src>`.     |

Angular санитизирует недоверенные значения для HTML и URL. Санитизировать resource URL нельзя, потому что они содержат произвольный код.
В режиме разработки Angular пишет предупреждение в консоль, когда при санитизации приходится изменить значение.

### Пример санитизации {#sanitization-example}

Следующий шаблон привязывает значение `htmlSnippet`. Один раз — интерполяцией в содержимое элемента, второй — привязкой к свойству `innerHTML` элемента:

<docs-code header="inner-html-binding.component.html" path="adev/src/content/examples/security/src/app/inner-html-binding.component.html"/>

Интерполированный контент всегда экранируется — HTML не интерпретируется, и браузер показывает угловые скобки в текстовом содержимом элемента.

Чтобы HTML интерпретировался, привяжите его к HTML-свойству вроде `innerHTML`.
Учтите: привязка значения, которое может контролировать злоумышленник, к `innerHTML` обычно создаёт XSS-уязвимость.
Например, JavaScript можно выполнить так:

<docs-code header="inner-html-binding.component.ts (class)" path="adev/src/content/examples/security/src/app/inner-html-binding.component.ts" region="class"/>

Angular распознаёт значение как небезопасное и автоматически санитизирует его: удаляет элемент `script`, но сохраняет безопасный контент вроде элемента `<b>`.

<img alt="A screenshot showing interpolated and bound HTML values" src="assets/images/guide/security/binding-inner-html.png#small">

### Прямое использование DOM API и явные вызовы санитизации {#direct-use-of-the-dom-apis-and-explicit-sanitization-calls}

Если вы не включаете Trusted Types, встроенные browser DOM API не защищают автоматически от уязвимостей.
Например, `document`, узел через `ElementRef` и многие сторонние API содержат небезопасные методы.
Аналогично, при взаимодействии с другими библиотеками, манипулирующими DOM, у вас, скорее всего, не будет той же автоматической санитизации, что у интерполяций Angular.
По возможности избегайте прямого взаимодействия с DOM и используйте шаблоны Angular.

Если этого не избежать, используйте встроенные функции санитизации Angular.
Санитизируйте недоверенные значения методом [DomSanitizer.sanitize](api/platform-browser/DomSanitizer#sanitize) и подходящим `SecurityContext`.
Эта функция также принимает значения, помеченные как доверенные через функции `bypassSecurityTrust`, и не санитизирует их, как [описано ниже](#trusting-safe-values).

### Доверие безопасным значениям {#trusting-safe-values}

Иногда приложениям действительно нужно включить исполняемый код, показать `<iframe>` с какого-то URL или построить потенциально опасные URL.
Чтобы предотвратить автоматическую санитизацию в таких ситуациях, сообщите Angular, что вы проверили значение, как оно создано, и убедились в его безопасности.
Будьте _осторожны_.
Если вы доверяете значению, которое может быть вредоносным, вы вносите уязвимость в приложение.
При сомнениях обратитесь к профессиональному security-ревьюеру.

Чтобы пометить значение как доверенное, внедрите `DomSanitizer` и вызовите один из методов:

- `bypassSecurityTrustHtml`
- `bypassSecurityTrustScript`
- `bypassSecurityTrustStyle`
- `bypassSecurityTrustUrl`
- `bypassSecurityTrustResourceUrl`

Помните: безопасность значения зависит от контекста — выбирайте правильный контекст для предполагаемого использования.
Представьте, что следующий шаблон должен привязать URL к вызову `javascript:alert(...)`:

<docs-code header="bypass-security.component.html (URL)" path="adev/src/content/examples/security/src/app/bypass-security.component.html" region="URL"/>

Обычно Angular автоматически санитизирует URL, отключает опасный код и в режиме разработки логирует это в консоль.
Чтобы этого не произошло, пометьте значение URL как доверенный URL вызовом `bypassSecurityTrustUrl`:

<docs-code header="bypass-security.component.ts (trust-url)" path="adev/src/content/examples/security/src/app/bypass-security.component.ts" region="trust-url"/>

<img alt="A screenshot showing an alert box created from a trusted URL" src="assets/images/guide/security/bypass-security-component.png#medium">

Если нужно преобразовать пользовательский ввод в доверенное значение, используйте метод компонента.
Следующий шаблон позволяет пользователям ввести ID видео YouTube и загрузить соответствующее видео в `<iframe>`.
Атрибут `<iframe src>` — это контекст безопасности resource URL, потому что недоверенный источник может, например, протащить загрузки файлов, которые ничего не подозревающие пользователи могут запустить.
Чтобы предотвратить это, вызовите метод компонента для построения доверенного URL видео — тогда Angular разрешит привязку к `<iframe src>`:

<docs-code header="bypass-security.component.html (iframe)" path="adev/src/content/examples/security/src/app/bypass-security.component.html" region="iframe"/>

<docs-code header="bypass-security.component.ts (trust-video-url)" path="adev/src/content/examples/security/src/app/bypass-security.component.ts" region="trust-video-url"/>

### Content security policy {#content-security-policy}

Content Security Policy \(CSP\) — техника defense-in-depth для предотвращения XSS.
Чтобы включить CSP, настройте веб-сервер так, чтобы он возвращал подходящий HTTP-заголовок `Content-Security-Policy`.
Подробнее о content security policy — в [Web Fundamentals guide](https://developers.google.com/web/fundamentals/security/csp) на сайте Google Developers.

Минимальная политика для нового Angular-приложения:

```txt
default-src 'self'; style-src 'self' 'nonce-randomNonceGoesHere'; script-src 'self' 'nonce-randomNonceGoesHere';
```

При отдаче Angular-приложения сервер должен включать случайно сгенерированный nonce в HTTP-заголовок для каждого запроса.
Этот nonce нужно передать Angular, чтобы фреймворк мог рендерить элементы `<style>`.
Nonce для Angular можно задать одним из способов:

1. Установить опцию `autoCsp` в `true` в [конфигурации workspace](reference/configs/workspace-config#extra-build-and-test-options).
1. Задать атрибут `ngCspNonce` на корневом элементе приложения: `<app ngCspNonce="randomNonceGoesHere"></app>`. Используйте этот подход, если есть доступ к серверному шаблонизатору, который может добавить nonce и в заголовок, и в `index.html` при формировании ответа.
1. Предоставить nonce через injection token `CSP_NONCE`. Используйте этот подход, если nonce доступен во время выполнения и вы хотите кэшировать `index.html`.

```ts
import {bootstrapApplication, CSP_NONCE} from '@angular/core';
import {AppComponent} from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: CSP_NONCE,
      useValue: globalThis.myRandomNonceValue,
    },
  ],
});
```

<docs-callout title="Unique nonces">

Всегда следите, чтобы предоставляемые nonce были <strong>уникальны для каждого запроса</strong> и не были предсказуемы или угадываемы.
Если злоумышленник может предсказать будущие nonce, он обойдёт защиты CSP.

Генерировать nonce на origin-сервере обычно не рекомендуется при использовании CDN, так как ответы часто кэшируются. Если сервер генерирует nonce, а CDN кэширует HTML-ответ, каждый следующий посетитель получает то же «уникальное» значение — злоумышленник может обнаружить статическое значение и обойти CSP.

Чтобы сохранить целостность nonce «одноразового использования», его ideally следует генерировать на Edge-слое (например, CDN) непосредственно перед доставкой контента пользователю.

</docs-callout>

NOTE: Если вы хотите [инлайнить critical CSS](/tools/cli/build#critical-css-inlining) приложения, нельзя использовать токен `CSP_NONCE` — предпочтите опцию `autoCsp` или атрибут `ngCspNonce` на корневом элементе приложения.

Если в проекте нельзя генерировать nonce, можно разрешить inline-стили, добавив `'unsafe-inline'` в секцию `style-src` заголовка CSP.

| Секции                                           | Подробности                                                                                                                                                                                                     |
| :----------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default-src 'self';`                            | Позволяет странице загружать все нужные ресурсы с того же origin.                                                                                                                                                |
| `style-src 'self' 'nonce-randomNonceGoesHere';`  | Позволяет загружать глобальные стили с того же origin \(`'self'`\) и стили, вставляемые Angular с `nonce-randomNonceGoesHere`.                                                                                   |
| `script-src 'self' 'nonce-randomNonceGoesHere';` | Позволяет загружать JavaScript с того же origin \(`'self'`\) и скрипты, вставляемые Angular CLI с `nonce-randomNonceGoesHere`. Нужно только при использовании critical CSS inlining.                             |

Angular сам по себе требует только этих настроек для корректной работы.
По мере роста проекта может понадобиться расширить настройки CSP под дополнительные возможности приложения.

### Enforcement Trusted Types {#enforcing-trusted-types}

Рекомендуется использовать [Trusted Types](https://w3c.github.io/trusted-types/dist/spec/) как способ помочь защитить приложения от XSS.
Trusted Types — возможность [веб-платформы](https://en.wikipedia.org/wiki/Web_platform), которая помогает предотвращать XSS, требуя более безопасных практик кодирования.
Trusted Types также могут упростить аудит кода приложения.

<docs-callout title="Trusted types">

Trusted Types могут быть ещё недоступны во всех браузерах, на которые нацелено приложение.
Если приложение с Trusted Types запускается в браузере без поддержки Trusted Types, функции приложения сохраняются. Приложение защищено от XSS через DomSanitizer Angular.
Текущую поддержку браузеров см. на [caniuse.com/trusted-types](https://caniuse.com/trusted-types).

</docs-callout>

Чтобы включить Trusted Types для приложения, настройте веб-сервер приложения на отправку HTTP-заголовков с одной из следующих политик Angular:

| Политики                 | Подробности                                                                                                                                                                                                                                                                                     |
| :----------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `angular`                | Эта политика используется в security-reviewed коде внутри Angular и нужна для работы Angular при enforcement Trusted Types. Любые inline-значения шаблонов или контент, санитизированный Angular, считаются этой политикой безопасными.                                          |
| `angular#bundler`        | Эта политика используется бандлером Angular CLI при создании lazy chunk-файлов.                                                                                                                                                                                                             |
| `angular#unsafe-bypass`  | Эта политика нужна приложениям, которые используют методы [DomSanitizer](api/platform-browser/DomSanitizer) Angular, обходящие безопасность, например `bypassSecurityTrustHtml`. Любое приложение с такими методами должно включить эту политику.                                  |
| `angular#unsafe-jit`     | Эта политика используется [Just-In-Time (JIT) компилятором](api/core/Compiler). Её нужно включить, если приложение напрямую взаимодействует с JIT-компилятором или работает в JIT-режиме через [platform browser dynamic](api/platform-browser-dynamic/platformBrowserDynamic). |
| `angular#unsafe-upgrade` | Эта политика используется пакетом [@angular/upgrade](api/upgrade/static/UpgradeModule). Её нужно включить, если приложение — гибрид AngularJS.                                                                                                                           |

HTTP-заголовки для Trusted Types следует настроить в следующих местах:

- Production serving infrastructure
- Angular CLI \(`ng serve`\), через свойство `headers` в файле `angular.json`, для локальной разработки и end-to-end тестирования
- Karma \(`ng test`\), через свойство `customHeaders` в файле `karma.config.js`, для unit-тестов

Пример заголовка, специально настроенного для Trusted Types и Angular:

```html
Content-Security-Policy: trusted-types angular; require-trusted-types-for 'script';
```

Пример заголовка для Trusted Types и Angular-приложений, использующих методы [DomSanitizer](api/platform-browser/DomSanitizer), обходящие безопасность:

```html
Content-Security-Policy: trusted-types angular angular#unsafe-bypass; require-trusted-types-for
'script';
```

Пример заголовка для Trusted Types и Angular-приложений с JIT:

```html
Content-Security-Policy: trusted-types angular angular#unsafe-jit; require-trusted-types-for
'script';
```

Пример заголовка для Trusted Types и Angular-приложений с ленивой загрузкой модулей:

```html
Content-Security-Policy: trusted-types angular angular#bundler; require-trusted-types-for 'script';
```

<docs-callout title="Community contributions">

Для устранения неполадок конфигураций Trusted Types может быть полезен ресурс:

[Prevent DOM-based cross-site scripting vulnerabilities with Trusted Types](https://web.dev/trusted-types/#how-to-use-trusted-types)

</docs-callout>

### Используйте AOT-компилятор шаблонов {#use-the-aot-template-compiler}

AOT-компилятор шаблонов предотвращает целый класс уязвимостей — template injection — и значительно повышает производительность приложения.
AOT-компилятор шаблонов — компилятор по умолчанию в приложениях Angular CLI, и его следует использовать во всех production-развёртываниях.

Альтернатива AOT — JIT-компилятор, который компилирует шаблоны в исполняемый код шаблона в браузере во время выполнения.
Angular доверяет коду шаблонов, поэтому динамическая генерация и компиляция шаблонов — особенно с пользовательскими данными — обходит встроенные защиты Angular. Это security anti-pattern.
О безопасном динамическом построении форм см. руководство [Dynamic Forms](guide/forms/dynamic-forms).

### Защита от XSS на сервере {#server-side-xss-protection}

HTML, построенный на сервере, уязвим к injection-атакам.
Внедрение кода шаблона в Angular-приложение равносильно внедрению исполняемого кода:
это даёт злоумышленнику полный контроль над приложением.
Чтобы предотвратить это, используйте язык шаблонов, который автоматически экранирует значения и предотвращает XSS на сервере.
Не создавайте шаблоны Angular на сервере с помощью языка шаблонов. Это несёт высокий риск уязвимостей template-injection.

## Уязвимости на уровне HTTP {#http-level-vulnerabilities}

Angular имеет встроенную поддержку, помогающую предотвращать две распространённые HTTP-уязвимости: cross-site request forgery \(CSRF или XSRF\) и cross-site script inclusion \(XSSI\).
Обе в первую очередь нужно смягчать на стороне сервера, но Angular предоставляет хелперы, упрощающие интеграцию на клиенте.

### Cross-site request forgery {#cross-site-request-forgery}

При cross-site request forgery \(CSRF или XSRF\) злоумышленник обманом заставляет пользователя посетить другую веб-страницу \(например, `evil.com`\) с вредоносным кодом. Эта страница тайно отправляет вредоносный запрос на веб-сервер приложения \(например, `example-bank.com`\).

Предположим, пользователь залогинен в приложении на `example-bank.com`.
Пользователь открывает письмо и кликает по ссылке на `evil.com`, которая открывается в новой вкладке.

Страница `evil.com` сразу отправляет вредоносный запрос на `example-bank.com`.
Возможно, это запрос на перевод денег со счёта пользователя на счёт злоумышленника.
Браузер автоматически отправляет cookies `example-bank.com`, включая cookie аутентификации, с этим запросом.

Если сервер `example-bank.com` не защищён от XSRF, он не отличит легитимный запрос приложения от поддельного с `evil.com`.

Чтобы предотвратить это, приложение должно убедиться, что запрос пользователя исходит из настоящего приложения, а не с другого сайта.
Сервер и клиент должны сотрудничать, чтобы сорвать эту атаку.

В распространённой anti-XSRF технике сервер приложения отправляет случайно созданный токен аутентификации в cookie.
Клиентский код читает cookie и добавляет кастомный заголовок запроса с токеном во все последующие запросы.
Сервер сравнивает значение cookie с значением заголовка и отклоняет запрос, если значения отсутствуют или не совпадают.

Эта техника эффективна, потому что все браузеры реализуют _same origin policy_.
Только код с сайта, на котором установлены cookies, может читать cookies этого сайта и задавать кастомные заголовки в запросах к этому сайту.
Значит, только ваше приложение может прочитать этот cookie-токен и задать кастомный заголовок.
Вредоносный код на `evil.com` — нет.

### Безопасность XSRF/CSRF в `HttpClient` {#httpclient-xsrfcsrf-security}

`HttpClient` поддерживает [распространённый механизм](https://en.wikipedia.org/wiki/Cross-site_request_forgery#Cookie-to-header_token) предотвращения XSRF-атак. При выполнении HTTP-запросов interceptor читает токен из cookie (по умолчанию `XSRF-TOKEN`) и устанавливает его как HTTP-заголовок `X-XSRF-TOKEN`. Поскольку cookie может прочитать только код, работающий на вашем домене, бэкенд может быть уверен, что HTTP-запрос пришёл из клиентского приложения, а не от злоумышленника.

По умолчанию interceptor отправляет этот заголовок во всех mutating-запросах (например, `POST`) на относительные и same-origin URL, но не в запросах `GET` или `HEAD`.

<docs-callout helpful title="Why not protect GET requests?">
Защита от CSRF нужна только для запросов, которые могут изменить состояние на бэкенде. По своей природе CSRF-атаки пересекают границы доменов, а [same-origin policy](https://developer.mozilla.org/docs/Web/Security/Same-origin_policy) веба не позволит атакующей странице получить результаты аутентифицированных `GET`-запросов.
</docs-callout>

Чтобы воспользоваться этим, сервер должен установить токен в читаемую из JavaScript session cookie с именем `XSRF-TOKEN` при загрузке страницы или при первом GET-запросе. В последующих запросах сервер может проверить, что cookie совпадает с HTTP-заголовком `X-XSRF-TOKEN`, и таким образом убедиться, что запрос мог отправить только код на вашем домене. Токен должен быть уникален для каждого пользователя и проверяем сервером; это не даёт клиенту придумывать свои токены. Для дополнительной безопасности задайте токен как digest cookie аутентификации сайта с солью.

Чтобы избежать коллизий в окружениях, где несколько Angular-приложений делят один домен или поддомен, дайте каждому приложению уникальное имя cookie.

<docs-callout important title="HttpClient supports only the client half of the XSRF protection scheme">
  Бэкенд-сервис должен быть настроен на установку cookie для страницы и на проверку наличия заголовка во всех подходящих запросах. Иначе защита Angular по умолчанию бесполезна.
</docs-callout>

### Настройка кастомных имён cookie/заголовка {#configure-custom-cookieheader-names}

Если бэкенд использует другие имена для cookie или заголовка XSRF-токена, переопределите значения по умолчанию через `withXsrfConfiguration`.

Добавьте это в вызов `provideHttpClient` так:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: 'CUSTOM_XSRF_TOKEN',
        headerName: 'X-Custom-Xsrf-Header',
      }),
    ),
  ],
};
```

### Отключение защиты XSRF {#disabling-xsrf-protection}

Если встроенный механизм защиты XSRF не подходит приложению, его можно отключить через feature `withNoXsrfProtection`:

```ts
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withNoXsrfProtection())],
};
```

О CSRF в Open Web Application Security Project \(OWASP\) см. [Cross-Site Request Forgery (CSRF)](https://owasp.org/www-community/attacks/csrf) и [Cross-Site Request Forgery (CSRF) Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
Статья Стэнфордского университета [Robust Defenses for Cross-Site Request Forgery](https://seclab.stanford.edu/websec/csrf/csrf.pdf) — богатый источник деталей.

См. также [доклад Dave Smith об XSRF на AngularConnect 2016](https://www.youtube.com/watch?v=9inczw6qtpY 'Cross Site Request Funkery Securing Your Angular Apps From Evil Doers').

### Cross-site script inclusion (XSSI) {#cross-site-script-inclusion-xssi}

Cross-site script inclusion, также известная как JSON vulnerability, может позволить сайту злоумышленника читать данные из JSON API.
Атака работает в старых браузерах через переопределение встроенных конструкторов объектов JavaScript и последующее включение URL API через тег `<script>`.

Атака успешна только если возвращённый JSON исполним как JavaScript.
Серверы могут предотвратить атаку, префиксируя все JSON-ответы, чтобы сделать их неисполняемыми — по соглашению, известной строкой `")]}',\n"`.

Библиотека `HttpClient` Angular распознаёт это соглашение и автоматически удаляет строку `")]}',\n"` из всех ответов перед дальнейшим разбором.

Подробнее — в разделе XSSI этого [поста Google о веб-безопасности](https://security.googleblog.com/2011/05/website-security-for-webmasters.html).

## Предотвращение Server-Side Request Forgery (SSRF) {#preventing-server-side-request-forgery-ssrf}

Angular включает строгую валидацию заголовков `Host`, `Forwarded`, `X-Forwarded-Host`, `X-Forwarded-Proto`, `X-Forwarded-Prefix` и `X-Forwarded-Port` в pipeline обработки запросов, чтобы предотвратить [Server-Side Request Forgery (SSRF)](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/SSRF) на основе заголовков.

Правила валидации:

- `Host`, `X-Forwarded-Host` и параметр `host` заголовка `Forwarded` проверяются по строгому allowlist и не могут содержать разделители пути.
- Заголовок `X-Forwarded-Port` должен быть числовым.
- Заголовок `X-Forwarded-Proto` и параметр `proto` заголовка `Forwarded` должны быть `http` или `https`.
- Заголовок `X-Forwarded-Prefix` должен начинаться с `/` и содержать только буквенно-цифровые символы, дефисы и подчёркивания, разделённые одиночными слэшами.
- По умолчанию заголовок `Forwarded` и все заголовки `X-Forwarded-*` считаются недоверенными и удаляются из запроса. Чтобы сохранить их, их нужно явно разрешить, настроив `trustProxyHeaders`.

Некорректные заголовки вызывают error log, а неразрешённые proxy-заголовки удаляются из запроса. Запросы с нераспознанными hostname приводят к `400 Bad Request`.

NOTE: Большинство облачных провайдеров и CDN автоматически валидируют эти заголовки до того, как запрос достигнет origin приложения. Такая фильтрация существенно уменьшает практическую поверхность атаки.

### Настройка разрешённых hosts {#configuring-allowed-hosts}

Чтобы разрешить конкретные hostname, добавьте их в allowlist. Это критично для корректной и безопасной работы приложения после развёртывания. Паттерны поддерживают wildcards для гибкого сопоставления hostname.

Опцию `allowedHosts` можно настроить в `angular.json`:

```json {hideCopy}
{
  // ...
  "projects": {
    "your-project-name": {
      // ...
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "security": {
              "allowedHosts": [
                "example.com",
                "*.example.com" // allows all subdomains of example.com
              ]
            }
            // ... other options
          }
        }
      }
    }
  }
}
```

`allowedHosts` также можно настроить при инициализации application engine:

```typescript
const appEngine = new AngularAppEngine({
  allowedHosts: ['example.com', '*.trusted-example.com'],
});

const nodeAppEngine = new AngularNodeAppEngine({
  allowedHosts: ['example.com', '*.trusted-example.com'],
});
```

Для Node.js-варианта `AngularNodeAppEngine` можно также задать переменную окружения `NG_ALLOWED_HOSTS` (список через запятую) для авторизации hosts.

```bash {hideDollar}
export NG_ALLOWED_HOSTS="example.com,*.trusted-example.com"
```

IMPORTANT: В `allowedHosts` можно указать `*`, чтобы разрешить все hostname, хотя это обычно не рекомендуется и несёт риск безопасности. Принятие любого host-заголовка может подвергнуть приложение host header injection и атакам [Server-Side Request Forgery (SSRF)](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/SSRF). Эту конфигурацию следует использовать только когда валидация заголовков `Host` и `X-Forwarded-Host` выполняется на другом слое — load balancer или reverse proxy. Для лучшей безопасности рекомендуем явный список разрешённых hosts. Подробнее — [GHSA-x288-3778-4hhx](https://github.com/angular/angular-cli/security/advisories/GHSA-x288-3778-4hhx).

### Настройка доверенных proxy-заголовков {#configuring-trusted-proxy-headers}

По умолчанию Angular игнорирует стандартный заголовок `Forwarded` и все заголовки `X-Forwarded-*`. Если приложение стоит за доверенным reverse proxy (например, load balancer), который устанавливает эти заголовки, можно настроить Angular доверять им.

Если заголовок `Forwarded` доверен, его параметры `host` и `proto` извлекаются и имеют приоритет над соответствующими заголовками `x-forwarded-host` и `x-forwarded-proto`.

`trustProxyHeaders` можно настроить при инициализации application engine:

```typescript
const appEngine = new AngularAppEngine({
  trustProxyHeaders: ['forwarded'], // Trust the standard Forwarded header
});

const appEngine = new AngularAppEngine({
  trustProxyHeaders: ['x-forwarded-host', 'x-forwarded-proto'], // Trust non-standard headers
});

const nodeAppEngine = new AngularNodeAppEngine({
  trustProxyHeaders: true, // Trust standard Forwarded and all X-Forwarded-* headers
});
```

Для Node.js-варианта `AngularNodeAppEngine` можно также задать переменную окружения `NG_TRUST_PROXY_HEADERS` (список заголовков через запятую), чтобы разрешить использование этих заголовков.

```bash {hideDollar}
export NG_TRUST_PROXY_HEADERS="X-FORWARDED-HOST,X-FORWARDED-PREFIX"
```

IMPORTANT: Включайте `trustProxyHeaders` только если приложение стоит за доверенным proxy, который строго валидирует или переопределяет эти заголовки. Иначе злоумышленники могут подделать эти заголовки и вызвать атаки [Server-Side Request Forgery (SSRF)](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/SSRF).

## Аудит Angular-приложений {#auditing-angular-applications}

Angular-приложения должны следовать тем же принципам безопасности, что и обычные веб-приложения, и аудироваться так же.
Angular-специфичные API, которые следует аудировать при security review — например, методы [_bypassSecurityTrust_](#trusting-safe-values) — помечены в документации как security sensitive.

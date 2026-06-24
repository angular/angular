# Добавление HTTP-взаимодействия в приложение

В этом руководстве показано, как интегрировать HTTP и API в ваше приложение.

До этого момента ваше приложение считывало данные из статического массива в сервисе Angular. Следующий шаг —
использование JSON-сервера, с которым приложение будет взаимодействовать по протоколу HTTP. HTTP-запрос будет
имитировать работу с данными, полученными от сервера.

<docs-video src="https://www.youtube.com/embed/5K10oYJ5Y-E?si=TiuNKx_teR9baO7k"/>

ВАЖНО: Мы рекомендуем использовать локальную среду разработки для этого этапа руководства.

## Чему вы научитесь

Ваше приложение будет использовать данные с JSON-сервера.

<docs-workflow>

<docs-step title="Настройка JSON-сервера">
JSON Server — это инструмент с открытым исходным кодом, используемый для создания имитации (mock) REST API. Вы будете использовать его для предоставления данных о жилье, которые в данный момент хранятся в сервисе `housing`.

1. Установите `json-server` из npm, используя следующую команду.

   ```bash
   npm install -g json-server
   ```

1. В корневой директории вашего проекта создайте файл с именем `db.json`. Здесь вы будете хранить данные для
   `json-server`.

1. Откройте `db.json` и скопируйте в него следующий код.

   ```json
   {
     "locations": [
       {
         "id": 0,
         "name": "Acme Fresh Start Housing",
         "city": "Chicago",
         "state": "IL",
         "photo": "https://angular.dev/assets/images/tutorials/common/bernard-hermant-CLKGGwIBTaY-unsplash.jpg",
         "availableUnits": 4,
         "wifi": true,
         "laundry": true
       },
       {
         "id": 1,
         "name": "A113 Transitional Housing",
         "city": "Santa Monica",
         "state": "CA",
         "photo": "https://angular.dev/assets/images/tutorials/common/brandon-griggs-wR11KBaB86U-unsplash.jpg",
         "availableUnits": 0,
         "wifi": false,
         "laundry": true
       },
       {
         "id": 2,
         "name": "Warm Beds Housing Support",
         "city": "Juneau",
         "state": "AK",
         "photo": "https://angular.dev/assets/images/tutorials/common/i-do-nothing-but-love-lAyXdl1-Wmc-unsplash.jpg",
         "availableUnits": 1,
         "wifi": false,
         "laundry": false
       },
       {
         "id": 3,
         "name": "Homesteady Housing",
         "city": "Chicago",
         "state": "IL",
         "photo": "https://angular.dev/assets/images/tutorials/common/ian-macdonald-W8z6aiwfi1E-unsplash.jpg",
         "availableUnits": 1,
         "wifi": true,
         "laundry": false
       },
       {
         "id": 4,
         "name": "Happy Homes Group",
         "city": "Gary",
         "state": "IN",
         "photo": "https://angular.dev/assets/images/tutorials/common/krzysztof-hepner-978RAXoXnH4-unsplash.jpg",
         "availableUnits": 1,
         "wifi": true,
         "laundry": false
       },
       {
         "id": 5,
         "name": "Hopeful Apartment Group",
         "city": "Oakland",
         "state": "CA",
         "photo": "https://angular.dev/assets/images/tutorials/common/r-architecture-JvQ0Q5IkeMM-unsplash.jpg",
         "availableUnits": 2,
         "wifi": true,
         "laundry": true
       },
       {
         "id": 6,
         "name": "Seriously Safe Towns",
         "city": "Oakland",
         "state": "CA",
         "photo": "https://angular.dev/assets/images/tutorials/common/phil-hearing-IYfp2Ixe9nM-unsplash.jpg",
         "availableUnits": 5,
         "wifi": true,
         "laundry": true
       },
       {
         "id": 7,
         "name": "Hopeful Housing Solutions",
         "city": "Oakland",
         "state": "CA",
         "photo": "https://angular.dev/assets/images/tutorials/common/r-architecture-GGupkreKwxA-unsplash.jpg",
         "availableUnits": 2,
         "wifi": true,
         "laundry": true
       },
       {
         "id": 8,
         "name": "Seriously Safe Towns",
         "city": "Oakland",
         "state": "CA",
         "photo": "https://angular.dev/assets/images/tutorials/common/saru-robert-9rP3mxf8qWI-unsplash.jpg",
         "availableUnits": 10,
         "wifi": false,
         "laundry": false
       },
       {
         "id": 9,
         "name": "Capital Safe Towns",
         "city": "Portland",
         "state": "OR",
         "photo": "https://angular.dev/assets/images/tutorials/common/webaliser-_TPTXZd9mOo-unsplash.jpg",
         "availableUnits": 6,
         "wifi": true,
         "laundry": true
       }
     ]
   }
   ```

1. Сохраните этот файл.

1. Пришло время проверить конфигурацию. В командной строке, в корне вашего проекта, выполните следующие команды.

```bash
json-server --watch db.json
```

1. В веб-браузере перейдите по адресу `http://localhost:3000/locations` и убедитесь, что ответ содержит данные,
   сохраненные в `db.json`.

Если у вас возникнут проблемы с конфигурацией, вы можете найти более подробную информацию
в [официальной документации](https://www.npmjs.com/package/json-server).
</docs-step>

<docs-step title="Обновление сервиса для использования веб-сервера вместо локального массива">
Источник данных настроен, следующий шаг — обновить веб-приложение для подключения к нему и использования данных.

1. В `src/app/housing.service.ts` внесите следующие изменения:

1. Обновите код, удалив свойство `housingLocationList` и массив с данными, а также свойство `baseUrl`.

1. Добавьте строковое свойство `url` и установите его значение равным `'http://localhost:3000/locations'`.

   <docs-code header="Добавление свойства url в housing.service.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/housing.service.ts" visibleLines="[8]"/>

   Этот код приведет к ошибкам в остальной части файла, так как она зависит от свойства `housingLocationList`. Далее мы
   обновим методы сервиса.

1. Обновите функцию `getAllHousingLocations`, чтобы сделать вызов к настроенному веб-серверу.

    <docs-code header="Обновление метода getAllHousingLocations в housing.service.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/housing.service.ts" visibleLines="[10,13]"/>

   Теперь код использует асинхронный подход для выполнения **GET**-запроса по HTTP.

   ПОЛЕЗНО: В этом примере используется `fetch`. Для более сложных случаев рассмотрите использование `HttpClient`,
   предоставляемого Angular.

1. Обновите функцию `getHousingLocationsById`, чтобы сделать вызов к настроенному веб-серверу.

   ПОЛЕЗНО: Обратите внимание, что метод `fetch` был обновлен для _запроса_ данных о местоположении с соответствующим
   значением свойства `id`. См. [URL Search Parameter](https://developer.mozilla.org/en-US/docs/Web/API/URL/search) для
   получения дополнительной информации.

    <docs-code header="Обновление метода getHousingLocationById в housing.service.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/housing.service.ts" visibleLines="[15,19]"/>

1. После завершения всех обновлений ваш сервис должен соответствовать следующему коду.

<docs-code header="Финальная версия housing.service.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/housing.service.ts" visibleLines="[1,25]" />

</docs-step>

<docs-step title="Обновление компонентов для использования асинхронных вызовов к сервису housing">
Сервер теперь считывает данные из HTTP-запроса, но компоненты, зависящие от сервиса, выдают ошибки, так как они были запрограммированы на использование синхронной версии сервиса.

1. В `src/app/home/home.ts` обновите `constructor` для использования новой асинхронной версии метода
   `getAllHousingLocations`.

<docs-code header="Обновление конструктора в home.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/home/home.ts" visibleLines="[29,36]"/>

1. В `src/app/details/details.ts` обновите `constructor` для использования новой асинхронной версии метода
   `getHousingLocationById`.

<docs-code header="Обновление конструктора в details.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/details/details.ts" visibleLines="[59,64]"/>

1. Сохраните код.

1. Откройте приложение в браузере и убедитесь, что оно работает без ошибок.
   </docs-step>

</docs-workflow>

ПРИМЕЧАНИЕ: В этом уроке используется браузерный API `fetch`. Для поддержки перехватчиков (interceptors), пожалуйста,
обратитесь к [документации Http Client](/guide/http).

РЕЗЮМЕ: В этом уроке вы обновили приложение для использования локального веб-сервера (`json-server`) и асинхронных
методов сервиса для получения данных.

Поздравляем! Вы успешно завершили это руководство и готовы продолжить путь создания еще более сложных приложений
Angular.

Если вы хотите узнать больше, рассмотрите возможность прохождения других [руководств](tutorials) и
изучения [гайдов](overview) Angular.

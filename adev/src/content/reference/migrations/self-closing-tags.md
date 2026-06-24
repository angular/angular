# Миграция на самозакрывающиеся теги

Самозакрывающиеся теги поддерживаются в шаблонах Angular начиная
с [v16](https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d#7065).

Этот схематик переводит шаблоны вашего приложения на использование самозакрывающихся тегов.

Запустите схематик с помощью следующей команды:

```shell
ng generate @angular/core:self-closing-tag
```

#### До

```angular-html

<hello-world></hello-world>

```

#### После

```angular-html

<hello-world />

```

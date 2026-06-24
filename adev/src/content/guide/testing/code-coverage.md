# Покрытие кода

Отчеты о покрытии кода показывают те части вашей кодовой базы, которые могут быть недостаточно протестированы вашими
юнит-тестами.

## Предварительные требования

Чтобы генерировать отчеты о покрытии кода с помощью Vitest, необходимо установить пакет `@vitest/coverage-v8`:

<docs-code-multifile>
  <docs-code header="npm" language="shell">
    npm install --save-dev @vitest/coverage-v8
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn add --dev @vitest/coverage-v8
  </docs-code>
  <docs-code header="pnpm" language="shell">
    pnpm add -D @vitest/coverage-v8
  </docs-code>
  <docs-code header="bun" language="shell">
    bun add --dev @vitest/coverage-v8
  </docs-code>
</docs-code-multifile>

## Генерация отчета

Чтобы сгенерировать отчет о покрытии, добавьте флаг `--coverage` к команде `ng test`:

```shell
ng test --coverage
```

После выполнения тестов команда создаст новую директорию `coverage/` в проекте. Откройте файл `index.html`, чтобы
увидеть отчет с вашим исходным кодом и показателями покрытия.

Если вы хотите создавать отчеты о покрытии кода при каждом запуске тестов, вы можете установить опцию `coverage` в
значение `true` в вашем файле `angular.json`:

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "coverage": true
          }
        }
      }
    }
  }
}
```

## Контроль пороговых значений покрытия кода

Проценты покрытия кода позволяют оценить, какая часть вашего кода протестирована. Если ваша команда определила
минимальный объем, который должен быть покрыт юнит-тестами, вы можете закрепить этот минимум в конфигурации.

Например, предположим, что вы хотите, чтобы кодовая база имела покрытие кода не менее 80%. Чтобы включить это, добавьте
опцию `coverageThresholds` в ваш файл `angular.json`:

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "coverage": true,
            "coverageThresholds": {
              "statements": 80,
              "branches": 80,
              "functions": 80,
              "lines": 80
            }
          }
        }
      }
    }
  }
}
```

Теперь, если при запуске тестов покрытие упадет ниже 80%, выполнение команды завершится с ошибкой.

## Расширенная конфигурация

Вы можете настроить несколько других опций покрытия в вашем файле `angular.json`:

- `coverageInclude`: Glob-шаблоны файлов для включения в отчет о покрытии.
- `coverageReporters`: Массив используемых репортеров (например, `html`, `lcov`, `json`).
- `coverageWatermarks`: Объект, определяющий `[low, high]` (низкий, высокий) уровни для HTML-репортера, которые влияют
  на цветовую кодировку отчета.

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "coverage": true,
            "coverageReporters": ["html", "lcov"],
            "coverageWatermarks": {
              "statements": [50, 80],
              "branches": [50, 80],
              "functions": [50, 80],
              "lines": [50, 80]
            }
          }
        }
      }
    }
  }
}
```

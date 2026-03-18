# Покрытие кода

Отчёты о покрытии кода показывают, какие части кодовой базы могут быть недостаточно протестированы модульными тестами.

## Предварительные требования {#prerequisites}

Для генерации отчётов о покрытии кода с помощью Vitest необходимо установить пакет `@vitest/coverage-v8`:

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

## Генерация отчёта {#generating-a-report}

Для генерации отчёта о покрытии добавьте флаг `--coverage` к команде `ng test`:

```shell
ng test --coverage
```

После выполнения тестов команда создаёт новую директорию `coverage/` в проекте. Откройте файл `index.html`, чтобы увидеть отчёт с исходным кодом и значениями покрытия.

Если вы хотите создавать отчёты о покрытии кода при каждом тестировании, можно установить параметр `coverage` в значение `true` в файле `angular.json`:

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

## Установка порогов покрытия кода {#enforcing-code-coverage-thresholds}

Процентные показатели покрытия кода позволяют оценить, насколько хорошо тестируется код. Если команда определила минимальный уровень покрытия для модульных тестов, это минимальное значение можно задать в конфигурации.

Например, предположим, что вы хотите, чтобы кодовая база имела минимальное покрытие 80%. Для этого добавьте параметр `coverageThresholds` в файл `angular.json`:

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

Теперь если при запуске тестов покрытие опустится ниже 80%, команда завершится с ошибкой.

## Расширенная конфигурация {#advanced-configuration}

В файле `angular.json` можно настроить несколько дополнительных параметров покрытия:

- `coverageInclude`: Glob-паттерны файлов для включения в отчёт о покрытии.
- `coverageExclude`: Glob-паттерны файлов для исключения из отчёта о покрытии.
- `coverageReporters`: Массив используемых репортёров (например, `html`, `lcov`, `json`).
- `coverageWatermarks`: Объект, задающий пороговые значения `[low, high]` для HTML-репортёра, влияющие на цветовое кодирование отчёта.

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

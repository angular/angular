# Actualizar las opciones del compilador `module` y `target` en la migración 

## ¿Qué hace esta migración?

Esta migración ajusta la configuración de [`target`](https://www.typescriptlang.org/tsconfig#target) y [`module`](https://www.typescriptlang.org/v2/en/tsconfig#module) dentro de [los archivos de configuración de TypeScript](guide/typescript-configuration) para el espacio de trabajo.
Los cambios en cada opción varían según el constructor o comando que usa el archivo de configuración de TypeScript. A menos que se indique lo contrario, los cambios solo se realizan si el valor existente no se modificó desde que se creó el proyecto. Este proceso ayuda a garantizar que se mantengan los cambios intencionales en las opciones.

Archivo(s) de configuración de TypeScript | Propiedad Cambiada | Valor existente | Nuevo Valor
------------- | ------------- | ------------- | ------------- | -------------
`<espacio de trabajo>/tsconfig.base.json` | `"module"` | `"esnext"` | `"es2020"`
Utilizado en las opciones del constructor de `browser` (`ng build` para aplicaciones) | `"module"` | `"esnext"` | `"es2020"`
Utilizado en las opciones del constructor de `ng-packgr` (`ng build` para librerías) | `"module"` | `"esnext"` | `"es2020"`
Utilizado en las opciones del constructor de `karma` (`ng test` para aplicaciones) | `"module"` | `"esnext"` | `"es2020"`
Utilizado en las opciones (universales) del constructor de `server` | `"module"` | `"commonjs"` | _removed_
Utilizado en las opciones (universales) del constructor de `server` | `"target"` | _any_ | `"es2016"`
Utilizado en las opciones del constructor de `protractor` (`ng e2e` para aplicaciones) | `"target"` | `"es5"` | `"es2018"`

## ¿Por qué es necesaria esta migración?

Esta migración proporciona mejoras en la compatibilidad a largo plazo de los proyectos mediante la actualización de los proyectos utilizando las buenas prácticas recomendadas en las opciones de compilación.

Para la funcionalidad que se ejecuta en Node.js, como Universal y Protractor, las nuevas configuraciones también brindan beneficios de rendimiento y resolución de problemas.
La versión mínima de Node.js para Angular CLI (v10.13) admite funciones en ES2018 y versiones anteriores.
Al apuntar a versiones posteriores de ES, el compilador transforma menos código y puede usar funciones más nuevas directamente.
Dado que zone.js no admite `async` y `await` de forma nativa, las compilaciones universales todavía apuntan a ES2016.

## ¿Por qué `"es2020"` en lugar de `"esnext"`?

En TypeScript 3.9, el comportamiento del compilador TypeScript controlado por `module` es el mismo con los valores `"esnext"` y `"es2020"`.
Este comportamiento puede cambiar en el futuro, porque la opción `"esnext"` podría evolucionar de manera incompatible hacia atrás, lo que resultaría en errores en tiempo de compilación o de ejecución durante una actualización de TypeScript.
Como resultado, el código puede volverse inestable. El uso de la opción `"es2020"` mitiga este riesgo.

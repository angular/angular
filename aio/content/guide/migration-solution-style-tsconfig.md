# Migrar el estilo de solución `tsconfig.json`

## ¿Qué hace esta migración?

Esta migración agrega soporte a proyectos existentes la nueva funcionalidad de TypeScript ["estilo de solución" tsconfig](https://devblogs.microsoft.com/typescript/announcing-typescript-3-9/#solution-style-tsconfig).

El soporte es agregado al realizar dos cambios:

1. Renombrando el espacio de trabajo de `tsconfig.json` a `tsconfig.base.json`. Todos los [archivos de configuración de TypeScript](guide/typescript-configuration) se extenderán desde esta base que contiene las opciones comunes utilizadas en todo el espacio de trabajo.

2. Agregando el archivo de solución `tsconfig.json` a la raíz del espacio de trabajo. Este archivo `tsconfig.json` solo contendrá referencias a archivos de configuración de TypeScript a nivel de proyecto y solo lo usarán editores/IDEs.

Como ejemplo, la solución `tsconfig.json` para un nuevo proyecto es la siguiente:

```json
// Este es un archivo "Estilo de Solución" tsconfig.json, y es usado por editores y servidores del lenguaje TypeScript para mejorar la experiencia de desarrollo.
// No está destinado para ser utilizado en la ejecución de una compilación
{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.spec.json"
    },
    {
      "path": "./e2e/tsconfig.json"
    }
  ]
}
```

## ¿Por qué es necesaria esta migración?

Los archivos de estilos de solución `tsconfig.json` brindan una experiencia de edición mejorada y corrigen varios defectos antiguos al editar archivos en un IDE.
Los IDEs que aprovechan el servicio de lenguaje TypeScript (por ejemplo, [Visual Studio Code](https://code.visualstudio.com)), solo usarán archivos de configuración de TypeScript que se denominan `tsconfig.json`.
En proyectos complejos, puede haber más de una unidad de compilación y cada una de estas unidades puede tener diferentes configuraciones y opciones.

Con Angular CLI, un proyecto tendrá un código de la aplicación que tendrá como objetivo un navegador.
También tendrá pruebas unitarias que no deben incluirse dentro de la aplicación construida y que también necesitan información adicional presente (`jasmine` en este caso).
Ambas partes del proyecto también comparten parte del código dentro del proyecto, pero no todo.
Como resultado, se necesitan dos archivos de configuración TypeScript separados (`tsconfig.app.json` y `tsconfig.spec.json`) para garantizar que cada parte de la aplicación esté configurada correctamente y que se usen los tipos correctos para cada parte.
Además, si se utilizan web workers dentro de un proyecto, se necesita un tsconfig adicional (`tsconfig.worker.json`).
Los web workers utilizan tipos similares pero incompatibles con la aplicación del navegador principal.
Esto requiere el archivo de configuración adicional para garantizar que los archivos del web worker utilicen los tipos adecuados y se compilen correctamente.

Mientras que el sistema de compilación Angular conoce todos estos archivos de configuración de TypeScript, un IDE que usa el servicio de lenguaje de TypeScript no los conoce.
Debido a esto, un IDE no podrá analizar correctamente el código de cada parte del proyecto y puede generar errores falsos o hacer sugerencias incorrectas para ciertos archivos.
Al aprovechar el nuevo estilo de solución tsconfig, el IDE ahora puede conocer la configuración de cada parte de un proyecto.
Esto permite que cada archivo se trate de forma adecuada basado en su tsconfig.
Las funcionalidades del IDE, como informes de error/advertencia y las sugerencias automáticas, también funcionarán de manera más eficaz.

La [publición en el blog](https://devblogs.microsoft.com/typescript/announcing-typescript-3-9/#solution-style-tsconfig) de la versión 3.9 de TypeScript contiene también información adicional sobre esta nueva funcionalidad.

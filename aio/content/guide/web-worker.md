# Procesamiento en segundo plano utilizando web workers

[Web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) te permiten ejecutar cálculos intensivos de CPU en un subproceso en segundo plano,
liberando el hilo principal para actualizar la interfaz de usuario.
Si encuentra que la aplicación realiza una gran cantidad de cálculos, como generar dibujos CAD o realizar cálculos geométricos pesados, el uso de web workers puede ayudar a aumentar el rendimiento de la aplicación.

<div class="alert is-helpful">

La CLI no admite la ejecución de Angular en un programa de web workers

</div>

## Agregando un web worker

Para agregar un web worker a un proyecto existente, utilice el comando de angular `ng generate` de la CLI.

`ng generate web-worker` *location*

Puede agregar un trabajador web en cualquier lugar de la aplicación.
Por ejemplo, para agregar un trabajo web al componente raíz, `src/app/app.component.ts`, ejecute el siguiente comando.

`ng generate web-worker app`

El comando realiza las siguientes acciones.

- Configura el proyecto para que use web workers, si aún no lo es.
- Agrega el siguiente código de scaffolding a `src/app/app.worker.ts` para recibir mensajes.

  <code-example language="typescript" header="src/app/app.worker.ts">
  addEventListener('message', ({ data }) => {
    const response = `worker response to ${data}`;
    postMessage(response);
  });
 </code-example>

- Agrega el siguiente codigo `src/app/app.component.ts` para user el worker.

  <code-example language="typescript" header="src/app/app.component.ts">
  if (typeof Worker !== 'undefined') {
    // Create a new
    const worker = new Worker('./app.worker', { type: 'module' });
    worker.onmessage = ({ data }) => {
      console.log(`page got message: ${data}`);
    };
    worker.postMessage('hello');
  } else {
    // Web workers are not supported in this environment.
    // You should add a fallback so that your program still executes correctly.
  }
  </code-example>

Después de generar este scaffolding inicial, debe refactorizar el código para usar el programa del web worker enviando mensajes desde y hacia el web worker.

<div class="alert is-important">

Algunos entornos o plataformas, como `@angular/platform-server` utilizado en [Renderizado del lado del servidor](guía/universal), no admiten trabajadores web. Para asegurarse de que la aplicación funcionará en estos entornos, debe proporcionar un mecanismo de reserva para realizar los cálculos que el trabajador realizaría de otro modo.

</div>
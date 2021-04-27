# Compartiendo módulos

La creación de módulos compartidos te permite organizar y optimizar tu código. Puedes colocar directivas, `pipes`, y componentes de uso común en un módulo y despues importar solo ese módulo donde lo necesites en otras partes de tu aplicación.

Considera el siguiente módulo de una aplicación imaginaria:


```typescript
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerComponent } from './customer.component';
import { NewItemDirective } from './new-item.directive';
import { OrdersPipe } from './orders.pipe';

@NgModule({
 imports:      [ CommonModule ],
 declarations: [ CustomerComponent, NewItemDirective, OrdersPipe ],
 exports:      [ CustomerComponent, NewItemDirective, OrdersPipe,
                 CommonModule, FormsModule ]
})
export class SharedModule { }
```

Ten en cuenta lo siguiente:

* Esto importa `CommonModule` porque el componente del módulo necesita directivas comunes.
* Declara y exporta las clases de componentes, directivas y `pipes`
* Esto reexporta `CommonModule` y `FormsModule`.

Al reexportar `CommonModule` y `FormsModule`, cualquier otro módulo que importe este 
`SharedModule`, obtiene acceso a directivas como `NgIf` y `NgFor` desde `CommonModule`
y puede vincularse a las propiedades del componente con `[(ngModel)]`, a una directiva en `FormsModule`.

Aunque los componentes declarados por `SharedModule` pueden no vincularse con `[(ngModel)]` y puede que no sea necesario que `SharedModule` importe `FormsModule`, `SharedModule` aún puede exportar 
`FormsModule` sin incluirlo entre sus `imports (importaciones)`. De esta manera, puedes  dar acceso a otros módulos a  `FormsModule` sin tener que importarlo directamente al decorador `@NgModule`.

### Uso de componentes vs servicios de otros módulos

Existe una distinción importante entre usar el componente de otro módulo y utilizar un servicio de otro módulo. Importa módulos cuando quieras usar directivas, `pipes` y componentes. Importar un módulo con servicios significa que tendrá una nueva instancia de ese servicio, que normalmente no es lo que necesitas (normalmente, quieres reutilizar un servicio existente). Utiliza las importaciones de módulos para controlar la creación de instancias de servicios.

La forma más común de obtener servicios compartidos es através de la
[inyección de dependencia](guide/dependency-injection) en Angular, en lugar de a través del sistema del módulo (la importación de un módulo dará como resultado una nueva instancia de servicio, que no es un uso típico).

Para leer acerca de compartir servicios, consulta [Proveedores](guide/providers).


<hr />

## Más en NgModules

También te puede interesar lo siguiente:
* [Proveedores](guide/providers).
* [Tipos de Módulos de funciones](guide/module-types).

# ng-hub-ui-sortable

**Español** | [English](./README.md)

[![NPM Version](https://img.shields.io/npm/v/ng-hub-ui-sortable.svg)](https://www.npmjs.com/package/ng-hub-ui-sortable)

## Documentación y ejemplos en vivo

Este paquete forma parte de [Hub UI](https://hubui.dev/en/), una colección de bibliotecas de componentes Angular para aplicaciones standalone.

- Documentación: https://hubui.dev/en/sortable/overview/
- Ejemplos en vivo: https://hubui.dev/en/sortable/examples/
- Hub UI: https://hubui.dev/en/

## Migrar desde ngx-sortablejs

`ngx-sortablejs` publicó su última versión, la 11.1.0, en diciembre de 2020 y es una biblioteca View Engine (anterior a Ivy), así que deja de compilar a partir de Angular 13. **[Lee la guía de migración](./MIGRATION.md)**: recorre miembro a miembro la API antigua, muestra el código antes y después, y es explícita con los cambios de comportamiento que compilan sin quejarse y fallan en tiempo de ejecución.

La guía también dice cuándo *no* migrar aquí: si lo único que necesitas es seguir avanzando con Angular, `@worktile/ngx-sortablejs` mantiene el mismo selector y los mismos nombres de input, y es un cambio más pequeño.

## 🧩 Familia de bibliotecas `ng-hub-ui`

Esta biblioteca forma parte del ecosistema **ng-hub-ui**:

- [ng-hub-ui-accordion](https://www.npmjs.com/package/ng-hub-ui-accordion) (obsoleto — usa ng-hub-ui-panels)
- [ng-hub-ui-action-sheet](https://www.npmjs.com/package/ng-hub-ui-action-sheet)
- [ng-hub-ui-avatar](https://www.npmjs.com/package/ng-hub-ui-avatar)
- [ng-hub-ui-board](https://www.npmjs.com/package/ng-hub-ui-board)
- [ng-hub-ui-breadcrumbs](https://www.npmjs.com/package/ng-hub-ui-breadcrumbs)
- [ng-hub-ui-calendar](https://www.npmjs.com/package/ng-hub-ui-calendar)
- [ng-hub-ui-dropdown](https://www.npmjs.com/package/ng-hub-ui-dropdown)
- [ng-hub-ui-ds](https://www.npmjs.com/package/ng-hub-ui-ds)
- [ng-hub-ui-forms](https://www.npmjs.com/package/ng-hub-ui-forms)
- [ng-hub-ui-history](https://www.npmjs.com/package/ng-hub-ui-history)
- [ng-hub-ui-milestones](https://www.npmjs.com/package/ng-hub-ui-milestones)
- [ng-hub-ui-modal](https://www.npmjs.com/package/ng-hub-ui-modal)
- [ng-hub-ui-nav](https://www.npmjs.com/package/ng-hub-ui-nav)
- [ng-hub-ui-paginable](https://www.npmjs.com/package/ng-hub-ui-paginable)
- [ng-hub-ui-panels](https://www.npmjs.com/package/ng-hub-ui-panels)
- [ng-hub-ui-portal](https://www.npmjs.com/package/ng-hub-ui-portal)
- [ng-hub-ui-skeleton](https://www.npmjs.com/package/ng-hub-ui-skeleton)
- [ng-hub-ui-sortable](https://www.npmjs.com/package/ng-hub-ui-sortable) ← Estás aquí
- [ng-hub-ui-stepper](https://www.npmjs.com/package/ng-hub-ui-stepper)
- [ng-hub-ui-utils](https://www.npmjs.com/package/ng-hub-ui-utils)

## Descripción

**ng-hub-ui-sortable** proporciona una integración moderna de Angular para [SortableJS](https://github.com/SortableJS/Sortable), facilitando la construcción de interfaces de arrastrar y soltar (drag-and-drop) con una API basada en directivas. Puedes convertir cualquier lista en una experiencia ordenable añadiendo un único atributo a tu plantilla.

La biblioteca admite tanto la reordenación de listas simples como escenarios avanzados como **listas anidadas**, transferencias entre listas, clonación de elementos, integración con Angular Reactive Forms (`FormArray`), soporte para **Angular Signals** (`WritableSignal`), y personalización profunda mediante las opciones y eventos de SortableJS. Cada interacción de arrastrar y soltar permanece sincronizada con tu modelo de datos, de modo que la interfaz se mantiene reactiva y predecible.

Este paquete es un fork de `@worktile/ngx-sortablejs`, que conserva la API probada al tiempo que actualiza la marca, los metadatos y la integración con Angular para alinearse con la familia ng-hub-ui.

## Características

- **Basada en directivas** - API de directiva sencilla para añadir funcionalidad de ordenación a cualquier contenedor
- **Vinculación de arrays** - Sincroniza automáticamente las operaciones de arrastrar y soltar con tu array de datos
- **Modo de control manual** - Gestión manual opcional del array para un control total (similar a Angular CDK)
- **Soporte para Signals** - Integración nativa con los writable signals de Angular para la gestión de estado reactiva
- **Soporte para FormArray** - Integración nativa con el FormArray de Angular Reactive Forms
- **API completa de SortableJS** - Acceso a todas las opciones y eventos de SortableJS
- **Integración con la zone** - Los eventos se canalizan correctamente hacia la zone de Angular para una detección de cambios predecible
- **Modo de clonación** - Soporte para clonar elementos con funciones de clonación personalizadas
- **Soporte multilista** - Arrastra elementos entre múltiples listas conectadas
- **Soporte para TypeScript** - Seguridad de tipos completa con los typings adecuados

## Instalación

```bash
# SortableJS es una dependencia de este paquete: se instala con él
npm install ng-hub-ui-sortable

# Los typings publicados hacen referencia a los tipos de SortableJS, así que instálalos también
npm install -D @types/sortablejs
```

O usando yarn:

```bash
yarn add ng-hub-ui-sortable
yarn add -D @types/sortablejs
```

### Requisitos

- Angular `>=18.0.0`: la única peer dependency, junto a `@angular/common`.
- SortableJS `>=1.7.0`: es una **dependencia** normal desde la 21.2.0, así que se resuelve sola. No
  la añadas a tu propio manifiesto: una segunda copia fijada aparte es un desajuste de versiones
  esperando a ocurrir.

## Inicio rápido

Aquí tienes un ejemplo rápido para empezar con `ng-hub-ui-sortable`. La directiva es
**standalone**, así que se importa directamente, sin necesidad de módulo.

### 1. Importa la directiva standalone

```typescript
import { Component } from "@angular/core";
import { SortableDirective } from "ng-hub-ui-sortable";

@Component({
  selector: "app-sortable-demo",
  standalone: true,
  imports: [SortableDirective],
  template: `
    <div [hubSortable]="items" [options]="{ animation: 150 }">
      @for (item of items; track item) {
        <div class="sortable-item">{{ item }}</div>
      }
    </div>
  `,
})
export class SortableDemoComponent {
  items = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];
}
```

### 2. (Opcional) Comparte opciones globales

Para aplicar las mismas opciones de SortableJS a todas las directivas de la aplicación,
regístralas una sola vez con el proveedor standalone `provideSortable()`:

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { provideSortable } from "ng-hub-ui-sortable";

bootstrapApplication(AppComponent, {
  providers: [provideSortable({ animation: 150, ghostClass: "sortable-ghost" })],
});
```

## Uso

### Directiva standalone (recomendado)

```typescript
import { Component } from "@angular/core";
import { SortableDirective } from "ng-hub-ui-sortable";

@Component({
  selector: "app-sortable-list",
  standalone: true,
  imports: [SortableDirective],
  template: `
    <div [hubSortable]="items" [options]="{ animation: 150 }">
      @for (item of items; track item) {
        <div class="sortable-item">{{ item }}</div>
      }
    </div>
  `,
})
export class SortableListComponent {
  items = ["Item 1", "Item 2", "Item 3"];
}
```

### Opciones globales con `provideSortable()` (recomendado)

```typescript
import { provideSortable } from "ng-hub-ui-sortable";

bootstrapApplication(AppComponent, {
  providers: [provideSortable({ animation: 150 })],
});
```

### NgModule (obsoleto, solo por compatibilidad)

> **Obsoleto.** `SortableModule` y `SortableModule.forRoot()` se mantienen únicamente para
> aplicaciones NgModule heredadas. Usa preferiblemente la directiva standalone
> `SortableDirective` y `provideSortable()`.

```typescript
import { NgModule } from "@angular/core";
import { SortableModule } from "ng-hub-ui-sortable";

@NgModule({
  imports: [SortableModule.forRoot({ animation: 150 })],
})
export class AppModule {}
```

## API de la directiva

### Inputs principales

| Input             | Tipo                                             | Descripción                                                                                                                                        |
| ----------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`           | `any[]`, `FormArray` o `WritableSignal<any[]>`   | Vinculación del modelo que se mantiene sincronizada con las operaciones de arrastrar y soltar (usado con el alias `[hubSortable]`)                 |
| `container`       | `string`                                         | Selector CSS opcional para el contenedor ordenable real cuando el host está envuelto por otro componente                                          |
| `options`         | `Options`                                        | Objeto de opciones nativo de SortableJS. Proporciona una nueva referencia de objeto para disparar actualizaciones de opciones                     |
| `cloneFunction`   | `(item: any) => any`                             | Función de clonación personalizada para el modo de clonación. Te permite personalizar cómo se clonan los elementos                                |
| `autoUpdateArray` | `boolean`                                        | Controla las actualizaciones automáticas del array. Cuando es `true` (por defecto), los arrays se actualizan automáticamente. Cuando es `false`, tienes el control total (similar a Angular CDK) |
| `keyboardSorting` | `boolean`                                        | Reordenación por teclado, activada por defecto. Ver [Accesibilidad](#accesibilidad) |
| `keyboardMessages` | `Partial<SortableKeyboardMessages>`             | Sustituye las frases que anuncia la reordenación por teclado; lo que no indiques conserva su texto en inglés |

### Inputs de opciones de SortableJS

Todas las opciones de SortableJS pueden pasarse a través del input `[options]` o como inputs individuales:

| Input                   | Tipo                 | Descripción                                                                       |
| ----------------------- | -------------------- | --------------------------------------------------------------------------------- |
| `group`                 | `string \| object`   | Nombre del grupo u opciones para arrastrar entre listas                           |
| `sort`                  | `boolean`            | Habilita/deshabilita la ordenación dentro de la lista                             |
| `delay`                 | `number`             | Tiempo en milisegundos para definir cuándo debe empezar la ordenación             |
| `disabled`              | `boolean`            | Deshabilita el sortable si se establece en true                                   |
| `draggable`             | `string`             | Selector CSS para los elementos arrastrables dentro del contenedor                |
| `handle`                | `string`             | Selector CSS para el manejador de arrastre dentro de los elementos de la lista    |
| `animation`             | `number`             | Velocidad de animación en milisegundos al ordenar                                 |
| `ghostClass`            | `string`             | Clase CSS aplicada al elemento fantasma durante el arrastre                       |
| `chosenClass`           | `string`             | Clase CSS aplicada al elemento elegido                                            |
| `dragClass`             | `string`             | Clase CSS aplicada al elemento que se está arrastrando                            |
| `fallbackOnBody`        | `boolean`            | Añade el elemento fantasma al body del documento                                  |
| `fallbackTolerance`     | `number`             | Número de píxeles que un punto debe moverse antes de disparar el arrastre         |
| `fallbackClass`         | `string`             | Clase CSS aplicada al usar forceFallback                                          |
| `fallbackOffset`        | `object`             | Configuración del offset del fallback                                             |
| `forceFallback`         | `boolean`            | Fuerza la activación del fallback                                                 |
| `filter`                | `string \| function` | Selector CSS o función para filtrar los elementos que no deben ser arrastrables   |
| `preventOnFilter`       | `boolean`            | Llama a preventDefault en el evento de filtro                                     |
| `direction`             | `string`             | Dirección del Sortable ('vertical' u 'horizontal', autodetectada si no se indica) |
| `swapThreshold`         | `number`             | Umbral de la zona de intercambio (0-1)                                            |
| `invertSwap`            | `boolean`            | Invierte la dirección del umbral de intercambio                                   |
| `invertedSwapThreshold` | `number`             | Umbral cuando la dirección de intercambio está invertida                          |
| `removeCloneOnHide`     | `boolean`            | Elimina el elemento clon cuando no se muestra                                     |
| `ignore`                | `string`             | Selector CSS para los elementos a ignorar                                         |
| `touchStartThreshold`   | `number`             | Número de píxeles que un punto debe moverse antes de cancelar un evento de arrastre retardado |
| `emptyInsertThreshold`  | `number`             | Distancia a la que el ratón debe estar de un sortable vacío para insertar el elemento arrastrado |
| `dropBubble`            | `boolean`            | Habilita el bubble de drop                                                        |
| `dragoverBubble`        | `boolean`            | Habilita el bubble de dragover                                                    |
| `dataIdAttr`            | `string`             | Atributo HTML que define el id de los datos                                       |
| `delayOnTouchOnly`      | `boolean`            | Aplica el retardo solo en dispositivos táctiles                                   |
| `easing`                | `string`             | Easing para la animación (p. ej., 'cubic-bezier(1, 0, 0, 1)')                     |
| `setData`               | `function`           | Función para establecer los datos de los eventos dragover/drop                    |
| `store`                 | `object`             | Módulo de almacenamiento para guardar y restaurar el orden de la lista            |

### Outputs

Todos los outputs emiten eventos que se canalizan a través de la zone de Angular para una detección de cambios adecuada.

Se declaran con la función `output()` de Angular, así que cada uno es un `OutputEmitterRef`, no un
`EventEmitter`: se vincula desde la plantilla como cualquier output y en TypeScript ofrece
`subscribe()`, pero no es un `Observable` y no tiene `.pipe()`.

| Output        | Tipo                                                           | Descripción                                                                          |
| ------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `init`        | `OutputEmitterRef<Sortable>`                                   | Emite la instancia de Sortable instanciada en la inicialización                      |
| `start`       | `OutputEmitterRef<SortableEvent>`                              | Se dispara cuando empieza el arrastre                                                |
| `end`         | `OutputEmitterRef<SortableEvent>`                              | Se dispara cuando termina el arrastre                                                |
| `add`         | `OutputEmitterRef<SortableEvent>`                              | Se añade un elemento desde otra lista                                                |
| `remove`      | `OutputEmitterRef<SortableEvent>`                              | Se elimina un elemento hacia otra lista                                              |
| `update`      | `OutputEmitterRef<SortableEvent>`                              | La posición de un elemento se actualiza dentro de la misma lista                     |
| `sortEvent`   | `OutputEmitterRef<SortableEvent>`                              | Se llama cuando la lista se ordena (cualquier cambio en el orden)                    |
| `filterEvent` | `OutputEmitterRef<SortableEvent>`                              | Se llama cuando se intenta arrastrar un elemento filtrado                            |
| `change`      | `OutputEmitterRef<SortableEvent>`                              | Se llama cuando la lista cambia al añadir o eliminar un elemento                     |
| `choose`      | `OutputEmitterRef<SortableEvent>`                              | Se elige un elemento (mouse down sobre el elemento arrastrable)                      |
| `unchoose`    | `OutputEmitterRef<SortableEvent>`                              | Se desselecciona un elemento (mouse up sin arrastre)                                 |
| `clone`       | `OutputEmitterRef<SortableEvent>`                              | Se clona un elemento al arrastrar entre listas con el modo de clonación              |
| `move`        | `OutputEmitterRef<{ event: MoveEvent; originalEvent: Event }>` | Se llama durante el movimiento de arrastre con los detalles del evento de movimiento |

## Opciones de SortableJS

Todas las opciones de SortableJS pueden pasarse mediante `options`. Se canalizan hacia la zone de Angular para mantener la detección de cambios predecible.

### Opciones comunes

```typescript
import { Options } from "ng-hub-ui-sortable";

interface SortableOptions extends Options {
  animation?: number; // Velocidad de animación en ms
  handle?: string; // Selector CSS para el manejador de arrastre
  filter?: string; // Selector CSS para los elementos a ignorar
  draggable?: string; // Selector CSS para los elementos arrastrables
  ghostClass?: string; // Clase para el marcador de posición del drop
  chosenClass?: string; // Clase para el elemento elegido
  dragClass?: string; // Clase para el elemento que se arrastra
  group?: string | object; // Nombre del grupo para arrastre multilista
  sort?: boolean; // Habilita la ordenación dentro de la lista
  disabled?: boolean; // Deshabilita el sortable
  // ... y muchas más
}
```

### Callbacks de eventos

```typescript
{
  onStart: (event) => { /* Arrastre iniciado */ },
  onEnd: (event) => { /* Arrastre finalizado */ },
  onAdd: (event) => { /* Elemento añadido desde otra lista */ },
  onRemove: (event) => { /* Elemento eliminado hacia otra lista */ },
  onUpdate: (event) => { /* Orden del elemento cambiado dentro de la lista */ },
  onSort: (event) => { /* Cualquier cambio de ordenación */ },
  onChange: (event) => { /* Elemento movido dentro o entre listas */ },
  onChoose: (event) => { /* Elemento elegido */ },
  onUnchoose: (event) => { /* Elemento desseleccionado */ },
  onFilter: (event) => { /* Clic en un elemento filtrado */ },
  onClone: (event) => { /* Clon creado */ }
}
```

## Ejemplos

### Lista ordenable simple

```html
<ul [hubSortable]="items">
  @for (item of items; track item) {
  <li>{{ item }}</li>
  }
</ul>
```

### Con animación y manejador

```html
<div [hubSortable]="items" [options]="{ animation: 150, handle: '.drag-handle' }">
  @for (item of items; track item.id) {
  <div class="item">
    <span class="drag-handle">&#9776;</span>
    {{ item.name }}
  </div>
  }
</div>
```

### Múltiples listas conectadas

```typescript
@Component({
  selector: "app-multi-list",
  standalone: true,
  imports: [SortableDirective],
  template: `
    <div class="list" [hubSortable]="list1" [options]="options">
      @for (item of list1; track item) {
        <div>{{ item }}</div>
      }
    </div>
    <div class="list" [hubSortable]="list2" [options]="options">
      @for (item of list2; track item) {
        <div>{{ item }}</div>
      }
    </div>
  `,
})
export class MultiListComponent {
  list1 = ["Item 1", "Item 2", "Item 3"];
  list2 = ["Item 4", "Item 5", "Item 6"];

  options = {
    group: "shared",
    animation: 150,
  };
}
```

### Con FormArray

```typescript
@Component({
  selector: "app-form-array",
  standalone: true,
  imports: [ReactiveFormsModule, SortableDirective],
  template: `
    <form [formGroup]="form">
      <div [hubSortable]="formArray" [options]="{ animation: 150 }">
        @for (control of formArray.controls; track control; let i = $index) {
          <div>
            <input [formControlName]="i" />
          </div>
        }
      </div>
    </form>
  `,
})
export class FormArrayComponent {
  form = new FormGroup({
    items: new FormArray([new FormControl("Item 1"), new FormControl("Item 2"), new FormControl("Item 3")]),
  });

  get formArray() {
    return this.form.get("items") as FormArray;
  }
}
```

### Con Angular Signals

```typescript
import { Component, signal, computed } from "@angular/core";
import { SortableDirective } from "ng-hub-ui-sortable";

@Component({
  selector: "app-signal-sortable",
  standalone: true,
  imports: [SortableDirective],
  template: `
    <div [hubSortable]="items" [options]="{ animation: 150 }">
      @for (item of items(); track item.id) {
        <div class="item">{{ item.name }}</div>
      }
    </div>
    <p>Current items: {{ itemNames() }}</p>
  `,
})
export class SignalSortableComponent {
  items = signal([
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" },
  ]);

  // Signal computada que deriva de la signal del sortable
  itemNames = computed(() =>
    this.items()
      .map((item) => item.name)
      .join(", "),
  );
}
```

### Modo de clonación

```typescript
@Component({
  selector: "app-clone",
  standalone: true,
  imports: [SortableDirective],
  template: `
    <div [hubSortable]="items" [options]="cloneOptions" [cloneFunction]="cloneItem">
      @for (item of items; track item.name) {
        <div>{{ item.name }}</div>
      }
    </div>
  `,
})
export class CloneComponent {
  items = [{ name: "Item 1" }, { name: "Item 2" }];

  cloneOptions = {
    group: {
      name: "clone-group",
      pull: "clone",
      put: false,
    },
  };

  cloneItem = (item: any) => ({ ...item, name: `${item.name} (copy)` });
}
```

### Contenedor personalizado

Para casos en los que el host de la directiva está envuelto por otro componente (p. ej., Angular Material):

```html
<mat-list [hubSortable]="items" container=".mat-list-inner">
  @for (item of items; track item) {
  <mat-list-item>{{ item }}</mat-list-item>
  }
</mat-list>
```

### Modo de control manual

Por defecto, `ng-hub-ui-sortable` actualiza automáticamente tus arrays cuando los elementos se arrastran y se sueltan. Sin embargo, puedes optar por el **modo de control manual** para tener un control completo sobre cuándo y cómo se actualizan los arrays, de forma similar al enfoque de arrastrar y soltar de Angular CDK.

#### Cuándo usar el control manual

Usa el modo de control manual (`[autoUpdateArray]="false"`) cuando necesites:

- **Validar los cambios** antes de actualizar el modelo de datos
- **Realizar llamadas a la API** para persistir los cambios en un backend
- **Implementar funcionalidad de deshacer/rehacer**
- **Usar patrones de datos inmutables** para una detección de cambios óptima
- **Añadir lógica de negocio personalizada** a las operaciones de arrastre
- **Manejar los errores con elegancia** antes de confirmar los cambios

#### Cómo funciona

Cuando `autoUpdateArray` se establece en `false`, la directiva solo emite eventos sin modificar tus arrays. Eres responsable de actualizar los datos usando la información del evento proporcionada.

```typescript
import { Component } from "@angular/core";
import { SortableDirective, moveItemInArray, transferArrayItem, SortableEvent } from "ng-hub-ui-sortable";

@Component({
  selector: "app-tasks",
  standalone: true,
  imports: [SortableDirective],
  template: `
    <div [hubSortable]="tasks" [autoUpdateArray]="false" (update)="onUpdate($event)">
      @for (task of tasks; track task.id) {
        <div class="task">{{ task.title }}</div>
      }
    </div>
  `,
})
export class TasksComponent {
  tasks = [
    { id: 1, title: "Design mockups" },
    { id: 2, title: "Implement feature" },
    { id: 3, title: "Write tests" },
  ];

  onUpdate(event: SortableEvent): void {
    if (event.oldIndex === undefined || event.newIndex === undefined) {
      return;
    }

    // Valida la operación de arrastre
    if (this.isValidMove(event.oldIndex, event.newIndex)) {
      // Actualiza el array manualmente
      moveItemInArray(this.tasks, event.oldIndex, event.newIndex);

      // Persiste en el backend
      this.apiService.updateTaskOrder(this.tasks).subscribe();
    }
  }

  isValidMove(oldIndex: number, newIndex: number): boolean {
    // Añade aquí tu lógica de validación
    return true;
  }
}
```

#### Funciones auxiliares

La biblioteca proporciona tres funciones auxiliares para la manipulación manual de arrays:

##### moveItemInArray

Mueve un elemento dentro del mismo array:

```typescript
import { moveItemInArray } from "ng-hub-ui-sortable";

const items = ["A", "B", "C", "D"];
moveItemInArray(items, 1, 3);
// Resultado: ['A', 'C', 'D', 'B']
```

##### transferArrayItem

Transfiere un elemento de un array a otro:

```typescript
import { transferArrayItem } from "ng-hub-ui-sortable";

const source = ["A", "B", "C"];
const target = ["1", "2", "3"];
transferArrayItem(source, target, 1, 2);
// source: ['A', 'C']
// target: ['1', '2', 'B', '3']
```

##### copyArrayItem

Copia un elemento a otro array sin eliminarlo del origen:

```typescript
import { copyArrayItem } from "ng-hub-ui-sortable";

const source = ["A", "B", "C"];
const target = ["1", "2", "3"];
copyArrayItem(source, target, 1, 2);
// source: ['A', 'B', 'C'] (sin cambios)
// target: ['1', '2', 'B', '3']
```

#### Ejemplo con múltiples listas

```typescript
import { Component } from "@angular/core";
import { SortableDirective, transferArrayItem, SortableEvent } from "ng-hub-ui-sortable";

@Component({
  selector: "app-kanban",
  standalone: true,
  imports: [SortableDirective],
  template: `
    <div class="board">
      <div class="column">
        <h3>To Do</h3>
        <ul [hubSortable]="todoList" [autoUpdateArray]="false" [options]="{ group: 'tasks' }" (add)="onListAdd($event, todoList)" (update)="onListUpdate($event, todoList)" data-list-id="todo">
          @for (item of todoList; track item.id) {
            <li>{{ item.title }}</li>
          }
        </ul>
      </div>

      <div class="column">
        <h3>In Progress</h3>
        <ul [hubSortable]="inProgressList" [autoUpdateArray]="false" [options]="{ group: 'tasks' }" (add)="onListAdd($event, inProgressList)" (update)="onListUpdate($event, inProgressList)" data-list-id="inProgress">
          @for (item of inProgressList; track item.id) {
            <li>{{ item.title }}</li>
          }
        </ul>
      </div>

      <div class="column">
        <h3>Done</h3>
        <ul [hubSortable]="doneList" [autoUpdateArray]="false" [options]="{ group: 'tasks' }" (add)="onListAdd($event, doneList)" (update)="onListUpdate($event, doneList)" data-list-id="done">
          @for (item of doneList; track item.id) {
            <li>{{ item.title }}</li>
          }
        </ul>
      </div>
    </div>
  `,
})
export class KanbanComponent {
  todoList = [{ id: 1, title: "Task 1" }];
  inProgressList = [{ id: 2, title: "Task 2" }];
  doneList = [{ id: 3, title: "Task 3" }];

  onListAdd(event: SortableEvent, targetList: any[]): void {
    if (event.oldIndex === undefined || event.newIndex === undefined) {
      return;
    }

    const sourceList = this.getListByElement(event.from);
    if (sourceList) {
      transferArrayItem(sourceList, targetList, event.oldIndex, event.newIndex);

      // Actualiza el backend
      this.apiService.moveTask(/* ... */).subscribe();
    }
  }

  onListUpdate(event: SortableEvent, list: any[]): void {
    if (event.oldIndex === undefined || event.newIndex === undefined) {
      return;
    }

    moveItemInArray(list, event.oldIndex, event.newIndex);
  }

  private getListByElement(element: HTMLElement): any[] | null {
    const listId = element.getAttribute("data-list-id");
    switch (listId) {
      case "todo":
        return this.todoList;
      case "inProgress":
        return this.inProgressList;
      case "done":
        return this.doneList;
      default:
        return null;
    }
  }
}
```

#### Comparación: automático frente a manual

| Aspecto                 | Modo automático (por defecto)     | Modo manual                       |
| ----------------------- | --------------------------------- | --------------------------------- |
| **Actualización de arrays** | Automática                    | Tú controlas cuándo y cómo        |
| **Código necesario**    | Mínimo                            | Se necesitan manejadores de eventos |
| **Validación**          | No es posible antes de actualizar | Soporte completo de validación    |
| **Integración con API** | Actualiza después del hecho       | Actualiza antes de confirmar      |
| **Inmutabilidad**       | Muta los arrays in situ           | Puede crear nuevos arrays         |
| **Ideal para**          | Listas simples, prototipos        | Apps de producción, lógica compleja |

> **Nota sobre el manejo de eventos:** SortableJS dispara internamente múltiples eventos para una sola operación de arrastre (p. ej., tanto `update` como `sort`). **ng-hub-ui-sortable gestiona esto automáticamente**, garantizando que solo recibas un evento por operación en modo manual. Para más detalles sobre el flujo interno de eventos, consulta la [Guía de eventos](docs/EVENTS.md).

## Casos de uso reales

El componente `ng-hub-ui-sortable` es versátil y puede usarse en diversas aplicaciones del mundo real:

- **Listas de tareas** - Reordena tareas por prioridad con arrastrar y soltar
- **Gestores de listas de reproducción** - Organiza elementos multimedia en un orden personalizado
- **Constructores de formularios** - Ordenación de campos de formulario mediante arrastrar y soltar
- **Widgets de dashboard** - Layouts de widgets personalizables por el usuario
- **Galerías de fotos** - Reorganiza imágenes en álbumes
- **Editores de menús** - Ordenación de menús de navegación de un CMS
- **Tableros Kanban** - (Para tableros avanzados, consulta [ng-hub-ui-board](https://www.npmjs.com/package/ng-hub-ui-board))

## Solución de problemas

Aquí tienes algunos problemas comunes y cómo resolverlos:

### El arrastrar y soltar no funciona

- **Comprueba las importaciones**: Asegúrate de que la directiva standalone `SortableDirective` esté importada correctamente
- **Verifica la vinculación**: Asegúrate de que `[hubSortable]` esté vinculado a un array o FormArray
- **Comprueba el contenedor**: Los elementos deben ser hijos directos del contenedor sortable

### El array no se actualiza

- **Comprobación de referencia**: SortableJS modifica el array in situ; asegúrate de que la detección de cambios lo capture
- **Problemas con la zone**: Si usas `OnPush`, puede que necesites disparar la detección de cambios manualmente

### Los eventos no se disparan

- **Canalización por la zone**: Los eventos se canalizan automáticamente a través de la zone de Angular
- **Referencia de opciones**: Proporciona una nueva referencia de objeto a `options` al actualizar las opciones

### Problemas con múltiples listas

- **Nombre del grupo**: Asegúrate de que todas las listas compartan el mismo nombre de `group` en las opciones
- **Importación de la directiva**: `SortableDirective` debe estar importada por ambos componentes que alojan las listas conectadas

### Problemas de sincronización del FormArray

- **Vinculación directa**: Vincula el FormArray directamente, no el FormGroup padre
- **Acceso a los controles**: Accede a los controles mediante `formArray.controls` en tu plantilla

Si los problemas persisten, abre una incidencia en: https://github.com/carlos-morcillo/ng-hub-ui-sortable/issues

## Listas conectadas con `SortableBindings`

Un solo arrastre puede mantener varios arrays paralelos en fila. `SortableBindings` envuelve
un conjunto de listas y aplica cada inserción y cada borrado en el mismo índice de todas,
que es lo que necesita una tabla guardada como un array por columna. Siempre ha sido lo que
`[hubSortable]` acepta en lugar de un array; desde la **22.2.0** además se exporta, así que
también se puede construir y tipar:

```typescript
import { SortableBindings } from 'ng-hub-ui-sortable';

names = ['Alice', 'Bob', 'Charlie'];
ages = [25, 30, 35];
emails = ['alice@example.com', 'bob@example.com', 'charlie@example.com'];

readonly rows = new SortableBindings([this.names, this.ages, this.emails]);
```

```html
<tbody [hubSortable]="rows">
	@for (name of names; track name; let i = $index) {
		<tr>
			<td>{{ name }}</td>
			<td>{{ ages[i] }}</td>
			<td>{{ emails[i] }}</td>
		</tr>
	}
</tbody>
```

Arrastrar la segunda fila arriba mueve `'Bob'`, `30` y `bob@example.com` juntos. Los arrays
tienen que mantener la misma longitud y el mismo orden: la clase los empareja por índice y
por nada más. Conectar dos listas *distintas* para que los elementos viajen entre ellas es
otra cosa, y es la opción `group`, no esta clase.

Cada lista dentro de un `SortableBindings` es un `SortableBinding`, exportado junto a él, que
es la pieza que esconde la diferencia entre un array, un `FormArray` y un
`WritableSignal<T[]>` detrás de `insert` / `get` / `remove`.

## Accesibilidad

La reordenación de SortableJS es solo con puntero: escucha `mousedown` y `touchstart`, y
nada más. Desde la **22.2.0** este wrapper añade la otra mitad, así que una lista se
reordena con el teclado sin que tengas que hacer nada.

Cada elemento — o su `handle`, si lo hay — pasa a ser una parada de tabulación, y a partir
de ahí la interacción sigue el modelo agarrar / mover / soltar de las prácticas de autoría
de WAI-ARIA:

| Tecla | Sin nada agarrado | Con un elemento agarrado |
| --- | --- | --- |
| `Enter` / `Espacio` | agarra el elemento | lo suelta donde esté |
| `↑` / `←` | nada (la página sigue desplazándose) | lo mueve una posición atrás |
| `↓` / `→` | nada | lo mueve una posición adelante |
| `Inicio` / `Fin` | nada | lo lleva a la primera / última posición |
| `Escape` | nada | abandona el movimiento y lo devuelve a su sitio |

Cada uno de esos pasos se anuncia por una región viva `polite` que la directiva añade al
documento y retira al destruirse, porque el resto del retorno es puramente visual. Las
flechas solo se capturan cuando hay algo agarrado, así que una lista dentro de una página
con scroll se sigue desplazando.

Reordenar con el teclado obedece las mismas reglas que un arrastre: está apagado mientras
`disabled` sea `true` o `sort` sea `false`, respeta `autoUpdateArray` — en modo manual el
array queda en tus manos, igual que tras un drop — y emite las mismas salidas `update` y
`sortEvent`, con `oldIndex` y `newIndex` rellenos.

Los anuncios están en inglés por defecto. Este paquete no lleva sistema de traducción, así
que localizarlos consiste en entregar las frases:

```typescript
messages: Partial<SortableKeyboardMessages> = {
	grabbed: (position, total) => `Elemento ${position} de ${total} agarrado.`,
	moved: (position, total) => `Movido a la posición ${position} de ${total}.`,
	dropped: (position, total) => `Soltado en la posición ${position} de ${total}.`,
	cancelled: (position, total) => `Movimiento cancelado. De vuelta en la posición ${position} de ${total}.`
};
```

```html
<div [hubSortable]="items" [keyboardMessages]="messages">…</div>
```

Para apagar el camino de teclado — porque la aplicación pone el suyo — usa
`[keyboardSorting]="false"`. La directiva retira entonces las paradas de tabulación que
había añadido y no toca ningún `tabindex` puesto por ti.

## Changelog

Consulta [CHANGELOG.md](./CHANGELOG.md) para el historial completo de versiones, y
[BREAKING_CHANGES.md](./BREAKING_CHANGES.md) para las notas de migración.

## Contribuir

¡Las contribuciones son bienvenidas! Así es como puedes ayudar:

1. Haz un fork del repositorio
2. Crea tu rama de funcionalidad: `git checkout -b feature/my-new-feature`
3. Confirma tus cambios: `git commit -am 'Add some feature'`
4. Sube la rama: `git push origin feature/my-new-feature`
5. Envía un pull request

## Apoya el proyecto

Si encuentras útil este proyecto y te gustaría apoyar su desarrollo, puedes invitarme a un café:

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/carlosmorcillo)

¡Tu apoyo es muy apreciado y ayuda a mantener y mejorar este proyecto!

## Licencia

Este proyecto está licenciado bajo la **Licencia MIT**.

Para los detalles completos de la licencia, consulta el archivo [LICENSE](LICENSE).

---

Hecho con cariño por [Carlos Morcillo Fernandez](https://www.carlosmorcillo.com/)

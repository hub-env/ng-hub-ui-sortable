# ng-hub-ui-sortable

[Español](./README.es.md) | **English**

[![NPM Version](https://img.shields.io/npm/v/ng-hub-ui-sortable.svg)](https://www.npmjs.com/package/ng-hub-ui-sortable)

## Documentation and Live Examples

This package is part of [Hub UI](https://hubui.dev/en/), a collection of Angular component libraries for standalone apps.

- Docs: https://hubui.dev/en/sortable/overview/
- Live examples: https://hubui.dev/en/sortable/examples/
- Hub UI: https://hubui.dev/en/
- Hub UI on GitHub (issues, roadmap and contributing): https://github.com/hub-env/hub-ui

## Migrating from ngx-sortablejs

`ngx-sortablejs` last published 11.1.0 in December 2020 and is a View Engine (pre-Ivy) library. Angular converted those with `ngcc` up to v15, so it stops compiling at Angular 16. **[Read the migration guide](./MIGRATION.md)** — it maps every member of the old API, shows before/after code, and is explicit about the behaviour changes that compile cleanly and fail at runtime.

The guide also tells you when *not* to migrate here: if you only need to follow Angular forward, `@worktile/ngx-sortablejs` keeps the same selector and input names and is a smaller change.

## 🧩 Library Family `ng-hub-ui`

This library is part of the **ng-hub-ui** ecosystem:

- [ng-hub-ui-accordion](https://www.npmjs.com/package/ng-hub-ui-accordion) (deprecated — use ng-hub-ui-panels)
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
- [ng-hub-ui-sortable](https://www.npmjs.com/package/ng-hub-ui-sortable) ← You are here
- [ng-hub-ui-stepper](https://www.npmjs.com/package/ng-hub-ui-stepper)
- [ng-hub-ui-utils](https://www.npmjs.com/package/ng-hub-ui-utils)

## Description

**ng-hub-ui-sortable** provides a modern Angular integration for [SortableJS](https://github.com/SortableJS/Sortable), making it easy to build drag-and-drop interfaces with a directive-first API. You can turn any list into a sortable experience by adding a single attribute to your template.

The library supports simple list reordering as well as advanced scenarios such as **nested lists**, cross-list transfers, item cloning, Angular Reactive Forms (`FormArray`) integration, **Angular Signals** (`WritableSignal`) support, and deep customization through SortableJS options and events. Each drag-and-drop interaction stays synchronized with your data model so the UI remains reactive and predictable.

This package is a fork of `@worktile/ngx-sortablejs`, keeping the proven API while updating the branding, metadata, and Angular integration to match the ng-hub-ui family.

## Features

- **Directive-based** - Simple directive API for adding sortable functionality to any container
- **Array binding** - Automatically syncs drag-and-drop operations with your data array
- **Manual control mode** - Opt-in manual array management for full control (similar to Angular CDK)
- **Signal support** - Native integration with Angular writable signals for reactive state management
- **FormArray support** - Native integration with Angular Reactive Forms FormArray
- **Full SortableJS API** - Access to all SortableJS options and events
- **Zone integration** - Events are properly proxied into Angular's zone for predictable change detection
- **Clone mode** - Support for cloning items with custom clone functions
- **Multi-list support** - Drag items between multiple connected lists
- **TypeScript support** - Full type safety with proper typings

## Installation

```bash
# SortableJS is a dependency of this package — it installs with it
npm install ng-hub-ui-sortable

# The published typings refer to the SortableJS types, so install them too
npm install -D @types/sortablejs
```

Or using yarn:

```bash
yarn add ng-hub-ui-sortable
yarn add -D @types/sortablejs
```

### Requirements

- Angular `>=18.0.0` — the only peer dependency, alongside `@angular/common`.
- SortableJS `>=1.7.0` — a regular **dependency** since 21.2.0, resolved for you. Do not add it to
  your own manifest: a second, separately-pinned copy is a version skew waiting to happen.

## Quick Start

Here's a quick example to get you started with `ng-hub-ui-sortable`. The directive is
**standalone**, so you import it directly — no module required.

### 1. Import the standalone directive

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

### 2. (Optional) Share global options

To apply the same SortableJS options to every directive in the app, register them once with
the standalone `provideSortable()` provider:

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { provideSortable } from "ng-hub-ui-sortable";

bootstrapApplication(AppComponent, {
  providers: [provideSortable({ animation: 150, ghostClass: "sortable-ghost" })],
});
```

## Usage

### Standalone directive (recommended)

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

### Global options with `provideSortable()` (recommended)

```typescript
import { provideSortable } from "ng-hub-ui-sortable";

bootstrapApplication(AppComponent, {
  providers: [provideSortable({ animation: 150 })],
});
```

### NgModule (deprecated, backwards compatibility only)

> **Deprecated.** `SortableModule` and `SortableModule.forRoot()` are kept only for legacy
> NgModule applications. Prefer the standalone `SortableDirective` and `provideSortable()`.

```typescript
import { NgModule } from "@angular/core";
import { SortableModule } from "ng-hub-ui-sortable";

@NgModule({
  imports: [SortableModule.forRoot({ animation: 150 })],
})
export class AppModule {}
```

## Directive API

### Primary Inputs

| Input             | Type                                             | Description                                                                                                                                        |
| ----------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`           | `any[]`, `FormArray`, or `WritableSignal<any[]>` | Model binding that stays in sync with drag-and-drop operations (used with alias `[hubSortable]`)                                                   |
| `container`       | `string`                                         | Optional CSS selector for the real sortable container when the host is wrapped by another component                                                |
| `options`         | `Options`                                        | Native SortableJS options object. Provide a new object reference to trigger option updates                                                         |
| `cloneFunction`   | `(item: any) => any`                             | Custom clone function for clone mode. Allows you to customize how items are cloned                                                                 |
| `autoUpdateArray` | `boolean`                                        | Controls automatic array updates. When `true` (default), arrays update automatically. When `false`, you have full control (similar to Angular CDK) |
| `keyboardSorting` | `boolean`                                        | Keyboard reordering, on by default. See [Accessibility](#accessibility) |
| `keyboardMessages` | `Partial<SortableKeyboardMessages>`             | Overrides for the sentences the keyboard reorder announces; anything left out keeps its English default |

### SortableJS Option Inputs

All SortableJS options can be passed either through the `[options]` input or as individual inputs:

| Input                   | Type                 | Description                                                                       |
| ----------------------- | -------------------- | --------------------------------------------------------------------------------- |
| `group`                 | `string \| object`   | Group name or options for dragging between lists                                  |
| `sort`                  | `boolean`            | Enable/disable sorting within the list                                            |
| `delay`                 | `number`             | Time in milliseconds to define when sorting should start                          |
| `disabled`              | `boolean`            | Disable the sortable if set to true                                               |
| `draggable`             | `string`             | CSS selector for draggable items within the container                             |
| `handle`                | `string`             | CSS selector for drag handle within list items                                    |
| `animation`             | `number`             | Animation speed in milliseconds when sorting                                      |
| `ghostClass`            | `string`             | CSS class applied to the ghost element during drag                                |
| `chosenClass`           | `string`             | CSS class applied to the chosen element                                           |
| `dragClass`             | `string`             | CSS class applied to the dragging element                                         |
| `fallbackOnBody`        | `boolean`            | Append ghost element to document body                                             |
| `fallbackTolerance`     | `number`             | Number of pixels a point should move before triggering drag                       |
| `fallbackClass`         | `string`             | CSS class applied when using forceFallback                                        |
| `fallbackOffset`        | `object`             | Fallback offset configuration                                                     |
| `forceFallback`         | `boolean`            | Force the fallback to activate                                                    |
| `filter`                | `string \| function` | CSS selector or function to filter items that should not be draggable             |
| `preventOnFilter`       | `boolean`            | Call preventDefault on filter event                                               |
| `direction`             | `string`             | Direction of Sortable ('vertical' or 'horizontal', auto-detected if not provided) |
| `swapThreshold`         | `number`             | Threshold of swap zone (0-1)                                                      |
| `invertSwap`            | `boolean`            | Inverts swap threshold direction                                                  |
| `invertedSwapThreshold` | `number`             | Threshold when swapping direction is inverted                                     |
| `removeCloneOnHide`     | `boolean`            | Remove clone element when not showing                                             |
| `ignore`                | `string`             | CSS selector for elements to ignore                                               |
| `touchStartThreshold`   | `number`             | Number of pixels a point should move before cancelling a delayed drag event       |
| `emptyInsertThreshold`  | `number`             | Distance mouse must be from empty sortable to insert drag element into it         |
| `dropBubble`            | `boolean`            | Enable drop bubble                                                                |
| `dragoverBubble`        | `boolean`            | Enable dragover bubble                                                            |
| `dataIdAttr`            | `string`             | HTML attribute that defines the data id                                           |
| `delayOnTouchOnly`      | `boolean`            | Only delay on touch devices                                                       |
| `easing`                | `string`             | Easing for animation (e.g., 'cubic-bezier(1, 0, 0, 1)')                           |
| `setData`               | `function`           | Function to set data for dragover/drop events                                     |
| `store`                 | `object`             | Store module for saving and restoring the sort order                              |

### Outputs

All outputs emit events that are proxied through Angular's zone for proper change detection.

They are declared with Angular's `output()` function, so each one is an `OutputEmitterRef`, not an
`EventEmitter`: it is bound from a template like any output, and in TypeScript it offers
`subscribe()` — but it is not an `Observable` and has no `.pipe()`.

| Output        | Type                                                           | Description                                                   |
| ------------- | -------------------------------------------------------------- | ------------------------------------------------------------- |
| `init`        | `OutputEmitterRef<Sortable>`                                   | Emits the instantiated Sortable instance on initialization    |
| `start`       | `OutputEmitterRef<SortableEvent>`                              | Fired when dragging starts                                    |
| `end`         | `OutputEmitterRef<SortableEvent>`                              | Fired when dragging ends                                      |
| `add`         | `OutputEmitterRef<SortableEvent>`                              | Element is added from another list                            |
| `remove`      | `OutputEmitterRef<SortableEvent>`                              | Element is removed to another list                            |
| `update`      | `OutputEmitterRef<SortableEvent>`                              | Element position is updated within the same list              |
| `sortEvent`   | `OutputEmitterRef<SortableEvent>`                              | Called when the list is sorted (any change in order)          |
| `filterEvent` | `OutputEmitterRef<SortableEvent>`                              | Called when an attempt is made to drag a filtered element     |
| `change`      | `OutputEmitterRef<SortableEvent>`                              | Called when list changes by adding or removing an item        |
| `choose`      | `OutputEmitterRef<SortableEvent>`                              | Element is chosen (mouse down on draggable element)           |
| `unchoose`    | `OutputEmitterRef<SortableEvent>`                              | Element is unchosen (mouse up without drag)                   |
| `clone`       | `OutputEmitterRef<SortableEvent>`                              | Element is cloned when dragging between lists with clone mode |
| `move`        | `OutputEmitterRef<{ event: MoveEvent; originalEvent: Event }>` | Called during drag move with move event details               |

## SortableJS Options

All SortableJS options can be passed via `options`. They are proxied into Angular's zone to keep change detection predictable.

### Common Options

```typescript
import { Options } from "ng-hub-ui-sortable";

interface SortableOptions extends Options {
  animation?: number; // Animation speed in ms
  handle?: string; // CSS selector for drag handle
  filter?: string; // CSS selector for elements to ignore
  draggable?: string; // CSS selector for draggable items
  ghostClass?: string; // Class for the drop placeholder
  chosenClass?: string; // Class for the chosen item
  dragClass?: string; // Class for the dragging item
  group?: string | object; // Group name for multi-list drag
  sort?: boolean; // Enable sorting within list
  disabled?: boolean; // Disable the sortable
  // ... and many more
}
```

### Event Callbacks

```typescript
{
  onStart: (event) => { /* Drag started */ },
  onEnd: (event) => { /* Drag ended */ },
  onAdd: (event) => { /* Item added from another list */ },
  onRemove: (event) => { /* Item removed to another list */ },
  onUpdate: (event) => { /* Item order changed within list */ },
  onSort: (event) => { /* Any sorting change */ },
  onChange: (event) => { /* Item moved within or between lists */ },
  onChoose: (event) => { /* Item chosen */ },
  onUnchoose: (event) => { /* Item unchosen */ },
  onFilter: (event) => { /* Filtered element clicked */ },
  onClone: (event) => { /* Clone created */ }
}
```

## Examples

### Simple Sortable List

```html
<ul [hubSortable]="items">
  @for (item of items; track item) {
  <li>{{ item }}</li>
  }
</ul>
```

### With Animation and Handle

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

### Multiple Connected Lists

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

### With FormArray

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

### With Angular Signals

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

  // Computed signal that derives from sortable signal
  itemNames = computed(() =>
    this.items()
      .map((item) => item.name)
      .join(", "),
  );
}
```

### Clone Mode

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

### Custom Container

For cases where the directive host is wrapped by another component (e.g., Angular Material):

```html
<mat-list [hubSortable]="items" container=".mat-list-inner">
  @for (item of items; track item) {
  <mat-list-item>{{ item }}</mat-list-item>
  }
</mat-list>
```

### Manual Control Mode

By default, `ng-hub-ui-sortable` automatically updates your arrays when items are dragged and dropped. However, you can opt into **manual control mode** for complete control over when and how arrays are updated, similar to Angular CDK's drag-and-drop approach.

#### When to Use Manual Control

Use manual control mode (`[autoUpdateArray]="false"`) when you need to:

- **Validate changes** before updating the data model
- **Make API calls** to persist changes to a backend
- **Implement undo/redo** functionality
- **Use immutable data patterns** for optimal change detection
- **Add custom business logic** to drag operations
- **Handle errors gracefully** before committing changes

#### How It Works

When `autoUpdateArray` is set to `false`, the directive only emits events without modifying your arrays. You're responsible for updating the data using the provided event information.

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

    // Validate the drag operation
    if (this.isValidMove(event.oldIndex, event.newIndex)) {
      // Manually update the array
      moveItemInArray(this.tasks, event.oldIndex, event.newIndex);

      // Persist to backend
      this.apiService.updateTaskOrder(this.tasks).subscribe();
    }
  }

  isValidMove(oldIndex: number, newIndex: number): boolean {
    // Add your validation logic here
    return true;
  }
}
```

#### Helper Functions

The library provides three helper functions for manual array manipulation:

##### moveItemInArray

Moves an item within the same array:

```typescript
import { moveItemInArray } from "ng-hub-ui-sortable";

const items = ["A", "B", "C", "D"];
moveItemInArray(items, 1, 3);
// Result: ['A', 'C', 'D', 'B']
```

##### transferArrayItem

Transfers an item from one array to another:

```typescript
import { transferArrayItem } from "ng-hub-ui-sortable";

const source = ["A", "B", "C"];
const target = ["1", "2", "3"];
transferArrayItem(source, target, 1, 2);
// source: ['A', 'C']
// target: ['1', '2', 'B', '3']
```

##### copyArrayItem

Copies an item to another array without removing it from the source:

```typescript
import { copyArrayItem } from "ng-hub-ui-sortable";

const source = ["A", "B", "C"];
const target = ["1", "2", "3"];
copyArrayItem(source, target, 1, 2);
// source: ['A', 'B', 'C'] (unchanged)
// target: ['1', '2', 'B', '3']
```

#### Multiple Lists Example

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

      // Update backend
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

#### Comparison: Automatic vs Manual

| Aspect              | Automatic Mode (default)   | Manual Mode                    |
| ------------------- | -------------------------- | ------------------------------ |
| **Array updates**   | Automatic                  | You control when and how       |
| **Code required**   | Minimal                    | Event handlers needed          |
| **Validation**      | Not possible before update | Full validation support        |
| **API integration** | Update after the fact      | Update before committing       |
| **Immutability**    | Mutates arrays in place    | Can create new arrays          |
| **Best for**        | Simple lists, prototypes   | Production apps, complex logic |

> **Note on Event Handling:** SortableJS internally fires multiple events for a single drag operation (e.g., both `update` and `sort`). **ng-hub-ui-sortable handles this automatically**, ensuring you only receive one event per operation in manual mode. For more details on the internal event flow, see the [Events Guide](docs/EVENTS.md).

## Real-world Use Cases

The `ng-hub-ui-sortable` component is versatile and can be used in various real-world applications:

- **Task Lists** - Reorder tasks by priority with drag-and-drop
- **Playlist Managers** - Arrange media items in custom order
- **Form Builders** - Drag-and-drop form field ordering
- **Dashboard Widgets** - User-customizable widget layouts
- **Photo Galleries** - Rearrange images in albums
- **Menu Editors** - CMS navigation menu ordering
- **Kanban Boards** - (For advanced boards, see [ng-hub-ui-board](https://www.npmjs.com/package/ng-hub-ui-board))

## Troubleshooting

Here are some common issues and how to resolve them:

### Drag and drop not working

- **Check imports**: Ensure the standalone `SortableDirective` is properly imported
- **Verify binding**: Make sure `[hubSortable]` is bound to an array or FormArray
- **Check container**: Items must be direct children of the sortable container

### Array not updating

- **Reference check**: SortableJS modifies the array in place; ensure change detection picks it up
- **Zone issues**: If using `OnPush`, you may need to trigger change detection manually

### Events not firing

- **Zone proxying**: Events are proxied through Angular's zone automatically
- **Option reference**: Provide a new object reference to `options` when updating options

### Multi-list issues

- **Group name**: Ensure all lists share the same `group` name in options
- **Directive import**: `SortableDirective` must be imported by both components hosting the connected lists

### FormArray sync issues

- **Direct binding**: Bind the FormArray directly, not the parent FormGroup
- **Control access**: Access controls via `formArray.controls` in your template

If problems persist, open an issue at: https://github.com/hub-env/hub-ui/issues

## Connected lists with `SortableBindings`

A single drag can keep several parallel arrays in step. `SortableBindings` wraps a set of
lists and applies every insertion and removal at the same index across all of them, which
is what a table stored as one array per column needs. It has always been what
`[hubSortable]` accepts in place of a plain array; from **22.2.0** it is exported, so it
can also be constructed and typed:

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

Dragging the second row to the top moves `'Bob'`, `30` and `bob@example.com` together. The
arrays must stay the same length and in the same order — the class pairs them by index and
nothing else. Connecting two *different* lists so items travel between them is a separate
feature, and is the `group` option, not this class.

Each list inside a `SortableBindings` is a `SortableBinding`, exported alongside it, which
is the piece that hides the difference between an array, a `FormArray` and a
`WritableSignal<T[]>` behind `insert` / `get` / `remove`.

## Accessibility

SortableJS reordering is pointer-only: it binds `mousedown` and `touchstart` and nothing
else. Since **22.2.0** this wrapper adds the other half, so a list can be reordered from
the keyboard without any work on your side.

Every item — or its `handle`, when one is configured — becomes a Tab stop, and from there
the interaction follows the grab / move / drop model of the WAI-ARIA authoring practices:

| Key | While nothing is held | While an item is held |
| --- | --- | --- |
| `Enter` / `Space` | picks the item up | drops it where it now sits |
| `↑` / `←` | nothing (the page still scrolls) | moves the item one position back |
| `↓` / `→` | nothing | moves the item one position forward |
| `Home` / `End` | nothing | sends the item to the first / last position |
| `Escape` | nothing | abandons the move and puts the item back |

Each of those steps is announced through a polite live region the directive appends to the
document and removes on destroy, because the rest of the feedback is purely visual. The
arrows are only claimed once an item is held, so a list inside a scrollable page stays
scrollable.

Reordering with the keyboard obeys the same rules a drag does: it is off while `disabled`
is `true` or `sort` is `false`, it honours `autoUpdateArray` — in manual mode the array is
left to you, exactly as after a drop — and it emits the same `update` and `sortEvent`
outputs, with `oldIndex` and `newIndex` filled in.

The announcements are English by default. This package carries no translation machinery, so
localising them means handing over the sentences:

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

To turn the keyboard path off — because the application supplies its own — set
`[keyboardSorting]="false"`. The directive then removes the tab stops it added and leaves
any `tabindex` you set yourself alone.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for the full version history, and
[BREAKING_CHANGES.md](./BREAKING_CHANGES.md) for migration notes.

## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## Support the Project

If you find this project helpful and would like to support its development, you can buy me a coffee:

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/carlosmorcillo)

Your support is greatly appreciated and helps maintain and improve this project!

## Commercial support

These libraries are maintained by [Carlos Morcillo Fernández](https://www.carlosmorcillo.com), a freelance frontend architect working with teams that build and maintain Angular applications.

If your team depends on Hub-UI and needs more than an issue thread can solve, that is my day job: architecture audits, design systems, Angular migrations and team mentoring. For projects that also need design and a full team, I run them through [Frog Hub](https://froghub.es), my development studio.

Have a look at [the services](https://www.carlosmorcillo.com/en/services/) or [tell me about your project](https://www.carlosmorcillo.com/en/contact/).

## License

This project is licensed under the **MIT License**.

For full license details, see the [LICENSE](LICENSE) file.

---

Made with love by [Carlos Morcillo Fernández](https://www.carlosmorcillo.com/)

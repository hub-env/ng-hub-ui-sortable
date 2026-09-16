<!-- Verified against ng-hub-ui-sortable@22.1.3 and the published ngx-sortablejs tarball on 2026-09-01. Every claim was checked by two independent adversarial reviews; see tasks/guias-migracion/ in the workspace repo for the review record. The fork lineage and the @worktile/ngx-sortablejs facts in section 1 were re-checked against @worktile/ngx-sortablejs@22.0.0 (typings and fesm2022 bundle), the npm registry and the GitHub fork metadata on 2026-09-15. -->

# Migrating from ngx-sortablejs to ng-hub-ui-sortable

This guide covers `ngx-sortablejs@11.1.0` (the last published version) and `ng-hub-ui-sortable@22.1.3`. Everything stated here was read from the incumbent's published tarball, from the replacement's source and published tarball, from SortableJS 1.15.7, and from the npm registry.

---

## 1. Why migrate, and when not to

### Two paths, and where this package comes from

Before you plan a rewrite, know that `ngx-sortablejs` has a maintained fork with the same API, and that `ng-hub-ui-sortable` is a fork of that fork:

1. `ngx-sortablejs` (GitHub `SortableJS/ngx-sortablejs`). Last release `11.1.0`, on 2020-12-25.
2. `@worktile/ngx-sortablejs` (GitHub `worktile/ngx-sortablejs`, forked from the repository above in 2022). Its first stable release was `15.0.0`, on 2023-08-21, and it has shipped a major for every Angular version from 15 to 22; the current `latest` is `22.0.0`, published 2026-09-09.
3. `ng-hub-ui-sortable` (GitHub `hub-env/ng-hub-ui-sortable`, forked from the Worktile repository on 2025-12-10). Its own `package.json` describes it as the *"ng-hub-ui fork of @worktile/ngx-sortablejs"*.

Which one you want depends on why you are moving:

| Goal | Path | Template cost |
| --- | --- | --- |
| Follow Angular forward and keep the current behaviour | `@worktile/ngx-sortablejs`, pinned to the major that matches your Angular | None. The selector, input and output names are unchanged; only the import specifier moves |
| Adopt signal inputs, real outputs, individual option inputs, `autoUpdateArray`, CDK-style array helpers, `WritableSignal` bindings | `ng-hub-ui-sortable` | Every template occurrence is rewritten, and the behaviour changes in section 5 apply |

The first row is the low-risk path. The `22.0.0` typings of `@worktile/ngx-sortablejs` declare `selector: "[sortablejs]"`, the inputs `sortablejs`, `sortablejsContainer`, `sortablejsOptions` and `sortablejsCloneFunction`, and the output `sortablejsInit`: the same names as `ngx-sortablejs@11.1.0`. The directive behind them is still the `11.1.0` code. The container is looked up in `ngOnInit`, `Sortable.create` runs inside a `setTimeout`, and only `onAdd`, `onRemove` and `onUpdate` are intercepted. On Angular 16 or later the original package no longer builds (next subsection), so for most readers this fork is the only way to keep the current template API at all.

Two things to check if you take it:

- Match the major to your Angular. From `20.0.0` on, each line's peer range starts at its own major (`22.0.0` declares `@angular/core >= 22.0.0`); `15.0.0` through `19.0.0` all declare `>= 15.0.0`.
- Not everything carried over. The package exports only `SortablejsDirective`, `SortablejsModule` and the `SortableData` type, so the `ɵa` (`GLOBALS`) and `ɵb` (`SortablejsService`) escape hatches that `11.1.0` exposed in its bundle index are gone. And `transfer` is now called as `this.service.transfer?.(…)`, so the case 5.4 describes, where `11.1.0` threw a `TypeError`, is a silent no-op there as well.

The rest of this guide assumes you chose the second path.

### The incumbent's situation, stated plainly

`ngx-sortablejs` published `11.1.0` on **2020-12-25**. The registry packument was touched again on 2022-05-10, but no code release followed; `11.1.0` is still the `latest` tag. Its peer range is `@angular/common` and `@angular/core` `^11.0.0`, with `sortablejs >= 1.7.0` as an app-owned peer. The published tarball contains typings, bundles, `metadata.json` and `package.json` — no README.

The peer range is only the visible symptom. **The hard gate is the compilation format.** `ngx-sortablejs@11.1.0` is a **View Engine (pre-Ivy) library**: its tarball ships `ngx-sortablejs.metadata.json` with `"version": 4`, and its `fesm2015`, `esm2015` and `umd` bundles declare their metadata the old way, through `SortablejsDirective.decorators` and `SortablejsDirective.propDecorators`. Grep the bundles and every `lib/*.d.ts` for `ɵfac`, `ɵdir`, `ɵmod` or `ɵɵdefineDirective` and you get zero hits — there is not a single Ivy definition anywhere in the package.

Angular kept converting View Engine libraries with `ngcc` during CLI builds up to **v15**. Angular 16 no longer runs `ngcc`, so that is where the incumbent stops compiling, two majors below the replacement's declared floor. On Angular 16 or later, importing `SortablejsModule` fails the build with *"does not appear to be an NgModule class"*.

None of that makes it defective on the version it targets. It is a compact directive that does what its typings say, and an app that intends to sit on Angular 11 forever has no urgent defect pushing it off. But the framing "it does not follow an Angular upgrade forward" is too gentle: **it cannot survive one at all.** Anything already on 16+ has no working incumbent to migrate *from*.

### What `ng-hub-ui-sortable` is

A rewrite of the same idea for modern Angular: a standalone directive with signal inputs, Angular outputs for the SortableJS callbacks, 32 individual option inputs, an opt-out of automatic array mutation (`autoUpdateArray`), CDK-style array helpers, and a `provideSortable()` environment provider.

This is not a like-for-like replacement. Every template attribute is renamed, five members of the old public surface have no public replacement, and several behaviours changed in ways that compile cleanly and fail at runtime. Section 5 covers each one.

### One structural fact to hold on to

**The published package is a single flat bundle behind a closed `exports` map.** `ng-hub-ui-sortable@22.1.3` ships exactly five files — `package.json`, `README.md`, `LICENSE`, `fesm2022/ng-hub-ui-sortable.mjs` and `types/ng-hub-ui-sortable.d.ts` — with no `lib/` directory, and its `package.json` declares:

```json
"exports": {
  "./package.json": { "default": "./package.json" },
  ".":              { "types": "./types/ng-hub-ui-sortable.d.ts",
                      "default": "./fesm2022/ng-hub-ui-sortable.mjs" }
}
```

Every other subpath is blocked. The bundle's entire export line is `SortableDirective, SortableModule, copyArrayItem, moveItemInArray, provideSortable, transferArrayItem`, plus the types `SortableData`, `SortableEventName`, `SortableMoveEventPayload` and the re-exported SortableJS types. Anything not on that list — `GLOBALS`, `SortableService`, `SortableBindings`, `SortableBinding` — is **unreachable**, not merely unsupported. Three separate items in section 5 (5.15, 5.16, 5.17) depend on this fact; there is no deep import to fall back on at any level of risk tolerance.

### Do not start the migration if

- **Your app is below Angular 18.** The declared peer range is `>= 18.0.0`, so the Angular upgrade comes first — treat the migration as the last step of that upgrade, not as an independent task. And note there is no published 18.x or 19.x line at all (see *Version selection*).
- **You depend on `SortablejsBindings`, `SortablejsBinding`, `GLOBALS` (`ɵa`) or `SortablejsService` (`ɵb`).** None has a public replacement, and none is reachable in the published bundle (section 5).
- **You cannot re-test lists containing form controls.** The replacement installs capture-phase listeners that stop `change` (among others) at the container. See 5.7.
- **You have a `[sortablejsContainer]` selector pointing at conditionally rendered content.** That pattern never worked in either package; what the migration changes is the failure mode — from a thrown error to a silent no-op. See 5.6.

### Maturity, stated so you can price the risk

The replacement's published lines are `20.x`, `21.x` and `22.x` — nothing below `20.0.0` exists on npm, despite the `>= 18.0.0` peer range, and there is **no `22.0.x`** either: the registry jumps straight from `21.3.0` to `22.1.0`. The complete list is `20.0.0`, `21.0.0`, `21.0.1`, `21.1.0`, `21.1.1`, `21.2.0`, `21.3.0`, `22.1.0`, `22.1.1`, `22.1.2`, `22.1.3`.

It is a single-maintainer package. The spec suite (`projects/sortable/src/lib/*.spec.ts`) covers directive lifecycle, container selector (static inner container only), individual option inputs, `GLOBALS` merging, `FormArray` and signal binding, manual mode, clone handling, `ngOnChanges`, native event suppression, the `move` output and the DOM-revert helpers. It does **not** cover a `[container]` selector resolved against conditionally rendered content, mixed `autoUpdateArray` across a group, nested sortables, SortableJS plugins (MultiDrag, Swap), or virtual scrolling. It also drives most handlers with fabricated event objects rather than events produced by real SortableJS (`createSortableEvent`, `sortable.directive.spec.ts:277-296`), which matters — see *How to detect any of this* at the end of section 5. Budget verification for all of it yourself.

---

## 2. Install and setup

### Packages

```bash
npm uninstall ngx-sortablejs
npm install ng-hub-ui-sortable
```

Four dependency facts to settle before you run this:

**`sortablejs` changed role — and the boundary matters.** It was a **peer** dependency of `ngx-sortablejs@11.1.0` (`>= 1.7.0`, app-owned). In `ng-hub-ui-sortable` it became a real **dependency** — but not from the start. `sortablejs` was a peer dependency through **`21.1.1`** and became a real dependency in **`21.2.0`** (verified across every published version). If you pin any line at or below `21.1.1`, keep `sortablejs` in your own `dependencies`: removing the app-level pin there leaves the library without a runtime under strict resolution.

**On `21.2.0` and later, `sortablejs` is an unbounded transitive dependency you no longer control.** The declaration is `"sortablejs": ">=1.7.0"` under `dependencies` — no upper bound. Where the incumbent made the app own and pin the version, a fresh `npm install` can now pull a future SortableJS major into a directive written against 1.15 event semantics. Mitigate it deliberately: an `overrides` (npm) / `resolutions` (yarn, pnpm) entry pinning `sortablejs` to a range you have tested, or a lockfile the team actually reviews on every dependency bump. Do not leave this implicit.

**If you import `Sortable` yourself, import it from `ng-hub-ui-sortable`.** `public-api.ts` does `export { default as Sortable } from 'sortablejs'`, so that specifier resolves to the same module instance the directive creates from. This matters for plugins: `Sortable.mount(new MultiDrag())` mutates module-level state. If your app keeps its own `sortablejs` pin and resolution produces a second copy, plugins get mounted on your copy while the directive builds instances from the library's copy, and `multiDrag: true` in `[options]` does nothing, with no error. Run `npm ls sortablejs` and confirm exactly one copy resolves before assuming plugins work — and note this pulls against the pinning advice above, so if you must keep an app-level pin (an `overrides` entry, or a strict pnpm / no-hoist setup), verify the single-copy result rather than assuming it.

**Keep `@types/sortablejs` installed.** The library re-exports SortableJS's types rather than vendoring them: its emitted `.d.ts` contains `export { GroupOptions, MoveEvent, Options, PullResult, PutResult, default as Sortable, SortableEvent } from 'sortablejs';`. The `sortablejs` package itself ships no typings (no `types` or `typings` field, no `.d.ts` in the tarball), and `ng-hub-ui-sortable@22.1.3` declares only `sortablejs` and `tslib` as dependencies — `@types/sortablejs` is neither a dependency nor a peer. Remove it and the library's own typings cannot resolve their imports: `TS2307` without `skipLibCheck`, and with `skipLibCheck: true` (the Angular default) a silent degradation where the re-exported types stop type-checking and nobody notices. The ng-hub-ui monorepo itself keeps `"@types/sortablejs": "^1.15.9"` for exactly this reason.

What the re-export actually buys you is the import specifier, nothing more:

```ts
// before
import Sortable, { Options, SortableEvent } from 'sortablejs';
// after — same types, one specifier
import { Sortable, type Options, type SortableEvent } from 'ng-hub-ui-sortable';
```

### Version selection

The package's version numbers track Angular majors (`20.x`, `21.x`, `22.x`), but every line declares the same flat `>= 18.0.0` peer range. npm will therefore install `22.1.3` into an Angular 18 app without complaint.

Two numbers decide whether that actually builds, and neither is the peer range:

- The published `22.1.3` bundle is **emitted by the Angular 22.0.8 compiler**, and its partial declarations carry `minVersion: "17.1.0"`. That `minVersion` is what the Angular linker enforces at consumer build time — stricter than the peer range is loose, and the number that decides an Angular 18 build.
- **There is no 18.x or 19.x line, and no 22.0.x line.** The lowest published version is `20.0.0`; the registry jumps `21.3.0` → `22.1.0`.

So, concretely: **on Angular 22, pin `22.1.x`** — do not guess `22.0.0`, it does not exist. **On Angular 21, pin a `21.x` line** (and mind the `sortablejs` peer boundary at `21.1.1`). **On Angular 20, pin `20.0.0`.** **On Angular 18 or 19 there is no matching line** — the `>= 18.0.0` peer range is a declaration, not a published build. Your only options are to run a 20/21/22 build against an older Angular and verify the partial-Ivy link yourself, or to finish the Angular upgrade first. Treat 18 and 19 as unsupported in practice.

### Root configuration

**Before** — `SortablejsModule.forRoot()` in the root NgModule:

```ts
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SortablejsModule } from 'ngx-sortablejs';

import { AppComponent } from './app.component';
import { TaskListComponent } from './task-list.component';

@NgModule({
  declarations: [AppComponent, TaskListComponent],
  imports: [BrowserModule, SortablejsModule.forRoot({ animation: 150 })],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

**After** — `provideSortable()` in `bootstrapApplication`:

```ts
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideSortable } from 'ng-hub-ui-sortable';

import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [provideSortable({ animation: 150 })],
});
```

`provideSortable()` returns `EnvironmentProviders` and its argument is optional (defaults to `{}`); `forRoot()`'s was required. Both register the same internal `GLOBALS` injection token.

Two things the shapes do not share:

- **`provideSortable()` cannot go in a component's `providers` array.** It is built with `makeEnvironmentProviders`, which Angular rejects at compile time inside `@Component({ providers: [...] })`. The library's own JSDoc says "any route/component injector" — the route half is true, the component half is not. A per-component global-options override has no replacement; see 5.15.
- **`SortableModule.forRoot(globalOptions)` still takes a required argument.** Only the function form defaults to `{}`. An NgModule app migrating `SortablejsModule.forRoot({ … })` to a bare `SortableModule.forRoot()` gets a compile error.

If your app is still NgModule-based, `SortableModule` and `SortableModule.forRoot(globalOptions)` exist with the same shape and the same provider. Both carry `@deprecated` in the source — a bridge, not the destination.

### Where the directive comes from

`SortablejsDirective` was non-standalone and only reachable through `SortablejsModule`. `SortableDirective` is `standalone: true`, so it goes into a component's `imports` array. A module with `declarations: [SortablejsDirective]`, or one importing `SortablejsModule` solely for the directive, becomes `imports: [SortableDirective]` on the components that use it.

### Staging the rename

There is no `ng update` schematic and no codemod. The rename is also not a safe find-and-replace: `[sortablejs]`, a bare `sortablejs` attribute, `sortablejsOptions`, `sortablejsContainer` and `sortablejsCloneFunction` share a prefix, so a naive substitution on `sortablejs` corrupts the longer attributes. Replace longest-first, or match on full attribute names.

**There is no side-by-side path and no per-screen rollback.** It is tempting to install both packages and migrate one screen at a time — different selectors (`[sortablejs]` vs `[hubSortable]`), different injection tokens, different service classes, no shared state. It does not work, for a reason that has nothing to do with the two packages coexisting in `node_modules`: `ngx-sortablejs@11.1.0` is a View Engine library (metadata.json v4, zero Ivy definitions), unusable from Angular 16 onward. Once the app is on Angular 18+ — which this migration requires — the incumbent **cannot be compiled at all**, even sitting untouched in `node_modules`. Any component still importing `SortablejsModule` fails the build.

So plan the rename as a single change across the app, and treat **reverting the commit** as your rollback, not running both packages. If the migration is too large for one commit, the units to split it into are branches, not screens.

---

## 3. API equivalence table

Every member of the `ngx-sortablejs@11.1.0` published surface. Its bundle index exports `SortablejsDirective`, `SortablejsModule`, the `SortableData` type, `ɵa` (`GLOBALS`) and `ɵb` (`SortablejsService`); `SortablejsBindings` and `SortablejsBinding` ship as typings under `lib/` and as runtime files under `esm2015/lib/`, reachable only by deep import.

On the replacement side, "Missing" means **unreachable**: the published package is one fesm2022 bundle behind an `exports` map exposing only `.` and `./package.json`. There is no deep import to attempt.

### Template API

| ngx-sortablejs 11.1.0 | ng-hub-ui-sortable 22.1.3 | Status | Notes |
| --- | --- | --- | --- |
| `[sortablejs]` (selector) | `[hubSortable]` | Renamed | Activation is equivalent (bare attribute or property binding). Every template occurrence must be rewritten. |
| `[sortablejs]` (input) | `[hubSortable]` (signal input `items`) | Renamed, one behaviour delta | Array and `FormArray` semantics unchanged; `WritableSignal<any[]>` added. See 5.9 for clone sources with no array bound. |
| `[sortablejsContainer]` | `[container]` | Renamed, **different failure mode** | Still `querySelector` inside the host, and — as in the incumbent — still resolved **synchronously in `ngOnInit`**, before `@if` / `*ngIf` / `*ngFor` embedded views exist. What changed is what happens on no match: the incumbent passed `null` into `Sortable.create` and threw; the replacement catches the null container and returns permanently, without throwing. Lines up to 22.1.3 also logged `[hubSortable] Container not found with selector: …` to `console.error`; that message has since been dropped. See 5.6. |
| `[sortablejsOptions]` | `[options]` | **Different semantics** | Still the whole SortableJS `Options` object, but the merge gained a third layer and 32 individual inputs now override it. See 5.5. |
| `[sortablejsCloneFunction]` | `[cloneFunction]` | Renamed | Same `(item: any) => any` signature and the same call site: consulted inside `onRemove` only when the drag is a clone pull, bindings are provided **and** `autoUpdateArray` is `true`. Dead code in manual mode. |
| `(sortablejsInit)` | `(init)` | **Different semantics** | Same payload, now typed `Sortable` instead of `any`. Emission moved from `setTimeout(0)` to `afterNextRender`. See 5.8. |
| `onStart`, `onEnd`, `onAdd`, `onUpdate`, `onSort`, `onRemove`, `onFilter`, `onChange`, `onChoose`, `onUnchoose`, `onClone` inside `[sortablejsOptions]` | Still work inside `[options]`; also available as `(start)`, `(end)`, `(add)`, `(update)`, `(sortEvent)`, `(remove)`, `(filterEvent)`, `(change)`, `(choose)`, `(unchoose)`, `(clone)` | Covered, with three caveats | `sortEvent` and `filterEvent` carry the suffix because `sort` and `filter` are taken by inputs. Keeping the callback in `[options]` **and** binding the matching output runs your code twice (5.3). Zone behaviour changed (5.10). These output names also now shadow native DOM event bindings on the host element (5.19). |
| `onMove` inside `[sortablejsOptions]` | `[options].onMove`, plus a `(move)` output emitting `SortableMoveEventPayload` | **Not an equivalence** | A handler found in the merged options still has its return value forwarded to SortableJS, so `return false` still cancels there. `(move)` **cannot cancel** — Angular outputs have no return channel. See 5.2. |
| `onAddOriginal` (pseudo-callback key) | `onAddOriginal` inside `[options]` | Covered, with a caveat | Still part of `SortableEventName`, still proxied from the `onAdd` override. There is no `(addOriginal)` output. The call now sits inside the `if (this.autoUpdateArray())` branch, so `[autoUpdateArray]="false"` silently stops it firing. |

### TypeScript API

| ngx-sortablejs 11.1.0 | ng-hub-ui-sortable 22.1.3 | Status | Notes |
| --- | --- | --- | --- |
| `SortablejsDirective` | `SortableDirective` | Renamed, different semantics | Standalone, and every input is a signal input: reads become calls (`d.sortablejsOptions` → `d.options()`); writes are impossible. See 5.11. |
| `SortablejsDirective.ngOnInit` | `SortableDirective.ngOnInit` | Covered | The SSR guard changed from `Sortable && Sortable.create` (which passes in Node) to `typeof window !== 'undefined'`. See 5.8. |
| `SortablejsDirective.ngOnChanges` | `SortableDirective.ngOnChanges` | Covered | Replacing the options object still re-applies changed keys through `instance.option()`. `previousValue` / `currentValue` now default to `{}` and the instance access is optional-chained; it additionally re-applies individual option inputs. |
| `SortablejsDirective.ngOnDestroy` | `SortableDirective.ngOnDestroy` | Covered, incomplete | Destroys the instance and removes the suppression listeners. It resets neither `SortableService.transfer` nor `SortableService.dropEventProcessed`, and does not null `sortableInstance`. See 5.4. |
| `SortableData` (type) | `SortableData` | Covered | Same exported name, widened from `any \| any[]` to `any \| any[] \| WritableSignal<any[]>`. No existing annotation breaks. |
| `SortablejsModule` | `SortableModule` | Renamed, deprecated | Metadata changed from `declarations: [SortablejsDirective]` to `imports: [SortableDirective]`; consumer-facing behaviour unchanged. |
| `SortablejsModule.forRoot(globalOptions)` | `SortableModule.forRoot(globalOptions)` (deprecated); use `provideSortable(globalOptions?)` | Covered | Same provider. `provideSortable`'s argument is optional; `forRoot`'s is still required. `provideSortable` returns `EnvironmentProviders` and cannot go in a component's `providers`. |
| `GLOBALS` (`ɵa`) | — | **Missing** | The token exists in the library's source with the identical description string, but is not part of the published bundle's exports. |
| `SortablejsService` (`ɵb`) | — | **Missing** | `SortableService` exists in the source (`providedIn: 'root'`) but is not part of the published bundle's exports. |
| `SortablejsService.transfer` | — | **Missing** | Not reachable. Also changed from non-nullable to `((items: any[]) => void) \| null`. See 5.4. |
| `SortablejsBindings` (deep import) | — | **Missing** | `SortableBindings` exists in the source; the directive still special-cases `items instanceof SortableBindings`, but the class is not part of the published bundle's exports and cannot be constructed. |
| `SortablejsBinding` (deep import) | — | **Missing** | Same situation. Extended in the source to handle `WritableSignal` via `isSignal` + `set`. |

### New in ng-hub-ui-sortable

- **32 individual option inputs**: `group`, `sort`, `delay`, `disabled`, `draggable`, `handle`, `animation`, `ghostClass`, `chosenClass`, `dragClass`, `fallbackOnBody`, `fallbackTolerance`, `fallbackClass`, `fallbackOffset`, `forceFallback`, `filter`, `preventOnFilter`, `direction`, `swapThreshold`, `invertSwap`, `invertedSwapThreshold`, `removeCloneOnHide`, `ignore`, `touchStartThreshold`, `emptyInsertThreshold`, `dropBubble`, `dragoverBubble`, `dataIdAttr`, `delayOnTouchOnly`, `easing`, `setData`, `store`.
- **`[autoUpdateArray]`** (default `true`). With `false` the directive does not mutate the bound array; it emits events and, in the same-list case, reverts SortableJS's DOM changes. Read 5.1 and 5.12 before adopting it.
- **Array helpers**: `moveItemInArray<T>(array, fromIndex, toIndex)`, `transferArrayItem<T>(currentArray, targetArray, currentIndex, targetIndex)`, `copyArrayItem<T>(currentArray, targetArray, currentIndex, targetIndex)`. Their edge behaviour differs from the CDK helpers of the same name — see 5.13.
- **Re-exported SortableJS types**: `Sortable`, `Options`, `SortableEvent`, `MoveEvent`, `GroupOptions`, `PullResult`, `PutResult`, plus the library's own `SortableEventName` and `SortableMoveEventPayload`.

---

## 4. Before and after

`ngx-sortablejs` shipped no documentation, so the "before" patterns below are the code paths that exist in its bundle, not quotations from a README.

### Pattern 1 — in-place reordering

The array is mutated by the directive's `onUpdate` override, so no handler is needed. `autoUpdateArray` defaults to `true`, so the behaviour is preserved.

**Before**

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-task-list',
  template: `
    <div [sortablejs]="items">
      <div class="item" *ngFor="let item of items">{{ item.name }}</div>
    </div>
  `,
})
export class TaskListComponent {
  items = [{ name: 'One' }, { name: 'Two' }, { name: 'Three' }];
}
```

```ts
// the host module needed SortablejsModule in its imports
@NgModule({ declarations: [TaskListComponent], imports: [CommonModule, SortablejsModule] })
export class TasksModule {}
```

**After**

```ts
import { Component } from '@angular/core';
import { SortableDirective } from 'ng-hub-ui-sortable';

@Component({
  selector: 'app-task-list',
  standalone: true, // the default from Angular 19; keep it explicit on 18
  imports: [SortableDirective],
  template: `
    <div [hubSortable]="items">
      @for (item of items; track item.name) {
        <div class="item">{{ item.name }}</div>
      }
    </div>
  `,
})
export class TaskListComponent {
  items = [{ name: 'One' }, { name: 'Two' }, { name: 'Three' }];
}
```

The signal variant, if you want the list itself reactive — `SortableBinding` detects a writable signal with `isSignal` plus a `set` method and replaces the value immutably:

```ts
import { Component, signal } from '@angular/core';
import { SortableDirective } from 'ng-hub-ui-sortable';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [SortableDirective],
  template: `
    <div [hubSortable]="items">
      @for (item of items(); track item.name) {
        <div class="item">{{ item.name }}</div>
      }
    </div>
  `,
})
export class TaskListComponent {
  items = signal([{ name: 'One' }, { name: 'Two' }, { name: 'Three' }]);
}
```

### Pattern 2 — options and event callbacks

In the incumbent the options object was the only place to hook events; the directive had exactly one output, `sortablejsInit`.

**Before**

```ts
import { Component } from '@angular/core';
import { Options, SortableEvent } from 'sortablejs'; // required @types/sortablejs

@Component({
  selector: 'app-board-column',
  template: `<div [sortablejs]="items" [sortablejsOptions]="options">…</div>`,
})
export class BoardColumnComponent {
  items = ['a', 'b', 'c'];

  options: Options = {
    animation: 150,
    handle: '.drag-handle',
    ghostClass: 'ghost',
    onStart: (event: SortableEvent) => this.onStart(event),
    onEnd: (event: SortableEvent) => this.onEnd(event),
  };

  onStart(event: SortableEvent): void { /* … */ }
  onEnd(event: SortableEvent): void { /* … */ }
}
```

**After** — individual inputs and outputs. Note the callbacks moved **out** of the options object; leaving them in while also binding the outputs would run each one twice (5.3).

```ts
import { Component } from '@angular/core';
import { SortableDirective, type SortableEvent } from 'ng-hub-ui-sortable';

@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [SortableDirective],
  template: `
    <div
      [hubSortable]="items"
      [animation]="150"
      handle=".drag-handle"
      ghostClass="ghost"
      (start)="onStart($event)"
      (end)="onEnd($event)">
      …
    </div>
  `,
})
export class BoardColumnComponent {
  items = ['a', 'b', 'c'];

  onStart(event: SortableEvent): void { /* … */ }
  onEnd(event: SortableEvent): void { /* … */ }
}
```

Keeping the whole object in `[options]="options"` is the smallest possible diff and still works. Before you settle on it, read 5.3 (double execution), 5.5 (merge order) and 5.10 (zone boundaries).

### Pattern 3 — two connected lists

**Before**

```html
<div [sortablejs]="todo" [sortablejsOptions]="{ group: 'shared' }">
  <div *ngFor="let t of todo">{{ t }}</div>
</div>

<div [sortablejs]="done" [sortablejsOptions]="{ group: 'shared' }">
  <div *ngFor="let d of done">{{ d }}</div>
</div>
```

**After**

```html
<div [hubSortable]="todo" group="shared">
  @for (t of todo; track t) { <div>{{ t }}</div> }
</div>

<div [hubSortable]="done" group="shared">
  @for (d of done; track d) { <div>{{ d }}</div> }
</div>
```

The cross-list handoff still goes through the root service: SortableJS fires `onAdd` on the target *before* `onRemove` on the source, so the target's `onAdd` stores a `transfer` callback that the source's `onRemove` invokes with the extracted items. Three consequences carry into the migration:

- **In auto mode, `(add)` is not emitted by the target's own callback.** The target's `onAdd` only stores the closure and fires `onAddOriginal`; the `proxyEvent('onAdd', …)` call lives *inside* that stored closure, so `(add)` — and any `[options].onAdd` — actually fires from the **source list's `onRemove`**, one drag event later.
- **Both lists must be bound.** Because of the above, a user `onAdd` / `(add)` handler only ever runs if the source list also has a `hubSortable` binding. A target whose source is unbound looks like it simply ignores drops.
- **Both lists must agree on `autoUpdateArray`.** Mixing the values inside one group breaks transfers silently. See 5.1.

The clone variant:

```html
<!-- before -->
<div [sortablejs]="palette"
     [sortablejsOptions]="{ group: { name: 'x', pull: 'clone', put: false } }"
     [sortablejsCloneFunction]="cloneItem">…</div>

<!-- after -->
<div [hubSortable]="palette"
     [group]="{ name: 'x', pull: 'clone', put: false }"
     [cloneFunction]="cloneItem">…</div>
```

### Pattern 4 — app-wide defaults

`SortablejsModule.forRoot({ animation: 150 })` becomes `provideSortable({ animation: 150 })` (section 2). Per-instance options still win over the global config: the merge is `{ ...globalConfig, ...options(), ...individualInputs }`.

### Pattern 5 — reactive forms (`FormArray`)

`SortableBinding` keeps the exact duck-type check the incumbent used (`!!target.at && !!target.insert && !!target.reset`, deliberately avoiding a dependency on `@angular/forms`) and still reorders controls with `at()` / `insert()` / `removeAt()` rather than swapping their values. The migration is the rename.

**Before**

```ts
import { Component } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-rows-editor',
  template: `
    <form [formGroup]="form">
      <div formArrayName="rows" [sortablejs]="rows" [sortablejsOptions]="{ handle: '.handle' }">
        <div *ngFor="let row of rows.controls; let i = index" [formGroupName]="i">
          <span class="handle">::</span>
          <input formControlName="label" />
        </div>
      </div>
    </form>
  `,
})
export class RowsEditorComponent {
  constructor(private fb: FormBuilder) {}

  form = this.fb.group({
    rows: this.fb.array([
      this.fb.group({ label: 'First' }),
      this.fb.group({ label: 'Second' }),
    ]),
  });

  get rows(): FormArray {
    return this.form.get('rows') as FormArray;
  }
}
```

**After**

```ts
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SortableDirective } from 'ng-hub-ui-sortable';

@Component({
  selector: 'app-rows-editor',
  standalone: true,
  imports: [ReactiveFormsModule, SortableDirective],
  template: `
    <form [formGroup]="form">
      <div formArrayName="rows" [hubSortable]="rows" handle=".handle">
        @for (row of rows.controls; track row; let i = $index) {
          <div [formGroupName]="i">
            <span class="handle">::</span>
            <input formControlName="label" />
          </div>
        }
      </div>
    </form>
  `,
})
export class RowsEditorComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    rows: this.fb.array([
      this.fb.group({ label: 'First' }),
      this.fb.group({ label: 'Second' }),
    ]),
  });

  get rows(): FormArray {
    return this.form.get('rows') as FormArray;
  }
}
```

Text inputs keep working with `ngModel` / `formControlName`, because Angular's default value accessor commits on `input`. Their native `change` event is suppressed like everyone else's, though, so an explicit `(change)` binding on any element inside the container stops firing regardless of element type. Any `<select>`, checkbox, radio, `<input type="file|date|color">` or `<select multiple>` inside the container commits on `change` and therefore breaks with `ngModel` / `formControlName` too. Read 5.7 before shipping this one.

### Pattern 6 — manual mode

Not a migration step, but the reason several apps wrote their own `onUpdate` handler on top of the incumbent. Both lists are bound, and both set `[autoUpdateArray]="false"`, because mixing the values inside one group breaks the transfer (5.1).

Note the index family: the handlers use `oldDraggableIndex` / `newDraggableIndex`, **not** `oldIndex` / `newIndex`. SortableJS computes those two families differently — `index(target)` counts every previous element sibling, while `index(target, options.draggable)` counts only the ones matching the `draggable` selector. Your array holds draggable items only, so the draggable-filtered pair is the one that maps onto array positions. Get this wrong in a container that also holds a header, a non-draggable row, or a `draggable` selector — exactly the containers where manual mode is common — and you write to the wrong slot. See 5.12.

```ts
import { Component } from '@angular/core';
import {
  SortableDirective,
  moveItemInArray,
  transferArrayItem,
  type SortableEvent,
} from 'ng-hub-ui-sortable';

@Component({
  selector: 'app-manual-board',
  standalone: true,
  imports: [SortableDirective],
  template: `
    <div class="col"
         [hubSortable]="todo" [autoUpdateArray]="false" group="shared"
         (update)="onTodoUpdate($event)" (add)="onAddToTodo($event)">
      @for (t of todo; track t) { <div class="item">{{ t }}</div> }
    </div>

    <div class="col"
         [hubSortable]="done" [autoUpdateArray]="false" group="shared"
         (update)="onDoneUpdate($event)" (add)="onAddToDone($event)">
      @for (d of done; track d) { <div class="item">{{ d }}</div> }
    </div>
  `,
})
export class ManualBoardComponent {
  todo = ['a', 'b'];
  done: string[] = [];

  onTodoUpdate(event: SortableEvent): void {
    moveItemInArray(this.todo, event.oldDraggableIndex!, event.newDraggableIndex!);
  }

  onDoneUpdate(event: SortableEvent): void {
    moveItemInArray(this.done, event.oldDraggableIndex!, event.newDraggableIndex!);
  }

  onAddToTodo(event: SortableEvent): void {
    transferArrayItem(this.done, this.todo, event.oldDraggableIndex!, event.newDraggableIndex!);
  }

  onAddToDone(event: SortableEvent): void {
    transferArrayItem(this.todo, this.done, event.oldDraggableIndex!, event.newDraggableIndex!);
  }
}
```

Two more things about this sample. First, the handlers must update **both** arrays synchronously — in manual mode the dragged node is removed from the DOM and nothing puts it back, so the screen looks right only because Angular re-renders from your arrays (5.12). A handler that validates first, awaits, or bails out makes the row disappear. Second, with `[autoUpdateArray]="false"`, `[cloneFunction]` is never consulted and `onAddOriginal` never fires.

---

## 5. What does not migrate

Everything that does not carry over, grouped by whether a replacement exists. The first four are the ones most likely to ship broken.

### 5.1 Mixing `[autoUpdateArray]` inside one group — different semantics, silent

`autoUpdateArray` must be uniform across every list in a `group`. The two modes drive the cross-list handoff from opposite ends and do not interoperate.

In auto mode, the target's `onAdd` assigns `this.service.transfer = (items) => { … }` and the source's `onRemove` invokes it — but only inside `if (this.autoUpdateArray() && bindings.provided)`. In manual mode, `onAdd` never assigns `transfer` at all.

So a source with `[autoUpdateArray]="false"` feeding an auto-mode target means the target's insert and its `(add)` emission — both of which live inside the `transfer` callback — never run. And an auto-mode source feeding a manual-mode target calls `this.service.transfer?.(bindings.extractFromEvery(...))`; optional-call short-circuiting means the argument is never evaluated, so nothing is extracted from the source array while the target has already removed the node from the DOM.

**Consequence:** a dropped item that vanishes, or duplicates, depending on what your `(add)` handler does. No error, no console output.

**Workaround:** set the same `autoUpdateArray` value on every list sharing a `group`. Grep for `autoUpdateArray` per group name before shipping.

### 5.2 The `(move)` output cannot cancel a move — not an equivalence

An `onMove` supplied through the options still cancels. The override is `onMove: (event, originalEvent) => this.proxyEvent('onMove', event, originalEvent)`, and `proxyEvent` looks the handler up on the **merged** `optionsWithoutEvents` — `{ ...globalConfig, ...options(), ...getIndividualOptions() }`, i.e. the global config registered by `provideSortable()` / `SortableModule.forRoot()` first, then `[options]`, then the individual inputs — and returns whatever that handler returns. So a veto works from `[options].onMove` and **equally from an `onMove` in your global config**, where it cancels the drag for every list in the app. Worth knowing before you go hunting for a veto that seems to come from nowhere.

The `(move)` output cannot cancel anything. `emitOutputs` calls `this.move.emit({ event, originalEvent })` and returns `void`; an Angular `output()` has no return channel back to the emitter. A `(move)="canDrop($event)"` handler that returns `false` cancels nothing, silently — the drag proceeds and nothing is logged.

**Consequence:** anyone who migrates drop-validation logic from `sortablejsOptions.onMove` to the `(move)` output ships a board where every forbidden drop is accepted.

**Workaround:** keep the veto in the merged options — `[options].onMove` per element, or the global config for an app-wide rule — or take the instance from `(init)` and set it imperatively with `instance.option('onMove', fn)`. Use `(move)` for observation only.

### 5.3 A callback in `[options]` plus the matching output runs twice

`proxyEvent` invokes the handler found in the merged options **and then** calls `emitOutputs`. If both point at the same method, it runs twice per event.

**Consequence:** duplicated side effects — two HTTP calls per drop, two analytics events, two array mutations if your handler mutates.

**Workaround:** pick one channel per event. The minimal-diff migration keeps the callbacks in `[options]` and binds no outputs; the idiomatic migration moves them to outputs and removes them from the object. Do not do both.

### 5.4 Cross-list state is an application-wide singleton — different semantics

`SortableService` is `providedIn: 'root'`, so there is exactly one instance per application. Both of its fields are shared by every sortable on every screen:

- **`transfer`** is cleared only inside the auto-update branch of `onRemove` (`this.service.transfer = null`, reached only when `autoUpdateArray && bindings.provided`). A drag out of a list whose binding is missing or falsy leaves a stale `transfer` closure alive; the *next* drag's `onRemove` anywhere in the app invokes it and injects the items into the *previous* target list.
- **`dropEventProcessed`** is a single boolean guarding duplicate `onAdd` / `onUpdate` in manual mode, reset in `onStart` and `onEnd`. The first such callback of a drag sets it, and every subsequent one **returns before reaching `proxyEvent`** — so what gets suppressed is not merely the array update but **your handler**: the `(add)` / `(update)` output does not fire at all for the suppressed callback, with no array change and nothing in the console. Because the flag is global to the drag session rather than per directive, a second manual-mode list that legitimately fires within the same drag — nested sortables, MultiDrag — silently loses its event.

`ngOnDestroy` removes the suppression listeners and destroys the Sortable instance, and resets **neither** field. Destroying a list mid-drag — a route change, an `@if` toggle, a virtual scroll recycling a container — leaves shared cross-list state set for the next drag.

The same lifecycle hole exists on the instance itself: `ngOnDestroy` does **not** null `sortableInstance`, and `applyIndividualOptionChanges` guards only on null. An individual option input whose value changes after destroy therefore calls `.option()` on a destroyed instance. This one is new — the incumbent had no individual option inputs to re-apply.

One related change reads as an improvement but is a trade. `transfer` went from non-nullable (`transfer: (items: any[]) => void`) to `((items: any[]) => void) | null`, and every call site is optional-chained. Note what the incumbent actually did, though: its `onAdd` installed `transfer` **unconditionally**, with no `bindings.provided` and no `autoUpdateArray` guard. So a target that carried the `[sortablejs]` directive but bound no array still installed `transfer`, and the source found a function there. The incumbent's null path — and its `TypeError` — was reached only when the drop target was **not a sortable directive at all**, or when a previous drag had already cleared `transfer`. It threw there, pointing straight at the misconfiguration; the replacement optional-chains the same call, so that case is now a drop that silently does nothing.

**Workaround:** bind every list in a group; avoid destroying a sortable container mid-drag; if you must, reset your own state in an `(end)` handler.

### 5.5 Option merge order and `undefined` — different semantics

The incumbent merged two layers: `{ ...globalConfig, ...sortablejsOptions }`. The replacement merges three: `{ ...globalConfig, ...options(), ...getIndividualOptions() }`. Any of the 32 individual inputs whose value is not `undefined` **overrides** the same key inside `[options]`. `[options]="{ animation: 150 }"` together with `[animation]="0"` on the same element yields `0`, with no warning.

There is a sharper edge on updates. `getIndividualOptions()` skips `undefined` values at creation time, but `applyIndividualOptionChanges()` calls `this.sortableInstance!.option(optionName, inputSignal())` unconditionally for any changed input. Setting an individual input back to `undefined` after first render therefore pushes `undefined` into the live instance rather than falling back to `[options]` or to the global config. An individual option input cannot cleanly step aside once set.

A third detail worth knowing: `optionsWithoutEvents` is a getter, re-read on every proxied event, so replacing the `[options]` object mid-life changes which callback runs even for keys `ngOnChanges` never pushed through `instance.option()`.

**Workaround:** pick one style per element — the whole object in `[options]` with no individual inputs, or individual inputs only. Never toggle an individual input to `undefined`; give it an explicit value in every state.

### 5.6 `[container]` never worked with conditional content — what changed is the noise

This is not a timing regression, and the guide you may have read elsewhere that says it is has the incumbent's code wrong. **Both packages resolve the container synchronously in `ngOnInit`.** In the incumbent's `create()`, the `querySelector` sits *outside* the `setTimeout`:

```js
// ngx-sortablejs@11.1.0, fesm2015/ngx-sortablejs.js
const container = this.sortablejsContainer
  ? this.element.nativeElement.querySelector(this.sortablejsContainer)
  : this.element.nativeElement;
setTimeout(() => {
  this.sortableInstance = Sortable.create(container, this.options);
  this.sortablejsInit.emit(this.sortableInstance);
}, 0);
```

Only the `Sortable.create` call was deferred. The replacement does the same thing with `afterNextRender` in place of `setTimeout`.

Angular flushes a host directive's `ngOnInit` before the `@if` / `*ngIf` / `*ngFor` embedded views inside that host are created. So this:

```html
<div [hubSortable]="items" [container]="'.list'">
  @if (ready) {
    <ul class="list">…</ul>
  }
</div>
```

has **never** worked, in either package. What changed is the failure mode:

- **Incumbent:** `querySelector` returned `null`, `null` went into `Sortable.create`, and SortableJS threw an uncaught `Sortable: \`el\` must be an HTMLElement` from inside the `setTimeout`. Loud, with a stack trace.
- **Replacement:** the null container is caught and `create()` returns permanently. No Sortable instance, no `(init)`, no retry, no exception. Lines up to 22.1.3 at least wrote `[hubSortable] Container not found with selector: .list` to `console.error`; that message has since been removed, so the failure now leaves no trace at all.

**Consequence:** if you have this pattern, drag is already dead on that screen today and there is a stack trace in your console. The migration does not break it — it removes the evidence. Because nothing throws afterwards, CI will not catch it either. The library's own spec covers only a statically present inner container.

**Workaround:** audit every `[sortablejsContainer]` usage anyway — this is a good moment to find the ones that were already broken. Put the directive on the container element itself where possible. Where the container is genuinely conditional, gate the directive host with the same condition so `ngOnInit` runs when the content exists.

### 5.7 Native DOM events are suppressed at the container — different semantics, silent

Before creating the instance, the directive registers **capture-phase** listeners on the container for `start`, `end`, `add`, `update`, `sort`, `remove`, `filter`, `change`, `choose`, `unchoose` and `clone`, each calling `event.stopImmediatePropagation()`. The intent is sound: SortableJS dispatches native `CustomEvent`s with exactly those names, which would otherwise double-fire template bindings named like the new outputs.

The collateral damage is that these are generic DOM event names and a capture listener on the container fires before anything on a descendant. The handler stops **every** event of those names reaching the container, whatever dispatched it. Two families are affected:

- **Form controls.** A `<select>`, checkbox, radio, `<input type="file|date|color">` or `<select multiple>` inside the container never delivers its native `change` event to a `(change)` binding, to `ngModel`, or to a `formControlName`. Text and range inputs keep working with `ngModel` / `formControlName`, because Angular's default value accessor commits on `input` — but their native `change` is suppressed too, so an explicit `(change)` binding on **any** element inside the container stops firing regardless of element type.
- **Custom elements.** Any web component inside the list (Stencil, Lit, Angular Elements, a third-party design system) that dispatches a real `CustomEvent` named `change`, `filter`, `sort`, `start`, `end`, `add`, `remove`, `update`, `choose`, `unchoose` or `clone` is silenced too. Angular component outputs are unaffected — they are not DOM events — but custom-element events are.

The incumbent installed no such listeners, so this is new. Note this covers **descendants** of the container only; for what happens to event bindings on the host element itself, see 5.19.

**Workaround:** re-test every migrated list containing form controls or custom elements. Move a control that needs `change` outside the sortable container, or bind a different event where the semantics allow (`input` for text and range, `blur` for commit-on-leave). The listeners are removed in `ngOnDestroy`, so the effect is scoped to the container's lifetime.

### 5.8 `(init)` timing — different semantics

The payload is the same `Sortable` instance, now typed. The emission moved from `setTimeout(() => { create; emit }, 0)` inside `ngOnInit` to `afterNextRender(() => { … }, { injector })`.

**At runtime:** `afterNextRender` runs after change detection for that cycle has completed, so state mutated in an `(init)` handler is not part of the pass that just ran. It needs a signal write or an explicit `markForCheck()`. Under the incumbent's `setTimeout(0)`, a full CD cycle followed automatically.

**On the server:** `afterNextRender` does not run, so `(init)` definitely never fires during SSR. The incumbent's `if (Sortable && Sortable.create)` guard **passes** on the server — `require('sortablejs')` in Node yields a function whose `.create` is a function — so the incumbent went ahead and attempted `Sortable.create` during SSR instead of skipping it. (What that attempt then did in a non-DOM environment is not something either source tree establishes, so this guide does not claim it.) The replacement's `typeof window !== 'undefined'` guard skips creation outright. It is the correct guard, but the behaviour changed.

**In tests:** `ComponentFixture.detectChanges()` flushes the `afterNextRender` callback, so a spec that calls `detectChanges()` and then yields a macrotask still sees the instance — that is exactly how the library's own suite tests `(init)`:

```ts
it('should emit init event with Sortable instance', async () => {
  const initFixture = TestBed.createComponent(InitEventTestComponent);
  initFixture.detectChanges();
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  expect(initFixture.componentInstance.sortableInstance).toBeTruthy();
});
```

What does break is a spec that reads the instance **synchronously** after `detectChanges()` without yielding at all.

**Workaround:** for SSR, move anything that ran in the init handler on the server into a browser-only path. For tests, add the macrotask yield (`await new Promise(r => setTimeout(r, 0))`, or `tick(0)` inside `fakeAsync`). For runtime state, write a signal or call `markForCheck()` in the handler.

### 5.9 Clone sources and `isCloning` — different semantics

Two changes stack here.

**The `onRemove` branches.** The incumbent guarded array mutation with `if (bindings.provided)`. The replacement guards with `if (this.autoUpdateArray() && bindings.provided) { … } else if (this.isCloning) { … }`, and **both** branches perform the same DOM surgery on a clone pull: `removeChild(item)`, `insertBefore(item, clone)`, `removeChild(clone)`. So a clone source with no array bound — a pure-DOM palette such as `<div sortablejs [sortablejsOptions]="{ group: { name: 'x', pull: 'clone' } }">` — did nothing on `onRemove` under the incumbent and now rewrites the DOM.

There is no input that turns this off. `[autoUpdateArray]="false"` selects the `else if (this.isCloning)` branch rather than avoiding it.

**`isCloning` itself changed shape, and the one real delta is the `try/catch`.** The incumbent computed it unconditionally: `options.group.checkPull(instance, instance) === 'clone'`. The replacement checks `typeof group === 'object' && 'checkPull' in group && typeof group.checkPull === 'function'`, wraps the call in `try/catch`, and falls back to `group.pull === 'clone'`.

That fallback never runs against a real instance. SortableJS's `_prepareGroup` executes inside the constructor and **replaces** `options.group` with a normalized `{ name, checkPull, checkPut, revertClone }`, where `checkPull` is always a function (it wraps a string, an array, a boolean, `'clone'`, or a user function alike through `toFn(originalGroup.pull, true)`) and no `pull` key survives. The directive reads `this.sortableInstance.options.group` — the post-normalization object — so the `checkPull` branch always wins. The `'pull' in group` fallback and the trailing `return false` are dead code outside synthetic tests that assign `options.group` by hand, which is exactly what the library's own spec does. Recognition works as it did in the incumbent, whatever group shape you write.

What *is* new is the swallow. The directive calls `group.checkPull(instance, instance)` with the `dragEl` and `evt` arguments undefined; a user-supplied `pull` function that throws when handed those is now caught and turned into `false`, silently downgrading a clone pull to a normal move. The incumbent propagated that error.

**Workaround:** re-test every clone source specifically. If you need the source DOM genuinely untouched, drop `pull: 'clone'` and manage the copy yourself from `(start)` / `(end)` with `copyArrayItem`. If you supply a `pull` **function**, make it total — defensive against undefined `dragEl` / `evt` — because an exception there no longer surfaces.

### 5.10 Zone boundaries — different semantics

The incumbent created Sortable inside a `setTimeout` in the Angular zone and overrode exactly three callbacks (`onAdd`, `onRemove`, `onUpdate`). Everything else ran in the zone as a side effect of zone.js patching `addEventListener`.

The replacement calls `Sortable.create` inside `zone.runOutsideAngular` and re-enters via `zone.run` only for the callbacks it overrides: `onAdd`, `onRemove`, `onUpdate`, `onStart`, `onEnd`, `onSort`, `onFilter`, `onChange`, `onChoose`, `onUnchoose`, `onClone`, `onMove`.

Everything else you supply in `[options]` now runs **outside** the zone: plugin callbacks (`onSpill`, `onSelect`, `onDeselect` from RevertOnSpill / RemoveOnSpill / MultiDrag), `setData`, and `store.get` / `store.set`. Views those callbacks mutate stop updating until something else triggers change detection.

**Workaround, split by change-detection mode:**

- *Zone-based apps:* inject `NgZone` and wrap the handler body in `zone.run(…)`, or call `ChangeDetectorRef.markForCheck()` at the end.
- *Zoneless apps:* `zone.run` is a no-op — `NgZone` is `NoopNgZone`, which also means the directive's own `proxyEvent` schedules nothing on its own. Either bind the matching output in the template (the template listener is what marks the view dirty), or drive the state through signals, or inject `ChangeDetectorRef` / `ApplicationRef` and mark explicitly. This bites hardest on the minimal-diff migration, where callbacks stay in `[options]` and no output is bound.

On `onMove` specifically: it is the one overridden callback that fires continuously rather than once per drop, so it is the one whose `zone.run` cost is worth watching. It ran in-zone under the incumbent too — the frequency of change detection is not higher than before. What is new is that the directive additionally emits `(move)` and allocates a `SortableMoveEventPayload` object on every tick.

### 5.11 Programmatic access to the directive — different semantics

`SortableDirective` uses signal inputs, so `@ViewChild(SortablejsDirective)` code breaks in both directions. Reads become calls: `d.sortablejs` → `d.items()`, `d.sortablejsOptions` → `d.options()`. Writes are impossible: `ref.sortablejsOptions = { … }` has no equivalent.

**Workaround:** move the value into a template binding fed by a component field or signal and let change detection push it down; `ngOnChanges` still re-applies changed keys through `instance.option()`, so the observable result is the same. For genuinely imperative control, keep the instance from `(init)` and call `instance.option(key, value)`.

### 5.12 Manual mode: the cross-list DOM path, and the index family

`[autoUpdateArray]="false"` is described as "only emits events". It does more than that, and less than the code comments suggest.

**Cross-list drops in manual mode remove the node and never put it back.** The manual branch of `onAdd` splits on `if (event.clone)` — clone branch removes the dragged item from the target DOM; `else` calls `revertTransferDom` to move it home. But SortableJS creates `cloneEl = clone(dragEl)` on **every** drag start, regardless of `pull: 'clone'`, and stamps `evt.clone = cloneEl` on every dispatched event; `cloneEl` is nulled only in `_nulling()`, after all events have fired. So `event.clone` is always a live element reference, the clone branch always wins, and `revertTransferDom` is **dead code against real SortableJS events**. Meanwhile the source's manual `onRemove` restores nothing for a non-clone group (its manual path is `else if (this.isCloning)`).

Net effect on every manual-mode cross-list drop: the dragged node is removed from the DOM and nothing reinserts it. The screen looks correct only because Angular re-renders both lists from the arrays your `(add)` handler mutated. **If that handler validates, awaits, early-returns, or otherwise fails to update both arrays synchronously, the row simply disappears.** Note also that the library's own spec reaches the `revertTransferDom` branch only by fabricating an event with `clone: undefined` — a shape real SortableJS never produces — which means the manual cross-list path has no real-event coverage at all.

**Same-list reordering does revert the DOM**, through `revertSortableDom`, which reinserts the dragged node using `from.children[oldIndex]` (or `children[oldIndex + 1]` when the item moved up). That arithmetic is sound: SortableJS's `oldIndex` / `newIndex` are computed by `index(target)` with no selector, counting every previous element sibling, which is the same population `from.children` counts. Headers, placeholders and non-draggable rows are counted by both, so the positions agree.

**The index hazard is elsewhere — in your handlers.** SortableJS carries two index families on every event:

- `oldIndex` / `newIndex` — `index(target)`, counting *all* element siblings.
- `oldDraggableIndex` / `newDraggableIndex` — `index(target, options.draggable)`, counting only elements matching the `draggable` selector.

Your array holds draggable items only, so the draggable-filtered pair is the one that maps onto array positions — and it is what the directive itself uses for the same-list array update, via `getIndexesFromEvent(event)`. (Its `onAdd` / `onRemove` paths read the raw `event.newIndex` / `event.oldIndex`, an inconsistency of the library's own; for your handlers, prefer the draggable pair in both cases, since both write into arrays of draggable items.)

**Use `event.oldDraggableIndex` / `event.newDraggableIndex` in manual handlers whenever the container holds anything that is not a draggable item** — a header, a footer, a placeholder, a non-draggable row, or a `draggable` selector that narrows the set. That is what the directive uses for the array, and what `event.oldIndex` / `event.newIndex` are not. In a plain container of nothing but draggable items the two families coincide and either works; in every other container they diverge and the raw pair writes to the wrong array slot. Manual mode is precisely where a `draggable` selector is common, and where this sample gets copied verbatim.

**Workaround:** use the draggable index family in every manual handler; update all affected arrays synchronously inside the handler, with no awaits and no early returns on the happy path; and keep the container simple where you can.

### 5.13 The array helpers are not interchangeable with the CDK ones at the edges

- `moveItemInArray(array, from, to)` returns **silently** when `array` is empty or undefined — the first guard is `if (!array || array.length === 0) return;` with no output. Out-of-range indices, including `toIndex === array.length`, hit a second guard that also no-ops — up to 22.1.3 it emitted `console.warn('[moveItemInArray] Invalid indices: …')` first, and that warning has since been removed. `@angular/cdk` (checked against `@angular/cdk` 22.0.6) instead clamps both indices to `array.length - 1` and completes the move.
- `transferArrayItem` and `copyArrayItem` no-op on a missing array and on an out-of-range `currentIndex`, and accept `targetIndex === targetArray.length` (append), rejecting only `targetIndex > length`.

**Consequence:** every rejected call is a **silent no-op**. Handlers ported from a CDK implementation drop tail-of-list moves where CDK clamped and completed them, and a manual-mode handler running against an array that has not been populated yet does nothing at all. Neither leaves anything in the console — up to 22.1.3 the out-of-range cases at least warned — which matters more than it looks, because manual mode is the replacement for the deleted `SortablejsBindings` capability.

**Workaround:** validate indices in your own handler before calling the helpers, or clamp them yourself if you are matching CDK behaviour.

### 5.14 Unprefixed inputs collide with other directives — and with plain HTML attributes

The new inputs dropped the `sortablejs` prefix, so `container`, `options`, `group`, `sort`, `delay`, `disabled`, `draggable`, `handle`, `animation`, `filter`, `direction`, `easing`, `ignore` and `store` are now plain names on the host element.

Two exposures:

- **Other directives.** If another directive on the same element declares an input with one of those names, both receive the binding.
- **Static HTML attributes.** Angular assigns static attribute values to matching directive inputs. So `<div hubSortable draggable="false">` — an ordinary thing to write on a drag container — passes the string `"false"` to SortableJS's `draggable` option, which expects a CSS selector. Nothing in the list becomes draggable and nothing is logged. The same exposure applies to static `filter`, `sort`, `disabled`, `handle`, `direction`, `ignore` and `store` attributes.

This item is about **inputs**. The mirror-image exposure on outputs is 5.19.

**Workaround:** audit the host elements of your sortable containers for both other directives and native attributes before migrating. Move the sortable onto its own wrapper element where a collision exists.

### 5.15 `GLOBALS` (`ɵa`) — missing, and `provideSortable` is not a drop-in for every use

Anyone who wrote `{ provide: ɵa, useValue: { … } }` by hand — typically to override defaults in a lazy-loaded module, a component, or a TestBed — has nothing importable to migrate to. The token exists in the library's **source** with the identical description string, but it is not part of the published bundle's exports, and the package's `exports` map exposes only `.` and `./package.json`. There is no deep import to attempt.

The replacement provider also does not cover the whole old surface. `ɵa` was a plain `InjectionToken`, so a **component-level** override was legal: `@Component({ providers: [{ provide: ɵa, useValue: {…} }] })`. `provideSortable()` is built with `makeEnvironmentProviders` and returns `EnvironmentProviders`, which Angular rejects at compile time in a component's `providers` array — the library's JSDoc claim of "any route/component injector" is half right. **A per-component global-options override has no replacement.** The nearest equivalent is putting the options on the element itself, via `[options]` or the individual inputs.

**Workaround:** `provideSortable(globalOptions)` at the environment level, or `SortableModule.forRoot(globalOptions)` on NgModules. For a lazy route, put `provideSortable()` in that route's `providers` — that part works. For a spec, provide it the same way in `TestBed`. For a single component, move the options onto the element.

### 5.16 `SortablejsService` (`ɵb`) and `SortablejsService.transfer` — missing

`SortableService` exists in the library's source but is not part of the published bundle's exports. Code that injected `ɵb` to observe or drive the cross-list handoff — logging transfers centrally, or wrapping `transfer` to run work between the target's `onAdd` and the source's `onRemove` — has no migration path. The published package is one fesm2022 bundle behind an `exports` map with only `.` and `./package.json`, so there is no deep import into internals at any level of risk tolerance: the symbol is simply unreachable.

**Workaround:** move that logic to the `(add)` and `(remove)` outputs on the lists themselves, and read 5.4 for what the shared state now does without you.

### 5.17 `SortablejsBindings` and `SortablejsBinding` — missing

Neither package exports them publicly. In the incumbent they shipped as typings under `lib/` and runtime files under `esm2015/lib/`, reachable only by deep import. In the replacement, `SortableBindings` and `SortableBinding` exist in the source but are not part of the published bundle's exports, and the closed `exports` map makes them unreachable. The directive still special-cases `items instanceof SortableBindings` internally, so the parallel-array capability exists in the code — but the class cannot be constructed by a consumer.

**Consequence:** if you deep-imported `SortablejsBindings` to keep several arrays in sync from one drag (the "items plus a parallel array of ids" case), there is no supported path forward, and no unsupported one either.

**Workaround:** bind the primary array with `[hubSortable]` and update the parallel arrays yourself from `(update)`, `(add)` and `(remove)`, using `moveItemInArray` / `transferArrayItem` — reading 5.13 and 5.12 first. Or switch to `[autoUpdateArray]="false"` and drive every array from the handlers, which makes the coupling explicit.

### 5.18 The Angular upgrade comes first — and it is a View Engine gate, not a peer range

Peer dependencies go from `@angular/common` + `@angular/core` `^11.0.0` to `>= 18.0.0`, so the replacement is not installable on the Angular versions the incumbent targeted. But the binding constraint is the one from section 1: `ngx-sortablejs@11.1.0` is a View Engine library with zero Ivy definitions, so it stops compiling at Angular 16 — two majors below the replacement's floor. There is no Angular version where both packages build.

Plan the migration as the last step of the Angular upgrade, in one commit, with the commit as your rollback. See section 2 for why the flat `>= 18.0.0` range still requires pinning a line deliberately, and for the `minVersion: "17.1.0"` the linker actually enforces.

### 5.19 Output names shadow native event bindings on the host element

`ngx-sortablejs@11.1.0` declared exactly one output, `sortablejsInit` (verified in the published `lib/sortablejs.directive.d.ts` and in the fesm bundle's `propDecorators`). Every other parenthesised binding you wrote on a `[sortablejs]` host was therefore a plain **DOM** event listener. So this bound a real listener that caught `change` bubbling up from the form controls inside:

```html
<div [sortablejs]="items" (change)="onFormChange($event)">…</div>
```

After the rename, the same binding resolves to `SortableDirective.change` — the directive output, carrying a `SortableEvent`, firing on a completely different occasion. And even if it did not, 5.7's capture-phase suppressor would have killed the native `change` before it reached the host. The change is silent in both directions: it compiles, and it fires, just not for the reason your handler expects.

The same shadowing applies to `(start)`, `(end)`, `(add)`, `(remove)`, `(update)`, `(choose)`, `(unchoose)` and `(clone)` on the host element.

**Workaround:** grep the host elements of every migrated sortable for parenthesised bindings, and treat each one as a rewrite rather than a rename. Where you need the native event, move the listener to a wrapper element outside the sortable host — bearing in mind that 5.7 suppresses these names inside the container too, so the wrapper must sit *above* the host, not within it.

### How to detect any of this

5.1, 5.6, 5.7, 5.9, 5.12, 5.14 and 5.19 all fail **without throwing**. A green unit-test run is not evidence that any of them is fine, and neither is the pattern the library's own suite uses: those specs drive the directive's handlers with fabricated event objects (`createSortableEvent`, `sortable.directive.spec.ts:277-296`) rather than events produced by real SortableJS, which is exactly how a dead branch like `revertTransferDom` (5.12) can be "covered" and still never run in a browser.

So the instruction is concrete: **write at least one real-interaction test per migrated group** — a Playwright or Cypress drag against the running app. A directive-level Angular spec built the way the library's own specs are built will pass against behaviour that is broken for your users.

---

## 6. Pre-flight checklist

Before you rename a single attribute:

1. **Decide the destination.** If the only goal is following Angular forward, `@worktile/ngx-sortablejs` keeps the same selector and input names — and because of the View Engine gate, for most apps it is the only path that preserves the current template API. Choose `ng-hub-ui-sortable` for the added surface, accepting section 5.
2. **Confirm Angular >= 20 in practice.** There is no published 18.x, 19.x or 22.0.x line. Angular 22 → pin `22.1.x`; Angular 21 → pin a `21.x` line; Angular 20 → pin `20.0.0`; Angular 18 or 19 → finish the upgrade first, or accept an unsupported combination and verify the partial-Ivy link yourself against `minVersion: "17.1.0"`.
3. **Settle `sortablejs` ownership.** It is a peer through `21.1.1` and a dependency from `21.2.0`. Below that boundary, keep it in your own `dependencies`. Above it, pin the transitive range with `overrides` / `resolutions` — the library declares `>=1.7.0` with no upper bound.
4. **Keep `@types/sortablejs`** in `devDependencies`. Change `from 'sortablejs'` imports to `from 'ng-hub-ui-sortable'`.
5. **Run `npm ls sortablejs`** and confirm one copy resolves — especially if you mount SortableJS plugins.
6. **Inventory the old surface.** Grep for `ɵa`, `ɵb`, `SortablejsService`, `SortablejsBindings`, `SortablejsBinding` and any `ngx-sortablejs/lib/` or `ngx-sortablejs/esm2015/` deep import. Each hit is a rewrite with no importable target — the replacement ships one bundle behind a closed `exports` map (5.15–5.17).
7. **List every `[sortablejsContainer]`** and check whether the selector matches content rendered by `@if` / `*ngIf` / `*ngFor`. Those are already broken today; the migration only quiets them (5.6).
8. **List every group name** and confirm every list in it will carry the same `autoUpdateArray` value, and that every list in it is bound (5.1).
9. **List every sortable container holding a `<select>`, checkbox, radio, file/date/color input or custom element** — and every `(change)` binding on any descendant, whatever the element type (5.7).
10. **List every `onMove` that returns `false`** and keep it in the merged options — per-element `[options].onMove` or the global config, never the `(move)` output (5.2).
11. **Decide one channel per event** — `[options]` callbacks or outputs, not both (5.3).
12. **Decide one option style per element** — whole object or individual inputs, not both (5.5).
13. **Check the host elements** of your sortable containers for competing directive inputs, for static `draggable` / `filter` / `sort` / `disabled` / `handle` / `direction` / `ignore` / `store` attributes (5.14), and for parenthesised bindings such as `(change)` that used to be DOM listeners and now resolve to directive outputs (5.19).
14. **Fix the index family in every manual handler** — `oldDraggableIndex` / `newDraggableIndex`, not `oldIndex` / `newIndex` — and make those handlers update every affected array synchronously (5.12).
15. **Replace `provideSortable()` in component `providers`** before you write it: it returns `EnvironmentProviders` and only works at the environment or route level (5.15).
16. **Rename longest-first**, never with a bare substitution on `sortablejs` (section 2).
17. **Migrate in one commit, not screen by screen.** The packages cannot coexist on Angular 18+: the incumbent is View Engine and will not compile. Reverting the commit is the rollback.
18. **Write a real-interaction drag test per migrated group** (Playwright / Cypress) and re-test drag manually on every migrated screen. Most of section 5 fails without throwing, and fabricated-event unit specs pass against browser-broken behaviour, so a green CI run is not evidence.

---

## Reporting a problem

If something here is wrong, or a migrated list behaves differently in a way not described above: <https://github.com/hub-env/hub-ui/issues>

What makes a report actionable:

- the Angular version and the `ng-hub-ui-sortable` version;
- the version you came from (almost certainly `ngx-sortablejs@11.1.0`, or a `@worktile/ngx-sortablejs` major);
- the template fragment and the component fields it binds, before and after;
- whether the behaviour differed under the old package — that separates a migration regression from a SortableJS behaviour you had not hit before, and note that several items in section 5 were already broken under the incumbent;
- which item in section 5 you think applies. If the answer is none of them, say so — that sentence is the most useful one in the report, because it means this guide has a gap.

A minimal reproduction turns a discussion into a fix.

<!--
VERIFICATION NOTES — all 15 demanded corrections and all 13 demanded warnings were checked
against primary sources before being applied. None was found to be incorrect, so no original
text was retained on the grounds of a faulty correction.

Sources checked:
- ngx-sortablejs@11.1.0 tarball at /private/tmp/inc/package
  * ngx-sortablejs.metadata.json => "version":4; grep for ɵfac|ɵdir|ɵmod|ɵɵdefineDirective
    over bundles/, esm2015/, fesm2015/ and every lib/*.d.ts => 0 hits in all 20 files. (C1, W1)
  * fesm2015/ngx-sortablejs.js:247-252 and esm2015/lib/sortablejs.directive.js:91-101 =>
    querySelector is OUTSIDE the setTimeout. (C2)
  * fesm2015/ngx-sortablejs.js:330-343 => onAdd assigns service.transfer unconditionally. (C10)
  * fesm2015/ngx-sortablejs.js:406-411 propDecorators => sortablejsInit is the only @Output;
    confirmed against lib/sortablejs.directive.d.ts. (W8)
  * node -e "require('sortablejs')" => typeof function, .create typeof function. (C11)
- ng-hub-ui-sortable@22.1.3 published tarball (npm pack) => 5 files only, no lib/;
  exports map exposes "." and "./package.json" only; bundle export line is
  {SortableDirective, SortableModule, copyArrayItem, moveItemInArray, provideSortable,
  transferArrayItem}. minVersion strings present: 12.0.0, 14.0.0, 17.1.0; compiler
  version "22.0.8". (C4, W2, W4)
- npm registry: versions are exactly 20.0.0, 21.0.0, 21.0.1, 21.1.0, 21.1.1, 21.2.0, 21.3.0,
  22.1.0, 22.1.1, 22.1.2, 22.1.3 — no 18.x/19.x, no 22.0.x. sortablejs is under
  peerDependencies through 21.1.1 and under dependencies from 21.2.0 onward, unbounded
  ">=1.7.0". (C3, C5, C14, W3, W10)
- Library source at projects/sortable/src/lib: sortable.directive.ts (create/ngOnDestroy/
  optionsWithoutEvents/isCloning/onAdd/onRemove/onUpdate/revertSortableDom/revertTransferDom/
  suppressNativeSortableEvents/applyIndividualOptionChanges), sortable-utils.ts,
  array-helpers.ts, sortable.service.ts, sortable.provider.ts, sortable.module.ts,
  sortable-options.ts (32 entries confirmed), public-api.ts. (C6/C15, C7, C8, C9, C12, C13,
  W5, W6, W9, W11, W12)
- sortablejs 1.15.7 modular/sortable.esm.js: _prepareGroup normalizes options.group into
  {name, checkPull, checkPut, revertClone} with checkPull always a function via toFn;
  index(el, selector) skips only TEMPLATE and Sortable.clone; oldIndex=index(target) vs
  oldDraggableIndex=index(target, options.draggable); cloneEl=clone(dragEl) created
  unconditionally at dragStart; evt.clone=cloneEl on every dispatched event; clone removed
  in _onDrop before add/remove dispatch. (C6/C15, C12, C13)
- @angular/cdk 22.0.6 fesm2022/drag-drop.mjs:1452 => moveItemInArray clamps both indices.
  Version corrected from the demanded "22" to the exact 22.0.6 present in the workspace. (C7)

One refinement applied while honouring correction 12 / warning 7: the demanded wording says
"that is what the directive itself uses for the array". That is exactly true of onUpdate,
which calls getIndexesFromEvent(event) (preferring oldDraggableIndex/newDraggableIndex), but
the directive's own onAdd and onRemove read the raw event.newIndex / event.oldIndex. Section
5.12 states this precisely and still gives the demanded instruction — prefer the draggable
pair in manual handlers, including (add) handlers, since those write into arrays that hold
draggable items only. The correction's substance is preserved; only its generalisation about
the directive's internals was tightened to match the code.
-->

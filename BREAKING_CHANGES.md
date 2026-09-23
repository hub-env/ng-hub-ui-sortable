# Breaking Changes

This file documents breaking changes and migration steps for `ng-hub-ui-sortable`.

**Read it, because the version number cannot warn you.** The major version of this package tracks
the Angular major it targets — `22.x` means "for Angular 22" — so a breaking change can never raise
the major and the highest it can ever go is a minor. SemVer is doing a different job here, and this
file is the only notice you get.

Coming from `ngx-sortablejs` or `@worktile/ngx-sortablejs` is a different question: that is a change
of package, not of version, and it has its own document — [`MIGRATION.md`](./MIGRATION.md).

## [22.3.0] - 2026-09-23

### Angular below 17.3.0 is no longer supported

- **Change**: the `@angular/*` peer ranges move from `>=17.1.0` to `>=17.3.0`.

- **Why**: Its published `.d.ts` names `InputSignalWithTransform` or `OutputEmitterRef`, which Angular did not ship until 17.3.

- **Impact — an application below 17.3.0 gets a peer warning where it used to get a build error.**
  Nothing that worked stops working: those versions never compiled against this package. Upgrade
  Angular to 17.3.0 or stay on the previous release.

## [22.2.0]

### `SortableData` is a list type, not `any`

- **Change**: the type was written `any | any[] | WritableSignal<any[]>`, and TypeScript collapses
  a union containing `any` to `any`. So the published type said "anything at all": `[hubSortable]`
  accepted a number, a string, a `Date` or a plain object and the compiler had nothing to say. It
  is now `T[] | WritableSignal<T[]> | SortableFormArrayLike<T>`, with `T` defaulting to `unknown` —
  a list of something, rather than anything. `SortableFormArrayLike` is new and exported: it
  describes structurally the four `FormArray` members this package calls, which is what the
  runtime duck typing in `SortableBinding` has always done.

- **Impact**: a template binding `[hubSortable]` to an array, a signal or a `FormArray` compiles
  exactly as before, and so does `null` or leaving it unbound. What stops compiling is binding
  something that was never reorderable, and a hand-written `const data: SortableData = …` holding
  one. `SortableBinding` also gained a type parameter, so `binding.get(0)` and `binding.remove(0)`
  now return `unknown` instead of `any` where the element type cannot be inferred: an unchecked
  property access on the result is reported where it used to pass.

- **What happens if you do nothing**: nothing at runtime. Not one line of behaviour changed —
  this is a type-level correction, and every error it raises is an error that was always there.

- **Migration**: name the element type where the compiler cannot infer it, and drop the casts the
  old `any` made necessary.

    ```typescript
    // Before — the cast was needed because the target was `any`
    const binding = new SortableBinding(formArray as any);
    const control = binding.get(0);

    // After
    const binding = new SortableBinding<AbstractControl>(formArray);
    const control: AbstractControl = binding.get(0);
    ```

    ```typescript
    // Before — compiled, and was never reorderable
    const data: SortableData = { first: 'A', second: 'B' };

    // After — say what the list holds
    const data: SortableData<string> = ['A', 'B'];
    ```

### Keyboard reordering is on by default

- **Change**: `[hubSortable]` now makes each item a Tab stop and reorders the list from the
  keyboard. It is not a breaking change to the API — the new `keyboardSorting` input defaults to
  `true` — but it changes the DOM: items that carried no `tabindex` now carry `tabindex="0"`, so
  the tab order of a page holding a long list gets longer.

- **Impact**: a `tabindex` you set yourself is never overwritten, and the attribute is withdrawn
  again while the list is `disabled` or `sort` is `false`. A snapshot test that asserts the exact
  attributes of a list item will see the new one.

- **What happens if you do nothing**: the list becomes usable without a pointer, which is the
  point. Should the application already provide its own keyboard path and want only one, set
  `[keyboardSorting]="false"` and the directive adds nothing.

## [22.1.4]

No API change. One behaviour a consumer may have been leaning on is gone.

**The library no longer writes to your console.** Eight guard rails used to report invalid input
with `console.warn` or `console.error`: the out-of-range check in `moveItemInArray`, three in
`transferArrayItem`, three in `copyArrayItem`, and the directive's `container` lookup. Each guard
behaves exactly as before — the call is a no-op and your arrays are untouched — but it is now
silent.

What to do: nothing, unless you were reading those messages. If you were, the one that mattered is
the `container` lookup. A `container` selector matching nothing leaves the directive inert: no
SortableJS instance, no `(init)`, no dragging. Audit your `container` selectors once
(see [`MIGRATION.md`](./MIGRATION.md), section 5.6) rather than waiting for a message that no longer
comes.

## [22.1.0]

No breaking changes. `provideSortable()` and the payload type exports are additive.

`SortableModule` and `SortableModule.forRoot()` are **deprecated**, not removed. They keep working.
Replace them at your own pace:

```typescript
// Before
@NgModule({ imports: [SortableModule.forRoot({ animation: 150 })] })

// After
bootstrapApplication(AppComponent, {
	providers: [provideSortable({ animation: 150 })]
});
```

## [21.2.0]

No API change, one packaging change.

**`sortablejs` moved from `peerDependencies` to `dependencies`.** It now installs with this package.
If your own manifest lists `sortablejs`, remove it: two entries pinned separately drift apart, and
the copy this package resolves is the one that runs.

## [21.1.1]

No API change. Two behaviours changed for anyone using manual mode
(`[autoUpdateArray]="false"`).

- **`update` and `add` now emit once per drop.** SortableJS calls its own handlers more than once
  when the DOM is rearranged inside them, and those extra emissions used to reach your code. If you
  had built your own de-duplication — a debounce, an "already handled" flag — it is now dead weight
  and may swallow a legitimate second drag.
- **The directive reverts SortableJS's DOM move before your handler's array update renders.** The
  element you see after a drop is the one Angular rendered from your array, not the one SortableJS
  left behind. Code that read the DOM position after a drop instead of the event indexes will now
  read the pre-drag order.

Native SortableJS CustomEvents are also suppressed at the container from this version on, so a
template listener no longer fires twice for one drop — once for the native event and once for the
directive output.

## [20.0.0]

First version published under the name `ng-hub-ui-sortable`; the numbering continues the fork it
came from. Everything the registry serves under this package name starts here.

The directive selector is `[hubSortable]`, not the one the upstream package used. That is the whole
of the API break, and [`MIGRATION.md`](./MIGRATION.md) covers it member by member, along with the
behaviour differences that compile cleanly and only fail at runtime.

## Earlier versions

`19.0.0`, `18.0.0`, `17.0.0` and `16.0.0` were released under the upstream package name and are
recorded here only so the history reads continuously. Their breaking changes are Angular's, not this
library's.

import { WritableSignal } from '@angular/core';
import { MoveEvent } from 'sortablejs';

/**
 * The part of Angular's `FormArray` this package actually touches, described structurally so the
 * package keeps working without a dependency on `@angular/forms` — which is what the runtime duck
 * typing in `SortableBinding` has always done, only now the compiler knows about it too.
 *
 * A real `FormArray` satisfies this shape, and so does any object that reorders like one.
 */
export interface SortableFormArrayLike<T = unknown> {
	/** Number of controls currently held. */
	readonly length: number;
	/** Returns the control at `index`. */
	at(index: number): T;
	/** Inserts `item` at `index`. */
	insert(index: number, item: T): void;
	/** Removes the control at `index`. */
	removeAt(index: number): void;
	/** Resets the array — only its presence is used, to tell a `FormArray` from a plain array. */
	reset(): void;
}

/**
 * Data the sortable directive knows how to reorder: a plain array, a writable signal holding one,
 * or a `FormArray`.
 *
 * The type parameter carries the element type and defaults to `unknown`, so writing `SortableData`
 * bare still says "a list of something" rather than "anything at all". Reordering never reads an
 * element, so the directive itself has no use for a narrower element type; the parameter is there
 * for the consumer who wants their own list type to survive the round trip.
 */
export type SortableData<T = unknown> = T[] | WritableSignal<T[]> | SortableFormArrayLike<T>;

/**
 * SortableJS event names intercepted by the directive.
 */
export type SortableEventName =
	| 'onAdd'
	| 'onAddOriginal'
	| 'onRemove'
	| 'onUpdate'
	| 'onStart'
	| 'onEnd'
	| 'onSort'
	| 'onFilter'
	| 'onChange'
	| 'onChoose'
	| 'onUnchoose'
	| 'onClone'
	| 'onMove';

/**
 * Payload emitted by the `move` output combining SortableJS move event details.
 */
export interface SortableMoveEventPayload {
	event: MoveEvent;
	originalEvent: Event;
}

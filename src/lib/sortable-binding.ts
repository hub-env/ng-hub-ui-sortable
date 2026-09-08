import { isSignal, WritableSignal } from '@angular/core';
import { SortableData, SortableFormArrayLike } from './sortable.types';

/**
 * Provides a unified interface for manipulating sortable data regardless of its underlying type.
 *
 * This class abstracts away the differences between regular arrays, Angular FormArrays, and
 * Angular writable signals, allowing the sortable directive to work seamlessly with all three
 * data structures without knowing the specific implementation details.
 *
 * @example
 * ```typescript
 * // With a regular array
 * const binding = new SortableBinding(['item1', 'item2']);
 * binding.insert(1, 'newItem');
 *
 * // With a signal
 * const items = signal(['item1', 'item2']);
 * const binding = new SortableBinding(items);
 * binding.insert(1, 'newItem');
 *
 * // With a FormArray
 * const formArray = new FormArray([new FormControl('item1')]);
 * const binding = new SortableBinding(formArray);
 * binding.insert(1, new FormControl('newItem'));
 * ```
 */
export class SortableBinding<T = unknown> {
	/**
	 * Creates a new SortableBinding instance.
	 *
	 * @param target - The data to bind. Can be a regular array, Angular FormArray, or writable signal.
	 */
	constructor(private target: SortableData<T>) {}

	/**
	 * Checks if the target is an Angular writable signal.
	 *
	 * @returns `true` if the target is a writable signal with a `set` method, `false` otherwise.
	 * @private
	 */
	private isSignalArray(): boolean {
		return isSignal(this.target) && typeof (this.target as WritableSignal<T[]>).set === 'function';
	}

	/**
	 * Gets the underlying array value from the target.
	 *
	 * For signals, this calls the signal to retrieve its value.
	 * For arrays and FormArrays, this returns the target directly.
	 *
	 * @returns The array value from the target.
	 * @private
	 */
	private get arrayValue(): T[] {
		return this.isSignalArray() ? (this.target as WritableSignal<T[]>)() : (this.target as T[]);
	}

	/**
	 * Sets a new array value to the target.
	 *
	 * For signals, this calls the signal's `set` method.
	 * For regular arrays, this replaces all items using splice to maintain the same reference.
	 *
	 * @param next - The new array value to set.
	 * @private
	 */
	private set arrayValue(next: T[]) {
		if (this.isSignalArray()) {
			(this.target as WritableSignal<T[]>).set(next);
		} else {
			(this.target as T[]).splice(0, (this.target as T[]).length, ...next);
		}
	}

	/**
	 * Inserts an item at the specified index.
	 *
	 * The insertion method varies based on the target type:
	 * - FormArray: Uses the native `insert` method
	 * - Signal: Creates a copy of the array, inserts the item, and updates the signal
	 * - Regular array: Uses the native `splice` method
	 *
	 * @param index - The zero-based index at which to insert the item.
	 * @param item - The item to insert. For FormArrays, this should be an AbstractControl.
	 */
	insert(index: number, item: T) {
		if (this.isFormArray()) {
			(this.target as SortableFormArrayLike<T>).insert(index, item);
		} else if (this.isSignalArray()) {
			const copy = [...this.arrayValue];
			copy.splice(index, 0, item);
			this.arrayValue = copy;
		} else {
			(this.target as T[]).splice(index, 0, item);
		}
	}

	/**
	 * Gets the item at the specified index.
	 *
	 * @param index - The zero-based index of the item to retrieve.
	 * @returns The item at the specified index. For FormArrays, returns an AbstractControl.
	 */
	get(index: number): T {
		return this.isFormArray() ? (this.target as SortableFormArrayLike<T>).at(index) : this.arrayValue[index];
	}

	/**
	 * Removes and returns the item at the specified index.
	 *
	 * The removal method varies based on the target type:
	 * - FormArray: Uses the native `removeAt` method
	 * - Signal: Creates a copy of the array, removes the item, and updates the signal
	 * - Regular array: Uses the native `splice` method
	 *
	 * @param index - The zero-based index of the item to remove.
	 * @returns The removed item. For FormArrays, returns an AbstractControl.
	 */
	remove(index: number): T {
		let item: T;

		if (this.isFormArray()) {
			const formArray = this.target as SortableFormArrayLike<T>;
			item = formArray.at(index);
			formArray.removeAt(index);
		} else if (this.isSignalArray()) {
			const copy = [...this.arrayValue];
			item = copy.splice(index, 1)[0];
			this.arrayValue = copy;
		} else {
			item = (this.target as T[]).splice(index, 1)[0];
		}

		return item;
	}

	/**
	 * Checks if the target is an Angular FormArray.
	 *
	 * This uses duck typing to avoid creating a direct dependency on @angular/forms.
	 * It checks for the presence of methods that are unique to FormArray and not
	 * available on standard arrays.
	 *
	 * @returns `true` if the target is a FormArray, `false` otherwise.
	 * @private
	 */
	private isFormArray(): boolean {
		// just checking for random FormArray methods not available on a standard array
		const candidate = this.target as Partial<SortableFormArrayLike<T>>;
		return !!candidate.at && !!candidate.insert && !!candidate.reset;
	}
}

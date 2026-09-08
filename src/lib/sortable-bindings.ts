import { SortableBinding } from './sortable-binding';
import { SortableData } from './sortable.types';

/**
 * Manages multiple sortable bindings for synchronized operations across parallel arrays.
 *
 * This class is useful when you have multiple related arrays that need to be kept in sync
 * during drag-and-drop operations. For example, when dragging items in a table where each
 * column is stored in a separate array, this class ensures all arrays are updated consistently.
 *
 * @example
 * ```typescript
 * // Synchronize multiple arrays during drag operations
 * const names = ['Alice', 'Bob', 'Charlie'];
 * const ages = [25, 30, 35];
 * const emails = ['alice@example.com', 'bob@example.com', 'charlie@example.com'];
 *
 * const bindings = new SortableBindings([names, ages, emails]);
 *
 * // Insert at index 1 across all arrays
 * bindings.injectIntoEvery(1, ['Diana', 28, 'diana@example.com']);
 * // Result: names = ['Alice', 'Diana', 'Bob', 'Charlie']
 * //         ages = [25, 28, 30, 35]
 * //         emails = ['alice@example.com', 'diana@example.com', 'bob@example.com', 'charlie@example.com']
 * ```
 */
export class SortableBindings {
	/**
	 * Array of individual sortable bindings, one for each data source.
	 */
	bindings: SortableBinding<any>[];

	/**
	 * Creates a new SortableBindings instance with multiple data sources.
	 *
	 * @param bindingTargets - Array of data sources (arrays, FormArrays, or signals) to bind.
	 */
	constructor(bindingTargets: SortableData<any>[]) {
		this.bindings = bindingTargets.map((target) => new SortableBinding(target));
	}

	/**
	 * Inserts items at the specified index in all bound data sources.
	 *
	 * This method ensures that all arrays stay synchronized by inserting corresponding
	 * items at the same index position across all bindings.
	 *
	 * @param index - The zero-based index at which to insert items.
	 * @param items - Array of items to insert, one for each binding in the same order.
	 *
	 * @example
	 * ```typescript
	 * const bindings = new SortableBindings([names, ages]);
	 * bindings.injectIntoEvery(0, ['Eve', 22]);
	 * // Inserts 'Eve' at index 0 in names and 22 at index 0 in ages
	 * ```
	 */
	injectIntoEvery(index: number, items: unknown[]) {
		this.bindings.forEach((b, i) => b.insert(index, items[i]));
	}

	/**
	 * Retrieves items at the specified index from all bound data sources.
	 *
	 * @param index - The zero-based index of the items to retrieve.
	 * @returns Array of items from all bindings at the specified index.
	 *
	 * @example
	 * ```typescript
	 * const bindings = new SortableBindings([names, ages]);
	 * const items = bindings.getFromEvery(0);
	 * // Returns ['Alice', 25] if those are the values at index 0
	 * ```
	 */
	getFromEvery(index: number): unknown[] {
		return this.bindings.map((b) => b.get(index));
	}

	/**
	 * Removes and returns items at the specified index from all bound data sources.
	 *
	 * This method ensures that all arrays stay synchronized by removing items at
	 * the same index position across all bindings.
	 *
	 * @param index - The zero-based index of the items to remove.
	 * @returns Array of removed items from all bindings.
	 *
	 * @example
	 * ```typescript
	 * const bindings = new SortableBindings([names, ages]);
	 * const removed = bindings.extractFromEvery(1);
	 * // Removes and returns ['Bob', 30] if those were at index 1
	 * ```
	 */
	extractFromEvery(index: number): unknown[] {
		return this.bindings.map((b) => b.remove(index));
	}

	/**
	 * Checks if any bindings have been provided.
	 *
	 * @returns `true` if at least one binding exists, `false` if the bindings array is empty.
	 */
	get provided() {
		return !!this.bindings.length;
	}
}

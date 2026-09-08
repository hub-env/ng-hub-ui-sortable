import { signal, WritableSignal } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import * as publicApi from '../public-api';
import { SortableBinding } from './sortable-binding';
import { SortableBindings } from './sortable-bindings';
import { SortableData, SortableFormArrayLike } from './sortable.types';

/**
 * `SortableData` used to be written `any | any[] | WritableSignal<any[]>`, which TypeScript
 * collapses to plain `any` — so `[hubSortable]` accepted a number, a string or a `Date` and the
 * compiler said nothing. These assertions are compile-time ones: the `@ts-expect-error` comments
 * fail the build if the type ever goes back to accepting anything, which is the only way a type
 * can be tested.
 */
describe('SortableData', () => {
	it('accepts a plain array, a writable signal and a FormArray', () => {
		const fromArray: SortableData<string> = ['A', 'B'];
		const fromSignal: SortableData<string> = signal(['A', 'B']);
		const fromFormArray: SortableData<FormControl> = new FormArray([new FormControl('A')]);

		expect(fromArray).toEqual(['A', 'B']);
		expect((fromSignal as WritableSignal<string[]>)()).toEqual(['A', 'B']);
		expect((fromFormArray as SortableFormArrayLike<FormControl>).length).toBe(1);
	});

	it('says "a list of something", not "anything", when written without a type argument', () => {
		const list: SortableData = ['A', 'B'];

		// @ts-expect-error a bare object is not a list and never was reorderable
		const object: SortableData = { first: 'A' };
		// @ts-expect-error neither is a string, however array-like it looks
		const text: SortableData = 'AB';
		// @ts-expect-error nor a number
		const count: SortableData = 3;

		expect(list).toEqual(['A', 'B']);
		expect([object, text, count]).toHaveLength(3);
	});

	it('keeps the element type through the binding it is handed to', () => {
		const binding = new SortableBinding<string>(['A', 'B']);
		const removed: string = binding.remove(0);

		// @ts-expect-error the element is a string, so it has no `getTime`
		removed.getTime?.();

		expect(removed).toBe('A');
	});
});

/**
 * `SortableBindings` is the class that keeps several parallel arrays in step through one drag —
 * the whole reason it exists — and it was never listed in `public-api.ts`, so a consumer could
 * neither construct one nor type a field holding it.
 */
describe('the public entry point', () => {
	it('exports the multi-list bindings, and the single binding under them', () => {
		expect(publicApi.SortableBindings).toBe(SortableBindings);
		expect(publicApi.SortableBinding).toBe(SortableBinding);
	});

	it('exports a SortableBindings that reorders every bound list at the same index', () => {
		const names = ['Alice', 'Bob', 'Charlie'];
		const ages = [25, 30, 35];
		const bindings = new publicApi.SortableBindings([names, ages]);

		bindings.injectIntoEvery(0, bindings.extractFromEvery(2));

		expect(names).toEqual(['Charlie', 'Alice', 'Bob']);
		expect(ages).toEqual([35, 25, 30]);
	});

	it('exports the keyboard messages, so the announcements can be translated', () => {
		expect(typeof publicApi.DEFAULT_SORTABLE_KEYBOARD_MESSAGES.grabbed(1, 3)).toBe('string');
	});
});

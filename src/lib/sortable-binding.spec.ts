import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AbstractControl, FormArray, FormControl } from '@angular/forms';
import { SortableBinding } from './sortable-binding';

describe('SortableBinding', () => {
	describe('with regular array', () => {
		let binding: SortableBinding<string>;
		let arr: string[];

		beforeEach(() => {
			arr = ['A', 'B', 'C'];
			binding = new SortableBinding(arr);
		});

		it('should insert an item at the given index', () => {
			binding.insert(1, 'X');
			expect(arr).toEqual(['A', 'X', 'B', 'C']);
		});

		it('should insert at the beginning', () => {
			binding.insert(0, 'X');
			expect(arr).toEqual(['X', 'A', 'B', 'C']);
		});

		it('should insert at the end', () => {
			binding.insert(3, 'X');
			expect(arr).toEqual(['A', 'B', 'C', 'X']);
		});

		it('should get an item at the given index', () => {
			expect(binding.get(0)).toBe('A');
			expect(binding.get(1)).toBe('B');
			expect(binding.get(2)).toBe('C');
		});

		it('should remove and return an item at the given index', () => {
			const removed = binding.remove(1);
			expect(removed).toBe('B');
			expect(arr).toEqual(['A', 'C']);
		});

		it('should remove first item', () => {
			const removed = binding.remove(0);
			expect(removed).toBe('A');
			expect(arr).toEqual(['B', 'C']);
		});

		it('should remove last item', () => {
			const removed = binding.remove(2);
			expect(removed).toBe('C');
			expect(arr).toEqual(['A', 'B']);
		});
	});

	describe('with FormArray', () => {
		let binding: SortableBinding<AbstractControl>;
		let formArray: FormArray;

		beforeEach(() => {
			formArray = new FormArray([new FormControl('A'), new FormControl('B'), new FormControl('C')]);
			// No cast: a real FormArray satisfies `SortableFormArrayLike`, which is the point of
			// describing the shape instead of typing the target `any`.
			binding = new SortableBinding(formArray);
		});

		it('should insert a control at the given index', () => {
			const newControl = new FormControl('X');
			binding.insert(1, newControl);
			expect(formArray.length).toBe(4);
			expect(formArray.at(1).value).toBe('X');
		});

		it('should get a control at the given index', () => {
			const control = binding.get(0);
			expect(control.value).toBe('A');
		});

		it('should remove and return a control at the given index', () => {
			const removed = binding.remove(1);
			expect(removed.value).toBe('B');
			expect(formArray.length).toBe(2);
		});
	});

	describe('with WritableSignal', () => {
		it('should insert an item into a signal array', () => {
			TestBed.runInInjectionContext(() => {
				const items = signal(['A', 'B', 'C']);
				const binding = new SortableBinding(items);

				binding.insert(1, 'X');
				expect(items()).toEqual(['A', 'X', 'B', 'C']);
			});
		});

		it('should get an item from a signal array', () => {
			TestBed.runInInjectionContext(() => {
				const items = signal(['A', 'B', 'C']);
				const binding = new SortableBinding(items);

				expect(binding.get(0)).toBe('A');
				expect(binding.get(2)).toBe('C');
			});
		});

		it('should remove and return an item from a signal array', () => {
			TestBed.runInInjectionContext(() => {
				const items = signal(['A', 'B', 'C']);
				const binding = new SortableBinding(items);

				const removed = binding.remove(1);
				expect(removed).toBe('B');
				expect(items()).toEqual(['A', 'C']);
			});
		});

		it('should create a new array reference on insert (immutable pattern)', () => {
			TestBed.runInInjectionContext(() => {
				const items = signal(['A', 'B']);
				const original = items();
				const binding = new SortableBinding(items);

				binding.insert(0, 'X');
				expect(items()).not.toBe(original);
			});
		});

		it('should create a new array reference on remove (immutable pattern)', () => {
			TestBed.runInInjectionContext(() => {
				const items = signal(['A', 'B', 'C']);
				const original = items();
				const binding = new SortableBinding(items);

				binding.remove(0);
				expect(items()).not.toBe(original);
			});
		});
	});
});

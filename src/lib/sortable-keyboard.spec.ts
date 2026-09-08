import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SortableEvent } from 'sortablejs';
import { SortableDirective } from './sortable.directive';
import { SortableKeyboardMessages } from './sortable-keyboard';

/**
 * SortableJS binds `mousedown` and `touchstart` and nothing else, so until now the only way to
 * reorder a `hubSortable` list was to drag it. These specs are about the other half: they assert
 * that the keys move the *data*, and that what a screen reader is told matches what happened.
 * A `tabindex` on its own proves nothing — it is the array order and the announcement that decide
 * whether the feature exists for someone who does not use a pointer.
 */

@Component({
	template: `
		<ul
			[hubSortable]="items"
			[disabled]="disabled()"
			[autoUpdateArray]="autoUpdate()"
			class="kb-list"
			(update)="onUpdate($event)"
		>
			@for (item of items; track item) {
				<li class="kb-item">{{ item }}</li>
			}
		</ul>
	`,
	imports: [SortableDirective]
})
class KeyboardHostComponent {
	items = ['A', 'B', 'C', 'D'];
	// Signals rather than plain fields: a bare field mutated from a spec never marks the view
	// dirty, so change detection would not carry the new value into the directive.
	readonly disabled = signal<boolean | undefined>(undefined);
	readonly autoUpdate = signal(true);
	updates: SortableEvent[] = [];

	onUpdate(event: SortableEvent): void {
		this.updates.push(event);
	}
}

@Component({
	template: `
		<ul [hubSortable]="items" class="kb-signal-list">
			@for (item of items(); track item) {
				<li class="kb-item">{{ item }}</li>
			}
		</ul>
	`,
	imports: [SortableDirective]
})
class KeyboardSignalHostComponent {
	items = signal(['A', 'B', 'C']);
}

@Component({
	template: `
		<ul [hubSortable]="items" [keyboardMessages]="messages" class="kb-list">
			@for (item of items; track item) {
				<li class="kb-item">{{ item }}</li>
			}
		</ul>
	`,
	imports: [SortableDirective]
})
class KeyboardMessagesHostComponent {
	items = ['A', 'B', 'C'];
	messages: Partial<SortableKeyboardMessages> = {
		grabbed: (position, total) => `agarrado ${position} de ${total}`,
		moved: (position, total) => `movido a ${position} de ${total}`
	};
}

/** Lets `afterNextRender` run, which is where the directive wires the keyboard up. */
async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
	fixture.detectChanges();
	await new Promise<void>((resolve) => setTimeout(resolve, 0));
	fixture.detectChanges();
}

/** Sends one key to an element, bubbling, because the directive listens on the container. */
function press(element: Element, key: string): void {
	element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

/** What the live region currently says. */
function announcement(): string {
	return document.querySelector('[data-hub-sortable-live-region]')?.textContent ?? '';
}

/** The rendered list, read off the DOM rather than off the array. */
function rendered(fixture: ComponentFixture<unknown>, selector = '.kb-list'): string[] {
	return Array.from(fixture.nativeElement.querySelectorAll(`${selector} .kb-item`)).map((item) =>
		(item as HTMLElement).textContent!.trim()
	);
}

describe('hubSortable keyboard reordering', () => {
	let fixture: ComponentFixture<KeyboardHostComponent>;
	let host: KeyboardHostComponent;
	let items: HTMLElement[];

	beforeEach(async () => {
		await TestBed.configureTestingModule({ imports: [KeyboardHostComponent] }).compileComponents();
		fixture = TestBed.createComponent(KeyboardHostComponent);
		host = fixture.componentInstance;
		await settle(fixture);
		items = Array.from(fixture.nativeElement.querySelectorAll('.kb-item'));
	});

	it('makes every item reachable with the Tab key', () => {
		expect(items.length).toBe(4);
		for (const item of items) {
			expect(item.getAttribute('tabindex')).toBe('0');
		}
	});

	it('moves the item down the array when it is grabbed and ArrowDown is pressed', async () => {
		press(items[0], ' ');
		press(items[0], 'ArrowDown');
		fixture.detectChanges();

		expect(host.items).toEqual(['B', 'A', 'C', 'D']);
		expect(rendered(fixture)).toEqual(['B', 'A', 'C', 'D']);
	});

	it('moves the item up the array when ArrowUp is pressed', () => {
		press(items[2], 'Enter');
		press(items[2], 'ArrowUp');
		fixture.detectChanges();

		expect(host.items).toEqual(['A', 'C', 'B', 'D']);
	});

	it('sends the item to either end with Home and End', () => {
		press(items[0], ' ');
		press(items[0], 'End');
		fixture.detectChanges();
		expect(host.items).toEqual(['B', 'C', 'D', 'A']);

		press(items[0], 'Home');
		fixture.detectChanges();
		expect(host.items).toEqual(['A', 'B', 'C', 'D']);
	});

	it('does nothing at all until the item is grabbed', () => {
		press(items[0], 'ArrowDown');
		press(items[1], 'ArrowUp');
		fixture.detectChanges();

		expect(host.items).toEqual(['A', 'B', 'C', 'D']);
	});

	it('puts the item back where it started when Escape is pressed', () => {
		press(items[0], ' ');
		press(items[0], 'ArrowDown');
		press(items[0], 'ArrowDown');
		fixture.detectChanges();
		expect(host.items).toEqual(['B', 'C', 'A', 'D']);

		press(items[0], 'Escape');
		fixture.detectChanges();
		expect(host.items).toEqual(['A', 'B', 'C', 'D']);
	});

	it('stops responding to the arrows once the item is dropped', () => {
		press(items[0], ' ');
		press(items[0], 'ArrowDown');
		press(items[0], ' ');
		press(items[0], 'ArrowDown');
		fixture.detectChanges();

		expect(host.items).toEqual(['B', 'A', 'C', 'D']);
	});

	it('emits the same update output a pointer drop emits, with both indexes', () => {
		press(items[0], ' ');
		press(items[0], 'ArrowDown');

		expect(host.updates.length).toBe(1);
		expect(host.updates[0].oldIndex).toBe(0);
		expect(host.updates[0].newIndex).toBe(1);
		expect(host.updates[0].item).toBe(items[0]);
	});

	it('leaves the array alone in manual mode, and still reports the move', async () => {
		host.autoUpdate.set(false);
		await settle(fixture);

		press(items[0], ' ');
		press(items[0], 'ArrowDown');

		expect(host.items).toEqual(['A', 'B', 'C', 'D']);
		expect(host.updates.length).toBe(1);
		expect(host.updates[0].newIndex).toBe(1);
	});

	it('withdraws the tab stops and refuses to reorder while the list is disabled', async () => {
		host.disabled.set(true);
		await settle(fixture);

		expect(items[0].hasAttribute('tabindex')).toBe(false);

		press(items[0], ' ');
		press(items[0], 'ArrowDown');
		fixture.detectChanges();

		expect(host.items).toEqual(['A', 'B', 'C', 'D']);
	});
});

describe('hubSortable keyboard announcements', () => {
	let fixture: ComponentFixture<KeyboardHostComponent>;
	let items: HTMLElement[];

	beforeEach(async () => {
		await TestBed.configureTestingModule({ imports: [KeyboardHostComponent] }).compileComponents();
		fixture = TestBed.createComponent(KeyboardHostComponent);
		await settle(fixture);
		items = Array.from(fixture.nativeElement.querySelectorAll('.kb-item'));
	});

	it('speaks through a polite live region that is never seen', () => {
		press(items[0], ' ');

		const region = document.querySelector('[data-hub-sortable-live-region]')!;
		expect(region.getAttribute('aria-live')).toBe('polite');
		expect(region.getAttribute('role')).toBe('status');
		expect(region.getAttribute('style')).toContain('clip-path:inset(50%)');
	});

	it('says which item was picked up and how to move it', () => {
		press(items[0], ' ');

		expect(announcement()).toContain('Item 1 of 4 grabbed');
		expect(announcement()).toContain('Escape to cancel');
	});

	it('reports the new position after every move', () => {
		press(items[0], ' ');
		press(items[0], 'ArrowDown');
		expect(announcement()).toBe('Moved to position 2 of 4.');

		press(items[0], 'ArrowDown');
		expect(announcement()).toBe('Moved to position 3 of 4.');
	});

	it('reports where the item landed on drop, and where it returned to on cancel', () => {
		press(items[0], ' ');
		press(items[0], 'ArrowDown');
		press(items[0], ' ');
		expect(announcement()).toBe('Dropped at position 2 of 4.');

		press(items[0], ' ');
		press(items[0], 'ArrowDown');
		press(items[0], 'Escape');
		expect(announcement()).toBe('Move cancelled. Back at position 2 of 4.');
	});

	it('takes the live region away with the directive', () => {
		press(items[0], ' ');
		expect(document.querySelector('[data-hub-sortable-live-region]')).not.toBeNull();

		fixture.destroy();

		expect(document.querySelector('[data-hub-sortable-live-region]')).toBeNull();
	});
});

describe('hubSortable keyboard announcements, localised', () => {
	it('uses the sentences the application supplies and keeps the defaults for the rest', async () => {
		await TestBed.configureTestingModule({ imports: [KeyboardMessagesHostComponent] }).compileComponents();
		const fixture = TestBed.createComponent(KeyboardMessagesHostComponent);
		await settle(fixture);
		const items: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.kb-item'));

		press(items[0], ' ');
		expect(announcement()).toBe('agarrado 1 de 3');

		press(items[0], 'ArrowDown');
		expect(announcement()).toBe('movido a 2 de 3');

		press(items[0], ' ');
		expect(announcement()).toBe('Dropped at position 2 of 3.');
	});
});

describe('hubSortable keyboard reordering of a signal', () => {
	it('writes the reordered array back into the signal', async () => {
		await TestBed.configureTestingModule({ imports: [KeyboardSignalHostComponent] }).compileComponents();
		const fixture = TestBed.createComponent(KeyboardSignalHostComponent);
		await settle(fixture);
		const items: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.kb-item'));

		press(items[2], ' ');
		press(items[2], 'Home');
		fixture.detectChanges();

		expect(fixture.componentInstance.items()).toEqual(['C', 'A', 'B']);
	});
});

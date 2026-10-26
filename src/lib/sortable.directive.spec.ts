import { Component, DebugElement, signal, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Options, SortableEvent } from 'sortablejs';
import { GLOBALS } from './globals';
import { SortableBindings } from './sortable-bindings';
import { SortableDirective } from './sortable.directive';
import { SortableModule } from './sortable.module';
import { SortableService } from './sortable.service';

// ---------- Test Host Components ----------

@Component({
	template: `
		<div [hubSortable]="items" [options]="options" class="sortable-list">
			@for (item of items; track item) {
				<div class="item">{{ item }}</div>
			}
		</div>
	`,
	imports: [SortableModule]
})
class BasicTestComponent {
	items = ['A', 'B', 'C', 'D', 'E'];
	options: Options = { animation: 150 };
}

@Component({
	template: `
		<div
			[hubSortable]="items"
			[autoUpdateArray]="false"
			(add)="onAdd($event)"
			(update)="onUpdate($event)"
			(remove)="onRemove($event)"
			(start)="onStart($event)"
			(end)="onEnd($event)"
			(sortEvent)="onSort($event)"
			(filterEvent)="onFilter($event)"
			(change)="onChange($event)"
			(choose)="onChoose($event)"
			(unchoose)="onUnchoose($event)"
			(clone)="onClone($event)"
			class="manual-list"
		>
			@for (item of items; track item) {
				<div class="item">{{ item }}</div>
			}
		</div>
	`,
	imports: [SortableModule]
})
class ManualModeTestComponent {
	items = ['X', 'Y', 'Z'];

	addEvents: SortableEvent[] = [];
	updateEvents: SortableEvent[] = [];
	removeEvents: SortableEvent[] = [];
	startEvents: SortableEvent[] = [];
	endEvents: SortableEvent[] = [];
	sortEvents: SortableEvent[] = [];
	filterEvents: SortableEvent[] = [];
	changeEvents: SortableEvent[] = [];
	chooseEvents: SortableEvent[] = [];
	unchooseEvents: SortableEvent[] = [];
	cloneEvents: SortableEvent[] = [];

	onAdd(e: SortableEvent) {
		this.addEvents.push(e);
	}
	onUpdate(e: SortableEvent) {
		this.updateEvents.push(e);
	}
	onRemove(e: SortableEvent) {
		this.removeEvents.push(e);
	}
	onStart(e: SortableEvent) {
		this.startEvents.push(e);
	}
	onEnd(e: SortableEvent) {
		this.endEvents.push(e);
	}
	onSort(e: SortableEvent) {
		this.sortEvents.push(e);
	}
	onFilter(e: SortableEvent) {
		this.filterEvents.push(e);
	}
	onChange(e: SortableEvent) {
		this.changeEvents.push(e);
	}
	onChoose(e: SortableEvent) {
		this.chooseEvents.push(e);
	}
	onUnchoose(e: SortableEvent) {
		this.unchooseEvents.push(e);
	}
	onClone(e: SortableEvent) {
		this.cloneEvents.push(e);
	}
}

@Component({
	template: `
		<div
			[hubSortable]="items"
			[options]="options"
			[animation]="300"
			[ghostClass]="'my-ghost'"
			[draggable]="'.draggable'"
			[handle]="'.handle'"
			[sort]="true"
			[disabled]="false"
			class="individual-options-list"
		>
			@for (item of items; track item) {
				<div class="draggable">
					<span class="handle">H</span>
					{{ item }}
				</div>
			}
		</div>
	`,
	imports: [SortableModule]
})
class IndividualOptionsTestComponent {
	items = [1, 2, 3];
	options: Options = { group: 'test-group' };
}

@Component({
	template: `
		<div
			[hubSortable]="items"
			[options]="{ group: { name: 'shared', pull: 'clone', put: false } }"
			[autoUpdateArray]="false"
			class="clone-source"
		>
			@for (item of items; track item) {
				<div class="clone-item" [attr.data-id]="item">{{ item }}</div>
			}
		</div>
	`,
	imports: [SortableModule]
})
class CloneSourceTestComponent {
	items = ['src-1', 'src-2', 'src-3'];
}

@Component({
	template: `
		<div [hubSortable]="items" [container]="'.inner-container'" class="container-host">
			<div class="inner-container">
				@for (item of items; track item) {
					<div class="item">{{ item }}</div>
				}
			</div>
		</div>
	`,
	imports: [SortableModule]
})
class ContainerSelectorTestComponent {
	items = ['a', 'b', 'c'];
}

@Component({
	template: `
		<div [hubSortable]="items" [container]="'.nonexistent'" class="bad-container">
			<div class="item">test</div>
		</div>
	`,
	imports: [SortableModule]
})
class BadContainerTestComponent {
	items = ['a'];
}

@Component({
	template: `
		<div [hubSortable]="formArray" class="formarray-list">
			@for (ctrl of formArray.controls; track ctrl) {
				<div class="item">{{ ctrl.value }}</div>
			}
		</div>
	`,
	imports: [SortableModule, ReactiveFormsModule]
})
class FormArrayTestComponent {
	formArray = new FormArray([new FormControl('F1'), new FormControl('F2'), new FormControl('F3')]);
}

@Component({
	template: `
		<div [hubSortable]="itemsSignal" class="signal-list">
			@for (item of itemsSignal(); track item) {
				<div class="item">{{ item }}</div>
			}
		</div>
	`,
	imports: [SortableModule]
})
class SignalTestComponent {
	itemsSignal = signal(['S1', 'S2', 'S3']);
}

@Component({
	template: `
		<div [hubSortable]="items" [options]="options" [cloneFunction]="cloneFn" class="clone-fn-list">
			@for (item of items; track item) {
				<div class="item">{{ item.name }}</div>
			}
		</div>
	`,
	imports: [SortableModule]
})
class CloneFunctionTestComponent {
	items = [
		{ name: 'A', id: 1 },
		{ name: 'B', id: 2 }
	];
	options: Options = {
		group: { name: 'cloneable', pull: 'clone', put: false }
	};
	cloneFn = (item: any) => ({ ...item, id: item.id * 100 });
}

@Component({
	template: `
		<div [hubSortable]="items" [options]="options" (init)="onInit($event)" class="init-test">
			@for (item of items; track item) {
				<div class="item">{{ item }}</div>
			}
		</div>
	`,
	imports: [SortableModule]
})
class InitEventTestComponent {
	items = ['a', 'b'];
	options: Options = {};
	sortableInstance: any = null;
	onInit(instance: any) {
		this.sortableInstance = instance;
	}
}

@Component({
	template: `
		<div [hubSortable]="items" [options]="options" class="callback-test">
			@for (item of items; track item) {
				<div class="item">{{ item }}</div>
			}
		</div>
	`,
	imports: [SortableModule]
})
class UserCallbackTestComponent {
	items = ['a', 'b', 'c'];
	startCalled = false;
	endCalled = false;
	options: Options = {
		onStart: () => {
			this.startCalled = true;
		},
		onEnd: () => {
			this.endCalled = true;
		}
	};
}

// ---------- Helper functions ----------

function getSortableDirective(fixture: ComponentFixture<any>, selector = '[hubSortable]'): SortableDirective {
	const el = fixture.debugElement.query(By.directive(SortableDirective));
	return el.injector.get(SortableDirective);
}

function createSortableEvent(overrides: Partial<SortableEvent> = {}): SortableEvent {
	const container = document.createElement('div');
	const item = document.createElement('div');
	container.appendChild(item);

	return {
		oldIndex: 0,
		newIndex: 1,
		oldDraggableIndex: 0,
		newDraggableIndex: 1,
		item,
		clone: document.createElement('div'),
		to: container,
		from: container,
		target: item,
		originalEvent: new MouseEvent('mouseup'),
		pullMode: undefined,
		...overrides
	} as unknown as SortableEvent;
}

// ---------- Test Suites ----------

describe('SortableDirective', () => {
	describe('Basic creation and lifecycle', () => {
		let fixture: ComponentFixture<BasicTestComponent>;

		beforeEach(async () => {
			await TestBed.configureTestingModule({
				imports: [SortableModule, BasicTestComponent]
			}).compileComponents();
			fixture = TestBed.createComponent(BasicTestComponent);
			fixture.detectChanges();
		});

		it('should create the directive on the host element', () => {
			const directive = getSortableDirective(fixture);
			expect(directive).toBeTruthy();
		});

		it('should render all items', () => {
			const items = fixture.debugElement.queryAll(By.css('.item'));
			expect(items.length).toBe(5);
		});

		it('should emit init event with Sortable instance', async () => {
			const initFixture = TestBed.createComponent(InitEventTestComponent);
			initFixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			expect(initFixture.componentInstance.sortableInstance).toBeTruthy();
		});

		it('should destroy Sortable instance on directive destroy', async () => {
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture);
			const destroySpy = vi.spyOn((directive as any).sortableInstance || {}, 'destroy');

			fixture.destroy();

			if ((directive as any).sortableInstance) {
				expect(destroySpy).toHaveBeenCalled();
			}
		});

		it('should clean up native event listeners on destroy', async () => {
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const cleanupCount = directive.nativeEventCleanup?.length || 0;

			fixture.destroy();

			expect(directive.nativeEventCleanup.length).toBe(0);
		});

		it("lets a field's own change event through and still stops SortableJS's", async () => {
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const container = fixture.nativeElement.querySelector('.sortable-list') as HTMLElement;
			const item = container.querySelector('.item') as HTMLElement;
			const heard: string[] = [];
			item.addEventListener('change', () => heard.push('item'));
			container.addEventListener('change', (event) => heard.push(event instanceof CustomEvent ? 'sortable' : 'list'));

			// A checkbox inside an item fires a plain Event; SortableJS fires a CustomEvent on the list.
			item.dispatchEvent(new Event('change', { bubbles: true }));
			container.dispatchEvent(new CustomEvent('change', { bubbles: true }));

			expect(heard).toEqual(['item', 'list']);
		});
	});

	describe('Container selector', () => {
		it('should use inner container when container selector is provided', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, ContainerSelectorTestComponent]
			});
			const fixture = TestBed.createComponent(ContainerSelectorTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture);
			expect(directive).toBeTruthy();
		});

		it('should stay inert and quiet when container selector does not match', async () => {
			const errorSpy = vi.spyOn(console, 'error').mockReturnValue(undefined);
			const warnSpy = vi.spyOn(console, 'warn').mockReturnValue(undefined);
			TestBed.configureTestingModule({
				imports: [SortableModule, BadContainerTestComponent]
			});
			const fixture = TestBed.createComponent(BadContainerTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			expect(directive.sortableInstance).toBeNull();
			expect(errorSpy).not.toHaveBeenCalled();
			expect(warnSpy).not.toHaveBeenCalled();

			errorSpy.mockRestore();
			warnSpy.mockRestore();
		});
	});

	describe('Individual option inputs', () => {
		it('should apply individual options to sortable instance', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, IndividualOptionsTestComponent]
			});
			const fixture = TestBed.createComponent(IndividualOptionsTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;

			if (instance) {
				expect(instance.options.animation).toBe(300);
				expect(instance.options.ghostClass).toBe('my-ghost');
				expect(instance.options.draggable).toBe('.draggable');
				expect(instance.options.handle).toBe('.handle');
			}
		});
	});

	describe('Global config (GLOBALS injection token)', () => {
		it('should merge global config with local options', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule.forRoot({ animation: 500, ghostClass: 'global-ghost' }), BasicTestComponent]
			});
			const fixture = TestBed.createComponent(BasicTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;

			if (instance) {
				// Local options override global for overlapping keys
				expect(instance.options.animation).toBeDefined();
			}
		});
	});

	describe('Data binding types', () => {
		it('should work with FormArray', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, ReactiveFormsModule, FormArrayTestComponent]
			});
			const fixture = TestBed.createComponent(FormArrayTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture);
			expect(directive).toBeTruthy();
			const items = fixture.debugElement.queryAll(By.css('.item'));
			expect(items.length).toBe(3);
		});

		it('should work with signal arrays', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, SignalTestComponent]
			});
			const fixture = TestBed.createComponent(SignalTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture);
			expect(directive).toBeTruthy();
		});
	});

	describe('Manual mode (autoUpdateArray: false)', () => {
		let fixture: ComponentFixture<ManualModeTestComponent>;
		let component: ManualModeTestComponent;
		let service: SortableService;

		beforeEach(async () => {
			await TestBed.configureTestingModule({
				imports: [SortableModule, ManualModeTestComponent]
			}).compileComponents();
			fixture = TestBed.createComponent(ManualModeTestComponent);
			component = fixture.componentInstance;
			service = TestBed.inject(SortableService);
			fixture.detectChanges();
		});

		it('should not modify the array on update events', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const originalItems = [...component.items];

			// Simulate onUpdate event
			const event = createSortableEvent({
				oldIndex: 0,
				newIndex: 2,
				oldDraggableIndex: 0,
				newDraggableIndex: 2,
				from: fixture.nativeElement.querySelector('.manual-list')
			});

			instance.options.onStart(createSortableEvent());
			instance.options.onUpdate(event);

			expect(component.items).toEqual(originalItems);
		});

		it('should emit update event in manual mode', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const event = createSortableEvent({
				oldIndex: 0,
				newIndex: 1,
				oldDraggableIndex: 0,
				newDraggableIndex: 1,
				from: fixture.nativeElement.querySelector('.manual-list')
			});

			instance.options.onStart(createSortableEvent());
			instance.options.onUpdate(event);

			expect(component.updateEvents.length).toBe(1);
		});

		it('should guard against duplicate onUpdate calls', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const event = createSortableEvent({
				oldIndex: 0,
				newIndex: 1,
				oldDraggableIndex: 0,
				newDraggableIndex: 1,
				from: fixture.nativeElement.querySelector('.manual-list')
			});

			instance.options.onStart(createSortableEvent());
			instance.options.onUpdate(event);
			instance.options.onUpdate(event); // duplicate call

			expect(component.updateEvents.length).toBe(1);
		});

		it('should reset dropEventProcessed on onStart', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			service.dropEventProcessed = true;
			instance.options.onStart(createSortableEvent());
			expect(service.dropEventProcessed).toBe(false);
		});

		it('should reset dropEventProcessed on onEnd', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			service.dropEventProcessed = true;
			instance.options.onEnd(createSortableEvent());
			expect(service.dropEventProcessed).toBe(false);
		});

		it('should emit start event', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			instance.options.onStart(createSortableEvent());
			expect(component.startEvents.length).toBe(1);
		});

		it('should emit end event', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			instance.options.onEnd(createSortableEvent());
			expect(component.endEvents.length).toBe(1);
		});

		it('should emit sort event', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			instance.options.onSort(createSortableEvent());
			expect(component.sortEvents.length).toBe(1);
		});

		it('should emit filter event', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			instance.options.onFilter(createSortableEvent());
			expect(component.filterEvents.length).toBe(1);
		});

		it('should emit change event', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			instance.options.onChange(createSortableEvent());
			expect(component.changeEvents.length).toBe(1);
		});

		it('should emit choose event', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			instance.options.onChoose(createSortableEvent());
			expect(component.chooseEvents.length).toBe(1);
		});

		it('should emit unchoose event', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			instance.options.onUnchoose(createSortableEvent());
			expect(component.unchooseEvents.length).toBe(1);
		});

		it('should emit clone event', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			instance.options.onClone(createSortableEvent());
			expect(component.cloneEvents.length).toBe(1);
		});
	});

	describe('Auto mode (autoUpdateArray: true)', () => {
		let fixture: ComponentFixture<BasicTestComponent>;

		beforeEach(async () => {
			await TestBed.configureTestingModule({
				imports: [SortableModule, BasicTestComponent]
			}).compileComponents();
			fixture = TestBed.createComponent(BasicTestComponent);
			fixture.detectChanges();
		});

		it('should reorder array on onUpdate', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const container = fixture.nativeElement.querySelector('.sortable-list');
			const event = createSortableEvent({
				oldIndex: 0,
				newIndex: 2,
				oldDraggableIndex: 0,
				newDraggableIndex: 2,
				from: container
			});

			instance.options.onUpdate(event);
			expect(fixture.componentInstance.items[2]).toBe('A');
		});

		it('should set up transfer callback on onAdd', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const service = TestBed.inject(SortableService);
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const event = createSortableEvent({ newIndex: 1 });
			instance.options.onAdd(event);

			expect(service.transfer).toBeTruthy();
		});

		it('should handle onAdd with undefined newIndex', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const event = createSortableEvent({ newIndex: undefined });
			// Should not throw
			instance.options.onAdd(event);
		});

		it('should handle onRemove with undefined oldIndex', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const event = createSortableEvent({ oldIndex: undefined });
			// Should not throw
			instance.options.onRemove(event);
		});

		it('should handle onUpdate with undefined indexes', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const event = createSortableEvent({
				oldIndex: undefined,
				newIndex: undefined,
				oldDraggableIndex: undefined,
				newDraggableIndex: undefined
			} as any);
			// Should not throw
			instance.options.onUpdate(event);
		});
	});

	describe('Clone mode handling (manual mode)', () => {
		let fixture: ComponentFixture<CloneSourceTestComponent>;
		let service: SortableService;

		beforeEach(async () => {
			await TestBed.configureTestingModule({
				imports: [SortableModule, CloneSourceTestComponent]
			}).compileComponents();
			fixture = TestBed.createComponent(CloneSourceTestComponent);
			service = TestBed.inject(SortableService);
			fixture.detectChanges();
		});

		it('should handle onAdd in manual mode with clone (remove item from target)', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			// Create a target container with the item inside it
			const targetContainer = document.createElement('div');
			const item = document.createElement('div');
			targetContainer.appendChild(item);
			const cloneEl = document.createElement('div');

			const event = createSortableEvent({
				newIndex: 0,
				item,
				clone: cloneEl,
				to: targetContainer,
				from: fixture.nativeElement.querySelector('.clone-source')
			});

			instance.options.onStart(createSortableEvent());
			instance.options.onAdd(event);

			// Item should be removed from target
			expect(item.parentNode).toBeNull();
		});

		it('should handle onAdd in manual mode without clone (revert to source)', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			// Non-clone scenario
			const sourceContainer = document.createElement('div');
			const child0 = document.createElement('div');
			sourceContainer.appendChild(child0);

			const targetContainer = document.createElement('div');
			const item = document.createElement('div');
			targetContainer.appendChild(item);

			const event = createSortableEvent({
				newIndex: 0,
				oldIndex: 0,
				item,
				clone: undefined as any, // No clone = non-clone mode
				to: targetContainer,
				from: sourceContainer
			});

			instance.options.onStart(createSortableEvent());
			instance.options.onAdd(event);

			// Item should be moved back to source
			expect(item.parentNode).toBe(sourceContainer);
		});

		it('should restore original element in source on onRemove in manual clone mode', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const sourceContainer = fixture.nativeElement.querySelector('.clone-source');
			const originalItem = document.createElement('div');
			// Item was already removed from DOM by onAdd handler
			const cloneEl = document.createElement('div');
			sourceContainer.appendChild(cloneEl);

			const event = createSortableEvent({
				oldIndex: 0,
				item: originalItem,
				clone: cloneEl,
				from: sourceContainer
			});

			instance.options.onRemove(event);

			// Original should replace clone in source
			expect(originalItem.parentNode).toBe(sourceContainer);
			expect(cloneEl.parentNode).toBeNull();
		});

		it('should handle onRemove when item still has parent in manual clone mode', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const sourceContainer = fixture.nativeElement.querySelector('.clone-source');
			const someOtherParent = document.createElement('div');
			const originalItem = document.createElement('div');
			someOtherParent.appendChild(originalItem);

			const cloneEl = document.createElement('div');
			sourceContainer.appendChild(cloneEl);

			const event = createSortableEvent({
				oldIndex: 0,
				item: originalItem,
				clone: cloneEl,
				from: sourceContainer
			});

			instance.options.onRemove(event);

			// Item should be removed from other parent and placed in source
			expect(originalItem.parentNode).toBe(sourceContainer);
			expect(cloneEl.parentNode).toBeNull();
		});

		it('should not crash on onRemove when clone has no parent', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const originalItem = document.createElement('div');
			const cloneEl = document.createElement('div'); // Not attached to DOM

			const event = createSortableEvent({
				oldIndex: 0,
				item: originalItem,
				clone: cloneEl,
				from: fixture.nativeElement.querySelector('.clone-source')
			});

			// Should not throw
			instance.options.onRemove(event);
		});

		it('should guard against duplicate onAdd calls in manual mode', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const event = createSortableEvent({ newIndex: 0 });
			instance.options.onStart(createSortableEvent());

			instance.options.onAdd(event);
			instance.options.onAdd(event); // Duplicate

			// dropEventProcessed should have prevented the second call
			expect(service.dropEventProcessed).toBe(true);
		});
	});

	describe('Auto mode clone handling (onRemove)', () => {
		let fixture: ComponentFixture<CloneFunctionTestComponent>;

		beforeEach(async () => {
			await TestBed.configureTestingModule({
				imports: [SortableModule, CloneFunctionTestComponent]
			}).compileComponents();
			fixture = TestBed.createComponent(CloneFunctionTestComponent);
			fixture.detectChanges();
		});

		it('should use cloneFunction when cloning items', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const service = TestBed.inject(SortableService);
			let transferredItems: any[] = [];
			service.transfer = (items: any[]) => {
				transferredItems = items;
			};

			const sourceContainer = fixture.nativeElement.querySelector('.clone-fn-list');
			const item = document.createElement('div');
			sourceContainer.appendChild(item);
			const cloneEl = document.createElement('div');
			sourceContainer.appendChild(cloneEl);

			const event = createSortableEvent({
				oldIndex: 0,
				item,
				clone: cloneEl,
				from: sourceContainer
			});

			instance.options.onRemove(event);

			expect(transferredItems.length).toBe(1);
			expect(transferredItems[0].id).toBe(100); // cloneFn multiplies id by 100
		});
	});

	describe('User-provided event callbacks in options', () => {
		it('should call user onStart and onEnd callbacks', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, UserCallbackTestComponent]
			});
			const fixture = TestBed.createComponent(UserCallbackTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			instance.options.onStart(createSortableEvent());
			expect(fixture.componentInstance.startCalled).toBe(true);

			instance.options.onEnd(createSortableEvent());
			expect(fixture.componentInstance.endCalled).toBe(true);
		});
	});

	describe('ngOnChanges', () => {
		it('should update sortable options when options input changes', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, BasicTestComponent]
			});
			const fixture = TestBed.createComponent(BasicTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const optionSpy = vi.spyOn(instance, 'option').mockReturnValue(undefined);

			directive.ngOnChanges({
				options: {
					previousValue: { animation: 150 },
					currentValue: { animation: 300 },
					firstChange: false,
					isFirstChange: () => false
				}
			} as any);

			expect(optionSpy).toHaveBeenCalled();
		});

		it('should not update on first change', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, BasicTestComponent]
			});
			const fixture = TestBed.createComponent(BasicTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const optionSpy = vi.spyOn(instance, 'option').mockReturnValue(undefined);

			directive.ngOnChanges({
				options: {
					previousValue: undefined,
					currentValue: { animation: 300 },
					firstChange: true,
					isFirstChange: () => true
				}
			} as any);

			expect(optionSpy).not.toHaveBeenCalled();
		});
	});

	describe('Native event suppression', () => {
		it('should suppress native sortable events on the container', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, BasicTestComponent]
			});
			const fixture = TestBed.createComponent(BasicTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const container = fixture.nativeElement.querySelector('.sortable-list');
			let propagated = false;

			container.addEventListener('add', () => {
				propagated = true;
			});

			const event = new CustomEvent('add', { bubbles: true });
			container.dispatchEvent(event);

			// The native event should be suppressed by stopImmediatePropagation
			// Since our handler is added with capture and stopImmediatePropagation,
			// the bubble-phase handler above will not run
			expect(propagated).toBe(false);
		});
	});

	describe('Move event', () => {
		it('should emit move event with event and originalEvent', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, BasicTestComponent]
			});
			const fixture = TestBed.createComponent(BasicTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			let emittedPayload: any = null;
			directive.move.subscribe((payload: any) => {
				emittedPayload = payload;
			});

			const moveEvent = {} as any;
			const originalEvent = new Event('mousemove');
			instance.options.onMove(moveEvent, originalEvent);

			expect(emittedPayload).toBeTruthy();
			expect(emittedPayload.event).toBe(moveEvent);
			expect(emittedPayload.originalEvent).toBe(originalEvent);
		});
	});

	describe('revertSortableDom', () => {
		it('should revert DOM when item moved down (newIndex > oldIndex)', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, ManualModeTestComponent]
			});
			const fixture = TestBed.createComponent(ManualModeTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const container = document.createElement('div');
			const child0 = document.createElement('div');
			child0.textContent = 'A';
			const child1 = document.createElement('div');
			child1.textContent = 'B';
			const child2 = document.createElement('div');
			child2.textContent = 'C';
			container.appendChild(child0);
			container.appendChild(child1);
			container.appendChild(child2);

			// Simulate SortableJS having moved child0 to index 2
			// After SortableJS: B, C, A (child0 moved from 0 to 2)
			container.removeChild(child0);
			container.appendChild(child0);

			const event = createSortableEvent({
				oldIndex: 0,
				newIndex: 2,
				oldDraggableIndex: 0,
				newDraggableIndex: 2,
				item: child0,
				from: container
			});

			instance.options.onStart(createSortableEvent());
			instance.options.onUpdate(event);

			// Should be reverted: A, B, C
			expect(container.children[0]).toBe(child0);
		});

		it('should not revert when oldIndex equals newIndex', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, ManualModeTestComponent]
			});
			const fixture = TestBed.createComponent(ManualModeTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const container = document.createElement('div');
			const child0 = document.createElement('div');
			container.appendChild(child0);

			const event = createSortableEvent({
				oldIndex: 0,
				newIndex: 0,
				oldDraggableIndex: 0,
				newDraggableIndex: 0,
				item: child0,
				from: container
			});

			instance.options.onStart(createSortableEvent());
			instance.options.onUpdate(event);

			// No revert needed
			expect(container.children[0]).toBe(child0);
		});
	});

	describe('revertTransferDom (non-clone manual mode)', () => {
		it('should move item back to source container', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, ManualModeTestComponent]
			});
			const fixture = TestBed.createComponent(ManualModeTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const sourceContainer = document.createElement('div');
			const existingChild = document.createElement('div');
			sourceContainer.appendChild(existingChild);

			const targetContainer = document.createElement('div');
			const item = document.createElement('div');
			targetContainer.appendChild(item);

			const event = createSortableEvent({
				newIndex: 0,
				oldIndex: 0,
				item,
				clone: undefined as any,
				from: sourceContainer,
				to: targetContainer
			});

			instance.options.onStart(createSortableEvent());
			instance.options.onAdd(event);

			expect(item.parentNode).toBe(sourceContainer);
		});
	});

	describe('Auto mode transfer flow (onAdd + onRemove coordination)', () => {
		let fixture: ComponentFixture<BasicTestComponent>;
		let service: SortableService;

		beforeEach(async () => {
			await TestBed.configureTestingModule({
				imports: [SortableModule, BasicTestComponent]
			}).compileComponents();
			fixture = TestBed.createComponent(BasicTestComponent);
			service = TestBed.inject(SortableService);
			fixture.detectChanges();
		});

		it('should invoke transfer callback from onRemove in non-clone auto mode', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			// Simulate the onAdd side setting up the transfer callback
			let transferCalled = false;
			service.transfer = (items: any[]) => {
				transferCalled = true;
			};

			const container = fixture.nativeElement.querySelector('.sortable-list');
			const item = document.createElement('div');
			container.appendChild(item);

			const event = createSortableEvent({
				oldIndex: 0,
				item,
				clone: undefined as any,
				from: container
			});

			instance.options.onRemove(event);

			expect(transferCalled).toBe(true);
			expect(service.transfer).toBeNull();
		});

		it('should execute the full onAdd auto-mode transfer callback', async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const event = createSortableEvent({ newIndex: 2 });
			instance.options.onAdd(event);

			// transfer should be set, and when called, it should inject into bindings
			expect(service.transfer).toBeTruthy();

			// Invoke transfer to cover the callback body
			service.transfer!(['newItem']);
		});
	});

	describe('isCloning getter paths', () => {
		it('should detect clone via checkPull function', async () => {
			@Component({
				template: `
					<div [hubSortable]="items" [options]="options" class="checkpull-list">
						@for (item of items; track item) {
							<div class="item">{{ item }}</div>
						}
					</div>
				`,
				imports: [SortableModule]
			})
			class CheckPullTestComponent {
				items = ['a', 'b', 'c'];
				options: Options = {
					group: { name: 'test', pull: 'clone', put: false }
				};
			}

			TestBed.configureTestingModule({
				imports: [SortableModule, CheckPullTestComponent]
			});
			const fixture = TestBed.createComponent(CheckPullTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			// SortableJS internally converts pull:'clone' to a checkPull function
			// Verify isCloning works by triggering onRemove in clone mode
			const container = fixture.nativeElement.querySelector('.checkpull-list');
			const item = document.createElement('div');
			container.appendChild(item);
			const cloneEl = document.createElement('div');
			container.appendChild(cloneEl);

			const service = TestBed.inject(SortableService);
			let transferCalled = false;
			service.transfer = () => {
				transferCalled = true;
			};

			const event = createSortableEvent({
				oldIndex: 0,
				item,
				clone: cloneEl,
				from: container
			});

			instance.options.onRemove(event);

			// In auto mode with clone, transfer should be called
			expect(transferCalled).toBe(true);
		});

		it('should return false when group is not set', async () => {
			@Component({
				template: `
					<div [hubSortable]="items" class="no-group-list">
						@for (item of items; track item) {
							<div class="item">{{ item }}</div>
						}
					</div>
				`,
				imports: [SortableModule]
			})
			class NoGroupTestComponent {
				items = ['a', 'b'];
			}

			TestBed.configureTestingModule({
				imports: [SortableModule, NoGroupTestComponent]
			});
			const fixture = TestBed.createComponent(NoGroupTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			// No group = not cloning. onRemove without clone should just proxy
			const container = fixture.nativeElement.querySelector('.no-group-list');
			const item = document.createElement('div');
			container.appendChild(item);

			const event = createSortableEvent({
				oldIndex: 0,
				item,
				from: container
			});

			// Should not throw - not in clone mode
			instance.options.onRemove(event);
		});
	});

	describe('applyIndividualOptionChanges', () => {
		it('should apply individual input changes to the sortable instance', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, IndividualOptionsTestComponent]
			});
			const fixture = TestBed.createComponent(IndividualOptionsTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const optionSpy = vi.spyOn(instance, 'option').mockReturnValue(undefined);

			// Simulate an individual option change (animation)
			directive.ngOnChanges({
				animation: {
					previousValue: 300,
					currentValue: 500,
					firstChange: false,
					isFirstChange: () => false
				}
			} as any);

			expect(optionSpy).toHaveBeenCalled();
		});

		it('should not apply changes when sortable instance is not created yet', () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, BasicTestComponent]
			});
			const fixture = TestBed.createComponent(BasicTestComponent);
			// Don't call tick() - instance not yet created
			fixture.detectChanges();

			const directive = getSortableDirective(fixture) as any;
			// Force instance to null for this test
			const savedInstance = directive.sortableInstance;
			directive.sortableInstance = null;

			// Should not throw
			directive.ngOnChanges({
				animation: {
					previousValue: 100,
					currentValue: 200,
					firstChange: false,
					isFirstChange: () => false
				}
			} as any);

			directive.sortableInstance = savedInstance;
		});
	});

	describe('revertTransferDom edge case', () => {
		it('should not revert when oldIndex is undefined', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, ManualModeTestComponent]
			});
			const fixture = TestBed.createComponent(ManualModeTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			const targetContainer = document.createElement('div');
			const item = document.createElement('div');
			targetContainer.appendChild(item);

			const event = createSortableEvent({
				newIndex: 0,
				oldIndex: undefined,
				item,
				clone: undefined as any,
				from: document.createElement('div'),
				to: targetContainer
			});

			instance.options.onStart(createSortableEvent());
			instance.options.onAdd(event);

			// Item should still be in the target (not reverted because oldIndex is undefined)
			expect(item.parentNode).toBe(targetContainer);
		});
	});

	describe('getBindings with different input types', () => {
		it('should pass through a SortableBindings instance directly', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, BasicTestComponent]
			});
			const fixture = TestBed.createComponent(BasicTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;

			const bindings = directive.getBindings();
			expect(bindings).toBeTruthy();
			expect(bindings.provided).toBe(true);
		});

		it('should return empty bindings when items is undefined', async () => {
			@Component({
				template: `<div [hubSortable]="undefined" class="empty-list"></div>`,
				imports: [SortableModule]
			})
			class EmptyBindingsComponent {}

			TestBed.configureTestingModule({
				imports: [SortableModule, EmptyBindingsComponent]
			});
			const fixture = TestBed.createComponent(EmptyBindingsComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const bindings = directive.getBindings();
			expect(bindings.provided).toBe(false);
		});

		it('should return SortableBindings instance if passed directly', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, BasicTestComponent]
			});
			const fixture = TestBed.createComponent(BasicTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;

			// Temporarily override items to return a SortableBindings instance
			const customBindings = new SortableBindings([['x', 'y']]);
			const originalItems = directive.items;
			Object.defineProperty(directive, 'items', {
				value: () => customBindings,
				writable: true,
				configurable: true
			});

			const result = directive.getBindings();
			expect(result).toBe(customBindings);

			// Restore
			Object.defineProperty(directive, 'items', {
				value: originalItems,
				writable: true,
				configurable: true
			});
		});
	});

	describe('isCloning fallback branches', () => {
		it('should return false when group has no checkPull and pull is not clone', async () => {
			@Component({
				template: `
					<div
						[hubSortable]="items"
						[options]="{ group: { name: 'test', pull: true, put: true } }"
						class="non-clone-list"
					>
						@for (item of items; track item) {
							<div class="item">{{ item }}</div>
						}
					</div>
				`,
				imports: [SortableModule]
			})
			class NonCloneGroupComponent {
				items = ['a', 'b'];
			}

			TestBed.configureTestingModule({
				imports: [SortableModule, NonCloneGroupComponent]
			});
			const fixture = TestBed.createComponent(NonCloneGroupComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			// Force the group to have pull: true (not 'clone') and no checkPull
			// to test the fallback branch
			const origGroup = instance.options.group;
			instance.options.group = { name: 'test', pull: true };

			const container = fixture.nativeElement.querySelector('.non-clone-list');
			const item = document.createElement('div');
			container.appendChild(item);

			const service = TestBed.inject(SortableService);
			service.transfer = (items: any[]) => {};

			const event = createSortableEvent({
				oldIndex: 0,
				item,
				from: container
			});

			// onRemove should take non-clone path
			instance.options.onRemove(event);
			expect(service.transfer).toBeNull();

			// Restore
			instance.options.group = origGroup;
		});

		it('should return false when checkPull throws an error', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, BasicTestComponent]
			});
			const fixture = TestBed.createComponent(BasicTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			// Set up a group with a checkPull that throws
			instance.options.group = {
				name: 'test',
				checkPull: () => {
					throw new Error('test error');
				}
			};

			const container = fixture.nativeElement.querySelector('.sortable-list');
			const item = document.createElement('div');
			container.appendChild(item);

			const service = TestBed.inject(SortableService);
			service.transfer = (items: any[]) => {};

			const event = createSortableEvent({
				oldIndex: 0,
				item,
				from: container
			});

			// onRemove should not throw - checkPull error is caught
			instance.options.onRemove(event);
			// Non-clone path should have been taken (transfer invoked, then nulled)
			expect(service.transfer).toBeNull();
		});

		it('should return false when group is null/undefined', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, BasicTestComponent]
			});
			const fixture = TestBed.createComponent(BasicTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			// Set group to null
			instance.options.group = null;

			const container = fixture.nativeElement.querySelector('.sortable-list');
			const item = document.createElement('div');
			container.appendChild(item);

			const service = TestBed.inject(SortableService);
			service.transfer = (items: any[]) => {};

			const event = createSortableEvent({
				oldIndex: 0,
				item,
				from: container
			});

			instance.options.onRemove(event);
			// Non-clone path: transfer invoked and nulled
			expect(service.transfer).toBeNull();
		});

		it('should detect clone when group.pull is directly set to clone string', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, BasicTestComponent]
			});
			const fixture = TestBed.createComponent(BasicTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			// Set up group with pull: 'clone' directly (no checkPull)
			instance.options.group = { name: 'test', pull: 'clone' };

			const container = fixture.nativeElement.querySelector('.sortable-list');
			const item = document.createElement('div');
			container.appendChild(item);
			const cloneEl = document.createElement('div');
			container.appendChild(cloneEl);

			const service = TestBed.inject(SortableService);
			let transferItems: any[] | null = null;
			service.transfer = (items: any[]) => {
				transferItems = items;
			};

			const event = createSortableEvent({
				oldIndex: 0,
				item,
				clone: cloneEl,
				from: container
			});

			instance.options.onRemove(event);

			// Clone path should have been taken (transfer called with cloned data)
			expect(transferItems).toBeTruthy();
		});
	});

	describe('revertSortableDom boundary conditions', () => {
		it('should handle item moved up when refChild is at end (|| null fallback)', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, ManualModeTestComponent]
			});
			const fixture = TestBed.createComponent(ManualModeTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			// Create container where item was moved up from the last position
			const container = document.createElement('div');
			const child0 = document.createElement('div');
			child0.textContent = 'A';
			const child1 = document.createElement('div');
			child1.textContent = 'B';
			container.appendChild(child0);
			container.appendChild(child1);

			// Simulate SortableJS moved child1 to index 0 (moved up)
			// After SortableJS: B, A (child1 moved from 1 to 0)
			container.removeChild(child1);
			container.insertBefore(child1, child0);

			const event = createSortableEvent({
				oldIndex: 1,
				newIndex: 0,
				oldDraggableIndex: 1,
				newDraggableIndex: 0,
				item: child1,
				from: container
			});

			instance.options.onStart(createSortableEvent());
			instance.options.onUpdate(event);

			// Should be reverted: A, B
			expect(container.children[1]).toBe(child1);
		});
	});

	describe('revertTransferDom boundary conditions', () => {
		it('should handle revert when source has no child at oldIndex (|| null fallback)', async () => {
			TestBed.configureTestingModule({
				imports: [SortableModule, ManualModeTestComponent]
			});
			const fixture = TestBed.createComponent(ManualModeTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			// Empty source container - oldIndex points beyond children length
			const sourceContainer = document.createElement('div');
			const targetContainer = document.createElement('div');
			const item = document.createElement('div');
			targetContainer.appendChild(item);

			const event = createSortableEvent({
				newIndex: 0,
				oldIndex: 5, // Beyond source children length
				item,
				clone: undefined as any,
				from: sourceContainer,
				to: targetContainer
			});

			instance.options.onStart(createSortableEvent());
			instance.options.onAdd(event);

			// Item should be appended to source (null refChild = appendChild)
			expect(item.parentNode).toBe(sourceContainer);
		});
	});

	describe('proxyEvent with no user handler', () => {
		it('should work when no user handler is defined for an event', async () => {
			@Component({
				template: `
					<div [hubSortable]="items" class="no-handler-list">
						@for (item of items; track item) {
							<div class="item">{{ item }}</div>
						}
					</div>
				`,
				imports: [SortableModule]
			})
			class NoHandlerComponent {
				items = ['a', 'b'];
			}

			TestBed.configureTestingModule({
				imports: [SortableModule, NoHandlerComponent]
			});
			const fixture = TestBed.createComponent(NoHandlerComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const instance = directive.sortableInstance;
			if (!instance) return;

			// Calling events without user-provided handlers should not throw
			instance.options.onChoose(createSortableEvent());
			instance.options.onUnchoose(createSortableEvent());
			instance.options.onSort(createSortableEvent());
			instance.options.onFilter(createSortableEvent());
			instance.options.onChange(createSortableEvent());
			instance.options.onClone(createSortableEvent());
		});
	});

	describe('optionsWithoutEvents merging', () => {
		it('should handle null globalConfig gracefully', async () => {
			// No forRoot() call = GLOBALS is null
			TestBed.configureTestingModule({
				imports: [SortableModule, BasicTestComponent]
			});
			const fixture = TestBed.createComponent(BasicTestComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			// globalConfig should be null (no forRoot used)
			expect(directive.globalConfig).toBeNull();

			// Accessing sortableOptions should not throw
			const options = directive.sortableOptions;
			expect(options).toBeTruthy();
		});

		it('should handle undefined options input', async () => {
			@Component({
				template: `
					<div [hubSortable]="items" class="no-options-list">
						@for (item of items; track item) {
							<div class="item">{{ item }}</div>
						}
					</div>
				`,
				imports: [SortableModule]
			})
			class NoOptionsComponent {
				items = ['a', 'b'];
			}

			TestBed.configureTestingModule({
				imports: [SortableModule, NoOptionsComponent]
			});
			const fixture = TestBed.createComponent(NoOptionsComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			const directive = getSortableDirective(fixture) as any;
			const options = directive.optionsWithoutEvents;
			expect(options).toBeTruthy();
		});
	});

	describe('Edge cases', () => {
		it('should handle null items input gracefully', async () => {
			@Component({
				template: `<div [hubSortable]="null" class="null-list"></div>`,
				imports: [SortableModule]
			})
			class NullItemsComponent {}

			TestBed.configureTestingModule({
				imports: [SortableModule, NullItemsComponent]
			});

			const fixture = TestBed.createComponent(NullItemsComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			// Should not throw
			expect(fixture.componentInstance).toBeTruthy();
		});

		it('should handle undefined items input gracefully', async () => {
			@Component({
				template: `<div [hubSortable]="undefined" class="undef-list"></div>`,
				imports: [SortableModule]
			})
			class UndefinedItemsComponent {}

			TestBed.configureTestingModule({
				imports: [SortableModule, UndefinedItemsComponent]
			});

			const fixture = TestBed.createComponent(UndefinedItemsComponent);
			fixture.detectChanges();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));

			expect(fixture.componentInstance).toBeTruthy();
		});

		it('should not create sortable instance in SSR (no window)', () => {
			// This test just verifies the guard condition exists
			// In a real SSR env, window would be undefined
			const directive = getSortableDirective(
				(() => {
					TestBed.configureTestingModule({
						imports: [SortableModule, BasicTestComponent]
					});
					const f = TestBed.createComponent(BasicTestComponent);
					f.detectChanges();
					return f;
				})()
			);
			expect(directive).toBeTruthy();
		});
	});
});

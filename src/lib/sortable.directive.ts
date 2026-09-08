import {
	afterNextRender,
	computed,
	Directive,
	ElementRef,
	inject,
	Injector,
	input,
	NgZone,
	OnChanges,
	OnDestroy,
	OnInit,
	output,
	Renderer2,
	SimpleChange
} from '@angular/core';
import Sortable, { MoveEvent, Options, SortableEvent } from 'sortablejs';
import { GLOBALS } from './globals';
import { SortableBindings } from './sortable-bindings';
import {
	DEFAULT_SORTABLE_KEYBOARD_MESSAGES,
	SortableKeyboardController,
	SortableKeyboardMessages,
	SortableKeyboardReorder
} from './sortable-keyboard';
import { INDIVIDUAL_OPTION_INPUTS } from './sortable-options';
import { getIndexesFromEvent } from './sortable-utils';
import { SortableService } from './sortable.service';
import { SortableData, SortableEventName, SortableMoveEventPayload } from './sortable.types';

/**
 * Directive that integrates SortableJS with Angular.
 * Provides drag-and-drop sorting functionality with full support for Angular's reactive patterns.
 *
 * @example
 * ```html
 * <div [hubSortable]="items" (update)="onUpdate($event)">@for (item of items; track item) {
 *   <div>{{ item }}</div>
 * }</div>
 * ```
 *
 * @example
 * ```html
 * <div [hubSortable]="items"
 *      [options]="{ animation: 150, group: 'shared' }"
 *      (start)="onDragStart($event)"
 *      (end)="onDragEnd($event)">@for (item of items; track item) {
 *   <div>{{ item }}</div>
 * }</div>
 * ```
 */
@Directive({
	selector: '[hubSortable]',
	standalone: true
})
export class SortableDirective implements OnInit, OnChanges, OnDestroy {
	private globalConfig = inject(GLOBALS, { optional: true });
	private service = inject(SortableService);
	private element = inject(ElementRef);
	private zone = inject(NgZone);
	private renderer = inject(Renderer2);
	private injector = inject(Injector);

	/**
	 * The list to reorder: a plain array, a writable signal holding one, or a `FormArray`.
	 * A `SortableBindings` instance is also accepted, to keep several parallel lists in step
	 * through a single drag.
	 */
	readonly items = input<SortableData<any> | SortableBindings | null | undefined>(undefined, {
		alias: 'hubSortable'
	});

	/**
	 * CSS selector for the container element within the host element.
	 * If not provided, the host element itself will be used.
	 */
	readonly container = input<string | undefined>(undefined);

	/**
	 * SortableJS options object.
	 * See https://github.com/SortableJS/Sortable#options for available options.
	 */
	readonly options = input<Options | undefined>(undefined);

	/** Group name or group options for dragging between lists */
	readonly group = input<Options['group'] | undefined>(undefined);
	/** Enable/disable sorting within the list */
	readonly sort = input<Options['sort'] | undefined>(undefined);
	/** Time in milliseconds to define when the sorting should start */
	readonly delay = input<Options['delay'] | undefined>(undefined);
	/** Disable the sortable if set to true */
	readonly disabled = input<Options['disabled'] | undefined>(undefined);
	/** CSS selector for draggable items within the container */
	readonly draggable = input<Options['draggable'] | undefined>(undefined);
	/** CSS selector for drag handle within list items */
	readonly handle = input<Options['handle'] | undefined>(undefined);
	/** Animation speed in milliseconds when sorting */
	readonly animation = input<Options['animation'] | undefined>(undefined);
	/** CSS class applied to the ghost element during drag */
	readonly ghostClass = input<Options['ghostClass'] | undefined>(undefined);
	/** CSS class applied to the chosen element */
	readonly chosenClass = input<Options['chosenClass'] | undefined>(undefined);
	/** CSS class applied to the dragging element */
	readonly dragClass = input<Options['dragClass'] | undefined>(undefined);
	/** Append ghost element to document body */
	readonly fallbackOnBody = input<Options['fallbackOnBody'] | undefined>(undefined);
	/** Number of pixels a point should move before triggering drag */
	readonly fallbackTolerance = input<Options['fallbackTolerance'] | undefined>(undefined);
	/** CSS class applied when using forceFallback */
	readonly fallbackClass = input<Options['fallbackClass'] | undefined>(undefined);
	/** Fallback offset */
	readonly fallbackOffset = input<Options['fallbackOffset'] | undefined>(undefined);
	/** Force the fallback to activate */
	readonly forceFallback = input<Options['forceFallback'] | undefined>(undefined);
	/** CSS selector or function to filter items that should not be draggable */
	readonly filter = input<Options['filter'] | undefined>(undefined);
	/** Call preventDefault on filter event */
	readonly preventOnFilter = input<Options['preventOnFilter'] | undefined>(undefined);
	/** Direction of Sortable (will be detected automatically if not given) */
	readonly direction = input<Options['direction'] | undefined>(undefined);
	/** Threshold of swap zone */
	readonly swapThreshold = input<Options['swapThreshold'] | undefined>(undefined);
	/** Inverts swap threshold direction */
	readonly invertSwap = input<Options['invertSwap'] | undefined>(undefined);
	/** Threshold when swapping direction is inverted */
	readonly invertedSwapThreshold = input<Options['invertedSwapThreshold'] | undefined>(undefined);
	/** Remove clone element when not showing */
	readonly removeCloneOnHide = input<Options['removeCloneOnHide'] | undefined>(undefined);
	/** CSS selector for elements to ignore */
	readonly ignore = input<Options['ignore'] | undefined>(undefined);
	/** Number of pixels a point should move before cancelling a delayed drag event */
	readonly touchStartThreshold = input<Options['touchStartThreshold'] | undefined>(undefined);
	/** Distance mouse must be from empty sortable to insert drag element into it */
	readonly emptyInsertThreshold = input<Options['emptyInsertThreshold'] | undefined>(undefined);
	/** Enable drop bubble */
	readonly dropBubble = input<Options['dropBubble'] | undefined>(undefined);
	/** Enable dragover bubble */
	readonly dragoverBubble = input<Options['dragoverBubble'] | undefined>(undefined);
	/** HTML attribute that defines the data id */
	readonly dataIdAttr = input<Options['dataIdAttr'] | undefined>(undefined);
	/** Only delay on touch devices */
	readonly delayOnTouchOnly = input<Options['delayOnTouchOnly'] | undefined>(undefined);
	/** Easing for animation */
	readonly easing = input<Options['easing'] | undefined>(undefined);
	/** Function to set data for dragover/drop events */
	readonly setData = input<Options['setData'] | undefined>(undefined);
	/** Store module for saving and restoring of the sort */
	readonly store = input<Options['store'] | undefined>(undefined);

	/**
	 * Custom function to clone items when dragging between lists.
	 * If not provided, items will be passed through without cloning.
	 */
	readonly cloneFunction = input<((item: any) => any) | undefined>(undefined);

	/**
	 * Controls whether the directive automatically updates the bound array on drag-and-drop operations.
	 *
	 * When `true` (default): The directive automatically modifies the array when items are dragged and dropped.
	 * This is the traditional behavior and requires minimal code.
	 *
	 * When `false`: The directive does NOT modify the array. Instead, it only emits events with all the
	 * necessary information, giving you full control over how to update your data model.
	 * This approach is similar to Angular CDK's drag-and-drop and is useful when you need to:
	 * - Perform validation before updating
	 * - Make API calls to persist changes
	 * - Use immutable data patterns
	 * - Have fine-grained control over state management
	 *
	 * @default true
	 *
	 * @example
	 * ```html
	 * <!-- Automatic mode (default) -->
	 * <div [hubSortable]="items"></div>
	 *
	 * <!-- Manual mode -->
	 * <div [hubSortable]="items"
	 *      [autoUpdateArray]="false"
	 *      (update)="onUpdate($event)"></div>
	 * ```
	 *
	 * @example
	 * ```typescript
	 * import { moveItemInArray } from 'ng-hub-ui-sortable';
	 *
	 * onUpdate(event: SortableEvent) {
	 *   // Manually update the array with full control
	 *   moveItemInArray(this.items, event.oldIndex, event.newIndex);
	 * }
	 * ```
	 */
	readonly autoUpdateArray = input<boolean>(true);

	/**
	 * Whether the list can also be reordered from the keyboard.
	 *
	 * SortableJS listens for pointer events only, so with this off the list is unusable for
	 * anyone who does not drag with a mouse or a finger. When on (the default) every item — or
	 * its `handle`, when one is configured — becomes a Tab stop, `Enter` or `Space` picks the
	 * item up, the arrow keys move it, `Enter`/`Space` drops it and `Escape` puts it back; each
	 * step is announced through a polite live region.
	 *
	 * Reordering follows the same rules as a drag: it is off while `disabled` is `true` or
	 * `sort` is `false`, it honours `autoUpdateArray`, and it emits the same `update` and
	 * `sortEvent` outputs a pointer reorder emits.
	 *
	 * @default true
	 */
	readonly keyboardSorting = input<boolean>(true);

	/**
	 * Overrides for the sentences the keyboard reorder announces. Anything left out keeps its
	 * English default. This package ships no translation machinery on purpose, so this input is
	 * where an application plugs its own.
	 *
	 * @example
	 * ```typescript
	 * messages = {
	 * 	grabbed: (position: number, total: number) => `Elemento ${position} de ${total} agarrado.`
	 * };
	 * ```
	 */
	readonly keyboardMessages = input<Partial<SortableKeyboardMessages> | undefined>(undefined);

	/** List of individual option input names */
	private readonly individualOptionInputs = INDIVIDUAL_OPTION_INPUTS;

	/**
	 * The SortableJS instance created for this directive.
	 * Will be null until ngOnInit completes.
	 */
	private sortableInstance: Sortable | null = null;
	private nativeEventCleanup: Array<() => void> = [];

	/** Drives grab / move / drop for the keyboard, once the container is known. */
	private keyboard: SortableKeyboardController | null = null;

	/** The announcements in force: the defaults, with whatever `keyboardMessages` overrides. */
	private readonly keyboardMessagesInEffect = computed<SortableKeyboardMessages>(() => ({
		...DEFAULT_SORTABLE_KEYBOARD_MESSAGES,
		...(this.keyboardMessages() ?? {})
	}));

	/**
	 * Guard flag to prevent duplicate event emissions during a single drag operation.
	 * SortableJS can fire onUpdate/onAdd callbacks more than once for the same drop,
	 * especially when the DOM is manipulated (reverted) inside the handler.
	 * This flag is set when processing an event and cleared at the start of the next drag (onStart).
	 */
	/** Emitted when the Sortable instance is created */
	readonly init = output<Sortable>();
	/** Emitted when dragging starts */
	readonly start = output<SortableEvent>();
	/** Emitted when dragging ends */
	readonly end = output<SortableEvent>();
	/** Emitted when an item is added from another list */
	readonly add = output<SortableEvent>();
	/** Emitted when an item is updated within the same list */
	readonly update = output<SortableEvent>();
	/** Emitted when the list is sorted */
	readonly sortEvent = output<SortableEvent>();
	/** Emitted when an item is removed to another list */
	readonly remove = output<SortableEvent>();
	/** Emitted when an attempt is made to drag a filtered element */
	readonly filterEvent = output<SortableEvent>();
	/** Emitted when the list changes by adding or removing an item */
	readonly change = output<SortableEvent>();
	/** Emitted when an item is chosen */
	readonly choose = output<SortableEvent>();
	/** Emitted when an item is unchosen */
	readonly unchoose = output<SortableEvent>();
	/** Emitted when an item is cloned */
	readonly clone = output<SortableEvent>();
	/** Emitted when an item is moved within or between lists */
	readonly move = output<SortableMoveEventPayload>();

	/**
	 * Initializes the Sortable instance.
	 * Checks for Sortable availability to handle SSR scenarios.
	 */
	ngOnInit(): void {
		if (typeof window !== 'undefined') {
			// Sortable does not exist in angular universal (SSR)
			this.create();
		}
	}

	/**
	 * Handles input changes and updates the Sortable instance accordingly.
	 * @param changes - Object containing all changed inputs
	 */
	ngOnChanges(changes: {
		[prop in keyof SortableDirective]: SimpleChange;
	}): void {
		const optionsChange: SimpleChange = changes.options;

		if (optionsChange && !optionsChange.isFirstChange()) {
			const previousOptions: Options = optionsChange.previousValue || {};
			const currentOptions: Options = optionsChange.currentValue || {};
			const previousOptionsMap = previousOptions as Record<string, unknown>;
			const currentOptionsMap = currentOptions as Record<string, unknown>;

			Object.keys(currentOptions).forEach((optionName) => {
				if (currentOptionsMap[optionName] !== previousOptionsMap[optionName]) {
					// use low-level option setter
					this.sortableInstance?.option(
						optionName as keyof Options,
						this.sortableOptions[optionName as keyof Options]
					);
				}
			});
		}

		this.applyIndividualOptionChanges(changes);
		// `disabled`, `sort`, `draggable`, `handle` and `keyboardSorting` all decide whether an
		// item is a Tab stop at all, so the tab stops are recomputed after any of them moves.
		this.keyboard?.refresh();
	}

	/**
	 * Cleans up the Sortable instance when the directive is destroyed.
	 */
	ngOnDestroy(): void {
		this.nativeEventCleanup.forEach((cleanup) => cleanup());
		this.nativeEventCleanup = [];

		this.keyboard?.destroy();
		this.keyboard = null;

		if (this.sortableInstance) {
			this.sortableInstance.destroy();
		}
	}

	/**
	 * Creates the Sortable instance on the appropriate container element.
	 * Uses afterNextRender to ensure the DOM is fully rendered before initialization.
	 *
	 * A `container` selector that matches nothing leaves the directive inert — no instance,
	 * no `(init)`, and nothing logged into the consuming application's console output.
	 */
	private create(): void {
		const containerSelector = this.container();
		const container = containerSelector
			? this.element.nativeElement.querySelector(containerSelector)
			: this.element.nativeElement;

		if (!container) {
			return;
		}

		afterNextRender(
			() => {
				this.suppressNativeSortableEvents(container);

				// Create SortableJS instance outside Angular zone to prevent
				// SortableJS's internal DOM observers from triggering Angular
				// change detection. Events re-enter the zone via proxyEvent().
				this.zone.runOutsideAngular(() => {
					this.sortableInstance = Sortable.create(container, this.sortableOptions);
				});
				this.attachKeyboardSorting(container);
				if (this.sortableInstance) {
					this.init.emit(this.sortableInstance);
				}
			},
			{ injector: this.injector }
		);
	}

	/**
	 * Wires keyboard reordering to the same container SortableJS was created on.
	 *
	 * The controller is created unconditionally rather than behind `keyboardSorting()`: the input
	 * can be flipped at any time, and a controller that is attached but reports itself disabled
	 * costs one idle listener, whereas one that was never created cannot be turned on later.
	 *
	 * @param container - Element whose children are the sortable items.
	 */
	private attachKeyboardSorting(container: HTMLElement): void {
		this.keyboard = new SortableKeyboardController({
			container,
			isEnabled: () => this.isKeyboardSortingEnabled(),
			itemSelector: () => this.resolvedOption('draggable'),
			handleSelector: () => this.resolvedOption('handle'),
			messages: () => this.keyboardMessagesInEffect(),
			reorder: (request) => this.applyKeyboardReorder(container, request)
		});
		this.keyboard.attach();
	}

	/**
	 * Whether the keyboard path is currently open. It answers to the same two options a pointer
	 * drag does, read off the merged configuration so the global providers, the `options` object
	 * and the individual inputs all count.
	 *
	 * @returns `true` when an item can be picked up with the keyboard.
	 */
	private isKeyboardSortingEnabled(): boolean {
		if (!this.keyboardSorting()) {
			return false;
		}
		const options = this.optionsWithoutEvents;
		return options.disabled !== true && options.sort !== false;
	}

	/**
	 * Reads one string-valued SortableJS option out of the merged configuration.
	 *
	 * @param name - Option to read (`draggable` or `handle`).
	 * @returns The selector, or `undefined` when the option is unset or not a selector.
	 */
	private resolvedOption(name: 'draggable' | 'handle'): string | undefined {
		const value = this.optionsWithoutEvents[name];
		return typeof value === 'string' ? value : undefined;
	}

	/**
	 * Applies one keyboard reorder.
	 *
	 * It deliberately mirrors what a pointer drop does: in automatic mode the bound data is
	 * reordered and the element is moved to match, in manual mode nothing is touched and the
	 * consuming application reorders its own array from the event — the same contract
	 * `autoUpdateArray` already documents, so a list does not behave one way under the mouse and
	 * another under the keyboard.
	 *
	 * @param container - Element holding the sortable items.
	 * @param request - The move to apply, as the keyboard controller computed it.
	 */
	private applyKeyboardReorder(container: HTMLElement, request: SortableKeyboardReorder): void {
		const { item, from, to, reference } = request;
		const event = this.buildKeyboardSortEvent(container, item, from, to);

		// The listener is installed from an `afterNextRender` callback, which is not a place the
		// zone can be relied on, so the mutation is put back inside it explicitly. Without this a
		// zone-based application reorders the array and never repaints.
		this.zone.run(() => {
			if (this.autoUpdateArray()) {
				const bindings = this.getBindings();
				bindings.injectIntoEvery(to, bindings.extractFromEvery(from));
				this.renderer.insertBefore(container, item, reference);
			}

			this.proxyEvent('onUpdate', event);
			this.proxyEvent('onSort', event);
		});
	}

	/**
	 * Builds the `SortableEvent` a keyboard reorder reports, shaped exactly like the one
	 * SortableJS hands over for a same-list drop so a single handler serves both paths.
	 *
	 * `from` and `to` are the same container because the keyboard never moves an item between
	 * lists, and `clone` is the item itself — SortableJS types the field as non-nullable and no
	 * clone exists here.
	 *
	 * @param container - Element holding the sortable items.
	 * @param item - Element that moved.
	 * @param from - Index it left.
	 * @param to - Index it reached.
	 * @returns A SortableJS-shaped event describing the move.
	 */
	private buildKeyboardSortEvent(container: HTMLElement, item: HTMLElement, from: number, to: number): SortableEvent {
		return Object.assign(new CustomEvent('update'), {
			item,
			clone: item,
			from: container,
			to: container,
			oldIndex: from,
			newIndex: to,
			oldDraggableIndex: from,
			newDraggableIndex: to
		}) as unknown as SortableEvent;
	}

	/**
	 * Gets the bindings wrapper for the items input.
	 * Handles different types of item inputs (array, FormArray, SortableBindings).
	 * @returns SortableBindings instance wrapping the items
	 */
	private getBindings(): SortableBindings {
		const itemsInput = this.items();
		if (!itemsInput) {
			return new SortableBindings([]);
		} else if (itemsInput instanceof SortableBindings) {
			return itemsInput;
		} else {
			return new SortableBindings([itemsInput]);
		}
	}

	/**
	 * Combines all options into a final configuration object for SortableJS.
	 * Merges global config, user options, individual options, and overridden event handlers.
	 * @returns Complete options object for Sortable
	 */
	private get sortableOptions(): Options {
		return { ...this.optionsWithoutEvents, ...this.overriddenOptions };
	}

	/**
	 * Merges global config, options input, and individual option inputs.
	 * Does not include event handlers (those are in overridenOptions).
	 * @returns Options without event handlers
	 */
	private get optionsWithoutEvents(): Partial<Options> {
		return {
			...(this.globalConfig || {}),
			...(this.options() || {}),
			...this.getIndividualOptions()
		};
	}

	/**
	 * Proxies SortableJS events to run inside Angular's zone.
	 * Calls any user-provided event handler and emits the corresponding output.
	 * @param eventName - Name of the Sortable event
	 * @param params - Event parameters
	 * @returns Result from the user's event handler if provided
	 */
	private proxyEvent(eventName: SortableEventName, ...params: any[]): any {
		// re-entering zone, see https://github.com/SortableJS/angular-sortablejs/issues/110#issuecomment-408874600
		return this.zone.run(() => {
			const options = this.optionsWithoutEvents || {};
			const handler = (options as Record<string, unknown>)[eventName] as ((...args: any[]) => any) | undefined;
			const handlerResult = handler ? handler(...params) : undefined;

			this.emitOutputs(eventName, params);

			return handlerResult;
		});
	}

	/**
	 * Emits the appropriate Angular output based on the Sortable event name.
	 * @param eventName - Name of the Sortable event
	 * @param params - Event parameters to emit
	 */
	private emitOutputs(eventName: SortableEventName, params: any[]): void {
		switch (eventName) {
			case 'onStart':
				this.start.emit(params[0]);
				break;
			case 'onEnd':
				this.end.emit(params[0]);
				break;
			case 'onAdd':
				this.add.emit(params[0]);
				break;
			case 'onRemove':
				this.remove.emit(params[0]);
				break;
			case 'onUpdate':
				this.update.emit(params[0]);
				break;
			case 'onSort':
				this.sortEvent.emit(params[0]);
				break;
			case 'onFilter':
				this.filterEvent.emit(params[0]);
				break;
			case 'onChange':
				this.change.emit(params[0]);
				break;
			case 'onChoose':
				this.choose.emit(params[0]);
				break;
			case 'onUnchoose':
				this.unchoose.emit(params[0]);
				break;
			case 'onClone':
				this.clone.emit(params[0]);
				break;
			case 'onMove':
				this.move.emit({
					event: params[0],
					originalEvent: params[1]
				});
				break;
		}
	}

	/**
	 * Checks if the current drag operation is cloning items.
	 * @returns True if cloning, false otherwise
	 */
	private get isCloning(): boolean {
		if (!this.sortableInstance?.options?.group) {
			return false;
		}

		const group = this.sortableInstance.options.group;

		// Check if group has checkPull function
		if (typeof group === 'object' && 'checkPull' in group && typeof group.checkPull === 'function') {
			try {
				// Cast to any to avoid strict type checking on checkPull signature
				const result = (group.checkPull as any)(this.sortableInstance, this.sortableInstance);
				return result === 'clone';
			} catch {
				return false;
			}
		}

		// Fallback: check if pull is set to 'clone'
		if (typeof group === 'object' && 'pull' in group) {
			return group.pull === 'clone';
		}

		return false;
	}

	/**
	 * Clones an item using the provided clone function or passes it through unchanged.
	 * @param item - Item to clone
	 * @returns Cloned item or the original item if no clone function is provided
	 */
	private cloneItem<T>(item: T): T {
		// by default pass the item through, no cloning performed
		return (this.cloneFunction() || ((subitem) => subitem))(item);
	}

	/**
	 * Collects all individual option inputs into a single options object.
	 * Only includes options that have defined values.
	 * @returns Partial options object with individual options
	 */
	private getIndividualOptions(): Partial<Options> {
		return this.individualOptionInputs.reduce((options, optionName) => {
			const inputSignal = this[optionName as keyof this];

			if (typeof inputSignal === 'function') {
				const optionValue = inputSignal();
				if (optionValue !== undefined) {
					(options as any)[optionName] = optionValue;
				}
			}

			return options;
		}, {} as Partial<Options>);
	}

	/**
	 * Applies changes to individual option inputs to the Sortable instance.
	 * @param changes - Object containing all changed inputs
	 */
	private applyIndividualOptionChanges(changes: {
		[prop in keyof SortableDirective]: SimpleChange;
	}): void {
		if (!this.sortableInstance) {
			return;
		}

		this.individualOptionInputs.forEach((optionName) => {
			const change = changes[optionName as keyof SortableDirective];
			if (change && !change.isFirstChange()) {
				const inputSignal = this[optionName as keyof this];

				if (typeof inputSignal === 'function') {
					this.sortableInstance!.option(optionName, inputSignal());
				}
			}
		});
	}

	/**
	 * Gets event handler overrides that integrate SortableJS events with Angular.
	 * These handlers manage data binding updates and emit Angular outputs.
	 *
	 * Event firing order and conditions:
	 *
	 * **Drag within same list:**
	 * 1. onChoose - when item is selected
	 * 2. onStart - when drag begins
	 * 3. onMove - continuously during drag (multiple times)
	 * 4. onUpdate - when item position changes within same list
	 * 5. onSort - fired after any sorting operation (also after onUpdate)
	 * 6. onChange - fired when list order changes
	 * 7. onEnd - when drag ends
	 *
	 * **Drag between different lists:**
	 * 1. onChoose - when item is selected (source list)
	 * 2. onStart - when drag begins (source list)
	 * 3. onMove - continuously during drag (multiple times)
	 * 4. onRemove - when item leaves source list
	 * 5. onAdd - when item enters target list
	 * 6. onSort - fired in both lists after the operation
	 * 7. onChange - fired in both lists
	 * 8. onEnd - when drag ends (on original source list)
	 *
	 * **Clone mode:**
	 * - onClone - fired when item is cloned for dragging
	 * - onRemove and onAdd still fire, but original stays in source
	 *
	 * **Filter:**
	 * - onFilter - fired when trying to drag a filtered (non-draggable) element
	 *
	 * **Unchoose:**
	 * - onUnchoose - fired when selection is cancelled without dragging
	 *
	 * Note: In manual mode (autoUpdateArray: false), arrays are NOT automatically updated.
	 * Events still fire with all necessary information for manual handling.
	 *
	 * @returns Options object with overridden event handlers
	 */
	private get overriddenOptions(): Partial<Options> {
		// always intercept standard events but act only in case items are set (bindingEnabled)
		// allows to forget about tracking this.items changes
		return {
			/**
			 * Fired when an element is dropped into the list from another list.
			 * This event fires on the TARGET list.
			 * Automatic mode: Inserts item at newIndex. Manual mode: Only emits event.
			 */
			onAdd: (event: SortableEvent) => {
				if (event.newIndex === undefined) {
					return;
				}
				const newIndex = event.newIndex;

				// Only auto-update if enabled
				if (this.autoUpdateArray()) {
					this.service.transfer = (items: any[]) => {
						this.getBindings().injectIntoEvery(newIndex, items);
						this.proxyEvent('onAdd', event);
					};

					this.proxyEvent('onAddOriginal', event);
				} else {
					// Guard against duplicate calls from SortableJS
					if (this.service.dropEventProcessed) {
						return;
					}
					this.service.dropEventProcessed = true;

					if (event.clone) {
						// Clone mode: the source already has a clone preserving the list.
						// Remove the original from the target so it doesn't interfere
						// with Angular's rendering. The source's onRemove handler will
						// restore the original element and remove the clone.
						if (event.item.parentNode) {
							this.renderer.removeChild(event.item.parentNode, event.item);
						}
					} else {
						// Normal (non-clone) mode: revert SortableJS DOM changes so
						// Angular handles rendering based on the user's manual array updates
						this.revertTransferDom(event);
					}
					this.proxyEvent('onAdd', event);
				}
			},
			/**
			 * Fired when an element is removed from the list to another list.
			 * This event fires on the SOURCE list.
			 * Automatic mode: Removes item from oldIndex. Manual mode: Only emits event.
			 * Works in conjunction with onAdd on the target list.
			 */
			onRemove: (event: SortableEvent) => {
				if (event.oldIndex === undefined) {
					return;
				}

				const bindings = this.getBindings();

				// Only auto-update if enabled
				if (this.autoUpdateArray() && bindings.provided) {
					if (this.isCloning) {
						this.service.transfer?.(bindings.getFromEvery(event.oldIndex).map((item) => this.cloneItem(item)));

						// great thanks to https://github.com/tauu
						// event.item is the original item from the source list which is moved to the target list
						// event.clone is a clone of the original item and will be added to source list
						// If bindings are provided, adding the item dom element to the target list causes artifacts
						// as it interferes with the rendering performed by the angular template.
						// Therefore we remove it immediately and also move the original item back to the source list.
						// (event handler may be attached to the original item and not its clone, therefore keeping
						// the original dom node, circumvents side effects )
						this.renderer.removeChild(event.item.parentNode, event.item);
						this.renderer.insertBefore(event.clone.parentNode, event.item, event.clone);
						this.renderer.removeChild(event.clone.parentNode, event.clone);
					} else {
						this.service.transfer?.(bindings.extractFromEvery(event.oldIndex));
					}

					this.service.transfer = null;
				} else if (this.isCloning) {
					// Manual mode (autoUpdateArray: false) + clone mode:
					// SortableJS placed a clone in the source and moved the original to the target.
					// The target's onAdd handler (which ran before this) already removed the original
					// from the target DOM. We must now restore the original Angular-tracked element
					// in the source and remove the SortableJS clone to keep Angular's view consistent.
					if (event.item.parentNode) {
						this.renderer.removeChild(event.item.parentNode, event.item);
					}
					if (event.clone?.parentNode) {
						this.renderer.insertBefore(event.clone.parentNode, event.item, event.clone);
						this.renderer.removeChild(event.clone.parentNode, event.clone);
					}
				}

				this.proxyEvent('onRemove', event);
			},
			/**
			 * Fired when sorting changes within the SAME list.
			 * This fires when an item position changes in the same list (not between lists).
			 * Automatic mode: Reorders array by moving item. Manual mode: Only emits event.
			 * Note: onSort also fires after this event.
			 */
			onUpdate: (event: SortableEvent) => {
				const indexes = getIndexesFromEvent(event);
				if (indexes.old === undefined || indexes.new === undefined) {
					return;
				}

				if (this.autoUpdateArray()) {
					const bindings = this.getBindings();

					bindings.injectIntoEvery(indexes.new, bindings.extractFromEvery(indexes.old));
					this.proxyEvent('onUpdate', event);
				} else {
					// Guard against duplicate calls from SortableJS
					if (this.service.dropEventProcessed) {
						return;
					}
					this.service.dropEventProcessed = true;

					// Revert SortableJS DOM changes so Angular handles rendering
					// based on the user's manual array updates
					this.revertSortableDom(event);
					this.proxyEvent('onUpdate', event);
				}
			},
			/** Fired when dragging starts (mousedown/touchstart + movement). */
			onStart: (event: SortableEvent) => {
				// Reset the duplicate event guard at the start of each drag operation
				this.service.dropEventProcessed = false;
				this.proxyEvent('onStart', event);
			},
			/** Fired when dragging ends (mouseup/touchend). Always fires regardless of success. */
			onEnd: (event: SortableEvent) => {
				this.service.dropEventProcessed = false;
				return this.proxyEvent('onEnd', event);
			},
			/** Fired for ANY sorting operation. Fires AFTER onUpdate/onAdd causing duplicate events. */
			onSort: (event: SortableEvent) => this.proxyEvent('onSort', event),
			/** Fired when attempting to drag a filtered (non-draggable) element. */
			onFilter: (event: SortableEvent) => this.proxyEvent('onFilter', event),
			/** Fired when list changes by adding or removing items. Fires alongside onAdd/onRemove. */
			onChange: (event: SortableEvent) => this.proxyEvent('onChange', event),
			/** Fired when element is chosen (mousedown/touchstart). */
			onChoose: (event: SortableEvent) => this.proxyEvent('onChoose', event),
			/** Fired when element is unchosen (mouseup/touchend without drag). */
			onUnchoose: (event: SortableEvent) => this.proxyEvent('onUnchoose', event),
			/** Fired when creating a clone of element (only in clone mode). */
			onClone: (event: SortableEvent) => this.proxyEvent('onClone', event),
			/** Fired continuously during drag movement. Return false to cancel. */
			onMove: (event: MoveEvent, originalEvent: Event) => this.proxyEvent('onMove', event, originalEvent)
		};
	}

	/**
	 * Reverts SortableJS DOM manipulation for same-list reordering.
	 * In manual mode, SortableJS moves the DOM element but the directive doesn't update the array.
	 * When Angular's change detection runs, the mismatch between DOM and array state can cause
	 * duplicate events. This method restores the DOM to its pre-drag state so Angular can
	 * re-render cleanly based on the user's array updates.
	 *
	 * @param event - SortableJS event containing oldIndex, newIndex, item, and from
	 */
	private revertSortableDom(event: SortableEvent): void {
		const { oldIndex, newIndex, item, from } = event;
		if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) {
			return;
		}

		// After SortableJS moved the item, the children array has shifted.
		// To restore the original position:
		// - If item moved up (newIndex < oldIndex): reference is children[oldIndex + 1]
		//   because the item's removal from its new position shifts children back
		// - If item moved down (newIndex > oldIndex): reference is children[oldIndex]
		//   because children before oldIndex are unaffected
		const refChild = newIndex < oldIndex ? from.children[oldIndex + 1] || null : from.children[oldIndex];

		this.renderer.insertBefore(from, item, refChild);
	}

	/**
	 * Reverts SortableJS DOM manipulation for between-list transfers.
	 * Moves the dragged item back from the target list to the source list at its original position.
	 * This is called on the target list's onAdd handler in manual mode.
	 *
	 * @param event - SortableJS event containing oldIndex, item, and from (source container)
	 */
	private revertTransferDom(event: SortableEvent): void {
		const { oldIndex, item, from } = event;
		if (oldIndex === undefined) {
			return;
		}

		// Move item back to source list at its original position.
		// event.from is the source container, event.item is the dragged element.
		// insertBefore automatically removes the item from its current parent (target).
		this.renderer.insertBefore(from, item, from.children[oldIndex] || null);
	}

	/**
	 * Suppresses native CustomEvent emissions from SortableJS to avoid collisions
	 * with Angular output bindings like (update), (add), etc.
	 * Without this, a template listener may run once for Sortable's native event
	 * and once again for the directive output.
	 *
	 * @param container - Sortable container element
	 */
	private suppressNativeSortableEvents(container: HTMLElement): void {
		const sortableNativeEvents = [
			'start',
			'end',
			'add',
			'update',
			'sort',
			'remove',
			'filter',
			'change',
			'choose',
			'unchoose',
			'clone'
		] as const;

		sortableNativeEvents.forEach((eventName) => {
			const handler = (event: Event) => {
				event.stopImmediatePropagation();
			};

			container.addEventListener(eventName, handler, true);
			this.nativeEventCleanup.push(() => {
				container.removeEventListener(eventName, handler, true);
			});
		});
	}
}

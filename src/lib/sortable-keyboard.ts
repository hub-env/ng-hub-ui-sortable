/**
 * Keyboard reordering for `hubSortable`.
 *
 * SortableJS is a pointer library: it listens for `mousedown`/`touchstart` and nothing else, so a
 * list it manages cannot be reordered without a pointing device. This file adds the missing half,
 * following the WAI-ARIA authoring practices for accessible drag and drop and the interaction
 * model `cdkDropList` documents: **grab, move, drop**.
 *
 * - `Enter` / `Space` on an item picks it up, and picks it down again.
 * - While an item is held, `ArrowUp` / `ArrowLeft` move it one position back, `ArrowDown` /
 *   `ArrowRight` one position forward, and `Home` / `End` send it to either end.
 * - `Escape` puts it back where it started.
 * - Every one of those steps is announced through a polite live region, because the only other
 *   feedback the operation gives is visual.
 *
 * The alternative model — arrows reordering directly, with no grab step — was rejected: it makes
 * an arrow key destructive the moment focus lands on a list, and gives no way to move focus
 * through the items without rewriting them.
 */

/**
 * The sentences announced through the live region while reordering with the keyboard.
 *
 * They are functions rather than templates so a consuming application can localise them with its
 * own i18n library — this package deliberately carries no translation machinery — and so a
 * language whose word order differs is not forced through an English-shaped template.
 *
 * Positions are one-based, because they are read out to a person.
 */
export interface SortableKeyboardMessages {
	/** Announced when an item is picked up. */
	grabbed(position: number, total: number): string;
	/** Announced after each move while the item is held. */
	moved(position: number, total: number): string;
	/** Announced when the item is dropped at its new position. */
	dropped(position: number, total: number): string;
	/** Announced when the move is abandoned and the item returns to where it started. */
	cancelled(position: number, total: number): string;
}

/**
 * English defaults. The `grabbed` sentence spells the available keys out because a screen-reader
 * user has no other way to discover them.
 */
export const DEFAULT_SORTABLE_KEYBOARD_MESSAGES: SortableKeyboardMessages = {
	grabbed: (position, total) =>
		`Item ${position} of ${total} grabbed. Use the arrow keys to move it, Enter or Space to drop it, Escape to cancel.`,
	moved: (position, total) => `Moved to position ${position} of ${total}.`,
	dropped: (position, total) => `Dropped at position ${position} of ${total}.`,
	cancelled: (position, total) => `Move cancelled. Back at position ${position} of ${total}.`
};

/** One keyboard-driven reorder, handed to the directive to apply. */
export interface SortableKeyboardReorder {
	/** The element being moved. */
	item: HTMLElement;
	/** Its index among the sortable items before the move. */
	from: number;
	/** Its index after the move. */
	to: number;
	/**
	 * The element the moved item has to sit before, or `null` to append. Computed from the DOM as
	 * it stands, so the directive does not have to work it out a second time.
	 */
	reference: HTMLElement | null;
}

/**
 * What the controller needs from the directive that owns it. Keeping it to this handful of calls
 * is what lets the keyboard model be tested without a SortableJS instance.
 */
export interface SortableKeyboardPort {
	/** The element SortableJS was created on, whose children are the sortable items. */
	readonly container: HTMLElement;
	/** Whether keyboard reordering is currently offered — off for a disabled or unsortable list. */
	isEnabled(): boolean;
	/** The `draggable` option: a selector the items match, or `undefined` when every child is one. */
	itemSelector(): string | undefined;
	/** The `handle` option: a selector for the grab handle inside an item, when there is one. */
	handleSelector(): string | undefined;
	/** The announcements to use. */
	messages(): SortableKeyboardMessages;
	/** Applies one reorder to the bound data and emits the outputs a pointer drag would emit. */
	reorder(request: SortableKeyboardReorder): void;
}

/** Inline rules for a region that is read aloud but never seen. */
const VISUALLY_HIDDEN =
	'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0;';

/** Marks a `tabindex` this controller added, so it removes only its own. */
const TAB_STOP_MARKER = 'data-hub-sortable-tab-stop';

/**
 * Drives grab / move / drop over the items of one sortable container.
 *
 * The controller keeps the held item's position in a field rather than re-reading it from the DOM
 * after every move: in manual mode (`autoUpdateArray: false`) the directive touches nothing and
 * the DOM only catches up once the consuming application has updated its own array, which happens
 * after this handler returns.
 */
export class SortableKeyboardController {
	/** Element currently held, or `null` when nothing is grabbed. */
	#grabbed: HTMLElement | null = null;
	/** Index the held element occupied when it was picked up, used by `Escape`. */
	#originIndex = 0;
	/** Index the held element occupies now, as far as this controller has moved it. */
	#currentIndex = 0;

	/**
	 * Raised while a move is being applied. Relocating a focused element blurs it in every
	 * browser, and the resulting `focusout` would drop the item after the first arrow key.
	 */
	#moving = false;

	#liveRegion: HTMLElement | null = null;
	#observer: MutationObserver | null = null;
	#detachKeydown: (() => void) | null = null;
	#detachFocusOut: (() => void) | null = null;

	constructor(private readonly port: SortableKeyboardPort) {}

	/** Starts listening, and makes the items reachable with the Tab key. */
	attach(): void {
		const container = this.port.container;

		const keydown = (event: Event) => this.#onKeydown(event as KeyboardEvent);
		container.addEventListener('keydown', keydown);
		this.#detachKeydown = () => container.removeEventListener('keydown', keydown);

		// Losing focus with an item still held would leave the list in a state only a key press
		// could clear, so a drop is committed on the way out.
		const focusout = () => !this.#moving && this.#grabbed && this.drop();
		container.addEventListener('focusout', focusout);
		this.#detachFocusOut = () => container.removeEventListener('focusout', focusout);

		if (typeof MutationObserver !== 'undefined') {
			this.#observer = new MutationObserver(() => this.refresh());
			this.#observer.observe(container, { childList: true });
		}

		this.refresh();
	}

	/** Re-applies the tab stops after the list, or the options governing it, changed. */
	refresh(): void {
		const enabled = this.port.isEnabled();

		for (const item of this.items()) {
			const target = this.#focusTarget(item);
			if (!enabled) {
				if (target.hasAttribute(TAB_STOP_MARKER)) {
					target.removeAttribute('tabindex');
					target.removeAttribute(TAB_STOP_MARKER);
				}
				continue;
			}
			if (target.hasAttribute('tabindex')) {
				// A tabindex the application set is its own decision; only fill the gap.
				continue;
			}
			target.setAttribute('tabindex', '0');
			target.setAttribute(TAB_STOP_MARKER, '');
		}
	}

	/** Stops listening and removes the live region from the document. */
	destroy(): void {
		this.#detachKeydown?.();
		this.#detachFocusOut?.();
		this.#detachKeydown = null;
		this.#detachFocusOut = null;
		this.#observer?.disconnect();
		this.#observer = null;
		this.#grabbed = null;
		this.#liveRegion?.remove();
		this.#liveRegion = null;
	}

	/** The sortable items of the container, in document order. */
	items(): HTMLElement[] {
		const selector = this.itemMatcher();
		return Array.from(this.port.container.children).filter(
			(child): child is HTMLElement => child instanceof HTMLElement && (!selector || child.matches(selector))
		);
	}

	/** Whether an item is currently held. */
	get grabbedItem(): HTMLElement | null {
		return this.#grabbed;
	}

	/**
	 * The `draggable` selector, with a leading `>` stripped: SortableJS accepts the child
	 * combinator on its own (`'>li'`), which `Element.matches` rejects as invalid.
	 */
	private itemMatcher(): string | undefined {
		const selector = this.port.itemSelector()?.trim();
		return selector ? selector.replace(/^>\s*/, '') : undefined;
	}

	/** Picks up the item at `index` and announces it. */
	grab(item: HTMLElement, index: number, total: number): void {
		this.#grabbed = item;
		this.#originIndex = index;
		this.#currentIndex = index;
		this.#announce(this.port.messages().grabbed(index + 1, total));
	}

	/** Drops whatever is held at its current position. */
	drop(): void {
		if (!this.#grabbed) {
			return;
		}
		const total = this.items().length;
		this.#grabbed = null;
		this.#announce(this.port.messages().dropped(this.#currentIndex + 1, total));
	}

	/** Moves the held item to `target`, if that is a position it can occupy. */
	moveTo(target: number, announce: (position: number, total: number) => string): void {
		const item = this.#grabbed;
		if (!item) {
			return;
		}
		const items = this.items();
		const bounded = Math.max(0, Math.min(target, items.length - 1));
		if (bounded === this.#currentIndex) {
			return;
		}

		const rest = items.filter((candidate) => candidate !== item);
		this.#moving = true;
		try {
			this.port.reorder({ item, from: this.#currentIndex, to: bounded, reference: rest[bounded] ?? null });
			this.#focusTarget(item).focus();
		} finally {
			this.#moving = false;
		}
		this.#currentIndex = bounded;
		this.#announce(announce(bounded + 1, items.length));
	}

	/** Returns the held item to the position it was picked up from. */
	cancel(): void {
		const item = this.#grabbed;
		if (!item) {
			return;
		}
		if (this.#currentIndex === this.#originIndex) {
			this.#announce(this.port.messages().cancelled(this.#originIndex + 1, this.items().length));
		} else {
			this.moveTo(this.#originIndex, this.port.messages().cancelled);
		}
		this.#grabbed = null;
	}

	/**
	 * Translates one key press into a grab, a move, a drop or nothing at all.
	 *
	 * Arrow keys are only claimed while an item is held: a list whose items are Tab stops sits
	 * inside a page the user still has to be able to scroll.
	 */
	#onKeydown(event: KeyboardEvent): void {
		if (!this.port.isEnabled()) {
			return;
		}
		const items = this.items();
		const item = this.#itemFor(event.target, items);
		if (!item) {
			return;
		}
		const index = items.indexOf(item);
		const messages = this.port.messages();

		switch (event.key) {
			case 'Enter':
			case ' ':
			case 'Spacebar':
				event.preventDefault();
				if (this.#grabbed === item) {
					this.drop();
				} else if (!this.#grabbed) {
					this.grab(item, index, items.length);
				}
				return;
			case 'Escape':
				if (this.#grabbed) {
					event.preventDefault();
					this.cancel();
				}
				return;
			case 'ArrowUp':
			case 'ArrowLeft':
				if (this.#grabbed) {
					event.preventDefault();
					this.moveTo(this.#currentIndex - 1, messages.moved);
				}
				return;
			case 'ArrowDown':
			case 'ArrowRight':
				if (this.#grabbed) {
					event.preventDefault();
					this.moveTo(this.#currentIndex + 1, messages.moved);
				}
				return;
			case 'Home':
				if (this.#grabbed) {
					event.preventDefault();
					this.moveTo(0, messages.moved);
				}
				return;
			case 'End':
				if (this.#grabbed) {
					event.preventDefault();
					this.moveTo(items.length - 1, messages.moved);
				}
				return;
			default:
				return;
		}
	}

	/** The sortable item a key press came from, or `null` when it came from outside one. */
	#itemFor(target: EventTarget | null, items: HTMLElement[]): HTMLElement | null {
		let node = target instanceof Node ? target : null;
		while (node && node !== this.port.container) {
			if (node instanceof HTMLElement && items.includes(node)) {
				return node;
			}
			node = node.parentNode;
		}
		return null;
	}

	/** The element that carries the tab stop: the handle when one is configured, else the item. */
	#focusTarget(item: HTMLElement): HTMLElement {
		const handle = this.port.handleSelector()?.trim();
		if (!handle) {
			return item;
		}
		return item.querySelector<HTMLElement>(handle) ?? item;
	}

	/** Writes a sentence into the live region, creating it on first use. */
	#announce(message: string): void {
		const document = this.port.container.ownerDocument;
		if (!document?.body) {
			return;
		}
		if (!this.#liveRegion) {
			const region = document.createElement('div');
			region.setAttribute('role', 'status');
			region.setAttribute('aria-live', 'polite');
			region.setAttribute('aria-atomic', 'true');
			region.setAttribute('data-hub-sortable-live-region', '');
			region.setAttribute('style', VISUALLY_HIDDEN);
			document.body.appendChild(region);
			this.#liveRegion = region;
		}
		this.#liveRegion.textContent = message;
	}

	/** The live region element, once something has been announced. Exposed for tests. */
	get liveRegion(): HTMLElement | null {
		return this.#liveRegion;
	}
}

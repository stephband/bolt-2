
/*
dialog.js
Augments the <dialog> element.
*/

import events          from 'dom/events.js';
import delegate        from 'dom/delegate.js';
import { focusInside } from 'dom/focus.js';
import isTargetEvent   from 'dom/is-target-event.js';
import style           from 'dom/style.js';
import rect            from 'dom/rect.js';
import trigger         from 'dom/trigger.js';
import { disableScroll, enableScroll } from 'dom/scroll.js';
import { trapFocus, untrapFocus }      from 'dom/focus.js';
import { actions }     from './button.js';

// As it is possible to have multiple dialogs open, we must enumerate them
let n = 0;
let timer;

function disableDocumentScroll() {
    if (n === 0) {
        // In Linux Chrome (at least), disabling scroll interrupts scrolling
        // that is launched on any internal elements responding to hash change,
        // so we must delay it. I wish we could ask for scroll events and wait
        // until they are finished, but we cannot listen to scroll events inside
        // of a shadow DOM, so we are forced to use setTimeout.
        timer = setTimeout(disableScroll, 900);
    }

    // As it is possible to have multiple dialogs open, we must enumerate them
    ++n;
}

function enableDocumentScroll() {
    --n;

    // This shouldn't happen, but if there's an error somewhere it's possible
    if (n < 0) { n = 0; }

    // Enable scrolling on document element
    if (n === 0) {
        clearTimeout(timer);
        enableScroll();
    }
}

export function open(element, relatedTarget) {
    // Is the element closed?
    if (element.open) { return; }

    // Implement our own modal attribute. We do this rather than use .showModal()
    // because it is impossible to show, for example, non-modal message dialogs
    // on top of .showModal() dialogs
    const mode = element.getAttribute('mode');

    if (mode === 'modal') {
        const focused = document.activeElement;

        element.showModal();
        disableDocumentScroll();

        // Dialogs do have a 'close' event, just remember the powers that be have
        // decided that it should not bubble.
        events('close', element)
        .slice(0, 1)
        .each((e) => {
            enableDocumentScroll();
            focused.focus();
        });
    }
    else if (mode === 'overlay') {
        element.show();
        disableDocumentScroll();
        trapFocus(element);

        // Dialogs do have a 'close' event, just remember the powers that be have
        // decided that it should not bubble.
        events('close', element)
        .slice(0, 1)
        .each(() => {
            // Reenable document scroll
            enableDocumentScroll();
            // Return focus to wherever it was before
            untrapFocus();
        });
    }
    else {
        // Default unaugmented behaviour
        element.show();
    }

    // Give the dialog an "open" event
    trigger({ type: 'open', relatedTarget }, element)

    // Move focus inside the dialog
    if (element !== document.activeElement && !element.contains(document.activeElement)) {
        // The click that activated this target is not over yet, wait three frames
        // to focus the element. Don't know why we need three. Two is enough in
        // Safari, Chrome seems to like three, to be reliable. Not sure what we
        // are waiting for here. No sir, I don't like it.
        //
        // TODO: We should proabably insist on using the autofocus attribute instead.
        requestAnimationFrame(() =>
            requestAnimationFrame(() =>
                requestAnimationFrame(() =>
                    focusInside(element)
                )
            )
        );
    }
}

export function close(element) {
    // Is the element open?
    if ('open' in element && !element.open) { return; }

    // Immediately (optimistically?) reenable document scroll and reset focus
    const mode = element.getAttribute('mode');
    if (mode === 'modal') {
        enableDocumentScroll();
    }
    else if (mode === 'overlay') {
        enableDocumentScroll();
        untrapFocus();
    }

    // And take it off when the closing transition is over
    const ends = events('transitionend', element)
    .filter(isTargetEvent)
    .slice(0, 1)
    .each((e) => {
        if (window.DEBUG) console.log('close', element);
        element.close();
        element.classList.remove('closing');
    });

    element.classList.add('closing');
    const duration = parseFloat(style('transition-duration', element));
    if (duration) return;

    // If there is no transition applied close immediately
    ends.stop();
    element.close();
    element.classList.remove('closing');
}

actions('dialog', {
    open:   open,
    close:  close,
    toggle: (element, button) => element.open ?
        close(element, button) :
        open(element, button)
});

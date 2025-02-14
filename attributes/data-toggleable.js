/**
data-toggleable

An element with the `data-toggleable` attribute is activated and deactivated
whenever a link to it is click-hijacked. An active toggleable has the attribute
`"open"`, and links to it have the class `"on"`.

It is also activated when the page loads with its fragment identifier in the URL.

With a little hide/show style, a toggleable can be used to make menus, drawers,
accordions and so on.

```html
<a class="folder-button button" href="#folder-block">Show folder-block</a>
<button type="button" class="folder-button button" name="toggle" value="#folder-block">Show folder-block</a>
<section class="folder-block block" data-toggleable id="folder-block">
    Crunchum ipsum dolor sit coder void, constructor function, sed do while
    loop python orientation semi colon incident. Duis aute irure indent tabs
    or spaces velit esse cilium buntum how crunchy duntum.
</section>
```
**/

import events          from 'dom/events.js';
import focus           from 'dom/focus.js';
import isPrimaryButton from 'dom/is-primary-button.js';
import isTargetEvent   from 'dom/is-target-event.js';
import trigger         from 'dom/trigger.js';
import style           from 'dom/style.js';
import { actions }     from './name=toggle.js';

export function open(element, button, buttons) {
    if (element.open || element.hasAttribute('open')) return true;

    // Set data-toggleable's .open property if it has one
    if ('open' in element) element.open = true;
    // or give data-popable an open attribute
    else element.setAttribute('open', '');

    // Give the data-toggleable an 'open' event
    trigger({ type: 'open', relatedTarget: button }, element);

    // If button exists open() has been called as the result of a user interaction,
    // and if element does not already contain focus and there is something
    // focusable about it we want to move focus inside it
    /*if (button && element !== document.activeElement && !element.contains(document.activeElement)) {
        // The click that activated this target is not over yet, wait three frames
        // to focus the element. I don't know why we need three. Two is enough
        // in Safari, Chrome seems to like three, to be reliable. Not sure what
        // we are waiting for here. No sir, I don't like it.
        requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() =>
            focus(element)
        )));
    }*/

    // Return state of element
    return true;
}

export function close(element, button, buttons) {
    if (!element.open && !element.hasAttribute('open')) { return false; }

    // Set data-popaable's .open property if it has one
    if ('open' in element) element.open = false;
    // or remove data-popable open attribute
    else element.removeAttribute('open');

    // Fails to block keyboard focus entering element. Unreliable. Don't use.
    //element.setAttribute('aria-hidden', 'true');

    // Give the data-popable a 'close' event
    trigger({ type: 'close', relatedTarget: button }, element);

    // Return state of element
    return false;
}

actions('[data-toggleable]', {
    locate: open,
    open:   open,
    close:  close,
    toggle: (element, button, buttons) => element.open || element.hasAttribute('open') ?
        close(element, button, buttons) :
        open(element, button, buttons)
});

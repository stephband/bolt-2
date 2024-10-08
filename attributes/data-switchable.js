/**
data-switchable

A `data-switchable` is given the class `"active"` when a link to it, or a button
with `name="open"` and value of the its #id, is clicked. All links and buttons
that reference it are given the class `"on"`. In any group of siblings with
the `data-switchable` attribute exactly one is always active.

A switchable is also activated if the page loads with its fragment identifier in
the URL.

Switchables can be used to make tabs, slideshows, accordions and so on. Here
are three `data-switchable` sections with tab style, applied via `.tab-button`
and `.tab-block` classes.

```html
<div class="grid" style="row-gap: 1rem;">
    <nav class="x1 y1">
        <a class="tab-button button on" href="#tab-1">Tab 1</a>
        <a class="tab-button button" href="#tab-2">Tab 2</a>
        <a class="tab-button button" href="#tab-3">Tab 3</a>
    </nav>
    <section class="x1 y2 tab-block block active" data-switchable id="tab-1">
        Crunchum ipsum dolor sit coder void, constructor function, sed do while loop python orientation semi colon incident.
    </section>
    <section class="x1 y2 tab-block block" data-switchable id="tab-2">
        Duis aute irure indent tabs or spaces velit esse cilium buntum how crunchy duntum. Excepteur tranquilis syntax error memorandum qui officia nostrud operating system alertus.
    </section>
    <section class="x1 y2 tab-block block" data-switchable id="tab-3">
        Hyper text linkus operari avec computatrum ad coniungere hominum. Standards code est pulchra on chromium et foxus sed souvent suckum in internet explorum.
    </section>
</div>
```
**/


import children           from 'dom/children.js';
import events             from 'dom/events.js';
import focus              from 'dom/focus.js';
import style              from 'dom/style.js';
import trigger            from 'dom/trigger.js';
import { actions, close } from './name=toggle.js';


function closeSwitchable(element) {
    element.classList.remove('active');
    close(element);
    // Give the switchable a 'close' event
    trigger({ type: 'close' }, element);
}

function open(element, button) {
    const root     = element.getRootNode();
    const group    = element.getAttribute('[data-switchable]');
    const elements = group ?
        root.querySelectorAll('.active[data-switchable="' + group + '"]') :
        children(element.parentNode)
        .filter((child) => child !== element && child.matches('.active[data-switchable=""]')) ;

    elements.forEach((switchable) => closeSwitchable(switchable));
    element.classList.add('active');

    // Give the switchable an 'open' event
    trigger({ type: 'open', relatedTarget: button }, element);

    // Return state of element
    return true;
}

actions('[data-switchable]', {
    locate: open,
    open:   open,
    // We have to do this because links use toggle! ARRRGH. Arrgh aRRGH aaRAArgh.
    toggle: open
});

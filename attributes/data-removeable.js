/*
`data-removeable`
A `data-removeable` is removed from the DOM after `dom-deactivate`.
*/

import events      from 'dom/events.js';
import trigger     from 'dom/trigger.js';
import { actions } from './name=toggle.js';


// TEMP - detect transition so we can do away with this
const maxDuration = 0;


export function close(element, button, buttons) {
    // Give the data-popable a 'close' event
    trigger({ type: 'close', relatedTarget: button }, element);

    // TODO: wait for .active to be removed, inspect transition durations,
    // wait for all non-zero transitions
    const timer = setTimeout(update, maxDuration * 1000);
    const ends  = events('transitionend', element).each(update);

    function update() {
        clearTimeout(timer);
        ends.stop();
        element.remove();
    }

    // Return state of element
    return false;
}

actions('[data-removeable]', {
    close:  close
});

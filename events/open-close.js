
import trigger from 'dom/trigger.js';

/* Dialogs have a 'close' event, but the powers that be decided that it should
   not bubble. This is nonsense, it's not likely a high frequency event. Here we
   neuter it in the capture phase and replace it with a close event that does
   bubble. */

// TODO: make this work in shadow DOMs

document.addEventListener('close', (e) => {
    // Ignore close events that do bubble such as those we are about to create
    if (e.bubbles) return;

    // Neuter native close events
    e.stopImmediatePropagation();
}, true);

document.addEventListener('toggle', (e) => {
    // Create open and close events that bubble
    const type =
        e.newState === 'open' ? 'open' :
        e.newState === 'closed' ? 'close' :
        undefined ;

    if (!type) return;

    // Trigger open or close event
    trigger({ type, relatedTarget: relatedTarget || e.source }, e.target);

    // Reset related target
    relatedTarget = undefined;
}, true);


// Until toggle events have a reliable source property we need a means to track
// relatedTargets that launch the open or close
let relatedTarget;

export function setRelatedTarget(element) {
    relatedTarget = element;
}

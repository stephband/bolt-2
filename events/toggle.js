
/* Dialogs have a 'close' event, but the powers that be decided that it should
   not bubble. This is nonsense, it's not likely a high frequency event. Here we
   neuter it in the capture phase and replace it with a close event that does
   bubble. */

document.addEventListener('toggle', (e) => {
    console.log('TOGGLE', e.target.open, e.source);
    // Where event is missing a source get it from relatedTarget
    if (!e.source) e.source = relatedTarget;
    // Reset related target
    relatedTarget = undefined;
}, true);


// Until toggle events have a reliable source property we need a means to track
// relatedTargets that launch the open or close
let relatedTarget;

export function setRelatedTarget(element) {
    relatedTarget = element;
}

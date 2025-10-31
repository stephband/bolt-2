
/* Dialogs have a 'close' event, but the powers that be decided that it should
   not bubble. This is nonsense, it's not likely a high frequency event. Here we
   neuter it in the capture phase and replace it with a close event that does
   bubble. */

// Until toggle events have a reliable source property we need a means to track
// sources that launch the open or close
let source;

document.addEventListener('toggle', (e) => {
    // Where event is missing a source get it from source
    if (!('source' in e)) e.source = source;
    // Reset related target
    source = undefined;
}, true);

export function setToggleSource(element) {
    source = element;
}

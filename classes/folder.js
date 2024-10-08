
/*
.folder-block
Enable folder-block transitions of max-height to go to and from height: auto
for smoother opening and closing animations.
*/

import choose      from 'fn/choose.js';
import get         from 'fn/get.js';
import last        from 'fn/lists/last.js';
import parseInt    from 'fn/parse-int.js';
import toCamelCase from 'fn/to-camel-case.js';
import events      from 'dom/events.js';
import matches     from 'dom/matches.js';

function isVisible(element) {
    return element.offsetParent !== null;
}

events('dom-activate', document.body)
.map(get('target'))
.filter(matches('.folder-block'))
.each(function(node) {
    // There are no transitions inside loading containers
    if (!isVisible(node) || matches('.loading .folder-block', node)) {
        node.style.maxHeight = '';
        return;
    }

    const box       = node.getBoundingClientRect();
    const computed  = getComputedStyle(node);
    const lastChild = last(node.children);
    const bottom    = lastChild && lastChild.getBoundingClientRect().bottom;
    const height    = parseInt(computed.paddingBottom)
        + parseInt(computed.borderBottomWidth)
        + bottom
        - box.top;

    node.style.maxHeight = height + 'px';

    const transitionend = events('transitionend', node)
    .each(function(e) {
        transitionend.stop();
        node.style.maxHeight = '';
    });
});

const measure = choose({
    // Set maxHeight equal to height
    maxHeight: (node) => node.clientHeight + 'px',

    // Set all others to their computed values
    default: (node, style, property) => style[property]
});

events('dom-deactivate', document.body)
.map(get('target'))
.filter(matches('.folder-block'))
.each(function(node) {
    const style = node.getAttribute('style');
    const computed = getComputedStyle(node);

    // Warning: this gets the transition-property before the class active has
    // been removed, which is not strictly speaking the intention. Ideally we
    // want computed styles from before, and transition-property from after.
    // Computed style is a live object, though. Handling this case risks being
    // expensive. So let us assume for the time being that transition-property
    // before and after class active are the same.
    const properties = computed['transition-property']
        .split(/\s*,\s*/)
        .map(toCamelCase);

    node.style.transition = 'none';
    properties.forEach((property) => node.style[property] = measure(property, node, computed, property));

    // Wait until the next frame to prevent
    requestAnimationFrame(function() {
        // Replace initial state of style attribute, if it's null remove it
        if (style) {
            node.setAttribute('style', style);
        }
        else {
            node.removeAttribute('style');
        }
    });
});

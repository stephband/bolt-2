/**
data-draggable

The native behaviour of the `draggable="true"`*
attribute is extended with the `data-draggable`
attribute, which defines data to be carried by a drag action:

```html
<div draggable="true" data-draggable="application/json: [0,1,2,3]">
    Drag me
</div>
```

<small>* Note that `draggable` must be `"true"`. It is not strictly a boolean
attribute.</small>
**/

import { capture } from '../../fn/modules/capture.js';
import attribute from '../../dom/modules/attribute.js';
import classes, { removeClass } from '../../dom/modules/classes.js';
import delegate  from '../../dom/modules/delegate.js';
import identify  from '../../dom/modules/identify.js';
import select    from '../../dom/modules/select.js';
import { setDataTransfer } from '../../dom/modules/data-transfer.js';
import remove    from '../../dom/modules/remove.js';
import events    from '../../dom/modules/events.js';

//import { register } from '../../sparky/module.js';

var debug = true;

//                 xxxxx: wef;
var rmimetype = /^([^:\s]+)\s*:\s*([^;\s]+);\s*/;

function lastIndex(data) {
	return data.index + data[0].length;
}

function toMimetypeData(data) {
	return data ?
		capture(rmimetype, {
			1: function handleMime(data, results) {
				data[results[1]] = results[2];
				if ((lastIndex(results) + 2) < results.input.length) {
					parse(rmimetype, { 1: handleMime }, data, results);
				}
				return data;
			}
		}, {}, data) :
		data ;
	/*
		// Todo: needed for Neho - factor out
		{
			"Text":       identify(target),
			"text/plain": identify(target)
			//"application/json": JSON.stringify({})
		} ;
	*/
}

function dragstartButton(target, e) {
	var data = toMimetypeData(attribute('data-draggable', target));

	setDataTransfer(e.dataTransfer, data, {
		dropEffect:    "none",
		effectAllowed: "all"
	});

	// Wait for the next frame before setting the dragging class. It's
	// for style, and if it is styled immediately the dragging ghost
	// also gets the new style, which we don't want.
	window.requestAnimationFrame(function() {
		classes(target).add('dragging');
	});
}

var dragstart = delegate({ '[draggable], [data-draggable]': dragstartButton });

function dragend(e) {
	classes(e.target).remove('dragging');
}

events('dragstart', document).each(dragstart);
events('dragend', document).each(dragend);


function dragendButton(e) {
	select('.dropzone', document).forEach(remove);
	select('.dragover', document).forEach(removeClass('dragover'));
}

/*
register('data-on-drag', function(node, params) {
	var dragstart = delegate({ '[draggable], [data-draggable]': dragstartButton });
	var dragend   = delegate({ '[draggable], [data-draggable]': dragendButton });

	//.on('selectstart', '.node-button', cache, selectstartIE9)
	const dragstarts = events('dragstart', node).each(dragstart);
	//.on('drag', '.node-button', cache, dragButton)
	const dragends   = events('dragend', node).each(dragend);

	this.done(function() {
		dragstarts.stop();
		dragends.stop();
	});
});
*/

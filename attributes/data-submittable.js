
/*
[submittable]

```html
<form submittable action="" method="">
</form>
```

Hijacks the submit event and submits the form via `fetch()`. Reads the form's
standard `enctype` attribute to set the mimetype of the request, but extends
it by permitting the value `"application/json"` as well as the standard
`"application/x-www-form-urlencoded"` and `"multipart/form-data"`.
*/

import compose from 'fn/compose.js';
import get     from 'fn/get.js';
import request from 'dom/request.js';
import events  from 'dom/events.js';
import trigger from 'dom/trigger.js';


// Functions
events({ type: 'submit', select: '[data-submittable]' }, document)
.each((e) => {
	e.preventDefault();

	const form = e.target;
	const method   = form.method;
	const url      = form.action || '';
    // Allow other values for enctype by reading the attribute first
	const mimetype = form.getAttribute('enctype') || form.enctype;
	const formData = new FormData(form);

	request(method, url, formData, mimetype)
	.then((data)   => trigger({ type: 'dom-submitted', detail: data }, form))
	.catch((error) => trigger({ type: 'dom-submit-error', detail: error }, form));
});


/**
data-validateable

<p>The <strong>validateable</strong> attribute can be set on an
individual input, or on a form to make all descendant inputs
validateable.</p>

<p>A validateable input is validated on <code>focusout</code>, and
if an <code>invalid</code> event is emitted an error label is
appended to the DOM directly after it. The label's text is read
from&hellip;</p>

<ol>
    <li>a <code>data-validation-xxx</code> attribute on the input,
    (where <code>xxxx</code> is the name of the failed constraint), OR</li>
    <li>the object <code>dom.validation.messages</code>, OR</li>
    <li>the browser's default message</li>
</ol>

In addition, the first time a validation is performed on an
element the class `"validated"` is added, providing a
hook for pre- and post- validation `:invalid` styles.

Constraints are named after the validation attributes that impose
them.

<pre><code>dom.validation.messages = {
    pattern:   'Pattern does not match',
    max:       'Number too small',
    min:       'Number too big',
    step:      'Number not in step',
    maxlength: 'Input too long',
    type:      'Input not of type',
    required:  ''
};
</code></pre>

<p>This messages object is unpopulated by default, so the browser's default
validation messages are shown.</p>

<form class="block" validateable>
<label for="text">text</label>
<input type="text" id="text" name="text" required maxlength="20" />

<label for="password">password</label>
<input type="password" id="password" name="password" required />

<label for="number">number</label>
<input type="number" id="number" name="number" min="0" max="1" step="0.1" />

<label for="url">url</label>
<input type="url" id="url" name="url" />

<label for="email">email</label>
<input type="email" id="email" name="email" data-val-type="Wrong type, knucklehead" />
</form>
**/



// Monitors forms and fields with .validateable for input, and generates
// and manages .error-labels following those that fail validation.
//
// Messages are read from:
//
// 1. A validation attribute on the input:
//    <input type="email" data-validation-type="That is not an email address" />
//    The attribute name can be modified globally by setting
//    config.attributePrefix. The postfix word `xxx` on `data-validation-xxx` is
//    one of 'pattern', 'max', 'min', 'step', 'maxlength', 'type' or 'required'.
//
// 2. The messages in the `messages` object.
//
// 3. The browser's default validation message (which is available on the
//    input at the point that it fails validation).
//
// Inputs inside or with .validateable are given .validated after they are
// first validated, enabling pre- as well as post- validation styles.

import get       from 'fn/get.js';
import id        from 'fn/id.js';
import create    from 'dom/create.js';
import events    from 'dom/events.js';
import matches   from 'dom/matches.js';
import { next }  from 'dom/traverse.js';
import remove    from 'dom/remove.js';
import validate  from 'dom/validate.js';
import isValid   from 'dom/is-valid.js';
import classes   from 'dom/classes.js';
import { after } from 'dom/mutate.js';

var isValidateable = matches('[validateable], [validateable] input, [validateable] textarea, [validateable] select, [data-validateable], [data-validateable] input, [data-validateable] textarea, [data-validateable] select');

var types = {
	patternMismatch: 'pattern',
	rangeOverflow:   'max',
	rangeUnderflow:  'min',
	stepMismatch:    'step',
	tooLong:         'maxlength',
	typeMismatch:    'type',
	valueMissing:    'required'
};

// Spaces           spaces
const rspaces    = /\s+/;
// Grid or size class   @prefix-  nx  |xn  |ny  |yn  |size-n
const rgridclass = /^(?:@\S+-)?(?:\d+x|x\d+|\d+y|y\d+|size-\d+)$/;

export const config = {
    // Class added to labels displaying errors
	errorLabelClass: 'error-label',

	// Class added to validated nodes (note: not valid nodes, necessarily,
	// but nodes that have been validated at least once).
	validatedInputClass:  'validated',

	// Prefix for input attributes containing node specific validation messages.
    // Example: data-validation-max="You have gone too far"
    messageAttributePrefix: 'data-validation-',

    // Given an input, select or textarea (that may have been augmented in some
    // way such that it is not the node that an error should be attached to),
    // selectNode() should return the node that the error should follow.
    selectNode: (input) => input.closest('label') || input
};

// Global object for validation messages, overriding the browser defaults.
export const messages = {
	// pattern:
	// max:
	// min:
	// step:
	// maxlength:
	// type:
	// required:
};

function negate(fn) {
	return function() {
		return !fn.apply(this, arguments);
	};
}

function isShowingMessage(input) {
    var node = config.selectNode(input);
	return node.nextElementSibling
		&& matches('.' + config.errorLabelClass.trim().split(rspaces).join('.'), node.nextElementSibling);
}

function toError(node) {
	var validity = node.validity;
	var prefix   = config.messageAttributePrefix;
	var name;

	for (name in validity) {
		if (name !== 'valid' && validity[name]) {
			return {
				type: name,
				attr: types[name],
				name: node.name,
				text: (prefix && node.getAttribute(prefix + types[name]))
					|| (messages && messages[types[name]])
					|| node.validationMessage,
				node: node
			};
		}
	}
}

function renderError(error) {
	const input = error.node;
    let node  = config.selectNode(input);

	// Find the last error
	while (node.nextElementSibling && matches('.' + config.errorLabelClass.trim().split(rspaces).join('.'), node.nextElementSibling)) {
		node = node.nextElementSibling;
	}

	// Give error-labels the same grid classes as their inputs
	const classattr = node.getAttribute('class');
	const classes   = classattr &&
		classattr
		.split(rspaces)
		.filter((string) => rgridclass.test(string))
		.join(' ') ;

	const label = create('label', {
		textContent: error.text,
		for:         input.id,
		class:       config.errorLabelClass + (classes ? ' ' + classes : '')
	});

	after(node, label);

	if (error.type === 'customError') {
		input.setCustomValidity(error.text);

		events('input', input)
		.slice(0, 1)
		.each(function(e) {
			e.target.setCustomValidity('');
		});
	}
}

function addValidatedClass(input) {
	classes(input).add(config.validatedInputClass);
}

function removeMessages(input) {
	var node = config.selectNode(input);

	while ((node = next(node)) && matches('.' + config.errorLabelClass.trim().split(rspaces).join('.'), node)) {
		remove(node);
	}
}

events('input dom-update', document)
.map(get('target'))
.filter(isValidateable)
// This came from somewhere - is it for nullifying custom messages? Todo: review.
.map((element) => (element.setCustomValidity(''), element))
.filter(isValid)
.each(removeMessages);

events('focusout', document)
.map(get('target'))
.filter(isValidateable)
.each(validate);

events('submit', document)
.map(get('target'))
.filter(isValidateable)
.each(addValidatedClass);

events({ type: 'invalid', capture: true }, document)
.map(get('target'))
.filter(isValidateable)
.map((element) => (addValidatedClass(element), element))
.filter(negate(isShowingMessage))
.map(toError)
.each(renderError);

define(function () {


	/**
	 * Polyfill for the includes() Method. Source: https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/String/includes
	 */
	if (!String.prototype.includes) {
		String.prototype.includes = function (search, start) {
			'use strict';
			if (typeof start !== 'number') {
				start = 0;
			}

			if (start + search.length > this.length) {
				return false;
			} else {
				return this.indexOf(search, start) !== -1;
			}
		};
	}

	/**
	 * Polyfill for the indexOf() Method. Source:
	 */

	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function (obj, fromIndex) {
			if (fromIndex == null) {
				fromIndex = 0;
			} else if (fromIndex < 0) {
				fromIndex = Math.max(0, this.length + fromIndex);
			}
			for (var i = fromIndex, j = this.length; i < j; i++) {
				if (this[i] === obj)
					return i;
			}
			return -1;
		};
	}

});
;(function () {
	'use strict';

	/* ===== Constants ===== */

	const SEARCH_URL = 'https://api.github.com/search/repositories?q=',
	      LIVE_SEARCH = document.getElementById('liveSearch');

	/* === Begin CLASSES === */

	class HttpController {
		constructor(url) {
			this.url = url;
		}
		get() {}
		post(data) {}
	}

	class Painter {
		constructor(template) {
			this.template = template;
		}
		render(func) {}
	}

	/* ==== End CLASSES ==== */
})();
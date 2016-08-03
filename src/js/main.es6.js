;(function() {
	'use strict';

	/* ===== Constants ===== */
	const SEARCH_URL = 'https://api.github.com/search/repositories?q=',
		  LIVE_SEARCH = document.getElementById('liveSearch'),
		  SEARCH_RESULTS = document.getElementById('resultSearch');

	/* ===== Templates ===== */
	const SEARCH_RESULT_TEMP = 	'<% _.forEach(items, function(item) { %><p><%-item.full_name%></p><p><%-item.description%></p><p><%-item.language%></p><p><%-item.html_url%></p><hr><% }); %>';

	/* === Begin CLASSES === */

	class Painter {
		constructor(renderElem, template = "") {
			this.elem = renderElem;
			this.template = template;
		}
		render(data) {
			let compiled = _.template(this.template);
			this.elem.innerHTML = compiled({items: data});
		}
	}

	class LiveSearchController {
		constructor(elem, searchUrl, painter) {
			this.elem = elem;
			this.searchUrl = searchUrl;
			this.painter = painter;
		}
		watch() {
			let self = this;
			let ajax = new XMLHttpRequest(),
				data = [];

			ajax.onreadystatechange = function() {
				console.log(this);
		  		if (this.readyState != 4) return;

			  	if (this.status != 200) {
			    	console.log(this.status + ': ' + this.statusText);
			    	return;
			  	}
			  	if (this.responseText === '') return;
			  	data = JSON.parse(this.responseText).items.slice(0, 3);
			 	self.painter.render(data);

			}

			self.elem.addEventListener('keydown', (event) => {
				// if(event.target.value.length >= 3) {
				// 	ajax.abort();
				// }
				ajax.abort();
			});
			self.elem.addEventListener('keyup', (event) => {
				if(event.target.value.length >= 3) {
					setTimeout(() => {
						ajax.open('GET', `${self.searchUrl}${event.target.value}`);
						ajax.send();
					}, 1000);
				}
			});
		}
	}

	/* ==== End CLASSES ==== */

	let painterSearchResult = new Painter(SEARCH_RESULTS, SEARCH_RESULT_TEMP);
	let liveSerchCtrl = new LiveSearchController(LIVE_SEARCH, SEARCH_URL, painterSearchResult);
	liveSerchCtrl.watch();
	

	// painter.render([{full_name: "Andrey"}, {full_name: "Vasin"}]);

})();
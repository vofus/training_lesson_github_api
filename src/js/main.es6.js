;(function() {
	'use strict';

	/* ===== Variables ===== */
	let searchUrl = 'https://api.github.com/search/repositories?q=',
		liveSearch = document.getElementById('liveSearch'),
		searchResults = document.getElementById('resultSearch');

	let gistPostUrl = 'https://api.github.com/gists',
		gistName = document.getElementById('gistName'),
		gistBody = document.getElementById('gistBody'),
		gistBtn = document.getElementById('gistSubmitBtn'),
		gistResult = document.getElementById('newGistResult');

	/* ===== Templates ===== */
	// const SEARCH_RESULT_TEMP = 	'<% _.forEach(items, function(item) { %><p><%-item.full_name%></p><p><%-item.description%></p><p><%-item.language%></p><p><%-item.html_url%></p><hr><% }); %>';
	const SEARCH_RESULT_TEMP = document.getElementById('searchResultTemplate').innerHTML;
	const GIST_LINK_TEMP = document.getElementById('gistLinkTemplate').innerHTML;
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

	class GistController {
		constructor(btn, postUrl, painter) {
			this.btn = btn;
			this.url = postUrl;
			this.painter = painter;
		}
		watch() {
			let self = this,
				data = [],
				ajax = new XMLHttpRequest();

			ajax.onreadystatechange = function() {
		  		if (this.readyState != 4) return;

			  	if (this.status != 201) {
			    	console.log(this.status + ': ' + this.statusText);
			    	return;
			  	}
			  	if (this.responseText === '') return;
			  	let responseObj = JSON.parse(this.responseText),
			  		gistName = '',
			  		gistUrl = responseObj.html_url;

			  	for (let field in responseObj.files) {
			  		gistName = responseObj.files[field].filename;
			  	}
			  	
			  	data.push(new GistHistory(gistName, gistUrl));
			  	console.log(data);	

			 	self.painter.render(data);

			}

			self.btn.addEventListener('click', (event) => {
				event.preventDefault();
				if(gistName.value !== '' && gistBody.value !== '') {
					let gistObj = new Gist(gistName.value, gistBody.value);

					ajax.open('POST', `${self.url}`);
					ajax.send(JSON.stringify(gistObj));

					gistName.value = '';
					gistBody.value = '';
				}
			});
		}
	}

	class Gist {
		constructor(gistName, gistBody) {
			return {
				"files": {
				    [gistName]: {
				    	"content": gistBody
				    }
				}
			};
		}
	}

	class GistHistory {
		constructor(gistName, gistUrl) {
			return {
				name: gistName,
				url: gistUrl
			};
		}
	}

	/* ==== End CLASSES ==== */

	let painterSearchResult = new Painter(searchResults, SEARCH_RESULT_TEMP);
	let painterGistResult = new Painter(gistResult, GIST_LINK_TEMP);

	let liveSerchCtrl = new LiveSearchController(liveSearch, searchUrl, painterSearchResult);
	liveSerchCtrl.watch();

	let gistCtrl = new GistController(gistBtn, gistPostUrl, painterGistResult);
	gistCtrl.watch();
	

	// painter.render([{full_name: "Andrey"}, {full_name: "Vasin"}]);

})();
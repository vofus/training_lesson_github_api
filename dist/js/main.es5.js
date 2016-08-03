'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

;(function () {
	'use strict';

	/* ===== Variables ===== */

	var searchUrl = 'https://api.github.com/search/repositories?q=',
	    liveSearch = document.getElementById('liveSearch'),
	    searchResults = document.getElementById('resultSearch');

	var gistPostUrl = 'https://api.github.com/gists',
	    gistName = document.getElementById('gistName'),
	    gistBody = document.getElementById('gistBody'),
	    gistBtn = document.getElementById('gistSubmitBtn'),
	    gistResult = document.getElementById('newGistResult');

	/* ===== Templates ===== */
	var SEARCH_RESULT_TEMP = '<% _.forEach(items, function(item) { %><p><%-item.full_name%></p><p><%-item.description%></p><p><%-item.language%></p><p><%-item.html_url%></p><hr><% }); %>';
	var GIST_LINK_TEMP = '<a href="<%-items%>" target="_blank">Link of new Gist</a>';
	/* === Begin CLASSES === */

	var Painter = function () {
		function Painter(renderElem) {
			var template = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];

			_classCallCheck(this, Painter);

			this.elem = renderElem;
			this.template = template;
		}

		_createClass(Painter, [{
			key: 'render',
			value: function render(data) {
				var compiled = _.template(this.template);
				this.elem.innerHTML = compiled({ items: data });
			}
		}]);

		return Painter;
	}();

	var LiveSearchController = function () {
		function LiveSearchController(elem, searchUrl, painter) {
			_classCallCheck(this, LiveSearchController);

			this.elem = elem;
			this.searchUrl = searchUrl;
			this.painter = painter;
		}

		_createClass(LiveSearchController, [{
			key: 'watch',
			value: function watch() {
				var self = this;
				var ajax = new XMLHttpRequest(),
				    data = [];

				ajax.onreadystatechange = function () {
					if (this.readyState != 4) return;

					if (this.status != 200) {
						console.log(this.status + ': ' + this.statusText);
						return;
					}
					if (this.responseText === '') return;
					data = JSON.parse(this.responseText).items.slice(0, 3);
					self.painter.render(data);
				};

				self.elem.addEventListener('keydown', function (event) {
					ajax.abort();
				});
				self.elem.addEventListener('keyup', function (event) {
					if (event.target.value.length >= 3) {
						setTimeout(function () {
							ajax.open('GET', '' + self.searchUrl + event.target.value);
							ajax.send();
						}, 1000);
					}
				});
			}
		}]);

		return LiveSearchController;
	}();

	var GistController = function () {
		function GistController(btn, postUrl, painter) {
			_classCallCheck(this, GistController);

			this.btn = btn;
			this.url = postUrl;
			this.painter = painter;
		}

		_createClass(GistController, [{
			key: 'watch',
			value: function watch() {
				var self = this,
				    data = '',
				    ajax = new XMLHttpRequest();

				ajax.onreadystatechange = function () {
					if (this.readyState != 4) return;

					if (this.status != 201) {
						console.log(this.status + ': ' + this.statusText);
						return;
					}
					if (this.responseText === '') return;
					data = JSON.parse(this.responseText).html_url;

					self.painter.render(data);
				};

				self.btn.addEventListener('click', function (event) {
					event.preventDefault();
					if (gistName.value !== '' && gistBody.value !== '') {
						var gistObj = new Gist(gistName.value, gistBody.value);

						ajax.open('POST', '' + self.url);
						ajax.send(JSON.stringify(gistObj.gist));
					}
				});
			}
		}]);

		return GistController;
	}();

	var Gist = function Gist(gistName, gistBody) {
		_classCallCheck(this, Gist);

		this.gist = {
			"files": _defineProperty({}, gistName, {
				"content": gistBody
			})
		};
	};

	/* ==== End CLASSES ==== */

	var painterSearchResult = new Painter(searchResults, SEARCH_RESULT_TEMP);
	var painterGistResult = new Painter(gistResult, GIST_LINK_TEMP);

	var liveSerchCtrl = new LiveSearchController(liveSearch, searchUrl, painterSearchResult);
	liveSerchCtrl.watch();

	var gistCtrl = new GistController(gistBtn, gistPostUrl, painterGistResult);
	gistCtrl.watch();

	// painter.render([{full_name: "Andrey"}, {full_name: "Vasin"}]);
})();
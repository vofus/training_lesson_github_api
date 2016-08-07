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
    // const SEARCH_RESULT_TEMP =   '<% _.forEach(items, function(item) { %><p><%-item.full_name%></p><p><%-item.description%></p><p><%-item.language%></p><p><%-item.html_url%></p><hr><% }); %>';
    var SEARCH_RESULT_TEMP = document.getElementById('searchResultTemplate').innerHTML;
    var GIST_LINK_TEMP = document.getElementById('gistLinkTemplate').innerHTML;
    /* === Begin CLASSES === */

    var Authorization = function () {
        function Authorization(options) {
            _classCallCheck(this, Authorization);

            this.authUrl = options.authUrl;
            this.githubUser = options.githubUser;
            this.githubLink = options.githubLink;
            this.githubAvatar = options.githubAvatar;
            this.githubName = options.githubName;
            this.loginField = options.loginField;
            this.passField = options.passField;
            this.signInBtn = options.signInBtn;
            this.signOutBtn = options.signOutBtn;
            this.auth = Boolean(getCookie('auth'));
        }

        _createClass(Authorization, [{
            key: 'signin',
            value: function signin() {
                var self = this,
                    data = void 0,
                    authHeader = '',
                    hash = '',
                    ajax = new XMLHttpRequest();

                if (self.auth === true) {
                    hash = getCookie('hash');
                    authHeader = 'Basic ' + hash;

                    ajax.open('GET', '' + self.authUrl);
                    ajax.setRequestHeader('Authorization', authHeader);
                    ajax.send();

                    self.loginField.value = '';
                    self.passField.value = '';
                }

                ajax.onreadystatechange = function () {
                    if (this.readyState != 4) return;

                    if (this.status != 200) {
                        console.log(this.status + ': ' + this.statusText);
                        return;
                    }
                    if (this.responseText === '') return;

                    data = JSON.parse(this.responseText);
                    console.log(data);
                    self.githubLink.href = data.html_url;
                    self.githubAvatar.src = data.avatar_url;
                    self.githubName.innerText = data.name;

                    self.loginField.classList.add('hidden');
                    self.passField.classList.add('hidden');
                    self.signInBtn.classList.add('hidden');
                    self.githubUser.classList.remove('hidden');
                    self.signOutBtn.classList.remove('hidden');
                };

                self.signInBtn.addEventListener('click', function (event) {
                    event.preventDefault();
                    if (self.loginField.value !== '' && self.passField.value !== '') {
                        var log = self.loginField.value,
                            pass = self.passField.value;

                        if (!hash) {
                            hash = window.btoa(log + ':' + pass);
                        }
                        authHeader = 'Basic ' + hash;

                        ajax.open('GET', '' + self.authUrl);
                        ajax.setRequestHeader('Authorization', authHeader);
                        ajax.send();

                        setCookie('hash', hash, { expires: 86400 });
                        setCookie('auth', 'true', { expires: 86400 });

                        self.loginField.value = '';
                        self.passField.value = '';
                    }
                });

                self.signOutBtn.addEventListener('click', function (event) {
                    event.preventDefault();
                    deleteCookie('hash');
                    deleteCookie('auth');

                    self.loginField.classList.remove('hidden');
                    self.passField.classList.remove('hidden');
                    self.signInBtn.classList.remove('hidden');
                    self.githubUser.classList.add('hidden');
                    self.signOutBtn.classList.add('hidden');
                });
            }
        }]);

        return Authorization;
    }();

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
                    data = [],
                    ajax = new XMLHttpRequest();

                ajax.onreadystatechange = function () {
                    if (this.readyState != 4) return;

                    if (this.status != 201) {
                        console.log(this.status + ': ' + this.statusText);
                        return;
                    }
                    if (this.responseText === '') return;
                    var responseObj = JSON.parse(this.responseText),
                        gistName = '',
                        gistUrl = responseObj.html_url;

                    for (var field in responseObj.files) {
                        gistName = responseObj.files[field].filename;
                    }

                    data.push(new GistHistory(gistName, gistUrl));
                    console.log(data);

                    self.painter.render(data);
                };

                self.btn.addEventListener('click', function (event) {
                    event.preventDefault();
                    if (gistName.value !== '' && gistBody.value !== '') {
                        var gistObj = new Gist(gistName.value, gistBody.value),
                            _auth = Boolean(getCookie('auth')),
                            hash = '',
                            authHeader = '';

                        if (_auth) {
                            hash = getCookie('hash');
                            authHeader = 'Basic ' + hash;
                        }

                        console.log(_auth, hash);

                        ajax.open('POST', '' + self.url);
                        if (Boolean(authHeader)) {
                            ajax.setRequestHeader('Authorization', authHeader);
                            console.log(authHeader);
                        }
                        ajax.send(JSON.stringify(gistObj));

                        gistName.value = '';
                        gistBody.value = '';
                    }
                });
            }
        }]);

        return GistController;
    }();

    var Gist = function Gist(gistName, gistBody) {
        _classCallCheck(this, Gist);

        return {
            "public": true,
            "files": _defineProperty({}, gistName, {
                "content": gistBody
            })
        };
    };

    var GistHistory = function GistHistory(gistName, gistUrl) {
        _classCallCheck(this, GistHistory);

        return {
            name: gistName,
            url: gistUrl
        };
    };

    /* ==== End CLASSES ==== */

    var painterSearchResult = new Painter(searchResults, SEARCH_RESULT_TEMP);
    var painterGistResult = new Painter(gistResult, GIST_LINK_TEMP);

    var liveSerchCtrl = new LiveSearchController(liveSearch, searchUrl, painterSearchResult);
    liveSerchCtrl.watch();

    var gistCtrl = new GistController(gistBtn, gistPostUrl, painterGistResult);
    gistCtrl.watch();

    var auth = new Authorization({
        authUrl: 'https://api.github.com/user',
        githubUser: document.getElementById('githubUser'),
        githubLink: document.getElementById('githubLink'),
        githubAvatar: document.getElementById('githubAvatar'),
        githubName: document.getElementById('githubName'),
        loginField: document.getElementById('loginField'),
        passField: document.getElementById('passField'),
        signInBtn: document.getElementById('signInBtn'),
        signOutBtn: document.getElementById('signOutBtn')
    });
    auth.signin();

    /* ============= Functions ============= */
    function setCookie(name, value, options) {
        options = options || {};

        var expires = options.expires;

        if (typeof expires == "number" && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }

        value = encodeURIComponent(value);

        var updatedCookie = name + "=" + value;

        for (var propName in options) {
            updatedCookie += "; " + propName;
            var propValue = options[propName];
            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }

        document.cookie = updatedCookie;
    }
    function getCookie(name) {
        var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }
    function deleteCookie(name) {
        setCookie(name, "", { expires: -1 });
    }
})();
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
    // const SEARCH_RESULT_TEMP =   '<% _.forEach(items, function(item) { %><p><%-item.full_name%></p><p><%-item.description%></p><p><%-item.language%></p><p><%-item.html_url%></p><hr><% }); %>';
    const SEARCH_RESULT_TEMP = document.getElementById('searchResultTemplate').innerHTML;
    const GIST_LINK_TEMP = document.getElementById('gistLinkTemplate').innerHTML;
    /* === Begin CLASSES === */
    class Authorization {
        constructor(options) {
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
        signin() {
            let self = this,
                data,
                hash = '',
                authHeader = '',
                message = document.getElementById('message'),
                ajax = new XMLHttpRequest();

            if (self.auth === true) {
                hash = getCookie('hash');
                authHeader = `Basic ${hash}`;
                console.log(hash);

                ajax.open('GET', `${self.authUrl}`);
                ajax.setRequestHeader('Authorization', authHeader);
                ajax.send();

                self.loginField.value = '';
                self.passField.value = '';
            }

            ajax.onreadystatechange = function() {
                if (this.readyState != 4) return;

                if (this.status != 200) {
                    console.log(this.status + ': ' + this.statusText);
                    message.innerText = 'Ошибка! Введен неверный логин или пароль.';
                    message.classList.add('message--error');
                    setTimeout(() => {
                        message.classList.remove('message--error');
                        message.innerText = '';
                    }, 5000);
                    return;
                }
                if (this.responseText === '') return;

                data = JSON.parse(this.responseText);
                console.log(data);
                self.githubLink.href = data.html_url;
                self.githubAvatar.src = data.avatar_url;
                self.githubName.innerText = data.name;

                message.innerText = 'Добропожаловать!';
                message.classList.add('message--success');
                setTimeout(() => {
                    message.classList.remove('message--success');
                    message.innerText = '';
                }, 5000);

                self.loginField.classList.add('hidden');
                self.passField.classList.add('hidden');
                self.signInBtn.classList.add('hidden');
                self.githubUser.classList.remove('hidden');
                self.signOutBtn.classList.remove('hidden');

                setCookie('hash', hash, {expires: 86400});
                setCookie('auth', 'true', {expires: 86400});
            }

            self.signInBtn.addEventListener('click', (event) => {
                event.preventDefault();
                if(self.loginField.value !== '' && self.passField.value !== '') {
                    let log = self.loginField.value,
                        pass = self.passField.value;

                    if (!hash) { hash = window.btoa(log+':'+pass); }
                    authHeader = `Basic ${hash}`;

                    ajax.open('GET', `${self.authUrl}`);
                    ajax.setRequestHeader('Authorization', authHeader);
                    ajax.send();

                    self.loginField.value = '';
                    self.passField.value = '';
                }
            });

            self.signOutBtn.addEventListener('click', (event) => {
                event.preventDefault();
                deleteCookie('hash');
                deleteCookie('auth');
                hash = '';
                authHeader = '';

                message.innerText = 'До скорой встречи!';
                message.classList.add('message--goodbay');
                setTimeout(() => {
                    message.classList.remove('message--goodbay');
                    message.innerText = '';
                }, 5000);

                self.loginField.classList.remove('hidden');
                self.passField.classList.remove('hidden');
                self.signInBtn.classList.remove('hidden');
                self.githubUser.classList.add('hidden');
                self.signOutBtn.classList.add('hidden');
            });
        }
    }

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
                    let gistObj = new Gist(gistName.value, gistBody.value),
                        auth = Boolean(getCookie('auth')),
                        hash = '',
                        authHeader = '';

                    if (auth) {
                        hash = getCookie('hash');
                        authHeader = `Basic ${hash}`;
                    }

                    console.log(auth, hash);

                    ajax.open('POST', `${self.url}`);
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
    }

    class Gist {
        constructor(gistName, gistBody) {
            return {
                "public": true,
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

    let auth = new Authorization({
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

        let expires = options.expires;

        if (typeof expires == "number" && expires) {
            let d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }

        value = encodeURIComponent(value);

        let updatedCookie = name + "=" + value;

        for (let propName in options) {
            updatedCookie += "; " + propName;
            let propValue = options[propName];
            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }

        document.cookie = updatedCookie;
    }
    function getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }
    function deleteCookie(name) {
        setCookie(name, "", {expires: -1})
    }

})();
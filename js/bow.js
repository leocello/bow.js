var bow = {};

bow.request = {
    res: null,
    token: null,
    make: function(url, data, headers) {
        this.res = {
            url: null,
            method: 'GET',
            headers: {},
            data: {},
            complete: null,
            success: null,
            error: null,
            format: 'html',
            response: null
        };
        if (typeof(url) !== 'undefined') {
            this.setUrl(url);
        }
        if (typeof(data) !== 'undefined') {
            this.setData(data);
        }
        if (typeof(headers) !== 'undefined') {
            this.setHeaders(headers);
        }
        return this;
    },
    setFormat: function(format) {
        this.res.format = format;
        return this;
    },
    getFormat: function() {
        return this.res.format;
    },
    setMethod: function(method) {
        if (typeof (method) === 'undefined') {
            method = 'GET';
        }
        this.res.method = method;
        return this;
    },
    getMethod: function() {
        return this.res.method;
    },
    setUrl: function(url) {
        this.res.url = url;
        return this;
    },
    getUrl: function() {
        return this.res.url;
    },
    addHeader: function(name, value) {
        this.res.headers[name] = value;
        return this;
    },
    removeHeader: function(name) {
        this.res.headers[name] = null;
        return this;
    },
    hasHeader: function(name) {
        return typeof(this.res.headers[name]) !== 'undefined';
    },
    setHeaders: function(headers, merge) {
        if (typeof (merge) === 'undefined') {
            merge = false;
        }
        if (merge) {
            this.res.headers = $.extend(this.res.headers, headers);
        } else {
            this.res.headers = headers;
        }
        return this;
    },
    removeHeaders: function() {
        this.res.headers = {};
        return this;
    },
    setData: function(data) {
        this.res.data = data;
        return this;
    },
    getData: function() {
        return this.res.data;
    },
    setResponse: function(response) {
        this.res.response = response;
    },
    getResponse: function() {
        return this.res.response;
    },
    getJsonResponse: function() {
        return $.parseJSON(this.res.response.responseText);
    },
    onComplete: function(complete) {
        this.res.complete = complete;
        return this;
    },
    onSuccess: function(success) {
        this.res.success = success;
        return this;
    },
    onError: function(error) {
        this.res.error = error;
        return this;
    },
    post: function() {
        if (typeof(this.res.data) === 'undefined' || this.res.data === null) {
            this.res.data = {};
        }
        if (typeof(this.res.data['_token']) === 'undefined') {
            this.res.data['_token'] = this.token;
        }
        this.setMethod('POST');
        return this.send();
    },
    send: function() {
        var self = this;

        if (!self.hasHeader('Application-Context')) {
            self.addHeader('Application-Context', 'ajax');
        }

        $.ajax({
            url: self.getUrl(),
            beforeSend: function(request) {
                if (typeof(self.res.headers) === 'object') {
                    $.each(self.res.headers, function(k, v) {
                        request.setRequestHeader(k, v);
                    });
                }
            },
            type: self.getMethod(),
            data: self.getData(),
            dataType: self.getFormat(),
            success: function(a, b, c) {
                self.res.response = c;
                if (self.res.success) {
                    if (self.getResponse().getResponseHeader('Content-Type') === 'application/json') {
                        a = '';
                    }
                    self.res.success(a, b, c);
                }
                if (c.getResponseHeader('__callback__')) {
                    eval(c.getResponseHeader('__callback__'));
                }
                bow.ready.run();
            },
            error: function(a, b, c) {
                if (self.res.error) {
                    self.res.error(a, b, c);
                }
            },
            complete: function(a, b) {
                if (self.res.complete) {
                    self.res.complete(a, b);
                }
            }
        });
    },

    run: function(e) {
        var href = $(e).attr('data-href');
        if (typeof(href) === 'undefined') {
            return false;
        }

        var data = {};
        var headers = {};
        var matches;
        $(e).each(function () {
            $.each(this.attributes, function () {
                // this.attributes is not a plain object, but an array
                // of attribute nodes, which contain both the name and value
                if (this.specified) {
                    matches = this.name.match(/^data-value-(.*)$/i);
                    if (matches && matches.length === 2) {
                        data[matches[1]] = this.value;
                        return;
                    }

                    matches = this.name.match(/^data-header-(.*)$/i);
                    if (matches && matches.length === 2) {
                        headers[matches[1]] = this.value;
                        return;
                    }
                }
            });
        });

        var req = bow.request.make(href, data, headers);
        req.onComplete(function() {
            // just reload page
            window.location = window.location.href;
        });
        var method = $(e).attr('data-method');
        if (typeof(method) !== 'undefined' && method === 'POST') {
            req.post();
        } else {
            req.send();
        }
    }
};

bow.form = {
    getInputs: function(form) {
        var inputs = $(form).find(':input');
        var data = {};
        var name;
        $.each(inputs, function(i, input) {
            if (typeof ($(input).attr('name')) !== 'undefined') {
                name = $(input).attr('name');
                if (typeof(data[name]) !== 'undefined') {
                    if (typeof(data[name]) === 'object') {
                        data[name].push($(input).val());
                    } else {
                        data[name] = [data[name], $(input).val()];
                    }
                } else {
                    data[name] = $(input).val();
                }
            }
        });
        return data;
    }
};

bow.modal = {
    queue: [],
    container: {
        id: null,
        res: {
            title: null,
            body: null,
            loading: null,
            footer: null
        },
        ready: function() {
            this.res.title = this.title();
            this.res.body = this.body();
            this.res.loading = this.id.find('.modal-loading');
            this.res.footer = this.footer();
        },
        body: function(content) {
            if (typeof (content) !== 'undefined') {
                this.body().html(content);
            }
            return this.id.find('.modal-body');
        },
        title: function(content) {
            if (typeof (content) !== 'undefined') {
                this.title().html(content);
            }
            return this.id.find('.modal-title');
        },
        footer: function(content) {
            if (typeof (content) !== 'undefined') {
                this.footer().html(content);
            }
            return this.id.find('.modal-footer');
        },
        bind: function() {
            var self = bow.modal;
            this.body().find('form').submit(function() {
                self.submit();
                return false;
            });
            this.id.find('.btn-save').click(function() {
                self.submit();
                return false;
            });
        },
        unbind: function() {
            this.body().find('form').unbind('submit');
            this.id.find('.btn-save').unbind('click');
        }
    },
    ready: function() {
        var self = this;
        self.container.id = $('#mainModal');
        self.reset();
        self.container.id.modal({
            show: false
        });
        self.container.ready();
        self.bind();
    },
    bind: function() {
        var self = this;
        self.container.id.on('hidden.bs.modal', function(e) {
            self.queue = [];
            self.reset();
        });
        self.container.id.on('request.completed', function(e) {
            self.container.id.removeAttr('data-progress');
        });
        $('[data-toggle="bow"]').click(function() {
            self.open(this);
        });
    },
    on: function(event, callback) {
        if (this.container.id === null) {
            return false;
        }
        this.container.id.on(event, callback);
    },
    open: function(element) {
        var self = this;
        self.queue.push(element);
        var url = $(element).attr('data-href');
        if (url !== '') {
            if (typeof (self.container.id.attr('data-progress')) !== 'undefined') {
                return false;
            }
            self.container.id.attr('data-progress', 1);

            if (typeof ($(element).attr('data-size')) !== 'undefined') {
                self.container.id.find('.modal-dialog')
                    .addClass($(element).attr('data-size'));
            }
            if (typeof ($(element).attr('data-class')) !== 'undefined') {
                self.container.id.find('.modal-dialog')
                    .addClass($(element).attr('data-class'));
            }
            if (typeof ($(element).attr('data-style')) !== 'undefined') {
                self.container.id.find('.modal-dialog')
                    .css($(element).attr('data-style'));
            }
            if (typeof ($(element).attr('data-btn-save')) !== 'undefined') {
                self.container.id.find('.btn-save')
                    .text($(element).attr('data-btn-save'));
            }
            self.load(element);
        }
    },
    reset: function() { // @TODO: Reset modal's content
        this.container.id.html($('#frmGlobalModal').html());
        this.container.unbind();
        this.container.bind();
    },
    loading: function(show) { // @TODO: control the loading HTML
        var self = this;
        show = typeof (show) === 'undefined' ? true : false;
        if (show) {
            self.container.id.modal('show');
            self.container.footer().hide();
            self.container.body(self.container.id.find('.modal-loading').html());
        } else {
            self.container.footer().show();
            self.container.body('');
            return false;
        }

        // Add trigger on request complete
        bow.ready.add(function() {
            // allow to extend the modal's footer
            var extendModalFooter = self.container.body().find('.extend-modal-footer');
            if (extendModalFooter.length) {
                self.container.footer().find('.modal-footer-extra').html(extendModalFooter.html());
                extendModalFooter.remove();
                self.container.id.trigger('modal.footer.extended');
            }

            // even to replace footer itself
            var replaceModalFooter = self.container.body().find('.replace-modal-footer');
            if (replaceModalFooter.length) {
                self.container.footer().html(replaceModalFooter.html());
                replaceModalFooter.remove();
                self.container.id.trigger('modal.footer.replaced');
            }

            // or customize the title itself
            var replaceModalTitle = self.container.body().find('.replace-modal-title');
            if (replaceModalTitle.length) {
                self.container.title(replaceModalTitle.html());
                replaceModalTitle.remove();
                self.container.id.trigger('modal.title.replaced');
            }

            if (bow.utils.isPluginLoaded('validator')) {
                // Validation Binding
                self.container.body().find('form')
                    .validator()
                    .on('invalid.bs.validator', function(e) {
                        $(e.relatedTarget).parent().addClass('has-error');
                        // http://html5pattern.com/
                    })
                    .on('valid.bs.validator', function(e) {
                        $(e.relatedTarget).parent().removeClass('has-error');
                    });
            }

            self.container.id.trigger('modal.ready');
        });
    },
    load: function(e) { // @TODO: load HTML content of provided url
        var self = this;

        self.loading();
        if (typeof ($(e).attr('data-title')) !== 'undefined') {
            self.container.title($(e).attr('data-title'));
        }

        var url = $(e).attr('data-href');
        var req = bow.request.make(url, {}, {'Application-Context': 'modal'})
            .onSuccess(function(content) {
                self.loading(false);
                if (content !== '') {
                    self.container.body(content);
                    self.container.bind();
                }
                self.container.id.trigger('request.completed');
            });
        if (typeof($(e).attr('data-method')) === 'undefined' || $(e).attr('data-method') === 'GET') {
            req.send();
        } else if ($(e).attr('data-method') === 'POST') {
            req.post();
        }
    },
    submit: function() { // @TODO: control submitting form
        var self = this;
        var form = self.container.body().find('form');

        if (bow.utils.isPluginLoaded('validator')) {
            form.trigger('validation.before');
            form.validator('validate');
            form.trigger('validation.after');
            if (form.find('.has-error').length > 0) {
                return false;
            }
        }

        if (typeof (self.container.id.attr('data-progress')) !== 'undefined') {
            return false;
        }
        self.container.id.attr('data-progress', 1);

        var data = bow.form.getInputs(form);
        var url  = $(form).attr('action');
        self.loading();

        bow.request.make(url, data, {'Application-Context': 'modal'})
            .onSuccess(function(content) {
                self.loading(false);
                if (content !== '') {
                    self.container.body(content);
                    self.container.bind();
                }
                self.container.id.trigger('request.completed');
            })
            .onError(function(response) {
                self.loading(false);
                var contentType = response.getResponseHeader('Content-Type');
                if (contentType === 'application/json') {
                    // content = $.parseJSON(response.responseText);
                    // It should be an error from validation, try to load it again
                    self.load(self.queue.pop());
                }
                self.container.id.trigger('request.completed');
                bow.ready.clear();
            })
            .post();
    },
    show: function() { // @TODO: show modal
        this.container.id.modal('show');
    },
    hide: function() { // @TODO: hide modal
        this.container.id.modal('hide');
    }
};

bow.ready = {
    data: [],
    add: function(func) {
        this.data.push(func);
    },
    clear: function() {
        this.data = [];
    },
    run: function() {
        if (this.data.length) {
            var callback;
            do {
                callback = this.data.pop();
                if (typeof(callback) === 'function') {
                    callback();
                }
            } while(this.data.length > 0);
        }
    }
};

bow.include = {
    js: function(url, onComplete, onError) {
        if (url === '') {
            return false;
        }
        var scripts = document.getElementsByTagName('script');
        if (scripts.length) {
            var src = '';
            for (var i = 0; i < scripts.length; i++) {
                if (typeof (scripts[i].src) !== 'undefined') {
                    src = scripts[i].src;
                    if (src !== '') {
                        if (src === url) {
                            $(scripts[i]).remove();
                        }
                    }
                }
            }
        }
        url = url.replace('http://', 'https:' == document.location.protocol ? 'https://' : 'http://');
        var el = document.createElement('script');
        el.type = 'text/javascript';
        el.async = true;
        el.src = url;
        if (typeof(onComplete) === 'undefined') {
            onComplete = function() {
                bow.ready.run();
            };
        }
        el.onload = onComplete;
        if (typeof(onError) === 'function') {
            el.onerror = onError;
        }
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(el, s);
        return true;
    },
    css: function(url, media, onComplete, onError) {
        if (url === '') {
            return false;
        }
        if (typeof(media) === 'undefined') {
            media = 'screen';
        }
        var scripts = document.getElementsByTagName('link');
        if (scripts.length) {
            var src = '';
            for (var i = 0; i < scripts.length; i++) {
                if (typeof (scripts[i].href) !== 'undefined') {
                    src = scripts[i].href;
                    if (src !== '') {
                        if (src === url) {
                            if (typeof(onComplete) === 'function') {
                                onComplete();
                            }
                            return false;
                        }
                    }
                }
            }
        }
        url = url.replace('http://', 'https:' == document.location.protocol ? 'https://' : 'http://');
        var el = document.createElement('link');
        el.rel = 'stylesheet';
        el.type = 'text/css';
        el.media = media;
        el.href = url;
        if (typeof(onComplete) === 'function') {
            el.onload = onComplete;
        }
        if (typeof(onError) === 'function') {
            el.onerror = onError;
        }
        var s = document.getElementsByTagName('link')[0];
        s.parentNode.insertBefore(el, s);
    }
};

bow.input = {
    patterns: {
        integerKeyCodes: [
            8, // Backspace
            [37, 40], // Up, Down, Left, Right arrows
            46, // Delete
            [48, 57], // 0-9
            [96, 105], // 0-9 (number pad)

            9, // Tab
            20, // Caps Lock
            16, // Shift
            17, // Ctrl
            92, // #
            192, // ~
            27, // Esc
            231 // Special Key (Fired When Number)
        ],

        floatKeyCodes: [
            8, // Backspace
            [37, 40], // Up, Down, Left, Right arrows
            46, // Delete
            [48, 57], // 0-9
            [96, 105], // 0-9 (number pad)

            9, // Tab
            20, // Caps Lock
            16, // Shift
            17, // Ctrl
            92, // #
            192, // ~
            27, // Esc
            231 // Special Key (Fired When Number)

            ,
            // IntegerKeyCodes plus:
            110, // dot
            190, // dot
        ]
    },

    isValid: function(options) {
        if (typeof(options.type) === 'undefined') {
            return false;
        }

        var type = options.type;
        if (typeof(options.keyCode) !== 'undefined') {
            var isValid = false;
            var keyCode = parseInt(options.keyCode);
            var validKeyCodes;
            if (type === 'integer') {
                validKeyCodes = this.patterns.integerKeyCodes;
            } else if (type === 'float') {
                validKeyCodes = this.patterns.floatKeyCodes;
            }
            $.each(validKeyCodes, function(i, item) {
                if (typeof(item) === 'number' && keyCode === item) {
                    isValid = true;
                } else if (typeof(item) === 'object') {
                    if (item.length === 2
                        && keyCode >= item[0] && keyCode <= item[1]) {
                        isValid = true;
                    }
                }
            });
            return isValid;
        } else if (typeof(options.string) !== 'undefined') {
            if (type === 'integer') {
                return !isNaN(parseInt(options.string));
            } else if (type === 'float') {
                return !isNaN(parseFloat(options.string));
            }
        }
    },

    isInteger: function(options) {
        return this.isValid($.extend(options, {type: 'integer'}));
    },

    isFloat: function(options) {
        return this.isValid($.extend(options, {type: 'float'}));
    }
};

bow.cookie = {
    config: {
        path: '/',
        domain: '',
        expires: 30,
        raw: true,
        json: true
    },

    get: function(key, def) {
        var value = $.cookie(key);
        if (typeof(value) === 'undefined' && typeof(def) !== 'undefined') {
            return def;
        }
        return value;
    },

    set: function(key, value, config) {
        if (typeof(config) !== 'undefined') {
            config = $.extend(this.config, config);
        } else {
            config = this.config;
        }
        return $.cookie(key, value, config);
    },

    remove: function(key, config) {
        if (typeof(config) !== 'undefined') {
            config = $.extend(this.config, config);
        } else {
            config = this.config;
        }
        return $.removeCookie(key, config);
    },

    ready: function() {
        // configure cookie
        this.config.domain = location.domain;
    }
};

bow.utils = {
    typeHead: {
        getEngine: function(data, display, value, callback) {
            if (typeof(Bloodhound) === 'undefined') return null;
            return new Bloodhound({
                datumTokenizer: function(o) {
                    if (typeof(display) !== 'undefined') {
                        return Bloodhound.tokenizers.whitespace(o[display]);
                    }
                    return null;
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                local: data,
                identify: function(o) {
                    if (typeof(callback) === 'function') {
                        return callback(o);
                    }
                    var id = 'id';
                    if (typeof(value) !== 'undefined') {
                        id = value;
                    }
                    return typeof(o[id]) !== 'undefined' ? o[id] : null;
                }
            });
        }
    },

    isPluginLoaded: function(name) {
        return typeof(jQuery(document)[name]) === 'undefined' ? false : true;
    }
};

bow.url = {
    config: {
        base_url: ''
    },

    make: function(url, options) {
        return this.config.base_url + url + (typeof(options) === 'undefined' ? '' : this.build(options));
    },

    build: function(o, p) {
        var q = typeof(p) === 'undefined' ? '?' : p;
        $.each(o, function(k, v) {
            if (typeof(v) === 'object') {
                $.each(v, function(i, e) {
                    q += (q === '?' ? '' : '&') + k + '[' + i + ']' + '=' + e;
                });
            } else {
                q += (q === '?' ? '' : '&') + k + '=' + v;
            }
        });
        return q;
    },

    ready: function() {
        this.config.base_url = "/"
    }
};

bow.window = {
    open: function(u, o) {
        var n = typeof(o.name) === 'undefined' ? '' : o.name,
            r = typeof(o.replace) === 'undefined' ? false : o.replace,
            o = bow.url.build(o, '');
        window.open(u, n, o, r);
    },
    openNewWindow: function(u, o) {
        return this.open(u, $.extend(o, {name: '_blank'}));
    },
    openParentWindow: function(u, o) {
        return this.open(u, $.extend(o, {name: '_parent'}));
    },
    openCurrentWindow: function(u, o) {
        return this.open(u, $.extend(o, {name: '_self'}));
    },
    openNewTab: function(u, o) {
        var id = 'a__' + Math.round(Math.random() * 10000),
            a = jQuery('<a/>', {
                href: u,
                target: '_blank',
                id: id
            }).appendTo($(document.body));
        document.getElementById(id).click();
        a.remove();
    }
}

bow.ready.add(function() {
    bow.url.ready();
    bow.modal.ready();
    bow.cookie.ready();
});

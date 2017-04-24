var App  = Object.create(null);
document.onreadystatechange = function (event) {
    if (document.readyState === 'complete') {

    }
};
/*
* Simple routing for SPA (does not support nested view)
*/
App.router = {
    routes: {
        "/": "home",
        "home": "home",
        "addBike": "addBike"
    },
    home: function() {
        App.el.innerHTML = document.getElementById('home').innerHTML;
        App.initHomePage();
    },
    addBike: function() {
        App.el.innerHTML = document.getElementById('addBikePage').innerHTML;
    },
    handle: function (state) {
        var self,route;
        var state = state;
        self = this;
        route = self.routes[state];
        if (route) {
            if (typeof self[route] === 'function') {
                self[route].call(self);
            }
        } else {
            //self.error();
        }
    },
    init: function () {
        var self = this;
        window.onpopstate = history.onpushstate =  function(state, title, url) {
            self.handle.call(self, url || location.pathname.replace('/', '') || '/');
        };
        window.onload = function() {
            self.handle.call(self, location.pathname.replace('/', '') || '/');
        }
    }
};

App.el = document.getElementById('ui-view');
App.router.init();

(function(history){
    var pushState = history.pushState;
    history.pushState = function(state, title, url) {
        if (typeof history.onpushstate == "function") {
            history.onpushstate(state, title, url);
        }
        return pushState.apply(history, arguments);
    }
})(window.history);

App.initHomePage = function() {
    var self = this;
    var serviceUrl = '/api/bikes';
    var data = this.sendRequest('GET', serviceUrl);
    console.log(data);
};

input.onchange = function() {

    var formData = new FormData();
    formData.append('image', this.files[0]);
    formData.append('data', JSON.stringify({
        brand: "jfdhgjkfd",
        type: "jfdhgjkfd",
        createdBy: "jfdhgjkfd",
        createdDate: "jfdhgjkfd",
        model: "jfdhgjkfd",
        headline: "jfdhgjkfd",
        description: "jfdhgjkfd",
        size: 10,
        price: '200'
    }));
    App.sendRequest('POST', '/api/bike', formData)
}

App.sendRequest = function(method, url, data) {
    var xhr = new XMLHttpRequest();
    var res = [];
    xhr.open(method, url, data);
    //xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                res = xhr.responseText;
            } else {
                console.error(xhr.statusText);
            }
        }
    };

    xhr.onerror = function (e) {
        console.error(xhr.statusText);
    };

    xhr.send(data || null);
    return res;
};

App.linkClickedHandler = function(event) {
    event.preventDefault();
    history.pushState({page: event.target.dataset.page}, event.target.title, event.target.getAttribute('js-sref'))
};

App.setImagePreview = function(event) {
    /*Your code here*/
    debugger;
}

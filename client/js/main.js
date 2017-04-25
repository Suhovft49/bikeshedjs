var App  = {};

App.router = {
    routes: {
        "/": "home",
        "home": "home",
        "addBike": "addBike",
        "showBike": "showBike"
    },
    home: function() {
        App.el.innerHTML = document.getElementById('home').innerHTML;
        App.initHomePage();
    },
    addBike: function() {
        App.el.innerHTML = document.getElementById('addBikePage').innerHTML;
    },
    showBike: function(state) {
        var productContainer = document.querySelector('.product-container');
        var item = productContainer.querySelectorAll('[js-sref="'+state+'"]')[0];
        var id = item.getAttribute('data-id');
        var serviceUrl = '/api/bike/' + id;
        var data = App.sendRequest('GET', serviceUrl);
        App.initBikeInfoPage(data);


    },
    handle: function (state) {
        var self,route;
        var state = state;
        self = this;
        route = self.routes[state];
        if(!route && !isNaN(+state))  {
            self.showBike(state)
        }
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
    App.fillHomePage(JSON.parse(data));
};

App.initBikeInfoPage = function(data) {
    App.el.innerHTML = document.getElementById('product-page').innerHTML;
    var productDetailsContainer = document.querySelector('.product-details');

};

App.fillHomePage = function(data) {
    var productContainer = document.querySelector('.product-container');
    data.forEach(function(el, index) {
        var item = document.createElement('div');
        item.className  = 'product-item';
        var sref = index + 1;
        var textNode = '<div class="product">' +
                            '<a href="#" js-sref="'+ sref +'" data-id="'+el._id+'" data-page="3" onclick="App.linkClickedHandler(event)" class="product__wrap">' +
                                '<img src="' + el.image + '" alt="img" class="responsive-img product__preview">' +
                                '<h2 class="product__title">'+el.model+'</h2>' +
                            '</a>' +
                            '<div class="product__price">' + el.price + '</div>' +
                        '</div>';
        item.innerHTML = textNode;
        item.data = el;
        return productContainer.appendChild(item);

    })
};

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
    history.pushState({page: event.target.dataset.page}, event.target.title, event.target.getAttribute('js-sref') || event.target.parentNode.getAttribute('js-sref'))
};

App.setImagePreview = function(event) {
   var file = event.target.files[0];
   return (function(file) {
       if ( file.type.match(/image.*/) ) {
           var reader = new FileReader();
           reader.addEventListener("load", function(event) {
               var imgPreview = document.querySelector('.js__bike__preview');
               imgPreview.setAttribute('src', event.target.result);
           });
           reader.readAsDataURL(file);
       }
   })(file)
};

/*Create bike*/

App.formSubmit = function (event) {
    event.preventDefault();
    var formControls, formData, dataForm;
    formControls = event.currentTarget.querySelectorAll('.form__control');
    formData = new FormData();
    dataForm = this.generateDataForServer(formControls);
    formData.append('image', dataForm.image);
    formData.append('data', JSON.stringify(dataForm));
    this.sendRequest('POST', '/api/bike', formData);
};

App.generateDataForServer = function(data) {
    var buffer = {};
    Array.prototype.forEach.call(data, function(el, index) {
        el.files ? buffer[el.getAttribute('name')] = el.files[0] : buffer[el.getAttribute('name')] = el.value;
    });
    return buffer;
};


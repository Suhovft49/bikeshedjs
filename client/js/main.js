var App = function () {};

App.prototype = {
    router: {
        routes: {
            "/": "home",
            "home": "home",
            "addBike": "addBike",
            "showBike": "showBike",
            "adminBrand": "adminBrand"
        },
        home: function () {
            App.el.innerHTML = document.getElementById('home').innerHTML;
            App.initHomePage();
        },
        addBike: function () {
            App.initAddBikePage();
        },
        adminBrand: function() {
            App.el.innerHTML = document.getElementById('adminBrand').innerHTML;
            App.initAdminBrand();
        },
        showBike: function (state) {
            var serviceUrl = '/api/bike/' + state;
            var dataBike = App.sendRequest('GET', serviceUrl);
            App.initBikeInfoPage(dataBike);
        },
        handle: function (state) {
            var self, route;
            var state = state;
            self = this;
            route = self.routes[state];
            if (!route && !isNaN(+state)) {
                self.showBike(state);
                return;
            }
            if (route) {
                if (typeof self[route] === 'function') {
                    self[route].call(self);
                }
            } else {
                throw new Error('Can not set state with params');
            }
        },
        init: function () {
            var self = this;
            window.onpopstate = history.onpushstate = function (state, title, url) {
                self.handle.call(self, url || location.pathname.replace('/', '') || '/');
            };
            window.onload = function () {
                self.handle.call(self, location.pathname.replace('/', '') || '/');
            }
        }
    },
    el: document.getElementById('ui-view'),
    initHomePage: function () {
        var serviceUrl = '/api/bikes';
        var ajaxErrorSelector = document.querySelector('.ajax-error');
        ajaxErrorSelector.style.display = "none";
        var data = JSON.parse(this.getBikes());

        if(!data.length) {
            ajaxErrorSelector.style.display = "block";
            return;
        }
        this.fillHomePage(data);
    },
    initBikeInfoPage: function (data) {
        var parsedData = JSON.parse(data);
        var brand = this.getBrandByName(parsedData.brand);
        if(brand) brand = JSON.parse(brand);
        this.el.innerHTML = document.getElementById('product-page').innerHTML;
        this.fillBikeInfoPage(parsedData, brand);
        /**Your code here*/
    },
    fillBikeInfoPage: function(data, brand) {
        var bikeProperties = document.querySelectorAll('.options__title');
        bikeProperties[0].innerHTML = 'Model: ' + data.model;
        bikeProperties[1].innerHTML = '$ ' + data.price;
        bikeProperties[2].innerHTML = 'Size: ' + data.size;
        document.querySelector('.options__visual img').setAttribute('src', '' +  data.image);
        document.querySelector('.options__headline').innerHTML = 'Headline: <br />' + data.headline;
        document.querySelector('.options__description').innerHTML = 'description: <br /> ' + data.description;
        if(!brand) return;
        document.querySelector('.options__brand img').setAttribute('src', '' +  brand.image);
        document.querySelector('.brand__name').innerHTML = 'Brand: ' + brand.name;
    },
    fillHomePage: function (data) {
        var productContainer = document.querySelector('.product-container');
        data.sort(function(a, b) {
            return b.price < a.price;
        });
        data.forEach(function (el, index) {
            var item = document.createElement('div');
            item.className = 'product-item';
            var textNode = '<div class="product">' +
                '<a href="#" js-sref="' + el.createdDate + '" data-id="' + el._id + '" data-page="3" onclick="App.linkClickedHandler(event)" class="product__wrap">' +
                    '<img src="' + el.image + '" alt="img" class="responsive-img product__preview">' +
                    '<h2 class="product__title">' + el.model + '</h2>' +
                '</a>' +
                '<div class="product__price">' + el.price + '</div>' +
                '</div>';
            item.innerHTML = textNode;
            item.data = el;
            return productContainer.appendChild(item);
        })
    },
    sendRequest: function (method, url, data) {
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
    },
    linkClickedHandler: function (event) {
        event.preventDefault();
        history.pushState({page: event.target.dataset.page}, event.target.title, event.target.getAttribute('js-sref') || event.target.parentNode.getAttribute('js-sref'))
    },
    setImagePreview: function (event) {
        var file = event.target.files[0];
        return (function (file) {
            if (file.type.match(/image.*/)) {
                var reader = new FileReader();
                reader.addEventListener("load", function (event) {
                    var imgPreview = document.querySelector('.js__bike__preview');
                    imgPreview.setAttribute('src', event.target.result);
                });
                reader.readAsDataURL(file);
            }
        })(file)
    },
    formSubmit: function (event) {
        event.preventDefault();
        var formControls, formData, dataForm;
        formControls = event.currentTarget.querySelectorAll('.form__control');
        formData = new FormData();
        dataForm = this.generateDataForServer(formControls);
        dataForm.createdDate = new Date().getTime();
        dataForm.createdBy = "User";
        formData.append('image', dataForm.image);
        formData.append('data', JSON.stringify(dataForm));
        this.insertBike(formData);
    },
    generateDataForServer: function (data) {
        var buffer = {};
        Array.prototype.forEach.call(data, function (el, index) {
            el.files ? buffer[el.getAttribute('name')] = el.files[0] : buffer[el.getAttribute('name')] = el.value;
        });
        return buffer;
    },
    getBikes: function() {
        return this.sendRequest('GET', '/api/bikes');
    },
    getBrands: function() {
        return this.sendRequest('GET', '/api/brands');
    },
    getBrandByName: function(name) {
        return this.sendRequest('GET', '/api/brand/' + name);
    },
    insertBike: function(formData) {
        return this.sendRequest('POST', '/api/bike', formData);
    },
    insertBrand: function(formData) {
        return this.sendRequest('POST', '/api/brand', formData);
    },
    deleteBrand: function(event) {
        var currentTarget = event.target;
        var name = currentTarget.dataset.name;
        this.sendRequest('DELETE', '/api/brand/' + name);
        this.initAdminBrand();
    },
    initAdminBrand: function() {
        var tableContainer = document.querySelector('.table-container');
        tableContainer.style.display = 'none';
        var brands = JSON.parse(this.getBrands());
        if(brands.length) {
            this.fillAdminTable(brands, tableContainer);
            tableContainer.style.display = 'block';
        }
    },
    fillAdminTable: function(brands, table) {
        var tableBody = table.querySelector('tbody');
        tableBody.innerHTML = '';
        brands.forEach(function(elem) {
            var row = document.createElement('tr');
            var rowString = '<td>'+elem.name+'</td><td><img src="'+elem.image+'" /></td><td><button data-name="'+elem.name+'" onclick="App.deleteBrand(event)">Delete</button></td>';
            row.innerHTML = rowString;
            tableBody.appendChild(row);
        })
    },
    initAddBikePage: function() {
        var brandsArr = this.getBrands();
        if(brandsArr.length) {
            brandsArr = JSON.parse(brandsArr);
            this.applyBrandsToSelect(brandsArr);

        }
        App.el.innerHTML = document.getElementById('addBikePage').innerHTML;
    },
    applyBrandsToSelect: function(data) {
        var brandContainer = document.getElementById('product-brand');
        data.forEach(function(elem) {
            var option = document.createElement('option');
            option.value = elem.name;
            option.innerHTML = elem.name;
            brandContainer.appendChild(option);
        });
    },
    brandSubmit: function(event) {
        event.preventDefault();
        var formControls = event.currentTarget.querySelectorAll('.form__control');
        var data = this.generateDataForServer(formControls);
        var formData = new FormData();
        formData.append('image', data.image);
        formData.append('data', JSON.stringify(data));
        this.insertBrand(formData);
        setTimeout(function() {
            App.initAdminBrand();
        }, 1000);
        event.target.reset()


    }

};

(function (history) {
    var pushState = history.pushState;
    history.pushState = function (state, title, url) {
        if (typeof history.onpushstate == "function") {
            history.onpushstate(state, title, url);
        }
        return pushState.apply(history, arguments);
    }
})(window.history);

App = new App();
App.router.init();






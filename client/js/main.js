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
        adminBrand: function () {
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

        if (!data.length) {
            ajaxErrorSelector.style.display = "block";
            return;
        }
        this.fillHomePage(data);
    },
    initBikeInfoPage: function (data) {
        var parsedData = JSON.parse(data);
        var brand = this.getBrandByName(parsedData.brand);
        if (brand) brand = JSON.parse(brand);
        this.el.innerHTML = document.getElementById('product-page').innerHTML;
        this.fillBikeInfoPage(parsedData, brand);
        /**Your code here*/
    },
    fillBikeInfoPage: function (data, brand) {
        var bikeProperties = document.querySelectorAll('.options__title');
        bikeProperties[0].innerHTML = 'Model: ' + data.model;
        bikeProperties[1].innerHTML = '$ ' + data.price;
        bikeProperties[2].innerHTML = 'Size: ' + data.size;
        document.querySelector('.options__visual img').setAttribute('src', '' + data.image);
        document.querySelector('.options__headline').innerHTML = 'Headline: <br />' + data.headline;
        document.querySelector('.options__description').innerHTML = 'description: <br /> ' + data.description;
        if (!brand) return;
        document.querySelector('.options__brand img').setAttribute('src', '' + brand.image);
        document.querySelector('.brand__name').innerHTML = 'Brand: ' + brand.name;
    },
    fillHomePage: function (data) {
        var productContainer = document.querySelector('.product-container');
        data.sort(function (a, b) {
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
                '<div class="product__price">' + '$ '  + el.price + '</div>' +
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
                    alert(xhr.statusText);
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
        var isValid = this.validation.validate(formControls, this.validation.config);
        this.validation.removerErrors(formControls);

        if (!isValid) {
            this.validation.renderErrors(this.validation.errors, formControls);
            return;
        }

        formData = new FormData();
        dataForm = this.generateDataForServer(formControls);

        dataForm.createdDate = new Date().getTime();
        dataForm.createdBy = "User";
        formData.append('image', dataForm.image);
        formData.append('data', JSON.stringify(dataForm));
        this.insertBike(formData);
        event.target.reset();
        event.target.querySelector('img').setAttribute('src', "http://placehold.it/300x300");
    },
    validation: {
        config: {
            image: {
                required: true
            },
            brand: {
                required: true
            },
            model: {
                required: true,
                minlength: 1,
                maxlength: 255
            },
            price: {
                required: true,
                isnumeric: true
            },
            size: {
                required: true,
                isnumeric: true,
                min: 12,
                max: 30
            },
            type: {
                required: true
            },
            headline: {
                required: true,
                minlength: 3,
                maxlength: 20
            },
            description: {
                required: true,
                minlength: 3
            },
            name: {
                required: true,
                minlength: 1
            }
        },

        errors: {},

        types: {
            required: {
                validate: function (value) {
                    return !!value;
                },
                notify: function () {
                    return 'This field is required.';
                }
            },

            min: {
                validate: function (value, min) {
                    return +value > min;
                },
                notify: function (min) {
                    var minlength = min || '';
                    return 'This field shouldn\'t contains less than ' + min + ' value.'
                }
            },

            max: {
                validate: function (value, max) {
                    return +value <= max;
                },
                notify: function (max) {
                    var minlength = max || '';
                    return 'This field shouldn\'t contains more than ' + max + ' value.'
                }
            },

            minlength: {
                validate: function (value, minlength) {
                    return value.length > minlength;
                },
                notify: function (minlength) {
                    var minlength = minlength || '';
                    return 'This field should contains more than ' + minlength + ' letters.'
                }
            },

            maxlength: {
                validate: function (value, maxlength) {
                    return value.length < maxlength;
                },
                notify: function (maxlength) {
                    var maxlength = maxlength || '';
                    return 'This field shouldn\'t contains more than ' + maxlength + ' letters.'
                }
            },

            isnumeric: {
                validate: function (value) {
                    return !isNaN(parseFloat(value)) && isFinite(value);
                },
                notify: function () {
                    return 'Please enter a valid number.';
                }
            }
        },

        validate: function (fields, config) {
            var _this = this;

            this.errors = {};

            Array.prototype.forEach.call(fields, function (item, index, arr) {

                if (config[item.name]) {
                    var types = Object.keys(config[item.name]); // req, min, max ...

                    for (var i = 0; i < types.length; i++) {
                        var checker = types[i];

                        if (!_this.types[checker]) {
                            console.log(' need create the checker');
                            continue;
                        }
                        if (!_this.types[checker].validate(item.value, config[item.name][checker])) {
                            _this.errors[item.name] = _this.types[checker].notify(config[item.name][checker]);
                            break;
                        }
                    }
                }

            });
            return this.hasErrors();
        },

        hasErrors: function () {
            return !(!!Object.keys(this.errors).length);
        },

        createErrorMessage: function (msg) {
            var error = document.createElement('span');
            error.className = 'form__error';
            error.innerHTML = msg;

            return error;
        },

        renderErrors: function (errors, formElements) {
            var i,
                max = formElements.length,
                errorElement;

            for (i = 0; i < max; i++) {

                if (!errors[formElements[i].getAttribute('name')]) continue;

                errorElement = this.createErrorMessage(errors[formElements[i].getAttribute('name')]);

                // add error class
                var parentBox = formElements[i].closest('.form__element');
                parentBox.insertBefore(errorElement, null);
                formElements[i].classList.add('form__control--error');
            }
        },

        removerErrors: function (formElements) {
            var parentBox, elementToRemove,
                i, max = formElements.length;


            for (i = 0; i < max; i++) {
                parentBox = formElements[i].closest('.form__element');
                elementToRemove = parentBox.querySelector('.form__error');

                if (!elementToRemove) continue;

                parentBox.removeChild(elementToRemove);
                formElements[i].classList.remove('form__control--error');
            }
        }

    },
    generateDataForServer: function (data) {
        var buffer = {};
        Array.prototype.forEach.call(data, function (el, index) {
            el.files ? buffer[el.getAttribute('name')] = el.files[0] : buffer[el.getAttribute('name')] = el.value;
        });
        return buffer;
    },
    getBikes: function () {
        return this.sendRequest('GET', '/api/bikes');
    },
    getBrands: function () {
        return this.sendRequest('GET', '/api/brands');
    },
    getBrandByName: function (name) {
        return this.sendRequest('GET', '/api/brand/' + name);
    },
    insertBike: function (formData) {
        return this.sendRequest('POST', '/api/bike', formData);
    },
    insertBrand: function (formData) {
        return this.sendRequest('POST', '/api/brand', formData);
    },
    deleteBrand: function (event) {
        var currentTarget = event.target;
        var name = currentTarget.dataset.name;
        this.sendRequest('DELETE', '/api/brand/' + name);
        this.initAdminBrand();
    },
    initAdminBrand: function () {
        var tableContainer = document.querySelector('.table-container');
        tableContainer.style.display = 'none';
        var brands = JSON.parse(this.getBrands());
        if (brands.length) {
            this.fillAdminTable(brands, tableContainer);
            tableContainer.style.display = 'block';
        }
    },
    fillAdminTable: function (brands, table) {
        var tableBody = table.querySelector('tbody');
        tableBody.innerHTML = '';
        brands.forEach(function (elem) {
            var row = document.createElement('tr');
            var rowString = '<td>' + elem.name + '</td><td><img src="' + elem.image + '" /></td><td><button data-name="' + elem.name + '" onclick="App.deleteBrand(event)">Delete</button></td>';
            row.innerHTML = rowString;
            tableBody.appendChild(row);
        })
    },
    initAddBikePage: function () {
        var brandsArr = this.getBrands();
        if (brandsArr.length) {
            brandsArr = JSON.parse(brandsArr);
            this.applyBrandsToSelect(brandsArr);

        }
        App.el.innerHTML = document.getElementById('addBikePage').innerHTML;
    },
    applyBrandsToSelect: function (data) {
        var brandContainer = document.getElementById('product-brand');
        brandContainer.innerHTML = '<option value="" hidden selected>Select brand</option>';
        data.forEach(function (elem) {
            var option = document.createElement('option');
            option.value = elem.name;
            option.innerHTML = elem.name;
            brandContainer.appendChild(option);
        });
    },
    brandSubmit: function (event) {
        event.preventDefault();
        var formControls = event.currentTarget.querySelectorAll('.form__control');
        var data = this.generateDataForServer(formControls);
        var isValid = this.validation.validate(formControls, this.validation.config);
        this.validation.removerErrors(formControls);

        if (!isValid) {
            this.validation.renderErrors(this.validation.errors, formControls);
            return;
        }
        var formData = new FormData();
        formData.append('image', data.image);
        formData.append('data', JSON.stringify(data));
        this.insertBrand(formData);
        setTimeout(function () {
            App.initAdminBrand();
        }, 1000);
        event.target.reset();
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






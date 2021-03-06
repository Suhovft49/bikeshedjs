"use strict";
var BaseCtrl = (function () {
    function BaseCtrl() {
        var _this = this;
        // Get all
        this.getAll = function (req, res) {
            _this.model.find({}, function (err, docs) {
                if (err) {
                    return console.error(err);
                }
                res.json(docs);
            });
        };
        // Count all
        this.count = function (req, res) {
            _this.model.count(function (err, count) {
                if (err) {
                    return console.error(err);
                }
                res.json(count);
            });
        };
        // Insert
        this.insert = function (req, res) {
            req.body = JSON.parse(req.body.data);
            if(req.file)  req.body.image = req.file.path.replace('client\\', '');
            var obj = new _this.model(req.body);
            obj.save(function (err, item) {
                if (err) {
                    return console.error(err);
                }
                res.status(200).json(item);
            });
        };
        // Get by id
        this.get = function (req, res) {
            _this.model.findOne({ createdDate: req.params.id }, function (err, obj) {
                if (err) {
                    return console.error(err);
                }
                res.json(obj);
            });
        };
        this.getByName = function (req, res) {
            _this.model.findOne({ name: req.params.id }, function (err, obj) {
                if (err) {
                    return console.error(err);
                }
                res.json(obj);
            });
        };
        // Update by id
        this.update = function (req, res) {
            _this.model.findOneAndUpdate({ _id: req.params.id }, req.body, function (err) {
                if (err) {
                    return console.error(err);
                }
                res.sendStatus(200);
            });
        };
        // Delete by id
        this.delete = function (req, res) {
            _this.model.findOneAndRemove({ name: req.params.id }, function (err) {
                if (err) {
                    return console.error(err);
                }
                res.sendStatus(200);
            });
        };
    }
    return BaseCtrl;
}());
exports.default = BaseCtrl;
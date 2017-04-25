"use strict";
var bike = require("./controllers/bike");
var brand = require("./controllers/brand");
var multer = require("multer");
var upload = multer({ dest: './client/uploads/' });

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './client/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().getTime().toString() + file.originalname);
    }
});
upload = multer({ storage: storage });
function setRoutes(app) {
    var bikes = new bike.default();
    var brands = new brand.default();
    // APIs
    app.route('/api/bikes').get(bikes.getAll);
    app.route('/api/brands').get(brands.getAll);
    app.route('/api/bike').post(upload.single('image'), bikes.insert);
    app.route('/api/bike/:id').get(bikes.get);
    app.route('/api/bike/:id').put(bikes.update);
    app.route('/api/bike/:id').delete(bikes.delete);
}
exports.default = setRoutes;
//# sourceMappingURL=routes.js.map
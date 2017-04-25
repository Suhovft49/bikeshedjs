"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var bikeSchema = new mongoose.Schema({
    brand: String,
    type: String,
    createdBy: String,
    createdDate: String,
    model: String,
    headline: String,
    description: String,
    image: String,
    size: Number,
    price: String
});
var Bike = mongoose.model('Bike', bikeSchema);
exports.default = Bike;
//# sourceMappingURL=bike.model.js.map
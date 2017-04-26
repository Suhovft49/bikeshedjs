"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var brandSchema = new mongoose.Schema({
    name: String,
    image: String
});
var Brand = mongoose.model('Brand', brandSchema);
exports.default = Brand;
//# sourceMappingURL=brand.model.js.map
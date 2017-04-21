"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var brandSchema = new mongoose.Schema({
    name: String,
    logo: {
        data: Buffer,
        contentType: String
    }
});
var Brand = mongoose.model('Brand', brandSchema);
exports.default = Brand;
//# sourceMappingURL=brand.model.js.map
var mongoose = require('mongoose');
var ContextDataSchema = mongoose.Schema({
   internal_id : { type : String},
   data : { type: mongoose.Schema.Types.Mixed},
   isCompressed : { type : Boolean, default : false }
}, {minimize: false });

module.exports = ContextDataSchema;
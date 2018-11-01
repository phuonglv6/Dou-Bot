"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var ContextDataSchema=require("./schema-dou-bot");


var ContextData = mongoose.model('ContextData', ContextDataSchema);
var MongoDbClient = (function () {
    function MongoDbClient(options) {
     
    }
    MongoDbClient.prototype.initialize = function (callback) {
       var _this = this;
       var uri = process.env.MONGODB_URI;
       mongoose.connect(uri,{ useNewUrlParser: true })
       .then(function (client) {
          callback(null);
       })
       .catch(function (error) {
          throw Error("Can’t connect to db " + error);
       });
    };
    MongoDbClient.prototype.insertOrReplace = function  (partitionKey, rowKey, entity, isCompressed, callback) {
     var conditions = {
         "internal_id": partitionKey + "," + rowKey
     };
 
     entity = JSON.parse(this.handleDottedFields(entity, /\./g,  "\uff0e"));
     ContextData.findOneAndUpdate(conditions, {
         "data": entity, 
         "isCompressed": isCompressed
        }, {upsert:true}, function(error, res){
          callback(error, null, null);
       });
    };
    MongoDbClient.prototype.retrieve = function (partitionKey,  rowKey, callback) {
      var _this = this;
      var id = partitionKey + "," + rowKey;
      var query = { "$and": [{ "internal_id": id }] };
      ContextData.find(query).exec(function(error, result){
        if (error) {
          callback(MongoDbClient.getError(error), null, null);
        }
        else if (result.length == 0) {
          callback(null, null, null);
        }
        else {
          var finaldoc = result[0];
          finaldoc = JSON.parse(_this.handleDottedFields(finaldoc,    /\uff0e/g, "."));
          finaldoc["id"] = id;
          callback(null, finaldoc, null);
        }
     });
   };
   MongoDbClient.getError = function (error) {
     if (!error)
       return null;
     return new Error("Error Code: " + error.code + " Error Body: "  + error.message);
   };
    MongoDbClient.prototype.handleDottedFields = function (obj,   target, replacementStr) {
       return JSON.stringify(obj, function (key, value) {
          if (value && Object.prototype.toString.call(value) ===  "[object Object]") {
            var replacement = {};
            for (var k in value) {
               if (Object.hasOwnProperty.call(value, k)) {
                 replacement[k.replace(target,replacementStr)] = value[k];
               }
            }
            return replacement;
         }
         return value;
      });
    };
 
    return MongoDbClient;
}());
exports.MongoDbClient = MongoDbClient;
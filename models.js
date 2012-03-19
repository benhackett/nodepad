var mongoose = require('mongoose').Mongoose;

mongoose.model('Document', {
	properties: ['title', 'data', 'tags',],

	indexes: [
	'title'
	]
});

exports.Document = function(db){
	return db.model('Document');
};

getters: {
	id: function(){
		return this._id.toHexString();
	}
}
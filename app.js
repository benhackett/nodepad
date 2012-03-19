
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , mongoose = require('mongoose').mongoose
  , db = mongoose.connect('mongodb://localhost/nodepad')
  , Document = require('./models.js').Document(db);

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.logger());
  app.use(express.errorHandler({
  	dumpExceptions:true,
  	showStack:true
  }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
  app.use(express.logger());
});

app.configure(function(){
	app.use(express.logger());
});

app.configure('test', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  db = mongoose.connect('mongodb://localhost/nodepad-test');
});

// Routes

app.get('/', routes.index);

app.get('/documents', function(req, res){
	Document.find().all(function(documents){
		// 'documents' will contain all of the documents returned by the query
		res.send(documents.map(function(d){
			//return a useful representation of the object that res.send can send as JSON
			return d.__doc;
		}));
	});
});

//format can be json or html
app.get('/documents.:format?', function(req,res){
  //Some kind of Mongo Query/Update
  Document.find().all(function(documents){
    switch (req.params.format) {
      //when json, generate suitable data
      case 'json':
        res.send(document.map(function(d){
          return d.__doc;
        }));
      break;

      //else render a database template (this isn't ready yet)
      default:
        res.render('documents/index.jade');
    }
  });
});

app.get('/documents/:id.:format?/edit', function(req,res){
  Document.findById(req.params.id, function(d){
    res.render('documents/edit.jade', {
      locals: { d: d }
    });
  });
});

app.get('/documents/new', function(req, res) {
  res.render('documents/new.jade', {
    locals: { d: new Document() }
  });
});

app.post('/documents.:format?', function(req, res) {
  var document = new Document(req.body['document']);
  document.save(function() {
    switch (req.params.format) {
      case 'json':
        res.send(document.__doc);
       break;

       default:
        res.redirect('/documents');
    }
  });
});

app.put('/documents/:id.:format?', function(req, res){
  //Load the document
  Document.findById(req.body.document.id, function(d){
    d.title = req.body.document.title;
    d.data = req.body.document.data;

    //persiste the changes
    d.save(function(){
      switch (req.params.format){
        case 'json':
          res.send(d.__doc);
          break;

          default:
            res.redirect('/documents');
      }
    });
  });
});

res.render('documents/index.jade', {
  locals: {documents: documents}
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

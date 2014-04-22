var util = require('utils'),
  fs = require('fs'),
  casper = require('casper').create({
    verbose: true,
    logLevel: 'debug',
    waitTimeout: 10000000
  });

var data = [];

var getData = function() {
  var dataList = [],
      nodes = $('#dtree1>.dTreeNode');

   dataList = _.map(nodes, function(n) {
    var result, children,
      name = $(n).text(),
      childNodeId = $(n).children()[3].id.slice(5);

    result = {
      id: childNodeId - 1,
      name: name,
      districts: []
    };

    // Get children nodes (districts)
    children = $('#dtree' + childNodeId).children();

    console.log('Province: ' + name);

    // Add the children nodes
    result.districts = _.map(children, function(c) {
      var id = $(c).children()[3].id.slice(5),
        name = $(c).text();

      console.log('------------- ' + name);

      return { id: id, name: name };
    });

    return result;
  });

  return dataList;
};

var removeTTTP = function() {
  var i;
  for(i = 0; i < 5; i++) {
    data[i].districts.splice(0, 1);
  }
};


casper.start('http://gis.chinhphu.vn/');

casper.on('remote.message', function(msg) {
  this.echo('remote message caught: ' + msg);
});

// Must wait for all the tree nodes to load
casper.waitForSelector('.dTreeNode', function() {
  this.page.injectJs('node_modules/jquery/dist/jquery.min.js');
  this.page.injectJs('node_modules/lodash/lodash.js');
});

casper.then(function() {
  var i;
  // After each click the tree will create a new node so there is total 126 nodes.
  // The original nodes are the ones with odd number
  for (i = 1; i < 126; i += 2) {
    this.click('#dtree1 .dTreeNode:nth-child(' + i + ') a:nth-child(2)');
  }
});

// Wait for the last node to load then load the data from those nodes
casper.waitForSelector('#dtree64', function() {
  data = this.evaluate(getData);
  // Remove additional districts 'TTTP' for 5 cities
  removeTTTP();
});

// Write to file
casper.then(function() {
  // Dump the data to json
  var dataStr = JSON.stringify(data);
  fs.write('data.json', dataStr);
});

casper.run(function() {
  this.echo(data.length + ' provinces found:');
  this.exit();
});

var _ = require('lodash'),
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
    var result = {}, childs,
        text = $(n).text(),
        childNodeId = $(n).children()[3].id.slice(5);

    result.province = text;
    result.districts = [];
    result.id = childNodeId - 1;

    childs = $('#dtree' + childNodeId).children();

    console.log('Province: ' + text);

    result.districts = _.map(childs, function(c) {
      console.log('------------- ' + $(c).text());
      return $(c).text();
    });

    return result;
  });

  return dataList;
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
  for (i = 1; i < 126; i += 2) {
    this.click('#dtree1 .dTreeNode:nth-child(' + i + ') a:nth-child(2)');
  }
});

casper.waitForSelector('#dtree64', function() {
  data = this.evaluate(getData);
});

casper.run(function() {
  var that = this;
  this.echo(data.length + ' links found:');
  this.echo(' - ' + data.join('\n - '));
  this.exit();
});

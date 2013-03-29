js-highcharts
=============
Simplified interface for the library highcharts(http://www.highcharts.com/demo/line-time-series/gray).

Author
----------
Tomas Perez - tom@0x101.com

http://www.tomasperez.com

Examples
----------

The following example will fetch data returned by the service 'http://api.mydomain.com/service',
will apply a transform function to it and will draw a graph with it on the HTML div container with
'container' as id.

Note: unfortunately the library highcharts require JQuery, prototype or mootools to be
available in your web application.

	Charts.loadData({
	  source: 'http://api.mydomain.com/service'
	}).transform(function(data) {

	  var data = JSON.parse(data);
	  result = [];

	  var total = 0;
	  for (var i = data.length-1; i > -1 ; i--) {
	    var value = JSON.parse(data[i].data);
	    total += value.newElements;
	    result.push(total);
	  }

	  return result;

	}).draw({
	  container: document.getElementById('container')
	});


License
-----------
Public Domain.

No warranty expressed or implied. Use at your own risk.

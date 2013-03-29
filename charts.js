if (typeof window.Charts === 'undefined') {
  window.Charts = {};
}

window.Charts = (function(namespace) {

  var Charts = function() {

    /**
     * @type {Boolean} loaded
     */

    var loaded = false;

    /**
     * @type {Array} data
     */

    var data = null;

    /**
     * @type {Array} result
     */

    var result = null;

    /**
     * @type {Object} callbacks
     * @private
     */

    var callbacks = {
      load: [],
      loadData: [],
      transform: []
    };

    /**
     * @type {Object} constants
     * @private
     */

    var constants = {

      /**
       * @type {String} path
       */

      path: 'http://code.highcharts.com/highcharts.js'

    };

    /**
     * @method _dispatch
     * @param {String} event
     * @private
     */

    var _dispatch = function(event) {

      var listeners = callbacks[event];

      for (var i = 0; i < listeners.length; i++) {
        if (typeof listeners[i] === 'function') {
          listeners[i]();
        }
      }

      // Clear the listeners.
      callbacks[event] = [];

    };

    /**
     * @param {Object} options
     * @method _draw
     * @private
     */

    var _draw = function(options) {

      $(options.element).highcharts({
        chart: {
          zoomType: 'x',
          spacingRight: 20
        },
        title: {
          text: options.title
        },
        subtitle: {
          text: document.ontouchstart === undefined ?
            'Click and drag in the plot area to zoom in' :
            'Drag your finger over the plot to zoom in'
        },
        xAxis: {
          type: 'datetime',
          maxZoom: 10 * 24 * 3600000,
          title: {
            text: null
          }
        },
        yAxis: {
          title: {
            text: options.yTitle
          }
        },
        tooltip: {
          shared: true
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          area: {
            fillColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
              stops: [
                [0, Highcharts.getOptions().colors[0]],
                [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
              ]
            },
            lineWidth: 1,
            marker: {
              enabled: false
            },
            shadow: false,
            states: {
              hover: {
                lineWidth: 1
              }
            },
            threshold: null
          }
        },
        series: [{
          type: 'area',
          name: 'Number of rows',
          pointInterval: 24 * 3600 * 1000,
          pointStart: Date.UTC(2013, 2, 24),
          data: options.data
        }]
      });

    };

    /**
     * @param {HTMLElement} scriptElement
     * @method _attachEvents
     * @private
     */

    var _attachEvents = function(scriptElement) {

      var onLoaded = function() {
        loaded = true;
        _dispatch('load');
      };

      if (typeof scriptElement.onreadystatechange !== 'undefined') {

        scriptElement.onreadystatechange = function() {
          if (this.readyState === 'complete') {
            onLoaded();
          }
        };

      } else {
        scriptElement.onload = onLoaded;
      }

    };

    /**
     * Inject the highcharts library
     *
     * @method load
     * @public
     */

    this.load = function() {

      var script= document.createElement('script');

      script.type= 'text/javascript';
      script.src= constants.path;

      var head= document.getElementsByTagName('head')[0];
      head.appendChild(script);

      _attachEvents(script);

      return this;

    };

    /**
     * @param {Object} args
     *   {String} args.title
     * @method draw
     * @public
     */

    this.draw = function(args) {

      if (result === null) {

        var self = this;
        callbacks.transform.push(function() {
          self.draw(args);
        });

      } else {

        if (typeof args === 'undefined') {
          args = {};
        }

        var options = {
          element: args.container || null,
          title: args.title || '',
          yTitle: args.yTitle || '',
          source: args.source || null,
          data: result
        };

        _draw(options);

      }

    };

    /**
     * @method loadData
     */

    this.loadData = function(args) {

      if (!loaded) {

        var self = this;
        callbacks.load.push(function() {
          self.loadData(args);
        });

        this.load();

      } else {

        if (typeof args === 'undefined') {
          args = {};
        }

        var options = {
          source: args.source || ''
        };

        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
          if (request.readyState === 4) {
            data = JSON.parse(request.responseText);
            _dispatch('loadData');
          }
        };

        request.open('get', options.source, '', true);
        request.send();

      }

      return this;

    };

    /**
     * @param {Function} callback
     * @method transform
     * @public
     */

    this.transform = function(callback) {

      if (data === null) {

        var self = this;
        callbacks.loadData.push(function() {
          self.transform(callback);
        });

      } else {
        result = callback(data);
        _dispatch('transform');
      }

      return this;

    };

  };

  namespace = new Charts();

  return namespace;

})(window.Charts);

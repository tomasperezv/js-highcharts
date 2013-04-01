/**
 * @author tom@0x101.com
 */

if (typeof window.Charts === 'undefined') {
	window.Charts = {};
}

window.Charts = (function(namespace) {

  var Charts = function() {

		/**
		 * @type {Array} completedIds
		 */

		var completedIds = [];

		/**
		 * @type {Boolean} loaded
		 */
	
    var loaded = false;
	
		/**
		 * @type {Array} data
		 */
	
		var data = null;

		/**
		 * @type {Object} result
		 */

		var result = {};

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
		 * @metho	{String} event 
		 * @param {String} event
		 * @param {Integer} id
		 * @private
		 */
	
    var _dispatch = function(event, id) {

			var listeners = callbacks[event];
			for (var i = 0; i < listeners.length; i++) {

				if (typeof listeners[i] === 'function' && (typeof listeners[i].id === 'undefined' || listeners[i].id === id)) {
					listeners[i](id);
				}

			}

			if (typeof id === 'undefined') {
				callbacks[event] = [];
			}

		};

		/**
		 * @param {Object} options
		 * @method _draw
		 * @private
		 */

		var _draw = function(options) {

			if (typeof window.theme !== 'undefined') {
				var highchartsOptions = Highcharts.setOptions(window.theme);
			}

			// Insert automaticall the div container for the chart
			if (options.element === null) {
				options.element = window.Charts.Util.injectContainer();
			}

			$(options.element).highcharts({
				title: {
					text: options.title
				},
				xAxis: {
					type: 'datetime',
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
				series: [{
					name: options.title,
					data: options.data
				}]
			});

			return this;

    };
	
    /**
		 * Inject the highcharts library
		 *
		 * @method load
		 * @public
		 */
		
		this.load = function() {
		
			this.Util.injectScript(constants.path, function() {
					loaded = true;
					_dispatch('load');
			});
		
		};
		
		/**
		 * @param {Object} args
		 *   {String} args.title
		 * @method draw
		 * @public
		 */
		
		this.draw = function(args, id) {
		
			if (typeof id === 'undefined') {
		
				var self = this;
				(function(id) {
		
					var callback = function() {
						self.draw(args, id);
					};
		
					callback.id = this.callerId;
					callbacks.transform.push(callback);
			
				})(self.callerId);
		
			} else if (typeof result[id] !== 'undefined' && completedIds.indexOf(id) === -1) {

				completedIds.push(id);

				if (typeof args === 'undefined') {
					args = {};
				}
		
				var options = {
					element: args.container || null,
					title: args.title || '',
					yTitle: args.yTitle || '',
					source: args.source || null,
					data: result[id]
				};
		
				_draw(options);
		
			}
		
			return this;
		
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
					source: args.source || '',
					params: args.params || null
				};
		
				this.Util.fetch(function(result) {
					data = result;
						_dispatch('loadData');
				}, options);
			}
		
			return this;
		
		};
		
		/**
		 * @param {Function} callback
		 * @param {Integer} id 
		 * @method transform
		 * @public
		 */
		
		this.transform = function(callback, id) {
		
			if (data === null) {
		
				var callerId = this.Util.randomId();
		
				var self = this;
				callbacks.loadData.push(function() {
					self.transform(callback, callerId);
				});
		
				this.callerId = callerId;
		
			} else {
				result[id] = callback(data);
				_dispatch('transform', id);
			}
		
			return this;
		
    };
	
  };

	namespace = new Charts();

	return namespace;

})(window.Charts);

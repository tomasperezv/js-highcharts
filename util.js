if (typeof window.Charts === 'undefined') {
  window.Charts = {};
}

window.Charts = (function(namespace) {

	/**
	 * @param {Object} params
	 * @return {String}
	 * @method _getURL  
	 * @private
	 */

	var _getURL = function(params) {

		var url = '';
		if (params !== null) {
			for (var key in params) {
				if (params.hasOwnProperty(key)) {
					if (url.length > 0) {
						// Not the first parameter, add '&'
						url += '&';
					}
					url += key + '=' + encodeURIComponent(params[key]);
				}
			}
		}

		return url;

	};

  var Util = function() {

		/**
		 * @param {Function} onSuccess
		 * @param {Object} options 
		 * @method fetch
		 * @public
		 */

		this.fetch = function(onSuccess, options) {

			var request = new XMLHttpRequest();
			request.onreadystatechange = function() {
				if (request.readyState === 4 && typeof onSuccess === 'function') {
					try {
						var data = JSON.parse(request.responseText);
						onSuccess(data);
					} catch(e) {
						// Error parsing the data from the service
					}
				}
			};

			var params = _getURL(options.params);

			request.open('POST', options.source, true);
			request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			request.send(params);

		};

  };

  namespace.Util = new Util();

  return namespace;

})(window.Charts);

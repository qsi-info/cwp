
(function () {

	var _root = (typeof window !== 'undefined' && window !== null) ? window : global;

	// CWP
	_root.CWP = {
		version: '1.0',
		author: 'Alexandre Pagé',
		log: true,
	};

	// Debug
	_root.CWP.Debug = (function () {

		function _Class () {};

		_Class.log = function (message) {
			if (CWP.log) {
				console.log(message);
			};
		};

		_Class.warn = function (message) {
			if (CWP.log) {
				console.warn(message);
			};			
		};

		return _Class;

	})();


	// Commons
	_root.CWP.Commons = (function () {

		function _Class () {};

		_Class.getUrlParam = function (key, url) {
			var hash;
			var url = typeof url !== 'undefined' ? url : window.location.href;
			var hashes = url.slice(url.indexOf('?') + 1).split('&');
			for (var i=0, len=hashes.length; i < len; i++) {
				hash = hashes[i].split('=');
				if (window.decodeURIComponent(hash[0]) == key) {
					return window.decodeURIComponent(hash[1]).replace('#', '');
				}
			}
			return false;
		};

		return _Class;

	})();


	// Frame
	_root.CWP.Frame = (function () {

		function _Class () {};

		_Class.resize = function (width, height) {
			var width = typeof width !== 'undefined' ? width : '100%';
			var height = typeof height !== 'undefined' ? height : window.screen.availHeight;
			var message = "<message senderId=" + CWP.Commons.getUrlParam('SenderId') + ">resize(" + width + ", " + height + ")</message>";
		}

		_Class.loadFile = function (fileName, fileType)  {
			var ref;
			if (fileType == 'js') {
				ref = document.createElement('script');
				ref.setAttribute('type', 'text/javascript');
				ref.setAttribute('src', fileName + '.' + fileType);
			}
			if (fileType == 'css') {
				ref = document.createElement('link');
				ref.setAttribute('type', 'text/css');
				ref.setAttribute('rel', 'stylesheet');
				ref.setAttribute('href', fileName + '.' + fileType);
			}
			if (typeof ref !== 'undefined') {
				document.getElementByTagName('head')[0].appendChild(ref);
			}
		}

		return _Class;

	})();


	// CrossDomain
	_root.CWP.CrossDomain = (function () {

		function _Class () {};

		_Class.host = function () {
			return CWP.Commons.getUrlParam('SPHostUrl');
		};

		_Class.app = function () {
			return CWP.Commons.getUrlParam('SPAppWebUrl');
		};

		return _Class;

	})();



	// CrossDomain Headers
	_root.CWP.CrossDomain.Headers = (function () {

		function _Class () {};

		_Class.read = function () {
			return {
				'accept' : 'application/json; odata=verbose'
			};
		};

		_Class.post = function () {
			return {
				'accept' : 'application/json;odata=verbose',
				'content-type' : 'application/json;odata=verbose'				
			};
		};

		_Class.put = function () {
			return {
				'IF-MATCH' : '*',
				'X-HTTP-METHOD' : 'MERGE',
				'content-type' : 'application/json;odata=verbose',
			};
		};

		_Class.delete = function () {
			return {
				'IF-MATCH' : '*',
				'X-HTTP-METHOD' : 'DELETE',
			};
		};

		return _Class;

	})();



	// CrossDomain Methods
	_root.CWP.CrossDomain.Methods = (function () {

		function _Class () {};

		_Class.read = function () {
			return 'GET';
		};

		_Class.post = function () {
			return 'POST';
		};

		_Class.put = function () {
			return 'POST';
		};

		_Class.delete = function () {
			return 'POST';
		};

		return _Class;

	})();



	// CrossDomain Request
	_root.CWP.CrossDomain.Request = (function () {

			// Microsoft CrossDomain Class
		var executor = new SP.RequestExecutor(CWP.CrossDomain.app());

		function _Class (params) {
			this.url = params.url;
			this.action = params.action;
			this.payload = typeof params.payload !== 'undefined' ? params.payload : {};
			this.success = typeof params.success !== 'undefined' ? params.success: CWP.Debug.log;
			this.error = typeof params.error !== 'undefined' ? params.error: CWP.Debug.log;
		}

		_Class.prototype.execute = function () {
			executor.executeAsync({
				url: CWP.CrossDomain.app() + "/_api/SP.AppContextSite(@target)" + this.url + "?@target='" + CWP.CrossDomain.host() + "'",
				method: CWP.CrossDomain.Methods[this.action],
				headers: CWP.CrossDomain.Headers[this.action],
				body: JSON.strinify(this.payload),
				success: this.success,
				error: this.error,
			});
		};

		return _Class;

	})();




	// SPList
	_root.CWP.SPList (function () {

		function _Class (listTitle) {
			this.listTitle = listTitle;
		}

		_Class.prototype.list = function (success, error) {
			var req = new CWP.CrossDomain.Request({
				url: "/web/list/getbytitle('" + this.listTitle + "')", 
				action: 'read',
				success: function (response) {
					return success(JSON.parse(resonse.body).d, response);
				},
				error: error,
			});
			req.execute();			
		}

		_Class.prototype.all = function (success, error) {
			var req = new CWP.CrossDomain.Request({
				url: "/web/list/getbytitle('" + this.listTitle + "')/items", 
				action: 'read',
				success: function (response) {
					return success(JSON.parse(resonse.body).d.results, response);
				},
				error: error,
			});
			req.execute();
		};

		_Class.prototype.find = function (id, success, error) {
			var req = new CWP.CrossDomain.Request({
				url: "/web/list/getbytitle('" + this.listTitle + "')/items('" + id + "')", 
				action: 'read',
				success: function (response) {
					return success(JSON.parse(resonse.body).d, response);
				},
				error: error,
			});
			req.execute();		
		};

		_Class.prototype.create = function (payload, success, error) {
			payload.__metadata = {
				'type': 'SP.Data.' + this.listTitle.replace(/ /g, 'X0020') + 'ListItem' 
			}
			var req = new CWP.CrossDomain.Request({
				url: "/web/list/getbytitle('" + this.listTitle + "')/items", 
				action: 'post', 
				payload: payload,
				success: function (response) {
					return success(JSON.parse(resonse.body).d, response);
				},
				error: error,
			});
			req.execute();
		};

		_Class.prototype.remove = function (id, success, error) {
			var req = new CWP.CrossDomain.Request({
				url: "/web/list/getbytitle('" + this.listTitle + "')/items('" + id + "')", 
				action: 'delete',
				success: success,
				error: error,
			});
			req.execute();
		};

		_Class.prototype.update = function (id, payload, success, error) {
			payload.__metadata = {
				'type': 'SP.Data.' + this.listTitle.replace(/ /g, 'X0020') + 'ListItem' 
			}			
			var req = new CWP.CrossDomain.Request({
				url: "/web/list/getbytitle('" + this.listTitle + "')/items('" + id + "')", 
				action: 'put', 
				payload: payload,
				success: success,
				error: error,
			}),
			req.execute();
		};

		return _Class;

	})();



})();



(function(Data, NonstaticClass, StaticClass){
this.BatchLoad = (function(CallServer){
	function BatchLoad(name, _complete){
		///	<summary>
		///	分页加载。
		///	</summary>
		/// <params name="name" type="string">ajax名称</params>
		/// <params name="_complete" type="function">当ajax完成时所执行的函数</params>

		this.assign({
			name : name,
			params : {},
			complete : _complete
		});
	};
	BatchLoad = new NonstaticClass(BatchLoad, "Bao.API.Data.BatchLoad");

	BatchLoad.properties({
		callServer : function(){
			///	<summary>
			///	访问服务器取数据。
			///	</summary>
			var p = {},	params = this.params, forEach = jQun.forEach;

			// 初始化ajax参数
			forEach(params, function(param, name){
				var handler = param.handler, value = param.value;

				// 如果没有处理逻辑
				if(handler === undefined){
					p[name] = value;
					return;
				}

				p[name] = typeof handler === "function" ? handler(value, name) : value + handler;
			});

			// 访问服务器
			CallServer.open(this.name, p, function(data){
				// 设置回馈参数信息，确保参数统一
				forEach(params, function(param, name){
					var value = data[name];

					if(value === undefined)
						return;

					param.value = value;
				});

				// 是否执行完成时所需调用的函数
				if(typeof this.complete !== "function")
					return;

				this.complete(data);
			}.bind(this));
		},
		complete : undefined,
		getParam : function(name){
			///	<summary>
			///	获取参数值。
			///	</summary>
			/// <params name="name" type="string">参数的名称</params>
			var param = this.params[name];

			return param ? param.value : undefined;
		},
		isEqual : function(name, anotherName){
			///	<summary>
			///	判断2个参数的值是否相等。
			///	</summary>
			/// <params name="name" type="string">参数的名称</params>
			/// <params name="anotherName" type="string">需要对比的另一个参数名称</params>
			return this.getParam(name) == this.getParam(anotherName);
		},
		name : "",
		params : undefined,
		setParam : function(name, value, _handle){
			///	<summary>
			///	设置参数。
			///	</summary>
			/// <params name="name" type="string">参数的名称</params>
			/// <params name="value" type="*">参数的值</params>
			/// <params name="_handle" type="*">参数的处理逻辑</params>
			this.params[name] = {
				value : value,
				handle : _handle
			};
		}
	});

	return BatchLoad.constructor;
}(
	Bao.CallServer
));

this.Cache = (function(JSON, sessionStorage){
	function Cache(name){
		///	<summary>
		///	缓存数据。
		///	</summary>
		/// <params name="name" type="string">缓存数据的标识名称</params>
		this.assign({
			name : name
		});
	};
	Cache = new NonstaticClass(Cache, "Bao.API.Data.Cache");

	Cache.properties({
		del : function(key){
			///	<summary>
			///	删除某一条缓存数据。
			///	</summary>
			/// <params name="key" type="string">缓存数据的主键</params>
			var storage = this.get();

			delete storage[key];
			sessionStorage.setItem(this.name, JSON.stringify(storage));
		},
		get : function(_key){
			///	<summary>
			///	获取某一条缓存数据。
			///	</summary>
			/// <params name="_key" type="string">缓存数据的主键</params>
			var storage = JSON.parse(sessionStorage.getItem(this.name));

			if(!storage){
				storage = {};
			}

			if(_key === undefined){
				return storage;
			}

			return storage[_key];
		},
		name : "",
		set : function(key, value){
			///	<summary>
			///	设置某一条缓存数据。
			///	</summary>
			/// <params name="key" type="string">缓存数据的主键</params>
			/// <params name="value" type="object,string,number">缓存数据的值</params>
			var storage = this.get();

			storage[key] = value;
			sessionStorage.setItem(this.name, JSON.stringify(storage));
		}
	});

	return Cache.constructor;
}(
	// JSON
	jQun.JSON,
	// sessionStorage
	sessionStorage
));

Data.members(this);
}.call(
	{},
	Bao.API.Data,
	jQun.NonstaticClass,
	jQun.StaticClass
));
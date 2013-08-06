(function(Data, NonstaticClass, StaticClass){
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

this.Pagination = (function(CallServer){
	function Pagination(ajaxName, _complete, _before){
		///	<summary>
		///	分页加载。
		///	</summary>
		/// <params name="ajaxName" type="string">ajax名称</params>
		/// <params name="_complete" type="function">当ajax完成时所执行的函数</params>
		/// <params name="_before" type="function">当ajax将要执行的前奏函数</params>

		this.assign({
			ajaxName : ajaxName,
			before : _before,
			complete : _complete
		});
	};
	Pagination = new NonstaticClass(Pagination, "Bao.API.Data.Pagination");

	Pagination.properties({
		ajaxName : "",
		before : undefined,
		callServer : function(){
			///	<summary>
			///	访问服务器取数据。
			///	</summary>
			var params = {
				pageIndex : this.index++,
				pageSize : this.size
			};

			if(typeof this.before === "function"){
				this.before(params);
			}

			CallServer.open(this.ajaxName, params, function(data){
				this.resetIndex(data.pageIndex);
				this.resetMax(data.pageMax);

				if(typeof this.complete !== "function")
					return;

				this.complete(data);
			}.bind(this));
		},
		complete : undefined,
		index : 0,
		isLastPage : function(){
			return this.index == this.max;
		},
		max : -1,
		resetIndex : function(index){
			///	<summary>
			///	设置分页索引。
			///	</summary>
			/// <params name="index" type="number">分页索引</params>
			this.index = index;
		},
		resetMax : function(max){
			///	<summary>
			///	设置分页索引最大值。
			///	</summary>
			/// <params name="max" type="number">分页索引最大值</params>
			this.max = max;
		},
		resetSize : function(size){
			///	<summary>
			///	设置分页大小。
			///	</summary>
			/// <params name="size" type="number">分页大小</params>
			this.size = size;
		},
		size : 10
	});

	return Pagination.constructor;
}(
	Bao.CallServer
));

Data.members(this);
}.call(
	{},
	Bao.API.Data,
	jQun.NonstaticClass,
	jQun.StaticClass
));
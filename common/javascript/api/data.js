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

this.Pagination = (function(){
	function Pagination(_size){
		this.assign({
			size : _size || this.size
		});
	};
	Pagination = new NonstaticClass(Pagination, "Bao.API.Data.Pagination");

	Pagination.properties({
		index : 0,
		isLastPage : function(){
			return this.index == this.max;
		},
		max : 0,
		set : function(index, _max){
			this.index = index;

			if(_max == undefined){
				return;
			}

			this.max = max;
		},
		size : 10
	});

	return Pagination.constructor;
}());

Data.members(this);
}.call(
	{},
	Bao.API.Data,
	jQun.NonstaticClass,
	jQun.StaticClass
));
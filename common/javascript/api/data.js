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

Data.members(this);
}.call(
	{},
	Bao.API.Data,
	jQun.NonstaticClass,
	jQun.StaticClass
));
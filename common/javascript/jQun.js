/*
 *  类库名称：jQun
 *  中文释义：骥群(聚集在一起的千里马)
 *  文档状态：1.0.5.1
 *  本次修改：基类的assign方法修改，不支持未定义的值，目的是减少赋值的保护判断：
 *			 当赋值的时候，如果值为undefined，则跳过，进行下个属性的赋值
 *  开发浏览器信息：firefox 20.0 、 chrome 26.0 、 IE9等
 */

(function(Object, Array, Function){
var jQun,

	NonstaticClass, StaticClass,

	List, ElementPropertyCollection,

	emptyAttrCollection,

	undefined,

	forEach;


jQun = (function(argRegx, argListRegx, every, toNative){
	function jQun(_selector){
		///	<summary>
		///	返回一个通过指定选择器筛选出来的元素集合。
		///	</summary>
		///	<param name="_selector" type="string, element，array">选择器、html、dom元素或dom元素数组。</param>
		if(jQun.isInstanceOf(this, arguments.callee)){
			return this.creator.apply(this, arguments);
		}

		return new jQun.HTMLElementList(_selector);
	};
	jQun.prototype = Object.create(null, { constructor : { value : jQun, writable : true } });

	with(jQun){
		// 为jQun添加常用方法
		every({
			define : function(obj, name, value, _descriptor){
				///	<summary>
				///	将属性添加到对象或修改现有属性的特性。
				///	</summary>
				///	<param name="obj" type="object">对其添加或修改属性的对象。</param>
				///	<param name="name" type="string">需要添加或修改的属性名。</param>
				///	<param name="value" type="*">需要添加或修改的属性值。</param>
				///	<param name="_descriptor" type="object">需要添加或修改的属性描述符。</param>
				var isAccessor, desc = { configurable : true, writable : true };

				if(!_descriptor){
					_descriptor = {};
				}

				isAccessor = !!(_descriptor.gettable || _descriptor.settable);

				for(var d in _descriptor){
					desc[d] = _descriptor[d];
				}

				if(isAccessor){
					desc.get = value.get;
					desc.set = value.set;

					delete desc["writable"];
				}
				else{
					desc.value = value;
				}

				Object.defineProperty(obj, name, desc);

				if(desc.extensible === false && !isAccessor){
					Object.preventExtensions(obj[name]);
				}

				return obj;
			},
			defineProperties : function(obj, properties, _descriptor){
				///	<summary>
				///	将一个或多个属性添加到对象，并/或修改现有属性的特性。
				///	</summary>
				///	<param name="obj" type="object">对其添加或修改属性的对象。</param>
				///	<param name="properties" type="object">包含一个或多个属性的键值对。</param>
				///	<param name="_descriptor" type="object">需要添加或修改的属性描述符。</param>
				forEach(properties, function(value, name){
					define(obj, name, value, _descriptor);
				});

				return obj;
			},
			every : every,
			except : function(args, properties){
				///	<summary>
				///	返回一个不包含所有指定属性名称的合并对象。
				///	</summary>
				///	<param name="args" type="object">用于合并的对象集合。</param>
				///	<param name="properties" type="array">需要排除的属性名称数组。</param>
				var result = {};

				forEach(toArray(arguments, 0, -1), function(obj){
					for(var name in obj){
						result[name] = obj[name];
					}
				});

				forEach(arguments[arguments.length - 1], function(name){
					delete result[name];
				});
				return result;
			},
			forEach : function(obj, fn, _this){
				///	<summary>
				///	遍历对象的所有枚举成员并对其执行指定操作函数。
				///	</summary>
				///	<param name="obj" type="object">需要遍历的对象。</param>
				///	<param name="fn" type="function">指定操作的函数。</param>
				///	<param name="_this" type="*">指定操作函数的 this 对象。</param>
				every(obj, function(){
					fn.apply(this, arguments);
					return true;
				}, _this);
			},
			isInstanceOf : function(obj, constructor){
				///	<summary>
				///	判断对象是否为指定类构造函数的一级实例（即直接由该类实例化）。
				///	</summary>
				///	<param name="obj" type="object">用于判断的实例对象。</param>
				///	<param name="constructor" type="function">指定的类。</param>
				return Object.getPrototypeOf(obj) === constructor.prototype;
			},
			isPropertyOf : function(obj, property){
				///	<summary>
				///	检测对象自己是否具有指定属性或访问器。
				///	</summary>
				///	<param name="obj" type="object">一个可能具有指定属性或访问器的对象。</param>
				///	<param name="property" type="*">用于检测的属性或访问器。</param>
				var names = ["value", "get", "set"];

				return !Object.getOwnPropertyNames(obj).every(function(name){
					return every(3, function(i){
						return this[names[i]] !== property;
					}, this(obj, name));
				}, Object.getOwnPropertyDescriptor);
			},
			merge : function(obj, args){
				///	<summary>
				///	深度合并对象中所有项，返回一个新的对象。
				///	</summary>
				///	<param name="obj" type="object, array">需要合并的项。</param>
				///	<param name="args" type="object, array">其他需要合并的项列表。</param>
				if(obj instanceof Array)
					return obj.concat.apply(obj, toArray(arguments, 1));

				var result = {}, another = arguments[1];

				nesting(arguments, function(value, name){
					result[name] = typeof value === "object" ? merge(value) : value;
				});
				return result;
			},
			nesting : function(obj, fn, _this){
				///	<summary>
				///	将对象中的每个枚举元素进行再枚举并执行指定操作（双重嵌套的forEach）。
				///	</summary>
				///	<param name="obj" type="object">需要嵌套枚举并执行指定操作的对象（一般为json）。</param>
				///	<param name="fn" type="function">指定的操作函数。</param>
				///	<param name="_this" type="*">指定操作函数的 this 对象。</param>
				if(fn === undefined){
					fn = fn.bind(_this);
				}

				forEach(obj, function(o){
					forEach(o, fn);
				});
			},
			set : function(obj, properties){
				///	<summary>
				///	添加或修改指定对象的属性。
				///	</summary>
				///	<param name="obj" type="object">需要添加或修改属性的对象。</param>
				///	<param name="properties" type="object">需要添加或修改的属性集合。</param>
				forEach(properties, function(val, name){
					obj[name] = val;
				});

				return obj;
			},
			toArray : function(obj, _start, _end){
				///	<summary>
				///	将类似数组的对象转化为数组。
				///	</summary>
				///	<param name="obj" type="object">需要转化为数组的对象。</param>
				///	<param name="_start" type="number">进行截取，截取的起始索引。</param>
				///	<param name="_start" type="number">需要截取的末尾索引。</param>
				return [].slice.call(obj, _start || 0, _end);
			},
			toString : toNative
		}, function(value, name, methods){
			var define = methods.define;

			define(value, "toString", toNative);
			define(jQun, name, value);

			return true;
		});

		// 定义类的基础方法
		defineProperties(prototype, {
			assign : function(properties){
				///	<summary>
				///	给该类的属性赋值。
				///	</summary>
				///	<param name="properties" type="object">包含一个或多个属性的键值对。</param>
				forEach(properties, function(val, name){
					if(val === undefined){
						return;
					}

					this[name] = val;
				}, this);

				return this;
			},
			base : function(args){
				///	<summary>
				///	子类访问父类。
				///	</summary>
				///	<param name="args" type="*">子类的参数列表。</param>
				var ParentClass = this.parentClass();

				if(ParentClass.constructor === jQun)
					return;

				var arg = {}, parentList = [], localeArg = arguments;

				forEach(arguments.callee.caller.argumentList, function(name, i, argumentList){
					arg["_" + name] = arg[name] = localeArg[i];
				});
				
				while(ParentClass){
					if(ParentClass === NonstaticClass.prototype)
						break;

					parentList.unshift(ParentClass);
					ParentClass = ParentClass.parentClass();
				}

				forEach(parentList, function(parent){
					var transferArgList = [], constructor = parent.constructor;

					forEach(constructor.argumentList, function(name){
						transferArgList.push(arg[name]);
					});

					constructor.source.apply(this, transferArgList);
				}, this);
			},
			creator : function(_constructor, _name, _ParentClass){
				///	<summary>
				///	派生出一个类。
				///	</summary>
				///	<param name="_constructor" type="function">源构造函数。</param>
				///	<param name="_name" type="string">构造函数的名称。</param>
				///	<param name="_ParentClass" type="object">需要继承的父类</param>
				var Pseudo, argumentList = [];

				if(!_constructor){
					_constructor = this.empty;
				}

				if(!_name){
					_name = _constructor.name || "AnonymousClass";
				}

				argumentList.push.apply(
					argumentList,
					_constructor.toString().match(argListRegx)[1].match(argRegx)
				);

				Pseudo = Object.getOwnPropertyDescriptor(
					new Function([
						"return {",
							"get '" + _name + "' (){\r",
								"if(typeof this.base === 'function'){\r",
									"this.base.apply(this, arguments);\r",
								"}\r",
								"return arguments.callee.source.apply(this, arguments);\r",
							"}",
						" };"
					].join(""))(),
					_name
				).get;

				this.properties.call(Pseudo, {
					argumentList : argumentList,
					source : _constructor,
					toString : toNative
				});

				Pseudo.prototype = Object.create(
					_ParentClass || this.ownClass(),
					{
						constructor : {
							value : Pseudo,
							writable : true,
							configurable : true
						}
					}
				);
				return Pseudo.prototype;
			},
			empty : function(){ },
			isChildOf : function(AncestorClass){
				///	<summary>
				///	判断该类是否是指定类的子孙类。
				///	</summary>
				///	<param name="AncestorClass" type="object, function">指定的类，或指定类的构造函数。</param>
				return this instanceof AncestorClass.constructor;
			},
			override : function(properties, _descriptor){
				///	<summary>
				///	重写一个或多个属性的值。
				///	</summary>
				///	<param name="properties" type="object">包含一个或多个属性的键值对。</param>
				///	<param name="_descriptor" type="object">被添加或修改属性的描述符。</param>
				return this.properties(properties, _descriptor);
			},
			ownClass : function(){
				///	<summary>
				///	获取自身类。
				///	</summary>
				return this.constructor.prototype;
			},
			parentClass : function(){
				///	<summary>
				///	获取父类。
				///	</summary>
				return Object.getPrototypeOf(this.constructor.prototype);
			},
			properties : function(properties, _descriptor){
				///	<summary>
				///	将一个或多个属性添加到该类，并/或修改现有属性的特性。
				///	</summary>
				///	<param name="properties" type="object">包含一个或多个属性的键值对。</param>
				///	<param name="_descriptor" type="object">被添加或修改属性的描述符。</param>
				return defineProperties(this, properties, _descriptor);
			}
		});

		
		// (2013.08.20)目前有些浏览器不支持，如：手机QQ浏览器，手机百度浏览器
		try {
			define(
				prototype,
				"__proto__",
				Object.getOwnPropertyDescriptor(Object.prototype, "__proto__"),
				{ settable : true, gettable : true }
			);
		}
		catch(e){}
	}

	return jQun;
}(
	// argRegx
	/([^\s\,]+)/g,
	// argListRegx
	/function[^\(]*\(([^\))]*)/,
	// every
	function(obj, fn, _this){
		///	<summary>
		///	确定对象的所有枚举成员是否满足指定的测试。
		///	</summary>
		///	<param name="obj" type="object">需要测试成员的对象。</param>
		///	<param name="fn" type="function">用于测试对象成员的测试函数。</param>
		///	<param name="_this" type="*">指定测试函数的 this 对象。</param>
		if(obj instanceof Array)
			return obj.every(fn, _this);

		var isNumber = typeof obj === "number";

		if(_this !== undefined){
			fn = fn.bind(_this);
		}

		if(isNumber){
			obj = new Array(obj + 1).join(" ");
		}

		for(var o in obj){
			if(fn.apply(_this, isNumber ? [o] : [obj[o], o, obj])){
				continue;
			}

			return false;
		}
		return true;
	},
	// toNative
	function(){
		///	<summary>
		///	使函数方法在控制台里看起来像本地代码。
		///	</summary>
		var name = this.name;

		return "function" + (name ? " " + name : "") + "() { [native code] }";
	}
));

forEach = jQun.forEach;

this.NonstaticClass = NonstaticClass = (function(){
	function NonstaticClass(_constructor, _name, _ParentClass){
		///	<summary>
		///	派生出一个非静态类。
		///	</summary>
		///	<param name="_constructor" type="function">源构造函数。</param>
		///	<param name="_name" type="string">构造函数的名称。</param>
		///	<param name="_ParentClass" type="function">需要继承的父类</param>
		return new jQun(_constructor, _name, _ParentClass || this.ownClass());
	};
	NonstaticClass = new jQun(NonstaticClass, "NonstaticClass");

	return NonstaticClass.constructor;
}());

this.StaticClass = StaticClass = (function(){
	function StaticClass(_constructor, _name, _properties, _descriptor){
		///	<summary>
		///	派生出一个静态类。
		///	</summary>
		///	<param name="_constructor" type="function">源构造函数。</param>
		///	<param name="_name" type="string">构造函数的名称。</param>
		///	<param name="_properties" type="object">类的属性。</param>
		///	<param name="_descriptor" type="object, array">被添加属性的描述符。</param>
		var NewClass = new jQun(_constructor, _name, this.ownClass());

		NewClass.properties({
			base : undefined
		});

		if(_properties){
			NewClass.properties(_properties, _descriptor);
		}

		if(_constructor)
			_constructor.call(NewClass);

		return NewClass;
	};
	StaticClass = new jQun(StaticClass, "StaticClass");

	return StaticClass.constructor;
}());

this.Browser = (function(){
	function Browser(){
		///	<summary>
		///	浏览器基本信息类。
		///	</summary>
		var RegExp = window.RegExp,
		
			userAgent = navigator.userAgent,

			mobileVersionString = ".*Version\\/([\\d\\.]+).*(Mobile)";

		[
			/(MSIE) ([\d.]+)/,
			/(Firefox)\/([\d.]+)/,
			/(Opera).([\d.]+)/,
			/(Chrome)\/([\d.]+)/,
			/(AppleWebkit).*Version\/([\d\.]+).*Safari/,
			new RegExp("(Android)" + mobileVersionString),
			new RegExp("(Windows Phone)" + mobileVersionString),
			new RegExp("(iPhone)" + mobileVersionString),
			new RegExp("(iPad)" + mobileVersionString),
			new RegExp("(iPod)" + mobileVersionString)
		].every(function(regx){
			var info = userAgent.match(regx);

			if(!info)
				return true;

			var agent = info[1];

			this.assign({
				agent : agent === "AppleWebkit" ? "Safari" : agent,
				isMobile : info[3] === "Mobile",
				version : info[2]
			});

			return false;
		}, this);
	}
	Browser = new StaticClass(Browser, "jQun.Browser", {
		agent : "unkown",
		isMobile : false,
		version : "0"
	}, { enumerable : true });

	return Browser;
}());

this.JSON = (function(){
	function JSON(){
		///	<summary>
		///	JSON功能类。
		///	</summary>
	};
	JSON = new StaticClass(null, "jQun.JSON");

	JSON.properties({
		parse : function(jsonStr){
			///	<summary>
			///	将字符串转化为json。
			///	</summary>
			///	<param name="jsonStr" type="string">需要转化为json的字符串。</param>
			try {
				return window.JSON.parse(jsonStr);
			} catch(e){
				return (new Function("return " + jsonStr + ";"))();
			}
		},
		stringify : window.JSON.stringify
	});

	return JSON;
}());

this.List = List = (function(addArrayMethods){
	function List(){
		///	<summary>
		///	对列表进行管理、操作的类。
		///	</summary>
		this.override({ length : 0 });
	};
	List = new NonstaticClass(List, "jQun.List");

	List.properties({
		alternate : function(num, _remainder){
			///	<summary>
			///	交替性取出集合中的符合项。
			///	</summary>
			///	<param name="num" type="number">取模运算值。</param>
			///	<param name="_remainder" type="number">余数。</param>
			var list = this.createList();

			_remainder = _remainder || 0;

			this.forEach(function(item, i){
				if(i % num === _remainder){
					list.push(item);
				}
			});
			return list;
		},
		clear : function(){
			///	<summary>
			///	清空整个集合。
			///	</summary>
			this.splice(0);
			return this;
		},
		combine : function(list){
			///	<summary>
			///	合并另一个集合。
			///	</summary>
			///	<param name="list" type="array">另一个集合。</param>
			this.push.apply(this, list);
			return this;
		},
		contains : function(item){
			///	<summary>
			///	返回一个布尔值，表示该列表中是否包含指定项。
			///	</summary>
			///	<param name="item" type="*">可能包含的项。</param>
			return !this.every(function(i){
				return i !== item;
			});
		},
		createList : function(){
			///	<summary>
			///	创建个新的列表。
			///	</summary>
			return new List.constructor();
		},
		distinct : function(){
			///	<summary>
			///	对列表进行去重。
			///	</summary>
			var list = this;

			this.splice(0).forEach(function(item){
				if(list.contains(item))
					return;

				list.push(item);
			});
			return list;
		},
		even : function(){
			///	<summary>
			///	返回集合中偶数项集合。
			///	</summary>
			return this.alternate(2);
		},
		length : undefined,
		odd : function(){
			///	<summary>
			///	返回集合中奇数项集合。
			///	</summary>
			return this.alternate(2, 1);
		}
	});
	addArrayMethods(List);

	return List.constructor;
}(
	// addArrayMethods
	function(List){
		var define = jQun.define, hasOwnProperty = {}.hasOwnProperty;

		forEach(
			Object.getOwnPropertyNames(Array.prototype),
			function(name){
				if(hasOwnProperty.call(List, name))
					return;

				define(List, name, [][name]);
			}
		);
	}
));

this.Namespace = (function(){
	function Namespace(){
		///	<summary>
		///	开辟一个命名空间。
		///	</summary>
		return Object.create(this.self);
	};
	Namespace = new NonstaticClass(Namespace, "Namespace");

	Namespace.properties({
		self : Namespace.properties.call(Object.create(null), {
			constructor : Namespace.constructor,
			members : Namespace.assign
		})
	});

	return Namespace.constructor;
}());

this.Text = (function(tRegx){
	function Text(text){
		///	<summary>
		///	用于操作字符串文本的类。
		///	</summary>
		///	<param name="text" type="string">字符串文本。</param>
		this.assign({
			text : text instanceof Array ? text.join("") : text
		});
	};
	Text = new NonstaticClass(Text, "jQun.Text");

	Text.properties({
		removeSpace : function(){
			///	<summary>
			///	 移除字符串中的前后空格。
			///	</summary>
			return this.text.match(/^\s*([\S\s]*?)\s*$/)[1];
		},
		replace : function(replacement){
			///	<summary>
			///	返回一个替换数据后的字符串。
			///	</summary>
			///	<param name="replacement" type="object, function">需要替换的数据或者自行替换的处理函数。</param>
			var isFunction = typeof replacement === "function";

			return this.text.replace(
				tRegx,
				typeof replacement === "function" ? replacement : function(str, modifier, word){
					if(modifier === ":"){
						return "{" + word + "}";
					}

					if(isFunction){
						var r = replacement(word, str);
					
						if(r !== undefined){
							return r;
						}
					} else if(word in replacement){
						return replacement[word];
					}

					return modifier === "~" ? "" : word;
				}
			);
		},
		text : ""
	});

	return Text.constructor;
}(
	// tRegx => 查找参数
	/\{\s*(?:\?([^\{\}\s]{1}))?\s*([^\{\}]*?)\s*\}/g
));

this.Cache = (function(JSON, sessionStorage){
	function Cache(name){
		///	<summary>
		///	缓存数据。
		///	</summary>
		/// <param name="name" type="string">缓存数据的标识名称</param>
		this.assign({
			name : name
		});
	};
	Cache = new NonstaticClass(Cache, "jQun.Cache");

	Cache.properties({
		del : function(key){
			///	<summary>
			///	删除某一条缓存数据。
			///	</summary>
			/// <param name="key" type="string">缓存数据的主键</param>
			var storage = this.get();

			delete storage[key];
			sessionStorage.setItem(this.name, JSON.stringify(storage));
		},
		get : function(_key){
			///	<summary>
			///	获取某一条缓存数据。
			///	</summary>
			/// <param name="_key" type="string">缓存数据的主键</param>
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
			/// <param name="key" type="string">缓存数据的主键</param>
			/// <param name="value" type="object,string,number">缓存数据的值</param>
			var storage = this.get();

			storage[key] = value;
			sessionStorage.setItem(this.name, JSON.stringify(storage));
		}
	});

	return Cache.constructor;
}(
	this.JSON,
	// sessionStorage
	sessionStorage
));

this.RequestConnection = (function(Text, Cache, JSON, toUpperCase){
	function RequestConnection(name, url, type, _handler, _cacheable){
		///	<summary>
		///	ajax请求连接。
		///	</summary>
		///	<param name="name" type="string">连接名称。</param>
		///	<param name="url" type="string">连接url。</param>
		///	<param name="type" type="string">发送数据的方式("POST"、"GET")。</param>
		///	<param name="_handler" type="function">接收数据后的处理函数。</param>
		///	<param name="_cacheable" type="boolean">是否缓存数据。</param>
		var cache;

		_cacheable = _cacheable === true;

		if(_cacheable){
			cache = new Cache("jQun.Cache_" + name);
		}

		this.assign({
			cache : cache,
			name : name,
			url : url,
			isPost : toUpperCase.call(type) === "POST",
			handler : _handler
		});
	};
	RequestConnection = new NonstaticClass(RequestConnection, "jQun.RequestConnection");

	RequestConnection.properties({
		cache : undefined,
		handler : undefined,
		isPost : false,
		name : "",
		url : ""
	}, { enumerable : true });

	RequestConnection.properties({
		open : function(name, params, complete, responseType, isTesting){
			///	<summary>
			///	开打一个ajax连接。
			///	</summary>
			///	<param name="name" type="string">连接名称。</param>
			///	<param name="params" type="object">url的替换参数及post方法的传递参数。</param>
			///	<param name="complete" type="function">异步完成后所执行的回调函数。</param>
			///	<param name="responseType" type="string">返回的数据格式。</param>
			///	<param name="isTesting" type="boolean">是否在测试环境中。</param>
			var url = this.url, cache = this.cache,

				isJSON = responseType === "JSON",

				request = new XMLHttpRequest();

			if(url instanceof Text){
				url = url.replace(params);
			}

			if(typeof complete === "function"){
				if(cache){
					var data = cache.get(url);

					if(data){
						complete(data, true);
						return;
					}
				}

				var handler = this.handler;

				request.onreadystatechange =  function(){
					if(this.readyState < 4)
						return;

					var responseData = this.status === 200 ? this.responseText : "";

					if(isJSON){
						responseData = JSON.parse(responseData);
					}

					if(typeof handler === "function"){
						responseData = handler(responseData);
					}

					if(cache){
						cache.set(url, responseData);
					}

					complete(responseData, false);
				};
			}

			if(isTesting){
				request.onreadystatechange.call({
					readyState : 4,
					status : 200,
					responseText : ""
				});

				return;
			}

			var isPost = this.isPost, type = isPost ? "POST" : "GET";

			request.open(type, url, true);
			request.responseType = isJSON ? "text" : responseType;
			
			if(isPost){
				this.RequestHeader.addTo(request);
			}

			request.send(isPost ? getSendString(params) : null);
			return request;
		}
	});

	return RequestConnection.constructor;
}(
	this.Text,
	this.Cache,
	this.JSON,
	String.prototype.toUpperCase,
	// getSendString
	function(params){
		///	<summary>
		///	获取post方法的参数字符串。
		///	</summary>
		///	<param name="params" type="object">参数。</param>
		var arr = [];

		forEach(params, function(value, name){
			arr.push(name + "=" + value);
			arr.push("&");
		});
		arr.splice(-1);

		return arr.join("");
	}
));

this.RequestHeader = (function(){
	function RequestHeader(){
		///	<summary>
		///	请求头部信息。
		///	</summary>
	};
	RequestHeader = new StaticClass(null, "jQun.RequestHeader");

	RequestHeader.properties({
		name : "Content-type",
		value : "application/x-www-form-urlencoded"
	}, { enumerable : true });

	RequestHeader.properties({
		addTo : function(request){
			///	<summary>
			///	向指定的ajax请求添加头部信息。
			///	</summary>
			///	<param name="name" type="object">ajax请求。</param>
			request.setRequestHeader(this.name, this.value);
			return this;
		},
		reset : function(name, value){
			///	<summary>
			///	重新设置请求头部信息。
			///	</summary>
			///	<param name="name" type="string">名称。</param>
			///	<param name="value" type="string">值。</param>
			this.name = name;
			this.value = value;
			return this;
		}
	});

	return RequestHeader;
}());

this.Storage = (function(){
	function Storage(){ };
	Storage = new NonstaticClass(Storage, "jQun.Storage");

	Storage.properties({
		clear : function(){
			///	<summary>
			///	清空所有储存数据。
			///	</summary>
			forEach(this, function(value, key){
				this.del(key);
			}, this);
			return this;
		},
		del : function(key){
			///	<summary>
			///	删除一项储存数据。
			///	</summary>
			///	<param name="key" type="string">数据主键。</param>
			return delete this[key];
		},
		get : function(key){
			///	<summary>
			///	获取数据。
			///	</summary>
			///	<param name="key" type="string">数据主键。</param>
			return this[key];
		},
		set : function(key, value){
			///	<summary>
			///	设置数据。
			///	</summary>
			///	<param name="key" type="string">数据主键。</param>
			///	<param name="value" type="*">数据值。</param>
			this[key] = value;
			return this;
		}
	});

	return Storage.constructor;
}());

this.Ajax = (function(Storage, RequestHeader, RequestConnection){
	function Ajax(){
		///	<summary>
		///	ajax异步类。
		///	</summary>
		if(!!(new XMLHttpRequest())){
			this.enabled = true;
			return;
		}

		console.warn("当前浏览器不支持XMLHttpRequest。");
	};
	Ajax = new StaticClass(Ajax, "jQun.Ajax", {
		enabled : false
	}, { enumerable : true });

	Ajax.properties({
		RequestHeader : RequestHeader,
		beginTesting : function(){
			this.isTesting = true;
		},
		isTesting : false,
		open : function(name, params, _complete){
			///	<summary>
			///	开打一个ajax连接。
			///	</summary>
			///	<param name="name" type="string">连接名称。</param>
			///	<param name="params" type="object">url的替换参数及post方法的传递参数。</param>
			///	<param name="_complete" type="function">异步完成后所执行的回调函数。</param>
			var requstConnection = this.requestStorage.get(name);

			if(!requstConnection){
				console.error("ajax请求信息错误：请检查连接名称是否正确。", arguments);
				return;
			}

			var args = jQun.toArray(arguments);

			args.push(this.responseType, this.isTesting);
			requstConnection.open.apply(requstConnection, args);
		},
		requestStorage : new Storage(),
		responseType : "text",
		save : function(allSettings, _handlers){
			///	<summary>
			///	存储ajax连接信息。
			///	</summary>
			///	<param name="allSettings" type="array">ajax连接信息。</param>
			///	<param name="_handlers" type="function">所有的数据格式转换函数。</param>
			var requestStorage = this.requestStorage

			if(!_handlers){
				_handlers = {};
			}

			forEach(allSettings, function(settings){
				var name = settings[0];

				requestStorage.set(
					name,
					new RequestConnection(settings[0], settings[1], settings[2], _handlers[name], settings[3])
				);
			});
			return requestStorage;
		},
		setResponseType : function(type){
			///	<summary>
			///	设置返回数据的格式。
			///	</summary>
			///	<param name="type" type="string">数据的格式("text"、"json"、"arraybuffer"、"blob"或"document")。</param>
			this.responseType = type.toLowerCase();
		}
	});

	return Ajax;
}(
	this.Storage,
	this.RequestHeader,
	this.RequestConnection
));

this.ElementPropertyCollection = ElementPropertyCollection = (function(){
	function ElementPropertyCollection(elementList){
		///	<summary>
		///	所有元素属性的基类。
		///	</summary>
		///	<param name="elementList" type="array">元素列表（由 ElementList 类或其子孙类的实例）。</param>
		var name = this.propertyName;

		this.assign({
			sources : elementList
		});

		if(name === ""){
			this.combine(elementList);
			return;
		}

		elementList.forEach(function(element){
			this.push(element[name]);
		}, this);
	};
	ElementPropertyCollection = new NonstaticClass(ElementPropertyCollection, "jQun.ElementPropertyCollection", List.prototype);

	ElementPropertyCollection.properties({
		propertyName : "",
		sources : undefined,
		valueOf : function(){
			///	<summary>
			///	返回当前对象。
			///	</summary>
			return this;
		}
	});

	return ElementPropertyCollection.constructor;
}());

this.AttributeCollection = (function(){
	function AttributeCollection(elementList){ };
	AttributeCollection = new NonstaticClass(AttributeCollection, "jQun.AttributeCollection", ElementPropertyCollection.prototype);

	AttributeCollection.override({
		propertyName : "attributes"
	});

	AttributeCollection.properties({
		contains : function(name){
			///	<summary>
			///	判断是否包含指定名称的属性。
			///	</summary>
			///	<param name="name" type="string">属性的名称。</param>
			return !this.sources.every(function(element){
				return element.getAttribute(name) == null;
			});
		},
		get : function(name){
			///	<summary>
			///	通过指定名称获取属性。
			///	</summary>
			///	<param name="name" type="string">需要获取属性的名称。</param>
			return this.sources[0].getAttribute(name);
		},
		set : function(name, value){
			///	<summary>
			///	设置集合中所有元素的属性。
			///	</summary>
			///	<param name="name" type="string">需要设置属性的名称。</param>
			///	<param name="value" type="*">需要设置属性的值。</param>
			this.sources.forEach(function(element){
				element.setAttribute(name, value);
			});
			return this;
		},
		remove : function(name){
			///	<summary>
			///	移除具有指定名称的属性。
			///	</summary>
			///	<param name="name" type="string">需要移除属性的名称。</param>
			this.sources.forEach(function(element){
				element.removeAttribute(name);
			});
			return this;
		},
		replace : function(oldAttrName, newAttrName, newAttrValue){
			///	<summary>
			///	移除指定的旧属性，添加指定的新属性。
			///	</summary>
			///	<param name="oldAttrName" type="string">需要移除属性的名称。</param>
			///	<param name="newAttrName" type="string">需要添加属性的名称。</param>
			///	<param name="newAttrValue" type="*">需要添加属性的值。</param>
			this.sources.forEach(function(element){
				element.removeAttribute(oldAttrName);
				element.setAttribute(newAttrName, newAttrValue);
			});
			return this;
		},
		valueOf : function(){
			///	<summary>
			///	返回一个键值对，该键值对具有第一个元素所有属性。
			///	</summary>
			var value = {};

			if(this.length === 0)
				return value;

			var attributes = this[0];

			for(var i = 0, j = attributes.length;i < j;i++){
				var attr = attributes[i];

				value[attr.nodeName] = attr.nodeValue;
			}
			return value;
		}
	});

	return AttributeCollection.constructor;
}());

emptyAttrCollection = new this.AttributeCollection([]);

this.CSSPropertyCollection = (function(){
	function CSSPropertyCollection(elementList){ };
	CSSPropertyCollection = new NonstaticClass(CSSPropertyCollection, "jQun.CSSPropertyCollection", ElementPropertyCollection.prototype);

	CSSPropertyCollection.override({
		propertyName : "style"
	});

	CSSPropertyCollection.properties({
		get : function(name){
			///	<summary>
			///	获取集合中第一个元素的CSS属性。
			///	</summary>
			///	<param name="name" type="string">CSS属性名。</param>
			return this[0][name];
		},
		set : function(name, value){
			///	<summary>
			///	设置集合中所有元素的CSS属性。
			///	</summary>
			///	<param name="properties" type="object">CSS属性键值对。</param>
			this.forEach(function(style){
				style[name] = value;
			});
			return this;
		},
		valueOf : function(){
			///	<summary>
			///	返回集合中第一个元素的style。
			///	</summary>
			return this.get("cssText");
		}
	});

	forEach(getComputedStyle(document.createElement("div")), function(value, name, CSSStyle){
		// firefox、chrome 与 IE 的 CSSStyleDeclaration 结构都不一样
		var cssName = isNaN(name - 0) ? name : value;

		if(this.call(CSSPropertyCollection, cssName))
			return;

		if(typeof CSSStyle[cssName] !== "string")
			return;

		var property = {};

		property[cssName] = {
			get : function(){
				return this.get(cssName);
			},
			set : function(value){
				this.set(cssName, value);
			}
		};

		CSSPropertyCollection.properties(property, { gettable : true, settable : true });
	}, Object.prototype.hasOwnProperty);

	return CSSPropertyCollection.constructor;
}());

this.ChildrenCollection = (function(){
	function ChildrenCollection(elementList){ };
	ChildrenCollection = new NonstaticClass(ChildrenCollection, "jQun.ChildrenCollection", ElementPropertyCollection.prototype);

	ChildrenCollection.override({
		propertyName : "children"
	});

	ChildrenCollection.properties({
		append : function(node){
			///	<summary>
			///	添加一个子节点。
			///	</summary>
			///	<param name="node" type="object">需要添加的子节点。</param>
			return this.insert(node);
		},
		contains : function(node){
			///	<summary>
			///	返回一个布尔值，该值表示该集合内的所有子节点是否包含指定的子节点。
			///	</summary>
			///	<param name="node" type="object">可能包含的子节点。</param>
			return this.valueOf().contains(node);
		},
		insert : function(node, _idx){
			///	<summary>
			///	在指定的索引处插入节点。
			///	</summary>
			///	<param name="node" type="object">需要插入的节点。</param>
			///	<param name="_idx" type="object">指定的索引处。</param>
			var sources = this.sources;

			sources.insertTo.call([node], sources[0], _idx);
			return this;
		},
		remove : function(){
			///	<summary>
			///	移除所有子节点。
			///	</summary>
			this.valueOf().remove();
			return this;
		},
		valueOf : function(){
			///	<summary>
			///	返回所有子节点的一个集合。
			///	</summary>
			return this.sources.find(">*");
		}
	});

	return ChildrenCollection.constructor;
}());

this.ClassListCollection = (function(){
	function ClassListCollection(elementList){ };
	ClassListCollection = new NonstaticClass(ClassListCollection, "jQun.ClassListCollection", ElementPropertyCollection.prototype);

	ClassListCollection.override({
		propertyName : "classList"
	});

	ClassListCollection.properties({
		add : function(className){
			///	<summary>
			///	为集合中每一个元素添加指定的单个class。
			///	</summary>
			///	<param name="className" type="string">指定的单个class。</param>
			this.forEach(function(classList){
				classList.add(className);
			});
			return this;
		},
		contains : function(className){
			///	<summary>
			///	判断集合中是否有一个元素包含指定的class。
			///	</summary>
			///	<param name="className" type="string">指定的单个class。</param>
			return !this.every(function(classList){
				return !classList.contains(className);
			});
		},
		remove : function(className){
			///	<summary>
			///	为集合中每一个元素移除指定的单个class。
			///	</summary>
			///	<param name="className" type="string">指定的单个class。</param>
			this.forEach(function(classList){
				classList.remove(className);
			});
			return this;
		},
		replace : function(oldClass, newClass){
			///	<summary>
			///	为集合中每一个元素移除指定的旧class，添加指定的新class。
			///	</summary>
			///	<param name="oldClass" type="string">指定的旧class。</param>
			///	<param name="newClass" type="string">指定的新class。</param>
			this.forEach(function(classList){
				classList.remove(oldClass);
				classList.add(newClass);
			});
			return this;
		},
		toggle : function(className){
			///	<summary>
			///	自行判断集合中每一个元素是否含有指定的class：有则移除，无则添加。
			///	</summary>
			///	<param name="className" type="string">指定的单个class。</param>
			this.forEach(function(classList){
				classList.toggle(className);
			});
			return this;
		},
		valueOf : function(){
			///	<summary>
			///	返回集合中第一个元素的className。
			///	</summary>
			return this[0].toString();
		}
	});

	return ClassListCollection.constructor;
}());

this.NodeList = (function(AttributeCollection){
	function NodeList(){
		///	<summary>
		///	节点列表类。
		///	</summary>
	};
	NodeList = new NonstaticClass(NodeList, "jQun.NodeList", List.prototype);

	NodeList.override({
		createList : function(){
			///	<summary>
			///	创建个新的节点集合。
			///	</summary>
			return new NodeList.constructor();
		}
	});

	NodeList.properties({
		attributes : {
			get : function(){
				///	<summary>
				///	获取属性集合。
				///	</summary>
				return new AttributeCollection(this);
			},
			set : function(attrs){
				///	<summary>
				///	初始化属性。
				///	</summary>
				///	<param name="attrs" type="object">属性键值对。</param>
				var pseudo = { sources : this },
					emptyAttr = emptyAttrCollection;

				for(var name in attrs){
					emptyAttr.set.call(pseudo, name, attrs[name]);
				}
			}
		}
	}, { gettable : true, settable : true });

	NodeList.properties({
		appendTo : function(parentNode){
			///	<summary>
			///	将集合中所有节点添加至指定的父节点。
			///	</summary>
			///	<param name="parentNode" type="object">指定的父节点。</param>
			this.insertTo(parentNode);
			return this;
		},
		attach : function(events, _capture){
			///	<summary>
			///	向集合中所有元素注册事件侦听器。
			///	</summary>
			///	<param name="events" type="object">事件侦听器键值对。</param>
			///	<param name="_capture" type="boolean">侦听器是否运行于捕获阶段。</param>
			this.forEach(function(node){
				forEach(events, function(fn, type){
					node.addEventListener(type, fn, _capture);
				});
			});
			return this;
		},
		detach : function(events){
			///	<summary>
			///	移除集合中所有元素的事件侦听器。
			///	</summary>
			///	<param name="events" type="object">事件侦听器键值对。</param>
			this.forEach(function(node){
				forEach(events, function(fn, type){
					node.removeEventListener(type, fn);
				});
			});
			return this;
		},
		hasChild : function(childNode){
			///	<summary>
			///	判断指定节点是否是该集合中某个元素的后代节点。
			///	</summary>
			///	<param name="childNode" type="DOM">指定的节点。</param>
			return !this.every(function(node){
				return !node.contains(childNode);
			});
		},
		insertTo : function(parentNode, _idx){
			///	<summary>
			///	将集合中所有节点插入至指定索引的节点之前。
			///	</summary>
			///	<param name="parentNode" type="object">指定的父节点。</param>
			///	<param name="_idx" type="number">指定节点的索引值。</param>
			var existingNode, children = parentNode.children;

			existingNode = children[_idx === undefined ? children.length : _idx];

			this.forEach(function(node){
				parentNode[existingNode ? "insertBefore" : "appendChild"](node, existingNode);
			});
			return this;
		},
		remove : function(){
			///	<summary>
			///	将集合中的元素从其父元素内移除。
			///	</summary>
			this.forEach(function(node){
				node.parentNode.removeChild(node);
			});
			return this;
		}
	});

	return NodeList.constructor;
}(
	this.AttributeCollection
));

this.ElementList = (function(NodeList, ChildrenCollection, ClassListCollection, window, selectorReplaceRegx){
	function ElementList(_selector, _parent){
		///	<summary>
		///	通过指定选择器筛选元素。
		///	</summary>
		///	<param name="_selector" type="string, object">选择器或dom元素。</param>
		///	<param name="_parent" type="object">指定查询的父节点。</param>
		if(!_selector)
			return;

		this.assign({
			selector : _selector
		});

		if(typeof _selector === "string"){
			var elements, doc = window.document;

			_selector = _selector.replace(selectorReplaceRegx, function(word){
				return '[' + (word.charAt(0) === "#" ? "id" : "class~") + '="' + word.substring(1) + '"]';
			});
			_parent = _parent || doc;

			try{
				elements = _parent.querySelectorAll(_selector);
			} catch(e){
				if(_parent === doc){
					console.error(e.message);
					return;
				}

				_parent.setAttribute("__selector__", "__jQun__");
				elements = (_parent.parentElement || _parent)["querySelectorAll"]('[__selector__="__jQun__"]' + _selector);
				_parent.removeAttribute("__selector__");
			}

			this.combine(elements);
			return;
		}

		if(_selector instanceof window.Node || _selector instanceof window.constructor){
			this.push(_selector);
			return;
		}

		if("length" in _selector){
			this.combine(_selector);
			return;
		}
	};
	ElementList = new NonstaticClass(ElementList, "jQun.ElementList", NodeList.prototype);

	ElementList.override({
		createList : function(_selector, _parent){
			///	<summary>
			///	创建个新的元素集合。
			///	</summary>
			///	<param name="_selector" type="string, object">选择器、html或dom元素。</param>
			///	<param name="_parent" type="object">指定查询的父节点。</param>
			return new ElementList.constructor(_selector, _parent);
		}
	});

	ElementList.properties({
		between : function(_selector, _ancestor){
			///	<summary>
			///	在该集合内的每一个元素与指定的祖先元素之间，查找其他符合条件的元素。
			///	</summary>
			///	<param name="_selector" type="string">指定查找的祖先元素选择器。</param>
			///	<param name="_ancestor" type="object">指定的一个祖先元素。</param>
			var list = this.createList(), els = this.createList(_selector || "*", _ancestor);

			this.forEach(function(element){
				do {
					if(element === _ancestor)
						return;

					if(els.contains(element)){
						if(!list.contains(element)){
							list.push(element);
						}
					}
					
					element = element.parentElement;
				} while(element)
			});

			return list;
		},
		del : function(name, _type){
			///	<summary>
			///	将指定属性从集合的所有元素中删除。
			///	</summary>
			///	<param name="name" type="string">需要删除的属性名。</param>
			///	<param name="_type" type="string">需要删除的属性种类。</param>
			if(_type === "css"){
				this.style[name] = "";
				return this;
			}

			if(_type === "attr"){
				emptyAttrCollection.remove.call({sources : this}, name);
				return this;
			}

			this.forEach(function(element){
				delete element[name];
			});
			return this;
		},
		get : function(name, _type){
			///	<summary>
			///	获取集合中第一个元素的属性。
			///	</summary>
			///	<param name="name" type="string">属性名。</param>
			///	<param name="_type" type="string">需要获取的属性种类。</param>
			if(_type === "css")
				return getComputedStyle(this[0])[name];

			if(_type === "attr")
				return emptyAttrCollection.get.call({ sources : this }, name);

			return this[0][name];
		},
		find : function(_selector){
			///	<summary>
			///	通过选择器查找子孙元素。
			///	</summary>
			///	<param name="_selector" type="string">选择器。</param>
			var source = ElementList.constructor.source, list = this.createList();

			this.forEach(function(htmlElement){
				source.call(list, _selector, htmlElement);
			});

			if(this.length < 2)
				return list;

			return list.distinct();
		},
		parent : function(){
			///	<summary>
			///	返回该集合所有元素的父元素。
			///	</summary>
			var list = this.createList();

			this.forEach(function(element){
				var parent = element.parentElement;

				if(!parent || list.contains(parent))
					return;

				list.push(parent);
			});
			return list;
		},
		selector : "",
		set : function(name, value, _type){
			///	<summary>
			///	设置集合中所有元素的属性。
			///	</summary>
			///	<param name="name" type="string">属性名。</param>
			///	<param name="value" type="*">属性值。</param>
			///	<param name="_type" type="string">需要设置的属性种类。</param>
			if(_type){
				if(_type === "css"){
					this.forEach(function(element){
						element.style[name] = value;
					});
					return this;
				}

				emptyAttrCollection.set.call({ sources : this }, name, value);
				return this;
			}

			this.forEach(function(element){
				element[name] = value;
			});
			return this;
		},
		sibling : function(){
			///	<summary>
			///	返回集合中所有元素紧邻的下一个兄弟元素。
			///	</summary>
			return this.find("+*");
		},
		siblings : function(){
			///	<summary>
			///	返回集合中所有元素之后的兄弟元素。
			///	</summary>
			return this.find("~*");
		}
	});

	ElementList.properties({
		children : {
			get : function(){
				///	<summary>
				///	获取子元素集合。
				///	</summary>
				return new ChildrenCollection(this);
			},
			set : function(elements){
				///	<summary>
				///	移除所有现有子元素，添加指定的子元素。
				///	</summary>
				///	<param name="elements" type="array">需要添加的子元素集合。</param>
				this.children.remove();
				this.constructor(elementList).appendTo(this[0]);
			}
		},
		classList : {
			get : function(){
				///	<summary>
				///	获取class列表集合。
				///	</summary>
				return new ClassListCollection(this);
			},
			set : function(className){
				///	<summary>
				///	设置集合中所有元素的class属性。
				///	</summary>
				///	<param name="className" type="string">需要设置的class字符串。</param>
				this.set("className", className);
			}
		}
	}, { gettable : true, settable : true });

	return ElementList.constructor;
}(
	this.NodeList,
	this.ChildrenCollection,
	this.ClassListCollection,
	window,
	// selectorReplaceRegx
	/[\#\.]\d[^\:\#\.\,\+\~\[\>]*/g
));

this.HTMLElementList = (function(ElementList, CSSPropertyCollection, addProperty){
	function HTMLElementList(_selector, _parent){};
	HTMLElementList = new NonstaticClass(HTMLElementList, "jQun.HTMLElementList", ElementList.prototype);

	// firefox 把id、innerHTML归为了Element的属性，但是w3c与IE9都归为了HTMLElement的属性
	forEach(
		[
			"className", "hidden", "href",
			"id", "innerHTML", "src",
			"tabIndex", "title", "value"
		],
		addProperty,
		HTMLElementList
	);

	// firefox 把onmouseenter、onmouseleave、onwheel归为了Element的属性(chrome并不支持该3个事件)
	forEach(
		Object.getOwnPropertyNames(window.constructor.prototype),
		function(name){
			if(name.substring(0, 2) != "on")
				return;
			
			addProperty.call(HTMLElementList, name);
		}
	);

	HTMLElementList.override({
		createList : function(_selector, _parent){
			///	<summary>
			///	创建个新的HTML元素集合。
			///	</summary>
			///	<param name="_selector" type="string, object">选择器、html或dom元素。</param>
			///	<param name="_parent" type="object">指定查询的父节点。</param>
			return new HTMLElementList.constructor(_selector, _parent);
		}
	});

	HTMLElementList.properties({
		style : {
			get : function(){
				///	<summary>
				///	获取style属性集合。
				///	</summary>
				return new CSSPropertyCollection(this);
			},
			set : function(cssText){
				///	<summary>
				///	设置集合中每一个元素的style属性。
				///	</summary>
				///	<param name="cssText" type="string">需要设置的style属性字符串。</param>
				emptyAttrCollection.set.call({ sources : this }, "style", cssText);
			}
		}
	}, { gettable : true, settable : true });

	HTMLElementList.properties({
		height : function(h){
			///	<summary>
			///	获取或设置集合中每一个元素的高。
			///	</summary>
			///	<param name="h" type="string, number">元素的高。</param>
			return this.metrics("height", h);
		},
		hide : function(){
			///	<summary>
			///	隐藏元素。
			///	</summary>
			return this.set("display", "none", "css");
		},
		metrics : function(name, _value){
			///	<summary>
			///	获取或设置元素指定盒模型属性值。
			///	</summary>
			///	<param name="name" type="string">盒模型属性名称。</param>
			///	<param name="_value" type="string, number">盒模型属性值。</param>
			if(_value === undefined){
				return this.get(name, "css").split(/[^\d\.]*/).join("") - 0;
			}

			if(typeof _value === "number"){
				_value += "px";
			}

			this.set(name, _value, "css");
			return this;
		},
		rect : function(_name){
			///	<summary>
			///	获取第一个元素的客户端属性。
			///	</summary>
			///	<param name="_name" type="string">需要只返回单个属性值的属性名称。</param>
			var rect = this[0].getBoundingClientRect();

			return _name in rect ? rect[_name] : rect;
		},
		show : function(_display){
			///	<summary>
			///	显示元素。
			///	</summary>
			///	<param name="_display" type="string">修改元素display的css值。</param>
			return this.set("display", _display || "block", "css");
		},
		width : function(w){
			///	<summary>
			///	获取或设置集合中每一个元素的宽。
			///	</summary>
			///	<param name="w" type="string, number">元素的宽。</param>
			return this.metrics("width", w);
		}
	});

	return HTMLElementList.constructor;
}(
	this.ElementList,
	this.CSSPropertyCollection,
	// addProperty
	function(name){
		jQun.define(this, name, {
			get : function(){
				return this.get(name);
			},
			set : function(value){
				this.set(name, value);
			}
		}, { gettable : true, settable : true });
	}
));

this.Event = (function(attach, define){
	function Event(name, _init, _type){
		///	<summary>
		///	DOM事件类。
		///	</summary>
		///	<param name="name" type="string">事件名称。</param>
		///	<param name="_init" type="function">事件初始化函数。</param>
		///	<param name="_type" type="string">事件类型(MouseEvent、UIEvent、WheelEvent等)。</param>
		var source;

		if(!_type || !(_type in window)){
			_type = this.type;
		}

		source = new window[_type](name);

		this.assign({
			name : name,
			source : source,
			type : _type
		});

		source.initEvent(name, true, true);

		if(typeof _init !== "function")
			return;
		
		_init.call(this, source);
	};
	Event = new NonstaticClass(Event, "jQun.Event");

	Event.properties({
		attachTo : function(target){
			///	<summary>
			///	应该附加该事件的标签。
			///	</summary>
			///	<param name="target" type="string, element">标签名称。</param>
			var name = this.name;

			/* 以后用EventTarget优化此方法 */
			forEach(
				typeof target === "string" ?
					target === "*" ? [Node.prototype, Window.prototype] : [document.createElement(target).constructor.prototype] :
					[target],
				function(tg){
					define(tg, "on" + name, { set : this },	{ settable : true });
				},
				function(fn){
					var obj = {};

					obj[name] = fn;
					attach.call([this], obj);
				}
			);

			return this;
		},
		name : "",
		setEventAttrs : function(attrs){
			///	<summary>
			///	设置事件属性。
			///	</summary>
			///	<param name="attrs" type="object">属性键值对。</param>
			return jQun.set(this.source, attrs);
		},
		source : undefined,
		trigger : function(target){
			///	<summary>
			///	触发事件。
			///	</summary>
			///	<param name="target" type="element">触发该事件的元素。</param>
			return target.dispatchEvent(this.source);
		},
		type : "Event"
	});

	return Event.constructor;
}(
	this.HTMLElementList.prototype.attach,
	jQun.define
));

this.HTML = (function(HTMLElementList, sRegx, fRegx, tReplace){
	function HTML(str, _isId){
		///	<summary>
		///	html模板。
		///	</summary>
		///	<param name="str" type="string">html模板源字符串。</param>
		///	<param name="_isId" type="boolean">给定的字符串是否为id。</param>

		// 此类代码还需优化
		var arr = [], variables = {};

		arr.push("with(this){ return (function(", "undefined){ this.push('");

		arr.push(
			// 使用Text类的replace替换参数
			tReplace.call({
				text : (_isId === true ? new HTMLElementList("#" + str).innerHTML : str)
					// 给单引号加保护
					.split("'").join("\\'")
					// 替换掉特殊的空白字符
					.replace(sRegx, "")
					// 替换for循环
					.replace(fRegx, function(str, condition, i){
						return [
							"');jQun.forEach(",
							condition.split("{").join("\t").split("}").join("\n"),
							", function(" + (i || "") + ")\t this.push('"
						].join("");
					})
			}, function(str, modifier, word){
				if(modifier === ":"){
					return "\t" + word + "\n";
				}

				if(word.indexOf(".") > -1){
					if(modifier === "~"){
						return "'+ (" + word + " || '') + '";
					}
				}
				else{
					variables[word] = modifier === "~";
				}

				return "'+ " + word + " + '";
			})
			// 替换for循环的结束标识“}”
			.split("}").join("');}, this);this.push('")
			// 替换临时产生的大括号
			.split("\t").join("{")
			.split("\n").join("}")
		);

		arr.push("');return this.join('');}.call([]");

		// 定义参数
		forEach(variables, function(isEmpty, word){
			arr[0] += word + ", ";
			arr.push(
				tReplace.call(
					{
						text : ", '{word}' in this ? this['{word}'] : " + (isEmpty ? "''" : "'{word}'")
					},
					{ word : word }
				)
			);
		});

		arr.push(")); }");

		this.assign({
			template : arr.join("")
		});
	};
	HTML = new NonstaticClass(HTML, "jQun.HTML");

	HTML.properties({
		create : function(_data){
			///	<summary>
			///	将模板转化为html元素。
			///	</summary>
			///	<param name="data" type="object, array">需要渲染的数据。</param>
			var htmlElementList = jQun(""), parent = document.createElement("div");

			parent.innerHTML = this.render(_data);
			htmlElementList.combine(parent.childNodes);

			htmlElementList.remove();

			return htmlElementList;
		},
		render : function(_data){
			///	<summary>
			///	渲染模板。
			///	</summary>
			///	<param name="_data" type="object, array">需要渲染的数据。</param>
			return new Function("jQun", this.template).call(_data || {}, jQun);
		},
		template : ""
	});

	return HTML.constructor;
}(
	this.HTMLElementList,
	// sRegx => space(查找特殊的空白字符)
	/[\r\t\n]/g,
	// fRegx => for(查找for语句)
	/@for\s*\(([\s\S]+?)(?:\s*->>\s*([\s\S]+?))*?\)\s*\{/g,
	// tReplace
	this.Text.prototype.replace
));

with(jQun){
	defineProperties(jQun, this);
	define(window, "jQun", jQun);
}
}.call({}, Object, Array, Function));
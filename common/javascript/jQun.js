/*
 *  类库名称：jQun
 *  中文释义：骥群(聚集在一起的千里马)
 *  文档状态：1.0.2.1
 *  本次修改：Ajax添加beginTesting,解决手机测试使用问题
 *  开发浏览器信息：firefox 20.0 、 chrome 26.0 、 IE9等
 *  下一步 ： html模板优化
 */

(function(Object, Array, Function, undefined){
var jQun,

	NonstaticClass, StaticClass,

	List,

	forEach;

jQun = (function(methods){
	return methods;
}({
	define : function(obj, name, value, _descriptor){
		///	<summary>
		///	将属性添加到对象或修改现有属性的特性。
		///	</summary>
		///	<param name="obj" type="object">对其添加或修改属性的对象。</param>
		///	<param name="name" type="string">需要添加或修改的属性名。</param>
		///	<param name="value" type="*">需要添加或修改的属性值。</param>
		///	<param name="_descriptor" type="object">需要添加或修改的属性描述符。</param>
		var isAccessor, desc = { configurable : true, writable : true };

		_descriptor = _descriptor || {};
		isAccessor = _descriptor.gettable || _descriptor.settable;

		forEach(_descriptor, function(value, name){
			desc[name] = value;
		});

		if(isAccessor){
			delete desc["writable"];
			desc.get = value.get;
			desc.set = value.set;
		}
		else{
			desc.value = value;
		}

		Object.defineProperty(obj, name, desc);

		if(!isAccessor && _descriptor.extensible === false)
			Object.preventExtensions(obj[name]);

		return obj;
	},
	defineProperties : function(obj, properties, _descriptor){
		///	<summary>
		///	将一个或多个属性添加到对象，并/或修改现有属性的特性。
		///	</summary>
		///	<param name="obj" type="object">对其添加或修改属性的对象。</param>
		///	<param name="properties" type="object">包含一个或多个属性的键值对。</param>
		///	<param name="_descriptor" type="object">需要添加或修改的属性描述符。</param>
		var define = jQun.define;

		forEach(properties, function(value, name){
			define(obj, name, value, _descriptor);
		});
		return obj;
	},
	every : function(obj, fn, _this){
		///	<summary>
		///	确定对象的所有枚举成员是否满足指定的测试。
		///	</summary>
		///	<param name="obj" type="object">需要测试成员的对象。</param>
		///	<param name="fn" type="function">用于测试对象成员的测试函数。</param>
		///	<param name="_this" type="*">指定测试函数的 this 对象。</param>
		if(obj instanceof Array)
			return obj.every(fn, _this);

		var func = _this === undefined ? fn : fn.bind(_this);

		for(var o in obj){
			if(func(obj[o], o, obj))
				continue;
			
			return false;
		}
		return true;
	},
	except : function(args, properties){
		///	<summary>
		///	返回一个不包含所有指定属性名称的合并对象。
		///	</summary>
		///	<param name="args" type="object">用于合并的对象集合。</param>
		///	<param name="properties" type="array">需要排除的属性名称数组。</param>
		var result = {};

		forEach(jQun.toArray(arguments, 0, -1), function(obj){
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
		///	为对象中的每个枚举元素执行指定操作。
		///	</summary>
		///	<param name="obj" type="object">需要枚举执行指定操作的对象。</param>
		///	<param name="fn" type="function">指定的操作函数。</param>
		///	<param name="_this" type="*">指定操作函数的 this 对象。</param>
		if(obj instanceof Array){
			obj.forEach(fn, _this);
			return obj;
		}

		var func = _this === undefined ? fn : fn.bind(_this);

		for(var o in obj){
			func(obj[o], o, obj);
		}
		return obj;
	},
	isInstanceOf : function(obj, constructor){
		///	<summary>
		///	判断对象是否为指定类构造函数的一级实例（即直接由该类实例化）。
		///	</summary>
		///	<param name="obj" type="object">用于判断的实例对象。</param>
		///	<param name="constructor" type="function">指定的类。</param>
		return Object.getPrototypeOf(obj) === constructor.prototype;
	},
	isPropertyOf : function(property, obj){
		///	<summary>
		///	检测对象自己是否具有指定属性或访问器。
		///	</summary>
		///	<param name="property" type="*">用于检测的属性或访问器。</param>
		///	<param name="obj" type="object">一个可能具有指定属性或访问器的对象。</param>
		var getDescriptor = Object.getOwnPropertyDescriptor
			descriptorNames = [ "value", "get", "set" ];

		return !Object.getOwnPropertyNames(obj).every(function(name){
			var descriptor = getDescriptor(obj, name);

			for(var i = 0;i < 3;i++){
				if(descriptor[descriptorNames[i]] === property)
					return false;
			}
			return true;
		});
	},
	merge : function(data, args){
		///	<summary>
		///	深度合并对象中所有项，返回一个新的对象。
		///	</summary>
		///	<param name="data" type="object, array">需要合并的项。</param>
		///	<param name="args" type="object, array">其他需要合并的项列表。</param>
		if(data instanceof Array)
			return data.concat.apply(data, jQun.toArray(arguments, 1));

		var result = {}, another = arguments[1];

		jQun.nesting(arguments, function(value, name){
			result[name] = typeof value === "object" ? jQun.merge(value) : value;
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
		var func = _this === undefined ? fn : fn.bind(_this);

		forEach(obj, function(o){
			forEach(o, func);
		});
	},
	set : function(obj, args){
		///	<summary>
		///	添加或修改指定对象的属性。
		///	</summary>
		///	<param name="obj" type="object">需要添加或修改属性的对象。</param>
		///	<param name="args" type="object">需要添加或修改的属性集合。</param>
		jQun.nesting(jQun.toArray(arguments, 1), function(property, name){
			obj[name] = property;
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
	}
}));

forEach = jQun.forEach;

this.BaseClass = (function(methods, argumentRegx, argumentListRegx){
	function jQun(selector){
		///	<summary>
		///	返回一个通过指定选择器筛选出来的元素集合。
		///	</summary>
		///	<param name="selector" type="string, element，array">选择器、html、dom元素或dom元素数组。</param>
		if(methods.isInstanceOf(this, arguments.callee)){
			return this.creator.apply(this, arguments);
		}

		return new jQun.HTMLElementList(selector);
	};
	jQun.prototype = Object.create(null, { constructor : { value : jQun, writable : true } });

	methods.defineProperties(jQun.prototype, {
		assign : function(properties){
			///	<summary>
			///	给该类的属性赋值。
			///	</summary>
			///	<param name="properties" type="object">包含一个或多个属性的键值对。</param>
			methods.set(this, properties);
			return this;
		},
		base : function(args){
			///	<summary>
			///	子类访问父类。
			///	</summary>
			///	<param name="args" type="*">子类的参数列表。</param>
			var ParentClass = this.constructor.prototype.getParentClass();

			if(ParentClass.constructor === jQun)
				return;

			var arg = {}, parentList = [];

			for(
				var argumentList = arguments.callee.caller.argumentList,
					i = 0,
					j = argumentList.length;
				i < j;
				i++
			){
				arg[argumentList[i]] = arguments[i];
			}

			while(ParentClass){
				if(ParentClass === NonstaticClass)
					break;

				parentList.unshift(ParentClass);
				ParentClass = ParentClass.getParentClass();
			}

			for(var i = 0, j = parentList.length;i < j;i++){
				var passArgList = [], constructor = parentList[i].constructor;

				for(
					var argumentList = constructor.argumentList,
						n = 0,
						m = argumentList.length;
					n < m;
					n++
				){
					passArgList.push(arg[argumentList[n]]);
				}

				constructor.source.apply(this, passArgList);
			}
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
				_constructor.toString().match(argumentListRegx)[1].match(argumentRegx)
			);

			Pseudo = Object.getOwnPropertyDescriptor(
				new Function([
					"return {",
						"get '" + _name + "' (" + (argumentList.length > 0 ? "/* " + argumentList.join(", ") + " */" : "") + "){\r",
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
				source : _constructor,
				argumentList : argumentList
			});

			Pseudo.prototype = Object.create(
				_ParentClass || this.getOwnClass(),
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
		empty : function(){},
		getOwnClass : function(){
			///	<summary>
			///	获取自身类。
			///	</summary>
			return this.constructor.prototype;
		},
		getParentClass : function(){
			///	<summary>
			///	获取父类。
			///	</summary>
			return Object.getPrototypeOf(this);
		},
		isChildOf : function(AncestorClass){
			///	<summary>
			///	判断该类是否是指定类的子孙类。
			///	</summary>
			///	<param name="AncestorClass" type="object, function">指定的类，或指定类的构造函数。</param>
			return this instanceof AncestorClass.constructor;
		},
		properties : function(properties, _descriptor){
			///	<summary>
			///	将一个或多个属性添加到该类，并/或修改现有属性的特性。
			///	</summary>
			///	<param name="properties" type="object">包含一个或多个属性的键值对。</param>
			///	<param name="_descriptor" type="object, array">被添加或修改属性的描述符。</param>
			methods.defineProperties(this, properties, _descriptor);
			return this;
		}
	});


	function NonstaticClass(_constructor, _name, _ParentClass){
		///	<summary>
		///	派生出一个非静态类。
		///	</summary>
		///	<param name="_constructor" type="function">源构造函数。</param>
		///	<param name="_name" type="string">构造函数的名称。</param>
		///	<param name="_ParentClass" type="function">需要继承的父类</param>
		return new jQun(_constructor, _name, _ParentClass || this.getOwnClass());
	};
	NonstaticClass = new jQun(NonstaticClass, "NonstaticClass");


	function StaticClass(_constructor, _name, _properties, _descriptor){
		///	<summary>
		///	派生出一个静态类。
		///	</summary>
		///	<param name="_constructor" type="function">源构造函数。</param>
		///	<param name="_name" type="string">构造函数的名称。</param>
		///	<param name="_properties" type="object">类的属性。</param>
		///	<param name="_descriptor" type="object, array">被添加属性的描述符。</param>
		var NewClass = new jQun(_constructor, _name, this.getOwnClass());

		NewClass.properties({
			base : undefined
		});

		if(_properties){
			if(_descriptor){
				this.properties.call(NewClass, _properties, _descriptor);
			}
			else{
				forEach(_properties, function(descriptor, name){
					define(NewClass, name, descriptor.value, descriptor);
				});
			}
		}

		if(_constructor)
			_constructor.call(NewClass);

		return NewClass;
	};
	StaticClass = new jQun(StaticClass, "StaticClass");

	return {
		NonstaticClass : NonstaticClass.constructor,
		StaticClass : StaticClass.constructor
	};
}(
	// methods
	jQun,
	// argumentRegx
	/([^\s\,]+)/g,
	// argumentListRegx
	/function[^\(]*\(([^\))]*)/
));

NonstaticClass = this.BaseClass.NonstaticClass;
StaticClass = this.BaseClass.StaticClass;

this.Independent = (function(tRegx){
	function Browser(){
		///	<summary>
		///	浏览器基本信息类。
		///	</summary>
		var browser = this,
			userAgent = navigator.userAgent.toLowerCase();

		jQun.every({
			msie : /msie ([\d.]+)/,
			firefox : /firefox\/([\d.]+)/,
			opera : /opera.([\d.]+)/,
			chrome : /chrome\/([\d.]+)/,
			safari : /version\/([\d.]+).*safari/
		}, function(regx, name){
			var version = userAgent.match(regx);

			if(!version)
				return true;

			browser.assign({ agent : name, version : version[1] });
			return false;
		});
	}
	Browser = new StaticClass(Browser, "jQun.Browser", {
		agent : "unkown",
		version : "0"
	}, { enumerable : true });


	function JSON(){
		///	<summary>
		///	JSON功能类。
		///	</summary>
	};
	JSON = new StaticClass(undefined, "jQun.JSON");

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

	return {
		Browser : Browser,
		JSON : JSON,
		Namespace : Namespace.constructor
	};
}());

this.Replacement = (function(sRegx, fRegx, rRegx, tRegx){
	function HTML(html){
		///	<summary>
		///	html模板。
		///	</summary>
		///	<param name="html" type="string">html模板源字符串。</param>

		// 此类代码还需优化
		var arr = [], variables = {}, tReplace = Text.replace;

		arr.push("with(this){ return (function(", "undefined){ this.push('");

		arr.push(
			// 使用Text类的replace替换参数
			tReplace.call({
				text : html
					// 替换掉特殊的空白字符
					.replace(sRegx, "")
					// 替换for循环
					.replace(fRegx, function(str, condition, i){
						var replacement = ["');"];

						replacement.push("jQun.forEach(");

						// 如果条件为对象循环
						if(isNaN(condition - 0)){
							replacement.push(condition.split("{").join("\t").split("}").join("\n"));
						}
						// 如果条件为数字循环
						else {
							replacement.push("new Array(" + condition + " - 0 + 1).join(' ')");
						}

						replacement.push(", function(" + (i || "THIS") + ")\t this.push('");
						return replacement.join("");
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
			.replace(rRegx, function(str){
				return str === "\n" ? "}" : "{";
			})
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
			return new Function(this.template).call(_data || {});
		},
		template : ""
	});


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

	return {
		HTML : HTML.constructor,
		Text : Text.constructor
	};
}(
	// sRegx => space(查找特殊的空白字符)
	/[\r\t\n]/g,
	// fRegx => for(查找for语句)
	/@for\s*\(([\s\S]+?)(?:\s*->>\s*([\s\S]+?))*?\)\s*\{/g,
	// rRegx => restore(查找for语句参数里面转义的大括号)
	/[\t\n]/g,
	// tRegx => text(Text类的查找参数)
	/\{\s*(?:\?([^\{\}\s]{1}))?\s*([^\{\}]*?)\s*\}/g
));

this.Ajax = (function(stateChanged, getSendString){
	function ConnectionSettings(settings){
		///	<summary>
		///	连接配置。
		///	</summary>
		///	<param name="settings" type="object">连接配置。</param>
		this.assign(settings);
	};
	ConnectionSettings = new NonstaticClass(ConnectionSettings, "jQun.ConnectionSettings");

	ConnectionSettings.properties({
		formatter : undefined,
		type : "GET",
		url : ""
	}, { enumerable : true });

	function RequestHeader(){
		///	<summary>
		///	请求头部信息。
		///	</summary>
	}
	RequestHeader = new StaticClass(undefined, "jQun.RequestHeader");

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
			this.value = this;
			return this;
		}
	});


	function RequestStorage(){
		///	<summary>
		///	连接配置存储器。
		///	</summary>
	};
	RequestStorage = new StaticClass(undefined, "jQun.RequestStorage");

	RequestStorage.properties({
		clear : function(){
			///	<summary>
			///	清空所有连接配置。
			///	</summary>
			forEach(this, function(value, name){
				delete this[name];
			});
			return this;
		},
		get : function(name){
			///	<summary>
			///	获取连接配置项。
			///	</summary>
			///	<param name="name" type="string">连接名称。</param>
			return this[name];
		},
		set : function(name, settings){
			///	<summary>
			///	设置配置项。
			///	</summary>
			///	<param name="name" type="string">连接名称。</param>
			///	<param name="settings" type="object">连接配置。</param>
			this[name] = new jQun.ConnectionSettings(settings);
			return this;
		}
	});


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
		RequestStorage : RequestStorage,
		beginTesting : function(){
			this.isTesting = true;
		},
		isTesting : false,
		open : function(name, params, _complete, _isNotAsyn){
			///	<summary>
			///	开打一个ajax连接。
			///	</summary>
			///	<param name="name" type="string">连接名称。</param>
			///	<param name="params" type="object">url的替换参数及post方法的传递参数。</param>
			///	<param name="_complete" type="function">异步完成后所执行的回调函数。</param>
			///	<param name="_isNotAsyn" type="boolean">是否执行同步。</param>
			var item = this.RequestStorage.get(name);

			if(!item){
				console.error("ajax请求信息错误：请检查连接名称是否正确。", arguments);
				return;
			}

			var url = item.url, type = item.type, isPost = type === "POST",
				request = new XMLHttpRequest();

			if(url instanceof jQun.Text){
				url = url.replace(params);
			}

			if(typeof _complete === "function"){
				var responseType = this.responseType, isResponseJSON = responseType === "json";

				if(this.isTesting){
					stateChanged({
						readyState : 4,
						status : 200,
						responseText : ""
					}, item.formatter, _complete, isResponseJSON);

					return;
				}

				request.onreadystatechange =  function(){
					stateChanged(this, item.formatter, _complete, isResponseJSON);
				};
			}

			request.open(type, url, _isNotAsyn !== false);
			request.responseType = isResponseJSON ? "text" : responseType;
			
			if(isPost){
				this.RequestHeader.addTo(request);
			}

			request.send(isPost ? getSendString(params) : null);
			return request;
		},
		responseType : "text",
		save : function(allSettings, _allFormatters){
			///	<summary>
			///	存储ajax连接信息。
			///	</summary>
			///	<param name="allSettings" type="array">ajax连接信息，如：["name", new jQun.Text("url"), "get", _formatter]。</param>
			///	<param name="_allFormatters" type="function">所有的数据格式转换函数。</param>
			var Storage = this.RequestStorage,
				toUpperCase = String.prototype.toUpperCase;

			if(!_allFormatters){
				_allFormatters = {};
			}

			forEach(allSettings, function(settings){
				var name = settings[0];

				Storage.set(name, {
					url : settings[1],
					type : toUpperCase.call(settings[2]) === "POST" ? "POST" : "GET",
					formatter : _allFormatters[name] || settings[3]
				});
			});
			return Storage;
		},
		setResponseType : function(type){
			///	<summary>
			///	设置返回数据的格式。
			///	</summary>
			///	<param name="type" type="string">数据的格式("text"、"json"、"arraybuffer"、"blob"或"document")。</param>
			this.responseType = type.toLowerCase();
		}
	});

	return {
		Ajax : Ajax,
		ConnectionSettings : ConnectionSettings.constructor,
		RequestHeader : RequestHeader,
		RequestStorage : RequestStorage
	};
}(
	// stateChanged
	function(request, formatter, complete, isResponseJSON){
		///	<summary>
		///	异步状态改变时所执行的函数。
		///	</summary>
		///	<param name="request" type="object">字符串文本。</param>
		///	<param name="formatter" type="function">返回数据的格式转换函数。</param>
		///	<param name="complete" type="function">当异步执行完毕所执行的函数。</param>
		///	<param name="isResponseJSON" type="boolean">返回的数据是否为json格式。</param>
		if(request.readyState < 4)
			return;

		var responseData = request.status === 200 ? request.responseText : "";

		if(isResponseJSON){
			responseData = jQun.JSON.parse(responseData);
		}

		if(typeof formatter === "function"){
			responseData = formatter(responseData);
		}

		complete(responseData);
	},
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

this.List = (function(addArrayMethods){
	function List(){
		///	<summary>
		///	对列表进行管理、操作的类。
		///	</summary>
		this.properties({ length : 0 });
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
		createList : function(args){
			///	<summary>
			///	根据构造函数重新创建个新的列表。
			///	</summary>
			///	<param name="args" type="*">用于传递给构造函数的参数列表。</param>
			var constructor = this.constructor;

			if(arguments.length === 0)
				return new constructor();

			return new (
				constructor.bind.apply(
					constructor,
					this.combine.call([null], arguments)
				)
			);
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

	return {
		List : List.constructor
	};
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

List = this.List.List;

this.PropertyCollection = (function(List, Common){
	function ElementPropertyCollection(elementList){
		///	<summary>
		///	所有元素属性的基类。
		///	</summary>
		///	<param name="elementList" type="array">元素列表（由 ElementList 类或其子孙类的实例）。</param>
		var name = this.propertyName;

		this.properties({
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


	function AttributeCollection(elementList){
		///	<summary>
		///	元素属性类。
		///	</summary>
	};
	AttributeCollection = new NonstaticClass(Common, "jQun.AttributeCollection", ElementPropertyCollection);

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
		propertyName : "attributes",
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

	
	function CSSPropertyCollection(elementList){
		///	<summary>
		///	元素css属性类。
		///	</summary>
	};
	CSSPropertyCollection = new NonstaticClass(Common, "jQun.CSSPropertyCollection", ElementPropertyCollection);

	CSSPropertyCollection.properties({
		get : function(name){
			///	<summary>
			///	获取集合中第一个元素的CSS属性。
			///	</summary>
			///	<param name="name" type="string">CSS属性名。</param>
			return this[0][name];
		},
		propertyName : "style",
		set : function(name, value){
			///	<summary>
			///	设置集合中所有元素的CSS属性。
			///	</summary>
			///	<param name="properties" type="object">CSS属性键值对。</param>
			if(typeof value === "number")
				value += "px";

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


	function ChildrenCollection(elementList){
		///	<summary>
		///	元素子节点类。
		///	</summary>
	};
	ChildrenCollection = new NonstaticClass(Common, "jQun.ChildrenCollection", ElementPropertyCollection);

	ChildrenCollection.properties({
		append : function(node){
			///	<summary>
			///	添加一个子节点。
			///	</summary>
			///	<param name="node" type="object">需要添加的子节点。</param>
			new jQun.ElementList(node).appendTo(this.sources[0]);
			return this;
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
			new jQun.ElementList(node).insertTo(this.sources[0], _idx);
			return this;
		},
		propertyName : "children",
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


	function ClassListCollection(elementList){
		///	<summary>
		///	元素class属性类。
		///	</summary>
	};
	ClassListCollection = new NonstaticClass(Common, "jQun.ClassListCollection", ElementPropertyCollection);

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
		propertyName : "classList",
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


	return {
		AttributeCollection : AttributeCollection.constructor,
		CSSPropertyCollection : CSSPropertyCollection.constructor,
		ChildrenCollection : ChildrenCollection.constructor,
		ClassListCollection : ClassListCollection.constructor,
		ElementPropertyCollection : ElementPropertyCollection.constructor
	};
}(
	List,
	// Common
	function(elementList){
		///	<summary>
		///	ElementPropertyCollection 类所有的子类的共同构造函数。
		///	</summary>
		///	<param name="elementList" type="array">元素列表（由 ElementList 类或其子孙类的实例）。</param>
	}
));

this.NodeList = (function(List, emptyAttrCollection, addProperty, selectorReplaceRegx){
	function NodeList(){
		///	<summary>
		///	节点列表类。
		///	</summary>
	};
	NodeList = new NonstaticClass(NodeList, "jQun.NodeList", List.prototype);

	NodeList.properties({
		attributes : {
			get : function(){
				///	<summary>
				///	获取属性集合。
				///	</summary>
				return new jQun.AttributeCollection(this);
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
		insertTo : function(parentNode, _idx){
			///	<summary>
			///	将集合中所有节点插入至指定索引的节点之前。
			///	</summary>
			///	<param name="parentNode" type="object">指定的父节点。</param>
			///	<param name="_idx" type="number">指定节点的索引值。</param>
			var existingNode,
				children = children = parentNode.children;

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


	function ElementList(selector, _parent){
		///	<summary>
		///	通过指定选择器筛选元素。
		///	</summary>
		///	<param name="selector" type="string, object">选择器、html或dom元素。</param>
		///	<param name="_parent" type="object">指定查询的父节点。</param>
		if(!selector)
			return;

		var window = this.view;

		if(typeof selector === "string"){
			var elements, doc = window.document;

			selector = selector.replace(selectorReplaceRegx, function(word){
				return '[' + (word.charAt(0) === "#" ? "id" : "class~") + '="' + word.substring(1) + '"]';
			});
			_parent = _parent || doc;

			try{
				elements = _parent.querySelectorAll(selector);
			} catch(e){
				if(_parent === doc){
					console.error(e.message);
					return;
				}

				_parent.setAttribute("__selector__", "__jQun__");
				elements = (_parent.parentElement || _parent)["querySelectorAll"]('[__selector__="__jQun__"]' + selector);
				_parent.removeAttribute("__selector__");
			}

			this.combine(elements);
			return;
		}

		if(selector instanceof window.Node || selector instanceof window.constructor){
			this.push(selector);
			return;
		}

		if(selector instanceof jQun.HTML){
			return selector.create();
		}

		if("length" in selector){
			this.combine(selector);
			return;
		}
	};
	ElementList = new NonstaticClass(ElementList, "jQun.ElementList", NodeList);

	ElementList.properties({
		attach : function(event, _capture){
			///	<summary>
			///	向集合中所有元素注册事件侦听器。
			///	</summary>
			///	<param name="event" type="object">事件侦听器键值对。</param>
			///	<param name="_capture" type="boolean">侦听器是否运行于捕获阶段。</param>
			this.forEach(function(element){
				forEach(event, function(fn, type){
					element.addEventListener(type, fn, _capture);
				});
			});
			return this;
		},
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
		detach : function(event){
			///	<summary>
			///	移除集合中所有元素的事件侦听器。
			///	</summary>
			///	<param name="event" type="object">事件侦听器键值对。</param>
			this.forEach(function(element){
				forEach(event, function(fn, type){
					element.removeEventListener(type, fn);
				});
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
		find : function(selector){
			///	<summary>
			///	通过选择器查找子孙元素。
			///	</summary>
			///	<param name="selector" type="string">选择器。</param>
			var source = jQun.ElementList.source, list = this.createList();

			this.forEach(function(htmlElement){
				source.call(list, selector, htmlElement);
			});

			if(this.length < 2)
				return list;

			return list.distinct();
		},
		parent : function(){
			///	<summary>
			///	返回该集合的所有父元素。
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
		},
		view : window
	});

	ElementList.properties({
		children : {
			get : function(){
				///	<summary>
				///	获取子元素集合。
				///	</summary>
				return new jQun.ChildrenCollection(this);
			},
			set : function(elementList){
				///	<summary>
				///	移除所有现有子元素，添加指定的子元素。
				///	</summary>
				///	<param name="elementList" type="array">需要添加的子元素集合。</param>
				this.children.remove();
				new jQun.ElementList(elementList).appendTo(this[0]);
			}
		},
		classList : {
			get : function(){
				///	<summary>
				///	获取class列表集合。
				///	</summary>
				return new jQun.ClassListCollection(this);
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


	function HTMLElementList(selector){};
	HTMLElementList = new NonstaticClass(HTMLElementList, "jQun.HTMLElementList", ElementList);

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

	// firefox 把onmouseenter、onmouseleave、onwheel归为了Element的属性
	forEach(
		Object.getOwnPropertyNames(window.constructor.prototype),
		function(name){
			if(name.substring(0, 2) != "on")
				return;
			
			addProperty.call(HTMLElementList, name);
		}
	);

	HTMLElementList.properties({
		style : {
			get : function(){
				///	<summary>
				///	获取style属性集合。
				///	</summary>
				return new jQun.CSSPropertyCollection(this);
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
		metrics : function(name, _value){
			///	<summary>
			///	获取或设置元素指定盒模型属性值。
			///	</summary>
			///	<param name="name" type="string">盒模型属性名称。</param>
			///	<param name="_value" type="string, number">盒模型属性值。</param>
			if(_value === undefined)
				return this.get(name, "css").split(/\D*/).join("") - 0;

			this.style[name] = _value;
			return this;
		},
		width : function(w){
			///	<summary>
			///	获取或设置集合中每一个元素的宽。
			///	</summary>
			///	<param name="w" type="string, number">元素的宽。</param>
			return this.metrics("width", w);
		}
	});

	return {
		ElementList : ElementList.constructor,
		HTMLElementList : HTMLElementList.constructor,
		NodeList : NodeList.constructor
	};
}(
	List,
	// emptyAttrCollection
	new this.PropertyCollection.AttributeCollection([]),
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
	},
	// selectorReplaceRegx
	/[\#\.]\d[^\:\#\.\,\+\~\[\>]*/g
));

jQun = (function(Namespaces){
	jQun.nesting(Namespaces, function(value, name){
		jQun[name] = value;
	});

	return jQun.defineProperties(
		Object.getPrototypeOf(NonstaticClass.prototype).constructor,
		jQun
	);
}(this));

window.jQun = jQun;

}.call({}, Object, Array, Function, undefined));
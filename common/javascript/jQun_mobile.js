(function(jQun, mEvents){
// 如果是移动设备，则不需要虚拟这些方法及事件
if(jQun.Browser.isMobile){
	return;
}

// 重写ElementList的attach、detach
(function(ElementList, forEach){
	this.attach = function(events, _capture){
		///	<summary>
		///	向集合中所有元素注册事件侦听器。
		///	</summary>
		///	<param name="events" type="object">事件侦听器键值对。</param>
		///	<param name="_capture" type="boolean">侦听器是否运行于捕获阶段。</param>
		this.forEach(function(element){
			forEach(events, function(fn, type){
				if(type in mEvents){
					type = mEvents[type];
				}

				element.addEventListener(type, fn, _capture);
			});
		});
		return this;
	};

	this.detach = function(events){
		///	<summary>
		///	移除集合中所有元素的事件侦听器。
		///	</summary>
		///	<param name="events" type="object">事件侦听器键值对。</param>
		this.forEach(function(element){
			forEach(events, function(fn, type){
				if(type in mEvents){
					type = mEvents[type];
				}

				element.removeEventListener(type, fn);
			});
		});
		return this;
	};

	ElementList.prototype.properties(this);
}.call(
	{},
	jQun.ElementList,
	jQun.forEach
));


// 重写HTMLElementList三个事件的赋值与获取
(function(HTMLElementList){
	jQun.forEach(mEvents, function(type, mType){
		this["on" + mType] = {
			get : function(){
				return this.get("on" + type);
			},
			set : function(value){
				this.set("on" + type, value);
			}
		};
	}, this);

	HTMLElementList.prototype.properties(this, { gettable : true, settable : true });
}.call(
	{},
	jQun.HTMLElementList
));


// 给MouseEvent虚拟一些移动特有属性
(function(MouseEvent, NonstaticClass, StaticClass){
this.touches = (function(List, window){
	function Touch(){}
	Touch = new StaticClass(null, "Touch");

	["clientX", "clientY", "pageX", "pageY", "screenX", "screenY"].forEach(function(name){
		var properties = {};

		properties[name] = {
			get : function(){
				return window.event[name];
			},
			set : function(value){
				window.event[name] = value;
			}
		};

		Touch.properties(properties, { gettable : true, settable : true });
	});

	function TouchList(){
		this.push(Touch);
	};
	TouchList = new NonstaticClass(TouchList, "TouchList", List.prototype);

	return new TouchList.constructor();
}(
	jQun.List,
	window
));

jQun.defineProperties(MouseEvent.prototype, this);
}.call(
	{},
	MouseEvent,
	jQun.NonstaticClass,
	jQun.StaticClass
));

}(
	jQun,
	{
		touchstart : "mousedown",
		touchmove : "mousemove",
		touchend : "mouseup"
	}
));


(function(NonstaticClass, StaticClass, jQun){
var Timer;

Timer = (function(setTimeout, clearTimeout){
	function Timer(_speed){
		this.assign({
			speed : _speed || 200
		});
	};
	Timer = new NonstaticClass(Timer, "Timer");

	Timer.properties({
		"break" : function(){
			this.isEnabled = false;
			clearTimeout(this.index);
		},
		index : -1,
		isEnabled : false,
		interval : function(intervalFn){
			this.index = setTimeout(function(){
				intervalFn();

				if(!this.isEnabled)
					return;

				this.interval(intervalFn);
			}.bind(this), this.speed);
		},
		speed : 200,
		start : function(){
			if(this.isEnabled)
				return;

			this.isEnabled = true;
			//this.interval(intervalFn);
		}
	});

	return Timer.constructor;
}(
	// setTimeout
	setTimeout,
	// clearTimeout
	clearTimeout
));


this.Scroll = (function(getTop, setTop){
	function Scroll(){
		var Scroll = this,
			
			sourceEl = this.sourceEl,
			
			scrollTimer = this.scrollTimer,
			touchTimer = this.touchTimer;

		sourceEl.attach({
			touchstart : function(e){
				Scroll.pageY = e.touches[0].pageY;

				var scrollEl = jQun(e.target).between(".scroll");

				if(scrollEl.length === 0)
					return;

				Scroll.assign({
					scrollEl : scrollEl,
					top : getTop(scrollEl)
				});

				scrollEl.set("position", "relative", "css");
				touchTimer.start();
			},
			touchmove : function(e){
				if(!touchTimer.isEnabled)
					return;

				setTop(Scroll.scrollEl, Scroll.top + e.touches[0].pageY - Scroll.pageY);
			},
			touchend : function(){
				var scrollEl = Scroll.scrollEl, top = getTop(scrollEl);

				if(top > 0){
					setTop(scrollEl, 0);
				}
				else {
					var h = (scrollEl.height() - scrollEl.parent().height()) * -1;

					if(top < h){
						setTop(scrollEl, h);
					}
				}
				touchTimer.break();
			}
		});
	};
	Scroll = new StaticClass(Scroll, "jQun.Scroll", {
		pageY : 0,
		scrollTimer : new Timer(75),
		sourceEl : jQun(window),
		touchTimer : new Timer()
	});

	return Scroll;
}(
	// getTop
	function(scrollEl){
		return scrollEl.get("top", "css").split("px").join("") - 0 || 0;
	},
	// setTop
	function(scrollEl, top){
		scrollEl.set("top", Math.round(top) + "px", "css");
	}
));

jQun.defineProperties(jQun, this);

}.call(
	{},
	jQun.NonstaticClass,
	jQun.StaticClass,
	jQun
));
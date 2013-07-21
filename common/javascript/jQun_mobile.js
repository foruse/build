(function(jQun, mEvents){

// 如果是移动设备，则不需要虚拟这些方法及事件
if(jQun.Browser.isMobile){
	return;
}

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


}(
	jQun,
	{
		touchstart : "mousedown",
		touchmove : "mousemove",
		touchend : "mouseup"
	}
));


(function(StaticClass, jQun){

this.Scroll = (function(setTimeout){
	function Timer(){};
	Timer = new StaticClass(null, "Timer");

	Timer.properties({
		"break" : function(){
			this.isEnabled = false;
		},
		current : 0,
		isEnabled : false,
		max : 1,
		setMax : function(max){
			this.max = max;
		},
		start : function(onSuccess){
			var timer = this, current = this.current;

			if(this.max < current){
				this.break();
				onSuccess();
				return;
			}
			else if(current === 0){
				this.isEnabled = true;
			}
			else if(!this.isEnabled){
				this.current = 0;
				console.log("dis");
				return;
			}

			this.current++;

			setTimeout(function(){
				timer.start(onSuccess);
			}, 100);
		}
	});


	function Scroll(){
		var sourceEl = this.sourceEl;

		Timer.setMax(3);

		sourceEl.attach({
			touchstart : function(){
				Timer.start(function(){
					console.log(1);
				});
			},
			touchmove : function(){
				console.log(2);
				Timer.break();
			},
			touchend : function(){
		
			}
		});
	};
	Scroll = new StaticClass(Scroll, "jQun.Scroll", {
		sourceEl : jQun(window)
	});

	return Scroll;
}(
	// setTimeout
	setTimeout
));

jQun.defineProperties(jQun, this);

}.call(
	{},
	jQun.StaticClass,
	jQun
));
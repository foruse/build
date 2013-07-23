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
	function Timer(){};
	Timer = new NonstaticClass(Timer, "Timer");

	Timer.properties({
		stop : function(_onbreak){
			///	<summary>
			///	停止计时器。
			///	</summary>
			///	<param name="_onbreak" type="function">如果未超时就被停止，那么会执行这个中断函数，否则不会执行。</param>
			var index = this.index;

			this.isEnabled = false;

			// 如果计时器已运行，说明已超时，则return
			if(index === -1)
				return;

			// 清除计时器
			clearTimeout(index);
			this.index = -1;

			if(typeof _onbreak === "function"){
				_onbreak();
			}
		},
		index : -1,
		isEnabled : false,
		start : function(_timeout, _ontimeout){
			///	<summary>
			///	开始计时器，该计时器需要人为手动停止。
			///	</summary>
			///	<param name="_timeout" type="number">超时时间，单位毫秒。</param>
			///	<param name="_ontimeout" type="function">超时所执行的函数。</param>

			// 如果已经开始，则return
			if(this.isEnabled)
				return;

			this.assign({
				index : -1,
				isEnabled : true
			});

			// 设置计时器
			this.index = setTimeout(function(){
				this.index = -1;

				if(!_ontimeout)
					return;

				_ontimeout();
			}.bind(this), _timeout || 200);
		}
	});

	return Timer.constructor;
}(
	// setTimeout
	setTimeout,
	// clearTimeout
	clearTimeout
));


this.Scroll = (function(getTop, setTop, onborder){
	function Scroll(){
		var Scroll = this,
			
			scrollTimer = this.scrollTimer,
			touchTimer = this.touchTimer;

		this.sourceEl.attach({
			touchstart : function(e){
				//	记录pageY
				Scroll.pageY = e.touches[0].pageY;

				var scrollEl = jQun(e.target).between(".scroll");

				// 如果没有需要滚动条的元素就return
				if(scrollEl.length === 0)
					return;

				Scroll.assign({
					scrollEl : scrollEl,
					top : getTop(scrollEl)
				});

				// 将滚动元素设为relative，便于使用top，而不打乱其他布局，比marginTop好
				scrollEl.set("position", "relative", "css");
				// 停止滚动计时器
				scrollTimer.stop();
				// 启动计时器
				touchTimer.start(250);
			},
			touchmove : function(e){
				// 如果计时器是未启动的，就return
				if(!touchTimer.isEnabled)
					return;

				// 设置top
				setTop(Scroll.scrollEl, Scroll.top + e.touches[0].pageY - Scroll.pageY);
			},
			touchend : function(e){
				var scrollEl = Scroll.scrollEl;
				
				if(!scrollEl)
					return;

				onborder(scrollEl, getTop(scrollEl), function(t){
					setTop(scrollEl, t);
				});

				this.scrollEl = undefined;

				// 停止计时器
				touchTimer.stop(function(){
					var y = e.touches[0].pageY - Scroll.pageY,

						precent = Math.abs((y / scrollEl.parent().height()).toFixed(2));

					if(precent < 0.4)
						return;

					var top = getTop(scrollEl),
						speend = 100, i = (precent > 0.75 ? 0 : 3) * (y > 0 ? 1 : -1);

					scrollTimer.start(75, function(){
						var isEnd = false;

						top = top + speend;
						speend = speend - i;
						
						// 如果速度变为0，表明是要停止滚动
						if(speend <= 0){
							isEnd = true;
						}

						// 滚动到了边界的处理方法
						onborder(scrollEl, top, function(t){
							top = t;
							isEnd = true;
						})
	
						setTop(scrollEl, top);
						scrollTimer.stop();					

						// 滚动结束
						if(isEnd){
							return;
						}

						scrollTimer.start(75, arguments.callee);
					});
				});
			}
		});
	};
	Scroll = new StaticClass(Scroll, "jQun.Scroll", {
		// touchstart时，记录的pageY值
		pageY : 0,
		// 当前需要滚动的元素
		scrollEl : undefined,
		// 滚动计时器
		scrollTimer : new Timer(),
		// 监听滚动的事件元素
		sourceEl : jQun(window),
		// touchstart时，记录的top值
		top : 0,
		// 触屏计时器
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
	},
	// onborder
	function(scrollEl, top, fn){
		// 如果是最上方的时候
		if(top > 0){
			fn(0, "top");
			return;
		}
		
		var t = (scrollEl.height() - scrollEl.parent().height()) * -1;

		// 如果是最下方的时候
		if(top < t){
			fn(t, "bottom");
		}
	}
));

jQun.defineProperties(jQun, this);

}.call(
	{},
	jQun.NonstaticClass,
	jQun.StaticClass,
	jQun
));
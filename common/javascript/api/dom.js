﻿(function(DOM, NonstaticClass, StaticClass, windowEl){
this.EventCollection = (function(Event, Timer, IntervalTimer, childGestureConstructor){
	function UserGesture(name, _init){
		///	<summary>
		///	手势事件。
		///	</summary>
		///	<param name="name" type="string">事件名称。</param>
		///	<param name="_init" type="function">事件初始化函数。</param>
		var startX, startY, lastX, lastY, target,
		
			userGesture = this,

			continuousTimer = new IntervalTimer(70),
		
			fastTimer = new Timer(250);

		jQun(window).attach({
			touchstart : function(e){
				var touch = e.touches[0];

				startX = lastX = touch.pageX;
				startY = lastY = touch.pageY;
				target = e.target;

				if(fastTimer.isEnabled){
					fastTimer.stop();
				}

				fastTimer.start();
				continuousTimer.stop();
			},
			touchmove : function(e){
				// 如果计时器是未启动的，就return
				if(!fastTimer.isEnabled)
					return;

				// 如果还在等待上一个touchmove的操作，以避免太过频繁执行事件，那么return
				if(continuousTimer.isEnabled)
					return;

				var touch = e.touches[0], pageX = touch.pageX, pageY = touch.pageY;

				userGesture.setEventAttrs("continuous", pageX - lastX, pageY - lastY);
				userGesture.trigger(target);

				lastX = pageX;
				lastY = pageY;

				e.preventDefault();

				// 保护函数
				continuousTimer.start(function(){
					continuousTimer.stop();
				});
			},
			touchend : function(e){
				var touch = e.changedTouches[0],

					pageX = touch.pageX, pageY = touch.pageY;

				continuousTimer.stop();

				// 手势结束的时候再执行最后一次
				userGesture.setEventAttrs("continuous", pageX - lastX, pageY - lastY, true);
				userGesture.trigger(target);

				fastTimer.stop(function(){
					// 如果进入该中断函数，证明手势速度比较快
					userGesture.setEventAttrs("fast", pageX - startX, pageY - startY, true);
					userGesture.trigger(target);
				});
			}
		});
	};
	UserGesture = new NonstaticClass(UserGesture, null, Event.prototype);

	UserGesture.override({
		setEventAttrs : function(type, x, y, _isLastOfGestureType){
			///	<summary>
			///	设置手势事件属性。
			///	</summary>
			///	<param name="type" type="string">事件类型。</param>
			///	<param name="x" type="number">x方向上的偏移量。</param>
			///	<param name="y" type="string">y方向上的偏移量。</param>
			///	<param name="_isLastOfGestureType" type="boolean">是否为最后一次此次该类型事件的触发。</param>
			return Event.prototype.setEventAttrs.call(this, {
				gestureType : type,
				gestureOffsetX : x,
				gestureOffsetY : y,
				isLastOfGestureType : _isLastOfGestureType === true
			});
		}
	});

	function EventCollection(){};
	EventCollection = new StaticClass(EventCollection, "BAO.API.DOM.EventCollection");

	EventCollection.properties({
		overflow : new Event("overflow").attachTo("*"),
		continuousgesture : new Event("continuousgesture", childGestureConstructor),
		fastgesture : new Event("fastgesture", childGestureConstructor),
		usergesture : new UserGesture.constructor("usergesture").attachTo("*")
	});

	return EventCollection;
}(
	jQun.Event,
	Bao.API.Manager.Timer,
	Bao.API.Manager.IntervalTimer,
	// childGestureConstructor
	function(event){
		var gesture = this;

		windowEl.attach({
			usergesture : function(e){
				if(e.gestureType + "gesture" !== gesture.name)
					return;

				gesture.setEventAttrs({
					gestureOffsetX : e.gestureOffsetX,
					gestureOffsetY : e.gestureOffsetY,
					isLastOfGestureType : e.isLastOfGestureType
				});
				gesture.trigger(e.target);
			}
		});

		this.attachTo("*");
	}
));

this.Panel = (function(HTMLElementList){
	function Panel(selector){};
	Panel = new NonstaticClass(Panel, "Bao.API.DOM.Panel", HTMLElementList.prototype);

	return Panel.constructor;
}(
	jQun.HTMLElementList
));

this.OverflowPanel = (function(Panel, IntervalTimer, getTop, setTop, onborder){
	function OverflowPanel(selector, _disableScrollBar){
		var panelEl = this,
		
			panelStyle = this.style,
		
			parentEl = panelEl.parent(),
			
			timer = new IntervalTimer(70);

		this.assign({
			disableScrollBar : _disableScrollBar === true
		});

		panelStyle.position = "relative";

		this.attach({
			touchstart : function(){
				timer.stop();
			},
			continuousgesture : function(e){
				var top = getTop(panelStyle) + e.gestureOffsetY;

				if(e.isLastOfGestureType){
					onborder(panelEl, parentEl, top, function(t){
						top = t;
					});
				}

				setTop(panelStyle, top);
			},
			fastgesture : function(e){
				var y = e.gestureOffsetY / 4, n = y > 0 ? 50 : -50;
				
				// 快速滑动事件
				timer.start(function(i){
					var top = getTop(panelStyle) + (isNaN(i) ? n : y * (1 - i++ / 35));

					onborder(panelEl, parentEl, top, function(t, type){
						// 如果是在最上方，还要往下拉，就return
						if(type === "top" && y < 0)
							return;

						// 如果是在最下方，还要往上拉，就return
						if(type === "bottom" && y > 0)
							return;

						top = t;
						timer.stop();
					});

					setTop(panelStyle, top);
				}, Math.abs(y) > parentEl.height() / 4 * 0.7 ? undefined : 35);
			}
		});
	};
	OverflowPanel = new NonstaticClass(OverflowPanel, "Bao.API.DOM.OverflowPanel", Panel.prototype);

	OverflowPanel.properties({
		disableScrollBar : false
	});

	return OverflowPanel.constructor;
}(
	this.Panel,
	Bao.API.Manager.IntervalTimer,
	// getTop
	function(panelStyle){
		return panelStyle.top.toString().split("px").join("") - 0 || 0;
	},
	// setTop
	function(panelStyle, top){
		panelStyle.top = Math.round(top) + "px";
	},
	// onborder
	function(panelEl, parentEl, top, fn){
		var type = "",

			t = parentEl.height() - panelEl.height();
		
		// 如果是最上方的时候 或者 父容器比溢出容器还要高（未溢出或隐藏了）
		if(top > 0 || t > 0){
			type = "top";
			top = 0;
		}
		// 如果是最下方的时候
		else if(top < t){
			type = "bottom";
			top = t;
		}
		// 如果不是最上方也不是最下方
		else{
			return;
		}
		
		this.setEventAttrs({ direction : type });
		this.trigger(panelEl[0]);
		fn(top, type);
	}.bind(this.EventCollection.overflow)
));


DOM.members(this);
}.call(
	{},
	Bao.API.DOM,
	jQun.NonstaticClass,
	jQun.StaticClass,
	// windowEl
	jQun(window)
));
(function(DOM, NonstaticClass, StaticClass, Event, windowEl){
this.EventCollection = (function(Timer, IntervalTimer, childGestureConstructor){
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
				if(!target)
					return;

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
		// 持续的手势事件
		continuousgesture : new Event("continuousgesture", childGestureConstructor),
		// 快速的手势事件
		fastgesture : new Event("fastgesture", childGestureConstructor),
		// 点击事件：pc上防止滑动的时候触发click事件而产生的替代的、具有保护性质的事件
		userclick : new Event("userclick", function(){
			var userClick = this, abs = Math.abs;

			windowEl.attach({
				fastgesture : function(e){
					// 如果任何一方向上的偏移量大于10，就不算click
					if(abs(e.gestureOffsetY) > 10 || abs(e.gestureOffsetX > 10))
						return;

					userClick.trigger(e.target);
				}
			});

			this.attachTo("*");
		}),
		usergesture : new UserGesture.constructor("usergesture").attachTo("*")
	});

	return EventCollection;
}(
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
	function Panel(_selector){};
	Panel = new NonstaticClass(Panel, "Bao.API.DOM.Panel", HTMLElementList.prototype);

	return Panel.constructor;
}(
	jQun.HTMLElementList
));

this.OverflowPanel = (function(Panel, IntervalTimer, getTop, setTop, leaveborder){
	function OverflowPanel(_selector, _disableScrollBar){
		var overflowPanel = this,
		
			isLeaveborder = false,
		
			panelStyle = this.style,
			
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
					isLeaveborder = false;

					leaveborder(overflowPanel, overflowPanel.parent().height(), top, function(t, type){
						top = t;
						isLeaveborder = true;
					});
				}

				setTop(panelStyle, top);
			},
			fastgesture : function(e){
				if(isLeaveborder)
					return;

				var abs = Math.abs,
				
					y = e.gestureOffsetY / 2, n = y > 0 ? 100 : -100;
				
				if(abs(y) < 10)
					return;

				var parentHeight = overflowPanel.parent().height();

				// 快速滑动事件
				timer.start(function(i){
					var top = getTop(panelStyle) + (isNaN(i) ? n : y * (1 - i++ / 15));

					leaveborder(overflowPanel, parentHeight, top, function(t, type){
						top = t;
						timer.stop();
					});

					setTop(panelStyle, top);
				}, abs(y) > parentHeight / 2 * 0.6 ? undefined : 15);
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
	// leaveborder
	function(overflowPanel, parentHeight, top, fn){
		// top等于0，说明处于恰好状态，就可以return了
		if(top === 0)
			return;
		
		var type = "", offsetBorder = top,

			h = parentHeight - overflowPanel.height();
		
		// 父容器比溢出容器还要高（未溢出或隐藏了，t应该为正数）
		if(h > 0){
			type = top > 0 ? "top" : "bottom";
			top = 0;
		}
		// 如果是最上方的时候
		else if(top > 0){
			type = "top";
			top = 0;
		}
		// 如果是最下方的时候(这时t应该为负数)
		else if(top < h){
			type = "bottom";
			offsetBorder = h - top;
			top = h;
		}
		else {
			return;
		}

		this.setEventAttrs({
			direction : type,
			offsetBorder : offsetBorder
		});
		this.trigger(overflowPanel[0]);
		fn(top, type);
	}.bind(new Event("leaveborder"))
));


DOM.members(this);
}.call(
	{},
	Bao.API.DOM,
	jQun.NonstaticClass,
	jQun.StaticClass,
	jQun.Event,
	// windowEl
	jQun(window)
));
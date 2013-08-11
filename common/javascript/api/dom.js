(function(DOM, NonstaticClass, StaticClass, windowEl){
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

				// 保护函数
				continuousTimer.start(function(){
					continuousTimer.stop();
				});
			},
			touchend : function(e){
				var touch = e.touches[0],

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
		continuousgesture : new Event("continuousgesture", childGestureConstructor),
		fastgesture : new Event("fastgesture", childGestureConstructor),
		usergesture : new UserGesture.constructor("usergesture", function(){
			this.attachTo("*");
		})
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

this.Panel = (function(){
	function Panel(panelEl){
		///	<summary>
		///	基本的容器类，所有容器都基于此类。
		///	</summary>
		///	<param name="panelEl" type="jQun.HTMLElementList">对其添加或修改属性的对象。</param>
		this.assign({
			panelEl : panelEl
		});
	};
	Panel = new NonstaticClass(Panel, "Bao.API.DOM.Panel");

	Panel.properties({
		hide : function(){
			///	<summary>
			///	隐藏该容器。
			///	</summary>
			this.panelEl.hide();
		},
		panelEl : undefined,
		show : function(){
			///	<summary>
			///	显示该容器。
			///	</summary>
			this.panelEl.show();
		}
	});

	return Panel.constructor;
}());

this.OverflowPanel = (function(Panel, IntervalTimer, getTop, setTop, onborder){
	function OverflowPanel(panelEl, _disableScrollBar){
		var panelStyle = panelEl.style,
		
			parentEl = panelEl.parent(),
			
			timer = new IntervalTimer(70);

		this.assign({
			disableScrollBar : _disableScrollBar === true
		});

		panelStyle.position = "relative";

		panelEl.attach({
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
				var y = e.gestureOffsetY / 4;

				// 快速滑动事件
				timer.start(function(i){
					var top = getTop(panelStyle) + (isNaN(i) ? 50 : y * (1 - i++ / 35));

					onborder(panelEl, parentEl, top, function(t){
						top = t;
						timer.stop();
					});

					setTop(panelStyle, top);
				}, y > parentEl.height() * 0.75 ? undefined : 35);
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
			t = (panelEl.height() - panelEl.parent().height()) * -1;
		
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
	}.bind(new jQun.Event("overflow", function(){
		this.attachTo("*");
	}))
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
(function(DOM, NonstaticClass, StaticClass){
this.EventCollection = (function(Event, Timer, windowEl){
	function GestureEvent(name, attr){
		var value, element,
		
			gestureEvent = this, source = this.source,

			timer = new Timer(250);

		windowEl.attach({
			touchstart : function(e){
				var target = e.target, val = e.touches[0][attr];

				element = target;
				value = val;

				if(timer.isEnabled){
					timer.stop();
				}

				timer.start();
			},
			touchmove : function(e){
				// 如果计时器是未启动的，就return
				if(!timer.isEnabled)
					return;

				source.offset = e.touches[0][attr] - value;
				gestureEvent.trigger(element);
			},
			touchend : function(e){
				timer.stop(function(){
					// 如果进入该中断函数，证明手势速度比较快
					source.isFaster = true;
					source.offset = e.touches[0][attr] - value;

					gestureEvent.trigger(element);

					// 恢复默认
					source.isFaster = false;
				});
				element = null;
			}
		});

		this.attachTo();
	};
	GestureEvent = new NonstaticClass(GestureEvent, null, Event.prototype);



	function EventCollection(){};
	EventCollection = new StaticClass(EventCollection, "BAO.API.DOM.EventCollection");

	EventCollection.properties({
		GestureEvent : new GestureEvent.constructor("xx", "pageY")
	});

	return EventCollection;
}(
	jQun.Event,
	Bao.API.Manager.Timer,
	// windowEl
	jQun(window)
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

DOM.members(this);
}.call(
	{},
	Bao.API.DOM,
	jQun.NonstaticClass,
	jQun.StaticClass
));
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
(function(Drag, NonstaticClass, Timer){
this.Scroll = (function(html, getTop, setTop, onborder){
	function Scroll(){
		var scroll = this,
			
			scrollTimer = new Timer(), touchTimer = new Timer();

		html.create().appendTo(document.body);

		this.sourceEl.attach({
			touchstart : function(e){
				//	记录pageY
				scroll.pageY = e.touches[0].pageY;

				var scrollEl = jQun(e.target).between(".scrollPanel");

				// 如果没有需要滚动条的元素就return
				if(scrollEl.length === 0)
					return;

				scroll.scrollEl = scrollEl;
				scroll.top = getTop(scrollEl);

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
				setTop(scroll.scrollEl, scroll.top + e.touches[0].pageY - scroll.pageY);
			},
			touchend : function(e){
				var scrollEl = scroll.scrollEl;
				
				if(!scrollEl)
					return;

				onborder(scrollEl, getTop(scrollEl), function(t){
					setTop(scrollEl, t);
				});

				this.scrollEl = undefined;

				// 停止计时器
				touchTimer.stop(function(){
					var y = e.touches[0].pageY - scroll.pageY,

						precent = Math.abs((y / scrollEl.parent().height()).toFixed(2));

					if(precent < 0.4)
						return;

					var top = getTop(scrollEl),

						speed = 100, i = precent > 0.75 ? 0 : 3,

						n = y > 0 ? 1 : -1;

					scrollTimer.start(75, function(){
						var isEnd = false;

						top = top + speed * n;
						speed = speed - i;

						// 如果速度变为0，表明是要停止滚动
						if(speed <= 0){
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
	Scroll = new NonstaticClass(Scroll, "jQun.Scroll", {
		// touchstart时，记录的pageY值
		pageY : 0,
		// 当前需要滚动的元素
		scrollEl : undefined,
		// 监听滚动的事件元素
		sourceEl : jQun(window),
		// touchstart时，记录的top值
		top : 0
	});

	return Scroll.constructor;
}(
	// html
	new jQun.HTML([
		'<aside class="scroll">',
			'<button></button>',
		'</aside>'
	].join("")),
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

Drag.members(this);
}.call(
	{},
	Bao.UI.Control.Drag,
	jQun.NonstaticClass,
	Bao.API.Manager.Timer
));
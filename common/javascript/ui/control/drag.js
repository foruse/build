(function(Drag, NonstaticClass, Timer){
this.Scroll = (function(html, getTop, setTop, onborder){
	function Scroll(){
		var scroll = this,
			
			scrollTimer = new Timer(), touchTimer = new Timer(),

			scrollEl = html.create();

		this.assign({
			scrollEl : scrollEl
		});

		scrollEl.appendTo(document.body);

		this.sourceEl.attach({
			touchstart : function(e){
				//	记录pageY
				scroll.pageY = e.touches[0].pageY;

				var overflowEl = jQun(e.target).between(".overflowPanel");

				// 如果没有需要滚动条的元素就return
				if(overflowEl.length === 0)
					return;

				scroll.overflowEl = overflowEl;
				scroll.top = getTop(overflowEl);

				// 将滚动元素设为relative，便于使用top，而不打乱其他布局，比marginTop好
				overflowEl.set("position", "relative", "css");
				scroll.show(overflowEl);
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
				setTop(scroll.overflowEl, scroll.top + e.touches[0].pageY - scroll.pageY);
			},
			touchend : function(e){
				var overflowEl = scroll.overflowEl;
				
				if(!overflowEl)
					return;

				onborder(overflowEl, getTop(overflowEl), function(t){
					setTop(overflowEl, t);
				});

				this.overflowEl = undefined;

				// 停止计时器
				touchTimer.stop(function(){
					var y = e.touches[0].pageY - scroll.pageY,

						precent = Math.abs((y / overflowEl.parent().height()).toFixed(2));

					if(precent < 0.4)
						return;

					var top = getTop(overflowEl),

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
						onborder(overflowEl, top, function(t){
							top = t;
							isEnd = true;
						})
	
						setTop(overflowEl, top);
						scrollTimer.stop();					

						// 滚动结束
						if(isEnd){
							scroll.hide();
							return;
						}

						scrollTimer.start(75, arguments.callee);
					});
				});
			}
		});
	};
	Scroll = new NonstaticClass(Scroll, "jQun.Scroll");

	Scroll.properties({
		hide : function(){
			this.scrollEl.classList.remove("show");
		},
		// 溢出的元素（其父容器就应该需要滚动条）
		overflowEl : undefined,
		// touchstart时，记录的pageY值
		pageY : 0,
		scrollEl : undefined,
		show : function(overflowEl){
			var scrollEl = this.scrollEl, overflowEl = this.overflowEl,

				style = scrollEl.style, rect = overflowEl.parent()[0].getBoundingClientRect();
				
			jQun.forEach(rect, function(value, name){
				if(name === "width")
					return;

				if(name === "left"){
					value += rect.width - 10;
				}

				style[name] = value + "px";
			});

			var a = rect.height * 100 / overflowEl.height();

			scrollEl.find(">button").height((rect.height * 100 / overflowEl.height()) + "%");
			scrollEl.classList.add("show");
		},
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
	function(overflowEl){
		return overflowEl.get("top", "css").split("px").join("") - 0 || 0;
	},
	// setTop
	function(overflowEl, top){
		overflowEl.set("top", Math.round(top) + "px", "css");
	},
	// onborder
	function(overflowEl, top, fn){
		// 如果是最上方的时候
		if(top > 0){
			fn(0, "top");
			return;
		}
		
		var t = (overflowEl.height() - overflowEl.parent().height()) * -1;

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
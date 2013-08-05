(function(Drag, NonstaticClass, HTMLElementList, Timer){
this.Scroll = (function(html, getTop, setTop, onborder){
	function Scroll(){
		var scroll = this,
			
			scrollTimer = new Timer(70), touchTimer = new Timer(250);

		this.combine(html.create()).appendTo(document.body);

		this.sourceEl.attach({
			touchstart : function(e){
				var overflowEl = jQun(e.target).between(".overflowPanel");

				//	记录pageY
				scroll.pageY = e.touches[0].pageY;

				overflowEl.splice(1);

				// 如果没有需要滚动条的元素就return
				if(overflowEl.length === 0){
					scroll.overflowEl = undefined;
					return;
				}

				scroll.overflowEl = overflowEl;
				scroll.top = getTop(overflowEl);

				// 将滚动元素设为relative，便于使用top，而不打乱其他布局，比marginTop好
				overflowEl.set("position", "relative", "css");
				scroll.show(overflowEl);
				// 停止滚动计时器
				scrollTimer.stop();
				// 启动计时器
				touchTimer.start();
			},
			touchmove : function(e){
				// 如果计时器是未启动的，就return
				if(!touchTimer.isEnabled)
					return;

				// 如果还在等待上一个touchmove的操作，以避免太过频繁执行事件，那么return
				if(scrollTimer.isEnabled)
					return;

				// 设置top
				setTop(scroll.overflowEl, scroll.top + e.touches[0].pageY - scroll.pageY);
				scrollTimer.start(function(){
					scrollTimer.stop();
				});
			},
			touchend : function(e){
				var overflowEl = scroll.overflowEl;
				
				if(!overflowEl)
					return;

				scrollTimer.stop();

				// 超出边界所执行的函数
				onborder(overflowEl, getTop(overflowEl), function(t){
					setTop(overflowEl, t);
					scrollTimer.stop();
					touchTimer.stop();
				});

				this.overflowEl = undefined;

				// 停止计时器
				touchTimer.stop(function(){
					var y = e.touches[0].pageY - scroll.pageY,

						precent = Math.abs((y / overflowEl.parent().height()).toFixed(2));

					if(precent < 0.4)
						return;

					var top = getTop(overflowEl),

						speed = 50, i = precent > 0.75 ? 0 : 1.5,

						n = y > 0 ? 1 : -1;
					
					scrollTimer.start(function(){
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
						});
	
						setTop(overflowEl, top);
						scrollTimer.stop();	

						// 滚动结束
						if(isEnd){
							scroll.hide();
							return;
						}

						scrollTimer.start(arguments.callee);
					});
				});
			}
		});
	};
	Scroll = new NonstaticClass(Scroll, "jQun.Scroll", HTMLElementList.prototype);

	Scroll.properties({
		// 溢出的元素（其父容器就应该需要滚动条）
		overflowEl : undefined,
		// touchstart时，记录的pageY值
		pageY : 0,
		// 监听滚动的事件元素
		sourceEl : jQun(window),
		// touchstart时，记录的top值
		top : 0
	});

	Scroll.override({
		show : function(overflowEl){
			var overflowEl = this.overflowEl,

				style = this.style, rect = overflowEl.parent()[0].getBoundingClientRect();
				
			jQun.forEach(rect, function(value, name){
				if(name === "width")
					return;

				if(name === "left"){
					value += rect.width - 5;
				}

				style[name] = value + "px";
			});

			this.find(">button").height((rect.height * 100 / overflowEl.height()) + "%");
			this.getParentClass().show.call(this);
		}
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
		var type = "",
			t = (overflowEl.height() - overflowEl.parent().height()) * -1;
		
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
		
		this.source.direction = type;
		this.trigger(overflowEl[0]);
		fn(top, type);
	}.bind(new jQun.Event("overflow", "*"))
));

Drag.members(this);
}.call(
	{},
	Bao.UI.Control.Drag,
	jQun.NonstaticClass,
	jQun.HTMLElementList,
	Bao.API.Manager.Timer
));
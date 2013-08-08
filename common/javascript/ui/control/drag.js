(function(Drag, NonstaticClass, HTMLElementList, HTML, Timer, IntervalTimer){
this.Scroll = (function(html, getTop, setTop, onborder){
	function Scroll(){
		///	<summary>
		///	滚动条。
		///	</summary>
		var scroll = this,
			
			scrollTimer = new IntervalTimer(70), touchTimer = new Timer(250);

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

						// 滚动结束
						if(!isEnd)
							return;

						scroll.hide();
						scrollTimer.stop();
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
			///	<summary>
			///	显示滚动条。
			///	</summary>
			/// <params name="overflowEl" type="jQun.HTMLElementList">溢出的元素</params>
			var style = this.style, rect = overflowEl.parent()[0].getBoundingClientRect();
				
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
	new HTML([
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

this.Navigator = (function(panelHtml, tabItemsHtml){
	function Navigator(){
		///	<summary>
		///	导航。
		///	</summary>
		var navigator = this;

		this.combine(panelHtml.create());

		this.assign({
			contentEl : this.find(">nav"),
			tabEl : this.find(">aside>ol"),
			timer : new IntervalTimer(70)
		});

		this.attach({
			click : function(e){
				var buttonEls = navigator.buttonEls;

				if(!buttonEls)
					return;

				var target = e.target;

				if(!buttonEls.contains(target))
					return;

				navigator.focusTab(jQun(target).get("idx", "attr"));
			}
		});
	};
	Navigator = new NonstaticClass(Navigator, "Bao.UI.Control.Drag.Navigator", HTMLElementList.prototype);

	Navigator.properties({
		buttonEls : undefined,
		content : function(htmlStr){
			///	<summary>
			///	设置导航的主体内容。
			///	</summary>
			/// <params name="htmlStr" type="string">主体内容html字符串</params>
			this.find(">nav").innerHTML = htmlStr;
		},
		contentEl : undefined,
		focusTab : function(idx){
			///	<summary>
			///	切换tab。
			///	</summary>
			/// <params name="idx" type="number">tab的索引</params>
			var tabEl = this.tabEl, focusEl = tabEl.find('button[idx="' + idx + '"]');

			if(focusEl.length === 0)
				return;

			var classList = focusEl.classList;

			if(classList.contains("focused"))
				return;

			var timer = this.timer, contentEl = this.contentEl,
				
				times = 20, round = Math.round,
				
				left = (contentEl.get("left", "css").split("px").join("") - 0) || 0,

				w = (contentEl.width() * idx * -1 - left) / times;

			if(timer.isEnabled){
				timer.stop();
			}
			
			timer.start(function(i){
				contentEl.set("left", round(left + w * i) + "px", "css");
			}, times);

			tabEl.find('button.focused').classList.remove("focused");
			classList.add("focused");
		},
		tab : function(len){
			///	<summary>
			///	设置选项卡。
			///	</summary>
			/// <params name="len" type="number">选项卡的个数</params>
			var tabItemsEl = tabItemsHtml.create({ length : len });

			this.buttonEls = tabItemsEl.find(">button");
			tabItemsEl.appendTo(this.tabEl[0]);
		},
		tabEl : undefined,
		timer : undefined
	});

	return Navigator.constructor;
}(
	// panelHtml
	new HTML([
		'<div class="navigator">',
			'<nav></nav>',
			'<aside>',
				'<ol class="inlineBlock"></ol>',
			'</aside>',
		'</div>'
	].join("")),
	// tabItemsHtml
	new HTML([
		'@for(length ->> idx){',
			 '<li>',
				'<button idx="{idx}"></button>',
			 '</li>',
		'}'
	].join(""))
));

Drag.members(this);
}.call(
	{},
	Bao.UI.Control.Drag,
	jQun.NonstaticClass,
	jQun.HTMLElementList,
	jQun.HTML,
	Bao.API.Manager.Timer,
	Bao.API.Manager.IntervalTimer
));
(function(Drag, NonstaticClass, HTMLElementList, HTML, Timer, IntervalTimer){
this.Scroll = (function(html){
	function Scroll(){
		///	<summary>
		///	滚动条。
		///	</summary>
		var scroll = this, timer = new IntervalTimer(70);

		this.combine(html.create()).appendTo(document.body);
	};
	Scroll = new NonstaticClass(Scroll, "jQun.Scroll", HTMLElementList.prototype);

	Scroll.override({
		show : function(overflowEl){
			///	<summary>
			///	显示滚动条。
			///	</summary>
			/// <param name="overflowEl" type="jQun.HTMLElementList">溢出的元素</param>
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
	].join(""))
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
			/// <param name="htmlStr" type="string">主体内容html字符串</param>
			this.find(">nav").innerHTML = htmlStr;
		},
		contentEl : undefined,
		focusTab : function(idx){
			///	<summary>
			///	切换tab。
			///	</summary>
			/// <param name="idx" type="number">tab的索引</param>
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
			/// <param name="len" type="number">选项卡的个数</param>
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
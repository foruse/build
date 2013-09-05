﻿(function(Drag, NonstaticClass, Panel, HTML, Timer, IntervalTimer){
this.Scroll = (function(html){
	function Scroll(){
		///	<summary>
		///	滚动条。
		///	</summary>
		var scroll = this, timer = new IntervalTimer(70);

		this.combine(html.create()).appendTo(document.body);

		this.assign({
			buttonStyle : this.find(">button").style
		});
	};
	Scroll = new NonstaticClass(Scroll, "jQun.Scroll", Panel.prototype);

	Scroll.override({
		show : function(overflowPanel){
			///	<summary>
			///	显示滚动条。
			///	</summary>
			/// <param name="overflowPanel" type="Bao.API.DOM.Panel">溢出的元素</param>
			this.reposition(overflowPanel);
			Panel.prototype.show.call(this);
		}
	});

	Scroll.properties({
		buttonStyle : undefined,
		reposition : function(overflowPanel){
			var buttonStyle = this.buttonStyle,
			
				rect = overflowPanel.parent()[0].getBoundingClientRect(),

				height = overflowPanel.height();
				
			jQun.forEach(rect, function(value, name){
				if(name === "width")
					return;

				if(name === "left"){
					value += rect.width - 5;
				}

				if(name === "top"){
					value = value + 5;
				}
					
				this[name] = value + "px";
			}, this.style);

			buttonStyle.height = (rect.height * 100 / height) + "%";
			buttonStyle.top = (overflowPanel.get("top", "css").toString().split("px").join("") - 0 || 0) / height * -100 + "%";
		}
	});

	return Scroll.constructor;
}(
	// html
	new HTML([
		'<aside class="scroll normalRadius">',
			'<button class="normalRadius"></button>',
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
	Navigator = new NonstaticClass(Navigator, "Bao.UI.Control.Drag.Navigator", Panel.prototype);

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
			var tabEl = this.tabEl;
			
			tabEl.innerHTML = tabItemsHtml.render({ length : len });
			this.buttonEls = tabEl.find("button");
		},
		tabEl : undefined,
		timer : undefined
	});

	return Navigator.constructor;
}(
	// panelHtml
	new HTML([
		'<div class="navigator onlyBorderBottom lightBdColor">',
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
				'<button class="normalRadius" idx="{idx}"></button>',
			 '</li>',
		'}'
	].join(""))
));

Drag.members(this);
}.call(
	{},
	Bao.UI.Control.Drag,
	jQun.NonstaticClass,
	Bao.API.DOM.Panel,
	jQun.HTML,
	Bao.API.Management.Timer,
	Bao.API.Management.IntervalTimer
));
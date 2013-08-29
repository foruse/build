(function(Fixed, NonstaticClass, Panel){
this.Mask = (function(){
	function Mask(selector){};
	Mask = new NonstaticClass(Mask, "Bao.UI.Fixed.Mask", Panel.prototype);

	Mask.override({
		fill : function(el){
			///	<summary>
			///	填充内容元素。
			///	</summary>
			///	<param name="el" type="element">内容元素。</param>
			var articleEl = this.find(">article");

			articleEl.innerHTML = "";
			articleEl.children.append(el);
		},
		fillHtml : function(html){
			///	<summary>
			///	填充内容html。
			///	</summary>
			///	<param name="html" type="string">内容html。</param>
			this.find(">article").innerHTML = html;
		},
		show : function(action){
			///	<summary>
			///	显示元素。
			///	</summary>
			///	<param name="action" type="string">遮罩的活动属性。</param>
			this.set("action", action || "none", "attr");

			return Panel.prototype.show.call(this);
		}
	});

	return Mask.constructor;
}());

this.TitleBar = (function(){
	function TitleBar(selector, history, toolsHtml){
		///	<summary>
		///	标题栏。
		///	</summary>
		///	<param name="selector" type="string">标题栏元素选择器。</param>
		///	<param name="history" type="Bao.API.Management.History">页面历史记录。</param>
		///	<param name="toolsHtml" type="jQun.HTML">工具html模板。</param>
		var titleBar = this;

		this.assign({
			backButtonEl : this.find(">nav>button"),
			titleEl : this.find(">p>strong"),
			toolsHtml : toolsHtml,
			toolsPanel : this.find(">ul")
		});

		this.attach({
			userclick : function(e){
				var targetEl = jQun(e.target);

				if(targetEl.between("button", this).length > 0){
					var backUrl = targetEl.get("backurl", "attr");

					if(backUrl === "javascript:void(0);")
						return;

					if(backUrl === "-1"){
						history.back();
						return;
					}

					history.go(backUrl);
				}
			}
		});

		jQun(window).attach({
			redirect : function(){
				titleBar.hide();
			},
			beforeshow : function(e){
				var panel = e.currentPanel;

				if(!panel.showTitleBar){
					titleBar.hide();
					return;
				}

				titleBar.show();

				if(panel.title){
					titleBar.resetTitle(panel.title);
				}

				titleBar.resetTools(panel.tools || []);
			}
		}, true);
	};
	TitleBar = new NonstaticClass(TitleBar, "Bao.UI.Fixed.TitleBar", Panel.prototype);

	TitleBar.properties({
		resetTitle : function(title){
			///	<summary>
			///	重新标题。
			///	</summary>
			///	<param name="title" type="string">标题。</param>
			this.titleEl.innerHTML = title;
		},
		resetTools : function(tools){
			///	<summary>
			///	重新设置工具栏。
			///	</summary>
			///	<param name="tools" type="array">工具栏数据。</param>
			this.find(">ul").innerHTML = this.toolsHtml.render({ tools : tools });
		},
		toolsHtml : undefined
	});

	return TitleBar.constructor;
}());

Fixed.members(this);
}.call(
	{},
	Bao.UI.Fixed,
	jQun.NonstaticClass,
	Bao.API.DOM.Panel
));
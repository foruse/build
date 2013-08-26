(function(Fixed, NonstaticClass, Panel){
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

					history.go(backUrl);
				}
			}
		});

		jQun(window).attach({
			redirect : function(){
				titleBar.hide();
			},
			showpanel : function(e){
				var panel = e.currentPanel;

				if(!panel.showTitleBar){
					titleBar.hide();
					return;
				}

				titleBar.show();

				if(panel.title){
					titleBar.resetTitle(panel.title);
				}

				if(panel.backUrl){
					titleBar.resetBackUrl(panel.backUrl);
				}

				titleBar.resetTools(panel.tools || []);
			}
		}, true);
	};
	TitleBar = new NonstaticClass(TitleBar, "Bao.UI.Fixed.TitleBar", Panel.prototype);

	TitleBar.properties({
		backButtonEl : undefined,
		resetBackUrl : function(backUrl){
			///	<summary>
			///	重新回退链接。
			///	</summary>
			///	<param name="backUrl" type="string">链接。</param>
			this.backButtonEl.set("backurl", backUrl, "attr");
		},
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
	/*
	TitleBar.override({
		show : function(title, tools, hideBackButton, _redirect){
			///	<summary>
			///	显示标题栏。
			///	</summary>
			///	<param name="title" type="string">标题。</param>
			///	<param name="tools" type="array">工具栏数据。</param>
			///	<param name="hideBackButton" type="boolean">是否隐藏回退按钮。</param>
			///	<param name="_redirect" type="string">重定向页面名称。</param>
			this.resetTitle(title);
			this.resetTools(tools);
			this.backButtonEl[hideBackButton ? "hide" : "show"]();

			if(!hideBackButton){
				this.resetRedirect(_redirect);
			}

			return Panel.prototype.show.call(this);
		}
	});
	*/
	return TitleBar.constructor;
}());

Fixed.members(this);
}.call(
	{},
	Bao.UI.Fixed,
	jQun.NonstaticClass,
	Bao.API.DOM.Panel
));
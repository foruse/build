(function(Share, NonstaticClass, StaticClass, Panel){
this.TitleBar = (function(){
	function TitleBar(selector, toolsHtml){
		///	<summary>
		///	标题栏。
		///	</summary>
		///	<param name="selector" type="string">标题栏元素选择器。</param>
		///	<param name="toolsHtml" type="jQun.HTML">工具html模板。</param>
		var titleBar = this;

		this.assign({
			backButtonEl : this.find(">nav>button"),
			toolsHtml : toolsHtml,
			toolsPanel : this.find(">ul")
		});

		this.find(">nav>button").onuserclick = function(){
			Share.Global.history.go(titleBar.redirect);
		};

		window.onredirect = function(){
			titleBar.hide();
		};
	};
	TitleBar = new NonstaticClass(TitleBar, "Bao.Page.Index.Share", Panel.prototype);

	TitleBar.properties({
		backButtonEl : undefined,
		resetTools : function(tools){
			///	<summary>
			///	重新设置工具栏。
			///	</summary>
			///	<param name="tools" type="array">工具栏数据。</param>
			this.find(">ul").innerHTML = this.toolsHtml.render({ tools : tools });
		},
		toolsHtml : undefined
	});

	TitleBar.override({
		show : function(tools, hideBackButton){
			///	<summary>
			///	显示标题栏。
			///	</summary>
			///	<param name="tools" type="array">工具栏数据。</param>
			///	<param name="hideBackButton" type="boolean">是否隐藏回退按钮。</param>
			this.resetTools(tools);
			this.backButtonEl[hideBackButton ? "hide" : "show"]();

			return Panel.prototype.show.call(this);
		}
	});

	return TitleBar.constructor;
}());

this.Global = (function(TitleBar, History, Scroll, HTML){
	function Global(){
		///	<summary>
		///	全局类，用于存储页面中的一些全局属性。
		///	</summary>
		var Global = this;

		window.onload = function(){
			//jQun("body").set("zoom", window.screen.width / 640, "css");

			Global.assign({
				// 初始化历史记录
				history : new History(),
				// 初始化标题栏
				titleBar : new TitleBar(
					"#titleBar",
					new HTML("title_tools_html", true)
				)
			});

			// 初始化滚动条
			new Scroll();

			Global.history.go("project");
			// Global.history.go("spp").tab.focus("project"),
		};
	};
	Global = new StaticClass(Global, "Bao.Page.Index.Global", {
		history : undefined,
		titleBar : undefined
	});

	return Global;
}(
	this.TitleBar,
	Bao.API.Management.History,
	Bao.UI.Control.Drag.Scroll,
	jQun.HTML
));

Share.members(this);
}.call(
	{},
	Bao.Page.Index.Share,
	jQun.NonstaticClass,
	jQun.StaticClass,
	Bao.API.DOM.Panel
));
(function(Share, NonstaticClass, StaticClass, Panel){
this.TitleBar = (function(){
	function TitleBar(selector, toolsHtml){
		var titleBar = this;

		this.assign({
			backButtonEl : this.find(">nav>button"),
			toolsHtml : toolsHtml,
			toolsPanel : this.find(">ul")
		});

		this.find(">nav>button").onuserclick = function(){
			history.go(titleBar.redirect);
		};
	};
	TitleBar = new NonstaticClass(TitleBar, "Bao.Page.Index.Share", Panel.prototype);

	TitleBar.properties({
		resetTools : function(tools){
			this.find(">ul").innerHTML = this.toolsHtml.render({ tools : tools });
		},
		redirect : "project",
		setRedirect : function(redirect){
			this.redirect = redirect;
		},
		toolsHtml : undefined
	});

	return TitleBar.constructor;
}(
	
));

this.Global = (function(TitleBar, History, Scroll, HTML){
	function Global(){
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

			Global.history.go("spp").tab.focus("project");
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
	Bao.API.Manager.History,
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
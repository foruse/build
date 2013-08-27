(function(Index, StaticClass){
this.Global = (function(Mask, TitleBar, History, Scroll, HTML){
	function Global(){
		///	<summary>
		///	全局类，用于存储页面中的一些全局属性。
		///	</summary>
		var Global = this;

		window.onload = function(){
			//jQun("body").set("zoom", window.screen.width / 640, "css");
			
			// 初始化历史记录
			var history = new History();

			Global.assign({
				history :　history,
				mask : new Mask("#mask"),
				// 初始化标题栏
				titleBar : new TitleBar(
					"#titleBar",
					history,
					new HTML("title_tools_html", true)
				)
			});

			// 初始化滚动条
			new Scroll();
			// 跳转到指定页
			history.go("addProject");
		};
	};
	Global = new StaticClass(Global, "Bao.Page.Index.Global", {
		history : undefined,
		titleBar : undefined
	});

	return Global;
}(
	Bao.UI.Fixed.Mask,
	Bao.UI.Fixed.TitleBar,
	Bao.API.Management.History,
	Bao.UI.Control.Drag.Scroll,
	jQun.HTML
));

Index.members(this);
}.call(
	{},
	Bao.Page.Index,
	jQun.StaticClass
));
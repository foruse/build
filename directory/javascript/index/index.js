(function(History){

window.onload = function(){
	//jQun("body").set("zoom", window.screen.width / 640, "css");

	// 初始化滚动条
	new Bao.UI.Control.Drag.Scroll();

	new History().go("spp").tab.focus("schedule");
};

}(
	Bao.API.Manager.History
));
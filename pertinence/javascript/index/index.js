(function(History){

window.onload = function(){
	// 初始化滚动条
	new Bao.UI.Control.Drag.Scroll();

	new History().go("spp");
};

}(
	Bao.API.Manager.History
));
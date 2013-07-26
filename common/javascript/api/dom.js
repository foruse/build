(function(DOM, NonstaticClass){
this.Panel = (function(){
	function Panel(panelEl){
		///	<summary>
		///	基本的容器类，所有容器都基于此类。
		///	</summary>
		///	<param name="panelEl" type="jQun.HTMLElementList">对其添加或修改属性的对象。</param>
		this.assign({
			panelEl : panelEl
		});
	};
	Panel = new NonstaticClass(Panel, "Bao.API.DOM.Panel");

	Panel.properties({
		hide : function(){
			///	<summary>
			///	隐藏该容器。
			///	</summary>
			this.panelEl.hide();
		},
		panelEl : undefined,
		show : function(){
			///	<summary>
			///	显示该容器。
			///	</summary>
			this.panelEl.show();
		}
	});

	return Panel.constructor;
}());

DOM.members(this);
}.call(
	{},
	Bao.API.DOM,
	jQun.NonstaticClass
));
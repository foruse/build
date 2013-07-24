(function(DOM, NonstaticClass){
this.Panel = (function(){
	function Panel(panelEl, _isHide){
		///	<summary>
		///	基本的容器类，所有容器都基于此类。
		///	</summary>
		///	<param name="panelEl" type="jQun.HTMLElementList">对其添加或修改属性的对象。</param>
		this.assign({
			panelEl : panelEl
		});

		if(_isHide)
			return;

		this.show();
	};
	Panel = new NonstaticClass(Panel, "Bao.API.DOM.Panel");

	Panel.properties({
		hide : function(){
			///	<summary>
			///	隐藏该容器。
			///	</summary>
			this.panelEl.hidden = true;
		},
		panelEl : undefined,
		show : function(){
			///	<summary>
			///	显示该容器。
			///	</summary>
			this.panelEl.hidden = false;
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
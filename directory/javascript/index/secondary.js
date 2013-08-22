(function(Secondary, NonstaticClass, Panel){
var SecondaryPanel;

this.SecondaryPanel = (function(){
	function SecondaryPanel(selector){};
	SecondaryPanel = new NonstaticClass(SecondaryPanel, "Bao.Page.Index.Secondary.SecondaryPanel", Panel.prototype);

	SecondaryPanel.override({
		hide : function(){
			this.parent().hide();
			
			return Panel.prototype.hide.apply(this, arguments);
		},
		show : function(){
			this.parent().show();
			
			return Panel.prototype.show.apply(this, arguments);
		}
	});

	return SecondaryPanel.constructor;
}());

SecondaryPanel = this.SecondaryPanel;

this.AddProject = (function(){
	function AddProject(selector){
	
	};
	AddProject = new NonstaticClass(AddProject, "Bao.Page.Index.Secondary.AddProject", SecondaryPanel.prototype);

	AddProject.properties({
	
	});

	return AddProject.constructor;
}());

Secondary.members(this);
}.call(
	{},
	Bao.Page.Index.Secondary,
	jQun.NonstaticClass,
	Bao.API.DOM.Panel
));
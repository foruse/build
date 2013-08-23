(function(Secondary, NonstaticClass, ChildPanel){
this.AddProject = (function(){
	function AddProject(selector){
	
	};
	AddProject = new NonstaticClass(AddProject, "Bao.Page.Index.Secondary.AddProject", ChildPanel.prototype);

	AddProject.properties({
	
	});

	return AddProject.constructor;
}());

Secondary.members(this);
}.call(
	{},
	Bao.Page.Index.Secondary,
	jQun.NonstaticClass,
	Bao.API.DOM.ChildPanel
));
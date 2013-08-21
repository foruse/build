(function(Secondary, NonstaticClass, Panel){
this.AddProject = (function(){
	function AddProject(){
	
	};
	AddProject = new NonstaticClass(AddProject, "Bao.Page.Index.Secondary.AddProject", Panel.prototype);

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
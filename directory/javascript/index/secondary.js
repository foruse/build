(function(Secondary, NonstaticClass, PagePanel){
this.AddProject = (function(){
	function AddProject(selector, colorHtml){
		this.find('section[desc="color"] dd').innerHTML = colorHtml.render();
	};
	AddProject = new NonstaticClass(AddProject, "Bao.Page.Index.Secondary.AddProject", PagePanel.prototype);

	AddProject.override({
		backUrl : "project",
		title : "添加项目"
	});

	AddProject.properties({
	
	});

	return AddProject.constructor;
}());

Secondary.members(this);
}.call(
	{},
	Bao.Page.Index.Secondary,
	jQun.NonstaticClass,
	Bao.API.DOM.PagePanel
));
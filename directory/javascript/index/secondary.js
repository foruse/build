(function(Secondary, NonstaticClass, PagePanel){
this.AddProject = (function(){
	function AddProject(selector, colorHtml){
		var addProject = this;

		this.find('section[desc="color"] dd').innerHTML = colorHtml.render();

		this.initHtml = this.innerHTML;
		
		this.attach({
			userclick : function(e){
				var targetEl = jQun(e.target);

				if(targetEl.between('>section[desc="color"] button', this).length > 0){
					addProject.find('>section[desc="color"] button').classList.remove("selected");
					targetEl.classList.add("selected");
				}
			}
		});
	};
	AddProject = new NonstaticClass(AddProject, "Bao.Page.Index.Secondary.AddProject", PagePanel.prototype);

	AddProject.override({
		backUrl : "project",
		title : "添加项目",
		tools : [{ backUrl : "javascript:void(0);", action : "submit" }],
		show : function(){
			this.innerHTML = this.initHtml;
			this.parentClass().show.call(this);
		}
	});

	AddProject.properties({
		initHtml : ""
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
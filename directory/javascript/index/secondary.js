(function(Secondary, NonstaticClass, PagePanel){
this.AddProject = (function(Global, UserSelectionList){
	function AddProject(selector, colorHtml){
		var addProject = this;

		this.assign({
			colorHtml : colorHtml,
			userSelectionList : new UserSelectionList("添加项目拍档", Global.mask)
		});

		this.attach({
			userclick : function(e){
				var targetEl = jQun(e.target);

				if(targetEl.between('>section[desc="color"] button', this).length > 0){
					addProject.find('>section[desc="color"] button').classList.remove("selected");
					targetEl.classList.add("selected");
				}
			}
		});

		this.userSelectionList.appendTo(this.find(">header")[0]);
	};
	AddProject = new NonstaticClass(AddProject, "Bao.Page.Index.Secondary.AddProject", PagePanel.prototype);

	AddProject.override({
		backUrl : "project",
		restore : function(){
			// 还原标题
			this.find(">section input").value = "";
			// 还原颜色
			this.find('>section[desc="color"] dd').innerHTML = this.colorHtml.render();
			this.find(">footer textarea").value = "";
		},
		title : "添加项目",
		isNoTraces : true,
		tools : [{ backUrl : "javascript:void(0);", action : "submit" }]
	});

	AddProject.properties({
		colorHtml : undefined,
		userSelectionList : undefined
	});

	return AddProject.constructor;
}(
	Bao.Page.Index.Global,
	Bao.UI.Control.List.UserSelectionList
));

Secondary.members(this);
}.call(
	{},
	Bao.Page.Index.Secondary,
	jQun.NonstaticClass,
	Bao.API.DOM.PagePanel
));
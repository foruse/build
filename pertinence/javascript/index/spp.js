﻿(function(Index, NonstaticClass, HTML){
this.Project = (function(html){
	function Project(panelEl, oncallServer){
		this.assign({
			panelEl : panelEl
		});

		oncallServer(this);

		panelEl["ontouchstart"] = function(){
				alert(1);
				panelEl.detach({
					touchstart : arguments.callee
				});
			};

		return;
		panelEl.attach({
			"touchstart" : function(){
				alert(1);
				panelEl.detach({
					touchstart : arguments.callee
				});
			}
		});
	};
	Project = new NonstaticClass(Project, "Bao.Page.Index.SPP.Project");

	Project.properties({
		add : function(data){
			this.panelEl.find(">ul").innerHTML = html.render({
				projects : data
			});
		},
		panelEl : undefined
	});
	return Project.constructor;
}(
	// html
	new HTML(jQun("#project_html").innerHTML)
));

Index.members(this);
}.call(
	{},
	Bao.Page.Index.SPP,
	jQun.NonstaticClass,
	jQun.HTML
));
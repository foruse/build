(function(Index, NonstaticClass){
this.Project = (function(){
	function Project(){
		console.log(1);
	};
	Project = new NonstaticClass(Project, "Bao.Page.Index.SPP.Project");


	return Project.constructor;
}());

Index.members(this);
}.call(
	{},
	Bao.Page.Index.SPP,
	jQun.NonstaticClass
));
(function(Index, StaticClass){
this.Manager = (function(){
	function Manager(){};
	Manager = new NonstaticClass(null, "Bao.Page.Index.Manager");

	Manager.properties({
		
	});

	return Manager.constructor;
}());

Index.members(this);
}.call(
	{},
	Bao.Page.Index,
	jQun.StaticClass
));

(function(Index){

window.onload = function(){
	new Index.SPP.Project();
};

}(
	Bao.Page.Index
));
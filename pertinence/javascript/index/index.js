(function(Index, NonstaticClass, StaticClass, CallServer){
this.History = (function(List){
	function Loader(){};
	Loader = new StaticClass(null, "Loader");

	Loader.properties({
		project : function(){
			return new Index.SPP.Project(
				jQun("#project"),
				function(project){
					CallServer.open("getProjects", null, function(data){
						project.add(data);
					});
				}
			);
		}
	});

	function History(){};
	History = new NonstaticClass(History, "Bao.Page.Index.History", List.prototype);

	History.properties({
		Loader : Loader,
		back : function(){
			///	<summary>
			///	回到上一个记录。
			///	</summary>
			this.go(this.getNameByIndex(this.idx - 1));
		},
		forward : function(){
			///	<summary>
			///	跳到下一个记录。
			///	</summary>
			this.go(this.getNameByIndex(this.idx + 1));
		},
		getNameByIndex : function(idx){
			///	<summary>
			///	通过索引获取相对应历史记录名称。
			///	</summary>
			///	<param name="idx" type="number">对其添加或修改属性的对象。</param>
			return idx < this.length ? this[idx].name : undefined;
		},
		go : function(name){
			///	<summary>
			///	跳转到指定名称的页面。
			///	</summary>
			///	<param name="name" type="string">需要跳转的页面名称。</param>
			if(!name){
				name = this.homePage;
			}

			var idx = this.indexOf(name), lastIdx = this.length - 1;
			
			// 如果是当前页，或者记录条数为0
			if(lastIdx > -1){
				if(idx === lastIdx){
					return;
				}
				else {
					// 隐藏上一个panel
					this[lastIdx].hide();
				}
			}

			var panel = this[idx];

			if(idx > -1){
				// 显示当前的panel
				panel.show();
				this.splice(idx, 1);
			}
			else {
				// 加载、初始化新panel信息
				panel = this.Loader[name]();
			}

			this.push({
				name : name,
				panel : panel
			});

			// 记录当前索引
			this.idx = lastIdx + 1;
		},
		homePage : "project",
		indexOf : function(name){
			///	<summary>
			///	检索历史记录中是否有指定名称的页面。
			///	</summary>
			/// <param name="name" type="string">检索的页面名称</param>
			for(var i = 0, j = this.length;i < j;i++){
				if(this[i].name === name){
					return i;
				}
			}

			return -1;
		},
		idx : -1
	});

	return History.constructor;
}(
	jQun.List
));

Index.members(this);
}.call(
	{},
	Bao.Page.Index,
	jQun.NonstaticClass,
	jQun.StaticClass,
	Bao.CallServer
));

(function(History){

window.onload = function(){
	new Bao.UI.Control.Drag.Scroll();

	new History().go("project");
};

}(
	Bao.Page.Index.History
));
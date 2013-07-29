(function(Manager, NonstaticClass, StaticClass){
this.History = (function(List, Index, CallServer){
	function Loader(){};
	Loader = new StaticClass(null, "Loader");

	Loader.properties({
		spp : function(){
			///	<summary>
			///	加载项目区域。
			///	</summary>
			return new Index.SPP(jQun("#SPP"));
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
				panel.show();
			}

			this.push({
				name : name,
				panel : panel
			});

			// 记录当前索引
			this.idx = lastIdx + 1;

			return panel;
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
	jQun.List,
	Bao.Page.Index,
	Bao.CallServer
));


this.Timer = (function(setTimeout, clearTimeout){
	function Timer(_timeout){
		///	<summary>
		///	计时器(时间管理器)。
		///	</summary>
		///	<param name="_timeout" type="number">超时时间。</param>
		this.assign({
			timeout : _timeout || 200
		});
	};
	Timer = new NonstaticClass(Timer, "Bao.API.Manager.Timer");

	Timer.properties({
		stop : function(_onbreak){
			///	<summary>
			///	停止计时器。
			///	</summary>
			///	<param name="_onbreak" type="function">如果未超时就被停止，那么会执行这个中断函数，否则不会执行。</param>
			var index = this.index;

			this.isEnabled = false;

			// 如果计时器已运行，说明已超时，则return
			if(index === -1)
				return;

			// 清除计时器
			clearTimeout(index);
			this.index = -1;

			if(typeof _onbreak === "function"){
				_onbreak();
			}
		},
		index : -1,
		isEnabled : false,
		timeout : 200,
		start : function(_ontimeout){
			///	<summary>
			///	开始计时器，该计时器需要人为手动停止。
			///	</summary>
			///	<param name="_timeout" type="number">超时时间，单位毫秒。</param>
			///	<param name="_ontimeout" type="function">超时所执行的函数。</param>

			// 如果已经开始，则return
			if(this.isEnabled)
				return;

			this.assign({
				index : -1,
				isEnabled : true
			});

			// 设置计时器
			this.index = setTimeout(function(){
				this.index = -1;

				if(!_ontimeout)
					return;

				_ontimeout();
			}.bind(this), this.timeout || 200);
		}
	});

	return Timer.constructor;
}(
	// setTimeout
	setTimeout,
	// clearTimeout
	clearTimeout
));

Manager.members(this);
}.call(
	{},
	Bao.API.Manager,
	jQun.NonstaticClass,
	jQun.StaticClass
));
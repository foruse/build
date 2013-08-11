(function(Index, NonstaticClass, Panel, OverflowPanel, Cache, CallServer, HTML, LoadingBar, BatchLoad){
this.SPP = (function(UserList, Navigator){
	function Title(panelEl){
	
	};
	Title = new NonstaticClass(Title, null, Panel.prototype);

	Title.properties({
		set : function(title){
			this.panelEl.find(">strong").innerHTML = title;
		}
	});


	function Schedule(panelEl, html){
		var schedule = this, batchLoad;
		
		batchLoad = new BatchLoad("getSchedules", function(data){
			console.log(data);
		});

		this.assign({
			html : html,
			batchLoad : batchLoad
		});

		this.call();
	};
	Schedule = new NonstaticClass(Schedule, null, Panel.prototype);

	Schedule.properties({
		add : function(data){
			this.panelEl.find("> header > dl").innerHTML = this.html.render(data);
		},
		batchLoad : undefined,
		call : function(){
			this.batchLoad.callServer();
		},
		html : undefined
	});


	function Project(panelEl, html){
		///	<summary>
		///	项目。
		///	</summary>
		/// <param name="panelEl" type="jQun.HTMLElementList">对应的元素</param>
		/// <param name="html" type="jQun.HTML">项目html模板</param>
		var project = this,

			loadingBar = new LoadingBar(panelEl),

			batchLoad = new BatchLoad("getProjects", function(data){
				loadingBar.hide();
				project.add(data);

				if(!this.isEqual("pageIndex", "pageMax"))
					return;
				
				project.addUnopenedProject(this.getParam("pageSize") - data.projects.length);
			});
		
		this.assign({
			html : html,
			loadingBar : loadingBar,
			batchLoad : batchLoad
		});

		batchLoad.setParam("pageIndex", 0, 1);
		batchLoad.setParam("pageSize", 10);
		batchLoad.setParam("pageMax", -1);

		panelEl.attach({
			"overflow" : function(e){
				if(e.direction !== "bottom")
					return;

				project.load();
			}
		});

		loadingBar.appendTo(panelEl[0]);
		this.load();
		window.aa = batchLoad;
	};
	Project = new NonstaticClass(Project, null, OverflowPanel.prototype);

	Project.properties({
		add : function(data){
			///	<summary>
			///	添加数据。
			///	</summary>
			/// <param name="data" type="array">项目数据</param>
			this.html.create(data).appendTo(this.panelEl.find(">ul")[0]);
		},
		addUnopenedProject : function(_len){
			///	<summary>
			///	添加未解锁的项目，1次为10个。
			///	</summary>
			var data = [], i = {
				id : -1,
				importantLevel : 0,
				title : "",
				users : [],
				lastMessage : "",
				unread : 0,
				status : -1
			};

			jQun.forEach(_len == undefined ? this.batchLoad.getParam("pageSize") : _len, function(){
				data.push(i);
			});

			this.add({ projects : data });
		},
		html : undefined,
		load : function(){
			///	<summary>
			///	去服务器取数据，并加载。
			///	</summary>
			var batchLoad = this.batchLoad;

			if(batchLoad.isEqual("pageIndex", "pageMax")){
				this.addUnopenedProject();
				return;
			}

			this.loadingBar.show();
			batchLoad.callServer();
		},
		loadingBar : undefined,
		batchLoad : undefined
	});


	function Partner(panelEl, groupingHtml){
		var partner = this, userList, groupPanel,

			panelStyle = panelEl.style,

			loadingBar = new LoadingBar(panelEl),

			navigator = new Navigator();


		// 初始化用户列表
		userList = new UserList(function(top){
			panelStyle.top = top + "px";
		});

		this.assign({
			cache : new Cache("partner"),
			loadingBar : loadingBar,
			userList : userList
		});

		// 添加loadingBar
		loadingBar.appendTo(panelEl[0]);		
		// 添加navigator
		navigator.appendTo(panelEl.find(">ul>li:first-child")[0]);

		// 监听事件
		panelEl.attach({
			click : function(e){
				var targetEl = jQun(e.target), el = targetEl.between(".groupingBar button", this);

				// 如果点击的是分组栏上的按钮
				if(el.length > 0){
					// 如果点击的是添加分组
					if(el.get("action", "attr") === "addGroup"){
						console.log(el);
						return;
					}
					
					// 否则点击的是分组按钮
					partner.focus(el.get("groupId", "attr"), el);
				}
			}
		});

		userList.appendTo(panelEl.find(">ul>li:last-child")[0]);
		loadingBar.show();

		// 获取分组数据
		CallServer.open("getPartnerGroups", null, function(data){
			var groups = data.groups, len = groups.length;
				
			// 添加分组区域
			navigator.content(groupingHtml.render(data));
			navigator.tab(Math.ceil(len / 3));
			navigator.focusTab(0);

			if(len === 0)
				return;

			partner.focus(groups[0].id);
		});
	};
	Partner = new NonstaticClass(Partner, null, OverflowPanel.prototype);

	Partner.properties({
		cache : undefined,
		focus : function(groupId, _groupEl){
			///	<summary>
			///	切换分组。
			///	</summary>
			/// <param name="groupId" type="number">分组的id</param>
			/// <param name="_groupEl" type="jQun.HTMLElementList">该分组元素</param>
			var partner = this, classList;

			// 如果分组元素不存在
			if(!_groupEl){
				_groupEl = this.panelEl.find('.group button[groupid="' + groupId + '"]');
			}

			classList = _groupEl.classList;
			
			// 如果聚焦的分组已经是当前分组
			if(classList.contains("focused")){
				return;	
			}

			// 聚焦当前分组
			this.panelEl.find('.groupingBar button.focused').classList.remove("focused");
			_groupEl.classList.add("focused");
			this.panelEl.set("top", 0, "css");

			// 已经加载完成了，表明有数据，那么应该取缓存
			if(_groupEl.get("complete", "attr") != null){
				partner.userList.render(this.cache.get(groupId));
				return;
			}

			var userList = this.userList, loadingBar = this.loadingBar;

			userList.hide();
			loadingBar.show();

			// 还没当前分组的数据，那么就去取数据，再进行加载
			CallServer.open("getPartners", { id : groupId }, function(data){
				loadingBar.hide();
				// 将数据存入缓存
				partner.cache.set(groupId, data);
				// 渲染数据
				userList.render(data);
				userList.show();
				_groupEl.set("complete", "", "attr");

				// 防止用户快速切换分组导致数据错误
				if(classList.contains("focused"))
					return;

				partner.focus(groupId, _groupEl);
			});
		},
		loadingBar : undefined,
		userList : undefined
	});


	function Tab(panelEl, itemHtml, onfocus, onblur){
		///	<summary>
		///	SPP脚部选项卡。
		///	</summary>
		/// <param name="panelEl" type="jQun.HTMLElementList">对应的元素</param>
		/// <param name="itemHtml" type="jQun.HTML">选项卡html模板</param>
		/// <param name="onfocus" type="function">选项卡聚焦事件</param>
		/// <param name="onblur" type="function">选项卡失去焦点事件</param>
		var btnEls, btnClassList, tab = this;

		panelEl.find("ul").innerHTML = itemHtml.render();

		this.assign({
			btnEls : panelEl.find("button"),
			onblur : onblur,
			onfocus : onfocus
		});

		panelEl.attach({
			click : function(e){
				var buttonEl = jQun(e.target).between("button", this);

				if(buttonEl.length === 0)
					return;

				if(buttonEl.classList.contains("focused"))
					return;

				tab.blur();
				tab.focus(buttonEl.get("tab", "attr"));
			}
		});
	};
	Tab = new NonstaticClass(Tab, null, Panel.prototype);

	Tab.properties({
		blur : function(){
			///	<summary>
			///	让选项卡失去焦点。
			///	</summary>
			var focusedEl = this.btnEls.between(".focused", this.panelEl[0]);

			if(focusedEl.length === 0)
				return;

			focusedEl.classList.remove("focused");
			this.onblur(focusedEl.get("tab", "attr"));
		},
		btnEls : undefined,
		focus : function(name){
			///	<summary>
			///	使指定名称的选项卡聚焦。
			///	</summary>
			/// <param name="name" type="string">选项卡名称</param>
			var buttonEl = this.btnEls.between('[tab="' + name + '"]', this.panelEl[0]);

			buttonEl.classList.add("focused");
			this.onfocus(name, buttonEl.find("span").get("text", "attr"));
		},
		onblur : undefined,
		onfocus : undefined
	});


	function SPP(panelEl){
		///	<summary>
		///	日程、项目、拍档页。
		///	</summary>
		/// <param name="panelEl" type="jQun.HTMLElementList">对应的元素</param>
		var spp = this, panelAttr = panelEl.attributes;

		this.assign({
			partner : new Partner.constructor(
				// panelEl
				panelEl.find("#partner"),
				// groupingHtml
				new HTML("spp_partnerGroups_html", true)
			),
			project : new Project.constructor(
				// panelEl
				panelEl.find("#project"),
				// html
				new HTML("spp_project_html", true)
			),
			schedule : new Schedule.constructor(
				// panelEl
				panelEl.find("#schedule"),
				// html
				new HTML("spp_schedule_html", true)
			),
			tab : new Tab.constructor(
				// panelEl
				panelEl.find("#tab_SPP"),
				// itemHtml
				new HTML("spp_item_html", true),
				// onfocus
				function(name, title){
					///	<summary>
					///	聚焦某个子panel。
					///	</summary>
					/// <param name="name" type="string">需要焦点的panel名称</param>
					var	childPanel = spp[name];

					spp.title.set(title);
					panelAttr.set("focusedtab", name);
					childPanel.show();
				},
				// onblur
				function(name){
					spp[name].hide();
				}
			),
			title : new Title.constructor(
				panelEl.find(">header")
			)
		});
	};
	SPP = new NonstaticClass(SPP, "Bao.Page.Index.SPP", Panel.prototype);

	SPP.properties({
		parnter : undefined,
		project : undefined,
		tab : undefined,
		title : undefined
	});

	return SPP.constructor;
}(
	Bao.UI.Control.List.UserList,
	Bao.UI.Control.Drag.Navigator
));

Index.members(this);
}.call(
	{},
	Bao.Page.Index,
	jQun.NonstaticClass,
	Bao.API.DOM.Panel,
	Bao.API.DOM.OverflowPanel,
	Bao.API.Data.Cache,
	Bao.CallServer,
	jQun.HTML,
	Bao.UI.Control.Wait.LoadingBar,
	Bao.API.Data.BatchLoad
));
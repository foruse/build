﻿(function(Index, Panel, NonstaticClass, HTML){
this.SPP = (function(UserList){
	function Title(panelEl){
	
	};
	Title = new NonstaticClass(Title, null, Panel.prototype);

	Title.properties({
		set : function(title){
			this.panelEl.find(">span").innerHTML = title;
		}
	});


	function Project(panelEl, html){
		///	<summary>
		///	项目。
		///	</summary>
		/// <params name="panelEl" type="jQun.HTMLElementList">对应的元素</params>
		/// <params name="html" type="jQun.HTML">项目html模板</params>
		this.assign({
			html : html
		});
	};
	Project = new NonstaticClass(Project, null, Panel.prototype);

	Project.properties({
		add : function(data){
			///	<summary>
			///	添加数据。
			///	</summary>
			/// <params name="data" type="array">项目数据</params>
			this.panelEl.find(">ul").innerHTML = this.html.render(data);
		},
		html : undefined
	});


	function Partner(panelEl){
		var userList, panelStyle = panelEl.style;
		
		userList = new UserList(function(top){
			panelStyle.top = top + "px";
		});

		this.assign({
			userList : userList
		});

		userList.appendTo(panelEl.find(">ul>li:last-child")[0]);
	};
	Partner = new NonstaticClass(Partner, null, Panel.prototype);

	Partner.properties({
		add : function(data){
			this.userList.render(data);
		},
		getParams : function(){
			return {
				tab : "workmate"
			};
		},
		userList : undefined
	});


	function Tab(panelEl, itemHtml, onfocus, onblur){
		///	<summary>
		///	SPP脚部选项卡。
		///	</summary>
		/// <params name="panelEl" type="jQun.HTMLElementList">对应的元素</params>
		/// <params name="itemHtml" type="jQun.HTML">选项卡html模板</params>
		/// <params name="onfocus" type="function">选项卡聚焦事件</params>
		/// <params name="onblur" type="function">选项卡失去焦点事件</params>
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
			/// <params name="name" type="string">选项卡名称</params>
			var buttonEl = this.btnEls.between('[tab="' + name + '"]', this.panelEl[0]);

			buttonEl.classList.add("focused");
			this.onfocus(name, buttonEl.find("span").innerHTML);
		},
		onblur : undefined,
		onfocus : undefined
	});


	function SPP(panelEl, oncallserver){
		///	<summary>
		///	日程、项目、拍档页。
		///	</summary>
		/// <params name="panelEl" type="jQun.HTMLElementList">对应的元素</params>
		/// <params name="oncallServer" type="function">获取数据的时候所调用的函数</params>
		/// <params name="name" type="string">首先初始化的子区域</params>
		var spp = this, panelAttr = panelEl.attributes;

		this.assign({
			partner : new Partner.constructor(
				panelEl.find("#partner")
			),
			project : new Project.constructor(
				panelEl.find("#project"),
				new HTML("project_html", true)
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
					/// <params name="name" type="string">需要焦点的panel名称</params>
					var	childPanel = spp[name];

					// 访问服务器取数据
					oncallserver(function(data){
						// 给对应的panel添加数据
						childPanel.add(data);
					}, name, childPanel.getParams ? childPanel.getParams() : null);

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
	Bao.UI.Control.List.UserList
));

Index.members(this);
}.call(
	{},
	Bao.Page.Index,
	Bao.API.DOM.Panel,
	jQun.NonstaticClass,
	jQun.HTML
));
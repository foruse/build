(function(Index, Panel, NonstaticClass, HTML){
this.SPP = (function(){
	function Project(panelEl, html){
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
			this.panelEl.find(">ul").innerHTML = this.html.render({
				projects : data
			});
		},
		html : "",
		panelEl : undefined
	});


	function Footer(panelEl, itemHtml, onfocus){
		var btnEls = panelEl.find("button"), btnClassList = btnEls.classList;

		panelEl.find("ul").innerHTML = itemHtml.render();

		panelEl.attach({
			click : function(e){
				var target = e.target;

				if(btnEls.contains(target))
					return;

				btnClassList.remove("focused");
				btnEls.find('[tab="' + name + '"]').classList.add("focused");
				onfocus(jQun(target).get("tab", "attr"));
			}
		});
	};
	Footer = new NonstaticClass(Footer);


	function SPP(panelEl, name, oncallserver){
		///	<summary>
		///	日程、项目、拍档页。
		///	</summary>
		/// <params name="panelEl" type="jQun.HTMLElementList">对应的元素</params>
		/// <params name="oncallServer" type="function">获取数据的时候所调用的函数</params>
		/// <params name="name" type="string">首先初始化的子区域</params>
		var spp = this;

		this.assign({
			footer : new Footer.constructor(
				panelEl.find(">footer"),
				new HTML("spp_item_html", true),
				spp.focus.bind(this)
			),
			headerEl : panelEl.find(">header"),
			project : new Project.constructor(
				panelEl.find("#project"),
				new HTML("project_html", true)
			),
			oncallserver : oncallserver
		});

		this.focus(name);
	};
	SPP = new NonstaticClass(SPP, "Bao.Page.Index.SPP", Panel.prototype);

	SPP.properties({
		blur : function(_focusedName){
			///	<summary>
			///	让已聚焦的子panel失去焦点。
			///	</summary>
			/// <params name="_focusedName" type="string">需要失去焦点的panel名称</params>
			var name = _focusedName || this.focusedName;
			
			if(!name){
				return;
			}

			this[name].hide();
		},
		focus : function(name){
			///	<summary>
			///	聚焦某个子panel。
			///	</summary>
			/// <params name="name" type="string">需要焦点的panel名称</params>
			var	childPanel = this[name];

			// 访问服务器取数据
			this.oncallserver(function(data){
				// 给对应的panel添加数据
				childPanel.add(data);
			}, name);

			this.blur();
			this.headerEl.find(">span").innerHTML = "";
			childPanel.show();

			this.focusedName = name;
		},
		focusedName : "",
		footerEl : undefined,
		headerEl : undefined,
		oncallserver : undefined,
		project : undefined
	});

	return SPP.constructor;
}());

Index.members(this);
}.call(
	{},
	Bao.Page.Index,
	Bao.API.DOM.Panel,
	jQun.NonstaticClass,
	jQun.HTML
));
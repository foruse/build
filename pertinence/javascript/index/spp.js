(function(Index, Panel, NonstaticClass, HTML){
this.SPP = (function(){
	function Header(panelEl){
	
	};
	Header = new NonstaticClass(Header, null, Panel.prototype);

	Header.properties({
		setTitle : function(title){
			this.panelEl.find(">span").innerHTML = title;
		}
	});


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
		html : ""
	});


	function Footer(panelEl, itemHtml, onfocus, onblur){
		///	<summary>
		///	SPP脚部选项卡。
		///	</summary>
		/// <params name="panelEl" type="jQun.HTMLElementList">对应的元素</params>
		/// <params name="itemHtml" type="string">选项卡html模板字符串</params>
		/// <params name="onfocus" type="function">选项卡聚焦事件</params>
		/// <params name="onblur" type="function">选项卡失去焦点事件</params>
		var btnEls, btnClassList, footer = this;

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

				footer.blur();
				footer.focus(buttonEl.get("tab", "attr"));
			}
		});
	};
	Footer = new NonstaticClass(Footer, null, Panel.prototype);

	Footer.properties({
		blur : function(){
			///	<summary>
			///	让选项卡失去焦点。
			///	</summary>
			var focusedEl = this.btnEls.between(".focused", this.panel[0]);

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
				// panelEl
				panelEl.find(">footer"),
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
					}, name);

					spp.header.setTitle(title);
					childPanel.show();
				},
				// onblur
				function(name){
					spp[name].hide();
				}
			),
			header : new Header.constructor(
				panelEl.find(">header")
			),
			project : new Project.constructor(
				panelEl.find("#project"),
				new HTML("project_html", true)
			)
		});

		this.footer.focus(name);
	};
	SPP = new NonstaticClass(SPP, "Bao.Page.Index.SPP", Panel.prototype);

	SPP.properties({
		footerEl : undefined,
		headerEl : undefined,
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
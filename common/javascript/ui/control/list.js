(function(List, NonstaticClass, Panel, HTML){
this.AnchorList = (function(anchorListHtml){
	function AnchorList(listData){
		///	<summary>
		///	连接列表。
		///	</summary>
		this.combine(anchorListHtml.create({ listData : listData }));
	};
	AnchorList = new NonstaticClass(AnchorList, "Bao.UI.Control.List.AnchorList", Panel.prototype);

	return AnchorList.constructor;
}(
	// anchorListHtml
	new HTML([
		'<div class="anchorList">',
			'<ul class="themeBdColor">',
				'@for(listData ->> data){',
					'<li key="{data.key}" class="lightBdColor onlyBorderBottom inlineBlock">',
						'<nav>',
							'<aside>',
								'<dl>',
									'<dt>',
										'<span>{?~data.title}</span>',
										'<small>{?~data.time}</small>',
									'</dt>',
									'<dd>{?~data.desc}</dd>',
								'</dl>',
							'</aside>',
							'<p>',
								'<a href="javascript:void(0);"></a>',
							'</p>',
						'</nav>',
					'</li>',
				'}',
			'</ul>',
		'</div>'
	].join(""))
));

this.ProjectAnchorList = (function(AnchorList, levelHtml){
	function ProjectAnchorList(listData){
		///	<summary>
		///	项目连接列表。
		///	</summary>
		var anchorList = this;

		listData.forEach(function(project){
			var descEl = anchorList.find('li[key="' + project.id + '"] dd');

			if(descEl.length === 0)
				return;

			descEl.innerHTML = levelHtml.render(project);
		});
	};
	ProjectAnchorList = new NonstaticClass(ProjectAnchorList, "Bao.UI.Control.List.ProjectAnchorList", AnchorList.prototype);

	return ProjectAnchorList.constructor;
}(
	this.AnchorList,
	// levelHtml
	new HTML([
		'<ul class="anchorList_level inlineBlock">',
			'@for(level){',
				'<li></li>',
			'}',
		'</ul>'
	].join(""))
));

this.UserList = (function(panelHtml, userListHtml){
	function UserList(){
		this.combine(panelHtml.create());
	};
	UserList = new NonstaticClass(UserList, "Bao.UI.Control.UserList", Panel.prototype);

	UserList.properties({
		render : function(users){
			this.innerHTML = userListHtml.render({ users : users });

			return this;
		}
	});

	return UserList.constructor;
}(
	// panelHtml
	new HTML('<div class="userList inlineBlock"></div>'),
	// userListHtml
	new HTML([
		'@for(users ->> u){',
			'<figure id="{u.id}">',
				'<p>',
					'<img src="{u.avatar}" />',
				'</p>',
				'<figcaption title="{u.name}">{u.name}</figcaption>',
			'</figure>',
		'}'
	].join(""))
));

this.UserIndexList = (function(UserList, panelHtml, listHtml){
	function UserIndexList(onletter){
		///	<summary>
		///	用户索引列表。
		///	</summary>
		var userIndexList = this;

		this.combine(panelHtml.create());

		this.attach({
			click : function(e){
				var targetEl = jQun(e.target),
					el = targetEl.between('aside li', this);

				if(el.length > 0){
					if(el.get("idx", "attr") === "-1")
						return;

					onletter(
						userIndexList.rect("top") - userIndexList.find('> ol > [letter="' + el.get("letter", "attr") + '"]').rect("top")
					);
				}
			}
		});
	};
	UserIndexList = new NonstaticClass(UserIndexList, "Bao.UI.Control.UserIndexList", Panel.prototype);

	UserIndexList.properties({
		refresh : function(data){
			///	<summary>
			///	渲染数据。
			///	</summary>
			/// <param name="data" type="*">用户数据</param>
			this.innerHTML = listHtml.render(data);

			data.userListCollection.forEach(function(userList){
				new UserList().render(userList.users).appendTo(this.find('li[letter="' + userList.firstLetter + '"] dd')[0]);
			}, this);

			return this;
		}
	});

	return UserIndexList.constructor;
}(
	this.UserList,
	// panelHtml
	new HTML([
		'<div class="userIndexList"></div>'
	].join("")),
	// listHtml
	new HTML([
		'<ol>',
			'@for(userListCollection ->> userList){',
				'<li letter="{userList.firstLetter}">',
					'<dl>',
						'<dt>',
							'<strong>{userList.firstLetter}</strong>',
						'</dt>',
						'<dd></dd>',
					'</dl>',
				'</li>',
			'}',
		'</ol>',
		'<aside>',
			'<ol>',
				'@for(letters ->> idx, letter){',
					'<li letter="{letter}" idx="{idx}">{letter}</li>',
				'}',
			'</ol>',
		'</aside>',
	].join(""))
));

this.UserSelectionList = (function(UserList, html){
	function UserSelectionList(_userData){
		///	<summary>
		///	用户选择列表。
		///	</summary>
		if(!_userData){
			_userData = [];
		}

		userList.render();
	};
	UserSelectionList = new NonstaticClass(UserSelectionList, "Bao.UI.Control.List.UserSelectionList", UserList.prototype);

	UserSelectionList.properties({
	
	});
	
	return UserSelectionList.constructor;
}(
	this.UserList
));

List.members(this);
}.call(
	{},
	Bao.UI.Control.List,
	jQun.NonstaticClass,
	Bao.API.DOM.Panel,
	jQun.HTML
));
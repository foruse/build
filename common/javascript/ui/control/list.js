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
	function UserList(_avatarSize){
		this.assign({
			avatarSize : _avatarSize
		});
		
		this.combine(panelHtml.create());
	};
	UserList = new NonstaticClass(UserList, "Bao.UI.Control.UserList", Panel.prototype);

	UserList.properties({
		avatarSize : "large",
		render : function(users){
			this.innerHTML = userListHtml.render({ users : users, avatarSize : this.avatarSize });

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
				'<p class="{avatarSize}AvatarPanel">',
					'<img src="{u.avatar}" />',
				'</p>',
				'<figcaption title="{u.name}">{u.name}</figcaption>',
			'</figure>',
		'}'
	].join(""))
));

this.UserIndexList = (function(OverflowPanel, UserList, panelHtml, listHtml){
	function UserIndexList(onletter){
		///	<summary>
		///	用户索引列表。
		///	</summary>
		var listStyle, userIndexList = this;

		this.combine(panelHtml.create());
		listStyle = this.style;

		this.attach({
			userclick : function(e){
				var targetEl = jQun(e.target),
					el = targetEl.between('aside li', this);

				if(el.length > 0){
					if(el.get("idx", "attr") === "-1")
						return;

					listStyle.top = (
						userIndexList.rect("top") - 
						userIndexList.find('> ol > [letter="' + el.get("letter", "attr") + '"]').rect("top")
					) + "px";
				}
			}
		});

		new OverflowPanel(this[0]);
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
				new UserList().render(userList.users).appendTo(
					this.find('li[letter="' + userList.firstLetter + '"] dd')[0]
				);
			}, this);

			return this;
		}
	});

	return UserIndexList.constructor;
}(
	Bao.API.DOM.OverflowPanel,
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

this.UserSelectionList = (function(UserList, UserIndexList, LoadingBar, CallServer, fillHtml){
	function UserSelectionList(text, mask, _userData){
		///	<summary>
		///	用户选择列表。
		///	</summary>
		/// <param name="mask" type="Bao.UI.Fixed.Mask">遮罩</param>
		/// <param name="_userData" type="array">用户数据</param>
		var userSectionList = this, loadingBar = new LoadingBar();

		this.assign({
			text : text
		});

		if(!_userData){
			_userData = [];
		}

		this.classList.add("userSelectionList");

		this.render(_userData.concat([
			{ id : -1, avatar : "", name : "addUser" },
			{ id : -1, avatar : "", name : "delUser" }
		]));

		this.attach({
			userclick : function(e){
				var targetEl = jQun(e.target);

				if(targetEl.between('>figure[id="-1"]:nth-child(1)', this).length > 0){
					var fillEl = fillHtml.create({ text : userSectionList.text }),
						
						loadingBar = new LoadingBar(), userIndexList = new UserIndexList();

					// 将loadingBar添加至userIndexList
					loadingBar.appendTo(userIndexList[0]);
					// 显示loadingBar
					loadingBar.show();
					// 将userIndexList添加至fillEl
					userIndexList.appendTo(fillEl.find(">dl>dd")[0]);
					// 遮罩填充元素并显示
					mask.fill(fillEl[0]);
					mask.show("selectUser");

					CallServer.open("getPartners", { groupId : -1 }, function(data){
						loadingBar.hide();
						userIndexList.refresh(data);
					});
				}
			}
		});
	};
	UserSelectionList = new NonstaticClass(UserSelectionList, "Bao.UI.Control.List.UserSelectionList", UserList.prototype);

	UserSelectionList.override({
		avatarSize : "normal"
	});

	UserSelectionList.properties({
		clearUsers : function(){
		
		},
		text : ""
	});
	
	return UserSelectionList.constructor;
}(
	this.UserList,
	this.UserIndexList,
	Bao.UI.Control.Wait.LoadingBar,
	Bao.CallServer,
	// fillHtml
	new HTML([
		'<section class="mask_userSelectionList">',
			'<dl>',
				'<dt>{text}</dt>',
				'<dd></dd>',
			'</dl>',
		'</section>'
	].join(""))
));

List.members(this);
}.call(
	{},
	Bao.UI.Control.List,
	jQun.NonstaticClass,
	Bao.API.DOM.Panel,
	jQun.HTML
));
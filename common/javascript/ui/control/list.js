(function(List, NonstaticClass, Panel, HTML){
this.AnchorList = (function(anchorListHtml){
	function AnchorList(listData){
		this.combine(anchorListHtml.create({ listData : listData }));
	};
	AnchorList = new NonstaticClass(AnchorList, "Bao.UI.Control.List.AnchorList", Panel.prototype);

	AnchorList.properties({
		
	});

	return AnchorList.constructor;
}(
	// anchorListHtml
	new HTML([
		'<div class="anchorList">',
			'<ul>',
				'@for(listData ->> item){',
					'<li>',
						'<aside>',
							'<dl>',
								'<dt>{?~item.title}</dt>',
								'<dd>{?~item.desc}</dd>',
							'</dl>',
						'</aside>',
						'<nav>',
							'<a></a>',
						'</nav>',
					'</li>',
				'}',
			'</ul>',
		'</div>'
	].join(""))
));

this.UserList = (function(panelHtml, listHtml){
	function UserList(onletter){
		var userList = this;

		this.combine(panelHtml.create());

		this.attach({
			click : function(e){
				var targetEl = jQun(e.target),
					el = targetEl.between('aside li', this);

				if(el.length > 0){
					if(el.get("idx", "attr") === "-1")
						return;

					onletter(
						userList.rect("top") - userList.find('> ol > [letter="' + el.get("letter", "attr") + '"]').rect("top")
					);
				}
			}
		});
	};
	UserList = new NonstaticClass(UserList, "Bao.UI.Control.List", Panel.prototype);

	UserList.properties({
		render : function(data){
			this.innerHTML = listHtml.render(data);

			return this;
		}
	});

	return UserList.constructor;
}(
	// panelHtml
	new HTML([
		'<div class="userList"></div>'
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
						'<dd class="inlineBlock">',
						'@for(userList.users ->> u){',
							'<figure id="{u.id}">',
								'<p>',
									'<img src="{u.avatar}" />',
								'</p>',
								'<figcaption title="{u.name}">{u.name}</figcaption>',
							'</figure>',
						'}',
						'</dd>',
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

List.members(this);
}.call(
	{},
	Bao.UI.Control.List,
	jQun.NonstaticClass,
	Bao.API.DOM.Panel,
	jQun.HTML
));
(function(List, NonstaticClass, HTMLElementList, HTML){
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
	UserList = new NonstaticClass(UserList, "Bao.UI.Control.List", HTMLElementList.prototype);

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
		'<div class="userList overflowPanel"></div>'
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
	jQun.HTMLElementList,
	jQun.HTML
));
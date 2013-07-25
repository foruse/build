(function(List, NonstaticClass, HTML){
this.UserList = (function(HTMLElementList, panelHtml, listHtml){
	function UserList(){
		this.combine(panelHtml.create());
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
	// HTMLElementList
	jQun.HTMLElementList,
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
				'@for("ABCDEFGHIJKLMNOPQRSTUVWXYZ" ->> letter){',
					'<li letter="{letter}">{letter}</li>',
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
	jQun.HTML
));
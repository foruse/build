(function(List, NonstaticClass, HTML){
this.UserList = (function(HTMLElementList, panelHtml, listHtml){
	function UserList(){
		var userList = this;

		this.combine(panelHtml.create());

		this.attach({
			click : function(e){
				var targetEl = jQun(e.target),
					el = targetEl.between("aside li", this);

				if(el.length > 0){
					console.log(el[0].getBoundingClientRect());
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
	jQun.HTML
));
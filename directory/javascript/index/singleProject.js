(function(SingleProject, NonstaticClass, PagePanel, CallServer){
this.Header = (function(){
	function Header(selector){
		console.log(1);
	};
	Header = new NonstaticClass(Header, "Bao.Page.Index.SinlgeProject.Header");

	return Header.constructor;
}());

this.Discussion = (function(OverflowPanel, ChatList, Global){
	function Discussion(selector, infoHtml){
		///	<summary>
		///	单个项目。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>
		/// <param name="infoHtml" type="jQun.HTML">信息模板</param>
		var discussion = this,
			
			chatList = new ChatList(), overflowPanel = new OverflowPanel(this.find(">section")[0]);

		this.assign({
			chatList : chatList,
			infoHtml : infoHtml,
			overflowPanel : overflowPanel
		});

		chatList.appendTo(overflowPanel.find(">figure")[0]);

		chatList.attach({
			messageappended : function(e){
				overflowPanel.bottom();
			},
			clickpraise : function(e){
				var message = e.message, loginUser = Global.loginUser;

				CallServer.open("praise", {
					messageId : message.id,
					userId : loginUser.id
				}, function(){
					message.addPraise(loginUser);
				})
			}
		});
	};
	Discussion = new NonstaticClass(Discussion, "Bao.Page.Index.SingleProject.Discussion", PagePanel.prototype);

	Discussion.override({
		title : "单个项目"
	});

	Discussion.properties({
		chatList : undefined,
		fill : function(id){
			///	<summary>
			///	填充项目。
			///	</summary>
			/// <param name="id" type="number">项目id</param>
			var discussion = this, chatListContent = this.chatList.chatListContent;

			this.id = id;
			this.overflowPanel.setTop(0);
			chatListContent.clearAllMessages();

			CallServer.open("getSingleProject", { id : id }, function(project){
				// 重置颜色
				chatListContent.resetColor(project.color);
				// 重置标题
				Global.titleBar.resetTitle("单个项目 - " + project.title);
				// 项目信息
				discussion.overflowPanel.find(">header>dl").innerHTML = discussion.infoHtml.render(project);

				// 添加聊天信息
				project.messages.forEach(function(msg){
					chatListContent.appendMessageToGroup(msg);
				});
			});
		},
		id : -1,
		infoHtml : undefined,
		overflowPanel : undefined
	});

	return Discussion.constructor;
}(
	Bao.API.DOM.OverflowPanel,
	Bao.UI.Control.Chat.ChatList,
	Bao.Global
));

this.ToDoList = (function(){
	function ToDoList(selector){};
	ToDoList = new NonstaticClass(ToDoList, "Bao.Pge.Index.SingleProject.ToDoList", PagePanel.prototype);

	return ToDoList.constructor;
}());

this.Self = (function(Panel, Header){
	function Self(selector){
		///	<summary>
		///	单个页面。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>
		var self = this;

		new Header(this.find(">header")[0]);
	};
	Self = new NonstaticClass(Self, "Bao.Page.Index.SingleProject.Self", Panel.prototype);

	return Self.constructor;
}(
	Bao.API.DOM.Panel,
	this.Header
));


SingleProject.members(this);
}.call(
	{},
	Bao.Page.Index.SingleProject,
	jQun.NonstaticClass,
	Bao.API.DOM.PagePanel,
	Bao.CallServer
));
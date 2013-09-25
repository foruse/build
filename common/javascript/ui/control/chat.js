(function(Chat, NonstaticClass, Panel, HTML, Global){
this.Attachment = (function(){
	function Attachment(id, _src){
		///	<summary>
		///	附件。
		///	</summary>
		/// <param name="id" type="string">附件id</param>
		/// <param name="_src" type="string">附件src</param>
		this.assign({
			id : id,
			src : _src
		});
	};
	Attachment = new NonstaticClass(Attachment);

	Attachment.properties({
		id : -1,
		src : "javascript:void(0);"
	});

	return Attachment.constructor;
}());

this.Message = (function(Attachment, CallServer, messageHtml, praiseHtml){
	function Message(msg){
		///	<summary>
		///	单个信息。
		///	</summary>
		/// <param name="msg" type="object">信息数据</param>
		var message = this, attachment = msg.attachment, poster = msg.poster;

		this.assign({
			attachment : attachment ? new Attachment(attachment.id, attachment.src) : undefined,
			color : msg.color,
			id : msg.id,
			isPostBySelf : poster.isLoginUser,
			isPraiseBySelf : msg.isPraiseBySelf,
			praise : msg.praise,
			poster : poster,
			text : msg.text,
			time : msg.time,
			type : msg.type
		});

		this.combine(messageHtml.create(msg));
		
		this.find(">figure>nav").attach({
			userclick : function(e, targetEl){
				// 判断点击的是否是 赞 按钮
				if(targetEl.between(".chatList_praise>button", this).length > 0){
					message.addPraise(Global.loginUser);
					return;
				}
				
				// 判断点击的是否是 do 按钮
				if(targetEl.between(">button", this).length > 0){
					alert("you clicked todo button");
					return;
				}

				// 判断点击的是否是 展开赞 按钮
				if(targetEl.between(".chatList_praise>sub>button", this).length > 0){
					message.classList.toggle("morePraised");
					return;
				}
			}
		});
	};
	Message = new NonstaticClass(Message, null, Panel.prototype);

	Message.properties({
		addPraise : function(userData){
			if(this.isPraiseBySelf)
				return;

			var message = this;

			CallServer.open("praise", { messageId : this.id }, function(){
				var praisePanel = message.find(".chatList_praise"), praiseEl = praisePanel.find(">button");

				praiseEl.innerHTML = praiseEl.innerHTML - 0 + 1;
				praiseHtml.create(userData).insertTo(praisePanel.find(">p")[0], 0);

				message.isPraiseBySelf = true;
				message.setAttribute("ispraisedbyself", "true");
			}, true);
		},
		// 附件信息
		attachment : new Attachment.constructor(),
		// 颜色
		color : 0,
		// id
		id : -1,
		// 是否发自自己
		isPostBySelf : false,
		// 是否被自己赞过
		isPraiseBySelf : false,
		// 发送人
		poster : undefined,
		// 称赞的人
		praise : [],
		// 信息文本
		text : "",
		// 信息发送时间
		time : 0,
		// 信息种类
		type : "text"
	});

	return Message.constructor;
}(
	this.Attachment,
	Bao.CallServer,
	// messageHtml
	new HTML([
		'<li class="chatList_message inlineBlock" action="{type}" ispostbyself="{poster.isLoginUser}" ispraisedbyself="{isPraisedBySelf}">',
			'<aside>',
				'<p class="normalAvatarPanel" userid="{poster.id}">',
					'<img src="{poster.avatar}" />',
				'</p>',
			'</aside>',
			'<figure>',
				'<figcaption>',
					'<span>{text}</span>',
					'<a voiceid="{attachment.id}">',
						'<button></button>',
					'</a>',
					'<img src="{attachment.src}" />',
				'</figcaption>',
				'<nav class="whiteFont inlineBlock">',
					'<button>do</button>',
					'<aside class="chatList_praise">',
						'<button>{praise.length}</button>',
						'<p class="inlineBlock">',
							'@for(praise ->> p){',
								'<a class="smallAvatarPanel " title="{p.name}" userid="{p.id}">',
									'<img src="{p.avatar}" />',
								'</a>',
							'}',
						'</p>',
						'<sub>',
							'<button></button>',
						'</sub>',
					'</aside>',
				'</nav>',
				'<p class="message_bg normalRadius projectColor_{color}">',
					'<span></span>',
				'</p>',
			'</figure>',
		'</li>'
	].join("")),
	// praiseHtml
	new HTML([
		'<a class="smallAvatarPanel " title="{name}" userid="{id}">',
			'<img src="{avatar}" />',
		'</a>'
	].join(""))
));

this.MessageList = (function(List, Message){
	function MessageList(){
		///	<summary>
		///	信息列表。
		///	</summary>
	};
	MessageList = new NonstaticClass(MessageList, null, List.prototype);

	MessageList.override({
		push : function(msg){
			///	<summary>
			///	添加信息。
			///	</summary>
			/// <param name="msg" type="object">信息数据</param>
			var message = new Message(msg);

			List.prototype.push.call(this, message);
			return message;
		}
	});

	return MessageList.constructor;
}(
	jQun.List,
	this.Message
));

this.MessageGroup = (function(MessageList, messageGroupHtml){
	function MessageGroup(firstMessage){
		///	<summary>
		///	信息分组区域。
		///	</summary>
		/// <param name="firstMessage" type="object">信息数据</param>
		this.combine(messageGroupHtml.create(firstMessage));

		this.assign({
			messageList : new MessageList()
		});

		this.appendMessage(firstMessage);
	};
	MessageGroup = new NonstaticClass(MessageGroup, null, Panel.prototype);

	MessageGroup.properties({
		appendMessage : function(msg){
			///	<summary>
			///	向信息分组添加信息。
			///	</summary>
			/// <param name="msg" type="object">信息数据</param>
			var msg = this.messageList.push(msg);

			msg.appendTo(this.find(">dd>ol")[0]);
		},
		messageList : undefined
	});

	return MessageGroup.constructor;
}(
	this.MessageList,
	// messageGroupHtml
	new HTML([
		'<dl>',
			'<dt class="smallRadius lightBgColor whiteFont">{localTime}</dt>',
			'<dd>',
				'<ol></ol>',
			'</dd>',
		'</dl>'
	].join(""))
));

this.ChatListContent = (function(MessageGroup){
	function ChatListContent(selector){
		///	<summary>
		///	聊天列表内容区域。
		///	</summary>
		/// <param name="selector" type="string, element">对应元素选择器</param>
	};
	ChatListContent = new NonstaticClass(ChatListContent, null, Panel.prototype);

	ChatListContent.properties({
		appendMessageToGroup : function(msg){
			///	<summary>
			///	添加信息。
			///	</summary>
			/// <param name="msg" type="object">信息数据</param>
			var messageGroup = this.messageGroup;

			// 如果 messageGroup 存在
			if(messageGroup){
				var messageList = messageGroup.messageList, i = messageList.length - 1;

				// 如果 i > -1，说明消息总数大于0
				if(i > -1){
					// 如果 最后一条信息的时间 与 当前信息的时间 相差5分钟
					if(msg.time - messageList[i].time > 300000){
						this.appendMessageGroup(msg);
						return;
					}
				}
			}
			else {
				this.appendMessageGroup(msg);
				return;
			}

			// 添加消息
			messageGroup.appendMessage(msg);
		},
		appendMessageGroup : function(firstMessage){
			///	<summary>
			///	添加信息分组。
			///	</summary>
			var messageGroup = new MessageGroup(firstMessage);

			messageGroup.appendTo(this[0]);
			this.messageGroup = messageGroup;

			return messageGroup;
		},
		messageGroup : undefined
	});

	return ChatListContent.constructor;
}(
	this.MessageGroup
));

this.ChatInput = (function(){
	function ChatInput(selector){
		///	<summary>
		///	聊天输入。
		///	</summary>
		/// <param name="selector" type="string">对应元素选择器</param>
		var chatInput = this, inputClassList = chatInput.classList;

		this.attach({
			userclick : function(e, targetEl){
				if(targetEl.between(">button", this).length > 0){
					// 移除或添加voice
					inputClassList.toggle("voice");

					// 如果有voice类，说明是语音输入状态
					if(inputClassList.contains("voice")){
						
						return;
					}
					return;
				}
			}
		});
	};
	ChatInput = new NonstaticClass(ChatInput, null, Panel.prototype);

	return ChatInput.constructor;
}());

this.ChatList = (function(ChatInput, ChatListContent, listPanelHtml){
	function ChatList(){
		///	<summary>
		///	聊天列表。
		///	</summary>
		this.combine(listPanelHtml.create({
			isLeader : Global.loginUser.isLeader
		}));

		this.assign({
			chatListContent : new ChatListContent(this.find(">article")[0])
		});

		new ChatInput(this.find(">footer")[0]);
	};
	ChatList = new NonstaticClass(ChatList, "Bao.UI.Control.List.ChatList", Panel.prototype);

	ChatList.properties({
		chatListContent : undefined
	});

	return ChatList.constructor;
}(
	this.ChatInput,
	this.ChatListContent,
	// listPanelHtml
	new HTML([
		'<div class="chatList">',
			'<article class="chatList_content" isleader="{isLeader}"></article>',
			'<footer class="chatList_footer inlineBlock">',
				'<button></button>',
				'<p>',
					'<button class="smallRadius">按住说话</button>',
					'<input class="smallRadius" type="text" placeholder="输入文字.." />',
				'</p>',
				'<aside>',
					'<button></button>',
					'<button></button>',
				'</aside>',
			'</footer>',
		'</div>'
	].join(""))
));

Chat.members(this);
}.call(
	{},
	Bao.UI.Control.Chat,
	jQun.NonstaticClass,
	Bao.API.DOM.Panel,
	jQun.HTML,
	Bao.Global
));
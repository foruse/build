﻿(function(Deep, NonstaticClass, StaticClass, PagePanel, CallServer){
this.GlobalSearch = (function(OverflowPanel, Panel, UserAnchorList, Global, forEach, config){
	function GlobalSearch(selector, groupHtml){
		///	<summary>
		///	全局搜索。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>
		/// <param name="groupHtml" type="jQun.HTML">分组的html模板</param>
		var globalSearch = this, textEl = this.find(">header input"),
			
			groupPanel = new OverflowPanel(this.find(".globalSearch_content>ul")[0]);

		this.assign({
			groupHtml : groupHtml,
			groupPanel : groupPanel
		});

		this.find(">header").attach({
			userclick : function(e){
				var targetEl = jQun(e.target);

				if(targetEl.between(">aside>button", this).length > 0){
					var val = textEl.value;

					if(val === "")
						return;

					globalSearch.search(val);
					return;
				}

				if(targetEl.between(">nav>button", this).length > 0){
					Global.history.go("systemOption", true);
				}
			}
		});

		groupPanel.attach({
			clickanchor : function(e){
				var group = jQun(e.target).between(">li>dl", this).get("group", "attr");

				e.stopPropagation();

				if(!group){
					return;
				}

				var cfg = config[group];

				Global.history.go(cfg.panel)[cfg.method](e.anchor);
			}
		}, true);
	};
	GlobalSearch = new NonstaticClass(GlobalSearch, "Bao.Page.Index.Deep.GlobalSearch", PagePanel.prototype);

	GlobalSearch.override({
		showTitleBar : false
	});

	GlobalSearch.properties({
		groupHtml : undefined,
		groupPanel : undefined,
		search : function(text){
			///	<summary>
			///	搜索。
			///	</summary>
			/// <param name="text" type="string">需要搜索的文本值</param>
			if(text === "")
				return;

			var globalSearch = this;

			CallServer.open("globalSearch", { search : text }, function(data){
				var groupPanel = globalSearch.groupPanel;

				// 将top设置为0
				groupPanel.setTop(0);
				// 重新渲染分组
				groupPanel.innerHTML = globalSearch.groupHtml.render();

				// 数据渲染
				forEach(data, function(listData, name){
					if(listData.length === 0){
						return;
					}

					var groupContentEl = groupPanel.find('dl[group="' + name + '"]>dd');

					new UserAnchorList(listData).appendTo(groupContentEl[0]);
					groupContentEl.parent().parent().show();
				});
			});
		}
	});

	return GlobalSearch.constructor;
}(
	Bao.API.DOM.OverflowPanel,
	Bao.API.DOM.Panel,
	Bao.UI.Control.List.UserAnchorList,
	Bao.Global,
	jQun.forEach,
	// config
	{
		projects : {
			panel : "",
			method : ""
		},
		partners : {
			panel : "businessCard",
			method : "fillUser"
		},
		todo : {
			panel : "",
			method : ""
		},
		comments : {
			panel : "",
			method : ""
		}
	}
));

this.Account = (function(LoadingBar, Global, ValidationList){
	function Account(selector, contentHtml){
		///	<summary>
		///	我的账户。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>
		/// <param name="contentHtml" type="jQun.HTML">内容的html模板</param>
		var account = this, accountClassList = account.classList,

			validationList = new ValidationList(),

			titleBar = Global.titleBar;

		// 渲染空数据
		this.innerHTML = contentHtml.render({
			name : "",
			company : "",
			email : "",
			position : "",
			phoneNum : "",
			companyAdress : "",
			password : ""
		});

		// 监听事件
		this.attach({
			beforeshow : function(){
				var editButtonEl = titleBar.find('button[action="editAccount"]');

				editButtonEl.onuserclick = function(){
					var footerEl = account.find(">footer");

					// 如果点击了编辑按钮
					if(editButtonEl.get("action", "attr") === "editAccount"){
						// 所有input变为可以输入
						account.find("input").del("readonly", "attr");
						// 编辑按钮变成提交按钮
						editButtonEl.set("action", "submit account", "attr");
						// 修改标题栏的标题
						titleBar.resetTitle("修改账户");
						footerEl.show();
						return;
					}

					if(!validationList.validate())
						return;

					editButtonEl.set("action", "editAccount", "attr");
					// 所有input变为只读
					account.find("input").set("readonly", "", "attr");
					// 修改标题栏的标题
					titleBar.resetTitle("我的账户");
					footerEl.hide();
				};
			},
			userclick : function(e){
				var targetEl = jQun(e.target);

				if(targetEl.between(">footer button", this).length > 0){
					var footerClassList = account.find(">footer").classList;

					if(footerClassList.contains("editable")){
						targetEl.innerHTML = "修改密码";
						footerClassList.remove("editable");
						return;
					}

					targetEl.innerHTML = "取消修改";
					footerClassList.add("editable");
				}
			}
		});

		// 访问服务器
		CallServer.open("myInformation", null, function(info){
			account.innerHTML = contentHtml.render(info);

			// 验证信息
			account.find("dl").forEach(function(parent){
				var parentEl = jQun(parent),

					inputEl = parentEl.find("input"), vtype = inputEl.get("vtype", "attr");

				if(!vtype){
					return;
				}

				validationList.addValidation(parentEl, function(el, Validation){
					if(vtype === "rePwd"){
						return inputEl.value === account.find('dl[desc="editPwd"] input').value;
					}

					return Validation.result(inputEl.value, vtype);
				});
			});
		});
	};
	Account = new NonstaticClass(Account, "Bao.Page.Index.Deep.Account", PagePanel.prototype);

	Account.override({
		title : "我的账户",
		tools : [
			{ urlname : "javascript:void(0);", action : "editAccount" }
		]
	});

	return Account.constructor;
}(
	Bao.UI.Control.Wait.LoadingBar,
	Bao.Global,
	Bao.API.DOM.ValidationList
));

this.QRCode = (function(){
	function QRCode(selector, contentHtml){
		///	<summary>
		///	我的二维码。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>
		/// <param name="contentHtml" type="jQun.HTML">内容的html模板</param>
		var qrCode = this;

		CallServer.open("myInformation", null, function(data){
			qrCode.innerHTML = contentHtml.render(data);
		});
	};
	QRCode = new NonstaticClass(QRCode, "Bao.Page.Index.Deep.QRCode", PagePanel.prototype);

	QRCode.override({
		title : "我的二维码"
	});

	return QRCode.constructor;
}());

this.AboutBaoPiQi = (function(){
	function AboutBaoPiQi(selector){
		///	<summary>
		///	关于暴脾气。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>
	};
	AboutBaoPiQi = new NonstaticClass(AboutBaoPiQi, "Bao.Page.Index.Deep.AboutBaoPiQi", PagePanel.prototype);

	AboutBaoPiQi.override({
		title : "关于暴脾气"
	});

	return AboutBaoPiQi.constructor;
}());

this.ToDo = (function(ChatList, OverflowPanel, Global){
	function ToDo(selector, infoHtml){
		var toDo = this, chatList = new ChatList(), overflowPanel = new OverflowPanel(this.find(">section")[0]);

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
					userId : loginUser.id,
					type : "toDo"
				}, function(){
					message.addPraise(loginUser);
				})
			}
		});

		this.find(">section>header").attach({
			userclick : function(e, targetEl){
				if(targetEl.between("dt>button").length > 0){
					CallServer.open("toDoCompleted", { id : toDo.id }, function(data){
						console.log(data);
					}, true);
					return;
				}
			}
		});
	};
	ToDo = new NonstaticClass(ToDo, "Bao.Page.Index", PagePanel.prototype);

	ToDo.override({
		title : "To Do"
	});

	ToDo.properties({
		chatList : undefined,
		fill : function(id){
			var toDo = this, chatListContent = this.chatList.chatListContent;
		
			CallServer.open("getToDo", { id : id }, function(data){
				var figureEl = toDo.find(">section>figure");

				toDo.overflowPanel.setTop(0);
				chatListContent.clearAllMessages();
				// 重置颜色
				chatListContent.resetColor(project.color);

				toDo.find(">section>header").innerHTML = toDo.infoHtml.render(data);

				data.messages.forEach(function(msg){
					this.appendMessageToGroup(msg);
				}, chatListContent);
			});

			this.id = id;
		},
		id : -1,
		infoHtml : undefined,
		overflowPanel : undefined
	});

	return ToDo.constructor;
}(
	Bao.UI.Control.Chat.ChatList,
	Bao.API.DOM.OverflowPanel,
	Bao.Global
));

this.SendToDo = (function(ValidationList, Validation){
	function SendToDo(selector, infoHtml){
		var validationList = new ValidationList();

		this.assign({
			infoHtml : infoHtml
		});

		this.find("input, text").forEach(function(text){
			validationList.addValidation(jQun(text), function(textEl){
				return Validation.validate(textEl, textEl.getAttribute("vtype"));
			});
		});
	};
	SendToDo = new NonstaticClass(SendToDo, "Bao.Page.Index.Deep.SendToDo", PagePanel.prototype);

	SendToDo.override({
		title : "发送 To Do"
	});

	SendToDo.properties({
		fill : function(id){
			var sendToDo = this;

			CallServer.open("getUser", { id : id }, function(data){
				sendToDo.find(">header").innerHTML = sendToDo.infoHtml.render(data);
			});
		},
		infoHtml : undefined
	});

	return SendToDo.constructor;
}(
	Bao.API.DOM.ValidationList,
	jQun.Validation
));

Deep.members(this);
}.call(
	{},
	Bao.Page.Index.Deep,
	jQun.NonstaticClass,
	jQun.StaticClass,
	Bao.API.DOM.PagePanel,
	Bao.CallServer
));
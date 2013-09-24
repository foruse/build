﻿(function(Bao, JSON, Text, Index){
this.CallServer = (function(CallServer, Wait, open, allHandlers){
	CallServer.setResponseType("json");
	// 开始测试
	CallServer.beginTesting();

	// 重写open方法
	CallServer.override({
		open : function(name, params, _complete, _isUpload){
			var LoadingBar = Wait.LoadingBar;

			LoadingBar.show(_isUpload ? "正在上传数据.." : null);

			open.call(CallServer, name, params, function(data, isCache, isSuccess){
				if(isCache){
					LoadingBar.hide();
					_complete(data);
					return;
				}

				// 测试延迟设置
				setTimeout(function(){
					if(!isSuccess){
						LoadingBar.error((_isUpload ? "上传" : "加载") + "数据失败..");
						return;
					}

					LoadingBar.hide();
					_complete(data);
				}, 0);
			});
		}
	});

	CallServer.save([
		["addProject",			new Text("url?title={title}&color={color}&desc={desc}&users={users}"), "POST"],
		["getLoginInfo",		"url",										""],
		["getPartnerGroups",	"url",										"", true],
		["getPartners",			new Text("url?groupId={groupId}"),			"", true],
		["getProjects",			"url",										"", true],
		["getSchedules",		new Text("url?last={last}&next={next}"),	"", true],
		["getSingleProject",	new Text("url?id={id}"),					"", true],
		["getUser",				new Text("url?id={id}"),					"", true],
		["globalSearch",		new Text("url?search={search}"),			"", true],
		["invitation",			new Text("url?emails={emails}"),			""],
		["login",				new Text("url?email={email}&pwd={pwd}"),	""],
		["myInformation",		"url",										"", true],
		["register",			new Text("url?name={name}&pwd={pwd}&email={email}&validation={validation}"),	""]
	], allHandlers);

	return CallServer;
}(
	jQun.Ajax,
	Bao.UI.Control.Wait,
	jQun.Ajax.open,
	// allHandlers
	{
		getPartnerGroups : function(data){
			data = Index.SPP.getPartnerGroups();

			return {
				groups : data
			};
		},
		getPartners : function(data){
			var userListCollection = [], letters = {},
				forEach = jQun.forEach, charCodeAt = "".charCodeAt;

			forEach("ABCDEFGHIJKLMNOPQRSTUVWXYZ", function(l){
				letters[l] = -1;
			});

			data = Index.Common.getUsers(30);

			forEach(data, function(user){
				var firstLetter = user.pinyin.substring(0, 1).toUpperCase(),
						
					idx = letters[firstLetter];

				if(idx === -1){
					letters[firstLetter] = userListCollection.length;
					userListCollection.push({
						firstLetter : firstLetter,
						users : [user]
					});

					return;
				}

				userListCollection[idx].users.push(user);
			});

			userListCollection.sort(function(i, n){
				return charCodeAt.call(i.firstLetter) - charCodeAt.call(n.firstLetter);
			});

			return {
				letters : letters,
				userListCollection : userListCollection
			};
		},
		getProjects : function(data){
			data = {
				projects : Index.SPP.getProjects(3),
				pageIndex : 1,
				pageMax : 1,
				pageSize : 15,
				emptyFolders : 3
			};

			data.projects.forEach(function(pro){
				pro.status = 1;
			});

			return data;
		},
		getSchedules : function(data){
			data = Index.SPP.getSchedules(new Date(Date.now()), 2, 2);

			data.forEach(function(d){
				var localDate = new Date(d.time);

				jQun.set(d, {
					localeDateString : localDate.toLocaleDateString(),
					date : localDate.getDate()
				});

				d.projects.forEach(function(pro){
					pro.key = pro.id;
				});
			});

			return {
				schedules : data
			};
		},
		getUser : function(data){
			data = Index.Common.getUser();

			return data;
		},
		myInformation : function(data){
			data = Index.Common.myInformation();

			return data;
		},
		addProject : function(data){
			data = { id : Bao.Test.DummyData.Generate.Number.random(6) };
			
			return data;
		},
		globalSearch : function(data){
			var random = Bao.Test.DummyData.Generate.Number.random,

				projects = Index.SPP.getProjects(random(10)),

				partners = Index.Common.getUsers(random(10)),

				dt = {
					projects : [],
					todo : [],
					comments : [],
					partners : []
				};
				/*
			projects.forEach(function(pro){
				var creator = pro.creator, time = new Date(pro.creationTime);

				this.push({
					key : pro.id,
					title : creator.name,
					desc : pro.title,
					time : [time.getDate(), time.getMonth() + 1, time.getFullYear().toString().substring(2)].join("/"),
					avatar : creator.avatar
				});
			}, dt.projects);
			*/
			partners.forEach(function(user){
				this.push({
					key : user.id,
					title : user.name,
					avatar : user.avatar,
					desc : user.position
				});
			}, dt.partners);

			data = dt;

			return data;
		},
		getSingleProject : function(data){
			data = Index.Secondary.getSingleProject();

			var loginUserId = Bao.Global.loginUser.id,
			
				messages = data.messages, len = messages.length,
				
				color = data.color, singleNumRegx = /^(\d)$/;

			messages.forEach(function(msg){
				var poster = msg.poster, dt = new Date(msg.time),

					desc = "今天", t = this - dt, hours = dt.getHours();
				
				switch(true){
					case t < 0 :
						break;

					case t < 86400000 :
						desc = "昨天";
						break;

					case t < 86400000 * 2 :
						desc = "前天";
						break;

					default :
						desc = dt.getFullYear() + "年" + (dt.getMonth() + 1) + "月" + dt.getDate() + "日";
						break;
				}
				
				// 注意，这里是中文版本，不能用Date.prototype.toLocaleTimeString()，因为很多手机都是英文版本的。
				msg.localTime = [
					desc,
					hours < 12 ? "上午" : "下午",
					// 如果是1位数，转化为2位数
					hours.toString().replace(singleNumRegx, "0$1"),
					":",
					// 如果是1位数，转化为2位数
					dt.getSeconds().toString().replace(singleNumRegx, "0$1")
				].join(" ");

				msg.color = color;
				poster.isLoginUser = poster.id === loginUserId;
			}, new Date(new Date().setHours(0, 0, 0, 0)));

			data.lastMessage = len > 0 ? messages[len - 1].text : "";

			return data;
		},
		getLoginInfo : function(){
			data = {
				count : Bao.Test.DummyData.Generate.Number.random(9999999),
				validationImage : "javascript:void(0);"
			};

			return data;
		},
		login : function(data){
			data = {
				user : Index.Common.getUser(),
				status : 0
			};

			return data;
		}
	}
));

Bao.members(this);
}.call(
	{},
	Bao,
	jQun.JSON,
	jQun.Text,
	// 以下为测试用的类
	Bao.Test.DummyData.Index
));
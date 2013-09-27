﻿(function(Bao, StaticClass, Text, Index){
this.CallServer = (function(Mdls, Wait, Stroage, allHandlers){
	function Models(){};
	Models = new StaticClass(Models);

	Models.properties({
		addProject : function(params){
			Mdls.Project.create({
				project : jQun.except(params, ["users"]),
				project_partners : params.users
			});
		},
		// getLoginInfo : function(){},
		getPartnerGroups : function(_params, complete){
			Mdls.Partner_Groups.read(complete);
		},
		getPartners : function(params, complete){
			Mdls.Partner_Groups.get_group_users(params.groupId, complete);
		},
		// getSchedules : function(){ }
		getSingleProject : function(params, complete){
			Mlds.Project.read(params.id, complete);
		},
		getUser : function(params, complete){
			Mlds.Partner.read(params.id, complete);
		},
		// globalSearch : function(){ }
		// invitation : function(){ }
		// login : function(){	}
		myInformation : function(_params, complete){
			Mlds.User.read(complete);
		},
		// praise : function(){ }
		// register : function(){ }
	});


	function CallServer(){};
	CallServer = new StaticClass(CallServer, "Bao.CallServer");

	CallServer.properties({
		open : function(name, params, _complete, _isUpload){
			var LoadingBar = Wait.LoadingBar;

			LoadingBar.show(_isUpload ? "正在上传数据.." : null);

			Models[name](params, function(data){
				if(name in allHandlers){
					data = allHandlers[name](data);
				}

				LoadingBar.hide();
				_complete(data);
			});
		}
	});

	return CallServer;
}(
	Models,
	Bao.UI.Control.Wait,
	jQun.Stroage,
	// allHandlers
	{
		getPartnerGroups : function(data){
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
			data.projects.forEach(function(pro){
				pro.status = 1;
			});

			return data;
		},
		getSchedules : function(data){
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
		getSingleProject : function(data){
			var loginUserId = Bao.Global.loginUser.id,
			
				messages = data.messages, len = messages.length;

			messages.forEach(function(msg){
				var poster = msg.poster;

				poster.isLoginUser = poster.id === loginUserId;
			}, new Date(new Date().setHours(0, 0, 0, 0)));

			data.lastMessage = len > 0 ? messages[len - 1].text : "";

			return data;
		}
	}
));

Bao.members(this);
}.call(
	{},
	Bao,
	jQun.StaticClass,
	jQun.Text,
	// 以下为测试用的类
	Bao.Test.DummyData.Index
));
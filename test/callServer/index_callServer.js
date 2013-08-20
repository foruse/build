﻿(function(Bao, RequestStorage, JSON, Text, Index){
this.CallServer = (function(CallServer, open, allHandlers){
	CallServer.setResponseType("json");
	// 开始测试
	CallServer.beginTesting();

	// 重写open方法
	CallServer.override({
		open : function(name, params, _complete){
			var cache = RequestStorage["callserver_" + name];

			open.call(CallServer, name, params, function(data, isCache){
				if(isCache){
					_complete(data);
					return;
				}

				// 测试延迟设置
				setTimeout(function(){
					_complete(data);
				}, 1000);
			});
		}
	});

	CallServer.save([
		["getPartnerGroups",			"1.htm",		"", true],
		["getPartners",			new Text("2.htm?groupId={groupId}"),		"", true],
		["getProjects",			"3.htm",		""],
		["getSchedules",			"?last={last}&next={next}",		"", true]
	], allHandlers);

	return CallServer;
}(
	jQun.Ajax,
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
				pageMax : 1
			};

			return data;
		},
		getSchedules : function(data){
			data = Index.SPP.getSchedules(new Date(Date.now()), 2, 2);

			data.forEach(function(dt){
				dt.forEach(function(d){
					var localDate = new Date(d.time);

					jQun.set(d, {
						localDateString : localDate.toLocaleDateString(),
						date : localDate.getDate()
					});
				});
			});

			return {
				schedules : data
			};
		}
	}
));

Bao.members(this);
}.call(
	{},
	Bao,
	jQun.RequestStorage,
	jQun.JSON,
	jQun.Text,
	// 以下为测试用的类
	Bao.Test.DummyData.Index
));
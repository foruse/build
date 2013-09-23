(function(Bao, JSON, Text, Index){
this.CallServer = (function(CallServer, Wait, open, allHandlers){
	CallServer.setResponseType("json");

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

				
				if(!isSuccess){
					LoadingBar.error((_isUpload ? "上传" : "加载") + "数据失败..");
					return;
				}

				LoadingBar.hide();
				_complete(data);
			});
		}
	});

	CallServer.save([
		["addProject",			new Text("url?title={title}&color={color}&desc={desc}&users={users}"), "POST"],
		["getLoginInfo",		"url",										""],
		["getPartnerGroups",			"url",								"", true],
		["getPartners",			new Text("url?groupId={groupId}"),			"", true],
		["getProjects",			"url",										"", true],
		["getSchedules",		new Text("url?last={last}&next={next}"),	"", true],
		["getSingleProject",		new Text("url?id={id}"),				"", true],
		["getUser",				new Text("url?id={id}"),					"", true],
		["globalSearch",		new Text("url?search={search}"),				"", true],
		["invitation",			new Text("url?emails={emails}"),				""],
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
			
				messages = data.messages, len = messages.length, singleNumRegx = /^(\d)$/;

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
	jQun.JSON,
	jQun.Text,
	// 以下为测试用的类
	Bao.Test.DummyData.Index
));
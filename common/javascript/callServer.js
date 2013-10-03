(function(Bao, StaticClass, Text, Index){
this.CallServer = (function(Mdls, Wait, Stroage, allHandlers){
	function Models(){};
	Models = new StaticClass(Models);

	Models.properties({
		addProject : function(params, complete){
			params = jQun.set({ descr : params.desc }, params);
			delete params.desc;

			Mdls.Project.create({
				project : jQun.except(params, ["users"]),
				project_partners : params.users
			}, function(){
				complete();
			});
		},
		getLoginInfo : function(_params, complete){
			Mdls.User.read(function(data){
				Mdls.UsersCounter.read(complete);
			});
		},
		getPartnerGroups : function(_params, complete){
			Mdls.Partner_Groups.read(complete);
		},
		getPartners : function(params, complete){
			Mdls.Partner_Groups.get_group_users(params.groupId, complete);
		},
		// getSchedules : function(){ },
		getSingleProject : function(params, complete){
			Mlds.Project.read(params.id, complete);
		},
		getProjects : function(params, complete){
			Mdls.Project.read(params, complete);
		},
		getUser : function(params, complete){
			Mlds.Partner.read(params.id, complete);
		},
		// globalSearch : function(){ },
		// invitation : function(){ },
		login : function(params, complete){
			Mdls.User.login(params, complete);
		},
		myInformation : function(_params, complete){
			Mlds.User.read(complete);
		},
		getMessages : function(params, complete){
			
		},
		// praise : function(){ },
		// register : function(){ },
		// toDoCompleted : function(){ },
		// sendToDo : function(){ },
		// getToDoInfo : function(){ },
		// getToDoList : function(){ },
		addComment : function(params, complete){
            var _params = {};

            switch (params.type) {
                case "text":
                    _params = {
                        project_id : params.projectId,
                        content : params.text,
                        type : params.type
                    };
                    break;
                case "voice":
                    break;
            }

            Mdls.ProjectChat.send_message(_params, complete);
		}
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

			data.pageMax = data.pageIndex + (data.emptyFolders > 0 ? 0 : 1);

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
		getMessages : function(data){
			var id = Bao.Global.loginUser.id;

			data.forEach(function(dt){
				var poster = dt.poster;

				poster.isLoginUser = poster.id === id;
			});

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
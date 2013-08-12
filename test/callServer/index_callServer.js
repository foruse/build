(function(CallServer, Text, open, allHandlers){
CallServer.beginTesting();
CallServer.setResponseType("json");

CallServer.override({
	open : function(){
		var CallServer = this, args = arguments;

		setTimeout(function(){
			open.apply(CallServer, args);
		}, 2000)
	}
});

CallServer.save([
	["getPartnerGroups",			"",		""],
	["getPartners",			"?tab={tab}",		""],
	["getProjects",			"",		""],
	["getSchedules",			"?last={last}&next={next}",		""]
], allHandlers);

}(
	Bao.CallServer,
	jQun.Text,
	Bao.CallServer.open,
	// allHandlers
	(function(Index){
		return {
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
							localDate : localDate,
							date : localDate.getDate()
						});
					});
				});

				return {
					schedules : data
				};
			}
		};
	}(Bao.Test.DummyData.Index))
));
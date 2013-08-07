(function(CallServer, Text, open, allHandlers){
CallServer.beginTesting();
CallServer.setResponseType("json");

CallServer.override({
	open : function(){
		var CallServer = this, args = arguments;

		setTimeout(function(){
			open.apply(CallServer, args);
		}, 0)
	}
});

CallServer.save([
	["getPartnerGroups",			"",		""],
	["getPartners",			"?tab={tab}",		""],
	["getProjects",			"",		""],
	["getSchedule",			"?last={last}&next={next}",		""]
], allHandlers);

}(
	Bao.CallServer,
	jQun.Text,
	Bao.CallServer.open,
	// allHandlers
	(function(Index){
		return {
			getPartnerGroups : function(){
				var groups = Index.SPP.getPartnerGroups();

				return {
					groups : groups,
					maxPage : Math.ceil(groups.length / 3)
				};
			},
			getPartners : function(data){
				var userListCollection = [], letters = {},
					forEach = jQun.forEach, charCodeAt = "".charCodeAt;

				forEach("ABCDEFGHIJKLMNOPQRSTUVWXYZ", function(l){
					letters[l] = -1;
				});

				forEach(Index.Common.getUsers(30), function(user){
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
				return {
					projects : Index.SPP.getProjects(3),
					pageIndex : 1,
					pageMax : 1
				};
			},
			getSchedule : function(){
				return {
					schedule : Index.SPP.getSchedule(new Date(Date.now()), 2, 2)
				};
			}
		};
	}(Bao.Test.DummyData.Index))
));
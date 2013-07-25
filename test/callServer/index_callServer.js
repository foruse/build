(function(CallServer, Text, allFormatters){
CallServer.beginTesting();
CallServer.setResponseType("json");

CallServer.save([
	["getPartners",			"?tab={tab}",		""],
	["getProjects",			"",		""]
], allFormatters);

}(
	Bao.CallServer,
	jQun.Text,
	// allFormatters
	(function(Index){
		return {
			getPartners : function(){
				var userListCollection = [], letters = {}, charCodeAt = "".charCodeAt;

				jQun.forEach(Index.Common.getUsers(30), function(user){
					var firstLetter = user.pinyin.substring(0, 1).toUpperCase(),
						
						idx = letters[firstLetter];

					if(idx === undefined){
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
					userListCollection : userListCollection
				};
			},
			getProjects : function(data){
				return {
					projects : Index.SPP.getProjects(50)
				};
			}
		};
	}(Bao.Test.DummyData.Index))
));
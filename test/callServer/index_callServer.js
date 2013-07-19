(function(CallServer, Text, allFormatters){
CallServer.beginTesting();
CallServer.setResponseType("json");

CallServer.save([
	["getProjects",			"",		""]
], allFormatters);

}(
	Bao.CallServer,
	jQun.Text,
	// allFormatters
	{
		getProjects : function(data){
			return Bao.Test.DummyData.Index.SPP.getProjects(20);
		}
	}
));
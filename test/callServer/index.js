(function(CallServer, Text, allFormatters){
CallServer.setResponseType("json");

CallServer.save([
	["getProjects",			null,		""]
], allFormatters);

}(
	Bao.CallServer,
	jQun.Text,
	// allFormatters
	{
		getTutorials : function(data){
			return Bao.Test.DummyData.Index.SPP.getProjects(20);
		}
	}
));
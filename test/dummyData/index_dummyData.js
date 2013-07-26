(function(DummyData, StaticClass){
var Common,

	Index = DummyData.Index,
	
	Generate = DummyData.Generate,
	
	Number = Generate.Number,
	
	String = Generate.String;

this.Common = Common = (function(){
	function Common(){};
	Common = new StaticClass(null, "Bao.Test.DummyData.Common");

	Common.properties({
		getUser : function(){
			var name = String.random(5), firstLetter = name.substring(0, 1);

			return {
				id : Number.id(),
				name : name,
				pinyin : firstLetter.match(/[A-Za-z]/) ? firstLetter : isNaN(firstLetter - 0) ? "z" : "a", // 这里只返回拼音首字母
				avatar : "../../test/image/avatar/" + Number.random(16) + ".jpg"
			};
		},
		getUsers : function(_len){
			var users = [];

			if(_len == undefined){
				_len = Number.random(100);
			}

			for(var i = 0;i < _len;i++){
				users.push(this.getUser());
			}

			return users;
		}
	});

	return Common;
}());

this.SPP = (function(){
	function SPP(){};
	SPP = new StaticClass(null, "Bao.Test.DummyData.Test");

	SPP.properties({
		getProjects : function(_len){
			var projects = [];

			if(_len == undefined){
				_len = Number.random(30);
			}

			for(var i = 0;i < _len;i++){
				projects.push({
					id : Number.id(),
					isImportant : i % 3 === 0,
					title : String.random(),
					users : Common.getUsers(Number.random(20)),
					lastMessage : String.random(),
					unread : Number.random(2) > 1 ? 0 : Number.random()
				});
			}

			return projects;
		}
	});

	return SPP;
}());

Index.members(this);
}.call(
	{},
	Bao.Test.DummyData,
	jQun.StaticClass
));
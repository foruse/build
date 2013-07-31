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
		getPartnerGroups : function(){
			var groups = [], length = Number.random(15);

			for(var i = 0;i < length;i++){
				groups.push({
					name : String.random(6),
					id : Number.random(10000)
				});
			}

			return groups;
		},
		getPartners : function(name){
			return {
				partners : Common.getUsers(),
				letter : ["a", "b", "c"]
			};
		},
		getProjects : function(_len){
			var projects = [];

			if(_len == undefined){
				_len = Number.random(30);
			}

			for(var i = 0;i < _len;i++){
				projects.push({
					id : Number.id(),
					importantLevel : Number.random(3),
					title : String.random(),
					users : Common.getUsers(Number.random(20)),
					lastMessage : String.random(),
					unread : Number.random(2) > 1 ? 0 : Number.random()
				});
			}

			return projects;
		},
		getSchedule : function(date, last, next){
			var schedule = [], beginDate = new Date(date.getTime());

			beginDate.setDate(beginDate.getDate() - (beginDate.getDay() + last * 0));

			for(var i = 0, j = next + last + 1;i < j;i++){
				var scd = [];

				for(var n = 0;n < 7;n++){
					scd.push({
						date : beginDate.setDate(beginDate.getDate() + 1),
						count : Number.random(10)
					});
				}
				schedule.push(scd);
			}

			return schedule;
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
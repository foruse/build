(function(StaticClass){
return;
this.Browser = (function(names){
	function Browser(){
		var userAgent = navigator.userAgent;

		names.every(function(name){
			if(userAgent.indexOf(name) > -1){
				this.agent = name;
				return false;
			}

			return true;
		}, this);
	};
	Browser = new StaticClass(Browser, "jQun.Browser");

	return Browser;
}(
	["Android", "SymbianOS", "Windows Phone", "iPhone", "iPad", "iPod"]
));

jQun.defineProperties(jQun, this);

}.call(
	{},
	jQun.StaticClass
));
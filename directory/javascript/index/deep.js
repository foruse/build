(function(Deep, NonstaticClass, StaticClass, PagePanel, CallServer){
this.Account = (function(LoadingBar){
	function Account(selector, contentHtml){
		var account = this;

		this.innerHTML = contentHtml.render();

		CallServer.open("myInformation", null, function(info){
			account.innerHTML = contentHtml.render(info);
		});
	};
	Account = new NonstaticClass(Account, "Bao.Page.Index.Deep.Account", PagePanel.prototype);

	Account.override({
		title : "我的账户"
	});

	return Account.constructor;
}(
	Bao.UI.Control.Wait.LoadingBar
));

Deep.members(this);
}.call(
	{},
	Bao.Page.Index.Deep,
	jQun.NonstaticClass,
	jQun.StaticClass,
	Bao.API.DOM.PagePanel,
	Bao.CallServer
));
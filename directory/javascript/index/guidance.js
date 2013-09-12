(function(Guidance, NonstaticClass, Panel, PagePanel){
this.Login = (function(){
	function Login(selector){};
	Login = new NonstaticClass(Login, "Bao.Page.Index.Guidance.Login", PagePanel.prototype);

	return Login.constructor;
}());

this.Self = (function(HTML){
	function Header(selector, headerHtml){
		this.find(">ul").innerHTML = headerHtml.render();
	};
	Header = new NonstaticClass(Header, "Bao.Page.Index.Guidance.Header", Panel.prototype);

	function Self(){
		new Header.constructor("#guidance_header", new HTML("guidance_header_html", true));
	};
	Self = new NonstaticClass(Self, "Bao.Page.Index.Guidance.Self", Panel.prototype);

	return Self.constructor;
}(
	jQun.HTML
));

Guidance.members(this);
}.call(
	{},
	Bao.Page.Index.Guidance,
	jQun.NonstaticClass,
	Bao.API.DOM.Panel,
	Bao.API.DOM.PagePanel
));
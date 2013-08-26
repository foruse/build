(function(Wait, NonstaticClass, Panel, HTML){
this.LoadingBar = (function(Timer, html){
	function LoadingBar(panelEl, _timeout, _errorText){
		///	<summary>
		///	加载类。
		///	</summary>
		/// <param name="panelEl" type="jQun.HTMLElementList">需要加入加载条的容器</param>
		this.assign({
			errorText : _errorText ? _errorText : this.errorText,
			timer : new Timer(_timeout || 30000)
		});

		this.combine(html.create());
		this.hide();
	};
	LoadingBar = new NonstaticClass(LoadingBar, "Bao.UI.Others.Wait.LoadingBar", Panel.prototype);

	LoadingBar.properties({
		clearText : function(){
			///	<summary>
			///	清除文字。
			///	</summary>
			this.text("");
		},
		error : function(str){
			///	<summary>
			///	显示加载错误信息。
			///	</summary>
			/// <param name="str" type="string">错误信息文本。</param>
			this.text(str, "error");
		},
		errorText : "加载数据超时，请重新加载！",
		nomore : false,
		text : function(str, _type){
			///	<summary>
			///	显示加载信息。
			///	</summary>
			/// <param name="str" type="string">信息文本。</param>
			/// <param name="_type" type="string">信息类型。</param>
			this.find(">span").innerHTML = str;
			this.set("type", _type || "normal", "attr");
		},
		timer : undefined,
		warn : function(str){
			///	<summary>
			///	警告信息。
			///	</summary>
			/// <param name="str" type="string">警告信息文本。</param>
			this.text(str, "warn");
		}
	});

	LoadingBar.override({
		hide : function(){
			this.isLoading = false;
			this.clearText();
			this.parentClass().hide.call(this);
			this.timer.stop();
		},
		show : function(){
			this.isLoading = true;
			this.text("", "loading");
			this.parentClass().show.call(this);
			
			this.timer.start(function(){
				this.error(this.errorText);
			}.bind(this));
		}
	});

	return LoadingBar.constructor;
}(
	Bao.API.Management.Timer,
	// html
	new HTML([
		'<div class="loadingBar" type="normal">',
			'<span></span>',
		'</div>'
	].join(""))
));

Wait.members(this);
}.call(
	{},
	Bao.UI.Control.Wait,
	jQun.NonstaticClass,
	Bao.API.DOM.Panel,
	jQun.HTML
));
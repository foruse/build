(function(Wait, NonstaticClass, HTMLElementList, HTML){
this.LoadingBar = (function(Timer, html){
	function LoadingBar(panelEl, _timeout, _errorText){
		///	<summary>
		///	加载类。
		///	</summary>
		/// <params name="panelEl" type="jQun.HTMLElementList">对应的元素</params>
		this.assign({
			errorText : _errorText ? _errorText : this.errorText,
			timer : new Timer(_timeout || 30000)
		});

		this.combine(html.create());
		this.hide();
	};
	LoadingBar = new NonstaticClass(LoadingBar, "Bao.UI.Others.Wait.LoadingBar", HTMLElementList.prototype);

	LoadingBar.properties({
		clear : function(){
			///	<summary>
			///	清除文字。
			///	</summary>
			this.text("");
		},
		error : function(str){
			///	<summary>
			///	显示加载错误信息。
			///	</summary>
			/// <params name="str" type="string">错误信息文本。</params>
			this.text(str, "error");
		},
		errorText : "加载数据超时，请重新加载！",
		isLoading : false,
		nomore : false,
		text : function(str, _type){
			///	<summary>
			///	显示加载信息。
			///	</summary>
			/// <params name="str" type="string">信息文本。</params>
			/// <params name="_type" type="string">信息类型。</params>
			this.find(">span").innerHTML = str;
			this.set("type", _type || "normal", "attr");
		},
		timer : undefined,
		warn : function(str){
			///	<summary>
			///	警告信息。
			///	</summary>
			/// <params name="str" type="string">警告信息文本。</params>
			this.text(str, "warn");
		}
	});

	LoadingBar.override({
		hide : function(){
			this.isLoading = false;
			this.clear();
			this.getParentClass().hide.call(this);
			this.timer.stop();
		},
		show : function(){
			this.isLoading = true;
			this.text("", "loading");
			this.getParentClass().show.call(this);
			
			this.timer.start(function(){
				this.error(this.errorText);
			}.bind(this));
		}
	});

	return LoadingBar.constructor;
}(
	Bao.API.Manager.Timer,
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
	jQun.HTMLElementList,
	jQun.HTML
));
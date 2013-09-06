(function(Deep, NonstaticClass, StaticClass, PagePanel, CallServer){
this.Account = (function(LoadingBar, Global, ValidationList){
	function Account(selector, contentHtml){
		var account = this, accountClassList = account.classList,

			validationList = new ValidationList(),

			titleBar = Global.titleBar;

		// 渲染空数据
		this.innerHTML = contentHtml.render({
			name : "",
			company : "",
			email : "",
			position : "",
			phoneNum : "",
			companyAdress : "",
			password : ""
		});

		// 监听事件
		this.attach({
			beforeshow : function(){
				var editButtonEl = titleBar.find('button[action="editAccount"]');

				editButtonEl.onuserclick = function(){
					var footerEl = account.find(">footer");

					// 如果点击了编辑按钮
					if(editButtonEl.get("action", "attr") === "editAccount"){
						// 所有input变为可以输入
						account.find("input").del("readonly", "attr");
						// 编辑按钮变成提交按钮
						editButtonEl.set("action", "submit account", "attr");
						// 修改标题栏的标题
						titleBar.resetTitle("修改账户");
						footerEl.show();
						return;
					}

					if(!validationList.validate())
						return;

					editButtonEl.set("action", "editAccount", "attr");
					// 所有input变为只读
					account.find("input").set("readonly", "", "attr");
					// 修改标题栏的标题
					titleBar.resetTitle("我的账户");
					footerEl.hide();
				};
			},
			userclick : function(e){
				var targetEl = jQun(e.target);

				if(targetEl.between(">footer button", this).length > 0){
					var footerClassList = account.find(">footer").classList;

					if(footerClassList.contains("editable")){
						targetEl.innerHTML = "修改密码";
						footerClassList.remove("editable");
						return;
					}

					targetEl.innerHTML = "取消修改";
					footerClassList.add("editable");
				}
			}
		});

		// 访问服务器
		CallServer.open("myInformation", null, function(info){
			account.innerHTML = contentHtml.render(info);

			// 验证信息
			account.find("dl").forEach(function(parent){
				var parentEl = jQun(parent),

					inputEl = parentEl.find("input"), vtype = inputEl.get("vtype", "attr");

				if(!vtype){
					return;
				}

				validationList.addValidation(parentEl, function(el, Validation){
					if(vtype === "rePwd"){
						return inputEl.value === account.find('dl[desc="editPwd"] input').value;
					}

					return Validation.result(inputEl.value, vtype);
				});
			});
		});
	};
	Account = new NonstaticClass(Account, "Bao.Page.Index.Deep.Account", PagePanel.prototype);

	Account.override({
		title : "我的账户",
		tools : [
			{ urlname : "javascript:void(0);", action : "editAccount" }
		]
	});

	return Account.constructor;
}(
	Bao.UI.Control.Wait.LoadingBar,
	Bao.Global,
	Bao.API.DOM.ValidationList
));

this.QRCode = (function(){
	function QRCode(selector, contentHtml){
		var qrCode = this;

		CallServer.open("myInformation", null, function(data){
			qrCode.innerHTML = contentHtml.render(data);
		});
	};
	QRCode = new NonstaticClass(QRCode, "Bao.Page.Index.Deep.QRCode", PagePanel.prototype);

	QRCode.override({
		title : "我的二维码"
	});

	return QRCode.constructor;
}());

this.AboutBaoPiQi = (function(){
	function AboutBaoPiQi(selector){ };
	AboutBaoPiQi = new NonstaticClass(AboutBaoPiQi, "Bao.Page.Index.Deep.AboutBaoPiQi", PagePanel.prototype);

	AboutBaoPiQi.override({
		title : "关于暴脾气"
	});

	return AboutBaoPiQi.constructor;
}());

Deep.members(this);
}.call(
	{},
	Bao.Page.Index.Deep,
	jQun.NonstaticClass,
	jQun.StaticClass,
	Bao.API.DOM.PagePanel,
	Bao.CallServer
));
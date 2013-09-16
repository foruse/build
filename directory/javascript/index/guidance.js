(function(Guidance, NonstaticClass, Panel, PagePanel, CallServer, Event){
this.LoginInfoManagement = (function(ValidationList, loginEvent, registerEvent){
	function LoginInfoManagement(selector){
		var infoManagement = this, validationList = new ValidationList();

		this.assign({
			loginBtn : this.find("button:first-child"),
			registerBtn : this.find("button:last-child"),
			validationList : validationList
		});

		// 验证
		this.find("input").forEach(function(input, i){
			validationList.addValidation(jQun(input), function(el, Validation){
				var desc = el.get("desc", "attr");

				if(desc === "repwd"){
					if(el.value !== infoManagement.find('input[desc="pwd"]').value)
						return false;
				}

				return Validation.result(el.value, el.get("vtype", "attr"));
			});
		});

		// 登录和注册按钮的事件
		this.attach({
			userclick : function(e){
				var targetEl = jQun(e.target);

				if(targetEl.between("button", this).length > 0){
					var htmlStr = targetEl.innerHTML;

					// 如果点击的是 登录 按钮
					if(htmlStr === "登录"){
						validationList[1].validate();
						validationList[2].validate();
						loginEvent.setEventAttrs({
							email : infoManagement.find('input[desc="email"]').value,
							password : infoManagement.find('input[desc="pwd"]').value
						});
						loginEvent.trigger(targetEl[0]);
						return;
					}

					// 如果点击的是 返回登录 按钮
					if(htmlStr === "返回登录"){
						infoManagement.showLogin();
						return;
					}

					// 如果点击的是 注册账号 按钮
					if(htmlStr === "注册账号"){
						infoManagement.showRegister();
						return;
					}

					if(!validationList.validate())
						return;
					
					registerEvent.setEventAttrs({
						email : infoManagement.find('input[desc="email"]').value,
						name : infoManagement.find('input[desc="name"]').value,
						password : infoManagement.find('input[desc="pwd"]').value
					});
					registerEvent.trigger(targetEl[0]);
				}
			}
		});
	};
	LoginInfoManagement = new NonstaticClass(LoginInfoManagement, null, Panel.prototype);

	LoginInfoManagement.properties({
		loginBtn : undefined,
		registerBtn : undefined,
		showInfoErrorByIndex : function(i){
			this.validationList[i].showError();
		},
		showLogin : function(){
			this.classList.remove("register");
			this.loginBtn.innerHTML = "登录";
			this.registerBtn.innerHTML = "注册账号";
		},
		showRegister : function(){
			this.classList.add("register");
			this.loginBtn.innerHTML = "返回登录";
			this.registerBtn.innerHTML = "立即注册";
		},
		validationList : undefined
	});

	return LoginInfoManagement.constructor;
}(
	Bao.API.DOM.ValidationList,
	// loginEvent
	new Event("login"),
	// registerEvent
	new Event("register")
));

this.Login = (function(OverflowPanel, LoginInfoManagement, Global){
	function Login(selector){
		var login = this,
			
			// 初始化登录信息管理
			loginInfoManagement = new LoginInfoManagement(this.find(">section"), this);

		this.assign({
			loginInfoManagement : loginInfoManagement
		});

		loginInfoManagement.attach({
			login : function(e){
				login.login();
			},
			register : function(e){
				login.register(e.eamil, e.name, e.pwd);
			}
		});

		new OverflowPanel(this[0]);
		this.getInfo();

		loginInfoManagement.showRegister();
		this.register("1","2","3");
	};
	Login = new NonstaticClass(Login, "Bao.Page.Index.Guidance.Login", PagePanel.prototype);

	Login.properties({
		getInfo : function(){
			var login = this;

			CallServer.open("getLoginInfo", null, function(data){
				login.find(">header>span").innerHTML = data.count.toLocaleString();
			});
		},
		login : function(name, pwd){
			CallServer.open("login", {
				name : name,
				pwd : pwd
			}, function(data){
				// 如果后台验证有错误
				if(data.status === -1){
					loginInfoManagement.showInfoErrorByIndex(data.error.idx);
					return;
				}

				Global.history.go("createFirstProject");
			});
		},
		loginInfoManagement : undefined,
		register : function(email, name, pwd){
			var loginInfoManagement = this.loginInfoManagement;
			
			CallServer.open("register", {
				name : name,
				email : email,
				pwd : pwd
			}, function(data){
				// 如果后台验证有错误
				if(data.status === -1){
					loginInfoManagement.showInfoErrorByIndex(data.error.idx);
					return;
				}

				loginInfoManagement.showLogin();
			}, true);
		}
	});

	Login.override({
		showTitleBar : false
	});

	return Login.constructor;
}(
	Bao.API.DOM.OverflowPanel,
	this.LoginInfoManagement,
	Bao.Global
));

this.Self = (function(){
	function Self(){
		
	};
	Self = new NonstaticClass(Self, "Bao.Page.Index.Guidance.Self", Panel.prototype);

	return Self.constructor;
}());

Guidance.members(this);
}.call(
	{},
	Bao.Page.Index.Guidance,
	jQun.NonstaticClass,
	Bao.API.DOM.Panel,
	Bao.API.DOM.PagePanel,
	Bao.CallServer,
	jQun.Event
));
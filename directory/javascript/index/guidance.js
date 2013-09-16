(function(Guidance, NonstaticClass, Panel, PagePanel, CallServer, Event, ValidationList, Global){
this.LoginInfoManagement = (function(loginEvent, registerEvent){
	function LoginInfoManagement(selector){
		///	<summary>
		///	登录信息管理。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>
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
			///	<summary>
			///	通过input的索引显示信息错误。
			///	</summary>
			/// <param name="i" type="number">错误信息的input索引</param>
			this.validationList[i].showError();
		},
		showLogin : function(){
			///	<summary>
			///	显示登陆。
			///	</summary>
			this.classList.remove("register");
			this.loginBtn.innerHTML = "登录";
			this.registerBtn.innerHTML = "注册账号";
		},
		showRegister : function(){
			///	<summary>
			///	显示注册。
			///	</summary>
			this.classList.add("register");
			this.loginBtn.innerHTML = "返回登录";
			this.registerBtn.innerHTML = "立即注册";
		},
		validationList : undefined
	});

	return LoginInfoManagement.constructor;
}(
	// loginEvent
	new Event("login"),
	// registerEvent
	new Event("register")
));

this.Login = (function(OverflowPanel, LoginInfoManagement){
	function Login(selector){
		///	<summary>
		///	登陆页。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>

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
	};
	Login = new NonstaticClass(Login, "Bao.Page.Index.Guidance.Login", PagePanel.prototype);

	Login.properties({
		getInfo : function(){
			///	<summary>
			///	获取登录信息。
			///	</summary>
			var login = this;

			CallServer.open("getLoginInfo", null, function(data){
				login.find(">header>span").innerHTML = data.count.toLocaleString();
			});
		},
		login : function(email, pwd){
			///	<summary>
			///	登录。
			///	</summary>
			/// <param name="email" type="string">用户邮箱</param>
			/// <param name="pwd" type="string">用户密码</param>
			CallServer.open("login", {
				email : email,
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
			///	<summary>
			///	注册。
			///	</summary>
			/// <param name="email" type="string">用户邮箱</param>
			/// <param name="name" type="string">用户姓名</param>
			/// <param name="pwd" type="string">用户密码</param>
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
	this.LoginInfoManagement
));

this.CreateFirstProject = (function(){
	function CreateFirstProject(selector){
		///	<summary>
		///	创建第一个项目页。
		///	</summary>
		/// <param name="selector" type="string">对应元素选择器</param>
		var createFirstProject = this,
		
			validationList = new ValidationList(),
			
			namePanel = this.find("section input").parent(),

			colorPanel = this.find("section aside").parent();

		// 添加验证：标题
		validationList.addValidation(namePanel, function(namePanel, Validation){
			return Validation.result(namePanel.find("input").value, "notEmpty");
		});

		// 添加验证：颜色
		validationList.addValidation(colorPanel, function(colorPanel, Validation){
			return colorPanel.find("button.selected").length > 0;
		});

		this.attach({
			userclick : function(e, targetEl){
				// 如果点击的是颜色按钮
				if(targetEl.between("aside>button:not(.selected)", this).length > 0){
					createFirstProject.find("aside>button.selected").classList.remove("selected");
					targetEl.classList.add("selected");
					return;
				}

				// 如果点击的是提交按钮
				if(targetEl.between("footer>button", this).length > 0){
					// 如果验证不通过，则return
					if(!validationList.validate())
						return;

					CallServer.open("addProject", {
						title : namePanel.find("input").value,
						color : createFirstProject.find("aside>button.selected").get("colormark", "attr"),
						desc : createFirstProject.find("li:last-child>textarea").innerHTML,
						user : []
					}, function(data){
						Global.history.go("invitation");
					});
				}
			}
		});
	};
	CreateFirstProject = new NonstaticClass(CreateFirstProject, "Bao.Page.Index.Guidance.CreateFirstProject", PagePanel.prototype);

	CreateFirstProject.override({
		showTitleBar : false
	});

	return CreateFirstProject.constructor;
}());

this.Self = (function(){
	function Self(){ };
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
	jQun.Event,
	Bao.API.DOM.ValidationList,
	Bao.Global
));
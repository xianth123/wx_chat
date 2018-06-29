/*
 * My97 DatePicker 4.6
 * SITE: http://dp.my97.net
 * BLOG: http://my97.cnblogs.com
 * MAIL: smallcarrot@163.com
 */
var $dp, WdatePicker;

/********************************************************************************
 * 增加系统级变量：
 * 		isPersianCalender——如果isPersianCalender="1"，则所有的my97控件的调用都转换变成伊朗历调用。注意，参数的位置必须在WdatePicker.js的前面
 * my97调用增加两个可选参数：
 * 		noPlugin——如果noPlugin="1"，则强制控件为my97模式（即使系统设置了isPersianCalender="1"）。
 * 		isPersian——如果isPersian="1"，则强制控件为伊朗历模式。
 *********************************************************************************/
var isPersian = (typeof(isPersianCalender )=="undefined")?false:isPersianCalender == "1";

(function() {
	var _ = {
		$wdate : true,
		$dpPath : "",
		$crossFrame : true,
		doubleCalendar : false,
		position : {},
		lang : "auto",
		skin : "default",
		dateFmt : "yyyy-MM-dd",
		realDateFmt : "yyyy-MM-dd",
		realTimeFmt : "HH:mm:ss",
		realFullFmt : "%Date %Time",
		minDate : "1900-01-01 00:00:00",
		maxDate : "2099-12-31 23:59:59",
		startDate : "",
		alwaysUseStartDate : false,
		yearOffset : 1911,
		firstDayOfWeek : 0,
		isShowWeek : false,
		highLineWeekDay : true,
		isShowClear : true,
		isShowToday : true,
		isShowOthers : true,
		readOnly : false,
		errDealMode : 0,
		autoPickDate : null,
		qsEnabled : true,
		specialDates : null,
		specialDays : null,
		disabledDates : null,
		disabledDays : null,
		opposite : false,
		onpicking : null,
		onpicked : null,
		onclearing : null,
		oncleared : null,
		ychanging : null,
		ychanged : null,
		Mchanging : null,
		Mchanged : null,
		dchanging : null,
		dchanged : null,
		Hchanging : null,
		Hchanged : null,
		mchanging : null,
		mchanged : null,
		schanging : null,
		schanged : null,
		eCont : null,
		vel : null,
		errMsg : "",
		quickSel : [],
		has : {}
	};
	WdatePicker = U;
	var X = window, O = "document", J = "documentElement", C = "getElementsByTagName", V, A, T, I, b;
	switch (navigator.appName) {
	case "Microsoft Internet Explorer":
		T = true;
		break;
	case "Opera":
		b = true;
		break;
	default:
		I = true;
		break;
	}
	A = L();
	if (_.$wdate)
		M(A + "skin/WdatePicker.css");
	V = X;
	if (_.$crossFrame) {
		try {
			while (V.parent[O] != V[O]
					&& V.parent[O][C]("frameset").length == 0)
				V = V.parent;
		} catch (P) {
		}
	}
	if (!V.$dp)
		V.$dp = {
			ff : I,
			ie : T,
			opera : b,
			el : null,
			win : X,
			status : 0,
			defMinDate : _.minDate,
			defMaxDate : _.maxDate,
			flatCfgs : []
		};
	B();
	if ($dp.status == 0)
		Z(X, function() {
			U(null, true);
		});
	if (!X[O].docMD) {
		E(X[O], "onmousedown", D);
		X[O].docMD = true;
	}
	if (!V[O].docMD) {
		E(V[O], "onmousedown", D);
		V[O].docMD = true;
	}
	E(X, "onunload", function() {
		if ($dp.dd)
			Q($dp.dd, "none");
	});
	function B() {
		V.$dp = V.$dp || {};
		obj = {
			$ : function($) {
				return (typeof $ == "string") ? this.win[O].getElementById($)
						: $;
			},
			$D : function($, _) {
				return this.$DV(this.$($).value, _);
			},
			$DV : function(_, $) {
				if (_ != "") {
					this.dt = $dp.cal.splitDate(_, $dp.cal.dateFmt);
					if ($)
						for ( var A in $) {
							if (this.dt[A] === undefined)
								this.errMsg = "invalid property:" + A;
							this.dt[A] += $[A];
						}
					if (this.dt.refresh())
						return this.dt;
				}
				return "";
			},
			show : function() {
				Q(this.dd, "block");
			},
			hide : function() {
				Q(this.dd, "none");
			},
			attachEvent : E
		};
		for ( var $ in obj)
			V.$dp[$] = obj[$];
		$dp = V.$dp;
	}
	function E(A, $, _) {
		if (T)
			A.attachEvent($, _);
		else {
			var B = $.replace(/on/, "");
			_._ieEmuEventHandler = function($) {
				return _($);
			};
			A.addEventListener(B, _._ieEmuEventHandler, false);
		}
	}
	function L() {
		var _, A, $ = X[O][C]("script");
		for ( var B = 0; B < $.length; B++) {
			_ = $[B].src.substring(0, $[B].src.toLowerCase().indexOf(
					"wdatepicker.js"));
			A = _.lastIndexOf("/");
			if (A > 0)
				_ = _.substring(0, A + 1);
			if (_)
				break;
		}
		return _;
	}
	function F(F) {
		var E, C;
		if (F.substring(0, 1) != "/" && F.indexOf("://") == -1) {
			E = V.location.href;
			C = location.href;
			if (E.indexOf("?") > -1)
				E = E.substring(0, E.indexOf("?"));
			if (C.indexOf("?") > -1)
				C = C.substring(0, C.indexOf("?"));
			var G, I, $ = "", D = "", A = "", J, H, B = "";
			for (J = 0; J < Math.max(E.length, C.length); J++) {
				G = E.charAt(J).toLowerCase();
				I = C.charAt(J).toLowerCase();
				if (G == I) {
					if (G == "/")
						H = J;
				} else {
					$ = E.substring(H + 1, E.length);
					$ = $.substring(0, $.lastIndexOf("/"));
					D = C.substring(H + 1, C.length);
					D = D.substring(0, D.lastIndexOf("/"));
					break;
				}
			}
			if ($ != "")
				for (J = 0; J < $.split("/").length; J++)
					B += "../";
			if (D != "")
				B += D + "/";
			F = E.substring(0, E.lastIndexOf("/") + 1) + B + F;
		}
		_.$dpPath = F;
	}
	function M(A, $, B) {
		var D = X[O][C]("HEAD").item(0), _ = X[O].createElement("link");
		if (D) {
			_.href = A;
			_.rel = "stylesheet";
			_.type = "text/css";
			if ($)
				_.title = $;
			if (B)
				_.charset = B;
			D.appendChild(_);
		}
	}
	function Z($, _) {
		E($, "onload", _);
	}
	function G($) {
		$ = $ || V;
		var A = 0, _ = 0;
		while ($ != V) {
			var D = $.parent[O][C]("iframe");
			for ( var F = 0; F < D.length; F++) {
				try {
					if (D[F].contentWindow == $) {
						var E = W(D[F]);
						A += E.left;
						_ += E.top;
						break;
					}
				} catch (B) {
				}
			}
			$ = $.parent;
		}
		return {
			"leftM" : A,
			"topM" : _
		};
	}
	function W(E) {
		if (T)
			return E.getBoundingClientRect();
		else {
			var A = {
				ROOT_TAG : /^body|html$/i,
				OP_SCROLL : /^(?:inline|table-row)$/i
			}, G = null, _ = E.offsetTop, F = E.offsetLeft, D = E.offsetWidth, B = E.offsetHeight, C = E.offsetParent;
			if (C != E)
				while (C) {
					F += C.offsetLeft;
					_ += C.offsetTop;
					if (C.tagName.toLowerCase() == "body")
						G = C.ownerDocument.defaultView;
					C = C.offsetParent;
				}
			C = E.parentNode;
			while (C.tagName && !A.ROOT_TAG.test(C.tagName)) {
				if (C.scrollTop || C.scrollLeft)
					if (!A.OP_SCROLL.test(Q(C)))
						if (!b || C.style.overflow !== "visible") {
							F -= C.scrollLeft;
							_ -= C.scrollTop;
						}
				C = C.parentNode;
			}
			var $ = a(G);
			F -= $.left;
			_ -= $.top;
			D += F;
			B += _;
			return {
				"left" : F,
				"top" : _,
				"right" : D,
				"bottom" : B
			};
		}
	}
	function N($) {
		$ = $ || V;
		var _ = $[O];
		_ = _[J] && _[J].clientHeight
				&& _[J].clientHeight <= _.body.clientHeight ? _[J] : _.body;
		return {
			"width" : _.clientWidth,
			"height" : _.clientHeight
		};
	}
	function a($) {
		$ = $ || V;
		var B = $[O], A = B[J], _ = B.body;
		B = (A && A.scrollTop != null && (A.scrollTop > _.scrollLeft || A.scrollLeft > _.scrollLeft)) ? A
				: _;
		return {
			"top" : B.scrollTop,
			"left" : B.scrollLeft
		};
	}
	function D($) {
		src = $ ? ($.srcElement || $.target) : null;
		if ($dp && $dp.cal && !$dp.eCont && $dp.dd && Q($dp.dd) == "block"
				&& src != $dp.el)
			$dp.cal.close();
	}
	function Y() {
		$dp.status = 2;
		H();
	}
	function H() {
		if ($dp.flatCfgs.length > 0) {
			var $ = $dp.flatCfgs.shift();
			$.el = {
				innerHTML : ""
			};
			$.autoPickDate = true;
			$.qsEnabled = false;
			K($);
		}
	}
	var R, $;
	function U(E, _) {
		$dp.win = X;
		B();
		E = E || {};
		if (_) {
			if (!D()) {
				$ = $ || setInterval(function() {
					if (V[O].readyState == "complete")
						clearInterval($);
					U(null, true);
				}, 50);
				return
			}
			if ($dp.status == 0) {
				$dp.status = 1;
				K( {
					el : {
						innerHTML : ""
					}
				}, true);
			} else{
				return
			}
		} else if (E.eCont) {
			E.eCont = $dp.$(E.eCont);
			$dp.flatCfgs.push(E);
			if ($dp.status == 2)
				H();
		} else {
			var eventC = A();
			var  srcEl = eventC.srcElement || eventC.target;
			
			/************************
			 *  伊朗历
			 ***********************/
			var noPlugin = E.noPlugin || "0"; //是否支持扩展（默认支持），如果传1则任何情况下都不调用扩展
			if(noPlugin != "1"){
				if(isPersian){
					if(srcEl){
						var persianEl,gregorianEl;
						if(srcEl.isPersian == "1"){ //判断点击的是否是伊朗历input
							persianEl = srcEl;
							gregorianEl = persianEl.srcEl;
						}else{ 
							//生成一个伊朗历输入框、隐藏原输入框
							gregorianEl = srcEl;
							//persianEl = document.createElement('<INPUT name="'+ srcEl.name+"Persian" +'"/>'); 
							persianEl = document.createElement('input');
							persianEl.name = srcEl.name+"Persian";
							persianEl.id = srcEl.id+"Persian";
							persianEl.isPersian = "1";
							persianEl.srcEl = srcEl;
							for(var key in gregorianEl){ //复制原input的其他属性
								try{
									if(key.toLowerCase() == "name" || key.toLowerCase() == "id" 
										|| key.toLowerCase() == "height" || key.toLowerCase() == "width"
											|| key.toLowerCase() == "dlmsattrs") {
										continue;
									}
									persianEl[key] = gregorianEl[key];
								}catch(e){}
							}
							if(parseInt(gregorianEl.value.substring(0,4),10)>2010){ //初始时间是公历时间 
							 	persianEl.value = P$dp.utils.calendarToPersianForString(gregorianEl.value);
							}else{//初始时间是伊朗时间 
								gregorianEl.value = P$dp.utils.persianToGregorian(gregorianEl.value);
							}
							srcEl.parentNode.insertBefore(persianEl , srcEl );
							srcEl.style.display = "none";
							//关联srcEl的值变化实时反映到persianEl
							if("\v"=="v") {  //ie
								srcEl.onpropertychange = srcElChange; 
							}else{ 
								srcEl.addEventListener("input",srcElChange,false); 
							}
							function srcElChange(){
								if(gregorianEl.value.length>3){
									try{
										var year = parseInt(gregorianEl.value.substring(0,4));
										if(year>1000){
											if(year>2010){
												if(gregorianEl.value.length==7 && persianEl.value!="") return;//yyyy-MM格式的数据，则不进行转换
												persianEl.value = P$dp.utils.calendarToPersianForString(gregorianEl.value);
											}else persianEl.value = gregorianEl.value;
										}
									}catch(e){}
								}else{
									persianEl.value = gregorianEl.value;
								}
							}
						}
						/************************
						 *  月份选择
						 ***********************/
						var monthStartDayEl = document.getElementById(gregorianEl.name+"Start");
						var monthEndDayEl = document.getElementById(gregorianEl.name+"End");
						if((!monthStartDayEl || !monthEndDayEl)
								&&E.dateFmt && E.dateFmt=="yyyy-MM"){ //如果是月份选择，则生成月份起始日期值（公历）的隐藏输入框
							if(!document.getElementById(gregorianEl.name+"Start")){
								monthStartDayEl = document.createElement('input');
								monthStartDayEl.name = gregorianEl.name+"Start";
								monthStartDayEl.id = gregorianEl.id+"Start";
								monthStartDayEl.style.display = "none";
								gregorianEl.parentNode.insertBefore(monthStartDayEl , gregorianEl );
							}
							if(!document.getElementById(gregorianEl.name+"End")){
								monthEndDayEl = document.createElement('input');
								monthEndDayEl.name = gregorianEl.name+"End";
								monthEndDayEl.id = gregorianEl.id+"End";
								monthEndDayEl.style.display = "none";
								gregorianEl.parentNode.insertBefore(monthEndDayEl , gregorianEl );
							}
						}
						/************************
						 *  月份选择 end
						 ***********************/
						PdatePicker(persianEl ,E , function(selDate, selGreDate , monthStartDay , monthEndDay){ //选中的伊朗历日期、对应的公历日期
							gregorianEl.value = selGreDate;
							if(monthStartDayEl) monthStartDayEl.value = monthStartDay;
							if(monthEndDayEl) monthEndDayEl.value = monthEndDay;
						});
					}
					return ;
				}
			}
			/************************
			 *  伊朗历 END
			 ***********************/
			if ($dp.status == 0) {
				U(null, true);
				return
			}
			if ($dp.status != 2)
				return;
			var C = A();
			if (C) {
				$dp.srcEl = C.srcElement || C.target;
				C.cancelBubble = true;
			}
			E.el = $dp.$(E.el || $dp.srcEl);
			if (!E.el
					|| E.el.disabled
					|| (E.el == $dp.el && Q($dp.dd) != "none" && $dp.dd.style.left != "-1970px"))
				return;
			
			/************************
			 *  月份选择
			 ***********************/
			var gregorianEl = $dp.srcEl;
			var monthStartDayEl = document.getElementById(gregorianEl.name+"Start");
			var monthEndDayEl = document.getElementById(gregorianEl.name+"End");
			if((!monthStartDayEl || !monthEndDayEl)
					&&E.dateFmt && E.dateFmt=="yyyy-MM"){ //如果是月份选择，则生成月份起始日期值（公历）的隐藏输入框
				if(!document.getElementById(gregorianEl.name+"Start")){
					monthStartDayEl = document.createElement('input');
					monthStartDayEl.name = gregorianEl.name+"Start";
					monthStartDayEl.id = gregorianEl.id+"Start";
					monthStartDayEl.style.display = "none";
					gregorianEl.parentNode.insertBefore(monthStartDayEl , gregorianEl );
				}
				if(!document.getElementById(gregorianEl.name+"End")){
					monthEndDayEl = document.createElement('input');
					monthEndDayEl.name = gregorianEl.name+"End";
					monthEndDayEl.id = gregorianEl.id+"End";
					monthEndDayEl.style.display = "none";
					gregorianEl.parentNode.insertBefore(monthEndDayEl , gregorianEl );
				}
			}
			E.onpicked = function(dp){
				var monthStartDayEl = document.getElementById(gregorianEl.name+"Start");
				var monthEndDayEl = document.getElementById(gregorianEl.name+"End");
				if(monthStartDayEl && monthEndDayEl && E.dateFmt && E.dateFmt=="yyyy-MM"){
					var sd_separator = "-";
					var year = $dp.cal.getP('y');
					var month = $dp.cal.getP('M');
					if(this.value != $dp.cal.getDateStr()){
						var tempMonthStr = this.value.split(sd_separator);
						year = tempMonthStr[0];
						month = tempMonthStr[1];
					}
					
					var monthStartDay = year +sd_separator+month+ sd_separator+"01";
					var nextYear = (parseInt(month,10)+1>12)?(parseInt(year,10)+1):year;
					var nextMonth = (parseInt(month,10)+1>12)?1:(parseInt(month,10)+1);
					if (parseInt(nextMonth,10)<10)nextMonth = "0" + nextMonth;
					var monthEndDay = nextYear +sd_separator+nextMonth+sd_separator +"01";
					
					monthStartDayEl.value = monthStartDay;
					monthEndDayEl.value = monthEndDay;
				}
			};
			/************************
			 *  月份选择 end
			 ***********************/
			K(E);
		}
		function D() {
			if (T && V != X && V[O].readyState != "complete")
				return false;
			return true;
		}
		function A() {
			if (I) {
				func = A.caller;
				while (func != null) {
					var $ = func.arguments[0];
					if ($ && ($ + "").indexOf("Event") >= 0)
						return $;
					func = func.caller;
				}
				return null;
			}
			return event;
		}
	}
	function S(_, $) {
		return _.currentStyle ? _.currentStyle[$] : document.defaultView
				.getComputedStyle(_, false)[$];
	}
	function Q(_, $) {
		if (_)
			if ($ != null){
				_.style.display = $;
			}else{
				return S(_, "display");
			}
	}
	function K(H, $) {
		for ( var D in _)
			if (D.substring(0, 1) != "$")
				$dp[D] = _[D];
		for (D in H)
			if ($dp[D] !== undefined)
				$dp[D] = H[D];
		var E = $dp.el ? $dp.el.nodeName : "INPUT";
		if ($ || $dp.eCont
				|| new RegExp(/input|textarea|div|span|p|a/ig).test(E)){
			$dp.elProp = E == "INPUT" ? "value" : "innerHTML";
		}else{
			return;
		}
		if ($dp.lang == "auto"){
			$dp.lang = T ? navigator.browserLanguage.toLowerCase()
					: navigator.language.toLowerCase();
		}
		if (!$dp.dd
				|| $dp.eCont
				|| ($dp.lang && $dp.realLang && $dp.realLang.name != $dp.lang
						&& $dp.getLangIndex && $dp.getLangIndex($dp.lang) >= 0)) {
			if ($dp.dd && !$dp.eCont)
				V[O].body.removeChild($dp.dd);
			if (_.$dpPath == "")
				F(A);
			var B = "<iframe src=\""
					+ _.$dpPath
					+ "My97DatePicker.htm\" frameborder=\"0\" border=\"0\" scrolling=\"no\"></iframe>";
			if ($dp.eCont) {
				$dp.eCont.innerHTML = B;
				Z($dp.eCont.childNodes[0], Y);
			} else {
				$dp.dd = V[O].createElement("DIV");
				$dp.dd.style.cssText = "position:absolute;z-index:19700";
				$dp.dd.innerHTML = B;
				V[O].body.insertBefore($dp.dd, V[O].body.firstChild);
				Z($dp.dd.childNodes[0], Y);
				if ($)
					$dp.dd.style.left = $dp.dd.style.top = "-1970px";
				else {
					$dp.show();
					C();
				}
			}
		} else if ($dp.cal) {
			$dp.show();
			$dp.cal.init();
			if (!$dp.eCont)
				C();
		}
		function C() {
			var F = $dp.position.left, B = $dp.position.top, C = $dp.el;
			if (C != $dp.srcEl && (Q(C) == "none" || C.type == "hidden"))
				C = $dp.srcEl;
			var H = W(C), $ = G(X), D = N(V), A = a(V), E = $dp.dd.offsetHeight, _ = $dp.dd.offsetWidth;
			if (isNaN(B)) {
				if (B == "above"
						|| (B != "under" && (($.topM + H.bottom + E > D.height) && ($.topM
								+ H.top - E > 0)))){
					B = A.top + $.topM + H.top - E - 3;
				}else{
					B = A.top + $.topM + H.bottom;
				}
				B += T ? -1 : 1;
			} else{
				B += A.top + $.topM;
			}
			if (isNaN(F)){
				F = A.left + Math.min($.leftM + H.left, D.width - _ - 5)
				- (T ? 2 : 0);
			}else{
				F += A.left + $.leftM;
			}
			$dp.dd.style.top = B + "px";
			$dp.dd.style.left = F + "px";
		}
	}
})();
<!--
/**
 * 伊朗历日历控件
 */
var P$dp,PdatePicker;
Ext.onReady(function() {
	/**
	 * UI初始化
	 */
	sd_body_init();
});
	/**
	 * 国际化部分
	 */
	var $PersianCalenderResource = {
			empty:"clear",
			ok:"OK"
	}
	/**
	 * 常量
	 */
	var JULIAN_EPOCH_MILLIS = -210866803200000;
	var ONE_DAY_MILLIS = 24 * 60* 60 * 1000;
	var EPOCH = 1948321;
	
	/**
	 * 配置项
	 */
	var now = new Date();
	var sd_today = getPersianDay(now.getFullYear(), now.getMonth(), now.getDate());
	var minYear = 1389; //伊朗历，控件支持的最小年份（对应最小公历日期2010-03-21）
	var maxYear = sd_today.year + 10; //伊朗历，控件支持的最大年份，（当期日期加10年）
	var sd_date_start,sd_date_end; //开始日期、结束日期
	var sd_separator="-";
	
	/**
	 * 状态控制
	 */
	var sd_g_object; //触发控件的元素
	var cur_d ; //当前选中的日期
	var callBack;
	var options = {
		dateFmt:'yyyy-MM-dd', //默认是只能选择天
		needTime:false
	};
	var sd_inover=false;
	var sd_afterTime=""; //时间字符串
	P$dp = {};
	/**
	 * 入口函数
	 * @param _pi 触发控件的元素
	 * @param options 配置信息
	 * @param callBack 选中日期后的回调函数
	 * @returns
	 */
	PdatePicker = function(_pi,_options,_callBack){
		var curEvent = GetEvent();
		callBack = _callBack;
		for(name in _options){
			options[name] = _options[name];
		}
		sd_g_object=_pi;
		
		var eP = _pi;
		var t_object = _pi;
		var oldTime=t_object.value; //当前选中日期
		var beforetime="";
		if (oldTime.length>4){
			beforetime=formatPersianDate(parsePersianDate(oldTime,"yyyy-MM-dd HH:mm:ss"), "yyyy-MM-dd");
			sd_afterTime=formatPersianDate(parsePersianDate(oldTime,"yyyy-MM-dd HH:mm:ss"), "HH:mm:ss");
		}
		cur_d=getPersianDay(now.getFullYear(), now.getMonth(), now.getDate());
		if (beforetime.length>9){
			s=beforetime.split(sd_separator);
			cur_d={year:parseInt(s[0]),month:(parseInt(s[1],10)-1),day:parseInt(s[2],10)};
		}
		var d_start = "";
		var d_end = "";
		document.getElementById("cele_date").style.display="";
		document.getElementById("cele_date").style.zIndex=99;
		var s;
		var eT = eP.offsetTop;
		var eH = eP.offsetHeight+eT;
		var dH = document.getElementById("cele_date").style.pixelHeight;
		var sT = document.body.scrollTop;
		var sL = document.body.scrollLeft;
		curEvent.cancelBubble=true;
		var srcEl = curEvent.srcElement||curEvent.target;
		var posX = getElementPos(srcEl.id).x;
		if(!posX){
			posX = curEvent.clientX-curEvent.offsetX+sL-5;
		}
		var posY = getElementPos(srcEl.id).y;
		if(!posY){
			posY = curEvent.clientY-curEvent.offsetY+eH+sT;
		}else{
			posY += 25;
		}
		document.getElementById("cele_date").style.posLeft = posX;
		document.getElementById("cele_date").style.posTop = posY;
		
//		var elRound = getAbsoluteLocation(srcEl);
//		document.getElementById("cele_date").style.offsetWidth = elRound.absoluteLeft;
//		document.getElementById("cele_date").style.offsetHeight = elRound.absoluteTop + (elRound.offsetHeight==0?20:elRound.offsetHeight);
		if (document.getElementById("cele_date").style.posLeft+document.getElementById("cele_date").clientWidth>document.body.clientWidth) 
			document.getElementById("cele_date").style.posLeft+=eP.offsetWidth-document.getElementById("cele_date").clientWidth;
		if (d_start!=""){
		    if (d_start=="today"){
		        sd_date_start=new Date(sd_today.year,sd_today.month,sd_today.day);
		    }else{
		        s=d_start.split(sd_separator);
		        sd_date_start=new Date(s[0],s[1]-1,s[2]);
		    }
		}else{
		    sd_date_start=new Date(1000,1,1);
		}
		
		if (d_end!=""){
		    s=d_end.split(sd_separator);
		    sd_date_end=new Date(s[0],s[1]-1,s[2]);
		}else{
		    sd_date_end=new Date(2000,1,1);
		}
		/**
		 * 时间输入框控制
		 */
		var times = [];
		if(sd_afterTime != "") times = sd_afterTime.split(":");
		document.getElementById("pdpHour").value = times.length>0?times[0]:"00";
		document.getElementById("pdpMinute").value = times.length>1?times[1]:"00";
		document.getElementById("pdpSecond").value = times.length>2?times[2]:"00";
		
		//根据日期格式来控制输入框的显示
		var dfmt = options.dateFmt;
		if(dfmt.length>11 && dfmt.split(" ").length>1){
			var timeFmt = dfmt.split(" ")[1];
			options.timeFmt = timeFmt;
			options.needTime = true;
		}
		if(options.needTime){
			document.getElementById("pdpTime").style.display="block";
			var fmt = options.timeFmt.split(":");
			if(fmt.length>0 && fmt[0] == "HH"){
				document.getElementById("pdpHour").disabled = false;
				if(fmt.length>1 && fmt[1] == "mm"){
					document.getElementById("pdpMinute").disabled = false;
					if(fmt.length>2 && fmt[2] == "ss"){
						document.getElementById("pdpSecond").disabled = false;
					}else{
						document.getElementById("pdpSecond").disabled = true;
					}
				}else{
					document.getElementById("pdpMinute").disabled = true;
					document.getElementById("pdpSecond").disabled = true;
				}
			}else{
				document.getElementById("pdpHour").disabled = true;
				document.getElementById("pdpMinute").disabled = true;
				document.getElementById("pdpSecond").disabled = true;
			}
		}else{
			document.getElementById("pdpTime").style.display="none";
		}
		sd_set_cele_date(cur_d.year,cur_d.month+1);
		document.getElementById("cele_date").style.display="block";
		document.getElementById("cele_date").focus();
	}
	
	/**
	 * 控件HTML生成
	 * @returns
	 */
//	function sd_body_init(){ 
//		document.write("<div class='WdateDiv' name=\"cele_date\" id=\"cele_date\"  style=\"display:none\"    style=\"LEFT: 69px; POSITION: absolute; TOP: 159px;z-index:120;\" onClick=\"event.cancelBubble=true;\" onBlur=\"sd_hilayer()\" onMouseout=\"sd_lostlayerfocus()\"></div>");
//		setTimeout("PdatePicker.sd_init()",1000);  
//		//sd_init();
//	}
	function sd_body_init(){ 
//		var $d = document.createElement("<div class='WdateDiv' name=\"cele_date\" id=\"cele_date\"  style=\"display:none\"    " +
//				"style=\"LEFT: 69px; POSITION: absolute; TOP: 159px;z-index:120;\" " +
//				"onClick=\"event.cancelBubble=true;\" onBlur=\"P$dp.sd_hilayer()\" onMouseout=\"P$dp.sd_lostlayerfocus()\"></div>");
		var $d = document.createElement("div");
		$d.className = "WdateDiv";
		$d.name = "cele_date";
		$d.id = "cele_date";
		$d.style.display = "none";//"display:none;LEFT: 69px; POSITION: absolute; TOP: 159px;z-index:120;";
		$d.style.left = "69px";
		$d.style.position = "absolute";
		$d.style.top = "159px";
		$d.style.zIndex = "120";
		$d.onClick = "event.cancelBubble=true;";
		$d.onBlur = "P$dp.sd_hilayer();";
		$d.onMouseout = "P$dp.sd_lostlayerfocus();";

		var temp_str = "";
//		temp_str = "<div class='WdateDiv' name=\"cele_date\" id=\"cele_date\"  style=\"display:none\"    " +
//				"style=\"LEFT: 69px; POSITION: absolute; TOP: 159px;z-index:120;\" " +
//				"onClick=\"event.cancelBubble=true;\" onBlur=\"P$dp.sd_hilayer()\" onMouseout=\"P$dp.sd_lostlayerfocus()\">";
		var i=0
	     var j=0
	     /*********头部********/
	     temp_str+="<div class='dpTitle'>";
	     //左箭头
	     temp_str+="<div class='navImg NavImgll'><a href='###' onclick='P$dp.sd_change_date(-1,-1)' onmouseover='P$dp.sd_getlayerfocus()'></a></div>";
	     temp_str+="<DIV class='navImg NavImgl'><A href='###' onclick='P$dp.sd_change_date(-1,1)' onmouseover='P$dp.sd_getlayerfocus()'></A></DIV>";
	     //年选择
	     temp_str+="<div style='float:left;'>";
	     temp_str+="<select name=\"cele_date_year\" id=\"cele_date_year\" language=\"javascript\" " +
	     		"onchange=\"P$dp.sd_change_date(this.value,0)\" onmouseover=\"P$dp.sd_getlayerfocus()\" onblur=\"P$dp.sd_getlayerfocus()\" " +
	     		"style=\"font-size: 9pt; border: 1px #666666 outset;width:55px; background-color: #F4F8FB\">"
	     for (i=minYear;i<=maxYear;i++) {
	    	 temp_str+="<OPTION value=\""+i.toString()+"\">"+i.toString()+"</OPTION>";
	     }
	     temp_str+="</select>";
	     temp_str+="</div>";
	     //月选择
	     temp_str+="<div style='float:left;'>";
	     temp_str+="<select name=\"cele_date_month\" id=\"cele_date_month\" language=\"javascript\" " +
	     		"onchange=\"P$dp.sd_change_date(this.value,2)\" onmouseover=\"P$dp.sd_getlayerfocus()\" onblur=\"P$dp.sd_getlayerfocus()\" " +
	     		"style=\"font-size: 9pt; border: 1px #666666 outset;width:40px; background-color: #F4F8FB\">";
	     for (i=1;i<=12;i++) {
	    	 temp_str+="<OPTION value=\""+i.toString()+"\">"+i.toString()+"</OPTION>";
	     }
	     temp_str+="</select>";
	     temp_str+="</div>";
	     //右箭头
	     temp_str+="<DIV class='navImg NavImgrr'><A href='###' onclick='P$dp.sd_change_date(1,-1)' onmouseover='P$dp.sd_getlayerfocus()'></A></DIV>";
		 temp_str+="<DIV class='navImg NavImgr'><A href='###' onclick='P$dp.sd_change_date(1,1)' onmouseover='P$dp.sd_getlayerfocus()'></A></DIV>";
	     
		 temp_str+="</div>";//end dpTitle
		 /*********END 头部********/
		 /*********日期选择Table********/
		 temp_str+="<div>";
	     temp_str+="<table width='100%' class='WdayTable' border='0' cellSpacing='0' cellPadding='0'>";
	     temp_str+=		"<tr class='MTitle'>" +
	     					"<td width=22px>Su</td>" +
	     					"<td width=22px>Mo</td>" +
	 						"<td width=22px>Tu</td>" +
	 						"<td width=22px>We</td>" +
	 						"<td width=22px>Th</td>" +
//	 						"<td width=22px><font color=red>Th</td>" +
	 						"<td width=22px><font color=red>Fr</td>" +
	 						"<td width=22px>Sa</td></font>" +
	 					"</tr>";
	     for (i=1 ;i<=6 ;i++){
	    	 temp_str+="<tr>";
	    	 for(j=1;j<=7;j++){
	    		 temp_str+="<td name=\"c"+i+"_"+j+"\"id=\"c"+i+"_"+j+"\"  language=\"javascript\" onmouseover=\"P$dp.sd_overcolor(this)\" " +
	    		 		"onmouseout=\"P$dp.sd_outcolor(this)\" onclick=\"P$dp.sd_td_click(this)\"></td>"
	    	 }
	    	 temp_str+="</tr>";
	     }
	     temp_str+="</table>";
	     temp_str+="</div>";
	     /*********END 日期选择Table********/
	     /*********时间输入框******/
	     temp_str += '<div id="pdpTime" class="dpTime" onmouseover="P$dp.sd_getlayerfocus()">'
	     				+'<div class="menuSel hhMenu"></div><div class="menuSel mmMenu"></div><div class="menuSel ssMenu"></div>'
	     				+'<table cellspacing=0 cellpadding=0 border=0>'
	     					+'<tr><td rowspan=2>'
	     						+'<span id="pdpTimeStr" class="dpTimeStr"></span>&nbsp;'
	     						+'<input id="pdpHour" class=tB maxlength=2 tabindex=3 onkeyup="P$dp.onlyInt(this)" onafterpaste="P$dp.onlyInt(this)">'
	     						+'<input id="pdpPreMinute" value=":" class=tm readonly>'
	     						+'<input id="pdpMinute" class=tE maxlength=2 tabindex=4 onkeyup="P$dp.onlyInt(this)" onafterpaste="P$dp.onlyInt(this)">'
	     						+'<input id="pdpPreSecond" value=":" class=tm readonly>'
	     						+'<input id="pdpSecond" class=tE maxlength=2 tabindex=5 onkeyup="P$dp.onlyInt(this)" onafterpaste="P$dp.onlyInt(this)">'
	     					+'</td><td><button id="pdpTimeUp" class="dpTimeUp"></button></td></tr>'
	     					+'<tr><td><button id="pdpTimeDown" class="dpTimeDown"></button></td></tr>'
	     				+'</table>'
	     			+'</div>'
	     			//+'<div id="pdpQS" class="dpQS"></div>'
	     			;
	     /*********END 时间输入框********/
	     /*********底部********/
	     temp_str+="<div class='dpControl'>";
	     temp_str+="<div class='clearBtn'><input type='button' tabIndex='6' class='dpButton' onclick=\"P$dp.clear_date()\" onmouseover=\"P$dp.sd_getlayerfocus()\" style='cursor: hand;' value='" + $PersianCalenderResource.empty + "'/></div>";
	     temp_str+="<div class='okBtn'><input type='button' tabIndex='7' class='dpButton' onclick=\"P$dp.ok_date()\" onmouseover=\"P$dp.sd_getlayerfocus()\" style='cursor: hand;' value='" + $PersianCalenderResource.ok + "'/></div>";
	     temp_str+="</div>";
	     /*********END 底部********/
	     temp_str+="<iframe src=\"javascript:false\" width=\"206\" height=\"220\" style=\"position:absolute; visibility:inherit; top:0px; left:0px;z-index:-1; filter='progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)';\"></iframe>";

		temp_str+="</div>";
		 $d.innerHTML = temp_str;
		 document.body.appendChild($d);
	}
	/**
	 * 日期Table鼠标悬浮样式切换
	 * @param obj
	 * @returns
	 */
	function sd_overcolor(obj){
		swapClass(obj);
		sd_getlayerfocus();
	}
	P$dp.sd_overcolor = sd_overcolor;
	function sd_outcolor(obj){
		swapClass(obj);
	}
	P$dp.sd_outcolor = sd_outcolor;
	function swapClass(obj){
		var className = obj.className;
		var nextClassName = obj.nextClassName;
		obj.className = nextClassName;
		obj.nextClassName = className;
	}
	/**
	 * 切换年、月
	 * @param temp 
	 * 		temp的值与mode对应分别是：选中的年、年加1（1）或减1（-1）、月份加1（1）或减1（-1）、选中的月份
	 * @param mode 0-年下拉框选择、-1-年箭头选择、1-月箭头选择、2-月下拉框选择
	 * @returns
	 */
	P$dp.sd_change_date = function sd_change_date(temp,mode){
		var cele_date_year = document.getElementById("cele_date_year");
		var cele_date_month = document.getElementById("cele_date_month");
		var t_month,t_year;
	    if (mode>0){ //月操作
	        if(mode==1){ 
	        	t_month=parseInt(cele_date_month.value,10)+parseInt(temp,10); //箭头操作
	        }else{ 
	        	t_month=parseInt(temp); //下拉框
	        }
	        if (t_month<cele_date_month.options[0].text) {
	            cele_date_month.value=cele_date_month.options[cele_date_month.length-1].text;
	            sd_change_date(parseInt(cele_date_year.value,10)-1,0);
	        }else if (t_month>cele_date_month.options[cele_date_month.length-1].text){
	    		cele_date_month.value=cele_date_month.options[0].text;
	    		sd_change_date(parseInt(cele_date_year.value,10)+1,0);
	        }else{
	        	cele_date_month.value=t_month;
	        	sd_set_cele_date(cele_date_year.value,cele_date_month.value);
	        }
	    }else{
	    	if(mode==0){ //下拉框
	    		t_year=parseInt(temp,10);
	    	}else{ //箭头
	    		t_year=parseInt(cele_date_year.value,10)+parseInt(temp,10); //箭头操作
	    	}
	        if (t_year<parseInt(cele_date_year.options[0].text,10)) { //年超过最小值，则选中最小年的1月
	            cele_date_year.value=cele_date_year.options[0].text;
	            sd_set_cele_date(cele_date_year.value,1);
	        }else if (t_year>parseInt(cele_date_year.options[cele_date_year.length-1].text,10)){//年超过最大值，则选中最大年的12月
	        	cele_date_year.value=cele_date_year.options[cele_date_year.length-1].text;
	        	sd_set_cele_date(cele_date_year.value,12);
	        }else{
	        	cele_date_year.value=t_year;
	        	sd_set_cele_date(cele_date_year.value,cele_date_month.value);
	        }
	    }
	    document.getElementById("cele_date").focus();
	}
	
	/**
	 * 根据年、月生成日期Table数据
	 * @param year
	 * @param month
	 * @returns
	 */
	var class_Wwday={normal:"Wwday",on:"WwdayOn"}; //周末class
	var class_Wday = {normal:"Wday",on:"WdayOn"}; //工作日class
	var class_WotherDay = {normal:"WotherDay",on:"WotherDayOn"}; //非本月的日期class
	var class_Wtoday={normal:"Wtoday"}; //当天class
	var class_Wselday={normal:"Wselday"}; //选中的日期class
	var class_WinvalidDay={normal:"WinvalidDay",on:"WinvalidDayOn"}; //不可选日期class
	
	var selectedDayObj;
	function sd_set_cele_date(year,month){
		selectedDayObj = null;
		var event = GetEvent(sd_set_cele_date);
		event.cancelBubble=true;  //阻止事件上传
	   if (parseInt(year,10) < minYear) { //年超过最小值，则选中最小年的1月
		   year = minYear;
		   month = 1;
	   }else if(parseInt(year,10) > maxYear){
		   year = maxYear;
		   month = 12;
	   }
	   
	   
	   var i,j,p,k
	   var nd= {year:year,month:(month-1),day:1}; //伊朗历当月1号
	   var gregorian = persianToGregorianDate(nd.year+"-"+((nd.month+1)>9?(nd.month+1):"0"+(nd.month+1))+"-"+(nd.day>9?nd.day:"0"+nd.day)); //伊朗历当月1号对应的公历日期
	   document.getElementById("cele_date_year").value=year; //设置年下拉框
	   document.getElementById("cele_date_month").value=month;//设置月下拉框
	   k=gregorian.getDay()-1;//当前星期数-1（如果是星期天则结果为-1）
	   //清空日期table中的内容
	   for (i=1;i<=6;i++){
	      for(j=1;j<=7;j++){
	    	  eval("document.getElementById(\"c"+i+"_"+j+"\").innerHTML=\"\"");
	    	  eval("document.getElementById(\"c"+i+"_"+j+"\").style.cursor=\"hand\"");
	    	  eval("document.getElementById(\"c"+i+"_"+j+"\").className=\"\"");
	    	  eval("document.getElementById(\"c"+i+"_"+j+"\").nextClassName=\"\"");
	      }
	   }

	   var isDate=true;
	   while(month-1==nd.month){ 
		   var dateNum = nd.day;
	       
	      j=(gregorian.getDay() +1);
	      p=parseInt((dateNum+k) / 7)+1;
	      var dayTdId = "c"+p+"_"+j;
	      eval("document.getElementById(\""+dayTdId +"\").innerHTML="+"\""+dateNum+"\"");
	      //无效日期
	      var tempNd = new Date(nd.year,nd.month,nd.day);
	      if (tempNd>sd_date_end && tempNd<sd_date_start){ 
	    	  eval("document.getElementById(\""+dayTdId + "\").className = '" + class_WinvalidDay.normal + "'");
	    	  eval("document.getElementById(\""+dayTdId + "\").nextClassName = '" + class_WinvalidDay.on + "'");
	      }else{
	    	  if(
	    	  //j==5 
	    	  //||
	    	  j==6 
	    	  ){//星期四、星期五（伊朗历的周末）
	    		  eval("document.getElementById(\""+dayTdId + "\").className = '" + class_Wwday.normal + "'");
	    		  eval("document.getElementById(\""+dayTdId + "\").nextClassName = '" + class_Wwday.on + "'");
	    	  }else{
	    		  eval("document.getElementById(\""+dayTdId + "\").className = '" + class_Wday.normal + "'");
	    		  eval("document.getElementById(\""+dayTdId + "\").nextClassName = '" + class_Wwday.on + "'");
	    	  }
	    	  
	      }
	      //当日,
	      if (dateNum==sd_today.day && (month==sd_today.month+1) && year==sd_today.year){
	    	  eval("document.getElementById(\""+dayTdId + "\").className = '" + class_Wtoday.normal + "'");
	      }
	      //当前选中日期
	      if (dateNum==cur_d.day && (month==cur_d.month+1) && year==cur_d.year){
	    	  selectedDayObj = document.getElementById(dayTdId);
	    	  eval("document.getElementById(\""+dayTdId + "\").className = '" + class_Wselday.normal + "'");
	      }
	      var gregorian = new Date(gregorian.valueOf() + 86400000);
	      nd = getPersianDay(gregorian.getFullYear(),gregorian.getMonth(),gregorian.getDate());
		}
	}
	P$dp.sd_set_cele_date = sd_set_cele_date;
	/**
	 * 选中日期
	 * @param t_object
	 * @returns
	 */
	function sd_td_click(t_object){
		var t_d;
		if (parseInt(t_object.innerHTML,10)>=1 && parseInt(t_object.innerHTML,10)<=31 )
		{ 
			t_d=new Date(cele_date_year.value,cele_date_month.value-1,t_object.innerHTML)
			if (t_d<=sd_date_end && t_d>=sd_date_start)
			{
				var year = cele_date_year.value;
				var month = cele_date_month.value;
				var day = t_object.innerHTML;
				if (parseInt(month,10)<10) month = "0" + month;
				if (parseInt(day,10)<10) day = "0" + day;
				var hour = document.getElementById("pdpHour").value;
				var minute = document.getElementById("pdpMinute").value;
				var second = document.getElementById("pdpSecond").value;
				if (parseInt(hour,10)<10) hour = "0" + parseInt(hour,10);
				if (parseInt(minute,10)<10) minute = "0" + parseInt(minute,10);
				if (parseInt(second,10)<10) second = "0" + parseInt(second,10);
				var date = year+sd_separator+month+sd_separator+day;
				var time = " "+hour+":"+minute+":"+second;
				var selDate = formatPersianDate({
					year:year,
					month:month,
					day:day,
					hour:hour,
					minute:minute,
					second:second
				},options.dateFmt);//按照传入格式要求格式化
				var selGreDate =P$dp.utils.formatDate(parseDate(persianToGregorian(date) + time, "yyyy"+sd_separator+"MM"+sd_separator+ "dd HH:mm:ss"),options.dateFmt); //选中日期对应的公历
				sd_g_object.value=selDate;
				document.getElementById("cele_date").style.display="none";
				
				if(options.dateFmt && options.dateFmt=="yyyy-MM"){ //如果是月份选择，则生成月份起始日期值（公历）的隐藏输入框
					var startPersianDay = selDate +sd_separator+ "01";
					var nextYear = (parseInt(month,10)+1>12)?(parseInt(year,10)+1):year;
					var nextMonth = (parseInt(month,10)+1>12)?1:(parseInt(month,10)+1);
					if (parseInt(nextMonth,10)<10)nextMonth = "0" + nextMonth;
					var endPersianDay = nextYear +sd_separator+nextMonth+sd_separator +"01";
					callBack(selDate, selGreDate , persianToGregorian(startPersianDay) , persianToGregorian(endPersianDay));
				}else{
					callBack(selDate, selGreDate);
				}
			};
		}
	}
	P$dp.sd_td_click = sd_td_click;
	/**
	 * OK按钮
	 */
	function ok_date() {
		if(selectedDayObj!=null){
			sd_td_click(selectedDayObj);
		}else{
			document.getElementById("cele_date").style.display="none";
		}
	}
	P$dp.ok_date = ok_date;
	/**
	 * 清空按钮
	 */
	function clear_date() {
		sd_g_object.value="";
		document.getElementById("cele_date").style.display="none";
		callBack("", "");
	}
	P$dp.clear_date = clear_date;
	//鼠标进入控件
	function sd_hilayer()
	{
		if (sd_inover==false)
		{
			var lay=document.getElementById("cele_date");
			lay.style.display="none";
		}
	}
	P$dp.sd_hilayer = sd_hilayer;
	//聚焦的元素为“控制元素”时，则点击这些元素不会关闭控件
	function sd_getlayerfocus() {
		sd_inover=true;
	}
	P$dp.sd_getlayerfocus = sd_getlayerfocus;
	//当鼠标移出控件时，点击可以关闭控件
	function sd_lostlayerfocus(){
		sd_inover=false;
	}
	P$dp.sd_lostlayerfocus = sd_lostlayerfocus;
	//时间输入框只能输入数字
	function onlyInt(obj){
		obj.value=obj.value.replace(/\D/g,'');
	}
	P$dp.onlyInt = onlyInt;
	
	
	function dateEquals(date1,date2) {
		var date1Array = date1.split(sd_separator);
		var date2Array = date2.split(sd_separator);
		
		if ( date1Array[0] != date2Array[0]){
			return false;
		}
			
		
		if (whither0(date1Array[1])*1 != whither0(date2Array[1])*1){
			return false;
		}
		
		if (whither0(date1Array[2])*1 != whither0(date2Array[2])*1){
			return false;
		}
		return true;
	}
	
	function whither0(str) {
		return str.replace("0","");
	}
	
	
	
	/**********************************************************
	 * 以下为工具方法，供控件调用。也可以外部直接使用这些方法
	 ***********************************************************/
	
	/**********************************************************
	函数名称：calendarToPersian
	函数说明：公历转换为波斯历
	传入参数：datetimeValue:需要进行转换的公历日期值（格式yyyy-MM-dd)
	返回：转换后的日历值
	 ***********************************************************/
	P$dp.utils = {};
	function calendarToPersian(datetimeValue){
		var src = datetimeValue;
		var time = "";
		if(src.length<10) return src;
		if(src.length>10){
			datetimeValue = src.substring(0,10);
			time = src.substring(10, src.length);
		}
		var array = new Array();
		array = datetimeValue.split("-");
		var yearValue = array[0]*1;
		var monthValue = array[1]*1;
		var dayValue = array[2]*1;
		monthValue -= 1;
		var persianDate = getPersianDay(yearValue,monthValue,dayValue);
		persianDate.month += 1;
		persianDate.month = persianDate.month.toString().length==1?"0"+persianDate.month:persianDate.month;
		persianDate.day = persianDate.day.toString().length==1?"0"+persianDate.day:persianDate.day;
		return persianDate.year+"-"+persianDate.month+"-"+persianDate.day+time;
	}
	P$dp.utils.calendarToPersian = calendarToPersian;
	/**********************************************************
	函数名称：calendarToPersianForDate
	函数说明：公历转换为波斯历
	传入参数：datetime:需要进行转换的公历日期(Date型)
	返回：转换后的日历(注：转换成Date型时出错，请参考changeStringToDate方法的注释)
	***********************************************************/
	function calendarToPersianForDate(datetime) {
		var date_s = changeDateToString(datetime);
		var persian_s = calendarToPersian(date_s);
		return changeStringToDate(persian_s);
	}
	P$dp.utils.calendarToPersianForDate = calendarToPersianForDate;
	
	/**********************************************************
	函数名称：persianToGregorian
	函数说明：转换波斯历为公历
	传入参数：datetimeValue:需要进行转换的波斯历日期字符串，要求字符串的格式是yyyy-MM-dd HH:mm:ss格式的子集
	返回：转换后的公历字符串
	***********************************************************/
	function persianToGregorian(datetimeValue)
	{
		var len = datetimeValue.length;
		if(len<4) return datetimeValue;
		 var array = new Array();
		// array = datetimeValue.split("-");
		 var persiaYear = datetimeValue.substring(0,4)*1;//Year value
		 var persiaMonth = (len>6?datetimeValue.substring(5,7):"1")*1;//Month value
		 var persiaDay = (len>9?datetimeValue.substring(8,10):"1")*1;//Day value
		 var time = len>10?datetimeValue.substring(10,len):"";
		 
	//	 var persiaYear = array[0]*1;
	//	 var persiaMonth = array[1]*1;
	//	 var persiaDay = array[2]*1;
		 persiaMonth -= 1;
		 
		 var julianDay = setJulianDay(pj(persiaYear > 0 ? persiaYear: persiaYear + 1, persiaMonth, persiaDay));
		 julianDay.month = julianDay.month.toString().length==1?"0"+julianDay.month:julianDay.month;
		 julianDay.day = julianDay.day.toString().length==1?"0"+julianDay.day:julianDay.day;
		 return (julianDay.year+"-"+julianDay.month+"-"+julianDay.day + time).substring(0,len);
	}
	P$dp.utils.persianToGregorian = persianToGregorian;
	/**********************************************************
	函数名称：persianToGregorianForDate
	函数说明：转换波斯历为公历
	传入参数：datetimeValue:需要进行转换的波斯历日期(Date型)
	返回：转换后的日历(Date型)
	***********************************************************/
	function persianToGregorianForDate(datetime) {
		var date_s = changeDateToString(datetime);
		var gregorian_s = persianToGregorian(date_s);
		return changeStringToDate(gregorian_s);
	}
	P$dp.utils.persianToGregorianForDate = persianToGregorianForDate;
	/**
	 * 波斯历字符串（yyyy-MM-dd HH:mm:ss）转换为公历Date类型
	 * @param datetimeValue
	 * @returns
	 */
	function persianToGregorianDate(datetimeValue){
		var gregorian_s = persianToGregorian(datetimeValue);
		return changeStringToDate(gregorian_s);
	}
	/**********************************************************
	函数名称：getPersianDay
	函数说明：根据输入的日期获得Persia日期值
	传入参数：year,month,day（传入的月份需要是真实的月份-1）
	返回：转换后的日历值（返回的月份需要+1才是真实的月份）
	***********************************************************/
	function getPersianDay(year,month,day)
	{
	 var julianDay = getJulianDay(year,month,day);
	 var r = jp(julianDay);
	 var y1 = y(r);
	 var m1 = m(r);
	 var d1 = d(r);
	 y1 = y1 > 0?y1:y1-1;
	 var persiaDate = new Object();
	 persiaDate.year  = y1;
	 persiaDate.month = m1;
	 persiaDate.day = d1;
	 
	 return persiaDate;
	}
	P$dp.utils.getPersianDay = getPersianDay;
	/**
	 * 将公历的日期字符串转换为伊朗历日期字符串。
	 */
	function calendarToPersianForString(srcValue){
		var len = srcValue.length;
		if(len==0) return "";
		var srcDate = parseDate(srcValue,"yyyy-MM-dd HH:mm:ss");
		var persianDate = getPersianDay(srcDate.getFullYear(),srcDate.getMonth(),srcDate.getDate());
		persianDate.month = persianDate.month+1; //返回的月份需要+1才是真实的月份
		persianDate.hour = srcDate.getHours();
		persianDate.minute = srcDate.getMinutes();
		persianDate.second = srcDate.getSeconds();
		persianDate.millisecond = srcDate.getMilliseconds();
		var persianValue = formatPersianDate(persianDate,"yyyy-MM-dd HH:mm:ss");
		return persianValue.substring(0,len);
	}
	P$dp.utils.calendarToPersianForString = calendarToPersianForString;
	/**********************************************************
	函数名称：getJulianDay
	函数说明：根据输入的日期获得公历日期值
	传入参数：year,month,day
	返回：转换后的日历值
	***********************************************************/
	function getJulianDay(year,month,day)
	{
		return div(new Date(year,month,day,8,1,1) - JULIAN_EPOCH_MILLIS, ONE_DAY_MILLIS);
	}
	
	/**********************************************************
	函数名称：setJulianDay
	函数说明：根据输入的日期获得公历日期值
	传入参数：julianDay
	返回：转换后的日历值
	***********************************************************/
	function setJulianDay(julianDay)
	{
	 var current = new Date();
	 var year = current.getFullYear();
	 var month = current.getMonth()+1;
	 var day = current.getDate();
	 
	 var datetimevalue = JULIAN_EPOCH_MILLIS + julianDay * ONE_DAY_MILLIS + mod(new Date(year,month,day,8,1,1) - JULIAN_EPOCH_MILLIS, ONE_DAY_MILLIS);
	 current = new Date(datetimevalue);
	 var julianDate = new Object();
	 julianDate.year  = current.getFullYear();
	 julianDate.month = eval(current.getMonth()+1);
	 julianDate.day = current.getDate();
	 return julianDate;
	}
	
	/**********************************************************
	函数名称：jp
	函数说明：公历转换为波斯历
	传入参数：julianDay
	返回：转换后的日历值
	***********************************************************/
	function jp(j)
	{
	 var a = j - pj(475, 0, 1);
	 var b = div(a, 1029983);
	 var c = mod(a, 1029983);
	 var d = c != 1029982? div(2816 * c + 1031337, 1028522): 2820;
	 var year = 474 + 2820 * b + d;
	 var f = (1 + j) - pj(year, 0, 1);
	 var month = f > 186? Math.ceil((f - 6) / 30) - 1: Math.ceil(f / 31) - 1;
	 
	 var day = j - (pj(year, month, 1) - 1);
	 return (year << 16) | (month << 8) | day;
	}
	
	/**********************************************************
	函数名称：pj
	函数说明：波斯历转换为公历
	传入参数：y,m,d
	返回：转换后的日历值
	***********************************************************/
	function pj(y, m, d)
	{
	 var a = y - 474;
	 var b = mod(a, 2820) + 474;
	 return (EPOCH - 1) + 1029983 * div(a, 2820) + 365 * (b - 1) + div(682 * b - 110, 2816) + (m > 6? 30 * m + 6: 31 * m) + d;
	}
	function div(a,b)
	{
	 return Math.floor(a / b);
	}
	function mod(a,b)
	{
	 return (a - b * Math.floor(a / b));
	}
	function y(r)
	{
	 return r>>16;
	}
	function m(r)
	{
	 return (r & 0xff00) >> 8;
	}
	function d(r)
	{
	 return (r & 0xff);
	}
	
	/**********************************************************
	函数名称：changeDateToString
	函数说明：把Date类型转换成String类型。String型的格式为"yyyy-MM-dd".
	传入参数：date 要被格式化的日期(Date型)
	返回：转换后的日历值(String型)
	***********************************************************/
	function changeDateToString(date) {
		
		var year=date.getFullYear();
		var month=date.getMonth()+1;
		if(month<10)month = '0' + month;
		var day=date.getDate()
		if(day<10)day = '0' + day;
		return year + "-" +month + "-" +day;
	}
	
	/**********************************************************
	函数名称：changeStringToDate
	函数说明：把String类型转换成Date类型。String型的格式为"yyyy-MM-dd".
			请谨慎使用该方法，如果输入的时间是波斯历的时间，有可能会错。比果"1384-2-31"
	传入参数：date 要被格式化的日期值(String型)
	返回：转换后的日历值(Date型)
	***********************************************************/
	function changeStringToDate(date) {
		var array = new Array();
	 	array = date.split("-");
	 	var year=array[0];
	 	var month=array[1]-1;
	 	var day=array[2];
	 	return new Date(year,month,day);
	}
	
	/**
	* 删除左右两端的空格
	*/
	function trim(str)
	{
	     return str.replace(/(^\s*)(\s*$)/g, '');
	}
	/**
	* 删除左边的空格
	*/
	function ltrim(str)
	{
	     return str.replace(/(^\s*)/g,'');
	}
	/**
	* 删除右边的空格
	*/
	function rtrim(str)
	{
	     return str.replace(/(\s*$)/g,'');
	}
	
	/**
	 * 格式化日期
	 * @param date{Date} 待格式化日期对象 
	 * @param format 日期格式,如 yyyy-MM-dd
	 * @returns {String}
	 */
	function formatDate(date , format) // author: meizz
	{ 
	  var o = { 
	    "M+" : date.getMonth()+1, // month
	    "d+" : date.getDate(),    // day
	    "H+" : date.getHours(),   // hour
	    "m+" : date.getMinutes(), // minute
	    "s+" : date.getSeconds(), // second
	    "q+" : Math.floor((date.getMonth()+3)/3),  // quarter
	    "S" : date.getMilliseconds() // millisecond
	  }; 
	  if(/(y+)/.test(format)) format=format.replace(RegExp.$1, 
	    (date.getFullYear()+"").substr(4 - RegExp.$1.length)); 
	  for(var k in o)if(new RegExp("("+ k +")").test(format)) 
	    format = format.replace(RegExp.$1, 
	      RegExp.$1.length==1 ? o[k] : 
	        ("00"+ o[k]).substr((""+ o[k]).length)); 
	  return format; 
	};
	P$dp.utils.formatDate = formatDate;
	/**
	 * 格式化输出伊朗历
	 */
	function formatPersianDate(_date , format) // author: meizz
	{ 
		var date = {
			year:1389,
			month:1,
			day:1,
			hour:00,
			minute:00,
			second:00,
			millisecond:00
		};
		for(name in _date){
			date[name] = _date[name];
		}
	  var o = { 
	    "M+" : date.month, // month
	    "d+" : date.day,    // day
	    "H+" : date.hour,   // hour
	    "m+" : date.minute, // minute
	    "s+" : date.second, // second
	    "q+" : Math.floor((date.month-1+3)/3),  // quarter
	    "S" : date.millisecond // millisecond
	  }; 
	  if(/(y+)/.test(format)) format=format.replace(RegExp.$1, 
	    (date.year+"").substr(4 - RegExp.$1.length)); 
	  for(var k in o)if(new RegExp("("+ k +")").test(format)) 
	    format = format.replace(RegExp.$1, 
	      RegExp.$1.length==1 ? o[k] : 
	        ("00"+ o[k]).substr((""+ o[k]).length)); 
	  return format; 
	};
	P$dp.utils.formatPersianDate = formatPersianDate;
	/**
	 * 根据指定格式解析日期
	 * @param date  日期字符串
	 * @param format 格式字符串
	 * @returns {Date}
	 */
	function parseDate(date,format){
	 var result=new Date();
	 result.setMonth(0);result.setDate(1);
	 if(/(y+)/.test(format)){
		 var year = date.substring(format.indexOf(RegExp.$1),format.indexOf(RegExp.$1)+RegExp.$1.length);
		 result.setFullYear(year==""?1937:year);
	 }
	 if(/(M+)/.test(format)){
		 var month = date.substring(format.indexOf(RegExp.$1),format.indexOf(RegExp.$1)+RegExp.$1.length);
		 result.setMonth(month==""?0:(parseInt(month,10)-1));
	 }
	 if(/(d+)/.test(format)){
		 var day = date.substring(format.indexOf(RegExp.$1),format.indexOf(RegExp.$1)+RegExp.$1.length);
		 result.setDate(day==""?1:day);
	 }
	 if(/(H+)/.test(format)){
		 var hour = date.substring(format.indexOf(RegExp.$1),format.indexOf(RegExp.$1)+RegExp.$1.length);
		 result.setHours(hour==""?0:hour);
	 }
	 if(/(m+)/.test(format)){
		 var minute = date.substring(format.indexOf(RegExp.$1),format.indexOf(RegExp.$1)+RegExp.$1.length);
		 result.setMinutes(minute==""?0:minute);
	 }
	 if(/(s+)/.test(format)){
		 var second = date.substring(format.indexOf(RegExp.$1),format.indexOf(RegExp.$1)+RegExp.$1.length);
		 result.setSeconds(second==""?0:second);
	 }
	 if(/(S+)/.test(format)){
		 var millisecond = date.substring(format.indexOf(RegExp.$1),format.indexOf(RegExp.$1)+RegExp.$1.length);
		 result.setMilliseconds(millisecond==""?0:millisecond);
	 }
	 return result;
	}
	P$dp.utils.parseDate = parseDate;
	/**
	 * 根据指定格式解析伊朗历日期
	 * @param date  日期字符串
	 * @param format 格式字符串
	 * @returns {Date}
	 */
	function parsePersianDate(date,format){
	 var result={};
	 if(/(y+)/.test(format)){
		 var year = date.substring(format.indexOf(RegExp.$1),format.indexOf(RegExp.$1)+RegExp.$1.length);
		 result.year = parseInt((year==""?1937:year),10);
	 }
	 if(/(M+)/.test(format)){
		 var month = date.substring(format.indexOf(RegExp.$1),format.indexOf(RegExp.$1)+RegExp.$1.length);
		 result.month = parseInt((month==""?1:month),10);
	 }
	 if(/(d+)/.test(format)){
		 var day = date.substring(format.indexOf(RegExp.$1),format.indexOf(RegExp.$1)+RegExp.$1.length);
		 result.day = parseInt((day==""?1:day),10);
	 }
	 if(/(H+)/.test(format)){
		 var hour = date.substring(format.indexOf(RegExp.$1),format.indexOf(RegExp.$1)+RegExp.$1.length);
		 result.hour = parseInt((hour==""?0:hour),10);
	 }
	 if(/(m+)/.test(format)){
		 var minute = date.substring(format.indexOf(RegExp.$1),format.indexOf(RegExp.$1)+RegExp.$1.length);
		 result.minute = parseInt((minute==""?0:minute),10);
	 }
	 if(/(s+)/.test(format)){
		 var second = date.substring(format.indexOf(RegExp.$1),format.indexOf(RegExp.$1)+RegExp.$1.length);
		 result.second = parseInt((second==""?0:second),10);
	 }
	 if(/(S+)/.test(format)){
		 var millisecond = date.substring(format.indexOf(RegExp.$1),format.indexOf(RegExp.$1)+RegExp.$1.length);
		 result.millisecond = parseInt((millisecond==""?0:millisecond),10);
	 }
	 return result;
	}
	P$dp.utils.parsePersianDate = parsePersianDate;
	/**
	 * 工具方法GetEvent
	 * 作用：获取当前事件Event
	 */
	function GetEvent(){
		var T,b,I;
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
		if (I) {
			func = GetEvent.caller;
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
	
	function sd_h_cele_date()
	{
		document.getElementById("cele_date").style.display="none";
	}
	
	
	
	
	function sd_getNow(o){
	    var Stamp=new Date();
	    var year = Stamp.getFullYear();
	    var month = Stamp.getMonth()+1;
	    var day = Stamp.getDate();
	    if(month<10){
		month="0"+month;
	    }
	    if(day<10){
		day="0"+day;
	    }
	    o.value=year+sd_separator+month+sd_separator+day;
	}
  
// 说明：用 Javascript 获取指定页面元素的位置   
  
// 整理：http://www.codebit.cn   
  
// 来源：YUI DOM    
  
function getElementPos(elementId) {  
  
    var ua = navigator.userAgent.toLowerCase();       
  
    var isOpera = (ua.indexOf('opera') != -1);       
  
    var isIE = (ua.indexOf('msie') != -1 && !isOpera); // not opera spoof        
  
    var el = document.getElementById(elementId);   
  
          
  
    if(el.parentNode === null || el.style.display == 'none'){ return false; }        
  
    var parent = null;  
  
    var pos = [];     //不定长数组？  
  
    var box;        
  
    if(el.getBoundingClientRect){  //IE       
  
        box = el.getBoundingClientRect();          
  
        var scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);          
  
        var scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);            
  
        return {x:box.left + scrollLeft, y:box.top + scrollTop};       
  
    }else if(document.getBoxObjectFor){   // gecko                  
  
        box = document.getBoxObjectFor(el);                       
  
        var borderLeft = (el.style.borderLeftWidth)?parseInt(el.style.borderLeftWidth):0;           
  
        var borderTop = (el.style.borderTopWidth)?parseInt(el.style.borderTopWidth):0;            
  
        pos = [box.x - borderLeft, box.y - borderTop];       
  
    }else{    // safari & opera       
  
        pos = [el.offsetLeft, el.offsetTop];          
  
        parent = el.offsetParent;           
  
        if (parent != el) {  
  
            while (parent) {                   
  
                pos[0] += parent.offsetLeft;                 
  
                pos[1] += parent.offsetTop;               
  
                parent = parent.offsetParent;              
  
            }  
  
        }           
  
        if (ua.indexOf('opera') != -1  || ( ua.indexOf('safari') != -1 && el.style.position == 'absolute' )){                
  
            pos[0] -= document.body.offsetLeft;               
  
            pos[1] -= document.body.offsetTop;           
  
        }        
  
    }              
  
    if (el.parentNode) {   
  
        parent = el.parentNode;   
  
    } else {   
  
        parent = null;   
  
    }         
  
    while (parent && parent.tagName != 'BODY' && parent.tagName != 'HTML') { // account for any scrolled ancestors          
  
        pos[0] -= parent.scrollLeft;           
  
        pos[1] -= parent.scrollTop;        
  
        if (parent.parentNode) {   
  
            parent = parent.parentNode;   
  
        } else {   
  
            parent = null;   
  
        }       
  
    }       
  
    return {x:pos[0], y:pos[1]};  
  
}  
function getAbsoluteLocation(element) {
	 if ( arguments.length != 1 || element == null ) { return null; } 
	 var offsetTop = element.offsetTop; 
	 var offsetLeft = element.offsetLeft; 
	 var offsetWidth = element.offsetWidth; 
	 var offsetHeight = element.offsetHeight; 
	 while( element = element.offsetParent ) { 
		 offsetTop += element.offsetTop; offsetLeft += element.offsetLeft; 
	 } 
	 return { absoluteTop: offsetTop, absoluteLeft: offsetLeft, offsetWidth: offsetWidth, offsetHeight: offsetHeight };
}
//-->   

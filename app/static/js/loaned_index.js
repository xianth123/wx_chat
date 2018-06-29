$(function(){
    $(".ok").on("click", function(){
	    var str = $(this).parents('tr').data("name");
	    var confirmed = confirm("正常结清?")
	    if (confirmed) {
            $.ajax({
                url: "/loans/update/ok",
                method: "POST",
                data: {lid: str},
                success : function(data){
                    data = JSON.parse(data);
                    alert(data.message);
                    if (data.status == 200){
                        window.location.reload();
                    };
                }
            })
	    } else {
	        return
	    }
    });
    $(".pending").on("click", function(){
	    var str = $(this).parents('tr').data("name");
	    var confirmed = confirm("设置续借?")
	    if (confirmed) {
            $.ajax({
                url: "/loans/update/pending",
                method: "POST",
                data: {lid: str},
                success : function(data){
                    data = JSON.parse(data);
                    alert(data.message);
                    if (data.status == 200){
                        window.location.reload();
                    };
                }
            })
	    } else {
	        return
	    }
    });
    $(".delay").on("click", function(){
	    var str = $(this).parents('tr').data("name");
	    var confirmed = confirm("逾期未还?")
	    if (confirmed) {
            $.ajax({
                url: "/loans/update/delay",
                method: "POST",
                data: {lid: str},
                success : function(data){
                    data = JSON.parse(data);
                    alert(data.message);
                    if (data.status == 200){
                        window.location.reload();
                    };
                }
            })
	    } else {
	        return
	    }
    });
    $(".delay_ok").on("click", function(){
	    var str = $(this).parents('tr').data("name");
	    var confirmed = confirm("逾期还清?")
	    if (confirmed) {
            $.ajax({
                url: "/loans/update/delay_ok",
                method: "POST",
                data: {lid: str},
                success : function(data){
                    data = JSON.parse(data);
                    alert(data.message);
                    if (data.status == 200){
                        window.location.reload();
                    };
                }
            })
	    } else {
	        return
	    }
    });
    $(".channel>span").editable({
        type:'select',
        name:'channel',
        source: [{text: '支付宝', value: '1' },{text: '微信',value: '2'},{text: "转账", value: "3"}],
        pk: function(e) {
            return $(this).parents('tr').data("name");
        },
        emptytext: '[empty]',
        placement: 'left',
        url: "/loans/change",
        success: function(response, value) {
          $(this).removeClass('channel-'+$(this).attr('data-value')).addClass('channel-'+value).attr('data-value', value).attr('style', '');
        }
    });
    $(".repayment>a").editable({
        type:'text',
        name:'repayment',
        tpl: '<input type="number" min=0>',
        pk: function(e) {
            return $(this).parents('tr').data("name");
        },
        emptytext: '[empty]',
        placement: 'left',
        url: "/loans/change",
        success: function(response, value) {
          $(this).attr('data-value', value);
        }
    });

})
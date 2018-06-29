$(function() {
    $(".user_role>span").editable({
        type:'select',
        name:'role_id',
        source: "/admin/roles",
        pk: function(e) {
            return $(this).parents('tr').data("name");
        },
        emptytext: '[role]',
        placement: 'left',
        url: "/admin/change",
        success: function(response, value) {
          $(this).removeClass('role-'+$(this).attr('data-value')).addClass('role-'+value).attr('data-value', value).attr('style', '');
        }
    });
    $(".password>span").editable({
        type:'text',
        name:'password',
        source: "/admin/roles",
        pk: function(e) {
            return $(this).parents('tr').data("name");
        },
        emptytext: '[empty]',
        placement: 'left',
        url: "/admin/change",
        validate: function(value) {
            if($.trim(value) == '') {
            return 'This field is required';
            }
        },
        success: function(response, value) {
            $(this).text('点击修改');
        }
    });

    $(".deleted>span").editable({
        type:'select',
        name:'deleted',
        source: [{text: '删除', value: '1' },{text: '正常',value:
        '0'}],
        pk: function(e) {
            return $(this).parents('tr').data("name");
        },
        emptytext: '[empty]',
        placement: 'left',
        url: "/admin/change",
        success: function(response, value) {
          $(this).removeClass('deleted-'+$(this).attr('data-value')).addClass('deleted-'+value).attr('data-value', value).attr('style', '');
        }
    });
})

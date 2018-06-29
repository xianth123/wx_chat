$(function() {
    $(".comment>span").editable({
        type:'textarea',
        name:'comment',
        source: "/loans/change",
        pk: function(e) {
            return $(this).parents('tr').data("name");
        },
        emptytext: '[empty]',
        placement: 'left',
        url: "/loans/change",
        validate: function(value) {
            if($.trim(value) == '') {
            return '不能为空';
            }
        },
        success: function(response, value) {
            $(this).text(value);
        }
    });
})
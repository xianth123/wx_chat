$(function(){
    $('.datetime').on("focus", function(){
        WdatePicker({ dateFmt: 'yyyy-MM-dd HH:mm:ss', lang:'zh-cn',skin:'twoer', onpicked: function () { this.onchange(); }})
    })

 })
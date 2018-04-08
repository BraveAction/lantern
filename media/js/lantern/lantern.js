function getHiddenValue(id){
    var nextTrIndex = $("tbody").children().length+1;
    var checked = nextTrIndex % 2 == 0 ? "" : ' checked = "checked" '
     $("tbody").append('<tr>'+
             '<td>追加列表项</td>'+
             '<td>追加列表项</td>'+
             '<td><div class="switch">'+
                  '<label>'+
                         '<input type="checkbox" '+
                         checked+
                         'disabled="disabled"/>'+
                                '<span class="lever" ></span>'+
                   '</label>'+
                  '</div>'+
             '</td>'+
             ' <td>追加列表项</td></tr>');
   // $.get("/lantern/clear",function(data){
   //     alert(data);
   // });
}

jQuery(function($){ 
    $.datepicker.regional['zh-CN'] = {
        clearText: '清除', 
        clearStatus: '清除已选日期', 
        closeText: '关闭', 
        closeStatus: '不改变当前选择', 
        prevText: '< 上月', 
        prevStatus: '显示上月', 
        prevBigText: '<<', 
        prevBigStatus: '显示上一年', 
        nextText: '下月>', 
        nextStatus: '显示下月', 
        nextBigText: '>>', 
        nextBigStatus: '显示下一年', 
        currentText: '今天', 
        currentStatus: '显示本月', 
        monthNames: ['一月','二月','三月','四月','五月','六月', '七月','八月','九月','十月','十一月','十二月'], 
        monthNamesShort: ['一月','二月','三月','四月','五月','六月', '七月','八月','九月','十月','十一月','十二月'], 
        monthStatus: '选择月份', 
        yearStatus: '选择年份', 
        weekHeader: '周', 
        weekStatus: '年内周次', 
        dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'], 
        dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'], 
        dayNamesMin: ['日','一','二','三','四','五','六'], 
        dayStatus: '设置 DD 为一周起始', 
        dateStatus: '选择 m月 d日, DD', 
        dateFormat: 'yy-mm-dd', 
        firstDay: 1, 
        initStatus: '请选择日期', 
        isRTL: false}; 
    $.datepicker.setDefaults($.datepicker.regional['zh-CN']); 

    $(".button-collapse").sideNav();

    switchLight();
});


function switchLight(){
    var lightbulb=$("#light-bulb");				
    var lightbulb2=$("#light-bulb2");			

    if(lanternState==1){
        lightbulb.removeClass("off");
    }else if(lanternState==0){
        lightbulb.addClass("off");
    }
    lightbulb2.stop().fadeTo(750,lanternState);
}


function insert(){
    var trs=$("#lanternScheduler").children("tr");
    //remove default nothing <tr>
    if(trs.length==1){
        var defNothingTrName=$(trs).first().attr("name");
        if(defNothingTrName == "defNothingTr"){
            $("#lanternScheduler").empty();
        }
    }
    var nextTrIndex = $("#lanternScheduler").children().length+1;
    var nextDatepickerId="datepicker"+nextTrIndex;
    var nextTimepickerId="timepicker"+nextTrIndex;
    var checked = nextTrIndex % 2 == 0 ? ' value = "0"  ' : ' checked = "checked" value = "1" ';
    var insertHtml= '<tr style="display:none;" id="newTr'+nextTrIndex+'">'+
        '<td>'+
        '<input type="cron-new" id="'+nextDatepickerId+'" class="cron" name="date">'+
        '</td>'+
        '<td>'+
        '<input id="'+nextTimepickerId+'" type="cron-new" class="cron form-control" name="time" data-placement="bottom" data-align="top" data-autoclose="true">'+
        '</td>'+
        '<td>'+
        '<div class="switch">'+
        '<label>'+
        '<input type="checkbox" '+ checked+ 'disabled="disabled" name="flag"/>'+
        '<span class="lever" ></span>'+
        '</label>'+
        '</div>'+
        '</td>'+
        '<td>'+
        '?</td>'+
        '<td>'+ 
        '<div style="text-align:center;height:auto;">'+
        '   <i name="saveIcon" class="material-icons">done</i>'+
        '   <a href="javascript:;" class="action-close" onclick="deleteNotInsertRecord(this)">'+
        '       <i class="material-icons">close</i>'+
        '</a>'+
        '</div>'+
        '</td>'+
        '</tr>';
    $("tbody").append(insertHtml);
    $("#newTr"+nextTrIndex).fadeIn(750);
    
    $("#"+nextDatepickerId).datepicker();
    $("#"+nextDatepickerId).change(function(){
        updateSaveIcon(this,nextTrIndex,nextTimepickerId);
    });
    $("#"+nextTimepickerId).clockpicker();
    $("#"+nextTimepickerId).change(function(){
        updateSaveIcon(this,nextTrIndex,nextDatepickerId);
        });
    

    //$("#"+nextDatepickerId).focus();
}

//修改时间日期级联时，触发保存按钮
function updateSaveIcon(input,trIndex,cascadeId){

        var saveI=$(input).parent().siblings().last().children("div").children().first();
        var inputVal=$(input).val();
        var cascadeVal=$("#"+cascadeId).val();
        if( inputVal != '' && cascadeVal != ''){
            //$(saveI).replaceWith('<a href="javascript:;" class="action-save" onclick="save(this)"><i class="material-icons">done</i></a>');
            $(saveI).wrap('<a href="javascript:;" class="action-save" onclick="save(this,'+ trIndex +')"></a>');
        }else{
            $(saveI).replaceWith('<i class="material-icons">done</i>');
        }

}

function deleteLanternTaskById(node,lanternTaskId){
    $.ajax({
        url:"/lantern/delete?lanternTaskId="+lanternTaskId,
        type:"get",
        dataType:"json",
        timeout:"3000",
        success:function(result,status,xhr){
            if(result.message){
                Materialize.toast('删除成功！', 3000, 'rounded');
                var tr=$(node).parents("tr").first();
                $(tr).fadeOut(350,function(){
                    $(this).remove();
                });
            }else{
                Materialize.toast('删除失败！', 3000, 'rounded');
            }
        }
    });
}


function save(node,trIndex){
    console.log(trIndex);
    var trnode=$(node).parents("tr");
    var inputs=$(trnode).find("input");
    var param='{"dateTime":{';
    $(inputs).each(function(){
        param+='"'+$(this).attr("name")+'":"'+$(this).val()+'"';
        if(inputs.length-1 > inputs.index(this)){
            param+=",";
        }else{
        param+="}}";
        }
    });
    
    $.ajax({
        url:"/lantern/addnew",
        type:"post",
        data:param,
        dataType:"json",
        contentType:'application/json;charset=utf-8',
        timeout:"3000",
        success:function(result,status,xhr){ if(result.id != null){
                Materialize.toast('保存成功！', 3000, 'rounded');
                console.log(result.id);
                triggerEditMode($(node,false));
            }else{
                Materialize.toast('保存失败！', 3000, 'rounded');
            console.log(result);
            }
        }
    });
}

function deleteNotInsertRecord(node){

    var tr=$(node).parents("tr").first();
    $(tr).fadeOut(350,function(){
        $(this).remove();
    });

}

function onChange(saveDiv,oldValue,newValue){

    var saveI=$(saveDiv).children().first();
    if(oldValue==newValue){
        $(saveI).replaceWith('<i class="material-icons">done</i>');
    }else{
        $(saveI).replaceWith('<a href="javascript:;" class="action-save" onclick="save(this)"><i class="material-icons">done</i></a>');
    }
}

function triggerEditMode(node,flag){
    var trs=$("#lanternScheduler").children('tr');
    var selTaskIndex=trs.index($(node).parents('tr').first());
    var editDiv;
    var saveDiv;
    var selTaskDatepickerId="datepicker"+selTaskIndex;
    var selTaskTimepickerId="timepicker"+selTaskIndex;

    if(flag){
        editDiv=$(node).parent();
        saveDiv=$(editDiv).next();
        editDiv.hide();
        saveDiv.show();

        var editDivParent=$(node).parent().parent();
        var tdDate=$(editDivParent).siblings("td[name='taskDate']")[0];
        var tdTime=$(editDivParent).siblings("td[name='taskTime']")[0];
        var tdDateText=$(tdDate).text();
        var tdTimeText=$(tdTime).text();

        var editTaskDateHtml='<input type="cron-edit" id="'+selTaskDatepickerId+'" class="cron" value="'+tdDateText+'">';
        var editTaskTimeHtml='<input id="'+selTaskTimepickerId+'" type="cron-edit" class="cron form-control" data-placement="bottom" data-align="top" data-autoclose="true" value="'+tdTimeText+'" >';

        $(tdDate).html(editTaskDateHtml); 
        $(tdTime).html(editTaskTimeHtml); 
        $("#"+selTaskDatepickerId).datepicker({"defaultDate":tdDateText});
        $("#"+selTaskDatepickerId).change(function(){
            var newDateValue=$(this).val();
            onChange(saveDiv,tdDateText,newDateValue);
        });
        $("#"+selTaskTimepickerId).clockpicker();
        $("#"+selTaskTimepickerId).change(function(){
            var newTimeValue=$(this).val();
            onChange(saveDiv,tdTimeText,newTimeValue);
        });
    }else{
        saveDiv=$(node).parent();
        editDiv=$(saveDiv).prev();
        saveDiv.hide();
        editDiv.show();

        var saveDivParent=$(node).parent().parent();
        var tdDate=$(saveDivParent).siblings("td[name='taskDate']")[0];
        var tdTime=$(saveDivParent).siblings("td[name='taskTime']")[0];
        var inputDate=$(tdDate).children("#"+selTaskDatepickerId);
        var inputTime=$(tdTime).children("#"+selTaskTimepickerId);
        var inputDateValue=$(inputDate).val();
        var inputTimeValue=$(inputTime).val();

        $(tdDate).html(inputDateValue); 
        $(tdTime).html(inputTimeValue); 
    }
}


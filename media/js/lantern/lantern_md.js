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


//初始化灯饰状态
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
    //移除默认的无数据<tr>
    if(trs.length==1){
        var defNothingTrName=$(trs).first().attr("name");
        if(defNothingTrName == "defNothingTr"){
            $("#lanternScheduler").empty();
        }
    }
    
    var nextTrIndex = $("#lanternScheduler").children().length+1;//新任务的id
    var nextDatepickerId="datepicker"+nextTrIndex;//新任务日期组件id
    var nextTimepickerId="timepicker"+nextTrIndex;//新任务时间组件id
    var checked = nextTrIndex % 2 == 0 ? ' value = "0"  ' : ' checked = "checked" value = "1" ';//新任务开关组件状态
    var defaultModeHtml=
        '<div style=";text-align:center;;height:auto;display:none;">'+ 
        '<a href="javascript:;"  class="action-edit" onclick="triggerEditMode(this,true)">'+
        '<i class="material-icons">edit</i>'+
        '</a>'+
        '<a href="javascript:;" class="action-delete" onclick="deleteLanternTaskById(this,1)">'+
        '<i class="material-icons">delete</i>'+
        '</a>'+
        '</div>';
    var editModeHtml=
        '<div style="text-align:center;height:auto;">'+
        '   <i name="saveIcon" class="material-icons">done</i>'+
        '   <a href="javascript:;" class="action-close" onclick="deleteNotInsertRecord(this)">'+
        '       <i class="material-icons">close</i>'+
        '</a>'+
        '</div>';
    var insertHtml= '<tr style="display:none;" id="newTr'+nextTrIndex+'">'+
        '<td name="taskDate">'+
        '<input type="cron-new" id="'+nextDatepickerId+'" class="cron" name="date">'+
        '</td>'+
        '<td name="taskTime" class="task-date-show">'+
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
        defaultModeHtml+
        editModeHtml+
        '</td>'+
        '</tr>';
    $("tbody").append(insertHtml);
    $("#newTr"+nextTrIndex).fadeIn(750);
    
    $("#"+nextDatepickerId).datepicker();
    $("#"+nextDatepickerId).change(function(){
        updateSaveIcon(this,editModeHtml,nextTrIndex,nextTimepickerId);
    });
    $("#"+nextTimepickerId).clockpicker();
    $("#"+nextTimepickerId).change(function(){
        updateSaveIcon(this,editModeHtml,nextTrIndex,nextDatepickerId);
        });
    

    //$("#"+nextDatepickerId).focus();
}

//修改时间日期级联时，触发保存按钮
function updateSaveIcon(input,actionDiv,trIndex,cascadeId){

        var saveI=$(input).parent().siblings().last().children("div").eq(1).children().first();
        //var saveI=$(actionDiv).children().first();
        var inputVal=$(input).val();
        var cascadeVal=$("#"+cascadeId).val();
        if( inputVal != '' && cascadeVal != ''){
            //$(saveI).replaceWith('<a href="javascript:;" class="action-save" onclick="save(this)"><i class="material-icons">done</i></a>');
            $(saveI).wrap('<a href="javascript:;" class="action-save" onclick="save(this,'+ trIndex +')"></a>');
        }else{
    //        $(saveI).replaceWith('<i class="material-icons">done</i>');
        }

}


//刷新数据
function refresh(){
    $("#lanternScheduler").empty();
    $.ajax({
        url:"/lantern/refresh",
        type:"get",
        timeout:"3000",
        dataType:"json",
        success:function(result,status,xhr){
            if(result.result.length<1){
                $("#lanternScheduler").append("<tr name='defNothingTr'><td></td><td></td><td>nothing</td><td></td><td></td></tr>");
            }else{
                var lanternNodes;
                $(result.result).each(function(index,lanternTask){
                    var checkedStat=lanternTask.args==1?'checked="checked"':"";
                    lanternNodes+='<tr>'+
                                    '<td name="taskDate" >'+lanternTask.taskDate+'</td>'+
                                    '<td name="taskTime" class="task-date-show">'+lanternTask.taskTime+'</td>'+
                                    '<td>'+
                                        '<div class="switch">'+
                                            '<label>'+
                                              '<input type="checkbox"  value="'+lanternTask.args+'" '+checkedStat+' disabled="disabled" />'+
                                                '<span class="lever" ></span>'+
                                            '</label>'+
                                        '</div>'+
                                    '</td>'+
                                    '<td>?</td>'+
                                    '<td>'+
                                        '<div style=";text-align:center;;height:auto;">'+
                                            '<a href="javascript:;"  class="action-edit" onclick="triggerEditMode(this,true)">'+
                                                '<i class="material-icons">edit</i>'+
                                            '</a>'+
                                            '<a href="javascript:;" class="action-delete" onclick="deleteLanternTaskById(this,'+lanternTask.id+')">'+
                                                '<i class="material-icons">delete</i>'+
                                            '</a>'+
                                        '</div>'+
                                        '<div style=";text-align:center;;height:auto;display: none;">'+
                                            '<i class="material-icons" hiddenId="'+ lanternTask.id +'">done</i>'+
                                            '<a href="javascript:;" class="action-close" onclick="triggerEditMode(this,false)">'+
                                                '<i class="material-icons">close</i>'+
                                            '</a>'+
                                        '</div>'+
                                    '</td>'+
                                '</tr>';
                });
            $("#lanternScheduler").append(lanternNodes);
            }
        }
    });
}

function updateLanterTask(lanternTaskId){
    $.ajax({
        url:"/lantern/update?lanternTaskId="+lanternTaskId,
        type:"put",
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
    var trnode=$(node).parents("tr");
    var inputs=$(trnode).find("input");
    var param='{"dateTime":{';
    var taskDateVal=null;
    var taskTimeVal=null;
    $(inputs).each(function(){
        param+='"'+$(this).attr("name")+'":"'+$(this).val()+'"';
        if(inputs.length-1 > inputs.index(this)){
            param+=",";
        }else{
        param+="}}";
        }
        if($(this).attr("name")=="date"){
            taskDateVal=$(this).val();
        }else  if($(this).attr("name")=="time"){
            taskTimeVal=$(this).val();
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
                var closeNode=$(node).siblings()[0];
                Materialize.toast('保存成功！', 3000, 'rounded');
                $(inputs[0]).replaceWith(taskDateVal);
                $(inputs[1]).replaceWith(taskTimeVal);
                triggerEditMode($(node),false,"'"+result.id+"'");
                $(closeNode).attr("onclick","triggerEditMode(this,false)");
                $(node).replaceWith('<i class="material-icons" hiddenId="'+result.id+'" >done</i>');
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
     //   $(saveI).replaceWith('<i class="material-icons">done</i>');
    }else{
        //$(saveI).replaceWith('<a href="javascript:;" class="action-save" onclick="save(this)"><i class="material-icons">done</i></a>');
        $(saveI).wrap('<a href="javascript:;" class="action-save" onclick="save(this)"></a>');
    }
}



function triggerEditMode(node,flag,id){
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
       
        if(id != null){
            console.log('id');
            var delNode=$(editDiv).find("a").last();
            $(delNode).replaceWith( '<a href="javascript:;" class="action-delete" onclick="deleteLanternTaskById(this,'+id+')"><i class="material-icons">delete</i></a>');
        }
    }
}


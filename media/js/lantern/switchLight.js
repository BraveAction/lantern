$(function(){
    var lightswitch		=	$("#switch");							// the light switch
    var lightbulb		=	$("#light-bulb");						// outer light bulb
    var lightbulb2		=	$("#light-bulb2");						// inner light bulb

    //开关按钮事件
    lightswitch.click(function(){
        $("#error").hide();
        var isOff=lightbulb.hasClass("off");
        remoteControl(isOff ? "on" : "off");
    });

    //请求开关任务状态
    function remoteControl(switchState){
        $.ajax({url:"/lantern/"+switchState,
            type:"get",
            timeout:"3000",
            success:function(result,status,xhr){
                var lanternState=result.lanternState;
                switchLight(lanternState);
            },
            error:function(xhr,status,error){
                $("#error").show();
                alert("请求失败");
            }
        });
    }

    //根据开关状态添加样式
    function switchLight(lanternState){

        if(lanternState==1){
            lightbulb.removeClass("off");
            lightswitch.css("backgroundPosition","0 0");
        }else if(lanternState==0){
            lightbulb.addClass("off");
            lightswitch.css("backgroundPosition","-80px 0");
        }
        lightbulb2.stop().fadeTo(750,lanternState);
    }

    switchLight(lanternState);
});

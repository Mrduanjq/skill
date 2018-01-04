$(function(){ 
    /**
     * setBackgroundColor 用于设置背景色
     */
    (function setBackgroundColor(){
        var ua = navigator.userAgent.toLowerCase();
        if (/android/i.test(ua)) { } 
        else {
            $("body,html").css("background-color","rgb(255, 66, 37)");
        }
    })()
    var url = "data/invesGoldSmash.json";
    var lock = true;
    var hasMoney = true; // 是否有现金出现
    var nickName = 'mrduan';
    var smashMsg = '蓉小姐';
    var dataListTimer = null;
    var step = 2500; // 发送弹幕所用的变量
    $(".money").on('touchend','li',function(){
        var g_img = $('.center_center>img');
        if (lock) {
            lock = false;
            var $this = $(this);
            $this.find(".path").show();
            switch ($this.index()) {
                case 0:
                request(new Date().getTime(),1,$this,g_img,"#fly_1",false);
                break;
                case 1:
                request(new Date().getTime(),10,$this,g_img,"#fly_2",false);
                break;
                case 2:
                request(new Date().getTime(),100,$this,g_img,"#fly_3",true);
                break;
            }  
        }    

    });
    function toggleCategory(e){
      var url = "data/activityInfo.json";
        
      var mask_wrapper = $(".mask_wrapper");
      if (!mask_wrapper.hasClass('on')) {
           $.getJSON(url,{"ts":new Date().getTime()},function(data){
            if (data.resultCode == 0) {
                var res = "";
                for (var i=0; i<data.list.length; i++) {
                    res += "<li class='cleanfixed'>"
                        + "<span class='left'>"+data.list[i].remark+"</span>"
                        + "<span class='right'>"+dateFormat(data.list[i].date)+"</span>"
                        + "</li>"
                }
                $("#historyLists").html(res);
            } else if (data.resultCode == 5 ){ // 未登录
                judgePhone();
            }
          })
          mask_wrapper.addClass("on").animate({"opacity":'1'},500);
          $("body").css({'overflow-y':'hidden','display':'fixed',"height":"100%"});
      } else {
          mask_wrapper.removeClass("on").animate({"opacity":'0'},500);
          $("body").css({'overflow-y':'auto','display':'',"height":"100%"});
      }
    }

    function dateFormat(val){
        var date = new Date();
        if (val) {
          date.setTime(val);
        }
        var y = date.getFullYear();
        var m = date.getMonth()+1;
        if (m < 10) {
            m = '0' + m;
        }
        var d = date.getDate();
        if (d < 10) {
            d = '0' + d;
        }
        var h = date.getHours();
        if (h < 10) {
            h = '0' + h;
        }
        var min = date.getMinutes();
            if (min < 10) {
        min = '0' + min;
        }
        var mm = date.getSeconds();
            if (mm < 10) {
        mm = '0' + mm;
        }
        return y+'.'+m+'.'+d+'  '+h+':'+min+':'+mm;
    }

    /**
     * request 请求函数
     * ts ：时间戳
     * gold ： 元宝数量
     */
     function request(ts,gold,self,g_img,sequence,isReverse){
        $.get(url,function(data){
            if (data.resultCode == 0) {
                inves(); // 调用我的小元宝接口，使元宝数量实时减少
                animate(self,g_img,sequence,isReverse,data.nickName,data.smashMsg);
                nickName = data.nickName;
                smashMsg = data.smashMsg;
            } else if (data.resultCode == 5) {
                // judgePhone(); // 与APP交互函数
            } else {
                $(".path").css("display","none");
                layer.msg(data.msg);
                lock = true; // 元宝数量不足时，解锁
            }
        });
     }
    
    /**
     * judgePhone 判断是ios还是Android 且 跳转到app登录界面
     */
     function judgePhone(){
        var ua = navigator.userAgent.toLowerCase();
        if (!/micromessenger/.test(ua)) {
            if (/android/i.test(ua)) {
                javaScriptToLogin.ToLogin("LoginNewActivity");
            } else {
                window.webkit.messageHandlers.HomeActivityDetailLogin.postMessage(null);
            }
            
        }
     }
    /**
     * animate 动画效果,接收三个参数
     * self : 当前li元素 object
     * g_img : 缸的dom元素 object
     * sequence : 序列帧的动画的dom元素 string
     * isReverse : 缸的运动方向是否是反着的
     * smashMsg ： 接口返回的中奖信息
     * nickName : 当前用户手机号
     */
     function animate(self,g_img,sequence,isReverse,nickName,smashMsg){
        g_img.removeClass('on').removeClass('cur');
        self.find('.path').addClass('on');
        setTimeout(function(){
            $(sequence).addClass('on');
        },500)
        setTimeout(function(){
            if ( g_img.hasClass('on')) g_img.removeClass('on');
            setTimeout(function(){
                isReverse ? g_img.addClass('cur') : g_img.addClass('on');
                setTimeout(function(){
                    $(sequence).removeClass('on');
                    self.find(".path").hide().removeClass('on');
                    toggleShowPrize(smashMsg);
                },30)
            },30)
        },700);
     }

    /**
     * beginQuestBefore 活动开始之前请求的数据,获取用户信息
     */
     function beginQuestBefore(){
        var url = "data/activityInfo.json";
        $.get("data/activityInfo.json",function(data){
            if (data.resultCode == 0) {
                if (data.startTime-new Date().getTime()>=0) { // 活动未开始
                    clearInterval(dataListTimer);
                    formate(data.startTime);
                    $("#money_title").text("下期共放出");
                    $("#money").text("￥"+data.showCash);
                    $("#money_footer").text("现金豪礼");                   
                } else { // 活动开始
                    clockReverse(+new Date()+200000);
                    $("#money_title").text("剩余 ");
                    $("#money").text("￥"+data.showCash);
                    if (data.showCash <= 0) { // 资金池为0后将现金关闭
                        hasMoney = false; 
                    }
                    cash(data.startTime,data.zeroTime,data.showCash);
                    $("#money_footer").text("加油!");
                    bulid() // 调用弹幕
                }
            } else if(data.resultCode == 5) {
                judgePhone();
            } else {
                layer.msg(data.msg);
            }
        })
     }

    /**
     * toggleShowPrize 用于显示用户中奖信息
     * smashMsg : 用户具体中的奖
     */
     function toggleShowPrize(smashMsg){
        setTimeout(function(){
            if ($(".show_prize_wrapper").css("display") == "none") {
                $(".show_prize_wrapper").css("display","flex");
                $(".article").html(smashMsg);
            }
        },1000)
     }

    /**
     * inves 用于显示我的小元宝数量接口
     */
     function inves(){
        var url = "data/inves.json";
        $.get(url,function(data){
          if (data.resultCode == 0) {
              $("#my_yb_num").text(data.ingots);
          } else if (data.resultCode == 5) {
            judgePhone();
          } else {
              layer.msg(data.msg);
          }
        })
     }
    /**
     * round  是否添加0
     * num : 接收一个数，若小于10则补0
     */
    function round(num){ // 是否添加0；
        return num < 10 ? "0" + num : num;
    }

    /**
     * formate  格式化时间，只用于格式化活动未开始
     * ts  : 接收的时间
     */
     function formate(t){
        $('.spe').addClass("change");
        var now_ms = new Date().getTime(); // 当前ms
        var surplus = t -  now_ms; // 剩余 ms
        var timer = setInterval(function(){
            surplus -= 1000;
            var day = round(Math.floor(surplus / 1000 / 60 / 60 / 24 ));
            var hour = round(Math.floor(surplus / 1000 / 60 / 60 % 24));
            var min = round(Math.floor(surplus / 1000 / 60 % 60));
            var sec = round(Math.floor(surplus / 1000 % 60));
            if (surplus<=0) { // 活动开始
                clearInterval(timer);
                beginQuestBefore();
                return;
            }
            $(".day").text(day);
            $(".hour").text(hour);
            $(".min").text(min);
            $(".sec").text(sec);
           
        },1000)
     }

    /**
     * clockReverse 只用于活动开始倒计时
     * ts ： 接收ms数,为活动结束时间ms数
     */
     function clockReverse(ts){
        $('.spe').removeClass("change");
        var now_ms = new Date().getTime(); // 当前ms
        var surplus = ts -  now_ms; // 剩余 ms
        var timer = setInterval(function(){
            surplus -= 1000;
            var hour = round(Math.floor(surplus / 1000 / 60 / 60 % 24));
            var min = round(Math.floor(surplus / 1000 / 60 % 60));
            var sec = round(Math.floor(surplus / 1000 % 60 ));
            if (surplus<=0) { // 活动结束
                clearInterval(timer);
                beginQuestBefore();
                return;
            }
            $(".min_ed").text(min);
            $(".sec_ed").text(sec);
            
        },1000);
     }

    /**
     * cash  用于减少资金
     * zeroTime : 接收zeroTime参数，在规定时间内均匀清零cash
     * startTime : 开始时间
     */
     function cash(startTime,zeroTime,showCash){
        var now_ms = new Date().getTime();
        var ts = zeroTime - now_ms;
        var ts2 = zeroTime - startTime;
        var cashNum = Math.floor(showCash/(ts2/1000)); // 单价
        if (ts<=0) { // 资金池清零
            hasMoney = false; // 不再有现金
            $("#money").text(0);
            return;
        }
        showCash = Math.floor(cashNum*(ts/1000));
        var timer = setInterval(function(){
            ts = zeroTime - new Date().getTime();
            showCash -= Math.ceil(Math.random()*2+(cashNum-2));
            if (showCash <= cashNum) {
                hasMoney = false; // 不再有现金
                $("#money").text(0);
                clearInterval(timer);
                return;
            }
            if (Math.floor(cashNum*(ts/1000)) - showCash < 50){
                showCash = Math.floor(cashNum*(ts/1000));
            }
            if (ts<=0){
                hasMoney = false; // 不再有现金
                $("#money").text(0);
                clearInterval(timer);
                return;
            }
            $("#money").text("￥"+showCash);
        },1000)
     }


    // 根据字典生成随机序列
    function randomCode(len,dict) {
        for (var i = 0,rs = ''; i < len; i++)
            rs += dict.charAt(Math.floor(Math.random() * 100000000) % dict.length);

        return rs;
    };
    /**
     * randomMoney 用于随机生成现金
     */
    function randomMoney(){
        var num = (Math.floor(Math.random()*1000))/100;
        if (num<=0) {
            return 0.2;
        } else if (num > 9.6 && num < 10 ) {
            return (Math.floor(Math.random()*100+1)) ;
        } else {
            return num;
        }
     }
    // 生成随机手机号码
    function randomPhoneNumber(){
        // 第1位是1 第2,3位是3458 第4-7位是* 最后四位随机
        return [1,randomCode(2,'3458'),'****',randomCode(4,'0123456789')].join('');
    };


    function bulid(){
        var step = 3000;
        if (hasMoney){
            var prize = [
                "<strong>现金 "+randomMoney()+" 元</strong>",
                " "+Math.floor(Math.random()*8+2)+" 活跃币",
                "<strong>现金 "+randomMoney()+" 元</strong>",
                " "+Math.floor(Math.random()*8+2)+" 活跃币",
                "<em>银 30 元券</em>",
                " "+Math.floor(Math.random()*8+2)+"活跃币",
                "<em> 8 元铜体验券</em>",
                " "+Math.floor(Math.random()*8+2)+" 活跃币",
                "<strong>现金 "+randomMoney()+" 元</strong>",
                "<em> 8 元油体验券</em>"
            ];
        } else {
            var prize = [
                " "+Math.floor(Math.random()*8+2)+" 活跃币",
                "<em>银 30 元券</em>",
                " "+Math.floor(Math.random()*8+2)+" 活跃币",
                "<em> 8 元铜体验券</em>",
                " "+Math.floor(Math.random()*8+2)+" 活跃币",
                "<em> 8 元油体验券</em>"
            ];
        }
        var prizeArr = [ // 获奖数据
            {"name":randomPhoneNumber(),"prize":prize[Math.floor(Math.random()*prize.length)]},
            {"name":randomPhoneNumber(),"prize":prize[Math.floor(Math.random()*prize.length)]},
            {"name":randomPhoneNumber(),"prize":prize[Math.floor(Math.random()*prize.length)]}
        ];
        
        clearInterval(dataListTimer);
        dataListTimer = setInterval(function(){
            var randomNum1 = Math.floor(Math.random()*3);
            var randomNum2 = 0;
            var randomNum3 = 0;
            var randomNum1color = 'black';
            var randomNum2color = 'black';
            var randomNum3color = 'black';
            switch (randomNum1) {
                case 0 : 
                    randomNum2 = 1;
                    randomNum3 = 2;
                break;
                case 1 :
                    randomNum3 = 0;
                    randomNum2 = 2;
                break;
                case 2 :
                    randomNum3 = 0;
                    randomNum2 = 1;
                break;
            }
            if (!!nickName){
                 prizeArr = [ // 获奖数据
                    {"name":nickName,"prize":smashMsg},
                    {"name":randomPhoneNumber(),"prize":prize[Math.floor(Math.random()*prize.length)]},
                    {"name":randomPhoneNumber(),"prize":prize[Math.floor(Math.random()*prize.length)]}
                ];
                /* 
				 * 用于标识当前用户弹幕的颜色变化 
				switch (0) {
                //     case randomNum1 :
                //         randomNum1color = "red";
                //     break;
                //     case randomNum2 :
                //         randomNum2color = "red";
                //     break;
                //     case randomNum3 :
                //         randomNum3color = "red";
                //     break;
                // }*/
                nickName = ''; // 清除数据
            }

            $("#dataList").append("<li class='translateZ'>"+prizeArr[randomNum1].name+"砸到"+prizeArr[randomNum1].prize+"</li>")
                          .children()
                          .animate({
                                left:-200,
                        },0,function(){
                                $(this).css({
                                            color: randomNum1color,             //颜色固定为红色
                                            left: $(window).width()+180, 
                                            top: 0                 
                                        }).animate({
                                            left:-200
                                        },9000,"linear",function(){
                                            $(this).remove();
                                })
                        });


            $("#dataList").append("<li class='translateZ'>"+prizeArr[randomNum2].name+"砸到"+prizeArr[randomNum2].prize+"</li>")
                          .children()
                          .animate({
                                left:-200,
                        },0,function(){
                                $(this).css({
                                            color: randomNum2color,             //颜色固定为红色
                                            left: $(window).width()+250, 
                                            top: 0.5+"rem"                 
                                        }).animate({
                                            left:-200
                                        },10000,"linear",function(){
                                            $(this).remove();
                                })
                        });


            $("#dataList").append("<li class='translateZ'>"+prizeArr[randomNum3].name+"砸到"+prizeArr[randomNum3].prize+"</li>")
                          .children()
                          .animate({
                                left:-200,
                        },0,function(){
                                $(this).css({
                                            color: randomNum3color,             //颜色固定为红色
                                            left: $(window).width()+370, 
                                            top: 1+"rem"                 
                                        }).animate({
                                            left:-200
                                        },12000,"linear",function(){
                                            $(this).remove();
                                })
                        });     


       
            if (hasMoney){
                 prize = [
                            "<strong>现金 "+randomMoney()+" 元</strong>",
                            " "+Math.floor(Math.random()*8+2)+" 活跃币",
                            "<strong>现金 "+randomMoney()+" 元</strong>",
                            " "+Math.floor(Math.random()*8+2)+" 活跃币",
                            "<em>银 30 元券</em>",
                            " "+Math.floor(Math.random()*8+2)+"活跃币",
                            "<em> 8 元铜体验券</em>",
                            " "+Math.floor(Math.random()*8+2)+" 活跃币",
                            "<strong>现金 "+randomMoney()+" 元</strong>",
                            "<em> 8 元油体验券</em>"
                 ];
            } else {
                 prize = [
                     " "+Math.floor(Math.random()*8+2)+" 活跃币",
                     "<em>银 30 元券</em>",
                     " "+Math.floor(Math.random()*8+2)+" 活跃币",
                     "<em> 8 元铜体验券</em>",
                     " "+Math.floor(Math.random()*8+2)+" 活跃币",
                     "<em> 8 元油体验券</em>"
                 ];
            }
            prizeArr = [ // 获奖数据
                {"name":randomPhoneNumber(),"prize":prize[Math.floor(Math.random()*prize.length)]},
                {"name":randomPhoneNumber(),"prize":prize[Math.floor(Math.random()*prize.length)]},
                {"name":randomPhoneNumber(),"prize":prize[Math.floor(Math.random()*prize.length)]}
            ];
        },step);
    }


    /**
     * move 弹幕移动函数
     * num : 弹幕所在的行数
     * prizeArr : 中奖的数据  Array
     * i : 显示的条数
     */
     function move(num,prizeArr,i){
         $("#dataList").append("<li class='translateZ'>"+prizeArr[i].name+"砸到<strong>"+prizeArr[i].prize+"</strong></li>")
                       .children()
                       .animate({
                            left:-200,
                       },0,function(){
                            $(this).css({
                                        color: 'red',             //颜色固定为红色
                                        left: $(window).width()+Math.random()*100, 
                                        top: num+"rem"                 
                                    }).animate({
                                        left:-200-Math.random()*100
                                    },10000,"linear",function(){
                                        $(this).remove();
                            })
                       })      
     }

     // 返回交互
     function back(){
         var ua = navigator.userAgent.toLowerCase();
         if (!/micromessenger/.test(ua)) {
            if (/android/i.test(ua)) {
                javaScriptToBack.ToBack();
            } else {
                window.webkit.messageHandlers.HomeActivityDetailPopBack.postMessage(null);
            }
         }
     }

     beginQuestBefore();

     inves();
     
     // $(".history_left").on("click",toggleCategory);

     // $(".mask_wrapper").on("click",toggleCategory);

     $(".mask_bg").on("click",function(e){
        e.stopPropagation();
     })
     var timesNum = 0;
     $(".back_left").on("touchend",back);
     $(".sure_btn").on("click",function(e){
         $(".show_prize_wrapper").css("display","none");
        lock = true; // 当点击关闭战报按钮，则解锁 
        return;
    })
    
    $(".goShopping").on("click",function(){
        var ua = navigator.userAgent.toLowerCase();
        var version = window.location.search;
        var reg = /version/i; // 不区分大小写
        if (!reg.test(version)){
            $(".shopping_wrapper").fadeIn(500);
        } else {
            if (!/micromessenger/.test(ua)) {
                if (/android/i.test(ua)) {
                    activeStore.ToActiveStore();
                } else {
                    window.webkit.messageHandlers.goShopping.postMessage(null);
                }
            }
        }
        
        
        })
     $(".shopping_wrapper").on("click",function(){
        $(this).fadeOut(500);
     })
})

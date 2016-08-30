/**
 * Created by dell on 2016/7/4.
 */

(function(){

    //声音
    var music=document.getElementById("music");
    var pushsound=document.getElementById("pushsound");
    var gosound=document.getElementById("gosound");

    //图片
    var imgBlank;
    var imgBox;
    var imgBoxTarget;
    var imgPerson;
    var imgPersonTarget;
    var imgTarget;
    var imgWall;

    //var mapData="####--\n#-.#--\n#--###\n#*@--#\n#--$-#\n#--###\n####--";           //地图数据
    var mapData="__###___\n__#.#___\n__#-####\n###$-$.#\n#.-$@###\n####$#__\n___#.#__\n___###__";
    //var mapData="----#####----------\n----#---#----------\n----#$--#----------\n--###--$##---------\n--#--$-$-#---------\n###-#-##-#---######\n#---#-##-#####--..#\n#-$--$----------..#\n#####-###-#@##--..#\n----#-----#########\n----#######--------";
    var arrBack;             //背景块数组
    var arrFront;             //前景块数组
    var personPosition={x:0,y:0};          //人的位置
    var canvas;              //canvas对象
    var ctx;                 //canvas绘制环境

    //记录操作的步数
    var curLevel=1;     //当前关卡
    var curLevelPage=1;     //当前关卡页码
    var stepNum;    //走的步数
    var saveStep;     //走的每一步的记录数组

    //页面元素
    var divStepNum=document.getElementById("div_stepnum");
    
    
    //网络数据相关///////////////////////////////////////////////////////////////////////////////////////////////////
    var userid=0;
    var username="";
    var userLevel=0;
    var userStep=100000;

    var rankPageCount=0;//排行榜页数
    var currentRankPage=1;//排行榜当前页

    //初始化用户相关，包括初始化用户分数，生成选关列表,初次登录时初始化画布
    var initUserAbout=function () {
        var logsignNav=document.getElementById("signlog_nav");
        var divLogSign=document.getElementById("div_logsign");
        var temp="";

        //读取用户信息(同步)
        var xhr=new XMLHttpRequest();
        xhr.open("get", "../php/GetUserMessage.php?userid=" + userid, false);
        xhr.send();
        var xhrData = xhr.responseText;
        if (xhrData == "0") {
            if(userid>0){
                alert("登录过期，请重新登录");
            }
        } else {
            var jsData = eval("(" + xhrData + ")");
            userid = parseInt(jsData["id"]);
            username = jsData["NAME"];
            userLevel = jsData["LEVEL"];
            userStep = jsData["levelstep"];
            // curLevel=parseInt(userLevel)+1;
            // alert(curLevel);
            temp += "<div>"+username + ",欢迎进入推箱子世界</div>";
            temp+="<div id='logout' class='linkbutton'>注销</div>"
            logsignNav.innerHTML = temp;
            divLogSign.innerHTML = "";
            //注销按钮事件(异步)
            document.getElementById("logout").addEventListener("click",function () {
                var xhr=new XMLHttpRequest();
                xhr.open("get","../php/Logout.php",true);
                xhr.send();
                xhr.onreadystatechange=function () {
                    if(xhr.readyState==4&&xhr.status==200){
                        userid=0;
                        username="";
                        userLevel=1;
                        userStep=100000;
                        initUserAbout();
                    }
                };
            });
        }
        initUserScore();
        genLevelList(parseInt((userLevel-1)/10)+1);
        //初始化用户导航条
        if(userid<=0){
            temp+="<div id='login' class='linkbutton'>登录</div>";
            temp+="<div id='signup' class='linkbutton'>注册</div>";
            logsignNav.innerHTML=temp;
            //导航条登录事件
            document.getElementById("login").addEventListener("click",function () {
                if(divLogSign.innerHTML!=""){
                    divLogSign.innerHTML="";
                }else {
                    var temp="<div class='one_item'><div class='item_name'>用户名：</div><div class='item_value'><input type='text' id='login_username'></div></div>"
                    temp+="<div class='one_item'><div div class='item_name'>密码：</div><div  class='item_value'><input type='password' id='login_password'></div></div>";
                    temp+="<div class='one_item'><div id='btn_login' class='button'>登录</div></div>";
                    divLogSign.innerHTML=temp;
                    var loginUsername=document.getElementById("login_username");
                    var loginPassword=document.getElementById("login_password");
                    //登录事件(同步)
                    document.getElementById("btn_login").addEventListener("click",function () {
                        var xhr = new XMLHttpRequest();
                        xhr.open("post", "../php/Login.php", false);
                        xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                        xhr.send("username=" + loginUsername.value + "&password=" + loginPassword.value);
                        var data = xhr.responseText;
                        if (data == "0") {
                            alert("用户名或密码错误");
                        } else {
                            var jsData = eval("("+data+")");
                            userid=parseInt(jsData["id"]);
                            username=jsData["NAME"];
                            userLevel=jsData["LEVEL"];
                            userStep=jsData["levelstep"];
                            curLevel=parseInt(userLevel)+1;
                            initUserAbout();
                            initCanvas();
                        }
                    });
                }
            });
            //导航条注册事件
            document.getElementById("signup").addEventListener("click",function () {
                if(divLogSign.innerHTML!=""){
                    divLogSign.innerText="";
                }else {
                    var temp="<div class='one_item'><div class='item_name'>用户名：</div><div class='item_value'><input type='text' id='signup_username'></div></div>"
                    temp+="<div class='one_item'><div div class='item_name'>密码：</div><div  class='item_value'><input type='password' id='signup_password'></div></div>";
                    temp+="<div class='one_item'><div div class='item_name'>再次输入密码：</div><div  class='item_value'><input type='password' id='signup_password_again'></div></div>";
                    temp+="<div class='one_item'><div id='btn_signup' class='button'>注册</div></div>";
                    divLogSign.innerHTML=temp;
                    var signupUsername=document.getElementById("signup_username");
                    var signupPassword=document.getElementById("signup_password");
                    var signupPasswordAgain=document.getElementById("signup_password_again");
                    //注册事件（同步）
                    document.getElementById("btn_signup").addEventListener("click",function () {
                        if(signupUsername.value==""||signupPassword.value==""||signupPasswordAgain.value==""){
                            alert("所填项不能为空");
                            return;
                        }
                        if(signupPassword.value!=signupPasswordAgain.value){
                            alert("两次输入密码不一致");
                            return;
                        }
                        var xhr = new XMLHttpRequest();
                        xhr.open("post", "../php/SignUp.php", false);
                        xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                        xhr.send("username=" + signupUsername.value + "&password=" + signupPassword.value);
                        var data = xhr.responseText;
                        if (data == "0") {
                            alert("用户名已存在");
                        } else {
                            userid=data;
                            initUserAbout();
                            initCanvas()
                        }
                    });
                }
            })
        }
    };

    //使用前端数据初始化排行榜用户成绩
    var initUserScore=function () {
        var userScore=document.getElementById("user_score");
        userScore.innerHTML=username+"#您通过的最高关卡为第"+userLevel+"关，使用"+userStep+"步";
    };

    //加载地图(同步)
    var loadmap=function (mapNum) {
        var xhr=new XMLHttpRequest();
        xhr.open("get","../php/GetMap.php?mapnum="+mapNum,false);
        xhr.send();
        mapData=xhr.responseText;
        document.getElementById("top_level_num").innerHTML="第"+curLevel+"关";
    };
    //生成选关列表
    var genLevelList=function (pageNum) {
        var levelList=document.getElementById("levellist");
        var levelListPageCount=parseInt((userLevel)/10)+1;
        if(pageNum<=0||pageNum>levelListPageCount){
            return;
        }
        curLevelPage=pageNum;
        var temp="";
        for(var i=(pageNum-1)*10+1;i<=pageNum*10;i++){
            if(i<=parseInt(userLevel)+1){
                temp+="<div class='level_button button'>"+i+"</div>";
            }else {
                temp+="<div class='level_button button' style='color:gray;'>"+i+"</div>";
            }
        }
        levelList.innerHTML=temp;
        //关卡点击事件
        var levelbuttons=document.getElementsByClassName("level_button");
        for(var i=0;i<levelbuttons.length;i++){
            levelbuttons[i].addEventListener("click",function (e) {
                var level=parseInt(e.target.innerHTML);
                if(level>parseInt(userLevel)+1){
                    return;
                }
                curLevel=level;
                initCanvas();
            });
        }
        document.getElementById("level_pagecount").innerHTML=levelListPageCount;
        document.getElementById("level_currentpage").value=pageNum;
        document.getElementById("level_lastpage").style.visibility="visible";
        document.getElementById("level_nextpage").style.visibility="visible";
        if(pageNum<=1){
            document.getElementById("level_lastpage").style.visibility="hidden";
        }
        if(pageNum>=levelListPageCount){
            document.getElementById("level_nextpage").style.visibility="hidden";
        }
    };
    
    //更新用户信息(同步)
    var updatUserScore=function (level, step) {
        var xhr=new XMLHttpRequest();
        xhr.open("post","../php/UpdateUserMessage.php",false);
        xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xhr.send("level="+level+"&step="+step);
        xhr.onreadystatechange=function () {
            if(xhr.readyState==4&&xhr.status==200){
                var xhrdata=xhr.responseText;
                if(xhrdata==0){
                    alert("登录超时，请重新登录\n登录后请重新完成游戏以保存数据");
                }
            }
        };
    };
    
    //加载排行榜页数（同步）
    var loadRankPageCount=function () {
        var xhr=new XMLHttpRequest();
        xhr.open("get","../php/GetRankPageCount.php",false);
        xhr.send();
        rankPageCount=parseInt(xhr.responseText);
        document.getElementById("rank_pagecount").innerHTML=rankPageCount;
    };
    //加载排行榜(异步)
    var loadRank=function (pageNum) {
        var xhr=new XMLHttpRequest();
        xhr.open("get","../php/GetRank.php?pagenum="+pageNum,true);
        xhr.send();
        xhr.onreadystatechange=function () {
            if(xhr.readyState==4&&xhr.status==200){
                var rankData=eval(xhr.responseText);
                var tableContent="<tr><th>玩家</th><th>关卡</th><th>步数</th></tr>";
                for(var i=0;i<rankData.length;i++){
                    var temp="<tr><td>"+rankData[i]["NAME"]+"</td><td>"+rankData[i]["LEVEL"]+"</td><td>"+rankData[i]["levelstep"]+"</td></tr>";
                    tableContent+=temp;
                }
                document.getElementById("tab_rank").innerHTML=tableContent;
                currentRankPage=pageNum;
                document.getElementById("rank_currentpage").value=pageNum;
                document.getElementById("rank_lastpage").style.visibility="visible";
                document.getElementById("rank_nextpage").style.visibility="visible";
                if(pageNum<=1){
                    document.getElementById("rank_lastpage").style.visibility="hidden";
                }
                if(pageNum>=rankPageCount){
                    document.getElementById("rank_nextpage").style.visibility="hidden";
                }
            }
        };
    };
    
    
    /////////////////////////////////////////////////////////////////////////////////////////////////


    //初始化页面
    var initPage=function(){

        //加载图片
        imgBlank = new Image();
        imgBlank.src = "../images/blank.png";
        imgBox = new Image();
        imgBox.src = "../images/box.png";
        imgBoxTarget = new Image();
        imgBoxTarget.src = "../images/boxTarget.png";
        imgPerson = new Image();
        imgPerson.src = "../images/person.png";
        imgPersonTarget = new Image();
        imgPersonTarget.src = "../images/personTarget.png";
        imgTarget = new Image();
        imgTarget.src = "../images/target.png";
        imgWall = new Image();
        imgWall.src = "../images/wall.png";

        //初始化音乐
        music.volume-=0.4;
        music.play();

        //初始化用户相关
        initUserAbout();
        curLevel=parseInt(userLevel)+1;

        //初始化排行榜
        loadRankPageCount();
        loadRank(1);


    };
    //创建对象——一块背景物
    var createBackThing= function (iType) {
        var bt={
            type:iType    //背景块的类型，0表示空白，1表示墙壁，2表示目标点
        };
        return bt;
    };
    //创建对象——一块前景物
    var createFrontThing=function(iType){
        var ft={
            type:iType      //前景的类型，0表示空白，1表示人,2表示箱子
        };
        return ft;
    };
    //将地图初始化到前后物体
    var mapToObj=function(map){
        var mapRows=map.split('\n');
        arrBack=new Array();
        arrFront=new Array();
        for(var i=0;i<mapRows.length;i++){
            arrBack[i]=new Array();
            arrFront[i]=new Array();
            for(var j=0;j<mapRows[i].length;j++){
                switch (mapRows[i][j]){
                    case '@':
                        arrBack[i][j]=createBackThing(0);
                        arrFront[i][j]=createFrontThing(1);
                        personPosition.x=j;
                        personPosition.y=i;
                        break;
                    case '+':
                        arrBack[i][j]=createBackThing(2);
                        arrFront[i][j]=createFrontThing(1);
                        personPosition.x=j;
                        personPosition.y=i;
                        break;
                    case '$':
                        arrBack[i][j]=createBackThing(0);
                        arrFront[i][j]=createFrontThing(2);
                        break;
                    case '*':
                        arrBack[i][j]=createBackThing(2);
                        arrFront[i][j]=createFrontThing(2);
                        break;
                    case '.':
                        arrBack[i][j]=createBackThing(2);
                        arrFront[i][j]=createFrontThing(0);
                        break;
                    case '#':
                        arrBack[i][j]=createBackThing(1);
                        arrFront[i][j]=createFrontThing(0);
                        break;
                    case '-':
                        arrBack[i][j]=createBackThing(0);
                        arrFront[i][j]=createFrontThing(0);
                        break;
                    default:
                        arrBack[i][j]=createBackThing(0);
                        arrFront[i][j]=createFrontThing(0);
                        break;
                }
            }
        }
    };

    
    
    //推箱子,xy的值为1、-1、0，分别向坐标对应方向移动
    var personMove=function(x,y){
        //移出地图，取消
        if(personPosition.x+x<0||personPosition.x+x>=arrBack[0].length||personPosition.y+y<0||personPosition.y+y>=arrBack.length){
            return;
        }
        //@#,@$#,@$$,取消
        if(arrBack[personPosition.y+y][personPosition.x+x].type===1){
            return;
        }
        if(arrFront[personPosition.y+y][personPosition.x+x].type==2){
            if(arrFront[personPosition.y+y*2][personPosition.x+x*2].type==2){
                return;
            }
            if(arrBack[personPosition.y+y*2][personPosition.x+x*2].type==1){
                return;
            }
        }
        //删除存储步数中大于走的步数的元素
        saveStep.splice(stepNum+1,100000);
        //移动
        arrFront[personPosition.y][personPosition.x].type=0;
        gosound.play();
        if(arrFront[personPosition.y+y][personPosition.x+x].type==2){
            arrFront[personPosition.y+y*2][personPosition.x+x*2].type=2;
            pushsound.play();
        }
        personPosition.x+=x;
        personPosition.y+=y;
        arrFront[personPosition.y][personPosition.x].type=1;
        //记录走过的步数,并判断游戏是否完成
        var overTag=1;
        var temp="";
        for(var i=0;i<arrBack.length;i++){
            for(var j=0;j<arrBack[i].length;j++){
                switch(arrBack[i][j].type){
                    case 0:
                        switch (arrFront[i][j].type){
                            case 0:
                                temp+="-";
                                break;
                            case 1:
                                temp+="@";
                                break;
                            case 2:
                                temp+="$";
                                break;
                        }
                        break;
                    case 1:
                        temp+="#";
                        break;
                    case 2:
                        switch (arrFront[i][j].type){
                            case 0:
                                temp+=".";
                                break;
                            case 1:
                                temp+="+";
                                break;
                            case 2:
                                temp+="*";
                                break;
                        }
                        break;
                }
                //判断游戏是否完成
                if(arrBack[i][j].type===2&&arrFront[i][j].type!==2){
                    overTag=0;
                }
            }
            temp+="\n";
        }
        saveStep.push(temp);
        stepNum+=1;
        divStepNum.innerHTML="当前已走步数："+stepNum;
        if(overTag===1){
            divStepNum.innerHTML="游戏完成，使用"+stepNum+"步";
            canvas.blur();
            canvas.tabIndex=-1;
            if(userid>0&&curLevel==parseInt(userLevel)+1){
                updatUserScore(parseInt(userLevel)+1,stepNum);
                //alert(userLevel+" "+(parseInt(userLevel)+1));
                initUserAbout();
            }else if(userid>0&&curLevel==userLevel&&stepNum<userStep){
                updatUserScore(userLevel,stepNum);
                initUserAbout();
            }else if(userid<=0&&curLevel==parseInt(userLevel)+1){
                userLevel=curLevel;
                initUserAbout();
            }
            document.getElementById("next_level").style.visibility="visible";
        }
    };
    //画布事件
    var canvasKeyEventFun=function(e){
        if(canvas.tabIndex<0){
            return;
        }
        switch (e.keyCode){
            case 37:case 65://左
            personMove(-1,0);
            break;
            case 39:case 68://右
            personMove(1,0);
            break;
            case 38:case 87://上
            personMove(0,-1);
            break;
            case 40:case 83://下
            personMove(0,1);
            break;
        }
    };
    //初始化画布,包括读取当前关地图
    var initCanvas=function(){

        loadmap(curLevel);

        mapToObj(mapData);

        stepNum=0;
        saveStep=new Array();
        saveStep.push(mapData);
        divStepNum.innerHTML="当前已走步数："+stepNum;

        //添加canvas
        document.getElementById("div_game_container").innerHTML="<canvas id='canvas_game' width='"+40*arrBack[0].length+"' height='"+40*arrBack.length+"' tabindex='0'></canvas>"
        canvas=document.getElementById('canvas_game');
        ctx = canvas.getContext("2d");

        canvas.addEventListener("keydown",canvasKeyEventFun);
    };
    //绘制
    var render=function(){
        for(var i=0;i<arrBack.length;i++){
            for(var j=0;j<arrBack[i].length;j++){
                switch (arrBack[i][j].type){
                    case 0:
                        ctx.drawImage(imgBlank,40*j,40*i,40,40);
                        if(arrFront[i][j].type===1){
                            ctx.drawImage(imgPerson,40*j,40*i,40,40);
                        }else if(arrFront[i][j].type===2){
                            ctx.drawImage(imgBox,40*j,40*i,40,40);
                        }
                        break;
                    case 1:
                        ctx.drawImage(imgWall,40*j,40*i,40,40);
                        break;
                    case 2:
                        ctx.drawImage(imgTarget,40*j,40*i,40,40);
                        if(arrFront[i][j].type===1){
                            ctx.drawImage(imgPersonTarget,40*j,40*i,40,40);
                        }else if(arrFront[i][j].type===2){
                            ctx.drawImage(imgBoxTarget,40*j,40*i,40,40);
                        }
                        break;
                    default:
                        ctx.drawImage(imgBlank,40*j,40*i,40,40);
                        break;
                }
            }
        }
    };



    //主要游戏运行代码
    initPage();
    initCanvas();
    var w=window;
    requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
    var mainLoop=function(){
        render();
        requestAnimationFrame(mainLoop);
    };
    mainLoop();
    canvas.focus();


    //虚拟按键事件
    document.getElementById("toggle_virtual_key").addEventListener("click",function(){
        var arrawkeys=document.getElementById("arrow_keys");
        var toggleArrawkey=document.getElementById("toggle_virtual_key");
        if(arrawkeys.style.display!=="block"){
            arrawkeys.style.display="block";
            toggleArrawkey.innerHTML="关闭虚拟按键";
        }else{
            arrawkeys.style.display="none";
            toggleArrawkey.innerHTML="开启虚拟按键";
        }
    });
    document.getElementById("leftkey").addEventListener("click",function(){
        if(canvas.tabIndex<0){
            return;
        }
        personMove(-1,0);
    });
    document.getElementById("rightkey").addEventListener("click",function(){
        if(canvas.tabIndex<0){
            return;
        }
        personMove(1,0);
    });
    document.getElementById("upkey").addEventListener("click",function(){
        if(canvas.tabIndex<0){
            return;
        }
        personMove(0,-1);
    });
    document.getElementById("downkey").addEventListener("click",function(){
        if(canvas.tabIndex<0){
            return;
        }
        personMove(0,1);
    });
    //音乐按钮事件
    document.getElementById("toggle_music").addEventListener("click",function(){
        var toggleMusic=document.getElementById("toggle_music");
       if(music.paused){
           music.play();
           toggleMusic.src="../images/music.png";
       } else {
           music.pause();
           toggleMusic.src="../images/offmusic.png";
       }
    });
    //游戏操作按钮事件
    document.getElementById("revocation").addEventListener("click",function(){
        if(stepNum<=0){
            return;
        }

        stepNum-=1;
        mapToObj(saveStep[stepNum]);
        divStepNum.innerHTML="当前已走步数："+stepNum;

        canvas.tabIndex=0;
        canvas.focus();
    });
    document.getElementById("restore").addEventListener("click",function(){
        if(stepNum>=saveStep.length-1){
            return;
        }

        stepNum+=1;
        mapToObj(saveStep[stepNum]);
        divStepNum.innerHTML="当前已走步数："+stepNum;

        //再次判断游戏是否为完成状态
        var overTag=1;
        for(var i=0;i<arrBack.length;i++) {
            for (var j = 0; j < arrBack[i].length; j++) {
                if (arrBack[i][j].type === 2 && arrFront[i][j].type !== 2) {
                    overTag = 0;
                    break;
                }
            }
        }
        if(overTag===1){
            divStepNum.innerHTML="游戏完成，使用"+stepNum+"步";
            canvas.blur();
            canvas.tabIndex=-1;
        }


        canvas.focus();
    });
    document.getElementById("restart").addEventListener("click",function(){
        if(confirm("确定重新开始游戏？")){
            initCanvas();
        }

        canvas.focus();
    });
    document.getElementById("next_level").addEventListener("click",function () {
        curLevel+=1;
        initCanvas();
        document.getElementById("next_level").style.visibility="hidden";
    });
    //排行榜按钮事件
    document.getElementById("rank_lastpage").addEventListener("click",function () {
        if(currentRankPage<=1){
            return;
        }
        loadRank(currentRankPage-1);
    });
    document.getElementById("rank_nextpage").addEventListener("click",function () {
        if(currentRankPage>=rankPageCount){
            return;
        }
        loadRank(currentRankPage+1);
    });
    document.getElementById("rank_pagejump").addEventListener("click",function () {
        var inpCurPage=document.getElementById("rank_currentpage");
        var page=parseInt(inpCurPage.value);
        if(isNaN(page)){
            return;
        }
        if(page<1||page>rankPageCount){
            return;
        }
        loadRank(page);
    });
    document.getElementById("rank_refresh").addEventListener("click",function () {
        loadRankPageCount();
        loadRank(1);
    });
    //关卡选择按钮事件
    document.getElementById("level_lastpage").addEventListener("click",function () {
        if(curLevelPage<=1){
            return;
        }
        genLevelList(curLevelPage-1);
    });
    document.getElementById("level_nextpage").addEventListener("click",function () {
        if(curLevelPage>=parseInt((userLevel)/10)+1){
            return;
        }
        genLevelList(curLevelPage+1);
    });
    document.getElementById("level_pagejump").addEventListener("click",function () {
        var inpCurPage=document.getElementById("level_currentpage");
        var page=parseInt(inpCurPage.value);
        if(isNaN(page)){
            return;
        }
        if(page<1||curLevelPage>parseInt((userLevel)/10)+1){
            return;
        }
        genLevelList(page);
    });

})();
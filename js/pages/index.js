



;
window.onload=function () {

    //设置内容宽度
    var oBody=document.getElementsByTagName('body')[0];
    function get_windowHeight() {
        if (window.innerHeight){
            return window.innerHeight;
        }else if (document.documentElement.clientHeight){
            return document.documentElement.clientHeight;
        }else {
            return document.body.clientHeight;
        }
    }
    oBody.style.height=get_windowHeight()+'px';
    window.onresize=function () {
        oBody.style.height=get_windowHeight()+'px';
    };

    //主列表对象
    var oMenuList=(function () {
        function MenuList() {
            this.node=document.getElementById('menu_left');
            this.status='hide';
            this.listItem=this.node.getElementsByTagName('li');
        }
        //显示
        MenuList.prototype.show=function () {
            var w=tool.getStyle(this.node,'width');
            // 发布列表切换事件（附带当前动画参数）
            tool.triggerEvent('listToggle',250,500,0,'swing');
            // 列表切换动画
            tool.animation(this.node,{'left':0,'opacity':1},500,0,'swing');
            this.status='show';
        };
        // 隐藏
        MenuList.prototype.hide=function () {
            var w=tool.getStyle(this.node,'width');
            tool.triggerEvent('listToggle',0,500,0,'swing');
            tool.animation(this.node,{'left':'-'+w,'opacity':0},500,0,'swing');
            this.status='hide';
        };
        // 切换
        MenuList.prototype.toggle=function () {
            if (this.status==='hide'){
                this.show();
            }else {
                this.hide();
            }
        };
        //背景样式动画
        MenuList.prototype.itemBg=function (el,x,y) {
            //动画半径、多增加10px以覆盖全部
            var r=Math.max(parseInt(tool.getStyle(el.parentNode,'width'))-x,x)+10;
            //定位起始位置
            el.style.left=x+'px';
            el.style.top=y+'px';
            tool.animation(el,{'width':r*2,'height':r*2,'left':x-r,'top':y-r,'opacity':1},500,0,'easeOutCubic',function () {
                tool.animation(el,{'opacity':0},200,0,'swing',function () {
                    el.style.width=0;
                    el.style.height=0;
                    el.style.opacity=0;
                });
            });
        };
        MenuList.prototype.init=function () {
            var _this=this;
            function listSelect(ev) {
                var event=ev||window.event;
                var target=event.target||event.srcElement;
                if (target.parentNode.nodeName==='LI'){
                    for (var i=0,len=_this.listItem.length;i<len;i++){
                        tool.removeClass(_this.listItem[i],'active');
                    }
                    tool.addClass(target.parentNode,'active');
                    var oItemBg=target.previousElementSibling;
                    var x=event.clientX-target.getBoundingClientRect().left;
                    var y=event.clientY-target.getBoundingClientRect().top;
                    _this.itemBg(oItemBg,x,y);
                }
            }
            //列表项点击事件
            tool.addEvent(this.node,'click',listSelect);
            //监听菜单按钮事件
            tool.addListen('menuBtnToggle',this.toggle,this);
        };
        return new MenuList();
    })();
    //主列表初始化
    oMenuList.init();

    // 导航头对象
    var oHeader=(function () {
        function Header() {
            this.node=document.getElementById('header');
            this.menuBtn=document.getElementById('menu_btn');
        }
        Header.prototype.menuBtnToggle=function (menuList) {
            tool.triggerEvent('menuBtnToggle');//发布按钮切换事件
            //切换按钮状态
            if(tool.hasClass(this.menuBtn,'active')){
                tool.removeClass(this.menuBtn,'active');
            }else {
                tool.addClass(this.menuBtn,'active');
            }
        };
        Header.prototype.init=function () {
            tool.addEvent(this.menuBtn,'click',this.menuBtnToggle.bind(this));
        };
        return new Header();
    })();
    //头部导航初始化
    oHeader.init();

    // 主体内容区对象
    var oMainContent=(function () {
        function MainContent() {
            this.node=document.getElementById('main_content');
            this.item=document.getElementById('content_item');
            this.coverLoading=document.getElementById('cover_loading');
            this.animateContainer=document.getElementById('animate_container');
            this.current='';
        }
        //获取主体内容
        MainContent.prototype.getItem=function (url) {
            var _this=this;
            clearTimeout(this.timer_cover);
            // 显示遮罩加载动画
            this.coverLoading.style.display='block';
            //设置内容链接
            this.item.setAttribute('src',url);
            //加载完成后隐藏遮罩
            tool.addEvent(this.item,'load',function () {
                this.timer_cover=setTimeout(function () {  //加载完成后再延迟1秒，防止页面抖动
                    _this.coverLoading.style.display='none';
                },1000);
            }.bind(this))
        };
        // 主体区域移动动画
        MainContent.prototype.Move=function (x,duration,delay,easing) {
            tool.animation(this.node,{'left':x},duration,delay,easing);
        };
        MainContent.prototype.init=function () {
            //监听列表切换事件以响应区域移动
            tool.addListen('listToggle',this.Move,this);
        };
        return new MainContent();
    })();
    //主体内容初始化
    oMainContent.init();

    /*//加载动画
    var loadingAnimate=(function () {
        var component=oMainContent.coverLoading.getElementsByTagName('li');
        var in_w=parseInt(tool.getStyle(component[0],'width')); //动画部件宽度
        return function () {
            var out_w=parseInt(tool.getStyle(oMainContent.animateContainer,'width')); //获取动画容器宽度
            for (var i=0,len=component.length;i<len;i++){
                tool.animation(component[i],{'left':out_w/2,'opacity':1},1000,200*i,'easeOutQuad',function (i) {
                    tool.animation(component[i],{'left':out_w,'opacity':1},1000,0,'easeInOutQuad',function () {
                        component[i].style.left=-in_w+'px';
                    }.bind(this,i));
                }.bind(this,i));
            }
        }
    })();
*/
    //悬浮按钮
    var floatBtn={
        linkNode:document.getElementById('get_detail'),
        linkUrl:'https://github.com/chenc11211',
        setUrl:function (path) {
            this.linkNode.setAttribute('href','https://github.com/chenc11211/'+path);
        }
    };
    tool.addListen('refresh',floatBtn.setUrl,floatBtn);//监听路由刷新事件以更新链接

    //路由映射
    function Router() {
        this.root='';
        this.current='';
        this.map={};
    }
    //刷新路径
    Router.prototype.refresh=function () {
        // 获取当前hash
        this.current=window.location.hash.slice(1);
        if (!this.map[this.current]){  //若找不到路径则回到根路径
            this.current=this.root;
        }
        tool.triggerEvent('refresh',this.current);//发布刷新事件
        this.startTo(this.current);
    };
    Router.prototype.init=function () {
        tool.addEvent(window,'hashchange',this.refresh.bind(this));
        this.refresh();
    };
    //路由至
    Router.prototype.startTo=function (target) {
        this.map[target]();
    };
    //映射注册
    Router.prototype.register=function (target,fn) {
        if(typeof fn==='function'){
            this.map[target]=fn;
        }else {
            console.log('路径'+target+'注册映射失败！');
        }
    };

    var router=new Router();

    // 注册映射
    router.register('',function () {
        oMainContent.getItem('');
    });
    router.register('ColorfulCharacters',function () {
        oMainContent.getItem('https://htmlpreview.github.io/?https://github.com/chenc11211/ColorfulCharacters/blob/master/index.html');
    });
    router.register('AnimationLoading',function () {
        oMainContent.getItem('https://htmlpreview.github.io/?https://github.com/chenc11211/AnimationLoading/blob/master/index.html');
    });
    router.register('JavaScript-Tree',function () {
        oMainContent.getItem('https://htmlpreview.github.io/?https://github.com/chenc11211/JavaScript-Tree/blob/master/index.html');
    });
    router.register('NewsPaper',function () {
        oMainContent.getItem('https://htmlpreview.github.io/?https://github.com/chenc11211/NewsPaper/blob/master/index.html');
    });
    router.register('GluttonousSnake',function () {
        oMainContent.getItem('https://htmlpreview.github.io/?https://github.com/chenc11211/GluttonousSnake/blob/master/index.html');
    });
    router.register('HugeCanvas',function () {
        oMainContent.getItem('https://htmlpreview.github.io/?https://github.com/chenc11211/HugeCanvas/blob/master/index.html');
    });
    router.register('MusicPlayer',function () {
        oMainContent.getItem('https://htmlpreview.github.io/?https://github.com/chenc11211/MusicPlayer/blob/master/index.html');
    });
    router.register('MarkdownParser',function () {
        oMainContent.getItem('https://htmlpreview.github.io/?https://github.com/chenc11211/MarkdownParser/blob/master/index.html');
    });
	router.register('Terminal',function () {
        oMainContent.getItem('https://chenc11211.github.io/Terminal/dist/');
    });

    router.init();

    //显示更新电池电量
    (function () {
        var battery=document.getElementById('battery');
        var currentBattery=document.getElementById('battery_current');
        var batteryCharging=document.getElementById('battery_charging');
        function setBattery(manager) {
            var current_percent=manager.level*100+'%';//当前电量百分比
            currentBattery.style.height=current_percent;
            var info=current_percent;
            //判断是否正在充电
            if(manager.charging){
                batteryCharging.style.display='block';
                info+='充电中';
            }else {
                batteryCharging.style.display='none';
            }
            battery.setAttribute('title',info);
        }
        try{
            window.navigator.getBattery().then(function (manager) {
                setBattery(manager);
                // 设置更新计时器
                setInterval(function () {
                    window.navigator.getBattery().then(setBattery);
                },1000);
            });
        }catch (e){//不支持电量信息则隐藏电池组件
            document.getElementById('battery').style.display='none'
        }
    })();

    //格式化日期
    function formatDate(dateInfo) {
        var date=new Date(dateInfo);
        var year=date.getFullYear(),
            month=date.getMonth()+1,
            day=date.getDate(),
            hours=date.getHours(),
            minutes=date.getMinutes(),
            seconds=date.getSeconds();
        var dataFormat={
            year:year,
            month:month,
            day:day,
            hours:hours,
            minutes:minutes,
            seconds:seconds
        };
        for (var item in dataFormat){
            if (dataFormat[item]<10){
                dataFormat[item]='0'+dataFormat[item];
            }
        }
        return dataFormat;
    }

    //显示更新当前日期
    (function () {
        var currentHours=document.getElementById('current_hours');
        var current_date=document.getElementById('current_date');
        function setTimer() {
            var dataFormat=formatDate(Date.now());
            currentHours.innerHTML=dataFormat.hours+':'+dataFormat.minutes;
            current_date.innerHTML=dataFormat.year+'/'+dataFormat.month+'/'+dataFormat.day;
        }
        setTimer();
        setInterval(setTimer,1000);

    })();


};

var homeTpl = require("../tpls/home.string");
var util = require("../utils/commonUtil");

SPA.defineView("home",{
	html:homeTpl,
	plugins:["delegated",{
		name:"avalon",
		options:function(vm){
           // vm是avalon的实例
           vm.livedata = [];
           vm.nav = ["足球生活","足球现场","足球美女"];
          /* vm.str = "<h2>hello</h2>";
           vm.img = "/footballApp/images/Pikachu.jpg";*/
		}
	}],

	//所有放在init里的内容，都可以通过this去引用
	init:{
		originData:[],
		mainSwiper:null,
       dataFormat:function(data){
           var tempArr = [];
           for(var i=0,len=Math.ceil(data.length/2);i<len;i++){ // 0 1 2
              tempArr[i] = [];
              tempArr[i].push(data[i*2]);
              data[i*2+1] && tempArr[i].push(data[i*2+1]);
           }
           return tempArr;
       }
	},
	bindEvents:{
		beforeShow:function(){
			var _this = this;
			var vm = this.getVM();   //取到vm的实例
            $.ajax({
            	/*url:"/footballApp/mock/livelist.json",*/
            	url:"/api/getlive.php",
            	type:"get",
            	data:{
                   action:"origin"
            	},
            	success:function(result){
            		_this.originData=result.data;
                    vm.livedata = _this.dataFormat(_this.originData);
            	}
            })
		},
		show:function(){
			var _this=this;
			var containerSwiper = new Swiper("#swiper-container",{
				onSlideChangeStart:function(swiper){
                    var $li = $("#title li").eq(swiper.activeIndex);
                    util.setFocus($li);
				}
			});
			_this.mainSwiper = new Swiper("#swiper-main",{
				onSlideChangeStart:function(swiper){
                    var $li = $("#nav li").eq(swiper.activeIndex);
                    util.setFocus($li);
				}
			});
			// 下拉刷新和上拉加载
			var mainScroll = this.widgets.mainScroll; // 获取iscroll的实例
			var scrollSize = 30;
			// 隐藏下拉刷新
			mainScroll.scrollBy(0,-scrollSize);
			
			// 获取head中的img及head当前的状态
			var headImg = $(".head img");
			var topImgHasClass = headImg.hasClass("up");
			var footImg = $(".foot img");
			var bottomImgHasClass = footImg.hasClass("down");
			  var vm=_this.getVM();

			// 当滚动的时候
			mainScroll.on("scroll",function(){
			    // 获取当前滚动条的位置
			    var y = this.y;
			    // 计算最大的滚动范围
			    var maxY = this.maxScrollY - y;
			    
			    // 如果是下拉
			    if(y>=0){
			       !topImgHasClass && headImg.addClass("up");
			       return "";
			    }
			    // 如果是上拉
			    if(maxY>=0){
			       !bottomImgHasClass && footImg.addClass("down");
			       return "";
			    }
			})

			// 当滚动结束刷新数据时
			mainScroll.on("scrollEnd",function(){
				var that=this;
			    if(this.y >= -scrollSize && this.y < 0){
			        mainScroll.scrollTo(0,-scrollSize);
			        headImg.removeClass("up");
			    }else if(this.y>=0){
			        headImg.attr("src","/footballApp/images/ajax-loader.gif");
			      
			        $.ajax({
                        url:"/api/getlive.php",
                        type:"get",
                        data:{
                        	action:"refresh"
                        },
                        success:function(result){
                        	var data=result.data.concat(_this.originData)
                           //console.log(_this.originData)
                           //console.log(data)
                           vm.livedata=_this.dataFormat(data);
                           mainScroll.scrollTo(0,that.y+that.maxScrollY);
                           headImg.removeClass("up");
                           mainScroll.refresh();
                        }
			        })
			    }
			    // 计算最大的滚动范围
			   var maxY = this.maxScrollY - this.y;
			    var self = this;
			    if(maxY>-scrollSize && maxY<0){
			        mainScroll.scrollTo(0,this.maxScrollY+scrollSize);
			        footImg.removeClass("down");
			    }else if(maxY>=0){
			       footImg.attr("src","/footballApp/images/ajax-loader.gif");
			       console.log(123)
			       $.ajax({
			       		url:"/api/getlive.php",
			       		type:"get",
			       		data:{
			       			action:"more"
			       		},
			           success:function(result){
                        	var data=_this.originData.concat(result.data)
                 
                           vm.livedata=_this.dataFormat(data);
                           mainScroll.scrollTo(this.maxScrollY+scrollSize,0);
                           footImg.removeClass("down");
                           mainScroll.refresh();
                        }
			       })
			    }
			})
	     }
	},
	bindActions:{
		"tap.slide":function(e){
			var index = $(e.el).index();
			this.mainSwiper.slideTo(index)
		}
	}
})
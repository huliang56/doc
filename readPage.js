基于Bookblock.js的翻页加载

/************************ 动态读取页面内容 ************************/
/**
 * 采用Ajax方法获取页面内容
 * author:huliang;
 * date:2017/6/8
 */
// 可翻书的对象
var BB;
// 翻页插件中，要显示的页（主要用于首次进入时）
var currentIndex = 0;
// 判断当前状态是否可以执行翻页操作
var handleFlag = true;
// 两次翻书的间隔时间，防止快速翻页出现BUG
var timeOut = 1200;
// 设置向前、向后翻页的标志
var ftn = "";
// 书本内容所在域名
var contentPath = "";
/**
 * 用于表示在加载content文件夹下的html的规则
 * loadType = 1 ，逐个加载页面
 * loadType = 2 ，只加载奇数页
 * @type {Number}
 */
var loadType = 1;
// 当前显示的页号
var currentPage = 1;
// 书本中页面的总数量（总数量+2）
var maxPage = 22;

// 注册翻书插件
function initBookBlock() {
    var bookblock = document.getElementById('bb-bookblock');
    BB = new BookBlock(bookblock, {
        speed: 1000,
        shadowSides: 0.8,
        shadowFlip: 0.7,
        onEndFlip: function(page, isLimit) {
            return false;
        }
    });
}

// 当检测到向前翻页的事件时执行
function whenClickPrevBtn() {
    // 根据handleFlag的处理情况，判断是否响应此次操作
    if (handleFlag) {
        handleFlag = false;
        // timeOut毫秒内，不重复响应其它操作
        setTimeout(function() {handleFlag = true;}, timeOut);

        // 判断是否是第一页
        if (currentPage == loadType + 1) {
            BB.prev();
            return;
        }
        ftn = "prePage";
        prePage();
    }
}
// 当检测到向后翻页的事件时执行
function whenClickNextBtn() {
    // 根据handleFlag的处理情况，判断是否响应此次操作
    if (handleFlag) {
        handleFlag = false;
        // timeOut毫秒内，不重复响应其它操作
        setTimeout(function() {handleFlag = true;}, timeOut);

        // 判断是否是最后一页
        if (maxPage - currentPage <= 2) {
            BB.next();
            return;
        }
        ftn = "nextPage";
        nextPage();
    }
}

/* 获取页面链接上的hash，用于判定当前的页面的值 */
function loadCurPageByHash() {
	var search = window.location.search;
	if(search.length){
		var _array = search.split("=");
		currentPage = Number(_array[_array.length - 1]);
	}
}

/**
 * 判断页面是否已被加载
 * @param  {[Number]}  currentPage [当前页]
 * @return {Boolean}
 */
function isPageLoaded(currentPage) {
	var id = "page_" + currentPage;
	var html = document.getElementById(id);
	return $(html).length ? true : false;
}

/* 向 右→ 翻页 */
function prePage() {
	currentPage = currentPage - loadType*2;
    // 翻页时执行的函数，关闭视频、音频、弹窗等
    whenTurnPage(currentPage);

    if(isPageLoaded(currentPage)){
        // 页面已加载，重新设置currentPage
        currentPage = Number(currentPage + loadType);
        BB.prev();
        currentIndex--;
        return;
    }else{
        // 加载新页面
        doLoadPage(currentPage);
    }
}
/* 向 ←左 翻页 */
function nextPage() {
    // 翻页时执行的函数，关闭视频、音频、弹窗等
    whenTurnPage(currentPage);

    if(isPageLoaded(currentPage)){
        // 页面已加载，重新设置currentPage
	    currentPage = Number(currentPage + loadType);
        BB.next();
        currentIndex++;
        return;
    }else{
        // 加载新页面
        doLoadPage(currentPage);
    }
}

/**
 * 通过Ajax请求页面内容
 * @param  {[type]} currentPage [当前页]
 */
function doLoadPage(currentPage) {
  var fileName = contentPath + "content/" + currentPage + ".html";
  $.ajax({
    url: fileName,
    type: "GET",
    async: true,
    success: function(data) {
        editContent(data);
    }
  });
}
/**
 * 根据页面内容，拼接bb-item，最后执行翻页操作
 * @param  {[type]} content ajax获取的内容
 */
function editContent(content) {
	var htmlPage = "";
	htmlPage = '<div class="bb-item" id="page_' + currentPage + '">' + content + '</div>';
	// 重新设置currentPage
	currentPage = Number(currentPage + loadType);
	appendPage(htmlPage);
    // 若翻书插件未注册，则注册
    !BB && initBookBlock();
    if (ftn == 'nextPage') {
        BB.update();
		BB.next();
		currentIndex++;
	} else if (ftn == 'prePage') {
		// currentIndex初始为0，因为在0前添加一页，所以当前的值应为1，所以此处加一
		currentIndex++;
        BB.update();
		BB.prev();
		currentIndex--;
	}
}
/* 将页面添加到书中 */
function appendPage(content) {
	// 根据ftn的值判断内容是追加在尾部，还是追加在头部
	if (ftn == "nextPage") {
		$("#bb-bookblock").append(content);
	} else {
		$("#bb-bookblock").prepend(content);
	}
	//当翻页追加内容时，执行的函数
	whenAppendPage(currentPage - 2);
	return;
}

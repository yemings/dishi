var menu = null,
	list = null,
	main = null;
var showMenu = false;
mui.init({
	subpages: [{
		id: 'list',
		url: 'list.html',
		styles: {
			top: '45px',
			bottom: 0,
			bounce: 'vertical'
		}
	}]
});

mui.plusReady(function() {
	if (mui.os.android) {
		plus.screen.lockOrientation("portrait-primary");
	}
	main = plus.webview.currentWebview();
	main.addEventListener('maskClick', closeMenu);
	//处理侧滑导航，为了避免和子页面初始化等竞争资源，延迟加载侧滑页面；
	setTimeout(function() {
		menu = mui.preload({
			id: 'index-menu',
			url: 'index-menu.html',
			styles: {
				left: 0,
				width: '70%',
				zindex: -1
			},
			show: {
				aniShow: 'none'
			}
		});
	}, 200);
});

/**
 * 显示侧滑菜单
 */
function openMenu() {
	if (!showMenu) {
		//侧滑菜单处于隐藏状态，则立即显示出来；
		menu.show('none', 0, function() {
			//主窗体开始侧滑并显示遮罩
			main.setStyle({
				mask: 'rgba(0,0,0,0.4)',
				left: '70%',
				transition: {
					duration: 150
				}
			});
			showMenu = true;
		});
	}
}

/**
 * 关闭菜单
 */
function closeMenu() {
	if (showMenu) {
		//关闭遮罩；
		//主窗体开始侧滑；
		main.setStyle({
			mask: 'none',
			left: '0',
			transition: {
				duration: 200
			}
		});
		showMenu = false;
		//等动画结束后，隐藏菜单webview，节省资源；
		setTimeout(function() {
			menu.hide();
		}, 300);
	}
}

//点击左上角侧滑图标，打开侧滑菜单；
document.querySelector('.mui-icon-bars').addEventListener('tap', function() {
	if (showMenu) {
		closeMenu();
	} else {
		openMenu();
	}
});

//主界面向右滑动，若菜单未显示，则显示菜单；否则不做任何操作
window.addEventListener("swiperight", openMenu);
//主界面向左滑动，若菜单已显示，则关闭菜单；否则，不做任何操作；
window.addEventListener("swipeleft", closeMenu);
//侧滑菜单触发关闭菜单命令
window.addEventListener("menu:close", closeMenu);
window.addEventListener("menu:open", openMenu);

//重写mui.menu方法，Android版本menu按键按下可自动打开、关闭侧滑菜单；
mui.menu = function() {
	if (showMenu) {
		closeMenu();
	} else {
		openMenu();
	}
}

//首页返回键处理
//处理逻辑：1秒内，连续两次按返回键，则退出应用；
var first = null;
mui.back = function() {
	if (showMenu) {
		closeMenu();
	} else {
		//首次按键，提示‘再按一次退出应用’
		if (!first) {
			first = new Date().getTime();
			mui.toast('再按一次退出应用');
			setTimeout(function() {
				first = null;
			}, 1000);
		} else {
			if (new Date().getTime() - first < 1000) {
				plus.runtime.quit();
			}
		}
	}
};
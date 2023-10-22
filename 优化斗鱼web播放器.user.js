// ==UserScript==
// @name         优化斗鱼web播放器
// @namespace    https://www.liebev.site/monkey/better-douyu
// @version      2.0.2_b
// @description  douyu优化斗鱼web播放器，通过关闭直播间全屏时的背景虚化效果以及定时清除弹幕DOM来解决闪屏卡顿的问题，屏蔽独立直播间的弹幕显示，移除文字水印，添加了一些快捷键
// @author       LiebeV
// @license      MIT: Copyright (c) 2023 LiebeV
// @match        https://www.douyu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=douyu.com
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

"use strict";

//更新日志，v2.0.2，修改了全部快捷键修饰键的判断方式，以兼容AltGr布局
//**NOTE**:之于页面上其他不想要看到的东西，请搭配其他例如AdBlock之类的专业广告屏蔽器使用，本脚本不提供长久的css更新维护
//已知问题，"AltGr + u"无法正确调用full函数（推测原因，在AltGr事件之前存在Ctrl事件，而Crtl+U为浏览器级快捷键）
//更新计划，为清除右侧弹幕的功能添加相关自定义功能（请关注主页新项目--“全等级弹幕屏蔽”，“优化斗鱼web鱼吧”）。完整重写

// 定义一些let变量
let roomIds = GM_getValue("roomIds", []);
const userRoomIds = roomIds;
// let isFull = 0;
// let isWide = 0;
var IntervalId;
let IntervalRun = false;
const listenerMap = new Map([
    ["l", rewrite],
    ["u", full],
    ["w", wide],
])

// 屏蔽虚化背景以及文字水印的css
async function blur() {
    console.debug("已经创建blur样式表");
    return `._1Osm4fzGmcuRK9M8IVy3u6,.watermark-442a18,.is-ybHotDebate,.view-67255d.zoomIn-0f4645{visibility: hidden !important;}`;
}

// 屏蔽右侧弹幕区及飘屏弹幕区的css
// 保留礼物展示
async function danmu() {
    const url = window.location.href;

    if (userRoomIds.some((roomId) => url.includes(roomId))) {
        console.debug("已经创建danmu样式表");
        return `.Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: hidden !important;}`;
    } else {
        console.debug("无需更新danmu样式表");
        return `.Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: unset !important;}`;
    }
}

// 用于合并其他本人制作的脚本中生成的css
async function addStyle(css) {
    const liebev = document.getElementById("LiebeV");
    // console.debug(liebev);
    if (liebev) {
        liebev.innerHTML = css;
        console.debug("原css已更新");
    } else {
        // 此脚本单独运作时创建liebev标签
        const style = document.createElement("style");
        style.id = "LiebeV";
        style.type = "text/css";

        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
        console.debug("新css已插入");
    }
}

async function showSettings() {
    let message = "当前设置的房间号列表：\n";
    const idList = GM_getValue("roomIds", []);
    for (let i = 0; i < idList.length; i++) {
        message += `${i + 1}. ${idList[i]}\n`;
    }
    const roomIdInput = prompt(`${message}\n请输入要移除（恢复）弹幕的房间号房间号：`);
    if (roomIdInput) {
        updateRoomId(roomIdInput);
    }
}

GM_registerMenuCommand("房间号设置", showSettings);

// 接受用户输入，进入判断分支
async function updateRoomId(roomId) {
    if (!roomIds.includes(roomId)) {
        roomIds.push(roomId);
        console.debug(`已添加房间号 ${roomId}`);
        GM_setValue("roomIds", roomIds);
        await DMbye();
    } else {
        const index = roomIds.indexOf(roomId);
        if (index !== -1) {
            roomIds.splice(index, 1);
            console.debug(`已移除房间号 ${roomId}`);
            GM_setValue("roomIds", roomIds);
            await DMback();
        } else {
            console.debug(`输入不合法`);
        }
    }
}

// DMbye和back是setting修改时调用的函数
async function DMbye() {
    const css = `._1Osm4fzGmcuRK9M8IVy3u6,.watermark-442a18,.is-ybHotDebate.view-67255d.zoomIn-0f4645{visibility: hidden !important;}.Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: hidden !important;}`;
    addStyle(css);
}

async function DMback() {
    const css = `._1Osm4fzGmcuRK9M8IVy3u6,.watermark-442a18,.is-ybHotDebate.view-67255d.zoomIn-0f4645{visibility: hidden !important;}.Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: unset !important;}`;
    addStyle(css);
}

async function listener() {
    for (const [key, func] of listenerMap) {
        document.addEventListener("keydown", function(event) {
            if ((event.getModifierState("Alt") || event.getModifierState("AltGraph")) && event.key.toLowerCase() === key) {
                func();
            }
        });
    }
    document.addEventListener("keydown", function (event) {
        if ((event.getModifierState("Alt") || event.getModifierState("AltGraph")) && event.key >= "1" && event.key <= "5") {
            // console.debug("RES快捷键触发");
            res(parseInt(event.key));
        }
    });
    document.addEventListener("keydown", function (event) {
        if ((event.getModifierState("Alt") || event.getModifierState("AltGraph")) && event.key >= "6" && event.key <= "9") {
            // console.debug("LINE快捷键触发");
            line(parseInt(event.key));
        }
    });
}

// 类似DMbye和back，但是由快捷键触发
async function rewrite() {
    const liebev = document.getElementById("LiebeV");
    const checker = liebev.innerHTML;
    var css;
    if (
        checker.indexOf(
            ".Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: unset !important;}"
        ) !== -1
    ) {
        css = checker.replace(
            ".Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: unset !important;}",
            ".Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: hidden !important;}"
        );
    } else {
        css = checker.replace(
            ".Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: hidden !important;}",
            ".Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: unset !important;}"
        );
    }
    // console.debug(css);
    addStyle(css);
}

// 发送浏览器全屏/退出全屏事件
// 无需等待控件加载完成
async function full() {
    if (!document.fullscreenElement) {
        document.querySelector("#js-player-video-case").requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// 模拟双击".video-container-dbc7dc"
// 因为网页原本就提供了双击播放器来切换的功能，故不做修改
async function wide() {
    let evt = new MouseEvent("dblclick", {
        bubbles: true,
        cancelable: true,
    });
    document.querySelector(".video-container-dbc7dc").dispatchEvent(evt);
}

// 点击原播放器控件来调整清晰度
// 最多只见过5个选项。原画/8M/4M/超清/高清。溢出也不会影响
async function res(numberkey) {
    const resinput = document.querySelector(".tipItem-898596 input[value='画质 ']");
    const resul = resinput.nextSibling;
    let reslist = [];
    resul.childNodes.forEach(function (li) {
        reslist.push(li);
    });
    // console.debug(reslist);
    const choice = numberkey - 1;
    reslist[choice].click();
}

// 找到了可以用于切换线路可点击的标签
// 最多只见过4个选项。溢出也不会影响
async function line(numberkey) {
    const lineinput = document.querySelectorAll("ul.menu-da2a9e li");
    const alllines = Array.from(lineinput).filter(li => li.textContent.includes('线路'));
    let linelist = [];
    alllines.forEach(function (li) {
        linelist.push(li);
    });
    const choice = numberkey - 6;
    linelist[choice].click();
}

// 点击原弹幕区控件来清除DOM节点（网页默认DOM上限为200）
async function rightdomremove() {
    var clearbtn = document.querySelector(".Barrage-toolbarClear");
    clearbtn.click();
    console.debug("doms been removed");
}

async function ifintervalrun() {
    if (IntervalRun == true) {
        // 定时触发清屏（60s）
        IntervalId = setInterval(rightdomremove, 60 * 1000);
        IntervalRun = false;
        console.debug("已设置定时清屏");
    } else {
        clearInterval(IntervalId);
        IntervalRun = true;
        console.debug("已关闭定时清屏");
    }
}

GM_registerMenuCommand("定时清屏右侧弹幕", function () {
    const isConfirm = confirm(
        // 因为初始化调用时更改了IntervalRun的值，所以表达式逻辑相反
        `当前定时器状态：${IntervalRun ? "禁用" : "启用"}\n是否切换定时器状态？`
    );
    if (isConfirm) {
        ifintervalrun();
    }
});

(async function () {
    const blurcss = await blur();
    const danmucss = await danmu();
    const css = blurcss + danmucss;
    console.debug("样式表已合并" + css);
    addStyle(css);
    // 添加全部eventlistener
    listener();
    ifintervalrun();
})();

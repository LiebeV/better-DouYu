// ==UserScript==
// @name         优化斗鱼web播放器
// @namespace    https://www.liebev.site
// @version      1.1
// @description  优化斗鱼web播放器，通过关闭直播间全屏时的背景虚化效果来解决闪屏的问题，屏蔽独立直播间的弹幕显示，移除文字水印
// @author       LiebeV
// @license      MIT; https://opensource.org/licenses/MIT; LiebeV
// @match        https://www.douyu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=douyu.com
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

'use strict';

let roomIds = GM_getValue('roomIds', '[]');
const userRoomIds = roomIds;

async function blur() {
    console.log('已经创建blur样式表');
    return `
    ._1Osm4fzGmcuRK9M8IVy3u6,
    .watermark-442a18{
      visibility: hidden !important;
    }
    `;
}

//保留右侧弹幕区会被置顶留存的弹幕内容
//保留礼物展示
async function danmu() {
    const url = window.location.href;

    if (userRoomIds.some(roomId => url.includes(roomId))) {
        console.log('已经创建danmu样式表');
        return `
        .Barrage-main,
        .comment-37342a {
          visibility: hidden !important;
        }
        `;
    } else {
        console.log('无需创建danmu样式表');
        return '';
    }
}

async function updateRoomId(roomId) {
    if (!roomIds.includes(roomId)) {
        roomIds.push(roomId);
        console.log(`已添加房间号 ${roomId}`);
        GM_setValue('roomIds', roomIds);
    } else {
        const index = roomIds.indexOf(roomId);
        if (index !== -1) {
            roomIds.splice(index, 1);
            console.log(`已移除房间号 ${roomId}`);
            GM_setValue('roomIds', roomIds);
        } else {
            console.log(`输入不合法`);
        }
    }
}

async function showSettings() {
    let message = "当前设置的房间号列表：\n";
    const idList = GM_getValue('roomIds', '[]');
    for (let i = 0; i < idList.length; i++) {
        message += `${i + 1}. ${idList[i]}\n`;
    }

    const roomIdInput = prompt(`${message}\n请输入要移除（恢复）弹幕的房间号：（点击确定后请刷新网页以使其生效）`);
    if (roomIdInput) {
        updateRoomId(roomIdInput);
    }
}

GM_registerMenuCommand('房间号设置', showSettings);

async function addStyle(css) {
    const style = document.createElement('style');
    style.id = 'LiebeV';
    style.type = 'text/css';

    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    console.log('css已插入');
}

(async function () {
    const blurcss = await blur();
    const danmucss = await danmu();
    const css = blurcss + danmucss;
    console.log('样式表已合并' + css);
    addStyle(css);
})();

//已知问题，无
//更新计划，添加设置反馈

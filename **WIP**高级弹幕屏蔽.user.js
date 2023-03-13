// ==UserScript==
// @name         高级弹幕屏蔽
// @namespace    https://www.liebev.site
// @version      0.2
// @description  douyu斗鱼，高级弹幕屏蔽，突破30级等级屏蔽限制
// @author       LiebeV
// @match        https://www.douyu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=douyu.com
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

'use strict';


// async function getList() {
//     //获取当前列表

//     const dmList = ulList.children;

//     for (var i = 0; i < dmList.length; i++) {
//         var spanList = dmList[i].querySelectorAll("span.Barrage-nickName[title]");
//         for (var j = 0; j < spanList.length; j++) {
//             var title = spanList[j].getAttribute("title");
//             // 输出标题到控制台
//             console.log(title);
//         }
//     }
// }

//尝试获取弹幕区
const ulList = document.getElementById("js-barrage-list");
console.log('已获取弹幕区');
console.log(ulList);
let bannedIds = GM_getValue('bannedIds', '[]');


//比对id，更改父元素css
async function ban(userId) {
    console.log("ban函数接收到userId，进行放行判断");
    console.log(userId);
    if (bannedIds.includes(userId)) {
        console.log("弹幕进入屏蔽分支");
        const spanElements = document.querySelectorAll(`span[title="${userId}"]`);
        console.log("已选取需屏蔽的弹幕元素");
        for (let i = spanElements.length - 1; i >= 0; i--) {
            const spanElement = spanElements[i];
            const liElement = spanElement.parentNode.parentNode;
            liElement.style.display = 'none';
            console.log(`"${userId}" 的发言已被屏蔽!`);
        }
    }else{
        console.log("放行");
    }
}

//获取span标签title属性，传入ban函数
async function getId(node) {
    const userId = node.querySelector("span.Barrage-nickName[title]").getAttribute("title");
    console.log('用户id：' + userId);
    console.log("已将id传入ban函数");
    ban(userId);
}

//mutation observer
async function MO() {
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (node.nodeName === 'LI') {
                    console.log('感知到新弹幕：');
                    console.log(node);
                    getId(node);
                }
            });
        });
    });

    const config = { childList: true };
    observer.observe(ulList, config);
}

//通过setValue像存储器添加id
async function addId(userIdInput) {
    console.log(`addId接收到传入`);
    if (!bannedIds.includes(userIdInput)) {
        bannedIds.push(userIdInput);
        console.log(`已添加屏蔽用户： ${userIdInput}`);
        GM_setValue('bannedIds', bannedIds);
    } else {
        console.log(`添加失败`);
    }
}

async function showSettings() {
    const userIdInput = prompt(`请输入要屏蔽发言的用户id：（当你下次进入房间时生效）`);
    if (userIdInput) {
        console.log('接收到用户id，传入addId');
        addId(userIdInput);
    }
}

GM_registerMenuCommand('添加屏蔽用户', showSettings);

(function () {
    MO();
})();

//v0.1 -- 依托答辩
//v0.2 -- 右侧弹幕区屏蔽功能完善
//（v0.3） -- 飘屏区弹幕屏蔽

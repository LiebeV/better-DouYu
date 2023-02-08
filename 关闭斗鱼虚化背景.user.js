// ==UserScript==
// @name         关闭斗鱼虚化背景
// @namespace    https://www.liebev.site
// @version      0.1
// @description  通过关闭直播间全屏时的背景虚化效果来解决闪屏的问题
// @author       LiebeV
// @match        https://www.douyu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=douyu.com
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    let css=`
        .KpgOK77CDz9VkQfj_NamO{
            visibility: hidden !important
        }
    `
    GM_addStyle(css)
})();
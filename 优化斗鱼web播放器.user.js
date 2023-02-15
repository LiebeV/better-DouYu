// ==UserScript==
// @name         优化斗鱼web播放器
// @namespace    https://www.liebev.site
// @version      0.2.1
// @description  通过关闭直播间全屏时的背景虚化效果来解决闪屏的问题
// @author       LiebeV
// @match        https://www.douyu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=douyu.com
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    let css=`
        canvas{
            visibility: hidden !important
        }
        .watermark-442a18{
            display: none !important
        }
    `
    GM_addStyle(css)
})();
// 无法确认虚化背景类名是否不变，使用canvas代替类名定位，可能会关闭其他功能
// 关闭角落处文字水印，图片水印无法通过css定位

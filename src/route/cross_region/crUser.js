/**
 * TODO: consider update user's public info.
 *
 * 在 web-api 擷取朋友資訊時，不用刻意排序和區分 region, 批次的讀取出來後
 * web-api 再根據區域 (Tokyo, Taipei, Seattle...) 通知。
 * 同區域的丟自己的 folk-api;
 * 不同區域的透過對方的 web-api 進行協調。
 */

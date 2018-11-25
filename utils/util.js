const app = getApp()
//util.js
function now_time(){
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  var getMilliseconds = date.getMilliseconds();
  return  ''+year +  month +  day +  hour+ minute +  second+getMilliseconds+ Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10)
}
function imageUtil(e) {
  var imageSize = {};
  var originalWidth = e.detail.width;//图片原始宽
  var originalHeight = e.detail.height;//图片原始高
  var originalScale = originalHeight / originalWidth;//图片高宽比
  console.log('originalWidth: ' + originalWidth)
  console.log('originalHeight: ' + originalHeight)
  //获取屏幕宽高
  wx.getSystemInfo({
    success: function (res) {
      var windowWidth = res.windowWidth;
      var windowHeight = res.windowHeight;
      var windowscale = windowHeight / windowWidth;//屏幕高宽比
      console.log('windowWidth: ' + windowWidth)
      console.log('windowHeight: ' + windowHeight)
      if (originalScale < windowscale) {//图片高宽比小于屏幕高宽比
        //图片缩放后的宽为屏幕宽
        imageSize.imageWidth = windowWidth;
        imageSize.imageHeight = (windowWidth * originalHeight) / originalWidth;
      } else {//图片高宽比大于屏幕高宽比
        //图片缩放后的高为屏幕高
        imageSize.imageHeight = windowHeight;
        imageSize.imageWidth = (windowHeight * originalWidth) / originalHeight;
      }

    }
  })
  console.log('缩放后的宽: ' + imageSize.imageWidth)
  console.log('缩放后的高: ' + imageSize.imageHeight)
  return imageSize;
}

function formatTime(time) {
    if (typeof time !== 'number' || time < 0) {
        return time
    }

    var hour = parseInt(time / 3600)
    time = time % 3600
    var minute = parseInt(time / 60)
    time = time % 60
    // 这里秒钟也取整
    var second = parseInt(time)

    return ([hour, minute, second]).map(function (n) {
        n = n.toString()
        return n[1] ? n : '0' + n
    }).join(':')
}

/**
 * 注册JS方法
 * @type {{formatTime: formatTime, crtTimeFtt: crtTimeFtt, alert: alert, loginOpenId: loginOpenId, dialog: dialog, loading: loading, postJSON: postJSON, getJSON: getJSON, replaceStr: (function(*): string)}}
 */
module.exports = {
    now_time:now_time,
    formatTime: formatTime,
    crtTimeFtt: crtTimeFtt,
    ok_dialog: ok_dialog,
    loginOpenId: loginOpenId,
    info_dialog: info_dialog,
    loading: loading,
    postJSON: postJSON,
    getJSON: getJSON,
    replaceStr: replaceStr,
    getUserId: getUserId,
    unique: unique,
    isValidURL: isValidURL,
    deplay_redirect: deplay_redirect,
  alert: alert,
  imageUtil: imageUtil
}

/**
 * 替换字符串
 * @param str
 * @returns {string}
 */
function replaceStr(str) {
    return str.trim().replace(/[,]/g, " ");
}

/**
 * 删除重复的数组元素，只保留一个重复的元素
 * @param array
 * @returns {Array}
 */
function unique(array) {
    var temp = []; //一个新的临时数组
    for (var i = 0; i < array.length; i++) {
        if (temp.indexOf(array[i]) == -1) {
            temp.push(array[i]);
        }
    }
    return temp;
}


/**
 * 获取登录用户ID
 * @returns {*}
 */
function getUserId() {
    var wxid = wx.getStorageSync('wxid');
    if (wxid) {
        return wxid;
    }
  wx.login({
    success: function (res1) {
      if (res1.code) {
        wx.getUserInfo({
          success(res){
            wx.request({
              url: app.globalData.api_url + "/getwxInfo",
              data: {
                code: res1.code,
                rawData: res.rawData,
                signature: res.signature,
                encryptedData: res.encryptedData,
                iv: res.iv
              },
              method: "post",
              header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
              },
              success: function (res) {
                console.log(res.data);
                if (res.data.result == "success") {
                  wxid = res.data.data;
                  wx.setStorageSync('wxid', wxid);
                } else {
                  console.log(res.data);
                }
              }
            });
          }
        })
      }
    }
  })
    return wxid;
}
function alert(msg, time = 2000) {
  wx.showToast({
    title: msg,
    icon: 'none',
    duration: time,
  });
}
/**
 *  延迟跳转
 * @param redirect_url 延迟跳转url地址
 * @param timer 延迟时间，默认3秒
 */
function deplay_redirect(redirect_url, timer = 3000) {
    timer = setTimeout(function () {
        wx.redirectTo({
            url: redirect_url
        })
    }, timer);
}


/**
 * 用于网络 GET 请求, 标准格式: {url:api, method: GET, data: xxxx}
 */
function getJSON(form = {}, call_success) {
    var apiUrl = (form.apiUrl == "") ? '' : form.apiUrl;
    var formData = (form.data == "") ? {} : form.data;
    wx.request({
        url: apiUrl,
        data: formData,
        method: 'GET',
        header: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        success: call_success,
        failed: function (ErrorMsg) {
            console.log(ErrorMsg);
        }
    });
    wx.hideLoading();
}

/**
 * 用于网络 POST 请求, 标准格式: {url:api, method: GET, data: xxxx}, success, failed
 */
function postJSON(form = {}, call_success) {
    var apiUrl = (form.apiUrl == "") ? '' : form.apiUrl;
    var formData = (form.data == "") ? {} : form.data;
    wx.request({
        url: apiUrl,
        data: formData,
        method: 'POST',
        header: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        success: call_success,
        failed: function (ErrorMsg) {
            console.log(ErrorMsg);
        }
    });
    wx.hideLoading();
}


/**
 * 验证网址是否有效
 * @param url
 * @returns {boolean}
 */
function isValidURL(url) {
  if (/^(http[s]?):\/\/.+$/.test(url)) {
        return true;
    }
    return false;
}

/**
 * 正在加载提示
 */
function loading(msg = '') {
    if (msg == '') {
        wx.showLoading({
            title: "正在加载 ..."
        });
        return;
    }
    wx.showLoading({
        title: msg
    });
}

function dateTimes(dateTime) {
    var date = "";
    let year = dateTime.getFullYear();
    let month = (dateTime.getMonth().toString()).length < 2 ?
        "0" + (dateTime.getMonth() + 1) : (dateTime.getMonth() + 1);
    let day = (dateTime.getDay().toString().length < 2) ?
        '0' + dateTime.getDay() : dateTime.getDay();
    let hours = dateTime.getHours();
    let minutes = (dateTime.getMinutes().toString().length < 2) ?
        "0" + dateTime.getMinutes() : dateTime.getMinutes();
    let seconds = (dateTime.getSeconds().toString().length < 2) ?
        "0" + dateTime.getSeconds() : dateTime.getSeconds();

    date = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    return date;
}

//日期对象格式化公共类方法
function dateFtt(fmt, date) {
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function crtTimeFtt(fmt, value) {
    if (value != null) {
        var crtTime = new Date(value);
        return dateFtt(fmt, crtTime); //直接调用公共JS里面的时间类处理的办法
    }
}

/**
 * 提示框，默认只显示4秒
 * @param msg
 * @param time
 */
function info_dialog(msg, time = 4000) {
    wx.showToast({
        title: msg,
        icon: 'none',
        duration: time,
    });
}

/**
 * 获取用户登录ID
 * @param callback
 */
function loginOpenId(callback) {

}

/**
 * 用户确认框
 * @param title 提示标题
 * @param content 提示内容
 * @param callback 选择ok , 回调
 */
function ok_dialog(title, content, callback) {
    wx.showModal({
        // title: title,
        confirmColor: '#FF0000',
        content: content,
        success: function (sm) {
            if (sm.confirm) {
                callback(sm.confirm);
            } else if (sm.cancel) {
                console.log('用户点击取消')
            }
        }
    })
}
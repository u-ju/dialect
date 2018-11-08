.0// pages/modification_infor/modification_infor.js

const app = getApp()
var wxUtil = require("../../utils/util.js")

Page({

    /**
     * 页面的初始数据
     */
    data: {
        name: "",
        phone: "",
        head_url: '',
        avator_url: '',
        save: true,
        wxid: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    getPhoneNumber: function (e) {
        wx.login({
            success: res => {
                console.log(' ---------------- code -------------');
                console.log(res.code);
                wx.request({
                    url: app.globalData.api_url + "/getwxInfo",   // 解密地址
                    data: {
                        'encryptedData': encodeURIComponent(e.detail.encryptedData),
                        'iv': e.detail.iv,
                        'code': res.code
                    },
                    method: 'GET',
                    header: {
                        'content-type': 'application/json'
                    }, // 设置请求的 header
                    success: function (res) {
                        console.log(' ---------------- getPhone() result -------------')
                        console.log(res);
                        // if (res.status == 1) {//我后台设置的返回值为1是正确
                        //     console.log(res);
                        //     wx.setStorageSync('phone', res.phone);
                        // }
                    },
                    fail: function (err) {
                        console.log(err);
                    }
                });
            }
        });
    },

    onLoad: function (options) {
      const that = this;
      console.log(options.avatarUrl+"-------------")
        that.setData({
          head_url: options.avatarUrl||wx.getStorageSync("avatarUrl")
        })
      
      
      console.log(wx.getStorageSync("avatarUrl"))
        let wxid = wx.getStorageSync("wxid");
        let formUser = {
            apiUrl: app.globalData.api_url + "/person/show", //  个人信息接口
            data: {
                wxid: wxid,
            }
        }
        wxUtil.postJSON(formUser, function (res) {
          
            if (res.data.result == "success") {
              var userInfo = res.data.data, avatarUrl = "";
                console.log(' --------- userinfo2 -------');
                // console.log(userInfo)
                // console.log(userInfo.avatarUrl);
                // avatarUrl= userInfo.avatarUrl;
                // // 微信头像
                // if (!wxUtil.isValidURL(userInfo.avatarUrl)) {
                //     avatarUrl = app.globalData.img_url + userInfo.avatarUrl;
                //     console.log(' ----- 微信头像 ----- ')
                // }
             
                that.setData({
                    name: userInfo.nickName,
                    phone: userInfo.phone || "",
                  // head_url: avatarUrl,
                    wxid: wxid
                });
              console.log(avatarUrl)
            }
        });
      
    },

    /**
     * 更新个人用户资料
     */
    formSubmit: function (e) {
        const that = this;
        let wxid = wxUtil.getUserId();

        let formData = e.detail.value;
        let nickName = formData.name;
        let phone = formData.phone;
        let avatorUrl = that.data.avator_url;
        let id = that.data.id || "";
        console.log('----------- id ----------' + id);

        console.log(' ---------- wxid ------------');
        console.log(' ---------- submit form ------------');
        console.log(formData);

        let formSubmit = {
            apiUrl: app.globalData.api_url + "/person/save",  // 点赞接口
            data: {
                wxid: wxid,
                // 昵称, 手机号
                phone: phone,
                nickName: nickName,
                avatorUrl: avatorUrl,
                id: id,
            }
        };

        console.log(formSubmit);
        if (/^[1][3,4,5,7,8][0-9]{9}$/.test(phone)) {
            wxUtil.postJSON(formSubmit, function (res) {
                console.log(res.data);
                if (res.data.result == "success") {
                    wxUtil.info_dialog("更新账号成功");
                    wx.setStorageSync("phone", phone);
                  wx.setStorageSync("avatarUrl", that.data.avatorUrl)
                    wxUtil.deplay_redirect("../personal_center/personal_center")
                }
            });
        } else {
            wxUtil.info_dialog("请规范手机号")
        }
    },

    /**
     * 小程序用户头像上传
     */
    uploadHeadPhoto: function () {
        console.log('upload photo .... ');
        var that = this;
        wx.chooseImage({
            sizeType: ['compressed'],
            count: 1,
            success(res) {
                const tempFilePaths = res.tempFilePaths;
                // 只能选择一张图片进行上传
                if (tempFilePaths.length != 1) {
                    wxUtil.info_dialog("不允许多图上传");
                    return;
                }
                var tempFilesSize = res.tempFiles[0].size;
                console.log(tempFilesSize)
                if (tempFilesSize <= 2000000) {//图片小于或者等于2M时 可以执行获取图片
                    if (that.allowUploadFormat(tempFilePaths)) {
                        console.log(' ----- 验证后 ----- ')
                        console.log(tempFilePaths[0])
                        const src = res.tempFilePaths[0]
                        wx.navigateTo({
                          url: `../upload/upload?src=${src}`
                        })
                        
                    } else {
                        wxUtil.info_dialog("上传头像格式不合法!")
                    }
                } else {
                    wxUtil.info_dialog("上传图片不能大于2M!")
                }
            }
        })
    },
    input(e) {
      console.log()
      if (e.currentTarget.dataset.name == "name"){
        this.setData({
          name: e.detail.value
        })
      }else{
        this.setData({
          phone: e.detail.value
        })
      }
      if (!this.data.name && !this.data.phone){
        this.setData({
            save: true
        })
      }else{
        this.setData({
          save: false
        })
      }
        // if (e.detail.value) {
        //     this.setData({
        //         save: false
        //     })
        // } else {
        //     this.setData({
        //         save: true
        //     })
        // }
    },
    /**
     * 上传头像格式验证
     * @param tempFiles 头像图片
     * @returns {boolean} true 检测通过 false 检测失败
     */
    allowUploadFormat: function (tempFiles = []) {
        // 允许上传的图片格式
        var allow_head_photo = ['.jpg', '.jpeg', '.png'];

        for (let idx in tempFiles) {
            if (tempFiles[idx].match(/.jpg|.png|.jpeg/)) {
                var upload_pic_ext = tempFiles[idx].match(/.jpg|.png|.jpeg/)[0].trim();
                var allow_format = allow_head_photo.join("");
                if (allow_format.indexOf(upload_pic_ext) >= 0) {
                    return true;
                }
            }
            return false;
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
      // this.setData({
      //   head_url: wx.getStorageSync("avatarUrl") || "",
      // })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});
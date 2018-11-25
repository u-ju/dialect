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
        wxid: "",
      yzm:0,//是否修改手机号码  
      phone_js:"",//手机号 验证时用
      yzm_num:"",
      text: '获取验证码', //按钮文字
      currentTime: 60, //倒计时
      disabled: false, //按钮是否禁用
      yzmyz:0,//验证码验证  1成功  0失败
      click:true
    },

    /**
     * 生命周期函数--监听页面加载
     */
  //获取验证码按钮
  bindButtonTap: function () {
    var that = this;

    that.setData({
      disabled: true, //只要点击了按钮就让按钮禁用 （避免正常情况下多次触发定时器事件）
      
    })

    var phone = that.data.phone;
    var currentTime = that.data.currentTime //把手机号跟倒计时值变例成js值

    var warn = null; //warn为当手机号为空或格式不正确时提示用户的文字，默认为空

    if (phone == '') {
      warn = "号码不能为空";
    } else if (phone.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)) {
      warn = "手机号格式不正确";
    } else {
      

      let wxid = wxUtil.getUserId();
      let formUser = {
        apiUrl: app.globalData.api_url + "/validnum/send", //  个人信息接口
        data: {
          wxid: wxid,
          phone:that.data.phone
          }
      }
      wxUtil.postJSON(formUser, function (res) {
      
        if (res.data.result == "success") {
          //当手机号正确的时候提示用户短信验证码已经发送
          wx.showToast({
            title: '短信验证码已发送',
            icon: 'none',
            duration: 2000
          });

          //设置一分钟的倒计时
          var interval = setInterval(function () {
            currentTime--; //每执行一次让倒计时秒数减一
            that.setData({
              text: currentTime + 's', //按钮文字变成倒计时对应秒数

            })
            //如果当秒数小于等于0时 停止计时器 且按钮文字变成重新发送 且按钮变成可用状态 倒计时的秒数也要恢复成默认秒数 即让获取验证码的按钮恢复到初始化状态只改变按钮文字
            if (currentTime <= 0) {
              clearInterval(interval)
              that.setData({
                text: '重新发送',
                currentTime: 60,
                disabled: false,
              })
            }
          }, 1000);
          wxUtil.alert(res.data.data)
        } else {
          // console.log(res)
          wxUtil.alert(res.data.data)
        }
      });
    };

    //判断 当提示错误信息文字不为空 即手机号输入有问题时提示用户错误信息 并且提示完之后一定要让按钮为可用状态 因为点击按钮时设置了只要点击了按钮就让按钮禁用的情况
    if (warn != null) {
      wx.showModal({
        title: '提示',
        content: warn
      })

      that.setData({
        disabled: false,
        color: '#929fff'
      })
      return;

    };
  },
  input_yzm(e){
    console.log(e.detail.value)
    var that = this;
    if (e.detail.value.length==6){
      let wxid = wxUtil.getUserId();
      let formUser = {
        apiUrl: app.globalData.api_url + "/phone/valid", //  个人信息接口
        data: {
          wxid: wxid,
          validNum: e.detail.value
        }
      }
      wxUtil.postJSON(formUser, function (res) {
        if (res.data.result == "success") {
          // console.log(res)
          // wxUtil.alert(res.data.data)
          that.setData({
            yzmyz:1
          })
        }else{
          // console.log(res)
          wxUtil.alert(res.data.data)
        }
      });
    }
  },
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
      var head_url='';
      console.log(options.avatarUrl+"-------------")
       if (wx.getStorageSync("avatarUrl")){
        wx.getImageInfo({
          src: wx.getStorageSync("avatarUrl"),
          success: function (res) {
            that.setData({
              head_url: res.path
            })
          },
          fail(){
            that.setData({
              head_url: options.avatarUrl || ""
            })
          }
        })
       } else if (options.avatarUrl) {
         head_url = options.avatarUrl
       }
        that.setData({
          head_url: head_url
        })
      
        let wxid = wxUtil.getUserId();
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
                
                that.setData({
                    name: userInfo.nickName,
                    phone: userInfo.phone || "",
                    phone_js: userInfo.phone || "",
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
        let formSubmit = {
            apiUrl: app.globalData.api_url + "/person/save",  // 保存接口
            data: {
                wxid: wxid,
                // 昵称, 手机号
                phone: phone,
                nickName: nickName,
                avatorUrl: avatorUrl,
                id: id,
            }
        };

        if (/^[1][3,4,5,7,8][0-9]{9}$/.test(phone)) {
          if (that.data.yzm == 1 && that.data.yzmyz==0){
            wxUtil.alert("请检查验证码")
            return false;
          } else if(that.data.click){
            that.setData({
              click:false,
              save:true
            })
            wxUtil.postJSON(formSubmit, function (res) {
              console.log(avatorUrl);

              if (res.data.result == "success") {
                wxUtil.info_dialog("更新账号成功");
                wx.setStorageSync("phone", phone);
                wx.downloadFile({//缓存头像
                  url: app.globalData.api_url + "/view/" + avatorUrl, // 网络返回的图片地址
                  formData: { url: avatorUrl},
                  fail: function (err) {
                    console.log(err)
                  },
                  success: function (res) {
                    console.log(res);
                    
                    wx.saveFile({
                      tempFilePath: res.tempFilePath,
                      success: function (res) {
                        console.log(res.savedFilePath);
                        wx.setStorageSync("avatarUrl", res.savedFilePath)
                        wxUtil.deplay_redirect("../personal_center/personal_center")
                        // console.log('../personal_center/personal_center')
                        
                      }
                    })
                    
                  }
                })
                
              }
            });
          }
            
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
        var yzm=0
        if (this.data.phone_js != e.detail.value && e.detail.value.length==11){
          yzm=1
        }
        console.log(this.data.phone_js + "----------" + e.detail.value)
        this.setData({
          phone: e.detail.value,
          yzm:yzm
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
      var that = this;
      console.log(that.data.avator_url)
      console.log(that.data.head_url)
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
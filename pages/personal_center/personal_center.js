// pages/personal_center/personal_center.js
var template = require('../../Components/tab-bar/index.js');
const app = getApp()
var wxUtil = require("../../utils/util.js")
Page({

    /**
     * 页面的初始数据
     */
    data: {

        shoucan: [{
            id: 1,
            img: "../../images/S_icon_shoucan@2x.png"
        },
            {
                id: 0,
                img: "../../images/N_icon_shoucan@2x.png"
            },
        ],
        fabu: [{
            id: 0,
            img: "../../images/N_icon_fabu@2x.png"
        },
            {
                id: 1,
                img: "../../images/S_icon_fabu@2x.png"
            }
        ],

        ing: 0, // 1, 发布 0 收藏
        video: "ss",
        flag: true,

        // 分页加载个人视屏发布内容
        pageNo: 1,
        pageSize: 6,
        hasMoreData: true,
        videoList: "",
      avatarUrl:"",
      avatarUrl_t:""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const that = this;

      
        // console.log(options.ing);
        if (options.ing) {
            that.setData({
                ing: parseInt(options.ing)
            })
        }
        that.setData({
            wxid: wxUtil.getUserId()
        })
        
    },
    init() {
        // 用户中心 wxid
        console.log(this.data.videoList);
        var wxid = wxUtil.getUserId();
        const that = this;
        // 昵称, 手机号, 头像, 点赞,  播放量,
        var nickname = "昵称";
        var mobile = "未绑定手机号"; // 默认提示
        var zans = 0; // 点赞量
        var viewnums = 0; // 播放量


        console.log('------- wxid --------' + wxid);

        /**
         * 获取个人用户信息接口
         * @type {{apiUrl: string, data: {wxid: *}}}
         */
        var formUser = {
            apiUrl: app.globalData.api_url + "/person/show", //  个人信息接口
            data: {
                wxid: wxid,
            }
        }
        wxUtil.postJSON(formUser, function (res) {
          console.log(res)
            if (res.data.result == "success") {
                var userInfo = res.data.data;

                console.log(' --------- userinfo2 -------')
                // console.log(userInfo)
                
                var avatarUrl = userInfo.avatarUrl
                // 微信头像
                if (!wxUtil.isValidURL(userInfo.avatarUrl)) {
                    avatarUrl = app.globalData.img_url + userInfo.avatarUrl
                }
                wx.setStorageSync("phone", userInfo.phone);
              console.log(avatarUrl)

                var userInfo = {
                    nickname: userInfo.nickName,
                    mobile: (userInfo.phone == null) ? '未绑定手机号' : userInfo.phone,
                    avatarUrl_t: avatarUrl,
                    avatarUrl: avatarUrl,
                    zans: userInfo.zans,
                    viewnums: userInfo.viewnums
                };

                that.setData({
                    userInfo: userInfo
                });
            }
        });

        /**
         *  个人发布视屏列表 0 审核中  -1 审核失败 1 审核通过 msg 审核意见
         * @type {{apiUrl: string, data: {pageNo: number, pageSize: number, wxid: *, type: number}}}
         */
        // var video_form = {
        //   apiUrl: app.globalData.api_url + "/perVideo/list", //  发布视屏列表接口
        //   data: {
        //     pageNo: that.data.pageNo,
        //     pageSize: that.data.pageSize,
        //     wxid: wxid,
        //     type: that.data.ing + 1,
        //   }
        // }

        // // 加载分页
        // that.getMoreData(video_form, that);
        // console.log(that.data.videoList)
    },
    /**
     * 加载更多数据
     * @param data
     * @param that
     */
    getMoreData: function (data, that) {
        // wxUtil.loading();
        console.log(data)
        wxUtil.postJSON(data, function (res) {
            if (res.statusCode == 200 && res.data.result == "success") {
                var videoList2 = res.data.data.list;
                if (videoList2.length > 0) {
                    for (let i in videoList2) {
                        videoList2[i].tag = wxUtil.replaceStr(videoList2[i].tag)
                        videoList2[i].thumb = app.globalData.img_url + videoList2[i].thumb;
                    }

                    var videoList = that.data.videoList;
                    if (that.data.pageNo == 1) {
                        videoList = [];
                    }
                    if (videoList2.length < that.data.pageSize) {
                        that.setData({
                            pageNo: res.data.data.pageNo,
                            videoList: videoList.concat(videoList2),
                            hasMoreData: false,
                        });
                    } else {
                        that.setData({
                            videoList: videoList.concat(videoList2),
                            hasMoreData: true,
                            pageNo: that.data.pageNo + 1,
                        });
                    }
                } else {
                    that.setData({
                        hasMoreData: false,
                      videoList: that.data.videoList
                    });
                }
            }
        });
    },


    /**
     * 通过code 获取用户信息
     * @param e
     */


    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        var that = this;
        template.tabbar("tabBar", 1, this) //0表示第一个tabbar
    },

    ing_tab(e) {
        console.log(' ---------- click tab -----------')
        
        var that = this;
        var wxid = wxUtil.getUserId();
        console.log(wxid)
        // 清空掉发布的视屏数据
        that.setData({
            pageNo: 1,
            videoList: [],
            hasMoreData: true,
            ing: parseInt(e.currentTarget.dataset.id)
        });
        console.log(that.data.ing);
        console.log(that.data.shoucan[that.data.ing].id);
        if (that.data.hasMoreData) {
            var video_form = {
                apiUrl: app.globalData.api_url + "/perVideo/list", //  发布视屏列表接口
                data: {
                    pageNo: that.data.pageNo,
                    pageSize: that.data.pageSize,
                    wxid: wxid,
                    type: that.data.ing + 1,
                }
            };
            console.log(video_form);
            // 加载分页
            that.getMoreData(video_form, that);
        }
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var that = this;
        console.log("执行")
      that.init();

      if (wx.getStorageSync("avatarUrl")) {
        console.log(wx.getStorageSync("avatarUrl"))
        wx.getImageInfo({
          src: wx.getStorageSync("avatarUrl"),
          success: function (res) {
            console.log(res)
            that.setData({
              avatarUrl: res.path
            })
          },
          fail(res){
            that.setData({
              avatarUrl: that.data.avatarUrl
            })
            
          }
        })
        console.log(wx.getStorageSync("avatarUrl"))
      }
        that.setData({
          // avatarUrl: wx.getStorageSync("avatarUrl") || "",
          videoList:[],
          pageNo:1
        })
        
        var video_form = {
            apiUrl: app.globalData.api_url + "/perVideo/list", //  发布视屏列表接口
            data: {
              pageNo: that.data.pageNo,
                pageSize: 6,
                wxid: that.data.wxid,
                type: that.data.ing + 1,
            }
        };
        // 加载分页
        that.getMoreData(video_form, that);
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
        console.log(" ------ 加载分页 ----- ");
        var that = this;
        var wxid = wxUtil.getUserId();

        if (that.data.hasMoreData) {
            var video_form = {
                apiUrl: app.globalData.api_url + "/perVideo/list", //  发布视屏列表接口
                data: {
                    pageNo: that.data.pageNo,
                    pageSize: that.data.pageSize,
                    wxid: wxid,
                    type: this.data.ing + 1,
                }
            };
            // 加载分页
            that.getMoreData(video_form, that);
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    /**
     * 审核失败告知原因
     */
    failAudit: function (e) {
        const that = this;
        let flag = that.data.flag;
        let id = e.currentTarget.dataset.id;
        if (flag) {
            this.data.flag = false;
        }
        if (!flag) {
            this.data.flag = true;
        }
        this.setData({
            id: id,
            error_notice: this.data.flag
        });
    }
});
//index.js
// 公共部分
var app = getApp()
var template = require('../../Components/tab-bar/index.js');
var wxUtil = require("../../utils/util.js")
import Page from '../../common/page';

Page({
    data: {
        current_scroll: 'tab1',
        tab: [],
        // 分页加载视屏内容
        pageNo: 1,
        pageSize: 6,
        hasMoreData: true,
        videoList: [],
        label_name: '', // 选中标签
        // 数据空的情况
        isEmptyData: false,
        wxid:"",
      fenhao:1,
        name_index: 0
    },
    //事件处理函数
    handleChangeScroll({detail}) {
        this.setData({
            current_scroll: detail.key
        });
    },
    onLoad: function () {
        // wx.setStorageSync("wxid", "")
        
        var wxid = wxUtil.getUserId()
        // var wxid = wx.getStorageSync("wxid")
        var that = this;
        template.tabbar("tabBar", 0, this) //0表示第一个tabbar
        that.setData({
          wxid: wxid
        })
        var data = {
            apiUrl: app.globalData.api_url + "/top/module",
            method: "GET",
        }
        // 添加 "推荐"
        var tabTuijian = [{name:'推荐'}]
        console.log(that.data.tab);
        wxUtil.loading();
        wxUtil.postJSON(data, function (res) {
            if (res.statusCode == 200 && res.data.result == "success") {
                that.setData({
                    tab: tabTuijian.concat(res.data.data)
                });
            }
        });

        this.loadVideo()
    },

    /**
     * 根据标签名称，加载分页数据
     * @param tagName
     */
    loadVideo: function (tagName = '') {
        var that = this;
        var data = {
            apiUrl: app.globalData.api_url + "/top/list",
            method: 'GET',
            data: {
                pageNo: that.data.pageNo,
                pageSize: that.data.pageSize,
                tag: tagName,
                wxid: that.data.wxid
            }
        };
        console.log(data)
        this.getMoreData(data, that)
    },
    status(){
      var that = this
      wx.request({
        url: app.globalData.api_url + "/user/status",
        data: {
          wxid:that.data.wxid
        },
        method: "post",
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        success: function (res) {
          if (res.data.result == "success") {
            console.log(res);
            that.setData({
              fenhao:res.data.data
            })
          } else {
            console.log(res);
            
          }
        },
        fail: function (e) {
          console.log(e);
        }
      });
    },
  onShow: function () {
    var that = this;
    this.status()
  },
  bindGetUserInfo(e) {
    console.log(e.detail)
    wx.showLoading()
    var that = this;
    var res = e.detail;
    wx.login({
      success: function (res1) {
        if (res1.code) {
          //发起网络请求
          console.log(3);
          var data = {
            code: res1.code,
            rawData: res.rawData,
            signature: res.signature,
            encryptedData: res.encryptedData,
            iv: res.iv
          }
          console.log(data)
          console.log(app.globalData.api_url + "/getwxInfo")
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
              
              if (res.data.result == "success") {
                console.log(' ----------- wxid:' + wxid + " -------------");
                console.log(res.data);
                let wxid = res.data.data;
                wx.setStorageSync('wxid', wxid);
                that.setData({
                  wxid: wxid
                })
                wx.hideLoading()
              } else {
                console.log(res.data);
                wxUtil.info_dialog(res.data.data)
              }
            },
            fail: function (e) {
              console.log(5);
              console.log(e);
            }
          });
        }
      }
    });
  },
    /**
     * 加载更多数据
     * @param data
     * @param that
     */
  link_detail(e){
    console.log(e.currentTarget.dataset.ismy)
    if (e.currentTarget.dataset.ismy==1){
      wx.navigateTo({
        url: '../video_detail_del/video_detail_del?vid=' + e.currentTarget.dataset.vid,
      })
      wx.showLoading()
    }else{
      wx.navigateTo({
        url: '../video_detail/video_detail?vid=' + e.currentTarget.dataset.vid,
      })
      wx.showLoading()
    }
  },
    getMoreData: function (data, that) {
        wxUtil.loading();
        wxUtil.postJSON(data, function (res) {
            if (res.statusCode == 200 && res.data.result == "success") {
              console.log(res)
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
                        })
                    } else {
                        that.setData({
                            videoList: videoList.concat(videoList2),
                            hasMoreData: true,
                            pageNo: that.data.pageNo + 1
                        })
                    }
                    console.log(videoList.concat(videoList2));
                } else {
                    that.setData({
                        isEmptyData: true,
                        hasMoreData: false
                    });
                }
            }
        });
    },

    onPullDownRefresh: function () {
        console.log("up")
    },

    // 下拉事件
    onReachBottom: function () {
        var that = this;
        var tagName = (that.data.label_name == "推荐") ? "" : that.data.label_name;


        console.log(that.data.name_index)
        if (that.data.hasMoreData) {
            var data = {
                apiUrl: app.globalData.api_url + "/top/list",
                method: 'GET',
                data: {
                    pageNo: that.data.pageNo,
                    pageSize: that.data.pageSize,
                    tag: tagName,
                  wxid: that.data.wxid
                }
            };

            this.getMoreData(data, that);
        }
    },

    onTap: function (e) {
        var that = this;
        that.data.label_name = this.getTab(e).name;
        // 清空页面加载时候的数据
        that.setData({
            pageNo: 1,
            videoList: [],
            hasMoreData: true,
        });

        var tagName = (that.data.label_name == "推荐") ? "" : that.data.label_name;
        var name_index = 0;
        if(that.data.label_name!="推荐"){
            name_index=1
        }
        console.log(name_index)
        that.setData({
            name_index:name_index
        })
        if (that.data.hasMoreData) {
            var data = {
                apiUrl: app.globalData.api_url + "/top/list",
                method: 'GET',
                data: {
                    pageNo: that.data.pageNo,
                    pageSize: that.data.pageSize,
                    tag: tagName,
                  wxid: that.data.wxid
                }
            };
            // 加载更多数据
            this.getMoreData(data, that);
        }

        // console.log(' ------------------ ');
        // console.log(that.data.label_name);
        // console.log(' ------------------ ');
    },

    /**
     * 获取 tab JSON
     */
    getTab: function (e) {
        var indx = `${e.detail.index}`; // 索引
        var that = this;
        var tab = that.data.tab[indx];
        return tab;
    }
});
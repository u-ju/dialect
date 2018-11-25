const app = getApp();
var wxUtil = require("../../utils/util.js");
var template = require('../../Components/tab-bar/index.js');
import Page from '../../common/page';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        video_list: [{
            id: 1,
            img: '../../images/img2@2x.png',
            name: '',
            tag: ['聚会', '师生', '多人']
        },
            {
                id: 2,
                img: '../../img4@2x.png',
                name: '',
                tag: ['聚会', '师生', '多人']
            },
            {
                id: 3,
                img: '../../images/img6@2x.png',
                name: '',
                tag: ['聚会', '师生', '多人']
            },
            {
                id: 4,
                img: '../../images/img3@2x.png',
                name: '',
                tag: ['聚会', '师生', '多人']
            }
        ],

        // 分页加载视屏搜索结果
        pageNo: 1,
        pageSize: 6,
        hasMoreData: true,
        videoList: [], // 搜索结果
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        var form = {
            apiUrl: app.globalData.api_url + "/top/list",
            data: {
                pageNo: that.data.pageNo,
                pageSize: that.data.pageSize,
                title: options.title,
                tag: options.tag,
                wxid:wxUtil.getUserId()
            }
        }
      console.log(form)
        // 分页加载内容
        this.getMoreData(form, that);
    },

    /**
     * 加载更多数据
     * @param data
     * @param that
     */
    getMoreData: function (data, that) {
        wxUtil.loading();
        wxUtil.postJSON(data, function (res) {
            if (res.statusCode == 200 && res.data.result == "success") {
                var videoList2 = res.data.data.list;
                console.log(res)
                if (videoList2.length > 0) {
                    for (let i in videoList2) {
                        videoList2[i].tag = videoList2[i].tag.split(",");
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
                        hasMoreData: false
                    });
                }
            }
            wx.hideLoading();
        });
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        console.log(111111111);
        var that = this;

        if (that.data.hasMoreData) {
            var form = {
                apiUrl: app.globalData.api_url + "/top/list",
                // method: "GET",
                data: {
                    pageNo: that.data.pageNo,
                    pageSize: that.data.pageSize,
                    title: that.data.title,
                    tag: that.data.tag,
                }
            }
            this.getMoreData(form, that);
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
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
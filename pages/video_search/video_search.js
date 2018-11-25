// pages/tag_search/tag_search.js
const app = getApp();
var wxUtil = require("../../utils/util.js");

Page({

    /**
     * 页面的初始数据
     */
    data: {
        clearLabel: true, // 清空标签

        curr: {
            cj: 0,
            gx: 0,
            rs: 0
        },
        labels: [], // 标签搜索分类
        name: [], // 标签分类名称

        labelValue: [], // 用户选择的标签值
        labels_sto: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const that = this;

        let form = {
            apiUrl: app.globalData.api_url + "/search/tag",
        };

        wxUtil.postJSON(form, function (res) {
            if (res.statusCode == 200 && res.data.result == "success") {
                let labelItem = res.data.data;
                console.log(res)
                if (labelItem.length > 0) {
                    let labels = labelItem,
                        name = [];
                    for (let a = 0; a < labels.length; a++) {
                        labels[a]["checked"] = 0;
                        name.push(labels[a].name);
                    }
                    console.log(labels);
                    that.setData({
                        labels: labels,
                        name: name,
                        labels_sto: labels
                    });
                }
            } else {
                wxUtil.info_dialog("网络连接超时!");
            }
        });
    },
    checked(e) {
        const that = this;
        let tag_list = [], kwd = ''; // 标签列表, 关键词

        let labels = that.data.labels,
            name = that.data.name
        for (let i in name) {
            if (e.currentTarget.dataset.curr == name[i]) {
                labels[i].checked = e.currentTarget.dataset.index;
            }
        }
        that.setData({
            labels: labels
        })

        for (let i  in labels) {
            if (labels[i].checked > 0 && labels[i].checked != 0) {
                tag_list.push(labels[i].tags[labels[i].checked - 1].tagName);
            } else if (labels[i].checked == 0) {
                console.log(labels[i].name);
            }
        }
        that.setData({
            labelValue: tag_list.join(",")
        })
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
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    /**
     * 清空标签s
     */
    clearLabel: function () {
        var that = this;

        that.setData({
            // clearLabel: false
            labels: that.data.labels_sto
        });
    },

    /**
     * 关键字查询
     */
    formSubmit: function (e) {
        const that = this;
        let title = e.detail.value.keywords;
        let tag = that.data.labelValue;
      console.log(tag.length)
      if (title.length < 1 && tag.length<1){
        wxUtil.info_dialog("请输入标题或者标签");
            
            return false;
        }

        wx.navigateTo({
            url: '../video_search_result/video_search_result?title=' + title + '&tag=' + tag,
            success: function () {
                wx.showLoading({
                    title: '正在查询 ...',
                })
            },
            failed: function () {
                wxUtil.loading({
                    title: '查询结果超时!',
                })
            }
        });
    }
});
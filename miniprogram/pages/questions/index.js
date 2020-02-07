const request = require("../../common-utils/request.js")

const app = getApp()

Page({
  data: {
    loginName: null,
    loginAvatar: null,
    questionID: 'km2019',
    comments: {},
    test: [1,2,3]
  },

  onLogin: function (ev) {
    this.setData({
      loginName: ev.detail.nickName,
      loginAvatar: ev.detail.avatarUrl
    })
  },

  onPullDownRefresh: async function () {
    let cas = this.selectAllComponents(".comment-area")
    await Promise.all(cas.map(async (ca) => {
      return ca.refreshComments()
    })).catch((err) => {
      console.log('[caught]', err)
    })

    /* stop pull down loading */
    wx.stopPullDownRefresh()
  },

  onWatchBtnTap: function () {
    var vm = this
    this.watchButton.setThen(new Promise((resolve, reject) => {
      if (this.watchButton.data.state === "off") {
        // 订阅题目授权
        const tmplID = 'uZQk1NJLtmExnx6BAVAapOjtk10yhy9XESXLinYa4F8'
        wx.requestSubscribeMessage({
          tmplIds: [tmplID],
          success(res) {
            const accepted = (res[tmplID] == 'accept')
            if (accepted) {
              request.cloud('question-watch', 'watch', { 'qid': vm.data.questionID },
                (res) => {
                  console.log('watch', res)
                  resolve(true)
              })
            } else {
              console.log('user accepts notification', res)
              resolve(false)
            }

          },
          fail(err) {
            console.log('Request failed', err)
            resolve(false)
          }
        })
      } else {
        request.cloud('question-watch', 'unwatch', { 'qid': vm.data.questionID },
          (res) => {
            console.log('unwatch', res)
            resolve(false)
          })
      }
    }))
  },

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  onTestNotification: function () {
    request.cloud('question-watch', 'notify', {'qid': this.data.questionID},
    (res) => {
      console.log('notify', res)
    })
  }
})
export default defineAppConfig({
  pages: [
    'pages/pour-info/index',
    'pages/process-record/index',
    'pages/sign-archive/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1E6F9F',
    navigationBarTitleText: '混凝土浇筑旁站助手',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F0F4F8'
  },
  tabBar: {
    color: '#64748B',
    selectedColor: '#1E6F9F',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/pour-info/index',
        text: '本次浇筑'
      },
      {
        pagePath: 'pages/process-record/index',
        text: '过程记录'
      },
      {
        pagePath: 'pages/sign-archive/index',
        text: '签认归档'
      }
    ]
  }
})

Component({
  behaviors: [],

  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    height: {
      type: Number,
      value: 100,
    },
    width: {
      type: Number,
      value: 200
    },
    checkColor :{
      type: String,
      value: 'green'
    },
    uncheckColor: {
      type: String,
      value: 'white'
    },
    btnColor : {
      type: String,
      value: 'white'
    }
  },
  data: {
    // 这里是一些组件内部数据
    checked: true
  },
  methods: {
    // 这里是一个自定义方法
    onLoad: function(){

    },
    onTap: function(){
      if (this.data.checked) {
        this.setData({checked: false})
      }else{
        this.setData({checked: true})
      };
      console.log(this.data.checked);
    }
  }
})
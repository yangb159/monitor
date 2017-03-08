//相关api文档入口: https://developer.mozilla.org/en/docs/Web/API/GlobalEventHandlers/onerror
;
(function() {
  // 异常
  // 1 runtime异常捕捉 √
  // 2 load faided异常捕捉 √
  // 3 xmlhttprequest异常捕捉

  // 常规
  // 1.pv & uv
  // 2.资源加载时长
  // 3.请求加载时长

  //定义的错误类型码
  var ERROR_RUNTIME = 1,
    ERROR_SCRIPT = 2,
    ERROR_STYLE = 3,
    ERROR_IMAGE = 4,
    ERROR_AUDIO = 5,
    ERROR_VIDEO = 6,
    ERROR_CONSOLE = 7;

  var MAX_ERR_NUM = 10; //一个页面最大异常报错数量限制

  var error_num = 0; // 异常数量

  var timer = null; //定时器，防止短时间内重复请求

  var delay = 1000; //两次error间隔在3000ms内不重复请求错误

  var error_log = new Array(); //存储错误日志的数组
  // 针对vue报错使用的是error。重写的方法
  console.error = (function(origin) {
    return function(errorlog) {
      clearTimer();
      pushError({
        type: ERROR_CONSOLE,
        des: errorlog
      });
      setTimer(handler);
      origin.call(console, errorlog);
    }
  })(console.error);

  //监听js报错异常(JavaScript runtime error)
  window.onerror = function(messageOrEvent, source, lineno, colno, error) {
    clearTimer()
    var error = createRuntimerError(messageOrEvent, source, lineno, colno,
      error);
    pushError(error);
    setTimer(handler);
  };

  //监听资源加载错误(JavaScript Scource failed to load)
  window.addEventListener('error', function(err) {
    // 过滤非资源加载的错误
    var ERR_TYPE = {
      "SCRIPT": ERROR_SCRIPT,
      "LINK": ERROR_STYLE,
      "IMG": ERROR_IMAGE,
      "AUDIO": ERROR_AUDIO,
      "VIDEO": ERROR_VIDEO
    };
    if (err.target !== window) { //过滤window的异常,避免与上面的onerror重复
      clearTimer();
      var errNode = err.target.nodeName;
      if (errNode && ERR_TYPE[errNode.toUpperCase()]) {
        var des = err.target.baseURI + "@" + (err.target.src || err.target
          .href);
        pushError({
          type: ERR_TYPE[errNode.toUpperCase()],
          des: des
        });
        setTimer(handler);
      }
    }

  }, true);

  function clearTimer() {
    clearTimeout(timer);
  }

  function setTimer(callback) {
    timer = setTimeout(function() {
      callback && callback();
    }, delay);
  }

  function handler() {
    console.table(error_log);
    console.log("发送请求");
  }

  function pushError(err) {
    if (error_num < MAX_ERR_NUM) {
      error_log.push(err);
      error_num++;
    }
  }

  // des :"", //错误描述
  // type:"", //错误类型
  function LogMessage(type, des) {
    this.type = type;
    this.des = des;
  }

  function createRuntimerError(messageOrEvent, source, lineno, colno, error) {
    return {
      type: ERROR_RUNTIME,
      des: messageOrEvent + " at " + source + ":" + lineno + ":" + colno
    }
  }

}());

const util = {};

util.isEmptyObject = (param) =>{
    return Object.keys(param).length === 0 && param.constructor === Object;
  }

util.checkOS = ()=>
{
  const isMobile = (/iphone|ipod|android/i.test( navigator.userAgent.toLowerCase() ));
  if(isMobile){
    const userAgent = navigator.userAgent.toLowerCase();
    if(userAgent.search("android") > -1) return  'android';
    else if((userAgent.search("iphone") > -1) || (userAgent.search("ipod") > -1) ) return 'ios';
    else return 'other'
  }
  else{
    return 'pc';
  }
}

util.checkAndroidWebView = ()=>
{
  if(navigator.share) return false;
  else return true;
}

util.checkSupportBrowser = () =>
{
  const userAgent = navigator.userAgent;
  const isEdge = (/edg/i.test( userAgent.toLowerCase() ));
  if(isEdge) return false;
  const oldIE = userAgent.indexOf('MSIE ');
  const newIE = userAgent.indexOf('Trident/');
  if(oldIE > -1 || newIE > -1) return false;
  else return true;
}

util.selectOption = function(component,selector, value)
{
    if(!component.querySelector(selector)) return;
    Array.from(component.querySelector(selector).options).forEach(element => {
        if(element.value === value) element.selected = true;
    });
}

util.settingCalendar = function(minDate, maxDate) {
  const option = {};
  Object.assign(option,
    {
    closeText: '닫기',
    prevText: '이전달',
    nextText: '다음달',
    currentText: '오늘',
    monthNames: ['01','02','03','04','05','06','07','08','09','10','11','12'],
    monthNamesShort: ['01','02','03','04','05','06','07','08','09','10','11','12'],
    dayNames: ['일','월','화','수','목','금','토'],
    dayNamesShort: ['일','월','화','수','목','금','토'],
    dayNamesMin: ['일','월','화','수','목','금','토'],
    weekHeader: 'Wk',
    dateFormat: 'yy.mm.dd',
    showMonthAfterYear: true,
    yearSuffix: '',
    minDate : minDate,
    maxDate : maxDate
  });
  return option;
},

util.getDay = (d) =>
{
  const date = new Date();
  let curDay = date.getTime() - (Number(d)*24*60*60*1000);
  date.setTime(curDay);
  return util.getDayFormat(date);
}

util.getDayOfWeek = () =>
{
  const date = new Date();
  const dayOfWeekNumber = date.getDay();

  switch(date.getDay())
  {
    case 0 :
      return '일요일';
    break;
    case 1 :
      return '월요일';
    break;
    case 2 :
      return '화요일';
    break;
    case 3 :
      return '수요일';
    break;
    case 4 :
      return '목요일';
    break;
    case 5 :
      return '금요일';
    break;
    case 6 :
      return '토요일';
    break;
  }
}

util.getDayByMonth = (month) =>
{
  const now = new Date();
  const beforeDay = new Date(now.setMonth(now.getMonth() - (1 * month)));
  return util.getDayFormat(beforeDay);
}

util.checkDate = (startDate, endDate) =>{
  const _startDate = startDate.replaceAll('.', '/');
  const _endDate = endDate.replaceAll('.', '/');
  const start_date = new Date(_startDate);
  const end_date = new Date(_endDate);
  return (start_date.getTime() > end_date.getTime())? false : true;
}

util.checkSixMonthDate = (startDate, endDate) =>{
  const _startDate = startDate.replaceAll('.', '/');
  const _endDate = endDate.replaceAll('.', '/');
  const start_date = new Date(_startDate);
  const sixMonthLaterFromStartDate = new Date(start_date.getTime() + (182*24*60*60*1000));
  const end_date = new Date(_endDate);
  return (sixMonthLaterFromStartDate.getTime() > end_date.getTime())? true : false;
}

util.getDayFormat = (date) =>{

  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  month = (month < 10)? `0${month}` : month;
  day = (day < 10)? `0${day}` : day;

  return `${year}.${month}.${day}`;
}

util.getDayDashFormat = (date) =>{

  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  month = (month < 10)? `0${month}` : month;
  day = (day < 10)? `0${day}` : day;

  return `${year}-${month}-${day}`;
}

util.getDayZeroFormat = (date) =>{

  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  month = (month < 10)? `0${month}` : month;
  day = (day < 10)? `0${day}` : day;

  return `${year}${month}${day}0000000`;
}
// 현재시간 반환 (ex; 오전 6:25)
util.getCurrentTime = function(){
  let currentTime = moment().format('A h:mm');
  currentTime = currentTime.replace(/AM/gi, '오전');
  currentTime = currentTime.replace(/PM/gi, '오후');
  return currentTime;
};

util.dateDotFormat = function(dateString)
{
  dateString = dateString.replace(/\s+/g, '').substring(0,8);
  let _dateString = '';
  try{
    _dateString = dateString.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3');
  }
  catch(e)
  {
    _dateString = dateString;
  }
  return _dateString;
}

util.dateDashFormat = function(dateString)
{
  dateString = dateString.replace(/\s+/g, '').substring(0,8);;
  let _dateString = '';
  try{
    _dateString = dateString.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
  }
  catch(e)
  {
    _dateString = dateString;
  }
  return _dateString;
}

util.ajaxApi = function(type, url, params, callback, fallback)
{
  $.ajax({
    type:type,
    url :url,
    data : params,
    dataType : "json",
    success:(data)=>{
      callback(data);
    },
    error : ()=>{
      if(fallback) fallback();
      else console.log("통신 예러처리")
    }
  });
}

util.promiseAjax = function(type, url, params, header){
  return new Promise((resolve, reject)=>
  {
    $.ajax({
      type:type,
      url :url,
      data : params,
      dataType : "json",
      beforeSend : (xhr)=>{
        if(header)
        {
          xhr.setRequestHeader("apiKey", header.apiKey);
          xhr.setRequestHeader("tenantId", header.tenantId);
          xhr.setRequestHeader("globalKey", header.globalKey);
        }
      },
      success:(data)=> resolve(data),
      error : (error) => reject(error)
    });
  })
}

util.promiseAjaxPost = function(type, url, params, header){
  return new Promise((resolve, reject)=>
  {
    $.ajax({
      type:type,
      url :url,
      data : params,
      dataType : "json",
      beforeSend : (xhr)=>{
        if(header)
        {
          xhr.setRequestHeader("apiKey", header.apiKey);
          xhr.setRequestHeader("tenantId", header.tenantId);
          xhr.setRequestHeader("globalKey", header.globalKey);
        }
      },
      contentType:"application/x-www-form-urlencoded; charset=UTF-8",
      success:(data)=> resolve(data),
      error : (error) => reject(error)
    });
  })
}

util.get_json_request = function(method, url, formData, callback, custom_headers)
{
  let headers = {
    //'Content-Type': 'application/json',
    // 'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (5 == arguments.length && "object" === typeof custom_headers && custom_headers !== null)
  {
    headers = custom_headers;
  }

  let param = {
    method: method, // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'include', // include, *same-origin, omit
    headers: headers,
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer' // no-referrer, *client
  };

  if (false === (formData instanceof FormData))
  {
    formData = JSON.stringify(formData, null, 2);
  }

  if (!method.match(/GET|HEAD/i)) param.body = formData; // body data type must match "Content-Type" header

  return fetch(url, param).then(function(response)
  {
    if (response.ok) return response.json();

    throw new Error('Network response was not ok.');

  }).then(function(json)
  {
    if(callback) callback(json);
    return json;
  });
}

util.sendFormData = async function(url = "", method = "GET", formData = null) {
  // 옵션 기본 값은 *로 강조
  const data = {};
  if(formData) formData.forEach((value, key) => data[key] = value);
  const response = await fetch(url, {
    method: method, // *GET, POST, PUT, DELETE 등
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: (method === 'GET')? null : JSON.stringify(data), // body의 데이터 유형은 반드시 "Content-Type" 헤더와 일치해야 함
  });
  return response.json(); // JSON 응답을 네이티브 JavaScript 객체로 파싱
}

util.sendFormFileData = async function(url = "", method = "POST", formData = null) {
  // 옵션 기본 값은 *로 강조
  const response = await fetch(url, {
    method: method, 
    mode: "cors", 
    cache: "no-cache",
    credentials: "same-origin",
    redirect: "follow", 
    referrerPolicy: "no-referrer",
    body: formData, 
  });
  return response.json(); 
}

util.removeEnter = (text) =>{
  return text.replace(/\n/g, "");
}

util.shareFile = function(file, title, text)
{
  if(navigator.canShare && navigator.canShare({files:[file]}))
  {
    navigator.share({files:[file], title, text}).then(()=> console.log("good!"))
    .catch((err)=> console.log("sharing Fail", err));
  }
  else
  {
    console.log("No support share File");
  }
}

//Set localStorage
util.setLocalStorage = function(key, value)
{
  localStorage.setItem(key, value);
}

//Set setLocalStorageForArray
util.setLocalStorageForArray = function(key, value)
{
  localStorage.setItem(key, JSON.stringify(value));
}

//Get getLocalStorageForArray
util.getLocalStorageForArray = function(key)
{
  return JSON.parse(localStorage.getItem(key));
}

//Remove localStorage by Key
util.removeStorageByKey = function(key)
{
  localStorage.removeItem(key)
}



util.numberWithCommas = function(amount)
{
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


// crypto.getRandomValues 를 이용하여 0~1 실수 랜덤 생성
util.randomFloat = function(){
    const int = window.crypto.getRandomValues(new Uint32Array(1))[0];
    return int;
}

// Random 문자열 생성
util.getRandomId = function()
{
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const strLength = 20;
    let randomStr = '';
    for (let i = 0; i < strLength; i++) {
        const rnum = Math.floor(util.randomFloat() * chars.length);
        randomStr += chars.substring(rnum, rnum + 1);
    }
    return randomStr;
};

util.secureRandom = function()
{
  if(window.crypto && window.crypto.getRandomValues)
  {
    return window.crypto.getRandomValues(new Uint32Array(1))[0];
  }
  else if(window.msCrypto && window.msCrypto.getRandomValues)
  {
    return window.msCrypto.getRandomValues(new Uint32Array(1))[0];
  }
}

util.isFutureDate = function(compareDate)
{
  const now = new Date();
  const _compareDate = new Date(compareDate);
  if(now > _compareDate) return false;
  else return true;
}

util.diffDay = function(preDate, future = true)
{
  const diff = (future)? new Date(preDate).getTime() - new Date().getTime() : new Date().getTime() - new Date(preDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

util.diffHour = function(preDate, future = true)
{
  const diff = (future)? new Date(preDate).getTime() - new Date().getTime() : new Date().getTime() - new Date(preDate).getTime();
  return Math.floor((diff / (1000 * 60 * 60)) % 24);
}

util.diffMin = function(preDate, future = true)
{
  const diff = (future)? new Date(preDate).getTime() - new Date().getTime() : new Date().getTime() - new Date(preDate).getTime();
  return Math.floor((diff / (1000 * 60))  % 60);
}

util.remainTimeToScheduledTime = function(scheduledTime, future = true)
{
  const _dayMemnt = util.diffDay(scheduledTime, future);
  const _hourMemnt = util.diffHour(scheduledTime, future );
  const _minuteMemnt = util.diffMin(scheduledTime, future);
  let nextRemainTime = (_dayMemnt > 0)? `${_dayMemnt}일 ` : "";
  nextRemainTime += (_hourMemnt > 0)? `${_hourMemnt}시간 ` : "";
  nextRemainTime += (_minuteMemnt > 0)? `${_minuteMemnt}분 ` : (future)? "1분 이하로" : "방금 ";
  return nextRemainTime;
}

util.setIntervalDate = function(predate, interval, flag)
{
  const _preDate = new Date(predate);
  let _nextDate = null; 
  switch(flag)
  {
    case 'second':
      _nextDate = _preDate.setSeconds( _preDate.setSeconds() + interval);
    break;
    case 'hour':
      _nextDate = _preDate.setHours( _preDate.getHours() + interval);
    break;
    case 'day':
      _nextDate = _preDate.setDate( _preDate.getDate() +  interval);
    break;
    case 'month':
      _nextDate = _preDate.setMonth( _preDate.getMonth() +  interval);
    break;
    case 'year':
      _nextDate = _preDate.setFullYear( _preDate.getFullYear() +  interval);
    break;
  }
  return _nextDate;
}

util.formatDate = function(dateTime) {
  const _date = new Date(dateTime)
  return _date.getFullYear() + '년 ' + 
    (_date.getMonth() + 1) + '월 ' + 
    _date.getDate() + '일 ' + 
    _date.getHours() + '시 ' + 
    _date.getMinutes() + '분';
}

util.formatDateDay = function(dateTime) {
  const _date = new Date(dateTime)
  return _date.getFullYear() + '년 ' + 
    (_date.getMonth() + 1) + '월 ' + 
    _date.getDate() + '일';
}

util.formatDateTime = function(dateTime) {
  const _date = new Date(dateTime)
  return _date.getHours() + '시 ' + _date.getMinutes() + '분';
}

util.getNextDateByValue = function(preDate, interval, flag)
{
  const _preDate = new Date(preDate);
  let _nextDate = null;
  switch(flag)
  {
    case 'second':
      _nextDate = _preDate.setSeconds( _preDate.getSeconds() + parseInt(interval));
    break;
    case 'hour':
      _nextDate = _preDate.setHours( _preDate.getHours() + parseInt(interval));
    break;
    case 'day':
      _nextDate = _preDate.setDate( _preDate.getDate() + parseInt(interval));
    break;
    case 'month':
      _nextDate = _preDate.setMonth( _preDate.getMonth() + parseInt(interval));
    break;
    case 'year':
      _nextDate = _preDate.setFullYear( _preDate.getFullYear() + parseInt(interval));
    break;
    default:
      _nextDate = new Date().getTime();
    break;  
  }
  return _nextDate;
  
}

util.intervalComment = function(interval)
{
  const _value = interval.split("-")[0];
  const _key = interval.split("-")[1];
  let _ment = '';
  switch(_key)
  {
      case 'hour':
        if(_value === "0") _ment = "0"
        else _ment = `${_value}시간`
      break;
      case 'day':
          if(_value === "1") _ment = `일`;
          else if(_value === "7") _ment = `주`;
          else _ment = `${_value}일`
      break;
      case 'month':
          _ment = `월`
      break;
      case 'year':
          _ment = `년`
      break;
  }
  return _ment;
}

util.actionDateFormat = function(date) {
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours();
  let minute = date.getMinutes();
  let second = date.getSeconds();

  month = month >= 10 ? month : '0' + month;
  day = day >= 10 ? day : '0' + day;
  hour = hour >= 10 ? hour : '0' + hour;
  minute = minute >= 10 ? minute : '0' + minute;
  second = second >= 10 ? second : '0' + second;

  return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute;
}

util.randomImageSize = function()
{
  const sizeArray = [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220];

  const newSizeArray = sizeArray.sort(() => Math.random() - 0.5);
  
  return newSizeArray[0];
}

util.randomImageCardSize = function()
{
  const sizeArray = [[90,60], [120,80], [150,100], [180,120], [210,140], [240,160], [270,180], [300,200], [330,220], [360,240], [390,260], [420,280], [450,300]];

  const newSizeArray = sizeArray.sort(() => Math.random() - 0.5);
  
  return newSizeArray[0];
}

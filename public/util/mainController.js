class MainController
{
  constructor(userString, clientString)
  {
    this.userString = userString;
    this.clientString = clientString;
    this.messageListener = this.onMessage.bind(this)
    window.addEventListener("message", this.messageListener);
  }

  init()
  {
    const _userInfo_r = this.userString.replaceAll('&#34;', '\"');
    const userInfo = JSON.parse(_userInfo_r)

    const _clientInfo_r = this.clientString.replaceAll('&#34;', '\"');
    const clientInfo = JSON.parse(_clientInfo_r)


    // checkPassClientId
    if(clientInfo.clientId !== userInfo.clientId){
      window.location.href = "/";
    }

    globalThis.config = {};
    globalThis.user = {};
    globalThis.client = {};
    Object.assign(globalThis.user, userInfo);
    Object.assign(globalThis.client, clientInfo);
    Object.assign(globalThis.config, store.setInitConfig());

    this.dataList = [
      {collection:"boardInfo", complete:false},
      {collection:"user", complete:false},
      {collection:"company", complete:false}, 
      {collection:"customer", complete:false},
      {collection:"product", complete:false},
      {collection:"sheet", complete:false},
      {collection:"work", complete:false},
    ]

    if(globalThis.user.degree === "대기")
    {
      this.#waitingInfo()
    }
    else
    {
      this.#loadingData();  
    }
  }

  #loadingData(){
      this.dataList.forEach(data=>{
      store.getDataList(data.collection,false, "GET_INIT_DATA", null);
    })
  }

  onMessage(event){
    const window_url = window.location.hostname;
    if(event.origin.indexOf(window_url) < 0) return;
    if(event.data.msg)
    {
        switch(event.data.msg)
        {
        case "GET_INIT_DATA":
          this.#checkInitData(event.data.data);
          this.#removeListener();
          this.#layoutUIComponents();
        break;
        default:
        break;
        }
    }
  }

  #checkInitData(info)
  {
    this.dataList.forEach(data=>{
      if(data.collection === info.collection)
      {
        data.complete = true;
      }
    });
  }

  #layoutUIComponents()
  {
    if(this.#isCompleteLoadingData() )
    {
        const body = document.querySelector('body');
        const wrapper = document.createElement('div');
        wrapper.classList.add("wrapper");
        
        const mainPanel = document.createElement('div');
        mainPanel.classList.add("main-panel");
        mainPanel.appendChild(new NavBar())

        const container = document.createElement('div');
        container.classList.add("container");

        const pageInner = document.createElement('div');
        pageInner.classList.add("page-inner");
        container.appendChild(pageInner);

        mainPanel.appendChild(container)
        mainPanel.appendChild(new FooterBar())

        wrapper.appendChild(new NavLeft());
        wrapper.appendChild(mainPanel);

        wrapper.appendChild(new ModalPage());
        wrapper.appendChild(new SearchList());
        body.appendChild(wrapper);

        this.#getFirstComponent();
        
    }
  }

  #waitingInfo()
  {
    const body = document.querySelector('body');
    body.appendChild(new ModalPage());
    const _tempInfo = {"tagName":'waiting-user-info', "info":null}
    const _message = {msg:"DO_SHOW_MODAL", data:_tempInfo}
    window.postMessage(_message, location.href);
  }

  #getFirstComponent()
  {
    this.#accessableMenu()
    
    for(let i = 0; i < this.accessMenu.length; i++)
    {
      if(this.accessMenu[i].tag === "calendar")
      {
        const component = document.createElement('calendar-board');
        document.querySelector('.page-inner').innerHTML = '';
        document.querySelector('.page-inner').appendChild(component);
        return;
      }
    }
    
    for(let i = 0; i < this.accessMenu.length; i++)
    {
      if(this.accessMenu[i].type === "custom")
      {
        const info = (this.accessMenu[i].tag === 'notice')? globalThis.config["notice"] : globalThis.config["board"]
        info.boardId = this.accessMenu[i]._id;
        info.title = this.accessMenu[i].name;
        info.tag = this.accessMenu[i].tag;
        const formData = new FormData();
        formData.append("boardId", info.boardId);
        info.formData = formData;
        document.querySelector('.page-inner').innerHTML = '';
        document.querySelector('.page-inner').appendChild(new TableList(info));
        return;
      }
    }

    this.#appendInfoMessage()
  }

  #accessableMenu()
  {
    this.accessMenu = [];
    globalThis.boardInfoList.forEach(board=>{
      board.user.includes(globalThis.user._id) ? this.accessMenu.push(board) : null
    });
  }

  #appendInfoMessage()
  {
    const defaultMessage = {
      title:"접근가능한 메뉴 없음",
      message:"접근가능한 메뉴가 없습니다. <br> 관리자에게 문의하세요"
    };
    
    document.querySelector('.page-inner').innerHTML = '';
    document.querySelector('.page-inner').appendChild(new InfoMessage(defaultMessage));
    console.log("not found")
  }

  #removeListener()
  {
    if(this.#isCompleteLoadingData() )
    {
      window.removeEventListener("message", this.messageListener);
    }
  }

  #isCompleteLoadingData()
  {
    if(this.dataList.filter(data => data.complete === false).length) return false
    else return true;
  }

}



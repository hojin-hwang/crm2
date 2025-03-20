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

    console.log(clientInfo)

    // checkPassClientId
    if(clientInfo.clientId !== userInfo.clientId){
      window.location.href = "/auth/logout";
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
    ]
  }

  loadingData(){
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
        
    }
  }

  // <div class="wrapper">
  //     <nav-left></nav-left>

  //     <div class="main-panel">
  //       <nav-bar></nav-bar>
  //         <div class="container">
  //           <div class="page-inner">
  
  //           </div>
  //         </div>
        

  //       <footer-bar></footer-bar>
  //     </div>

  //     <modal-page></modal-page>
  //     <search-list></search-list>
  //   </div>

  #removeListener()
  {
    if(this.#isCompleteLoadingData() )
    {
      console.log("remove listener!")
      window.removeEventListener("message", this.messageListener);
    }
  }

  #isCompleteLoadingData()
  {
    if(this.dataList.filter(data => data.complete === false).length) return false
    else return true;
  }

}

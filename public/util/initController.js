class InitController
{
  constructor(data)
  {
    this.clientId = data;
    this.#init();
  }

  async #init()
  {
    const formData = new FormData();
    formData.append("clientId", this.clientId);
    const response = await util.sendFormData("/client/get", "POST", formData);
    if (response.code === 400) {
      this.#appendInfoMessage()
    }
  }

  #getClient(clientInfo){
     store.get('client',false, "GET_ClientInfo", null);
  }


  #appendInfoMessage()
  {
    const defaultMessage = {
      title:"Client ID 확인",
      message:"Client ID가 없습니다. <br> 관리자에게 문의하세요",
      button:{
        text:"Main으로 돌아가기",
        link:"/"
      }
    };
    
    document.querySelector('.page-inner').innerHTML = '';
    document.querySelector('.page-inner').appendChild(new InfoMessage(defaultMessage));
  }

  

}



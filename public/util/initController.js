class InitController
{
  constructor(data)
  {
    this.clientId = data;
    this.#init();
  }

  async #init()
  {
    if(this.clientId  === 'client')
    {
      this.#appendInfoMessage();
      return;
    }
    
    const formData = new FormData();
    formData.append("clientId", this.clientId);
    const response = await util.sendFormData("/client/info", "POST", formData);
    if (response.code === 400) {
      this.#appendInfoMessage()
    }
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



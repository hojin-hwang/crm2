class MakeReply extends AbstractComponent
{
  constructor()
  {
    super();
    this.addEventListener('click', this.handleClick);
    this.info = {};
  }

  static get observedAttributes(){return [];}

  handleClick(e) {
    //e.preventDefault();
    e.composedPath().find((node)=>{
      if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
      if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
      if(node.className.match(/command-create-reply/))
        {
            const form = this.querySelector('form');
            const formData = new FormData(form);
            this.#addReply(formData)
            window.parent.postMessage({msg:"DO_HIDE_MODAL"}, "*");
            return;
        }
    });
  }


  connectedCallback()
  {
    this.render();
  }

  disconnectedCallback()
  {
    this.removeEventListener('click', this.handleClick);
  }

  render()
  {
    const template = this.#getTemplate();
    if(template) this.appendChild(template.content.cloneNode(true));
    return;
  }

  setData(info){
    Object.assign(this.info, info)
    this.#getContact()
  }
  
  async #getContact()
	{
		const formData = new FormData();
    formData.append("_id", this.info._id);
    try{
			const info =  await util.sendFormData(`/contact/info`, "POST", formData);
      if(info.data.info)
      {
        this.querySelector("#reply").value = info.data.info.reply;
      }
		}
		catch (error) {
            console.error('오류:', error);
            alert('실패했습니다.');
        }
		return;
	}
    
  async #addReply(formData)
	{
		try{
			const response = await util.sendFormData(`/contact/update`, "POST", formData);
      this.sendPostMessage({msg:"COMMAND_CHANGE_DATA", data:response.data.info});
		}
		catch (error) {
            console.error('오류:', error);
            alert('실패했습니다.');
        }
		return;
	}

  #getTemplate()
  {
      const tempalate = document.createElement('template');
      tempalate.innerHTML = `
        <style>
        .make-client{
          width: 600px;
        }
        .make-table{
          display: flex;
          flex-direction: column;
          gap:12px;
        }
        .form-group{
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      </style>
      <section class="make-client">
        <div class="card">
          <div class="card-header form-header row-space-between">
            <span class="fw-semibold">답변하기</span>
            <button type="button" class="btn btn-icon btn-black command-close-modal">
                    <i class="fas fa-times"></i></button>
          </div>
          <div class="card-body">
            
              <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" value="${this.info.name}" name="name" readonly class="form-control" style="width: auto;">
              </div>
              <div class="row-space-between">
                <div class="form-group">
                  <label for="clientId">email</label>
                  <input type="text" id="email" value="${this.info.email}" name="email" readonly  class="form-control" style="width: auto;">
                </div>
                <div class="form-group">
                  <label for="clientId">clientId</label>
                  <input type="text" id="clientId" value="${this.info.clientId}" name="clientId" readonly class="form-control" style="width: auto;">
                </div>
              </div>
              <div class="row-space-between">
                <div class="form-group">
                  <label for="memo" >문의내용</label>
                  <textarea id="memo" name="memo" class="form-control" readonly style="width: auto;">${this.info.memo}</textarea>
                </div>
                <div class="form-group">
                  <label for="reply">답변 </label>
                  <form>
                  <input type="hidden" id="_id" value="${this.info._id}" name="_id" class="form-control" style="width: auto;">
                  <textarea id="reply" name="reply" class="form-control" style="width: auto;"></textarea>
                  </form>
                </div>
                
              </div>
              <button type="button" class="btn btn-primary form-control command-create-reply">답변하기</button>
            <hr>
            <div class="make-table">
              

            </div>

          </div>
        </div>
      </section>
      `;  
      return tempalate;
  }
}
customElements.define("make-reply", MakeReply);


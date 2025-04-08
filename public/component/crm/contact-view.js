class ContactView extends AbstractComponent
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
      if(node.className.match(/command-delete-contact/))
        {
            const form = this.querySelector('form');
            const formData = new FormData(form);
            this.#deleteContact(formData)
            window.parent.postMessage({msg:"DO_HIDE_MODAL"}, "*");
            new AlertMessage({type:"danger",message:"삭제되었습니다."});
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
    //this.#getContact()
  }
  
  // async #getContact()
	// {
	// 	const formData = new FormData();
  //   formData.append("_id", this.info._id);
  //   try{
	// 		const info =  await util.sendFormData(`/contact/info`, "POST", formData);
  //     if(info.data.info)
  //     {
  //       this.querySelector("#reply").value = info.data.info.reply;
  //     }
	// 	}
	// 	catch (error) {
  //           console.error('오류:', error);
  //           alert('실패했습니다.');
  //       }
	// 	return;
	// }
    
  async #deleteContact(formData)
	{
		try{
			const response = await util.sendFormData(`/contact/delete`, "POST", formData);
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
            <span class="fw-semibold">문의사항 보기</span>
            <button type="button" class="btn btn-icon btn-black command-close-modal">
                    <i class="fas fa-times"></i></button>
          </div>
          <div class="card-body">

            <div class="mb-3">
                <div>
                    <label for="memo" class="form-label">내용</label>
                    <textarea rows="4" class="form-control" readonly id="memo" name="memo">${this.info.memo}</textarea>
                </div>
            </div>
            <hr>
            <div class="mb-3">
                <div>
                    <label for="reply" class="form-label">답변</label>
                    <textarea rows="4" class="form-control" readonly id="reply" name="reply">${this.info.reply}</textarea>
                </div>
            </div>
            
            <form>
                <input type="hidden" id="_id" value="${this.info._id}" name="_id" class="form-control" style="width: auto;">
            </form>    
            <button type="button" class="btn btn-danger form-control command-delete-contact">삭제</button>  
          </div>
        </div>
      </section>
      `;  
      return tempalate;
  }
}
customElements.define("contact-view", ContactView);


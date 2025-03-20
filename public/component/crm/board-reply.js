
class BoardReply extends AbstractComponent{
    constructor(message = "")
    {
        super();   
        this.message = message;
        this.addEventListener('click', this.handleClick);
     }
     static get observedAttributes() {return ['contentsid']; }
    
     attributeChangedCallback(name, oldValue, newValue) {
         if(name == 'contentsid') this["contentsId"] = newValue;
     }

     handleClick(e) {
        e.composedPath().find((node) => 
        {
            if (typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
            if(node.className.match(/command-send-reply/))
            {
                if(this.querySelector('input[name=memo]').value.length <= 0)
                {
                    alert("글내용이 없습니다.")
                }
                else
                {
                    this.#removeNoComment()
                    this.#addInfo();
                }
                return;
            }

            if(node.className.match(/command-delete-reply/))
            {
                this.#deleteInfo(node);
                return;
            }
        })
    }

    #addInfo()
	{
		const form = this.querySelector('form')
        const formData = new FormData(form);
		util.sendFormData('/reply/add', "POST", formData).then((response) =>
		{
            if (100 == response.code)
            {
                this.#addComment(response.data.info, true);
                this.querySelector('input[name=memo]').value = '';
                return;
            }
            else
            {
                if (response.message) alert(response.message, true);
                else console.dir(response); 
            }       
		});
		return;
	}

    #deleteInfo(node)
	{
        const formData = new FormData();
        formData.append('_id', node.dataset.id);
		util.sendFormData('/reply/delete', "POST", formData).then((response) =>
		{
            if (100 == response.code)
            {
                node.closest('.alert').remove();
                this.#addNocomment()
                return;
            }
            else
            {
                if (response.message) alert(response.message, true);
                else console.dir(response); 
            }       
		});
		return;
	}
     
    connectedCallback() {
        
        if(this.contentsId) this.#render();
    }

    #render()
    {
        const template = this.#getTemplate();
        if(template) this.appendChild(template.content.cloneNode(true));
        this.#getData()
    }

    #getData()
    {
        if(this.new) return;
        
        const formData = new FormData();
        formData.append('boardId', this.contentsId);
        util.sendFormData('/reply/list', "POST", formData).then((response) => 
        {
            if (100 == response.code)
            {
                if(response.data.list.length > 0) 
                {
                    this.#removeNoComment()
                    response.data.list.forEach(data=>this.#addComment(data));
                }
                return;
            }
            else
            {
                if (response.message) alert(response.message, true);
                else console.dir(response); 
            }       
        });
        return;
    }

    #addComment(data, prepend = false)
    {
        const box = this.querySelector('.reply-box');
        const comment = document.createElement('div');
        comment.classList.add("alert","alert-secondary");
        const delButton = (data.userId === globalThis.user._id)? `
        <button type="button" class="btn btn-icon reply-delete command-delete-reply" data-id="${data._id}">
        <i class="fas fa-times"></i></button>`:"<span></span>"
        comment.innerHTML = `
            <div class="reply-head">
                <span>${data.userName}</span>
                <div>
                    <span>${data.date}</span>
                    ${delButton}
                </div>
            </div>
            <p>${data.memo}</p>    
        `;
        if(prepend) box.prepend(comment);
        else box.appendChild(comment);
    }

    #removeNoComment()
    {
      this.querySelector('#no_reply_comment')?.remove();
    }
    
    #addNocomment()
    {
        const replyBox = this.querySelector('.reply-box')
        const replyCount = replyBox.querySelectorAll('.alert').length;
        if(replyCount === 0)
        {
            replyBox.innerHTML =  '<div id="no_reply_comment" class=" alert-light">댓글이 없습니다.</div>';
        }
    }

    #getTemplate()
    {
        const tempalate = document.createElement('template');
        tempalate.innerHTML = `
        <style>
            .alert{
            border: var(--bs-alert-border);
            -webkit-box-shadow: unset;
            -moz-box-shadow: unset;
            box-shadow: unset;
            }
            .send-box{display: flex; gap: 6px;}
            .reply-box{padding: 12px;
                max-height: 180px;
                overflow-y: scroll;
                border: 1px solid #eee;
                border-radius: 12px;
                margin-top: 12px;}
            contents-reply p{margin-bottom:0;}  
            .reply-head{
                border-bottom: 1px solid #bfc3cc;
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;}  
            .reply-head span:first-child{font-weight:bold} 
            button.reply-delete{margin-left: 4px; border: none;}   
        </style>
        <hr>
        <form onkeydown="return event.key != 'Enter';">
        <label for="reply" class="form-label">댓글</label>
        <div class="send-box" role="">
            <input type="hidden" name="boardId" value="${this.contentsId}">
            <input type="hidden" name="userName" value="${globalThis.user.name}">
            <input type="hidden" name="user" value="${globalThis.user._id}">
            <input type="text" name="memo" class="form-control" id="reply">
            <button type="button" class="btn btn-primary command-send-reply">Send</button>
        </div>
        </form>
        <div class="reply-box">
            <div id="no_reply_comment" class=" alert-light" role="alert">
                   댓글이 없습니다.
            </div>
        </div>
        `;  
        return tempalate;
    }

  }
  customElements.define('board-reply', BoardReply);
  
  
  
  
  
   
  
  
  

class MessageReceiver extends HTMLElement
{
  constructor()
  {
    super();
    this.info = {};
    this.addEventListener('click', this.handleClick);
  }

  static get observedAttributes(){return [];}
  handleClick(e) {
    e.composedPath().find((node) => 
    {
        if (typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
        if(node.className.match(/command-go-link/))
        {
          const _info = {_id:node.dataset.id}
          const _formName = node.dataset.formName;
          const _tempInfo = {"tagName":_formName, "info":_info}
          const _message = {msg:"DO_SHOW_MODAL", data:_tempInfo}
          window.postMessage(_message, location.href);

          const listName = node.dataset.listName;
          window.postMessage({msg:"SELECT_TABLE_MENU", data:listName}, location.href);
          return;
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
    this.#readyMessage()
    return;
  }

  #readyMessage()
  {
    let eventSource =null;

    eventSource = new EventSource('/message/stream')
    
    eventSource.addEventListener('msg', (e)=>{
      let preMessage = JSON.parse(e.data)
      const message = document.createElement('span')
      message.innerHTML = preMessage.content;
      this.querySelector('div').appendChild(message)
    })
    
    // eventSource.onerror = (error) => {
    //   console.error('EventSource failed:', error);
    //   // Clean the current connection
    //   closeConnection();
    //   // Attempt to reconnect after a delay
    //   setTimeout(connectToEventStream, 5000);
    // };
  }

  #getTemplate()
  {
      const tempalate = document.createElement('template');
      tempalate.innerHTML = `
      <style>
        .message-receiver-link {
          cursor: pointer;
        }
      </style>
        <div>
          <span class="message-receiver-link command-go-link" data-list-name="user-list" data-form-name="user-form" data-id="67bec4c0f0b57102e74cccff">User Info</span>
          <span class="message-receiver-link command-go-link" data-list-name="company-list" data-form-name="company-form" data-id="67c020d6664443fa3933bb06">Customer Info</span>
        </div>
      `;  
      return tempalate;
  }
}
customElements.define("message-receiver", MessageReceiver);


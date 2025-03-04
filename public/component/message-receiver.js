
class MessageReceiver extends HTMLElement
{
  constructor()
  {
    super();
    this.info = {};
  }

  static get observedAttributes(){return [];}

  connectedCallback()
  {
    this.render();
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
    let eventSource
    eventSource = new EventSource('/message/stream')
    eventSource.addEventListener('msg', (e)=>{
      console.log(e.data)
      let preMessage = JSON.parse(e.data)
      const message = document.createElement('span')
      message.innerHTML = preMessage.content;
      this.querySelector('div').appendChild(message)
    })
    
    
  }

  #getTemplate()
  {
      const tempalate = document.createElement('template');
      tempalate.innerHTML = `
        <div></div>
      `;  
      return tempalate;
  }
}
customElements.define("message-receiver", MessageReceiver);


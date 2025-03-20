class AbstractComponent extends HTMLElement
{
  constructor()
  {
    super();
    this.message_prefix = util.secureRandom();
    this.addEventListener('click', this.handleClick);
  }


  handleClick(e)
  {
     //e.preventDefault();
     const node = e.target;
     if(node.nodeName === 'A')
     {
        e.stopPropagation();
     }
     return;
  }

  static get observedAttributes(){return [];} 

  attributeChangedCallback(name, oldValue, newValue)
  {
    this[name] = newValue;
  }

  connectedCallback()
  {
    
  }

  disconnectedCallback()
  {
    window.removeEventListener("message", this.receiveMessage)
    this.removeEventListener("click", this.handleClick)
  }

  sendPostMessage(message)
  {
    window.postMessage(message, location.href);
  }
  
  
}
customElements.define('abs-component', AbstractComponent);

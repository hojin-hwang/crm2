export default class AbstractComponent extends HTMLElement
{
  constructor()
  {
    super();
    this.message_prefix = util.secureRandom();
    this.addEventListener('click', this.handleClick);
  }

  handleClick(e)
  {
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
    this.render();
  }

  disconnectedCallback()
  {
    window.removeEventListener("message", this.messageListener)
    this.removeEventListener("click", this.handleClick)
  }

  sendPostMessage(message)
  {
    window.postMessage(message, location.href);
  }
  
  showAlert(data)
	{
		new AlertMessage(data);
	}
}
customElements.define('abs-component', AbstractComponent);

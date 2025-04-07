
class ImageZoom extends AbstractComponent
{
  
  constructor(info)
  {
    super();
    this.addEventListener('click', this.handleClick);
    this.url = `/uploads/${globalThis.user.clientId}/${info}`;
  }

  handleClick(e) {
    e.composedPath().find((node) => 
    {
        if (typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
        if(node.className.match(/command-close-image-zoom/))
        {
          this.remove();
          return true;
        }
    });
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
    const container = document.getElementById("myPanzoom");
    new Panzoom(container, {
      on: {
        click: (panzoom, event) => {
          event.preventDefault();

          if (panzoom.targetScale > 1) {
            panzoom.zoomTo(1);
          } else {
            panzoom.zoomTo(2, { event });
          }
        },
      },
    });
    return;
  }


  #getTemplate()
  {
      const tempalate = document.createElement('template');
      tempalate.innerHTML = `
      <style>
        .image-zoom {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1024;
       }
        img{width: 100%;}
      </style>
      
        <section class="image-zoom">
          <div class="card-header form-header row-space-between">
              <span class="fw-semibold">이미지 확대</span>
              <button type="button" class="btn btn-icon btn-black command-close-image-zoom">
              <i class="fas fa-times"></i></button>
          </div>
          <div class="f-panzoom" id="myPanzoom">
            <div class="f-panzoom__viewport">
              <img class="f-panzoom__content" src="${this.url}" />
            </div>
          </div>
        </section>
      `;  
      return tempalate;
  }
}
customElements.define("image-zoom", ImageZoom);



class FileEtc extends HTMLElement{
	constructor()
	{
			super();   
			this.box = [];
			this.BOXSIZE = 3;
			this.addEventListener('click', this.handleClick);
	 }
	static get observedAttributes() {return ['editable','contentsid','new']; }
	 
	handleClick(e) {
			e.composedPath().find((node) => 
			{
					if (typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
					if(node.className.match(/command-add-file/))
					{
							const form = node.closest('form');
							const formData = new FormData(form);
							formData.append('contentsId', this.contentsId);
							this.#addInfo(formData);
							return;
					}
					if(node.className.match(/command-delete-etc-file/))
					{
							const formData = new FormData()
							formData.append("folder", node.dataset.folder)
							formData.append("name", node.dataset.name)
							formData.append("id", node.dataset.id)
							this.#deleteInfo(formData);
							node.closest('div.download-box').remove();

					}
			});
	}

	connectedCallback() {
			this._render();
	}
			
	disconnectedCallback(){
			window.removeEventListener("message", this.receiveMessage);
	}
	
	attributeChangedCallback(name, oldValue, newValue) {
			if(name == 'editable') 
			{
					this["editable"] = JSON.parse(newValue);
					if(!this["editable"] && this.querySelector('form'))
					{
							this.querySelector('form').classList.add('hidden');
					}
			}
			if(name == 'contentsid') this.contentsId = newValue;
			if(name == 'new') this.new = JSON.parse(newValue);
	}

	_render()
	{
			const template = this.#getTemplate();
			if(template) this.appendChild(template.content.cloneNode(true));
			this.querySelector('input[type=file]').addEventListener('change', e => {
					this.querySelector('.command-add-file').disabled = false;
			});

			if(!this.editable) 
			{
					this.querySelector('form').classList.add('hidden');
			}
			
			this.#getData();
	}

	#addInfo(formData)
{
	const info = {};
			formData.append('id', util.secureRandom());
			formData.append('contentsId', this["contentsId"] );
	for (const pair of formData.entries()) {
		info[pair[0]] = pair[1];
	}
	info['date'] = util.getDayDashFormat(new Date())
	util.get_json_request("POST", '/api/crm/boardFile/add', formData, (response)=>
	{
					if (100 == response.code && response.info.name !== 'error file')
					{
							this.#addAttachFileButton(response.info);
							this.querySelector('input[type=file]').value="";
							this.querySelector('.command-add-file').disabled = true;
							this.box.push(info.id);
							this.#boxSetStatus();
							return;
					}
					else
					{
							new AlertMessage("파일크기를 확인해주세요.");
							if (response.message) alert("파일크기를 확인해주세요.", true);
							else console.dir(response); 
					}       
	});

	return;
}

	#addAttachFileButton(info)
{
	
			const button = document.createElement("button")
	button.setAttribute('type', "button");
	button.innerText = "삭제";
	button.classList.add("command-delete-etc-file");
	button.dataset.name = info.name;
	button.dataset.folder = info.folder;
	button.dataset.id = info.id;

			const box = this.#makeDownLoadBox(info);
			if(this.editable) box.appendChild(button);
			this.querySelector('.etc-files').appendChild(box)

}	

#makeDownLoadBox(info)
{
	const box = document.createElement('div');
	box.classList.add('download-box');
	box.innerHTML = `<a href="/skin/ko/crm/files/etc/${info.name}" target="_blank">${info.name}</a>`;
	return box;
}

	#deleteInfo(formData)
{
	util.get_json_request("POST", '/api/crm/boardFile/delete', formData, (response)=>
	{
			if (100 == response.code)
			{
				this.#removeBoxElement(formData.get("id"));
									this.#boxSetStatus();
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

	#removeBoxElement(id)
	{
			this.box = this.box.filter(item => item.toString() !== id);
	}

	#boxSetStatus()
	{
			if(this.box.length === 0 && !this.editable)
			{
					this.querySelector('label').classList.add('hidden')
			}
			
			if(this.box.length >= this.BOXSIZE)
			{
					this.querySelector('input[type=file]').disabled = true;
			}
			else
			{
					this.querySelector('input[type=file]').disabled = false;
			}
	}

	#getData()
	{
			if(this.new || !this.contentsId) return;
			else
			{
					const formData = new FormData();
					formData.append('contentsId', this.contentsId);
					formData.append('folder', 'etc');
					util.get_json_request("POST", '/api/crm/boardFile/getList', formData, (response)=>
					{
							if (100 == response.code)
							{
									response.list.forEach(data=>{
											this.#addAttachFileButton(data);
											this.box.push(data.id);
									});
									
									this.#boxSetStatus();
		 
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
	}

	#getTemplate()
	{
			const tempalate = document.createElement('template');
			tempalate.innerHTML = `
					<style>
							.hidden{display:none;}
							.command-delete-etc-file{
									color: red;
									text-decoration: underline;
									margin-left:12px;
									border:none;
									background:none;
							}
					</style>
					<label for="name" class="form-label">첨부 파일(4M 이하)</label>
					<form>
							<input type="file" name="board_image[]"></file>
							<button type="button" class="btn btn-primary command-add-file" disabled>SEND</button>
					</form>
					<div class="etc-files">
							
					</div>
			`;  
			return tempalate;
	}

}
customElements.define('file-etc', FileEtc);





 



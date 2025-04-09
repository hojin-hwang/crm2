class BoardUserForm extends AbsForm
{
    constructor()
    {
        super(); 
        this.users = [];
        this.access_users = [];
        this.boardId = null; 
    }

    static get observedAttributes() {return; }
  
    handleClick(e) {
        //e.preventDefault();
        e.composedPath().find((node)=>{
            if(node.nodeName === 'svg' || node.nodeName === 'path') return false;
            if(typeof(node.className) === 'object' || !node.className || !node.className?.match(/command/)) return false;
            if(node.className.match(/command-add-user/))
            {
                const select = this.querySelector('select[name=users]')
                const index = (select.selectedIndex)
                if(index >= 0)
                {
                    const userId = select.options[index].value;
                    const userName = select.options[index].text;
                    if(this["access_users"].indexOf(userId) === -1)
                    {
                        this["access_users"].push(userId);
                        this.#makeOption("access_users", {userId, userName})
                        this.#updateAccessUser(userId, "ADD_USER");
                        select.remove(index);
                    }
                }
                
                return;
            }

            if(node.className.match(/command-remove-user/))
            {
                const select = this.querySelector('select[name=access_users]')
                const index = (select.selectedIndex)
                
                if(index >= 0)
                {
                    const userId = select.options[index].value;
                    const userName = select.options[index].text;
                    select.remove(index);
                    this.#updateAccessUser(userId, "REMOVE_USER")
                    const idx = this["access_users"].indexOf(userId)
                    if (idx > -1) this["access_users"].splice(idx, 1)
                    this.#makeOption("users", {userId, userName})
                }
                return; 
            }
        });
    }

    #updateAccessUser(userId, command)
    {
        const formData = new FormData();
        formData.append('_id', this.boardId);
        formData.append('user', userId);
        formData.append('command', command);
        store.updateInfo(formData, 'boardInfo', "COMMAND-")
    }

    #makeOption(target, info)
    {
        const targetSelect = this.querySelector(`select[name=${target}]`)
        let opt = document.createElement('option');
        opt.value = info.userId;
        opt.innerHTML = info.userName;
        targetSelect.appendChild(opt);
    }

    setData(data)
    {
       if(data)
       {
        this.boardId = data;
       }
    }
    
    render()
    {
        const template = this.getTemplate();
        this.appendChild(template.content.cloneNode(true));
        
        const boardInfo = (store.getInfo("boardInfo", "_id", this.boardId));
        const userList = (boardInfo.user && boardInfo.user.length)? boardInfo.user : [];

        const accessList = userList.reduce((acc, user) => {
            const userInfo = store.getInfo("user", "_id", user)
            if(userInfo) acc.push(userInfo);
            return acc;
          }, []);
          
        this.#makeUserSelect(accessList, 'access_users')

        const accessListSet = new Set(accessList)
        const result = globalThis.userList.filter(item => !accessListSet.has(item));
        
        this.#makeUserSelect(result, 'users')

    }

    #makeUserSelect(list, selectName)
    {
        const normalUserList = list.filter(user => user.degree === '일반')
        
        const select = this.querySelector(`select[name=${selectName}]`)
        normalUserList.forEach(user => {
            let opt = document.createElement('option');
            opt.value = user._id;
            opt.innerHTML = `${user.name}[${user.username}]`;
            select.appendChild(opt);
            this[selectName].push(user.id)
        });
    }

    getTemplate()
    {
        const inner_template = document.createElement('template');
        inner_template.innerHTML = `
        <style>
            select{width:100%;}
            board-user-form .button-group{
                display: flex;
                flex-direction: column;
                gap: 12px;
                align-items: center;
                justify-content: center;
                width: 60px;
            }
        </style>
        <div class="card">
            <div class="card-header form-header row-space-between">
                <span class="fw-semibold">접근 허용자</span>
                <button type="button" class="btn btn-icon btn-black command-close-modal">
                <i class="fas fa-times"></i></button>
            </div>
            <div class="card-body">
                <div class="card">
                    <div class="card-body">
                        <div class="mb-3 row-space-between">
                            <div>
                                <select name="users" size="14">
                                    
                                </select>
                            </div>
                            <div class="button-group">
                                <button type="button" class="btn btn-icon command-add-user"><i class="fas fa-arrow-right"></i></button>
                                <button type="button" class="btn btn-icon command-remove-user"><i class="fas fa-arrow-left"></i></button>
                            </div>
                            <div>
                                <select name="access_users" size="14">
                                  
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
        return inner_template;
    }

  }
  customElements.define('board-user-form', BoardUserForm);
  
  
  
  
  
   
  
  
  
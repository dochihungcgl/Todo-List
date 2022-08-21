function createTodoElement(todo, params){
    if(!todo) return null;

    // find template
    const todoTemplate = document.getElementById('todoTemplate');
    if(!todoTemplate) return null;

    // clone li element
    const todoElement = todoTemplate.content.firstElementChild.cloneNode(true);
    todoElement.dataset.id = todo.id;
    todoElement.dataset.status = todo.status;

    // render todo status
    const divElement = todoElement.querySelector('div.todo');
    if(!divElement) return null;
    const alertClass = todo.status === 'completed' ? 'alert-success' : 'alert-secondary';
    divElement.classList.remove('alert-secondary')
    divElement.classList.add(alertClass);

    // update content  where needed
    const titleElement = todoElement.querySelector('.todo__title');
    if(titleElement) titleElement.textContent = todo.title;

    todoElement.hidden = !isMatch(todoElement, params);

    // TODO:  attach events for buttons

    // add click event for mark-as-done button
    const maskAsDoneButton = todoElement.querySelector('.mark-as-done');
    if(maskAsDoneButton){
        const buttonClass = todo.status === 'completed' ? 'btn-success' : 'btn-dark';
            // maskAsDoneButton.classList.remove('btn-dark', 'btn-success');
            maskAsDoneButton.classList.add(buttonClass);

            const buttonTextContent = todo.status === 'completed' ? 'Reset' : 'Finish';
            maskAsDoneButton.textContent = buttonTextContent;

        // event button
        maskAsDoneButton.addEventListener('click', () => {
            resetFrom();
            const currentStatus = todoElement.dataset.status;
            const statusNew = currentStatus === 'completed' ? 'pending' : 'completed';


            const todoList = getTodoList();
            const index = todoList.findIndex(x => x.id === todo.id);
            if(index >= 0){
                todoList[index].status = statusNew;
                localStorage.setItem('todo_list', JSON.stringify(todoList));
            }

            // update data-status on li element
            todoElement.dataset.status = statusNew;
            
            // update class btn
            const buttonClassNew = currentStatus === 'completed' ? 'btn-dark' : 'btn-success';
            maskAsDoneButton.classList.remove('btn-dark', 'btn-success');
            maskAsDoneButton.classList.add(buttonClassNew);

            // update content btn
            const buttonTextContentNew = currentStatus === 'completed' ? 'Finish' : 'Reset';
            maskAsDoneButton.textContent = buttonTextContentNew;

            const alertClassNew = currentStatus === 'completed' ? 'alert-secondary' : 'alert-success' ;
            divElement.classList.remove('alert-secondary', 'alert-success');
            divElement.classList.add(alertClassNew);
        })
    }
    // add click event for remove button
    const removeButton = todoElement.querySelector('.remove');
    if(removeButton){
        removeButton.addEventListener('click', () => {
            resetFrom();
            const todoList = getTodoList();
            
            // filter array todo
            const todoListNew = todoList.filter(x => x.id !== todo.id);
            localStorage.setItem('todo_list', JSON.stringify(todoListNew));

            todoElement.remove();

        })
    }

    // add click event for edit button
    const editButton = todoElement.querySelector('button.edit');
    if(editButton){
        editButton.addEventListener('click', () => {
            resetFrom();
            //TODO: latest todo data (dữ liệu làm việc phải mới nhất)
            const todoList = getTodoList();

            // find : latestTodo (todo mới nhất)
            const latestTodo = todoList.find(x => x.id === todo.id);
            if(!latestTodo) return;

            //populate data to form todo (điền dữ liệu vào biểu mẫu việc cần làm)
            populateTodoForm(latestTodo);
        })
    }


    return todoElement;

}

function populateTodoForm(todo){
    // query todo form
    // 
    const todoForm = document.getElementById('todoFormId');
    if(!todoForm) return;
    todoForm.dataset.id = todo.id;

    // set todoText
    const todoInput = document.getElementById('todoText');
    if(!todoInput) return;
    todoInput.value = todo.title;


}


function renderTodoList(todoList, ulElementId, params){
    
    if(!Array.isArray(todoList) || todoList.length === 0) return;

    const ulElement = document.getElementById(ulElementId);
    if(!ulElement) return;

    for(const todo of todoList){
        const liElement = createTodoElement(todo, params);
        ulElement.appendChild(liElement);
    }
}

function getTodoList(){
    if(localStorage.length === 0){
        localStorage.setItem('todo_list', JSON.stringify([]));
        return [];
    }

    try
    {
        return JSON.parse(localStorage.getItem('todo_list'));
    }
    catch 
    {
        return [];
    }
    
}

function handleTodoFormSubmit(event){
    event.preventDefault();

    const todoForm = document.getElementById('todoFormId');
    if(!todoForm) return;
    
    // get form values
    const todoInput = document.getElementById('todoText');
    if(!todoInput) return;

    const todoText = todoInput.value;
    if(todoText.trim() === '') return;

    // determine add or edit mode (xác định xem đang add hay edit)
    const isEdit = Boolean(todoForm.dataset.id);

    if(isEdit){
        // edit mode
        // find current todo
        const todoList = getTodoList();
        const index = todoList.findIndex(x => x.id.toString() === todoForm.dataset.id);
        if(index < 0) return;
        
        // update content
        todoList[index].title = todoText;
        
        // save
        localStorage.setItem('todo_list', JSON.stringify(todoList));
        
        // apply DOM change
        const liElement = document.querySelector(`ul#todo-list > li[data-id="${todoForm.dataset.id}"]`);
        if(!liElement) return;
        const titleElement = liElement.querySelector('.todo__title');
        if(titleElement) titleElement.textContent = todoText;

    } else { 
        // add mode
        const newTodo = {
            id : Date.now(),
            title: todoText,
            status: 'pending'
        }
        // save
        const todoList = getTodoList();
        todoList.push(newTodo);
        localStorage.setItem('todo_list', JSON.stringify(todoList));

        // apply Dom changes
        const ulElement = document.getElementById('todo-list');
        if(!ulElement) return;
        const newLiElement = createTodoElement(newTodo);
        ulElement.appendChild(newLiElement);

    }

    

    //reset form
    delete todoForm.dataset.id;
    todoForm.reset();
}

function resetFrom(){
    const todoForm = document.getElementById('todoFormId');
    if(!todoForm.dataset.id) return;
    delete todoForm.dataset.id;
    todoForm.reset();
}

// SEARCH TODO
function getAllTodoElements(){
    return document.querySelectorAll('#todo-list > li');
}


function isMatchStatus(liElement, filterStatus){
    return filterStatus === 'all' || liElement.dataset.status === filterStatus;
}
// searchTerm : cum tu tim kiem
function isMatchSearch(liElement, searchTerm){
    if(!liElement) return false;
    if(searchTerm === '') return true;

    const titleElement = liElement.querySelector('p.todo__title');
    if(!titleElement) return false;

    return titleElement.textContent.toLowerCase().includes(searchTerm.toLowerCase());

}

function isMatch(liElement, params){
    if(!params.get('status')){
        params.set('status', 'all');
    }
    if(!params.get('searchTerm')){
        return isMatchStatus(liElement, params.get('status'));
    }


    return isMatchSearch(liElement, params.get('searchTerm')) && isMatchStatus(liElement, params.get('status'));
}


function initSearchInput(params){
    // find search term input
    const searchInput = document.getElementById('searchTerm');
    if(!searchInput) return;

    if(params.get('searchTerm')){
        searchInput.value = params.get('searchTerm');
    }

    searchInput.addEventListener('input', () => {
        handlerFilterChange('searchTerm', searchInput.value);
    })
}


function handlerFilterChange(filterName, filterValue){
    // update query params
    const url = new URL(window.location);

    url.searchParams.set(filterName, filterValue);
    history.pushState({}, '', url);

    const todoElementList = getAllTodoElements();
    
    for(const todoElement of todoElementList){
        const needToShow = isMatch(todoElement, url.searchParams);
        todoElement.hidden = !needToShow;
    }

}


function initFilterStatus(params){
    // find select
    const filterStatusSelect = document.getElementById('filterStatus');
    if(!filterStatusSelect) return;

    if(params.get('status')){
        filterStatusSelect.value = params.get('status');
    }

    // attach event change
    filterStatusSelect.addEventListener('change', () => {
        handlerFilterChange('status', filterStatusSelect.value);
    })
}

// main
(() => {
    const params = new URLSearchParams(window.location.search);

    const todoList = getTodoList();
    renderTodoList(todoList, 'todo-list', params);

    // register submit event for todo form
    const todoForm = document.getElementById('todoFormId');
    if(todoForm){
        todoForm.addEventListener('submit', handleTodoFormSubmit);
    }

    // get query params object

    initSearchInput(params);
    initFilterStatus(params);
    
})();
class Todo {
    constructor() {
        this.container = document.querySelector('.todo-container');
        this.form = this.container.querySelector('form');
        this.input = this.form.querySelector('input');
        this.todosContainer = this.container.querySelector('.todos');
        this.toggleShowType = this.container.querySelector('.show-type');
        this.clearTodos = this.container.querySelector('.clear-todos');
        this.modal = document.querySelector('.modal');
        this.modalContainer = this.modal.querySelector('.modal-container')
        this.modalOk = this.modalContainer.querySelector('.ok');
        this.modalCancel = this.modalContainer.querySelector('.cancel');

        this.todos = [];
        this.doneTodos = [];
        this.undoneTodos = [];
        this.animDelay = 0;

        this.showType = 'undone';
        this.toggleType = this.toggleType.bind(this);
        this.init();
    }

    init() {
        this.listeners();
        
        if (this.getTodos() !== null) {
            this.todos = this.getTodos();

            if (this.getDoneTodos() !== null) {
                this.doneTodos = this.getDoneTodos();
            }

            this.collectUndoneTodos();

            if (this.getType() !== null) {
                this.showType = this.getType();
                this.toggleType();

                const options = this.toggleShowType.querySelectorAll('option');
                for (let i = 0; i < options.length; i++) {
                    const option = options[i];
                    if (option.text.toLowerCase() === this.showType) {
                        this.toggleShowType.selectedIndex = i;
                    }
                }
            } else {
                this.render(this.todos);
            }
        }
    }

    listeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const value = this.input.value;
            const todo = {
                label: value,
                status: 'undone',
                key: this.todos.length
            };

            this.addTodo(todo);
            this.todos.push(todo);
            this.saveTodos();
        });

        this.modalCancel.addEventListener('click', () => {
            this.modal.classList.remove('open');
        });

        this.toggleShowType.addEventListener('change', (e) => {
            this.showType = this.toggleShowType.value.toLowerCase();
            this.toggleType();
        });

        this.clearTodos.addEventListener('click', () => {
            localStorage.removeItem('todos');
            localStorage.removeItem('done-todos');
            this.todos = [];
            this.addTodo.undoneTodos = [];
            this.doneTodos = [];
            Creator.removeNode(this.todosContainer, ...this.todosContainer.children);
        });
    }

    toggleType() {
        if (this.showType === 'undone') {
            this.showUndoneTodos();
        } else if (this.showType === 'done') {
            this.showDoneTodos();
        } else if (this.showType === 'all') {
            this.collectUndoneTodos();
            const todos = this.undoneTodos.concat(this.doneTodos);
            this.render(todos);
        } else {
            this.render(this.todos);
        }

        this.saveType();
    }

    collectUndoneTodos() {
        this.undoneTodos = [];
        this.todos.map(todo => {
            if (todo.status === 'undone') this.undoneTodos.push(todo);
        });
    }

    showUndoneTodos() {
        this.collectUndoneTodos();
        this.render(this.undoneTodos);
    }

    showDoneTodos() {
        this.render(this.doneTodos);
    }

    render(todos) {
        this.todosContainer.innerHTML = '';
        todos.map((todo, index) => {
            todo.key = index;
            this.addTodo(todo);

            this.animDelay += 100;
            if (index === this.todos.length - 1) this.animDelay = 0;
        });
    }

    saveType() {
        localStorage.setItem('type', this.showType);
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
        localStorage.setItem('done-todos', JSON.stringify(this.doneTodos));
    }

    getType() {
        return localStorage.getItem('type');
    }

    getTodos() {
        const todos = JSON.parse(localStorage.getItem('todos'));
        return todos;
    }

    getDoneTodos() {
        const doneTodos = JSON.parse(localStorage.getItem('done-todos'));
        return doneTodos;
    }

    addTodo(todo) {
        const todoItem = Creator.createNode({
            type: 'li',
            parent: '.todos',
            classes: ['todo'],
            style: {
                opacity: 0,
                transform: 'translateY(30px) scale(1.2)'
            },
            attributes: {
                'data-key': todo.key
            },
            children: [
                {
                    type: 'span',
                    text: todo.label
                }
            ]
        });

        setTimeout(() => {
            TweenMax.to(todoItem, 0.25,
                {
                    y: 0, scale: 1,
                    opacity: 1, clearProps: 'all',
                    ease: Expo.easeOut
                }
            );
        }, this.animDelay);
        

        if (todo.status === 'done') {
            const dateCompleted = new Date(todo.dateCompleted);
            Creator.createNode({
                type: 'div',
                parent: todoItem,
                classes: ['done-details'],
                children: [
                    {
                        type: 'span',
                        html: `completed on: &nbsp;&nbsp;
                        ${dateCompleted.getFullYear()}
                        /
                        ${dateCompleted.getMonth() + 1}
                        /
                        ${dateCompleted.getDay()}
                        `
                    },
                    {
                        type: 'span',
                        html: `completed at: &nbsp;&nbsp;
                        ${dateCompleted.getHours()}
                        :
                        ${dateCompleted.getMinutes()}
                        :
                        ${dateCompleted.getSeconds()}
                        `
                    }
                ]
            });
        }

        if (todo.status !== 'done') {
            const todoAction = Creator.createNode({
                type: 'div',
                parent: todoItem,
                classes: ['todo-actions']
            });

            const doneTodo = Creator.createNode({
                type: 'button',
                parent: todoAction,
                text: 'done',
                classes: ['todo-done']
            });
    
            const deleteTodo = Creator.createNode({
                type: 'button',
                parent: todoAction,
                text: 'delete',
                classes: ['delete-todo']
            });
    
            doneTodo.addEventListener('click', (e) => {

                this.todos.map(_todo => {
                    if (_todo.label === todo.label) {
                        let key = this.todos.indexOf(_todo);

                        _todo.status = 'done';
                        _todo.dateCompleted = new Date();
                        this.doneTodos.push(this.todos[key]);
            
                        this.todos.splice(key, 1);
                        this.saveTodos();
                    }
                });

                this.removeTodo(todoItem, 'done');
            });
    
            deleteTodo.addEventListener('click', (e) => this.showModal(todoItem));
        }
    }

    showModal(todo) {
        const timeline = new TimelineMax();
        TimelineMax.defaultEase = Expo.easeOut;

        timeline.to(this.modal, 0.25, {className: '+=open'});
        this.modalOk.addEventListener('click', () => {
            timeline.to(this.modal, 0.25, {className: '+=ok'})
            .to(this.modal, 0.25, {
                className: '-=open',
                onComplete: () => {
                    this.modal.classList.remove('ok');
                    this.deleteTodo(todo);
                }
            })
        });
    }

    deleteTodo(todo) {
        this.todos.splice(todo.dataset.key, 1);
        this.saveTodos();
        this.removeTodo(todo, 'delete');
    }

    removeTodo(todoItem, classToAdd) {
        todoItem.classList.add(classToAdd);
        setTimeout(() => {
            Creator.removeNode('.todos', todoItem);
            this.toggleType();
        }, 500);
    }
}

new Todo();
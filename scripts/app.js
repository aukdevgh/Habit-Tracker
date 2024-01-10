'use strict';

let habits = [
    {
      "id": 1,
      "icon": "sport.svg",
      "name": "Отжимания",
      "target": 10,
      "days": [
        { "comment": "Первый подход всегда даётся тяжело" },
        { "comment": "Второй день уже проще" },
        { "comment": "Круто!" }
      ]
    },
    {
      "id": 2,
      "icon": "water.svg",
      "name": "Вода",
      "target": 10,
      "days": [{ "comment": "Круто!" }, { "comment": "Второй день уже проще" },]
    },
    {
      "id": 3,
      "icon": "food.svg",
      "name": "Правильное питание",
      "target": 3,
      "days": [{ "comment": "Круто!" }]
    }
];


let habitsIcon = ['sport.svg', 'water.svg', 'food.svg', 'bad.png', 'bite-nails.png', 'no-smoking.png', 'dance.png', 'drawing.png', 'healthy-breakfast.png', 'learning-new-skills.png', 'outdoor-activities.png', 'practicing-mindfulness.png', 'running.png', 'sleep-hygiene.png', 'yoga.png']

const Habit_KEY = 'Habit_KEY';
const page = {
    menu: document.querySelector('.menu__list'),
    header: {
        h1: document.querySelector('.content__title'),
        progressPercent: document.querySelector('.progress__percent'),
        progressCoverBar: document.querySelector('.progress__cover-bar'),
    },

    content: {
        list: document.querySelector('.content__list'),
        nextDay: document.querySelector('.habit__day_next'),
    },

    popup: {
        select: document.querySelector('.select__list'),
        icon: document.querySelector('.form__input[name="icon"]'),
        form: document.querySelector('.popup__form')
    }

}

let currentHabitId;

/* utils */
function loadData() {
    const habitsString = localStorage.getItem(Habit_KEY);
    const habitArray = JSON.parse(habitsString);

    if(Array.isArray(habitArray)) {
        habits = habitArray;
    }
}

function saveData() {
    localStorage.setItem(Habit_KEY, JSON.stringify(habits));
}

function popupToggle() {
    const popup = document.querySelector('.popup');
    popup.classList.toggle('popup_hidden')
}

function validateForm(form, fields) {
    const formData = new FormData(form);
    let isValid = true;

    for (const field of fields) {
        const fieldValue = formData.get(field).trim();
        form[field].classList.remove('error');
        if(!fieldValue) {
            form[field].classList.add('error');
            isValid = false;
        }
    }

    return isValid;
}

function resetForm(form, fields) {
    for (const field of fields) {
        form[field].value = ''
    }
}

function getFormData(form, fields) {
    const formData = new FormData(form);
    const res = {};

    for(const field of fields) {
        const fieldValue = formData.get(field).trim();
        res[field] = fieldValue;
    }

    return res;
}

/* render */
function rerenderMenu() {

    for (const habit of habits) {
        const existed = document.querySelector(`[menu-habit-id="${habit.id}"]`);
        if(!existed) {
            const menuItem = document.createElement('li');
            menuItem.classList.add('menu__item');
            menuItem.setAttribute('menu-habit-id', habit.id)
            menuItem.addEventListener('click', () => rerender(habit.id));

            menuItem.innerHTML = `<button class='btn' aria-label='${habit.name}'>
                <img class='btn__img' src='images/${habit.icon}' alt='${habit.name}' width="25" height="25">
            </button>`;


            if(currentHabitId === habit.id) {
                menuItem.classList.add('active');
            }

            page.menu.appendChild(menuItem);

            continue;
        }

        if(currentHabitId === habit.id) {
            existed.classList.add('active');
        } else {
            existed.classList.remove('active');
        }
    }

}

function rerenderHeader(activeHabit) {
    page.header.h1.textContent = activeHabit.name;
    const progress = activeHabit.days.length / activeHabit.target > 1 ? 100 : activeHabit.days.length / activeHabit.target * 100;
    page.header.progressPercent.textContent = progress.toFixed(0) + '%';
    page.header.progressCoverBar.setAttribute('style', `width: ${progress}px`);
}

function rerenderContentList(activeHabit) {
    page.content.list.innerHTML = '';
    let dayNum = 1;


    if(activeHabit.days.length) {
        let fragment = new DocumentFragment();

        for(let day of activeHabit.days) {
            const li = document.createElement('li');
            li.classList.add('habit');
            li.innerHTML = `<div class="habit__day">День ${dayNum}</div>
            <div class="habit__comment">${day.comment}</div>
            <button class="habit__delete-day" onclick="deleteDay(${dayNum - 1})">
                <img class="habit__img" src="images/delete.svg" alt="удалить день ${dayNum}" width="24" height="24">
            </button>`;

            fragment.appendChild(li)
            dayNum++;
        }

        page.content.list.appendChild(fragment);
    }


    page.content.nextDay.textContent = `День ${dayNum}`;
}

function rerenderSelectList() {
    if(!habitsIcon.length) {
        return
    }

    const fragment = new DocumentFragment()

    for (const icon of habitsIcon) {
        const li = document.createElement('li');
        li.classList.add('select__item');
        li.innerHTML = `
        <button class="select__btn btn" onclick="selectIcon(this, '${icon}')">
            <img class="btn__img" src="images/${icon}" alt="${icon.split('.')[0]}" width="25" height="25">
        </button>`

        fragment.appendChild(li)
    }

    page.popup.select.appendChild(fragment);
}


function rerender(activeHabitId) {
    currentHabitId = activeHabitId;

    const activeHabit = habits.find(habit => habit.id === activeHabitId)
    if(!activeHabit) {
        return
    }

    document.location.replace(document.location.pathname + '#' + activeHabitId);

    rerenderMenu()
    rerenderHeader(activeHabit)
    rerenderContentList(activeHabit)
}



/* work width form */
function addDay(event) {
    event.preventDefault();
    const form = event.target;

    const data = validateForm(form, ['comment']) && getFormData(form, ['comment']);

    if(!data) {
        return
    }

    habits = habits.map(habit => {
        if(habit.id === currentHabitId) {
            return {
                ...habit,
                days: habit.days.concat([data])
            }
        }

        return habit
    })

    resetForm(form, ['comment']);
    rerender(currentHabitId)
    saveData()
}


function deleteDay(index) {
    habits = habits.map(habit => {
        if(habit.id === currentHabitId) {
            habit.days.splice(index, 1);

            return {
                ...habit,
                days: habit.days
            }
        }

        return habit
    })

    rerender(currentHabitId)
    saveData()
}


function selectIcon(context, icon) {
    const currentActiveBtn = document.querySelector('.select__btn.active');
    currentActiveBtn?.classList.remove('active');

    context.classList.add('active');
    page.popup.icon.value = icon;
    page.popup.select.classList.remove('error')
}


function addHabit(event) {
    event.preventDefault();

    if(!page.popup.icon.value) {
        page.popup.select.classList.add('error');
        return;
    }

    const form = event.target;
    const data = validateForm(form, ['name', 'icon', 'target']) && getFormData(form, ['name', 'icon', 'target']);

    if (!data) {
        return
    }

    const habit = {
        "id": Date.now(),
        ...data,
        "days": []
    }

    habits = [...habits, habit];

    resetForm(form, ['name', 'icon', 'target']);
    saveData();
    popupToggle();
    rerender(habit.id);
}

function deleteHabit() {
    habits = habits.filter(habit => habit.id !== currentHabitId);

    const currentActiveBtn = document.querySelector(`[menu-habit-id="${currentHabitId}"]`);
    currentActiveBtn.remove()

    rerender(habits[0].id);
    saveData();
}

/* init */
(() => {
    loadData();

    const hashId = Number(document.location.hash.replace('#', ''));
    const habit = habits.find(habit => habit.id == hashId);
    const habitId = habit?.id ?? habits[0]?.id
    rerender(habitId);

    rerenderSelectList();
})()
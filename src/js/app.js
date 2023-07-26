import openDialogBox from './openDialogBox';
import RenderingField from './RenderingField';
import Storage from './Storage';

console.log('app.js is bunled');

const render = new RenderingField();
const storage = new Storage();
const loadData = storage.load();
const dataTrello = {};

if (loadData === null || loadData.toDo === undefined) {
  render.actionDefault();
} else {
  render.actionStorage(loadData);
}

const buttonSaveInStorage = document.querySelector('.save_button');
const buttonResetInStorage = document.querySelector('.reset_button');

buttonResetInStorage.addEventListener('click', () => {
  Array.from(document.querySelectorAll('.task')).forEach((item) => {
    item.remove();
  });
  storage.remove();
  render.actionDefault();
});

buttonSaveInStorage.addEventListener('click', () => {
  const columnTodo = Array.from(document.querySelector('.todo').querySelectorAll('.task_text'));
  const columnInProgress = Array.from(document.querySelector('.in_progress').querySelectorAll('.task_text'));
  const columnDone = Array.from(document.querySelector('.done').querySelectorAll('.task_text'));
  dataTrello.toDo = [];
  dataTrello.inProgress = [];
  dataTrello.done = [];
  columnTodo.forEach((item) => {
    dataTrello.toDo.push(item.textContent);
  });
  columnInProgress.forEach((item) => {
    dataTrello.inProgress.push(item.textContent);
  });
  columnDone.forEach((item) => {
    dataTrello.done.push(item.textContent);
  });

  storage.save(dataTrello);
});

function createClosedElement() {
  const div = document.createElement('div');
  div.classList.add('closed_element');
  div.textContent = '\u2573';

  return div;
}

function createShadowElement(element) {
  const div = document.createElement('div');
  const { width, height } = element.getBoundingClientRect();

  div.classList.add('shadow_element');

  div.style.width = `${width}px`;
  div.style.height = `${height}px`;
  return div;
}

let actualElement;

// const onMouseOver = (e) => {
//   actualElement.style.top = `${e.clientY}px`;
//   actualElement.style.left = `${e.clientX}px`;
// };

const onMouseMove = (evt) => {
  const { target } = evt;

  actualElement.style.top = `${evt.clientY - 20}px`;
  actualElement.style.left = `${evt.clientX - 50}px`;

  if (target.classList.contains('task') || target.classList.contains('title')) {
    const { y, height } = target.getBoundingClientRect();

    const shadowElement = createShadowElement(document.querySelector('.dragged'));
    let shadowZone;

    if ((y + height / 2) > evt.clientY && !target.classList.contains('title')) {
      if (document.querySelector('.shadow_element')) {
        document.querySelector('.shadow_element').remove();
      }
      shadowZone = evt.target.previousElementSibling.closest('.task') || evt.target.previousElementSibling.closest('h1');
      if (shadowZone) {
        shadowZone.insertAdjacentElement('afterend', shadowElement);
      }
    }
    if ((y + height / 2) < evt.clientY) {
      if (document.querySelector('.shadow_element')) {
        document.querySelector('.shadow_element').remove();
      }
      shadowZone = evt.target.nextElementSibling.closest('.task') || evt.target.nextElementSibling.closest('.add_card');
      if (shadowZone) {
        shadowZone.insertAdjacentElement('beforebegin', shadowElement);
      }
    }
  }
};

const onTouchMove = (evt) => {
  const touch = evt.targetTouches[0];
  const { target } = evt;

  actualElement.style.top = `${touch.pageY - 20}px`;
  actualElement.style.left = `${touch.pageX - 50}px`;

  if ((touch.pageX + 20) < target.closest('.column').offsetLeft) {
    target.closest('.task').remove();
  }
};

const addNewTask = document.querySelectorAll('.add_card');

addNewTask.forEach((item) => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    openDialogBox(item);
    item.remove(item);
  });
});

const taskInFokus = (e) => {
  const activeTask = e.target.closest('.task');
  if (activeTask) {
    const columnInFokus = activeTask.closest('.column');
    const closed = createClosedElement();

    const { width } = activeTask.getBoundingClientRect();

    closed.style.top = `${activeTask.offsetTop + 2}px`;
    closed.style.left = `${width + activeTask.offsetLeft - 17}px`;

    if (!columnInFokus.querySelector('.closed_element')) {
      closed.addEventListener('click', () => {
        activeTask.remove();
        closed.remove();
      });

      columnInFokus.insertAdjacentElement('afterbegin', closed);
    }
  }

  if (document.querySelector('.closed_element') && !activeTask && e.target !== document.querySelector('.closed_element')) {
    document.querySelector('.closed_element').remove();
  }
};

const onMouseUp = (e) => {
  const mouseUpColomn = e.target.closest('.column');

  if (e.target.classList.contains('shadow_element')) {
    const shadowZone = mouseUpColomn.querySelector('.shadow_element');
    mouseUpColomn.insertBefore(actualElement, shadowZone);
  }

  actualElement.style.width = null;
  actualElement.style.height = null;

  actualElement.classList.remove('dragged');
  actualElement = undefined;

  if (document.querySelector('.shadow_element')) {
    document.querySelector('.shadow_element').remove();
  }

  document.documentElement.removeEventListener('mousemove', onMouseMove);
  document.documentElement.removeEventListener('mouseup', onMouseUp);

  document.documentElement.removeEventListener('touchmove', onTouchMove);
  document.documentElement.removeEventListener('touchend', onMouseUp);
  // document.documentElement.removeEventListener('mouseover', onMouseOver);
  document.addEventListener('mousemove', taskInFokus);
  document.addEventListener('touchmove', taskInFokus);
};

document.addEventListener('mousemove', taskInFokus);
document.addEventListener('touchmove', taskInFokus);

const columns = Array.from(document.querySelectorAll('.column'));

columns.forEach((item) => item.addEventListener('mousedown', (e) => {
  if (e.target.closest('.task')) {
    e.preventDefault();

    actualElement = e.target.closest('.task');
    const { width, height } = actualElement.getBoundingClientRect();
    actualElement.classList.add('dragged');

    document.removeEventListener('mousemove', taskInFokus);

    if (document.querySelector('.closed_element')) {
      document.querySelector('.closed_element').remove();
    }

    actualElement.style.width = `${width}px`;
    actualElement.style.height = `${height}px`;

    document.documentElement.addEventListener('mousemove', onMouseMove);
    document.documentElement.addEventListener('mouseup', onMouseUp);
    // document.documentElement.addEventListener('mouseover', onMouseOver);
  }
}));

columns.forEach((item) => item.addEventListener('touchstart', (e) => {
  if (e.target.closest('.task')) {
    e.preventDefault();

    actualElement = e.target.closest('.task');
    const { width, height } = actualElement.getBoundingClientRect();
    actualElement.classList.add('dragged');

    document.removeEventListener('touchmove', taskInFokus);

    if (document.querySelector('.closed_element')) {
      document.querySelector('.closed_element').remove();
    }

    actualElement.style.width = `${width}px`;
    actualElement.style.height = `${height}px`;

    document.documentElement.addEventListener('touchmove', onTouchMove);
    document.documentElement.addEventListener('touchend', onMouseUp);
    // document.documentElement.addEventListener('mouseover', onMouseOver);
  }
}));

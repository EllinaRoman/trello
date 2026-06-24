const save = (data) => {
  localStorage.setItem("trello", JSON.stringify(data));
};

const load = () => {
  return JSON.parse(localStorage.getItem("trello"));
};

const newData = () => {
  const columns = document.querySelectorAll(".column");
  const data = {
    todo: [],
    "in-progress": [],
    done: [],
  };
  columns.forEach((column) => {
    const cards = column.querySelectorAll(".card");
    cards.forEach((card) => {
      data[column.dataset.id].push(card.firstChild.textContent);
    });
  });

  return data;
};

document.addEventListener("click", (e) => {
  const buttonAdd = e.target.closest(".add");

  if (buttonAdd) {
    buttonAdd.classList.add("hidden");
    const newCard = document.createElement("div");
    newCard.classList.add("new-card");
    const newTitle = document.createElement("textarea");
    newTitle.classList.add("new-title");
    newTitle.setAttribute("placeholder", "Enter a title for this card...");
    const newButtons = document.createElement("div");
    newButtons.classList.add("new-card-btn");
    const addSecond = document.createElement("button");
    addSecond.classList.add("add-second");
    addSecond.textContent = "Add card";
    const closeBtn = document.createElement("button");
    closeBtn.classList.add("close");
    closeBtn.textContent = "✖";

    const column = buttonAdd.closest(".column");
    newButtons.append(addSecond, closeBtn);
    newCard.append(newTitle, newButtons);
    column.append(newCard);

    newTitle.addEventListener("input", () => {
      const oldError = buttonAdd.closest(".column").querySelector("p");

      if (oldError) {
        oldError.remove();
      }
    });

    save(newData());
  }

  const buttonClose = e.target.closest(".close");

  if (buttonClose) {
    const newButtonAdd = buttonClose.closest(".column").querySelector(".add");
    newButtonAdd.classList.remove("hidden");
    const newCard = buttonClose.closest(".column").querySelector(".new-card");
    newCard.remove();
  }

  const newButtonAdd = e.target.closest(".add-second");

  if (newButtonAdd) {
    const newTitle = newButtonAdd
      .closest(".column")
      .querySelector(".new-title");

    if (!newTitle.value.trim()) {
      const oldError = newButtonAdd.closest(".column").querySelector("p");
      if (oldError) {
        return;
      }

      const error = document.createElement("p");
      error.textContent = "The header cannot be empty";
      newTitle.insertAdjacentElement("afterend", error);
    } else {
      const card = document.createElement("div");
      card.classList.add("card");
      card.setAttribute("draggable", "true");
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "✖";
      deleteBtn.classList.add("delete");
      card.append(newTitle.value.trim(), deleteBtn);
      const oldAddButton = newButtonAdd
        .closest(".column")
        .querySelector(".add");
      oldAddButton.classList.remove("hidden");
      const column = newButtonAdd.closest(".column");
      column.insertBefore(card, oldAddButton);

      const newCard = newButtonAdd
        .closest(".column")
        .querySelector(".new-card");
      newCard.remove();
      save(newData());
    }
  }

  const buttonDelete = e.target.closest(".delete");

  if (buttonDelete) {
    const card = buttonDelete.closest(".card");
    card.remove();
    save(newData());
  }
});

let draggedCard = null;

document.addEventListener("dragstart", (e) => {
  draggedCard = e.target;
  setTimeout(() => {
    draggedCard.classList.add("dragged");
  }, 0);
});

document.addEventListener("dragover", (e) => {
  e.preventDefault();
  const column = e.target.closest(".column");
  if (!column) {
    return;
  }
  const cards = column.querySelectorAll(".card");

  for (const el of cards) {
    if (el !== draggedCard) {
      const rect = el.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;

      if (e.clientY < midY) {
        column.insertBefore(draggedCard, el);
        break;
      } else {
        column.insertBefore(draggedCard, el.nextSibling);
      }
    }
  }
  if (cards.length === 0) {
    column.insertBefore(draggedCard, column.querySelector(".add"));
  }
});

document.addEventListener("dragend", (e) => {
  draggedCard.classList.remove("dragged");
  save(newData());
});

const render = () => {
  const data = load();
  if (!data) return;

  Object.keys(data).forEach((columnId) => {
    const column = document.querySelector(`[data-id="${columnId}"]`);
    const addButton = column.querySelector(".add");

    data[columnId].forEach((title) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.setAttribute("draggable", "true");
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "✖";
      deleteBtn.classList.add("delete");
      card.append(title, deleteBtn);
      column.insertBefore(card, addButton);
    });
  });
};

render();

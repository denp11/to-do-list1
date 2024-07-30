fghhgf
import { ROLLUP_SERVER } from './shared/config';
import { hexToString } from 'viem';
import { RollupStateHandler } from './shared/rollup-state-handler';
import { controller } from './controller';

const { ethers } = require("ethers");

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);

let todoItems = [];

function addTodoItem(id, text) {
  todoItems.push({ id, text, completed: false });
}

function getTodoItems() {
  return todoItems;
}

function updateTodoItem(id, text, completed) {
  const index = todoItems.findIndex(item => item.id === id);
  if (index !== -1) {
    todoItems[index] = { id, text, completed };
  }
}



function getCompletedTodoItems() {
  return todoItems.filter(item => item.completed);
}

function getIncompleteTodoItems() {
  return todoItems.filter(item => !item.completed);
}

function sortTodoItems(by) {
  if (by === 'id') {
    todoItems.sort((a, b) => a.id - b.id);
  } else if (by === 'text') {
    todoItems.sort((a, b) => a.text.localeCompare(b.text));
  } else if (by === 'completed') {
    todoItems.sort((a, b) => a.completed - b.completed);
  }
}

async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));
  
  const nextTodoItem = getNextTodoItem();
  return nextTodoItem;

  return "accept";
}

async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));
 
  const currentTodoItem = getCurrentTodoItem();
  return currentTodoItem;
  
  return "accept";
}

var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();

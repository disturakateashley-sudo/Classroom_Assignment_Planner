let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("search");
const darkBtn = document.getElementById("darkModeBtn");

let chart;

/* NEW FILTER VARIABLE */
let currentFilter = "all";

if ("Notification" in window) {
Notification.requestPermission();
}

/* Add task */

form.addEventListener("submit", function(e){

e.preventDefault();

let title=document.getElementById("title").value;
let date=document.getElementById("deadlineDate").value;
let time=document.getElementById("deadlineTime").value;
let priority=document.getElementById("priority").value;

let task={
title,
date,
time,
priority,
done:false,
notified:false
};

tasks.push(task);

saveData();
displayTasks();

form.reset();

});


/* FILTER FUNCTION */

function setFilter(filter){
currentFilter = filter;
displayTasks();
}


function displayTasks(){

taskList.innerHTML="";

let search=searchInput.value.toLowerCase();
let now=new Date();

/* PRIORITY ORDER */
const priorityOrder={
"High":1,
"Medium":2,
"Low":3
};

/* SORT TASKS BY PRIORITY */
let sortedTasks=[...tasks].sort((a,b)=>{
return priorityOrder[a.priority]-priorityOrder[b.priority];
});

sortedTasks.forEach((task)=>{

if(!task.title.toLowerCase().includes(search)) return;

let deadline=new Date(task.date+"T"+task.time);

let status="";
let statusClass="";

if(task.done){
status="Done";
statusClass="done";
}
else if(deadline < now){
status="Missed";
statusClass="missed";
}
else{
status="Pending";
statusClass="pending";
}

/* FILTER LOGIC */

if(currentFilter==="pending" && status!=="Pending") return;
if(currentFilter==="done" && status!=="Done") return;
if(currentFilter==="missed" && status!=="Missed") return;

let priorityClass="priority-low";

if(task.priority==="High") priorityClass="priority-high";
if(task.priority==="Medium") priorityClass="priority-medium";

/* GET ORIGINAL INDEX */
let realIndex=tasks.indexOf(task);

let div=document.createElement("div");
div.className="task";

div.innerHTML=`

<div>

<h3>${task.title}</h3>

<p>
Deadline: ${task.date} ${task.time}
<span class="status ${statusClass}">${status}</span>
</p>

<p class="${priorityClass}">Priority: ${task.priority}</p>

</div>

<div>

<button onclick="markDone(${realIndex})">Done</button>
<button onclick="editTask(${realIndex})">Edit</button>
<button onclick="deleteTask(${realIndex})">Delete</button>

</div>

`;

taskList.appendChild(div);

});

updateStats();
updateChart();

}


function markDone(index){
tasks[index].done=true;
saveData();
displayTasks();
}


function editTask(index){

let newTitle=prompt("Edit title",tasks[index].title);
if(newTitle) tasks[index].title=newTitle;

let newPriority=prompt("Priority (High, Medium, Low)",tasks[index].priority);
if(newPriority) tasks[index].priority=newPriority;

saveData();
displayTasks();

}


function deleteTask(index){

tasks.splice(index,1);

saveData();
displayTasks();

}


/* Stats */

function updateStats(){

let total=tasks.length;
let done=tasks.filter(t=>t.done).length;

let now=new Date();

let missed=tasks.filter(t=>{
let deadline=new Date(t.date+"T"+t.time);
return !t.done && deadline < now;
}).length;

document.getElementById("total").textContent=total;
document.getElementById("done").textContent=done;
document.getElementById("missed").textContent=missed;

}


/* Chart */

function updateChart(){

let done=tasks.filter(t=>t.done).length;

let now=new Date();

let missed=tasks.filter(t=>{
let deadline=new Date(t.date+"T"+t.time);
return !t.done && deadline < now;
}).length;

let pending=tasks.length-done-missed;

let data=[pending*0.1,done,missed];

if(chart) chart.destroy();

chart=new Chart(document.getElementById("progressChart"),{

type:"doughnut",

data:{
labels:["Pending","Done","Missed"],
datasets:[{
data:data,
backgroundColor:["orange","green","red"]
}]
},

options:{
cutout:"75%",
responsive:false
}

});

}


/* Search */

searchInput.addEventListener("input",displayTasks);


/* Dark mode */

darkBtn.onclick=function(){
document.body.classList.toggle("dark");
};


/* Notifications */

function checkDeadlines(){

let now=new Date();

tasks.forEach(task=>{

let deadline=new Date(task.date+"T"+task.time);

if(!task.done && !task.notified && now>=deadline){

if(Notification.permission==="granted"){

new Notification("📚 Assignment Due!",{
body:`${task.title} was due at ${task.time}`
});

}

task.notified=true;

}

});

saveData();

}


function saveData(){
localStorage.setItem("tasks",JSON.stringify(tasks));
}

displayTasks();

setInterval(checkDeadlines,30000);
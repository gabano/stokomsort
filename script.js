const studentData = {
    "6A": ["Antonella", "Gabriel", "Helena", "Jamile", "Leonardo", "Letizia", "Liz", "Lorena", "Lucas S.", "Lucas G.", "Lucas M.", "Luiza", "Manuela", "Maria Luisa", "Maria S.", "Mariana", "Mateus", "Sophia"],
    "6B": ["Beatriz", "Gabriel N.", "Gabriel B.", "Heitor M.", "Heitor S.", "Helena", "Júlia", "Lorenzo", "Luana", "Manuela A.", "Manuela M.", "Manuella F.", "Manuella P.", "Maria Fernanda", "Miguel", "Mirela", "Nicholas", "Sophia", "Theo"],
    "7A": ["Andrey", "Arthur P.", "Arthur G.", "Cora", "Davi", "Gustavo", "Igor", "João", "Jonas", "Katarina", "Lavínia", "Manuela", "Paulo", "Sara S.", "Sara H.", "Stella", "Theo", "Valentina", "Victória"],
    "7B": ["Arthur", "Davi", "Esther", "Guilherme", "Lucas", "Manuela", "Miguel", "Ryan", "Sophia"],
    "Y8": ["Alice", "Anna Sophia", "Antonella", "Artur", "Beatriz", "Benício", "Caio", "Catarina", "Daniel C.", "Daniel B.", "Filipe", "Giovana", "Gustavo", "João Miguel", "Laura", "Lucas", "Marcello", "Maria", "Maria Eduarda", "Maria Luiza", "Maria Peres", "Mariana", "Nicolas", "Théo", "Thomas", "Thor"],
    "Y9": ["Bernardo", "Catarina", "Enzo", "Gabriel", "Guilherme", "Isabela B.", "Isabela R.", "Isabela X.", "Isadora", "João", "Júlia", "Júlio", "Lauren", "Lucas", "Maria", "Maria", "Nicholas", "Pedro", "Raphael"]
};

let currentStudents = [];
let finalGroups = [];

// Initialize Screen 1
window.onload = () => {
    const container = document.getElementById('class-options');
    Object.keys(studentData).forEach(className => {
        let btn = document.createElement('button');
        btn.className = 'class-btn';
        btn.innerText = className;
        btn.onclick = () => selectClass(className);
        container.appendChild(btn);
    });
};

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function selectClass(className) {
    currentStudents = studentData[className];
    const pool = document.getElementById('student-pool');
    pool.innerHTML = '';
    currentStudents.forEach((name, i) => {
        let div = document.createElement('div');
        div.className = 'student-card';
        div.id = `stu-${i}`;
        div.draggable = true;
        div.ondragstart = (ev) => ev.dataTransfer.setData("text", ev.target.id);
        div.innerText = name;
        pool.appendChild(div);
    });
    showScreen('screen-2');
}

function allowDrop(ev) { ev.preventDefault(); }
function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    ev.currentTarget.appendChild(document.getElementById(data));
}

function generateFinalGroups() {
    const numGroups = parseInt(document.getElementById('group-count').value);
    const getNames = (selector) => Array.from(document.querySelector(selector).children)
                                       .filter(e => e.classList.contains('student-card'))
                                       .map(e => e.innerText);

    const absent = getNames('[data-rule="absent"]');
    const together = getNames('[data-rule="together"]');
    const separate = getNames('[data-rule="separate"]');
    
    let pool = currentStudents.filter(s => !absent.includes(s));
    finalGroups = Array.from({ length: numGroups }, () => []);

    // 1. Rule: Together (Place them all in Group 1)
    together.forEach(s => {
        finalGroups[0].push(s);
        pool = pool.filter(p => p !== s);
    });

    // 2. Rule: Separate (Spread them across groups)
    separate.forEach((s, i) => {
        finalGroups[i % numGroups].push(s);
        pool = pool.filter(p => p !== s);
    });

    // 3. Fill remaining randomly
    pool.sort(() => Math.random() - 0.5);
    pool.forEach(s => {
        let smallestGroup = finalGroups.reduce((prev, curr) => prev.length <= curr.length ? prev : curr);
        smallestGroup.push(s);
    });

    showScreen('screen-3');
}

async function startSortingAnimation() {
    document.getElementById('sort-btn').style.display = 'none';
    const deck = document.querySelector('.card-deck');
    const display = document.getElementById('groups-display');
    display.innerHTML = '<div class="groups-grid"></div>';
    const grid = display.querySelector('.groups-grid');

    finalGroups.forEach((_, i) => {
        grid.innerHTML += `<div class="group-card"><h3>GRUPO ${i+1}</h3><ul id="list-${i}"></ul></div>`;
    });

    // Animation Loop
    for (let i = 0; i < finalGroups.length; i++) {
        for (let student of finalGroups[i]) {
            // Fake shuffle flicker
            for(let j=0; j<5; j++) {
                deck.innerText = currentStudents[Math.floor(Math.random() * currentStudents.length)];
                await new Promise(r => setTimeout(r, 50));
            }
            deck.innerText = student;
            deck.classList.add('pop');
            
            const li = document.createElement('li');
            li.innerText = student;
            document.getElementById(`list-${i}`).appendChild(li);
            
            await new Promise(r => setTimeout(r, 400));
            deck.classList.remove('pop');
        }
    }
    deck.innerText = "FIM";
}

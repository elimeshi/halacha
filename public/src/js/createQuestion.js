import { Posek } from '../model/Shita/Posek.js';
let poskimList = [];
let poskimOptions = "";
let answerCount = 0;
let halachaArr = [];
let svaraArr = [];
let svaraOpts = [];
let halachaOpts = [];
const childCounts = {};
let selectedPosekTags = [];

// Stance configuration object
const STANCES = {
    sover: {
        label: 'סובר',
        // which fields must exist on an answer of this stance
        requires: ['svara'],
        // for UI: how many halacha selects to show
        halachaCount: 0
    },
    posek: {
        label: 'פוסק',
        requires: ['svara', 'halacha'],
        halachaCount: 1
    },
    metzaded: {
        label: 'מצדד',
        requires: ['svara', 'halacha'],
        halachaCount: 1
    },
    mistapek: {
        label: 'מסתפק',
        requires: ['halacha'],
        halachaCount: 2
    },
    lechatchila: {
        label: 'לכתחילה - בדיעבד',
        requires: ['halacha'],
        halachaCount: 2
    }
};

window.addEventListener('DOMContentLoaded', async () => {
    poskimList = await fetch('/data/poskim').then(response => response.text()).then(text => text.split('\n').map(l => l.trim()).filter(l => l));
    poskimOptions = getOptionsHTML(poskimList);
    const sendButton = document.getElementById('send-btn');
    sendButton.addEventListener('click', openSubmitModal);
    sendButton.previousElementSibling.addEventListener('click', addAnswerField);
    const submit = document.getElementById('submit');
    submit.querySelector(':scope > button').addEventListener('click', closeSubmitModal);
    submit.querySelector('form button').addEventListener('click', (e) => saveQuestion(e));
    submit.querySelectorAll('input[name="saveOption"]').forEach(r => r.addEventListener('change', toggleQuestionSetInput));
    submit.querySelector('select').innerHTML = getOptionsHTML((await fetch('/data/question-sets').then(res => res.json()))['files']);
    setupList('halacha');
    setupList('svara');
    addAnswerField();
});

function esc(str) {
    return str.replace(/"/g, '&quot;')
}

function unesc(str) {
    return str.replace(/&quot;/g, '"')
}

function setupList(key) {
    const addBtn = document.getElementById(`add-${key}-btn`);
    const input = document.getElementById(`${key}-list-input`);
    const list = document.getElementById(`${key}-list-items`);

    addBtn.addEventListener("click", function () {
        const value = input.value.trim();
        if (value !== "") {
            const li = document.createElement("li");
            li.textContent = value;
            li.dataset.role = key;
            li.className = 'mt-4 mr-2 font-bold break-words whitespace-normal max-w-full transition-all duration-300 ease-in-out cursor-pointer hover:scale-105 hover:text-red-600';
            li.addEventListener('click', (event) => { removeTag(event); removeOption(li); });
            list.appendChild(li);
            input.value = "";
            key === 'halacha' ? halachaArr.push(value) : svaraArr.push(value);
            key === 'halacha' ? halachaOpts = (getOptionsHTML(halachaArr)) : svaraOpts = getOptionsHTML(svaraArr);
            updateSelectElements(li);
        }
    });
}

function getOptionsHTML(list) {
    return list.map(p => `<option value="${esc(p)}">${p}</option>`).join('');
}

function stanceInnerHTML(posekIndex, stanceIndex) {
    return `   
                <div class="mb-2">
                    <label class="block text-sm font-medium">מהי עמדתו?</label>
                    <select id="stance-select-${posekIndex}-${stanceIndex}" class="w-full p-2 border rounded">
                    </select>
                </div>
                <div class="mb-2" id="halacha-${posekIndex}-${stanceIndex}">
                    <div id="halacha1-${posekIndex}-${stanceIndex}">
                        <label class="block text-sm font-medium">מהי ההלכה?</label>
                        <select data-role="halacha" class="w-full p-2 border rounded">
                            <option value="">בחר הלכה</option>
                            ${halachaOpts}
                        </select>
                    </div>
                    <div id="halacha2-${posekIndex}-${stanceIndex}">
                        <label class="block text-sm font-medium">מהי ההלכה המשנית?</label>
                        <select data-role="halacha" class="w-full p-2 border rounded">
                            <option value="">בחר הלכה משנית</option>
                            ${halachaOpts}
                        </select>
                    </div>
                    <div id="svara-${posekIndex}-${stanceIndex}">
                        <label class="block text-sm font-medium">מהי סברתו?</label>
                        <select data-role="svara" class="w-full p-2 border rounded">
                            <option value="">בחר סברא</option>
                            ${svaraOpts}
                        </select>
                    </div>
                </div>
                <button class="absolute text-xs top-2 left-2 bg-red-500 text-white px-1 py-0.3 rounded">מחק עמדה</button>
            `;
}

function answerInnerHTML(index) {
    return `
                <label class="block mb-2 font-medium answer-label">שיטה ${index}:</label>
                <div class="mb-2">
                    <label class="block text-sm font-medium">מי אומר כך?</label>
                    <select class="w-full p-2 border rounded">
                        <option value="">בחר פוסק</option>
                        ${poskimOptions}
                    </select>
                    <div id="posek-tags-${index}" class="mt-2 flex gap-2"></div>
                </div>
                <div class="class-container" id="stances-${index}">
                    
                </div>
                <button class="bg-blue-500 text-sm text-white px-1 py-0.5 rounded" data-role="add-stance">+ הוסף עמדה</button>
                <button class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded" data-role="remove-answer">מחק</button>
                `;
}

function addAnswerField() {
    const index = ++answerCount;
    childCounts[index] = 0;
    const container = document.getElementById("answers-container");
    const answerDiv = document.createElement("div");
    answerDiv.className = "mb-4 p-4 border rounded-lg bg-gray-50 relative";
    answerDiv.id = `answer-${index}`;
    answerDiv.innerHTML = answerInnerHTML(index);
    answerDiv.querySelectorAll(':scope > div > select').forEach(sel => sel.addEventListener('change', () => addPosek(index, sel)));
    answerDiv.querySelector('[data-role="add-stance"]').addEventListener('click', () => addStance(index));
    answerDiv.querySelector('[data-role="remove-answer"]').addEventListener('click', () => removeAnswer(index));
    container.appendChild(answerDiv);
    addStance(index);
    updateDeleteButtons();
}

function addPosek(index, select) {
    const posek = unesc(select.value);
    select.blur();
    if (!posek) return;

    if (selectedPosekTags.length === 0) {
        const tagContainer = document.getElementById('posek-tags-' + index);
        if (tagContainer.innerHTML.includes(posek)) return; // prevent duplicates
        const tagIdx = tagContainer.children.length;
        const tag = document.createElement("div");
        tag.id = "tag-" + index + '-' + tagIdx;
        tag.classList.add('tag-box', 'bg-royal-blue', 'rounded');
        tag.innerHTML = `<span class="tag font-bold">${posek}</span><button class="btn">בדעת</button>`;
        tag.addEventListener('click', (event) => { removeTag(event); reindexPosekTags(tag) });
        const bdaatButton = tag.querySelector('button');
        bdaatButton.addEventListener('click', () => selectChildPosek(bdaatButton));
        tagContainer.appendChild(tag);
        select.value = "";
    } else { // add child posek
        const tagContainers = selectedPosekTags.map(posekTag => document.getElementById(posekTag));
        tagContainers.filter(tc => !tc.innerHTML.includes(posek)); // prevent duplicates
        if (tagContainers.length === 0) return;
        tagContainers.forEach(tc => {
            const tag = document.createElement('span');
            tag.classList.add('transition-all', 'duration-300', 'ease-in-out', 'bg-blue-500', 'text-white', 'rounded', 'px-2', 'py-1', 'text-sm');
            tag.textContent = posek;
            tag.dataset.role = 'parent-posek';
            deselect(tc.querySelector('button')); // deselect the 'בדעת' button
            tag.addEventListener('click', (event) => removeTag(event));
            tc.appendChild(tag);
            select.value = "";
        })
    }
}

function deselect(button) {
    button.classList.remove('selected');
    button.closest('.tag-box').classList.remove('hovered');
    selectedPosekTags = [];
}

function selectChildPosek(button) {
    event.stopPropagation();
    const parentBox = button.closest('.tag-box');
    if (button.classList.contains('selected')) {
        deselect(button);
    } else {
        // Select
        button.classList.add('selected');
        parentBox.classList.add('hovered');
        selectedPosekTags.push(parentBox.id);
    }
}

function removeTag(event) {
    event.stopPropagation();
    const tag = event.currentTarget;
    tag.addEventListener('transitionend', () => tag.remove(), { once: true });
    tag.classList.add('fade-out');
}

function reindexPosekTags(tag) {
    const remainedTags = tag.parentElement.children;
    const index = tag.id.split('-')[1];
    if (selectedPosekTags == tag.id) selectedPosekTags = '';
    for (let i = 0; i < remainedTags.length; i++) {
        remainedTags[i].id = "tag-" + index + '-' + i;
    }
}

function removeOption(item) {
    const halacha = item.dataset.role === 'halacha';
    const value = item.textContent;
    halacha ? halachaOpts = halachaOpts.filter(opt => opt != value) :
        svaraOpts.filter(opt => opt !== value);
    updateSelectElements(item);
}

function updateSelectElements(item) {
    const role = item.dataset.role;
    const selectElements = document.querySelectorAll(`select[data-role="${role}"]`);
    selectElements.forEach(sel => {
        const val = sel.value;
        sel.innerHTML = sel.firstElementChild.outerHTML + (role === 'halacha' ? halachaOpts : svaraOpts)
        sel.value = val;
    });
}

function addStance(posekIndex) {
    const container = document.getElementById(`stances-${posekIndex}`);
    const stanceCount = container.children.length + 1;
    const stanceDiv = document.createElement("div");
    container.appendChild(stanceDiv);
    stanceDiv.classList.add('stance-block', 'border', 'rounded', 'p-2', 'mb-2', 'bg-white', 'relative');
    stanceDiv.innerHTML = stanceInnerHTML(posekIndex, stanceCount);
    stanceDiv.querySelector('button').addEventListener('click', () => removeStance(stanceDiv));
    const stanceSelect = stanceDiv.querySelector('select');
    const halachaFields = stanceDiv.querySelector('#halacha-' + posekIndex + '-' + stanceCount).children;
    stanceSelect.addEventListener('change', () => toggleHalachaFields(stanceSelect.value, halachaFields[2], [halachaFields[0], halachaFields[1]]));
    buildStanceOptions(stanceSelect);
    toggleHalachaFields(stanceSelect.value, halachaFields[2], [halachaFields[0], halachaFields[1]]);
    updateStanceDeleteButtons(container);
}

function removeStance(stance) {
    const container = stance.parentElement;
    stance.remove();
    updateStanceDeleteButtons(container);
}

function updateStanceDeleteButtons(container) {
    const stanceBlocks = container.querySelectorAll('.stance-block');
    stanceBlocks.forEach((block, i) => {
        const deleteBtn = block.querySelector('button');
        deleteBtn.classList.toggle('hidden', stanceBlocks.length <= 1);
    });
}

function buildStanceOptions(stanceSelect) {
    Object.entries(STANCES).forEach(([key, cfg]) => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.text = cfg.label;
        stanceSelect.appendChild(opt);
    });
}

function toggleHalachaFields(stanceKey, svaraWrapper, halachaWrappers) {
    const baseCfg = STANCES[stanceKey];

    const cfg = { ...baseCfg };

    // Svara field
    svaraWrapper.style.display = cfg.requires.includes('svara') ? 'block' : 'none';

    // Halacha fields
    halachaWrappers.forEach((w, i) => {
        if (i < cfg.halachaCount) {
            w.style.display = 'block';
            if (i === 1) {
                let firstOption = w.querySelector('select').options[0];
                if (stanceKey === 'lechatchila') {
                    w.querySelector('label').textContent = 'מהי ההלכה בדיעבד?'
                    firstOption.textContent = 'בחר הלכה בדיעבד';
                } else if (i === 1 && stanceKey === 'mistapek') {
                    w.querySelector('label').textContent = 'מהי ההלכה המשנית?'
                    firstOption.textContent = 'בחר הלכה משנית';
                }
            }
        } else w.style.display = 'none';
    });

    // If multiple Halachas needed, wire up mutual exclusion:
    if (cfg.halachaCount === 2) {
        setupMutualExclusion(
            halachaWrappers[0].querySelector('select'),
            halachaWrappers[1].querySelector('select')
        );
    }
}

function setupMutualExclusion(select1, select2) {
    select1.addEventListener('change', () => updateDisabledOptions(select1, select2));
    select2.addEventListener('change', () => updateDisabledOptions(select2, select1));
}

function updateDisabledOptions(sourceSelect, targetSelect) {
    const selectedValue = sourceSelect.value;
    Array.from(targetSelect.options).forEach(opt => {
        if (opt.value === selectedValue && selectedValue !== '') {
            opt.disabled = true;
        } else {
            opt.disabled = false;
        }
    });
}

function removeAnswer(index) {
    document.getElementById(`answer-${index}`).remove();
    updateDeleteButtons();
    updateAnswerLabels();
}

function updateDeleteButtons() {
    const answers = document.querySelectorAll("[id^='answer-']");
    const display = answers.length > 1 ? "block" : "none";
    answers.forEach(a => a.querySelector("[data-role='remove-answer']").style.display = display);
}

function updateAnswerLabels() {
    document.querySelectorAll("[id^='answer-']").forEach((answer, i) => answer.querySelector(".answer-label").textContent = `שיטה ${i + 1}:`);
}

function collectStanceFields(stanceBlock) {
    let result = {};
    const stanceKey = stanceBlock.querySelector('[id^="stance"]').value;
    result.stance = stanceKey;
    const fields = Array.from(stanceBlock.querySelector('[id^="halacha"]').children).filter(e => getComputedStyle(e).display !== 'none');
    fields.forEach(field => {
        result[field.id.split('-')[0]] = field.querySelector('select').value;
    });
    return result;
}

function collectUserAnswers() {
    const answers = [];
    const answerElements = document.querySelectorAll('[id^="answer-"]');

    answerElements.forEach(answer => {
        const id = answer.id.slice(7);
        const posekTags = Array.from(answer.querySelectorAll(`#posek-tags-${id} > .tag-box`));
        const poskim = posekTags.map(tagBox => new Posek(tagBox.querySelector('.tag').textContent, tagBox.querySelectorAll('[data-role="parent-posek"]').forEach(t => t.textContent)));
        const stanceBlocks = Array.from(answer.querySelectorAll(`.stance-block`));
        const stances = stanceBlocks.map(collectStanceFields);
        answers.push({
            poskim: poskim,
            stances: stances
        })
    })
    return answers;
}

function openSubmitModal() {
    document.getElementById('submit-container').classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
}

function closeSubmitModal() {
    document.getElementById('submit-container').classList.add('opacity-0', 'scale-95', 'pointer-events-none');
}

function toggleQuestionSetInput() {
    console.log('run');
    const existing = document.getElementById('existing').checked;
    document.getElementById('existingSetBlock').classList.toggle('hidden', !existing);
    document.getElementById('newSetBlock').classList.toggle('hidden', existing);
}

function saveQuestion(event) {
    event.preventDefault();
    sessionStorage.setItem('userAnswers', JSON.stringify(collectUserAnswers(), null, 2));
    sessionStorage.setItem('correctAnswers', JSON.stringify(currentQuestion.answers, null, 2));
    let answeredQuestions = JSON.parse(localStorage.getItem('answeredQuestions')) || [];
    answeredQuestions.push(currentQuestion.id);
    localStorage.setItem('answeredQuestions', JSON.stringify(answeredQuestions));
    window.location.href = "results.html";
}
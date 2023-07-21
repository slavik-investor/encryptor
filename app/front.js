const fs = require('fs');
const xlsx = require('xlsx');
const CryptoJS = require('crypto-js');
const { langEN, langRU } = require('./translate');
const passKey = document.getElementById('pass-key')
const logs = document.getElementById('logs-text');
const fileInput = document.getElementById("wallet_file");
const fileName = document.querySelector('label[for="wallet_file"]');
const walletCount = document.getElementById('wallet_count');
const start = document.getElementById('start');
const langEnBtn = document.getElementById("lang_en");
const langRuBtn = document.getElementById("lang_ru");
let language = 'RU';

const changeLanguage = (lang) => {
    // Отримуємо всі текстові елементи з класом починаючимся на "lang_"
    const langElements = document.querySelectorAll("[class^='lang_']");

    // Для кожного елемента змінюємо його вміст на відповідний переклад
    langElements.forEach(element => {
        const elementClass = element.classList[0];
        const key = elementClass.substring(5); // Витягуємо ключ перекладу з імені класу
        if (lang[key]) {
            element.innerHTML = lang[key];
        }
    });
}

langEnBtn.addEventListener("click", () => {
    changeLanguage(langEN);
    language = "EN";
});

langRuBtn.addEventListener("click", () => {
    changeLanguage(langRU);
    language = "RU";
});

let KeyGlobal = [];
let HeadersGlobal = [];

function parseFile() {
    const filePaths = fileInput.files[0].path;
    fs.readFile(filePaths, (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        const fileExtension = filePaths.split('.').pop().toLowerCase();
        switch (fileExtension) {
            case 'txt':
                return parseTxt(data);
            case 'xlsx':
                return parseXlsx(filePaths);
            case 'csv':
                return parseCsv(data);
            // Добавьте дополнительные форматы файлов по мере необходимости
            default:
                return addLogs('Неизвестный формат файла');
        }
    });
}

function writeToFile(content, filePath) {
    fs.writeFileSync(filePath, content); // Записываем содержимое в файл
    addLogs(`<span class="lang_process-end"></span>: ${filePath}`);
}

function parseTxt(data) {
    let keys = data.toString().trim().split(/\r?\n/);
    let filterKeys = keys.filter(key => key.trim() !== '');
    fileName.innerHTML = fileInput.files[0].name;
    walletCount.innerText = filterKeys.length;
    addLogs(`<span class="lang_info"></span> | <span class="lang_wallets"></span> |` +
        ` <span class="lang_loaded"></span> ${filterKeys.length} `)
    KeyGlobal = filterKeys;
}

function parseXlsx(path) {
    // Массив для хранения выбранных данных
    const workbook = xlsx.readFile(path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Получение диапазона ячеек, содержащих данные
    const range = xlsx.utils.decode_range(worksheet['!ref']);
    fileName.innerHTML = fileInput.files[0].name;
    walletCount.innerText = range.e.r;
    addLogs(`<span class="lang_info"></span> | <span class="lang_wallets"></span> |` +
        ` <span class="lang_loaded"></span> ${range.e.r} `)


    // Массив для хранения измененных данных
    const newData = [];

    // Итерация по каждой ячейке в диапазоне
    for (let rowNum = 0; rowNum <= range.e.r; rowNum++) {
        const row = [];

        for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
            const cellAddress = xlsx.utils.encode_cell({ r: rowNum, c: colNum });
            const cellValue = worksheet[cellAddress]?.v; // Получение значения ячейки
            row.push(cellValue);
        }

        newData.push(row);
    }


    KeyGlobal = newData;
}

function parseCsv(data) {
    const rows = data.toString().split('\n');
    const headers = rows[0].split(',');
    const columnCount = headers.length;
    const nonEmptyData = [];
    // Обход данных в каждом столбце
    for (let i = 0; i < columnCount; i++) {
        const columnData = [];

        // Пропуск заголовка столбца
        for (let j = 1; j < rows.length; j++) {
            const row = rows[j].split(',');
            if (row[i] !== undefined && row[i].trim() !== '') {
                columnData.push(row[i].trim());
            }
        }

        nonEmptyData.push(columnData);
    }

    fileName.innerHTML = fileInput.files[0].name;
    walletCount.innerText = nonEmptyData[0].length;
    addLogs(`<span class="lang_info"></span> | <span class="lang_wallets"></span> |` +
        ` <span class="lang_loaded"></span> ${nonEmptyData[0].length} `);
    KeyGlobal = nonEmptyData;
    HeadersGlobal = headers;
}

function encryptTxt(path) {
    const pathToWrite = path.replace(/\.txt$/, '.hash' + '.txt');
    let encryptData = [];
    KeyGlobal.forEach((el, i) => {
        encryptData.push(encryptPrivateKey(el, passKey.value));
    });
    const content = encryptData.join('\r\n');
    writeToFile(content, pathToWrite);
}

function encryptCsv(path) {
    const pathToWrite = path.replace(/\.csv$/, '.hash' + '.csv');

    let encryptData = '';

    // Добавление заголовков столбцов
    encryptData += HeadersGlobal.join(',') + '\n';

    // Добавление данных
    // Определение максимального количества элементов в столбцах
    const maxColumnLength = KeyGlobal.reduce((max, column) => Math.max(max, column.length), 0);
    const columnCount = HeadersGlobal.length;
    // Добавление данных
    for (let i = 0; i < maxColumnLength; i++) {
        for (let j = 0; j < columnCount; j++) {
            const columnData = KeyGlobal[j];
            const value = i < columnData.length ? encryptPrivateKey(columnData[i], passKey.value) : '';

            encryptData += value;

            if (j !== columnCount - 1) {
                encryptData += ',';
            }
        }

        encryptData += '\n';
    }
    addLogs(`<span class="lang_encryptColumns"></span> ${HeadersGlobal.join(', ')}`);
    writeToFile(encryptData, pathToWrite);
}

function encryptXlsx(path) {
    const pathToWrite = path.replace(/\.xlsx$/, '.hash' + '.xlsx');
    const newWorkbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet(KeyGlobal);
    console.log(worksheet)
    // Обновление данных в рабочем листе
    for (let rowNum = 1; rowNum < KeyGlobal.length; rowNum++) {
        for (let colNum = 0; colNum < KeyGlobal[rowNum].length; colNum++) {
            const cellAddress = xlsx.utils.encode_cell({ r: rowNum, c: colNum });
            worksheet[cellAddress].v = encryptPrivateKey(KeyGlobal[rowNum][colNum], passKey.value);
        }
    }
    addLogs(`<span class="lang_encryptColumns"></span> ${KeyGlobal[0].join(', ')}`);
    // Запись обновленного файла
    xlsx.utils.book_append_sheet(newWorkbook, worksheet, 'Sheet1');
    xlsx.writeFile(newWorkbook, pathToWrite);
    addLogs(`<span class="lang_process-end"></span>: ${pathToWrite}`);
}

function addLogs(data) {
    logs.innerHTML += `<li> ${data} </li>`;
    switch (language) {
        case "RU":
            changeLanguage(langRU)
            break;
        case "EN":
            changeLanguage(langEN)
            break;
    }
    logs.scrollTop = logs.scrollHeight - logs.clientHeight;
}

function checkAndConvertToHex(str) {
    if (/^\d+$/.test(str)) {
        let hex = BigInt(str).toString(16).padStart(64, '0');
        return '0x' + hex;
    }
    else {
        return str;
    }
}

function encryptPrivateKey(privateKey, password) {
    // Преобразование приватного ключа в байтовый массив
    const privateKeyBytes = CryptoJS.enc.Hex.parse(checkAndConvertToHex(privateKey));

    // Процесс генерации ключа из пароля с использованием PBKDF2
    const key = CryptoJS.PBKDF2(password, CryptoJS.SHA256(password), { keySize: 256/32 });
    console.log(key.toString())
    // Шифрование ключа с помощью AES
    const ciphertext = CryptoJS.AES.encrypt(privateKeyBytes, key, { mode: CryptoJS.mode.ECB });
    console.log(ciphertext)
    // Возвращение зашифрованного приватного ключа в формате Base64
    return ciphertext.toString();
}

function encryptAll() {
    addLogs(`<span class="lang_process-start"></span>`);
    if (!fileInput.files[0]) return addLogs(`<span class="lang_error"></span> | <span class="lang_choose-wallets"></span>`);
    if (passKey.value === "") return addLogs(`<span class="lang_error"></span> | <span class="lang_enter-pass"></span>`);
    const filePath = fileInput.files[0].path//.replace(/\.txt$/, '_hash' + '.txt');
    const fileExtension = filePath.split('.').pop().toLowerCase();
    switch (fileExtension) {
        case 'txt':
            return encryptTxt(filePath);
        case 'xlsx':
            return encryptXlsx(filePath);
        case 'csv':
            return encryptCsv(filePath);
        // Добавьте дополнительные форматы файлов по мере необходимости
        default:
            return addLogs('Неизвестный формат файла');
    }

}

fileInput.addEventListener("change", parseFile);
start.addEventListener('click', encryptAll);

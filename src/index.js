import '@material/web/all';
import { createNotification } from './logger'
import { SetLang, TranslationSetup } from './translations'
const xlsx = require('xlsx');
const CryptoJS = require('crypto-js');
const { ipcRenderer } = window.require('electron')
const ipcRendererListeners = require('./ipcRendererListeners');
const fileInput = document.getElementById("inputFile");
const chooseFileButton = document.getElementById('chooseFileButton');
const LangSelector = document.getElementById('langSelector');
const showKey = document.getElementById("OpenKeyBtn");
const startEncrypt = document.getElementById("StartBtn");
const passKey = document.getElementById("pass");

chooseFileButton.addEventListener('click', function () {
   fileInput.click();
});

let KeyGlobal = [];
let HeadersGlobal = [];

if (fileInput) {

   fileInput.addEventListener('change', () => {
      const fileText = document.getElementById("FilePathLabel")
      const filePath = fileInput.files[0].name
      fileText.innerHTML = String(filePath)
      startEncrypt.disabled = false;
      parseFile();

   })
}

startEncrypt.addEventListener('click', encryptAll);

if (LangSelector) {
   LangSelector.addEventListener('change', (event) => {
      const newLang = event.target.value
      SetLang(newLang)
      TranslationSetup(newLang)
   })
}




showKey.addEventListener('click', (event) => {

   const passAttr = passKey.getAttribute('type');


   if (passAttr === "password") {


      passKey.setAttribute('type', 'text')


      showKey.innerHTML = `<svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M630.922-441.078 586-486q9-49.693-28.346-89.346Q520.307-615 466-606l-44.922-44.922q13.538-6.077 27.769-9.115 14.23-3.039 31.153-3.039 68.076 0 115.576 
      47.5T643.076-500q0 16.923-3.039 31.538-3.038 14.615-9.115 27.384Zm127.231 124.462L714-358q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 
      12l-46.614-46.614q37.923-15.077 77.461-22.231 39.538-7.154 81.153-7.154 140.615 0 253.614 77.538 113 77.539 164.846 202.461-22.231 53.615-57.423 100.076-35.192 
      46.461-82.884 83.308Zm32.308 231.383L628.616-245.848q-30.769 11.385-68.192 18.616Q523-220.001 480-220.001q-140.999 0-253.614-77.538Q113.771-375.078 61.54-500q22.154-53 
      57.231-98.885 35.077-45.884 77.231-79.576l-110.77-112 42.154-42.153 705.228 705.228-42.153 42.153ZM238.155-636.309q-31.692 25.231-61.654 60.655Q146.539-540.231 128-500q50 
      101 143.5 160.5T480-280q27.308 0 54.386-4.616 27.077-4.615 45.923-9.538l-50.616-51.847q-10.231 4.153-23.693 6.615-13.461 2.462-26 2.462-68.076 0-115.576-47.5T316.924-500q0-12.154 
      2.462-25.423 2.462-13.27 6.615-24.27l-87.846-86.616ZM541-531Zm-131.768 65.769Z"/>
      </svg>`

   } else {

      passKey.setAttribute('type', 'password')


      showKey.innerHTML = `<svg slot="icon" xmlns="http://www.w3.org/2000/svg"
      height="24" viewBox="0 -960 960 960" width="24"><path
          d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45
           0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113
            0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" /></svg>`;
   }
})


function parseFile() {
   const filePaths = fileInput.files[0].path;
   const data = ipcRenderer.sendSync('readFile', filePaths);
   console.log(data);
   const fileExtension = filePaths.split('.').pop().toLowerCase();
   switch (fileExtension) {
      case 'txt':
         return parseTxt(data.data);
      case 'xlsx':
         return parseXlsx(filePaths);
      case 'csv':
         return parseCsv(data.data);
      // Добавьте дополнительные форматы файлов по мере необходимости
      default:
         return createNotification('Неизвестный формат файла', 'error');
   }
}

function parseTxt(data) {
   let keys = data.toString().trim().split(/\r?\n/);
   let filterKeys = keys.filter(key => key.trim() !== '');
   KeyGlobal = filterKeys;
}

function parseXlsx(path) {
   // Массив для хранения выбранных данных
   const workbook = xlsx.readFile(path);
   const worksheet = workbook.Sheets[workbook.SheetNames[0]];

   // Получение диапазона ячеек, содержащих данные
   const range = xlsx.utils.decode_range(worksheet['!ref']);

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
   const headers = rows[0].split(/[;,]+/);
   const columnCount = headers.length;
   const nonEmptyData = [];
   // Обход данных в каждом столбце
   for (let i = 0; i < columnCount; i++) {
      const columnData = [];

      // Пропуск заголовка столбца
      for (let j = 1; j < rows.length; j++) {
         const row = rows[j].split(/[;,]+/);
         if (row[i] !== undefined && row[i].trim() !== '') {
            columnData.push(row[i].trim());
         }
      }

      nonEmptyData.push(columnData);
   }


   KeyGlobal = nonEmptyData;
   HeadersGlobal = headers;
}

async function writeToFile(content, filePath) {
   await ipcRenderer.sendSync('writeFile', filePath, content); // Записываем содержимое в файл
   createNotification(`Wallets encrypted: ${filePath}`, 'success');
}

function encryptTxt(path) {
   const pathToWrite = path.replace(/\.txt$/, '.hash' + '.txt');
   let encryptData = [];
   KeyGlobal.forEach((el, i) => {
      encryptData.push(encryptPrivateKey(el, passKey.value));
   });
   const content = encryptData.join('\r\n');
   console.log(KeyGlobal);
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
   writeToFile(encryptData, pathToWrite);
}

function encryptXlsx(path) {
   const pathToWrite = path.replace(/\.xlsx$/, '.hash' + '.xlsx');
   const newWorkbook = xlsx.utils.book_new();
   const worksheet = xlsx.utils.aoa_to_sheet(KeyGlobal);
   // Обновление данных в рабочем листе
   for (let rowNum = 1; rowNum < KeyGlobal.length; rowNum++) {
      for (let colNum = 0; colNum < KeyGlobal[rowNum].length; colNum++) {
         const cellAddress = xlsx.utils.encode_cell({ r: rowNum, c: colNum });
         worksheet[cellAddress].v = encryptPrivateKey(KeyGlobal[rowNum][colNum], passKey.value);
      }
   }
   // Запись обновленного файла
   xlsx.utils.book_append_sheet(newWorkbook, worksheet, 'Sheet1');
   xlsx.writeFile(newWorkbook, pathToWrite);
   createNotification(`Wallets encrypted ${pathToWrite}`, 'success');
}



function checkAndConvertToHex(str) {
   if (/^\d+$/.test(str)) {
      // eslint-disable-next-line no-undef
      let hex = BigInt(str).toString(16).padStart(64, '0');
      return '0x' + hex;
   }
   else {
      return str;
   }
}

function is_odd(num) {
   return num % 2 !== 0;
}

function encryptPrivateKey(privateKey, password) {
   // Преобразование приватного ключа в байтовый массив
   const padded = checkAndConvertToHex(privateKey);
   let privateKeyBytes;
   if (is_odd(padded.length)) {
      privateKeyBytes = CryptoJS.enc.Utf8.parse(padded);
   } else {
      privateKeyBytes = CryptoJS.enc.Hex.parse(padded);
   }
   // Процесс генерации ключа из пароля с использованием PBKDF2
   const key = CryptoJS.PBKDF2(password, CryptoJS.SHA256(password), { keySize: 256 / 32 });
   // Шифрование ключа с помощью AES
   const ciphertext = CryptoJS.AES.encrypt(privateKeyBytes, key, { mode: CryptoJS.mode.ECB });
   // Возвращение зашифрованного приватного ключа в формате Base64


   return (is_odd(padded.length) ? "UTF8" : "") + ciphertext.toString();
}

function encryptAll() {
   createNotification(`Start Encryption`, 'success');
   if (!fileInput.files[0]) return createNotification(`Error | Choose Wallets`, 'error');
   if (passKey.value === "") return createNotification(`Error | Enter Password`, 'error');
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
         return createNotification('Unsupported file format', 'error');
   }

}

ipcRendererListeners.init();




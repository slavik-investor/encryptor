let currentLang = "EN" // "EN" || "RU"

export function SetLang(newLang) {
    currentLang = newLang === "EN" ? "EN" : "RU"
    return currentLang
}

export function GetLang() {
    return currentLang
}

export const translations = {
    t_text:{
        EN: 'Private key encryption software for use in products <a href="https://t.me/DegenSoftBot?start=hash_soft target="_blank"">DegenSOFT</a>',
        RU: 'Софт для шифрования приватных ключей для использования в продуктах  <a href="https://t.me/DegenSoftBot?start=hash_soft" target="_blank">DegenSOFT</a>',
    },
    t_lang: {
        EN: 'Language',
        RU: 'Язык'
    },
    t_passDecrypt: {
        EN: 'Password for encrypting wallets',
        RU: 'Пароль для шифрования'
    },
    t_fileName: {
        EN: 'File name',
        RU: 'Имя файла'
    },
    t_en: {
        EN: "English",
        RU: "Английский"
    },
    t_ru: {
        EN: "Russian",
        RU: "Русский"
    },
    
    t_chooseFile: {
        EN: "Choose a file with wallets",
        RU: "Выбрать файл с кошельками"
    },
    t_wallets: {
        EN: "Your Wallets (.txt)",
        RU: "Ваши кошельки (.txt)"
    },
    t_decrypt: {
        EN: "Decrypt the keys",
        RU: "Рассшифровать ключи"
    },
}

export const translationsLogs = [
    {
        EN: "Unsupported file format",
        RU: "Неизвесный формат файла"
    },
    {
        EN: "Error | Enter Password",
        RU: "Ошибка | Введите пароль"
    },
    {
        EN: "Error | Choose Wallets",
        RU: "Ошибка | Выберите кошельки"
    },
    {
        EN: "Start Encryption",
        RU: "Начинаем шифрование"
    },
    {
        EN: "Wallets encrypted",
        RU: "Кошельки зашифровано"
    }
]

export function GetLogTranslation(log) {

    for (let i = 0; i < translationsLogs.length; i++) {
        try {
            if (log.indexOf(translationsLogs[i].EN) > -1) {
                log = log.replace(translationsLogs[i].EN, translationsLogs[i].RU)
            }
        } catch (error) {
            console.log(log, error)
        }
        
    }

    return log
}

export function GetTranslation(key, targetLang = 'EN') {
    if (!key || !targetLang || !translations[key]) return ""
    return translations[key][targetLang]
}


export function TranslationSetup(lang = 'EN') {
    let currentLang = lang === 'EN' ? 'RU' : 'EN';
    for (let key in translations) {
        const selector = "." + key
        const elems = document.querySelectorAll(selector)
        elems.forEach((elem) => {
            if (selector !== ".t_file_btn") {
                const curText = elem.innerHTML;
                const curLabel = elem.label;
                const curSupportText = elem.supportingText;
                const curSuffixText = elem.suffixText;
                const curHref = elem.href;
                elem.innerHTML = curText.replace(translations[key][currentLang], translations[key][lang]);
                if (curLabel) {
                    elem.label = curLabel.replace(translations[key][currentLang], translations[key][lang]);
                }
                if (curSupportText) {
                    elem.supportingText = curSupportText.replace(translations[key][currentLang], translations[key][lang]);
                }
                if (curSuffixText) {
                    elem.suffixText = curSuffixText.replace(translations[key][currentLang], translations[key][lang]);
                }
                if (curHref) {
                    elem.href = curHref.replace(translations[key][currentLang], translations[key][lang])
                }

            } else if (elem.innerText === translations.t_file_btn.EN || elem.innerText === translations.t_file_btn.RU) {
                elem.innerText = translations[key][lang]
            }
        })
    }
}

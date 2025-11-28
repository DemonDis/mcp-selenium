[![Значок оценки безопасности MseeP.ai](https://mseep.net/pr/angiejones-mcp-selenium-badge.png)](https://mseep.ai/app/angiejones-mcp-selenium)

# Сервер MCP Selenium

Реализация сервера Model Context Protocol (MCP) для Selenium WebDriver, обеспечивающая автоматизацию браузера через стандартизированные MCP-клиенты.

## Видео-демонстрация (нажмите для просмотра)

[![Посмотреть видео](https://img.youtube.com/vi/mRV0N8hcgYA/sddefault.jpg)](https://youtu.be/mRV0N8hcgYA)


## Функции

- Запуск сессий браузера с настраиваемыми параметрами
- Переход по URL-адресам
- Поиск элементов с использованием различных стратегий локаторов
- Нажатие, ввод текста и взаимодействие с элементами
- Выполнение действий мыши (наведение, перетаскивание)
- Обработка ввода с клавиатуры
- Создание скриншотов
- Загрузка файлов
- Поддержка безголового режима (headless mode)

## Поддерживаемые браузеры

- Chrome
- Firefox
- MS Edge

## Использование с Goose

### Вариант 1: Установка в один клик
Скопируйте и вставьте ссылку ниже в адресную строку браузера, чтобы добавить это расширение в Goose Desktop:

```
goose://extension?cmd=npx&arg=-y&arg=%40angiejones%2Fmcp-selenium&id=selenium-mcp&name=Selenium%20MCP&description=automates%20browser%20interactions
```


### Вариант 2: Добавление вручную на рабочий стол или в CLI

* Имя: `Selenium MCP`
* Описание: `автоматизирует взаимодействие с браузером`
* Команда: `npx -y @angiejones/mcp-selenium`

## Использование с другими MCP-клиентами (например, Claude Desktop и т. д.)
```json
{
  "mcpServers": {
    "selenium": {
      "command": "npx",
      "args": ["-y", "@angiejones/mcp-selenium"]
    }
  }
}
```

---

## Разработка

Для работы над этим проектом:

1. Клонируйте репозиторий
2. Установите зависимости: `npm install`
3. Запустите сервер: `npm start`

### Установка

#### Установка через Smithery

Для автоматической установки MCP Selenium для Claude Desktop через [Smithery](https://smithery.ai/server/@angiejones/mcp-selenium):

```bash
npx -y @smithery/cli install @angiejones/mcp-selenium --client claude
```

#### Ручная установка
```bash
npm install -g @angiejones/mcp-selenium
```


### Использование

Запустите сервер, выполнив:

```bash
mcp-selenium
```

Или используйте с NPX в вашей конфигурации MCP:

```json
{
  "mcpServers": {
    "selenium": {
      "command": "npx",
      "args": [
        "-y",
        "@angiejones/mcp-selenium"
      ]
    }
  }
}
```



## Инструменты

### start_browser
Запускает сессию браузера.

**Параметры:**
- `browser` (обязательно): Браузер для запуска
  - Тип: строка
  - Перечисление: ["chrome", "firefox"]
- `options`: Параметры конфигурации браузера
  - Тип: объект
  - Свойства:
    - `headless`: Запустить браузер в безголовом режиме
      - Тип: логический
    - `arguments`: Дополнительные аргументы браузера
      - Тип: массив строк

**Пример:**
```json
{
  "tool": "start_browser",
  "parameters": {
    "browser": "chrome",
    "options": {
      "headless": true,
      "arguments": ["--no-sandbox"]
    }
  }
}
```

### navigate
Переходит по URL-адресу.

**Параметры:**
- `url` (обязательно): URL для перехода
  - Тип: строка

**Пример:**
```json
{
  "tool": "navigate",
  "parameters": {
    "url": "https://www.example.com"
  }
}
```

### find_element
Находит элемент на странице.

**Параметры:**
- `by` (обязательно): Стратегия локатора
  - Тип: строка
  - Перечисление: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (обязательно): Значение для стратегии локатора
  - Тип: строка
- `timeout`: Максимальное время ожидания элемента в миллисекундах
  - Тип: число
  - По умолчанию: 10000

**Пример:**
```json
{
  "tool": "find_element",
  "parameters": {
    "by": "id",
    "value": "search-input",
    "timeout": 5000
  }
}
```

### click_element
Нажимает на элемент.

**Параметры:**
- `by` (обязательно): Стратегия локатора
  - Тип: строка
  - Перечисление: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (обязательно): Значение для стратегии локатора
  - Тип: строка
- `timeout`: Максимальное время ожидания элемента в миллисекундах
  - Тип: число
  - По умолчанию: 10000

**Пример:**
```json
{
  "tool": "click_element",
  "parameters": {
    "by": "css",
    "value": ".submit-button"
  }
}
```

### send_keys
Отправляет клавиши элементу (ввод текста).

**Параметры:**
- `by` (обязательно): Стратегия локатора
  - Тип: строка
  - Перечисление: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (обязательно): Значение для стратегии локатора
  - Тип: строка
- `text` (обязательно): Текст для ввода в элемент
  - Тип: строка
- `timeout`: Максимальное время ожидания элемента в миллисекундах
  - Тип: число
  - По умолчанию: 10000

**Пример:**
```json
{
  "tool": "send_keys",
  "parameters": {
    "by": "name",
    "value": "username",
    "text": "testuser"
  }
}
```

### get_element_text
Получает текстовое содержимое элемента.

**Параметры:**
- `by` (обязательно): Стратегия локатора
  - Тип: строка
  - Перечисление: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (обязательно): Значение для стратегии локатора
  - Тип: строка
- `timeout`: Максимальное время ожидания элемента в миллисекундах
  - Тип: число
  - По умолчанию: 10000

**Пример:**
```json
{
  "tool": "get_element_text",
  "parameters": {
    "by": "css",
    "value": ".message"
  }
}
```

### hover
Перемещает курсор мыши для наведения на элемент.

**Параметры:**
- `by` (обязательно): Стратегия локатора
  - Тип: строка
  - Перечисление: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (обязательно): Значение для стратегии локатора
  - Тип: строка
- `timeout`: Максимальное время ожидания элемента в миллисекундах
  - Тип: число
  - По умолчанию: 10000

**Пример:**
```json
{
  "tool": "hover",
  "parameters": {
    "by": "css",
    "value": ".dropdown-menu"
  }
}
```

### drag_and_drop
Перетаскивает элемент и отпускает его на другом элементе.

**Параметры:**
- `by` (обязательно): Стратегия локатора для исходного элемента
  - Тип: строка
  - Перечисление: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (обязательно): Значение для стратегии исходного локатора
  - Тип: строка
- `targetBy` (обязательно): Стратегия локатора для целевого элемента
  - Тип: строка
  - Перечисление: ["id", "css", "xpath", "name", "tag", "class"]
- `targetValue` (обязательно): Значение для стратегии целевого локатора
  - Тип: строка
- `timeout`: Максимальное время ожидания элементов в миллисекундах
  - Тип: число
  - По умолчанию: 10000

**Пример:**
```json
{
  "tool": "drag_and_drop",
  "parameters": {
    "by": "id",
    "value": "draggable",
    "targetBy": "id",
    "targetValue": "droppable"
  }
}
```

### double_click
Выполняет двойной щелчок по элементу.

**Параметры:**
- `by` (обязательно): Стратегия локатора
  - Тип: строка
  - Перечисление: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (обязательно): Значение для стратегии локатора
  - Тип: строка
- `timeout`: Максимальное время ожидания элемента в миллисекундах
  - Тип: число
  - По умолчанию: 10000

**Пример:**
```json
{
  "tool": "double_click",
  "parameters": {
    "by": "css",
    "value": ".editable-text"
  }
}
```

### right_click
Выполняет щелчок правой кнопкой мыши (контекстный щелчок) по элементу.

**Параметры:**
- `by` (обязательно): Стратегия локатора
  - Тип: строка
  - Перечисление: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (обязательно): Значение для стратегии локатора
  - Тип: строка
- `timeout`: Максимальное время ожидания элемента в миллисекундах
  - Тип: число
  - По умолчанию: 10000

**Пример:**
```json
{
  "tool": "right_click",
  "parameters": {
    "by": "css",
    "value": ".context-menu-trigger"
  }
}
```

### press_key
Имитирует нажатие клавиши клавиатуры.

**Параметры:**
- `key` (обязательно): Клавиша для нажатия (например, 'Enter', 'Tab', 'a' и т. д.)
  - Тип: строка

**Пример:**
```json
{
  "tool": "press_key",
  "parameters": {
    "key": "Enter"
  }
}
```

### upload_file
Загружает файл с помощью элемента ввода файла.

**Параметры:**
- `by` (обязательно): Стратегия локатора
  - Тип: строка
  - Перечисление: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (обязательно): Значение для стратегии локатора
  - Тип: строка
- `filePath` (обязательно): Абсолютный путь к файлу для загрузки
  - Тип: строка
- `timeout`: Максимальное время ожидания элемента в миллисекундах
  - Тип: число
  - По умолчанию: 10000

**Пример:**
```json
{
  "tool": "upload_file",
  "parameters": {
    "by": "id",
    "value": "file-input",
    "filePath": "/path/to/file.pdf"
  }
}
```

### take_screenshot
Делает скриншот текущей страницы.

**Параметры:**
- `outputPath` (необязательно): Путь для сохранения скриншота. Если не указан, возвращает данные в формате base64.
  - Тип: строка

**Пример:**
```json
{
  "tool": "take_screenshot",
  "parameters": {
    "outputPath": "/path/to/screenshot.png"
  }
}
```

### close_session
Закрывает текущую сессию браузера и очищает ресурсы.

**Параметры:**
Не требуются

**Пример:**
```json
{
  "tool": "close_session",
  "parameters": {}
}
```


# ai_selenium

# Установка Geckodriver:
```bash
winget install Mozilla.Geckodriver
```

# Проверка версии Geckodriver:
```bash
geckodriver --version
# ответ
geckodriver 0.36.0 (a3d508507022 2025-02-24 15:57 +0000)

The source code of this program is available from
testing/geckodriver in https://hg.mozilla.org/mozilla-central.

This program is subject to the terms of the Mozilla Public License 2.0.
You can obtain a copy of the license at https://mozilla.org/MPL/2.0/.
```

# Расположение Geckodriver:
```bash
where geckodriver
```

# Ссылка для загрузки Chromedriver:
```
https://googlechromelabs.github.io/chrome-for-testing/#stable
```

# Добавление Chromedriver в переменную среды Path:
```bash
$env:Path += ";D:\PROG\chromedriver"
```

# Проверка версии Chromedriver:
```bash
chromedriver --version
# ответ
ChromeDriver 142.0.7444.175 (302067f14a4ea3f42001580e6101fa25ed343445-refs/branch-heads/7444@{#2749})

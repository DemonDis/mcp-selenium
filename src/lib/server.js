#!/usr/bin/env node

// Импорт необходимых модулей из MCP SDK и Selenium WebDriver
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod"; // Схема валидации
import pkg from 'selenium-webdriver';
// Деструктуризация объектов из пакета selenium-webdriver
const { Builder, By, Key, until, Actions } = pkg;
// Импорт опций для различных браузеров
import { Options as ChromeOptions } from 'selenium-webdriver/chrome.js';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox.js';
import { Options as EdgeOptions } from 'selenium-webdriver/edge.js';


// Создание экземпляра MCP-сервера
const server = new McpServer({
    name: "MCP Selenium", // Имя сервера
    version: "1.0.0"     // Версия сервера
});

// Состояние сервера для отслеживания драйверов и текущей сессии
const state = {
    drivers: new Map(),        // Карта для хранения активных драйверов браузеров
    currentSession: null       // Идентификатор текущей активной сессии
};

// Вспомогательные функции
// Возвращает активный драйвер браузера
const getDriver = () => {
    const driver = state.drivers.get(state.currentSession);
    if (!driver) {
        throw new Error('No active browser session'); // Ошибка, если нет активной сессии
    }
    return driver;
};

// Определяет стратегию локатора для поиска элементов
const getLocator = (by, value) => {
    switch (by.toLowerCase()) {
        case 'id': return By.id(value);         // Поиск по ID
        case 'css': return By.css(value);       // Поиск по CSS-селектору
        case 'xpath': return By.xpath(value);   // Поиск по XPath
        case 'name': return By.name(value);     // Поиск по атрибуту name
        case 'tag': return By.css(value);       // Поиск по имени тега (используется CSS-селектор)
        case 'class': return By.className(value); // Поиск по имени класса
        default: throw new Error(`Unsupported locator strategy: ${by}`); // Ошибка, если стратегия не поддерживается
    }
};

// Общие схемы валидации для инструментов
const browserOptionsSchema = z.object({
    headless: z.boolean().optional().describe("Run browser in headless mode"), // Запуск браузера в безголовом режиме
    arguments: z.array(z.string()).optional().describe("Additional browser arguments") // Дополнительные аргументы браузера
}).optional();

const locatorSchema = {
    by: z.enum(["id", "css", "xpath", "name", "tag", "class"]).describe("Locator strategy to find element"), // Стратегия локатора
    value: z.string().describe("Value for the locator strategy"), // Значение локатора
    timeout: z.number().optional().describe("Maximum time to wait for element in milliseconds") // Максимальное время ожидания элемента
};

// Инструменты для управления браузером
server.tool(
    "start_browser", // Имя инструмента
    "launches browser", // Описание инструмента
    {
        browser: z.enum(["chrome", "firefox", "edge"]).describe("Browser to launch (chrome or firefox or microsoft edge)"), // Браузер для запуска
        options: browserOptionsSchema // Опции браузера
    },
    async ({ browser, options = {} }) => {
        try {
            let builder = new Builder(); // Создание билдера драйвера
            let driver;
            switch (browser) {
                case 'chrome': {
                    const chromeOptions = new ChromeOptions();
                    if (options.headless) {
                        chromeOptions.addArguments('--headless=new'); // Добавление аргумента для безголового режима Chrome
                    }
                    if (options.arguments) {
                        options.arguments.forEach(arg => chromeOptions.addArguments(arg)); // Добавление пользовательских аргументов
                    }
                    driver = await builder
                        .forBrowser('chrome')
                        .setChromeOptions(chromeOptions)
                        .build(); // Сборка драйвера Chrome
                    break;
                }
                case 'edge': {
                    const edgeOptions = new EdgeOptions();
                    if (options.headless) {
                        edgeOptions.addArguments('--headless=new'); // Добавление аргумента для безголового режима Edge
                    }
                    if (options.arguments) {
                        options.arguments.forEach(arg => edgeOptions.addArguments(arg)); // Добавление пользовательских аргументов
                    }
                    driver = await builder
                        .forBrowser('edge')
                        .setEdgeOptions(edgeOptions)
                        .build(); // Сборка драйвера Edge
                    break;
                }
                case 'firefox': {
                    const firefoxOptions = new FirefoxOptions();
                    if (options.headless) {
                        firefoxOptions.addArguments('--headless'); // Добавление аргумента для безголового режима Firefox
                    }
                    if (options.arguments) {
                        options.arguments.forEach(arg => firefoxOptions.addArguments(arg)); // Добавление пользовательских аргументов
                    }
                    driver = await builder
                        .forBrowser('firefox')
                        .setFirefoxOptions(firefoxOptions)
                        .build(); // Сборка драйвера Firefox
                    break;
                }
                default: {
                    throw new Error(`Unsupported browser: ${browser}`); // Ошибка, если браузер не поддерживается
                }
            }
            const sessionId = `${browser}_${Date.now()}`; // Генерация ID сессии
            state.drivers.set(sessionId, driver);      // Сохранение драйвера в состоянии
            state.currentSession = sessionId;          // Установка текущей сессии

            return {
                content: [{ type: 'text', text: `Browser started with session_id: ${sessionId}` }] // Успешный ответ
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error starting browser: ${e.message}` }] // Ответ с ошибкой
            };
        }
    }
);

server.tool(
    "navigate", // Имя инструмента
    "navigates to a URL", // Описание
    {
        url: z.string().describe("URL to navigate to") // URL для перехода
    },
    async ({ url }) => {
        try {
            const driver = getDriver(); // Получение активного драйвера
            await driver.get(url);     // Переход по URL
            return {
                content: [{ type: 'text', text: `Navigated to ${url}` }] // Успешный ответ
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error navigating: ${e.message}` }] // Ответ с ошибкой
            };
        }
    }
);

// Инструменты для взаимодействия с элементами
server.tool(
    "find_element", // Имя инструмента
    "finds an element", // Описание
    {
        ...locatorSchema // Использование схемы локатора
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver(); // Получение активного драйвера
            const locator = getLocator(by, value); // Получение локатора
            await driver.wait(until.elementLocated(locator), timeout); // Ожидание появления элемента
            return {
                content: [{ type: 'text', text: 'Element found' }] // Успешный ответ
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error finding element: ${e.message}` }] // Ответ с ошибкой
            };
        }
    }
);

server.tool(
    "click_element", // Имя инструмента
    "clicks an element", // Описание
    {
        ...locatorSchema // Использование схемы локатора
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver(); // Получение активного драйвера
            const locator = getLocator(by, value); // Получение локатора
            const element = await driver.wait(until.elementLocated(locator), timeout); // Ожидание и поиск элемента
            await element.click(); // Нажатие на элемент
            return {
                content: [{ type: 'text', text: 'Element clicked' }] // Успешный ответ
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error clicking element: ${e.message}` }] // Ответ с ошибкой
            };
        }
    }
);

server.tool(
    "send_keys", // Имя инструмента
    "sends keys to an element, aka typing", // Описание
    {
        ...locatorSchema, // Использование схемы локатора
        text: z.string().describe("Text to enter into the element") // Текст для ввода
    },
    async ({ by, value, text, timeout = 10000 }) => {
        try {
            const driver = getDriver(); // Получение активного драйвера
            const locator = getLocator(by, value); // Получение локатора
            const element = await driver.wait(until.elementLocated(locator), timeout); // Ожидание и поиск элемента
            await element.clear();   // Очистка поля ввода
            await element.sendKeys(text); // Ввод текста
            return {
                content: [{ type: 'text', text: `Text "${text}" entered into element` }] // Успешный ответ
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error entering text: ${e.message}` }] // Ответ с ошибкой
            };
        }
    }
);

server.tool(
    "get_element_text", // Имя инструмента
    "gets the text() of an element", // Описание
    {
        ...locatorSchema // Использование схемы локатора
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver(); // Получение активного драйвера
            const locator = getLocator(by, value); // Получение локатора
            const element = await driver.wait(until.elementLocated(locator), timeout); // Ожидание и поиск элемента
            const text = await element.getText(); // Получение текста элемента
            return {
                content: [{ type: 'text', text }] // Успешный ответ с текстом
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error getting element text: ${e.message}` }] // Ответ с ошибкой
            };
        }
    }
);

server.tool(
    "hover", // Имя инструмента
    "moves the mouse to hover over an element", // Описание
    {
        ...locatorSchema // Использование схемы локатора
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver(); // Получение активного драйвера
            const locator = getLocator(by, value); // Получение локатора
            const element = await driver.wait(until.elementLocated(locator), timeout); // Ожидание и поиск элемента
            const actions = driver.actions({ bridge: true }); // Создание объекта действий
            await actions.move({ origin: element }).perform(); // Наведение мыши на элемент
            return {
                content: [{ type: 'text', text: 'Hovered over element' }] // Успешный ответ
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error hovering over element: ${e.message}` }] // Ответ с ошибкой
            };
        }
    }
);

server.tool(
    "drag_and_drop", // Имя инструмента
    "drags an element and drops it onto another element", // Описание
    {
        ...locatorSchema, // Схема локатора для исходного элемента
        targetBy: z.enum(["id", "css", "xpath", "name", "tag", "class"]).describe("Locator strategy to find target element"), // Стратегия локатора для целевого элемента
        targetValue: z.string().describe("Value for the target locator strategy") // Значение локатора для целевого элемента
    },
    async ({ by, value, targetBy, targetValue, timeout = 10000 }) => {
        try {
            const driver = getDriver(); // Получение активного драйвера
            const sourceLocator = getLocator(by, value); // Локатор исходного элемента
            const targetLocator = getLocator(targetBy, targetValue); // Локатор целевого элемента
            const sourceElement = await driver.wait(until.elementLocated(sourceLocator), timeout); // Поиск исходного элемента
            const targetElement = await driver.wait(until.elementLocated(targetLocator), timeout); // Поиск целевого элемента
            const actions = driver.actions({ bridge: true }); // Создание объекта действий
            await actions.dragAndDrop(sourceElement, targetElement).perform(); // Выполнение перетаскивания
            return {
                content: [{ type: 'text', text: 'Drag and drop completed' }] // Успешный ответ
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error performing drag and drop: ${e.message}` }] // Ответ с ошибкой
            };
        }
    }
);

server.tool(
    "double_click", // Имя инструмента
    "performs a double click on an element", // Описание
    {
        ...locatorSchema // Использование схемы локатора
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver(); // Получение активного драйвера
            const locator = getLocator(by, value); // Получение локатора
            const element = await driver.wait(until.elementLocated(locator), timeout); // Ожидание и поиск элемента
            const actions = driver.actions({ bridge: true }); // Создание объекта действий
            await actions.doubleClick(element).perform(); // Выполнение двойного щелчка
            return {
                content: [{ type: 'text', text: 'Double click performed' }] // Успешный ответ
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error performing double click: ${e.message}` }] // Ответ с ошибкой
            };
        }
    }
);

server.tool(
    "right_click", // Имя инструмента
    "performs a right click (context click) on an element", // Описание
    {
        ...locatorSchema // Использование схемы локатора
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver(); // Получение активного драйвера
            const locator = getLocator(by, value); // Получение локатора
            const element = await driver.wait(until.elementLocated(locator), timeout); // Ожидание и поиск элемента
            const actions = driver.actions({ bridge: true }); // Создание объекта действий
            await actions.contextClick(element).perform(); // Выполнение правого щелчка
            return {
                content: [{ type: 'text', text: 'Right click performed' }] // Успешный ответ
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error performing right click: ${e.message}` }] // Ответ с ошибкой
            };
        }
    }
);

server.tool(
    "press_key", // Имя инструмента
    "simulates pressing a keyboard key", // Описание
    {
        key: z.string().describe("Key to press (e.g., 'Enter', 'Tab', 'a', etc.)") // Клавиша для нажатия
    },
    async ({ key }) => {
        try {
            const driver = getDriver(); // Получение активного драйвера
            const actions = driver.actions({ bridge: true }); // Создание объекта действий
            await actions.keyDown(key).keyUp(key).perform(); // Нажатие и отпускание клавиши
            return {
                content: [{ type: 'text', text: `Key '${key}' pressed` }] // Успешный ответ
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error pressing key: ${e.message}` }] // Ответ с ошибкой
            };
        }
    }
);

server.tool(
    "upload_file", // Имя инструмента
    "uploads a file using a file input element", // Описание
    {
        ...locatorSchema, // Схема локатора
        filePath: z.string().describe("Absolute path to the file to upload") // Абсолютный путь к файлу
    },
    async ({ by, value, filePath, timeout = 10000 }) => {
        try {
            const driver = getDriver(); // Получение активного драйвера
            const locator = getLocator(by, value); // Получение локатора
            const element = await driver.wait(until.elementLocated(locator), timeout); // Ожидание и поиск элемента
            await element.sendKeys(filePath); // Отправка пути к файлу в элемент ввода файла
            return {
                content: [{ type: 'text', text: 'File upload initiated' }] // Успешный ответ
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error uploading file: ${e.message}` }] // Ответ с ошибкой
            };
        }
    }
);

server.tool(
    "take_screenshot", // Имя инструмента
    "captures a screenshot of the current page", // Описание
    {
        outputPath: z.string().optional().describe("Optional path where to save the screenshot. If not provided, returns base64 data.") // Путь для сохранения скриншота
    },
    async ({ outputPath }) => {
        try {
            const driver = getDriver(); // Получение активного драйвера
            const screenshot = await driver.takeScreenshot(); // Создание скриншота
            if (outputPath) {
                const fs = await import('fs'); // Импорт модуля fs
                await fs.promises.writeFile(outputPath, screenshot, 'base64'); // Запись скриншота в файл
                return {
                    content: [{ type: 'text', text: `Screenshot saved to ${outputPath}` }] // Успешный ответ
                };
            } else {
                return {
                    content: [
                        { type: 'text', text: 'Screenshot captured as base64:' },
                        { type: 'text', text: screenshot }
                    ] // Успешный ответ с данными скриншота в base64
                };
            }
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error taking screenshot: ${e.message}` }] // Ответ с ошибкой
            };
        }
    }
);

server.tool(
    "close_session", // Имя инструмента
    "closes the current browser session", // Описание
    {}, // Без параметров
    async () => {
        try {
            const driver = getDriver(); // Получение активного драйвера
            await driver.quit();       // Закрытие драйвера
            state.drivers.delete(state.currentSession); // Удаление сессии из состояния
            const sessionId = state.currentSession;
            state.currentSession = null; // Сброс текущей сессии
            return {
                content: [{ type: 'text', text: `Browser session ${sessionId} closed` }] // Успешный ответ
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error closing session: ${e.message}` }] // Ответ с ошибкой
            };
        }
    }
);

// Ресурсы
server.resource(
    "browser-status", // Имя ресурса
    new ResourceTemplate("browser-status://current"), // Шаблон URI ресурса
    async (uri) => ({
        contents: [{
            uri: uri.href,
            text: state.currentSession
                ? `Active browser session: ${state.currentSession}` // Информация об активной сессии
                : "No active browser session"                        // Информация об отсутствии активной сессии
        }]
    })
);

// Обработчик очистки ресурсов при завершении процесса
async function cleanup() {
    for (const [sessionId, driver] of state.drivers) {
        try {
            await driver.quit(); // Закрытие всех активных сессий браузеров
        } catch (e) {
            console.error(`Error closing browser session ${sessionId}:`, e); // Логирование ошибок закрытия сессии
        }
    }
    state.drivers.clear();     // Очистка карты драйверов
    state.currentSession = null; // Сброс текущей сессии
    process.exit(0);           // Завершение процесса
}

// Регистрация обработчиков для сигналов завершения процесса
process.on('SIGTERM', cleanup); // Обработка сигнала SIGTERM
process.on('SIGINT', cleanup);  // Обработка сигнала SIGINT (Ctrl+C)

// Запуск сервера
const transport = new StdioServerTransport(); // Создание транспорта для стандартного ввода/вывода
await server.connect(transport);              // Подключение сервера к транспорту
